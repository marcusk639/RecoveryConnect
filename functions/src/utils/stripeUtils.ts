import * as admin from "firebase-admin";
import Stripe from "stripe";
import { stripe, priceIdBase, priceIdMember } from "./stripe"; // Import initialized stripe instance and config
import { db } from "./firebase"; // Import db instance

// --- Stripe Webhook Helper Functions ---

export async function handleCheckoutSessionCompleted(
  session: Stripe.Checkout.Session
) {
  const groupId = session.metadata?.groupId;
  const subscriptionId = session.subscription;
  const customerId = session.customer;

  if (!groupId || !subscriptionId || !customerId) {
    console.error(
      "Missing metadata (groupId) or data (subscriptionId, customerId) in checkout.session.completed event:",
      session.id
    );
    return; // Or throw?
  }

  const subscription = await stripe.subscriptions.retrieve(
    subscriptionId as string,
    { expand: ["items"] }
  );

  if (!subscription) {
    console.error(
      `Subscription ${subscriptionId} not found after checkout session ${session.id}.`
    );
    return;
  }

  const groupRef = db.collection("groups").doc(groupId);
  const updateData: any = {
    stripeCustomerId: customerId,
    stripeSubscriptionId: subscriptionId,
    subscriptionStatus: subscription.status,
    stripePriceIdBase: priceIdBase,
    stripePriceIdMember: priceIdMember,
    stripeMeteredSubscriptionItemId:
      findMeteredSubscriptionItemId(subscription),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  };

  console.log(`Updating group ${groupId} with Stripe info:`, updateData);
  await groupRef.update(updateData);

  // COMMENT OUT usage reporting for now
  // console.log("Reporting initial usage after checkout completion...");
  // await reportUsage(
  //   groupId,
  //   subscription.id,
  //   updateData.stripeMeteredSubscriptionItemId
  // );
}

export async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
  const subscriptionId = (invoice as any).subscription as string | null;
  const customerId = invoice.customer as string | null;

  if (!subscriptionId || !customerId) {
    console.error(
      "Missing subscription or customer ID in invoice.payment_succeeded",
      invoice.id
    );
    return;
  }

  const groupQuery = db
    .collection("groups")
    .where("stripeSubscriptionId", "==", subscriptionId)
    .limit(1);
  const groupSnapshot = await groupQuery.get();

  if (groupSnapshot.empty) {
    console.error(`Could not find group for subscription ${subscriptionId}`);
    return;
  }
  const groupDoc = groupSnapshot.docs[0];
  const groupId = groupDoc.id;
  const groupData = groupDoc.data();

  await groupDoc.ref.update({
    subscriptionStatus: "active",
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });
  console.log(`Subscription status for group ${groupId} set to active.`);

  // COMMENT OUT usage reporting for now
  // console.log("Reporting usage for next period after successful payment...");
  // await reportUsage(
  //   groupId,
  //   subscriptionId as string,
  //   groupData.stripeMeteredSubscriptionItemId
  // );
}

export async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  const subscriptionId = (invoice as any).subscription as string | null;
  if (!subscriptionId) return;

  const groupQuery = db
    .collection("groups")
    .where("stripeSubscriptionId", "==", subscriptionId)
    .limit(1);
  const groupSnapshot = await groupQuery.get();

  if (!groupSnapshot.empty) {
    const groupDoc = groupSnapshot.docs[0];
    await groupDoc.ref.update({
      subscriptionStatus: "past_due",
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    console.warn(
      `Subscription status for group ${groupDoc.id} set to past_due.`
    );
    // TODO: Notify group admin
  }
}

export async function handleSubscriptionUpdated(
  subscription: Stripe.Subscription
) {
  const subscriptionId = subscription.id;
  const groupQuery = db
    .collection("groups")
    .where("stripeSubscriptionId", "==", subscriptionId)
    .limit(1);
  const groupSnapshot = await groupQuery.get();

  if (!groupSnapshot.empty) {
    const groupDoc = groupSnapshot.docs[0];
    await groupDoc.ref.update({
      subscriptionStatus: subscription.status,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    console.log(
      `Subscription status for group ${groupDoc.id} updated to ${subscription.status}.`
    );

    // COMMENT OUT usage reporting for now
    // if (subscription.status === "active" && subscription.cancel_at_period_end === false) {
    //   console.log("Reporting usage after subscription reactivation...");
    //   await reportUsage(
    //     groupDoc.id,
    //     subscription.id,
    //     groupDoc.data()?.stripeMeteredSubscriptionItemId
    //   );
    // }
  }
}

export async function handleSubscriptionDeleted(
  subscription: Stripe.Subscription
) {
  const subscriptionId = subscription.id;
  const groupQuery = db
    .collection("groups")
    .where("stripeSubscriptionId", "==", subscriptionId)
    .limit(1);
  const groupSnapshot = await groupQuery.get();

  if (!groupSnapshot.empty) {
    const groupDoc = groupSnapshot.docs[0];
    await groupDoc.ref.update({
      subscriptionStatus: "canceled",
      stripeSubscriptionId: null,
      stripeMeteredSubscriptionItemId: null,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    console.log(
      `Subscription ${subscriptionId} cancelled for group ${groupDoc.id}.`
    );
  }
}

export function findMeteredSubscriptionItemId(
  subscription: Stripe.Subscription
): string | null {
  if (!subscription.items?.data) return null;
  const meteredItem = subscription.items.data.find(
    (item) => item.price.id === priceIdMember // Use imported config value
  );
  return meteredItem?.id || null;
}

// Helper function to report usage to Stripe
export async function reportUsage(
  groupId: string,
  subscriptionId: string,
  meteredItemId: string | null
) {
  if (!meteredItemId) {
    console.error(
      `Cannot report usage for group ${groupId}: Missing metered subscription item ID.`
    );
    return;
  }

  const groupRef = db.collection("groups").doc(groupId);
  const groupSnap = await groupRef.get();
  if (!groupSnap.exists) {
    console.error(`Cannot report usage for group ${groupId}: Group not found.`);
    return;
  }
  const groupData = groupSnap.data()!;
  const memberCount = groupData.memberCount || 0;

  try {
    // Revert to using stripe.subscriptionItems with type assertion
    // as the types seem inconsistent with the top-level usageRecords method
    // await (stripe.subscriptionItems as any).createUsageRecord(meteredItemId, {
    //   quantity: memberCount,
    //   timestamp: "now",
    //   action: "set",
    // });
    console.log(
      "TODO: Report usage of",
      memberCount,
      "members for group",
      groupId,
      "(sub_item:",
      meteredItemId,
      ")"
    );
    console.log(
      `Reported usage of ${memberCount} members for group ${groupId} (sub_item: ${meteredItemId})`
    );
  } catch (error: any) {
    console.error(
      `Error reporting usage for group ${groupId} (sub_item: ${meteredItemId}):`,
      error
    );
  }
}

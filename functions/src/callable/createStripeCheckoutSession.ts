import * as functions from "firebase-functions";
import { HttpsError } from "firebase-functions/v1/https";
import { CallableRequest } from "firebase-functions/v2/https";
import { db } from "../utils/firebase";
import { stripe, priceIdBase, priceIdMember } from "../utils/stripe";
import * as admin from "firebase-admin"; // For FieldValue

interface CreateCheckoutData {
  groupId: string;
  successUrl: string;
  cancelUrl: string;
}

export const createStripeCheckoutSession = functions.https.onCall(
  async (request: CallableRequest<CreateCheckoutData>) => {
    const { groupId, successUrl, cancelUrl } = request.data;
    const userId = request.auth?.uid;

    if (!userId) {
      throw new HttpsError("unauthenticated", "User must be logged in.");
    }
    if (!groupId || !successUrl || !cancelUrl) {
      throw new HttpsError("invalid-argument", "Missing required parameters.");
    }
    if (!priceIdBase || !priceIdMember) {
      throw new HttpsError(
        "failed-precondition",
        "Stripe price IDs are not configured."
      );
    }

    try {
      const groupRef = db.collection("groups").doc(groupId);
      const groupSnap = await groupRef.get();

      if (!groupSnap.exists) {
        throw new HttpsError("not-found", "Group not found.");
      }
      const groupData = groupSnap.data()!;

      const admins = groupData.admins || groupData.adminUids || [];
      if (!admins.includes(userId)) {
        throw new HttpsError(
          "permission-denied",
          "Only group admins can manage subscriptions."
        );
      }

      let customerId = groupData.stripeCustomerId;
      if (!customerId) {
        console.log(`Creating Stripe customer for group ${groupId}`);
        const customer = await stripe.customers.create({
          name: groupData.name,
          metadata: { groupId: groupId },
        });
        customerId = customer.id;
        await groupRef.update({ stripeCustomerId: customerId });
        console.log(
          `Stripe customer ${customerId} created for group ${groupId}`
        );
      } else {
        console.log(
          `Using existing Stripe customer ${customerId} for group ${groupId}`
        );
      }

      console.log(
        `Creating Checkout session for customer ${customerId}, group ${groupId}`
      );
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        customer: customerId,
        line_items: [
          { price: priceIdBase, quantity: 1 },
          { price: priceIdMember },
        ],
        mode: "subscription",
        allow_promotion_codes: true,
        success_url: successUrl,
        cancel_url: cancelUrl,
        metadata: {
          groupId: groupId,
          userId: userId,
        },
        subscription_data: {
          metadata: { groupId: groupId },
        },
      });

      console.log(
        `Checkout session ${session.id} created for group ${groupId}`
      );
      return { sessionId: session.id };
    } catch (error: any) {
      console.error(
        `Error creating checkout session for group ${groupId}:`,
        error
      );
      throw new HttpsError(
        "internal",
        "Failed to create checkout session.",
        error.message
      );
    }
  }
);

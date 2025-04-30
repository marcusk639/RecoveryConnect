import * as functions from "firebase-functions";
import { HttpsError } from "firebase-functions/v1/https";
import { CallableRequest } from "firebase-functions/v2/https";
import { db } from "../utils/firebase";
import { stripe } from "../utils/stripe"; // Import only stripe instance
import * as admin from "firebase-admin";
import { Donation } from "../entities/Group";

interface PaymentIntentData {
  groupId: string;
  amount: number; // Expect amount in cents
}

/**
 * Creates a Stripe Payment Intent for a donation to a specific group.
 */
export const createStripePaymentIntent = functions.https.onCall(
  async (request: CallableRequest<PaymentIntentData>) => {
    const { groupId, amount } = request.data;
    const userId = request.auth?.uid;
    const userEmail = request.auth?.token.email;

    if (!stripe) {
      throw new HttpsError(
        "internal",
        "Stripe configuration missing on the server."
      );
    }
    if (!userId) {
      throw new HttpsError(
        "unauthenticated",
        "User must be logged in to donate."
      );
    }
    if (!groupId || typeof amount !== "number" || amount < 50) {
      // Min $0.50
      throw new HttpsError(
        "invalid-argument",
        "Invalid group ID or amount provided (min $0.50)."
      );
    }

    try {
      const groupDoc = await db.collection("groups").doc(groupId).get();
      if (!groupDoc.exists) {
        throw new HttpsError("not-found", "Group not found.");
      }
      const groupName = groupDoc.data()?.name || "Recovery Connect Group";

      // Get or create Stripe Customer ID for the donating user
      const userDoc = await db.collection("users").doc(userId).get();
      let customerId = userDoc.data()?.stripeCustomerId;
      if (!customerId) {
        console.log(`Creating Stripe customer for user ${userId}`);
        const customer = await stripe.customers.create({
          email: userEmail,
          name: userDoc.data()?.displayName || undefined,
          metadata: { firebaseUID: userId },
        });
        customerId = customer.id;
        await db.collection("users").doc(userId).update({
          stripeCustomerId: customerId,
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        console.log(`Stripe customer ${customerId} created for user ${userId}`);
      }
      // Create PaymentIntent
      const paymentIntent = await stripe.paymentIntents.create({
        amount: amount, // Amount in cents
        currency: "usd",
        customer: customerId,
        automatic_payment_methods: { enabled: true },
        metadata: {
          groupId: groupId,
          userId: userId,
          groupName: groupName,
          type: "group_donation", // Identify this payment's purpose
        },
        description: `7th Tradition / Donation to ${groupName} (ID: ${groupId})`,
        // receipt_email: userEmail, // Optionally send Stripe receipt
      });

      console.log(
        `Created PaymentIntent ${paymentIntent.id} for group ${groupId}`
      );

      const donation: Donation = {
        userId: userId,
        amount: amount,
        createdAt: new Date(),
        paymentMethod: "stripe",
        transactionId: paymentIntent.id,
        status: "pending",
      };

      await db
        .collection("groups")
        .doc(groupId)
        .collection("donations")
        .doc()
        .set(donation);

      // Return only the client secret to the frontend
      return {
        clientSecret: paymentIntent.client_secret,
      };
    } catch (error: any) {
      console.error("Error creating Stripe PaymentIntent:", error);
      throw new HttpsError(
        "internal",
        "Failed to initiate payment.",
        error.message
      );
    }
  }
);

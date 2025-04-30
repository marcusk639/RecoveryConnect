import * as functions from "firebase-functions";
import { HttpsError } from "firebase-functions/v1/https";
import { CallableRequest } from "firebase-functions/v2/https";
import { db } from "../utils/firebase";
import { stripe } from "../utils/stripe";

interface AccountLinkData {
  groupId: string;
  refreshUrl: string;
  returnUrl: string;
}

export const createStripeAccountLink = functions.https.onCall(
  async (request: CallableRequest<AccountLinkData>) => {
    const { groupId, refreshUrl, returnUrl } = request.data;
    const userId = request.auth?.uid;

    if (!stripe) {
      throw new HttpsError("internal", "Stripe not configured.");
    }
    if (!userId) {
      throw new HttpsError("unauthenticated", "User must be logged in.");
    }
    if (!groupId || !refreshUrl || !returnUrl) {
      throw new HttpsError("invalid-argument", "Missing required parameters.");
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
          "Only group admins can connect Stripe."
        );
      }

      let accountId = groupData.stripeConnectAccountId;
      if (!accountId) {
        console.log(`Creating new Stripe Connect account for group ${groupId}`);
        const account = await stripe.accounts.create({
          type: "standard",
          metadata: { groupId: groupId },
        });
        accountId = account.id;
        await groupRef.update({ stripeConnectAccountId: accountId });
        console.log(
          `Stripe Connect account ${accountId} created for group ${groupId}`
        );
      } else {
        console.log(
          `Using existing Stripe Connect account ${accountId} for group ${groupId}`
        );
      }

      const accountLink = await stripe.accountLinks.create({
        account: accountId,
        refresh_url: refreshUrl,
        return_url: returnUrl,
        type: "account_onboarding",
        collect: "eventually_due",
      });

      console.log(`Created account link for ${accountId}`);
      return { url: accountLink.url };
    } catch (error: any) {
      console.error(
        `Error creating Stripe account link for group ${groupId}:`,
        error
      );
      throw new HttpsError(
        "internal",
        "Failed to create Stripe onboarding link.",
        error.message
      );
    }
  }
);

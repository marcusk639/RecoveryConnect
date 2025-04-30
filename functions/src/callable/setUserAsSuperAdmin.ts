import * as functions from "firebase-functions";
import { HttpsError } from "firebase-functions/v1/https";
import { CallableRequest } from "firebase-functions/v2/https";
import { db, auth } from "../utils/firebase";
import * as admin from "firebase-admin";

// Define the expected data type for the request
interface SetAdminData {
  userIdToPromote: string;
}

export const setUserAsSuperAdmin = functions.https.onCall(
  async (request: CallableRequest<SetAdminData>) => {
    // Use request.auth for v2 callable functions signature
    if (!request.auth) {
      throw new HttpsError("unauthenticated", "Unauthorized");
    }

    // Verify the caller has permission
    const callerUid = request.auth.uid;
    const callerSnapshot = await auth.getUser(callerUid);
    const callerCustomClaims = callerSnapshot.customClaims || {};

    if (!callerCustomClaims.superAdmin) {
      throw new HttpsError(
        "permission-denied",
        "Only super admins can create other super admins"
      );
    }

    // Get the user ID to promote from request.data
    const { userIdToPromote } = request.data;
    if (!userIdToPromote) {
      throw new HttpsError(
        "invalid-argument",
        "User ID to promote is required in data"
      );
    }

    try {
      // Set custom user claim
      await auth.setCustomUserClaims(userIdToPromote, { superAdmin: true });

      // Optionally update Firestore document
      await db.collection("users").doc(userIdToPromote).update({
        role: "superAdmin",
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      // Force token refresh
      await auth.revokeRefreshTokens(userIdToPromote);

      return {
        success: true,
        message: `User ${userIdToPromote} promoted to super admin`,
      };
    } catch (error: any) {
      console.error(`Error promoting user ${userIdToPromote}:`, error);
      throw new HttpsError(
        "internal",
        error.message || "Failed to promote user"
      );
    }
  }
);

import * as functions from "firebase-functions";
import { HttpsError } from "firebase-functions/v1/https";
import { CallableRequest } from "firebase-functions/v2/https";
import { db } from "../utils/firebase";
import * as admin from "firebase-admin";

interface JoinGroupData {
  code: string;
}

export const joinGroupByInviteCode = functions.https.onCall(
  async (request: CallableRequest<JoinGroupData>) => {
    const { code } = request.data;
    const userId = request.auth?.uid;

    if (!userId) {
      throw new HttpsError("unauthenticated", "User must be logged in.");
    }
    if (!code || typeof code !== "string" || code.length !== 6) {
      throw new HttpsError("invalid-argument", "Invalid invite code format.");
    }

    const normalizedCode = code.toUpperCase();

    try {
      const inviteQuery = db
        .collection("groupInvites")
        .where("code", "==", normalizedCode)
        .limit(1);
      const inviteSnap = await inviteQuery.get();

      if (inviteSnap.empty) {
        throw new HttpsError(
          "not-found",
          `Invite code "${normalizedCode}" not found.`
        );
      }

      const inviteDoc = inviteSnap.docs[0];
      const inviteData = inviteDoc.data();
      const { groupId, status, expiresAt } = inviteData;

      if (status !== "pending") {
        throw new HttpsError(
          "failed-precondition",
          `This invite code has already been ${status}.`
        );
      }
      if (expiresAt.toDate() < new Date()) {
        await inviteDoc.ref.update({ status: "expired" });
        throw new HttpsError(
          "failed-precondition",
          "This invite code has expired."
        );
      }

      const memberRef = db.collection("members").doc(`${groupId}_${userId}`);
      const memberSnap = await memberRef.get();

      if (memberSnap.exists) {
        console.log(
          `User ${userId} already member of group ${groupId}. Marking invite ${normalizedCode} as used.`
        );
        await inviteDoc.ref.update({
          status: "used",
          usedByUid: userId,
          usedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        return {
          success: true,
          groupId: groupId,
          message: "Already a member of this group.",
        };
      }

      const groupRef = db.collection("groups").doc(groupId);
      const userRef = db.collection("users").doc(userId);
      const userSnap = await userRef.get();
      if (!userSnap.exists) {
        throw new HttpsError("not-found", "Invited user profile not found.");
      }
      const userData = userSnap.data();

      const batch = db.batch();
      const newMemberRef = db.collection("members").doc(`${groupId}_${userId}`);
      batch.set(newMemberRef, {
        userId: userId,
        groupId: groupId,
        displayName: userData?.displayName || "Unknown User",
        email: userData?.email || null,
        photoURL: userData?.photoURL || null,
        isAdmin: false,
        joinedAt: admin.firestore.FieldValue.serverTimestamp(),
        sobrietyDate: userData?.sobrietyStartDate || null,
        showSobrietyDate: userData?.showSobrietyDate ?? true,
        showPhoneNumber: userData?.showPhoneNumber ?? true,
      });

      batch.update(groupRef, {
        memberCount: admin.firestore.FieldValue.increment(1),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
      batch.update(inviteDoc.ref, {
        status: "used",
        usedByUid: userId,
        usedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
      batch.update(userRef, {
        homeGroups: admin.firestore.FieldValue.arrayUnion(groupId),
      });

      await batch.commit();

      console.log(
        `User ${userId} successfully joined group ${groupId} using invite ${normalizedCode}`
      );
      return {
        success: true,
        groupId: groupId,
        message: "Successfully joined group.",
      };
    } catch (error) {
      console.error("Error in joinGroupByInviteCode:", error);
      if (error instanceof HttpsError) {
        throw error;
      }
      throw new HttpsError(
        "internal",
        "Failed to join group using invite code.",
        (error as Error).message
      );
    }
  }
);

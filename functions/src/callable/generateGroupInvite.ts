import * as functions from "firebase-functions";
import { HttpsError } from "firebase-functions/v1/https";
import { CallableRequest } from "firebase-functions/v2/https";
import { db } from "../utils/firebase";
import * as admin from "firebase-admin";

interface GenerateInviteData {
  groupId: string;
}

export const generateGroupInvite = functions.https.onCall(
  async (request: CallableRequest<GenerateInviteData>) => {
    const { groupId } = request.data;
    const inviterUid = request.auth?.uid;

    if (!inviterUid) {
      throw new HttpsError("unauthenticated", "User must be logged in.");
    }
    if (!groupId) {
      throw new HttpsError("invalid-argument", "Group ID is required.");
    }

    const webLinkBase = "https://homegroups-app.com/";

    try {
      const groupRef = db.collection("groups").doc(groupId);
      const groupSnap = await groupRef.get();

      if (!groupSnap.exists) {
        throw new HttpsError("not-found", "Group not found.");
      }

      const groupData = groupSnap.data();
      const admins = groupData?.admins || groupData?.adminUids || [];

      if (!admins.includes(inviterUid)) {
        if (admins.length > 0) {
          throw new HttpsError(
            "permission-denied",
            "Only group admins can generate invites."
          );
        }
        if (admins.length === 0) {
          throw new HttpsError(
            "failed-precondition",
            "Group needs at least one admin to send invites."
          );
        }
      }

      let code: string;
      let codeExists = true;
      const characters = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
      const codeLength = 6;
      while (codeExists) {
        code = "";
        for (let i = 0; i < codeLength; i++) {
          code += characters.charAt(
            Math.floor(Math.random() * characters.length)
          );
        }
        const existingInvite = await db
          .collection("groupInvites")
          .where("code", "==", code)
          .limit(1)
          .get();
        codeExists = !existingInvite.empty;
      }

      const expiresAt = admin.firestore.Timestamp.fromDate(
        new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      );
      const inviteRef = db.collection("groupInvites").doc();
      await inviteRef.set({
        code: code,
        groupId: groupId,
        groupName: groupData?.name || "Unknown Group",
        inviterUid: inviterUid,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        expiresAt: expiresAt,
        status: "pending",
      });

      const link = `${webLinkBase}join?code=${code}`;

      console.log(
        `Generated invite code ${code} and link ${link} for group ${groupId} by user ${inviterUid}`
      );
      return { code, link };
    } catch (error) {
      // Explicitly type error
      console.error("Error in generateGroupInvite:", error);
      if (error instanceof HttpsError) {
        throw error;
      }
      throw new HttpsError(
        "internal",
        "Failed to generate group invite.",
        (error as Error).message
      );
    }
  }
);

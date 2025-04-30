import * as functions from "firebase-functions";
import { HttpsError } from "firebase-functions/v1/https";
import { CallableRequest } from "firebase-functions/v2/https";
import { db } from "../utils/firebase";
import * as admin from "firebase-admin";
// Assume email sending utility exists: import { sendEmail } from '../utils/email';

interface SendInviteEmailData {
  groupId: string;
  inviteeEmail: string;
  inviteCode: string;
}

export const sendGroupInviteEmail = functions.https.onCall(
  async (request: CallableRequest<SendInviteEmailData>) => {
    const { groupId, inviteeEmail, inviteCode } = request.data;
    const inviterUid = request.auth?.uid;

    if (!inviterUid) {
      throw new HttpsError("unauthenticated", "User must be logged in.");
    }
    if (!groupId || !inviteeEmail || !inviteCode) {
      throw new HttpsError("invalid-argument", "Missing required fields.");
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(inviteeEmail)) {
      throw new HttpsError("invalid-argument", "Invalid email format.");
    }

    try {
      const groupRef = db.collection("groups").doc(groupId);
      const inviteQuery = db
        .collection("groupInvites")
        .where("code", "==", inviteCode)
        .where("groupId", "==", groupId)
        .limit(1);
      const userRef = db.collection("users").doc(inviterUid);

      const [groupSnap, inviteSnap, userSnap] = await Promise.all([
        groupRef.get(),
        inviteQuery.get(),
        userRef.get(),
      ]);

      if (!groupSnap.exists) {
        throw new HttpsError("not-found", "Group not found.");
      }
      if (inviteSnap.empty) {
        throw new HttpsError(
          "not-found",
          `Invite code ${inviteCode} invalid for this group.`
        );
      }

      const groupData = groupSnap.data();
      const inviteData = inviteSnap.docs[0].data();
      const userData = userSnap.data();

      const admins = groupData?.admins || groupData?.adminUids || [];
      if (!admins.includes(inviterUid)) {
        if (admins.length > 0) {
          throw new HttpsError(
            "permission-denied",
            "Only group admins can send invites."
          );
        }
        if (admins.length === 0) {
          throw new HttpsError(
            "failed-precondition",
            "Group needs admin to send invites."
          );
        }
      }

      if (inviteData.status !== "pending") {
        throw new HttpsError(
          "failed-precondition",
          `Invite code already ${inviteData.status}.`
        );
      }
      if (inviteData.expiresAt.toDate() < new Date()) {
        await inviteSnap.docs[0].ref.update({ status: "expired" });
        throw new HttpsError("failed-precondition", "Invite code has expired.");
      }

      const universalLinkBase = "https://recoveryconnect.app/";
      const link = `${universalLinkBase}join?code=${inviteCode}`;
      const inviterName = userData?.displayName || "A member";
      const groupName = groupData?.name || "the group";
      const subject = `Invitation to join ${groupName} on Recovery Connect`;
      const emailBody = `
            <p>Hello,</p>
            <p>${inviterName} has invited you to join the recovery group "${groupName}" on the Recovery Connect app.</p>
            <p>Recovery Connect helps groups stay connected and organized while respecting anonymity.</p>
            <p>To join the group, download the Recovery Connect app and use the invite code below, or click the link:</p>
            <p style="font-size: 1.5em; font-weight: bold; margin: 15px 0; letter-spacing: 2px;">${inviteCode}</p>
            <p><a href="${link}" style="display: inline-block; padding: 10px 15px; background-color: #2196F3; color: white; text-decoration: none; border-radius: 5px;">Join Group Now</a></p>
            <p>If the button doesn't work, copy and paste this link into your browser: <br/> ${link}</p>
            <p>This invite code expires in 7 days.</p>
            <p>If you did not expect this invitation, please ignore this email.</p>
            <br/>
            <p>Sincerely,</p>
            <p>The Recovery Connect Team</p>
        `;

      // --- Send Email ---
      console.log(`Simulating email send to: ${inviteeEmail}`);
      console.log(`Subject: ${subject}`);
      // await sendEmail({ to: inviteeEmail, subject: subject, html: emailBody });

      await inviteSnap.docs[0].ref.update({
        emailSentTo: inviteeEmail,
        emailSentAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      console.log(
        `Invite email triggered for ${inviteeEmail} for group ${groupId} by user ${inviterUid}`
      );
      return { success: true };
    } catch (error) {
      console.error("Error in sendGroupInviteEmail:", error);
      if (error instanceof HttpsError) {
        throw error;
      }
      throw new HttpsError(
        "internal",
        "Failed to send group invite email.",
        (error as Error).message
      );
    }
  }
);

import * as functions from "firebase-functions";
import { HttpsError } from "firebase-functions/v1/https";
import { CallableRequest } from "firebase-functions/v2/https";
import { db, messaging } from "../utils/firebase"; // Import db and messaging
import * as admin from "firebase-admin";

interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  sentAt: admin.firestore.Timestamp;
  groupId: string;
  mentionedUserIds?: string[];
}

interface SendMentionData {
  groupId: string;
  messageId: string;
  message: ChatMessage;
}

export const sendMentionNotifications = functions.https.onCall(
  async (request: CallableRequest<SendMentionData>) => {
    const snap = request.data;
    if (!snap || !snap.groupId || !snap.messageId || !snap.message) {
      functions.logger.error("Invalid mention notification request data");
      throw new HttpsError(
        "invalid-argument",
        "Missing required mention data."
      );
    }

    const messageData = snap.message;
    const { groupId, messageId } = snap;
    const senderId = messageData.senderId;
    const senderName = messageData.senderName || "Someone";
    const messageText = messageData.text || "";

    functions.logger.info(
      `New message ${messageId} in group ${groupId}. Checking for mentions.`
    );

    let mentionedUserIds: string[] = [];
    if (
      messageData.mentionedUserIds &&
      messageData.mentionedUserIds.length > 0
    ) {
      mentionedUserIds = messageData.mentionedUserIds;
      functions.logger.info(
        `Found mentioned user IDs from message data: ${mentionedUserIds.join(
          ", "
        )}`
      );
    } else {
      const mentionRegex = /@([a-zA-Z0-9_\.]+)/g;
      let match;
      const mentionedNames: string[] = [];
      while ((match = mentionRegex.exec(messageText)) !== null) {
        mentionedNames.push(match[1]);
      }
      if (mentionedNames.length > 0) {
        functions.logger.warn(
          "Mention lookup by name not fully implemented. Store mentionedUserIds with message."
        );
      }
    }
    const recipients = mentionedUserIds.filter((uid) => uid !== senderId);
    if (recipients.length === 0) {
      functions.logger.info(
        "No valid recipients found for mention notification."
      );
      return { success: true, sentCount: 0 }; // Return successfully if no recipients
    }
    functions.logger.info(
      `Recipients for notification: ${recipients.join(", ")}`
    );

    const tokens: string[] = [];
    const userPromises = recipients.map((userId) =>
      db.collection("users").doc(userId).get()
    );
    const userDocs = await Promise.all(userPromises);
    userDocs.forEach((doc) => {
      if (doc.exists) {
        const userData = doc.data();
        const groupNotificationEnabled =
          userData?.notificationSettings?.groupChatMentions !== false;
        const globalEnabled =
          userData?.notificationSettings?.allowPushNotifications !== false;
        if (
          groupNotificationEnabled &&
          globalEnabled &&
          userData?.fcmTokens &&
          Array.isArray(userData.fcmTokens)
        ) {
          tokens.push(...userData.fcmTokens);
        }
      }
    });
    if (tokens.length === 0) {
      functions.logger.info("No valid FCM tokens found for recipients.");
      return { success: true, sentCount: 0 }; // Return successfully if no tokens
    }

    const groupSnap = await db.collection("groups").doc(groupId).get();
    const groupName = groupSnap.data()?.name || "a group";
    const truncatedMessage =
      messageText.length > 100
        ? messageText.substring(0, 97) + "..."
        : messageText;

    // Use imported messaging service
    try {
      const response = await messaging.sendEachForMulticast({
        tokens,
        notification: {
          title: `New Mention in ${groupName}`,
          body: `${senderName}: ${truncatedMessage}`,
        },
        data: {
          type: "chat_mention",
          groupId: groupId,
          messageId: messageId,
          senderName: senderName,
        },
        // Add APNS/Android config if needed
      });
      functions.logger.info(
        `Sent ${response.successCount} mention notifications.`
      );
      if (response.failureCount > 0) {
        functions.logger.warn(
          `Failed to send ${response.failureCount} mention notifications.`
        );
        // Additional logging of failures if desired
      }
      return { success: true, sentCount: response.successCount };
    } catch (error) {
      functions.logger.error("Error sending push notification:", error);
      throw new HttpsError(
        "internal",
        "Failed to send mention notifications.",
        (error as Error).message
      );
    }
  }
);

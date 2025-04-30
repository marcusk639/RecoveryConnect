import * as functions from "firebase-functions";
import {
  getNarcoticsAnoymousMeetings,
  getAll12StepMeetings,
  getCustomMeetings,
  getAlcoholicsAnonymousMeetings,
  generateMeetingHash,
} from "./utils/meetings";
import {
  Meeting,
  MeetingDocument,
  MeetingInstanceDocument,
  MeetingSearchCriteria,
  MeetingType,
} from "./entities/Meeting";
import * as admin from "firebase-admin";
import * as geofire from "geofire-common";
// Import the v1 namespace specifically
import * as functionsV1 from "firebase-functions/v1";
import { migrateGeohashes } from "./migrations/migrateGeohashes";
import { Query } from "firebase-admin/firestore";
import { HttpsError } from "firebase-functions/v1/https";
import { getMessaging } from "firebase-admin/messaging";
import moment from "moment-timezone";

// Use admin SDK Timestamp type consistently
import { Timestamp as AdminTimestamp } from "firebase-admin/firestore"; // Alias Admin timestamp
// Import implementation file as suggested by linter
import { FirebaseFirestoreTypes } from "../../mobile/node_modules/@react-native-firebase/firestore/lib/index";
type ClientTimestamp = FirebaseFirestoreTypes.Timestamp;
// Initialize Firebase Admin if not already initialized
if (admin.apps.length === 0) {
  admin.initializeApp();
}

/**
 * Retrieves all meetings based on the location and filters sent in the request
 * data: {
 *  location: { lat, lng }
 *  filters: type of meeting (AA, NA, etc)
 * }
 */
interface MeetingSearchInput {
  filters?: {
    date: string;
    location: {
      lat: number;
      lng: number;
    };
    day?: string;
    type?: MeetingTypeFilters;
  };

  criteria?: MeetingSearchCriteria;
}

export type MeetingTypeFilters =
  | "AA"
  | "NA"
  | "AL-ANON"
  | "Religious"
  | "Custom"
  | "all"
  | "Celebrate Recovery";
export const findMeetings = functions.https.onCall(async (request) => {
  try {
    const meetingInput = request.data as MeetingSearchInput;
    const meetingPromises: Promise<Meeting[]>[] = [];
    const start = Date.now();

    // Extract day filter
    const dayFilter = meetingInput.filters?.day?.toLowerCase(); // Get day from filters

    if (
      meetingInput.filters &&
      meetingInput.filters.type &&
      meetingInput.filters.type !== "all"
    ) {
      if (meetingInput.filters.type === "AA") {
        const aaMeetings = getAlcoholicsAnonymousMeetings(
          meetingInput.filters.location,
          meetingInput.criteria,
          dayFilter
        );
        meetingPromises.push(aaMeetings);
      }
      if (meetingInput.filters.type === "NA") {
        const naMeetings = getNarcoticsAnoymousMeetings(
          meetingInput.filters.location,
          meetingInput.criteria,
          dayFilter // Pass day filter (already accepted)
        );
        meetingPromises.push(naMeetings);
      }
      if (meetingInput.filters.type === "Custom") {
        const customMeetings = getCustomMeetings(
          meetingInput.filters.location,
          meetingInput.criteria,
          dayFilter
        );
        meetingPromises.push(customMeetings);
      }
    } else if (meetingInput.filters) {
      const all12StepMeetings = getAll12StepMeetings(
        meetingInput.filters.location,
        meetingInput.criteria,
        dayFilter // Pass day filter
      );
      meetingPromises.push(all12StepMeetings);
    } else {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "Missing required filters for meeting search"
      );
    }

    const results = await Promise.all(meetingPromises);
    const meetings: Meeting[] = [];
    for (const meetingSet of results) {
      meetings.push(...meetingSet);
    }
    const end = Date.now();
    functions.logger.info(
      "Meeting retrieval took",
      (end - start) / 1000,
      "seconds"
    );
    return meetings;
  } catch (error) {
    functions.logger.error("Error in findMeetings:", error);
    throw new functions.https.HttpsError(
      "internal",
      "Error retrieving meetings",
      error instanceof Error ? error.message : String(error)
    );
  }
});

/**
 * Calculate distance between two coordinates in kilometers
 */
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  return geofire.distanceBetween([lat1, lon1], [lat2, lon2]) / 1000;
}

/**
 * Cloud Function: Search for groups near a location using geohashing
 *
 * Requires that group documents have 'geohash', 'lat', and 'lng' fields.
 * Requires a Firestore index on the 'geohash' field (ascending).
 */
export const searchGroupsByLocation = functions.https.onCall(
  async (request) => {
    const data = request.data as {
      lat: number;
      lng: number;
      radius: number;
      type: MeetingType;
    };
    try {
      // Validate required parameters
      if (!data.lat || !data.lng || !data.radius) {
        throw new functions.https.HttpsError(
          "invalid-argument",
          "Missing required parameters: latitude, longitude, and radius"
        );
      }

      const latitude = Number(data.lat);
      const longitude = Number(data.lng);
      const radius = data.radius ? Number(data.radius) : 25;
      const radiusInM = radius * 1000; // Convert km to meters

      // Find groups within the given radius
      const center: [number, number] = [latitude, longitude];
      const bounds = geofire.geohashQueryBounds(center, radiusInM);
      const promises = [];

      let groupsRef: Query = admin.firestore().collection("groups");

      if (data.type) {
        groupsRef = groupsRef.where("type", "==", data.type);
      }

      for (const b of bounds) {
        const q = groupsRef.orderBy("geohash").startAt(b[0]).endAt(b[1]);
        promises.push(q.get());
      }

      // Collect all the query results
      const snapshots = await Promise.all(promises);
      const matchingDocs = [];

      for (const snap of snapshots) {
        for (const doc of snap.docs) {
          const lat = doc.get("lat");
          const lng = doc.get("lng");

          // We have to filter out a few false positives due to geohash accuracy
          const distanceInKm = calculateDistance(latitude, longitude, lat, lng);
          if (distanceInKm <= radius) {
            // Add this group to our result set if it's within our radius
            const groupData = doc.data();
            groupData.id = doc.id;
            groupData.distanceInKm = distanceInKm;
            matchingDocs.push(groupData);
          }
        }
      }

      // Remove duplicates (if any) and sort by distance
      const uniqueGroups = Array.from(
        new Map(matchingDocs.map((item) => [item.id, item])).values()
      );
      uniqueGroups.sort((a, b) => a.distanceInKm - b.distanceInKm);

      functions.logger.info(`Found ${uniqueGroups.length} groups nearby`);
      return uniqueGroups;
    } catch (error) {
      functions.logger.error("Error in searchGroupsByLocation:", error);
      throw new functions.https.HttpsError(
        "internal",
        "Error searching for groups",
        error instanceof Error ? error.message : String(error)
      );
    }
  }
);

/**
 * Cloud Function: Ensures a group has proper geolocation data
 * This HTTP function can be called after group creation to set geohash
 * for efficient location-based queries
 */
export const ensureGroupGeolocation = functions.https.onCall(
  async (request) => {
    try {
      const { groupId } = request.data;

      if (!groupId) {
        throw new functions.https.HttpsError(
          "invalid-argument",
          "Missing required parameter: groupId"
        );
      }

      // Get the group document
      const groupRef = admin.firestore().collection("groups").doc(groupId);
      const groupDoc = await groupRef.get();

      if (!groupDoc.exists) {
        throw new functions.https.HttpsError("not-found", "Group not found");
      }

      const groupData = groupDoc.data();

      // Check if the document has latitude and longitude
      if (!groupData?.lat || !groupData?.lng) {
        throw new functions.https.HttpsError(
          "failed-precondition",
          "Group does not have lat/lng coordinates"
        );
      }

      // Generate a geohash for the group
      const lat = Number(groupData.lat);
      const lng = Number(groupData.lng);
      const geohash = geofire.geohashForLocation([lat, lng]);

      functions.logger.info(
        `Generated geohash ${geohash} for group ${groupId}`
      );

      // Update the document with the geohash
      await groupRef.update({
        geohash,
        // Ensure we have numeric latitude and longitude
        lat,
        lng,
      });

      return { success: true, geohash };
    } catch (error) {
      functions.logger.error("Error in ensureGroupGeolocation:", error);
      throw new functions.https.HttpsError(
        "internal",
        "Error updating group geolocation data",
        error instanceof Error ? error.message : String(error)
      );
    }
  }
);

export const setGroupGeolocation = functionsV1.firestore
  .document("groups/{groupId}")
  .onCreate(async (snapshot, context) => {
    try {
      const groupId = context.params.groupId;

      if (!groupId) {
        throw new functions.https.HttpsError(
          "invalid-argument",
          "Missing required parameter: groupId"
        );
      }

      // Get the group document
      const groupRef = admin.firestore().collection("groups").doc(groupId);
      const groupDoc = await groupRef.get();

      if (!groupDoc.exists) {
        throw new functions.https.HttpsError("not-found", "Group not found");
      }

      const groupData = groupDoc.data();

      // Check if the document has latitude and longitude
      if (!groupData?.lat || !groupData?.lng) {
        throw new functions.https.HttpsError(
          "failed-precondition",
          "Group does not have lat/lng coordinates"
        );
      }

      // Generate a geohash for the group
      const lat = Number(groupData.lat);
      const lng = Number(groupData.lng);
      const geohash = geofire.geohashForLocation([lat, lng]);

      functions.logger.info(
        `Generated geohash ${geohash} for group ${groupId}`
      );

      // Update the document with the geohash
      await groupRef.update({
        geohash,
        // Ensure we have numeric latitude and longitude
        lat,
        lng,
      });

      return { success: true, geohash };
    } catch (error) {
      functions.logger.error("Error in ensureGroupGeolocation:", error);
      throw new functions.https.HttpsError(
        "internal",
        "Error updating group geolocation data",
        error instanceof Error ? error.message : String(error)
      );
    }
  });

/**
 * Cloud Function: Fetches AA meetings from the Meeting Guide API when a new group is created
 * and creates corresponding meeting documents in Firestore
 */
export const fetchMeetingsForNewGroup = functionsV1.firestore
  .document("groups/{groupId}")
  .onCreate(async (snapshot, context) => {
    try {
      const groupId = context.params.groupId;
      const groupData = snapshot.data();

      functions.logger.info(
        `New group created: ${groupId}. Fetching nearby meetings...`
      );

      // Check if group has location data
      if (!groupData.lat || !groupData.lng) {
        functions.logger.warn(
          `Group ${groupId} does not have location data, skipping meeting fetch.`
        );
        return null;
      }

      // Import the API module
      const { getAAMeetings } = require("./api/api");

      // Fetch meetings from Meeting Guide API
      const latitude = Number(groupData.lat);
      const longitude = Number(groupData.lng);
      const meetingsResponse = await getAAMeetings(latitude, longitude);

      functions.logger.info(
        `Fetched ${
          meetingsResponse.meetings?.length || 0
        } meetings from Meeting Guide API`
      );

      // Filter meetings that are likely associated with this group
      // This requires some heuristics - for now, we'll use proximity and name similarity
      const relevantMeetings = findRelevantMeetings(
        meetingsResponse.meetings || [],
        groupData
      );

      functions.logger.info(
        `Found ${relevantMeetings.length} meetings relevant to group ${groupId}`
      );

      const db = admin.firestore();
      db.settings({ ignoreUndefinedProperties: true });

      // Create meeting documents in Firestore
      const batch = db.batch();
      let meetingsCreated = 0;

      for (const meeting of relevantMeetings) {
        const id = generateMeetingHash(meeting);
        const meetingDocRef = db.collection("meetings").doc(id);

        // Create meeting document with a reference to the group
        batch.set(meetingDocRef, {
          ...formatMeetingForFirestore(meeting),
          groupId: groupId,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        meetingsCreated++;
      }

      // Commit the batch if meetings were found
      if (meetingsCreated > 0) {
        await batch.commit();
        functions.logger.info(
          `Created ${meetingsCreated} meeting documents for group ${groupId}`
        );

        // Update the group with the meeting count
        await admin.firestore().collection("groups").doc(groupId).update({
          meetingCount: meetingsCreated,
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
      }

      return { success: true, meetingsCreated };
    } catch (error) {
      functions.logger.error("Error in fetchMeetingsForNewGroup:", error);
      return null;
    }
  });

/**
 * Helper function to format a meeting from the Meeting Guide API into a Firestore document
 */
function formatMeetingForFirestore(meeting: any): Meeting {
  // Extract the relevant fields from the Meeting Guide API response
  // and format them for storage in Firestore
  return {
    name: meeting.name || "Unnamed Meeting",
    day: meeting.day || "",
    time: meeting.time || "",
    locationName: meeting.location_name || "",
    address: meeting.address || "",
    city: meeting.city || "",
    state: meeting.state || "",
    street: meeting.street || "",
    zip: meeting.postal_code || "",
    country: meeting.country || "USA",
    lat: parseFloat(meeting.latitude) || null,
    lng: parseFloat(meeting.longitude) || null,
    type: "AA", // Since these are from the AA API
    format: meeting.types || "",
    onlineNotes: meeting.location_notes || "",
    online: !!meeting.conference_url, // If there's a URL, it's likely online
    link: meeting.conference_url || null,
    ...meeting,
  };
}

function hasNameOverlap(meeting: any, groupName: string) {
  const groupNameWords = groupName.toLowerCase().split(/\s+/);

  if (groupNameWords.length > 0) {
    const meetingNameWords = (meeting.name || "").toLowerCase().split(/\s+/);
    const hasNameOverlap = groupNameWords.some(
      (word) => word.length > 3 && meetingNameWords.includes(word)
    );

    // If names are too different, exclude the meeting
    return hasNameOverlap;
  }

  return false;
}

/**
 * Helper function to find meetings that are likely associated with a group
 */
function findRelevantMeetings(meetings: any[], groupData: any) {
  // This function needs heuristics to determine which meetings are associated with a group
  // For example, we could use:
  // 1. Proximity (meetings very close to the group location)
  // 2. Name similarity (meetings with similar names to the group)
  // 3. Address matching (meetings at the same address)

  // For this implementation, let's use proximity and optional name matching
  const MAX_DISTANCE_METERS = 500; // 500 meters max distance
  const groupLocation: [number, number] = [
    Number(groupData.lat),
    Number(groupData.lng),
  ];
  return meetings.filter((meeting) => {
    // Check if meeting has location data
    if (meeting.latitude && meeting.longitude) {
      // Check distance
      const meetingLocation: [number, number] = [
        parseFloat(meeting.latitude),
        parseFloat(meeting.longitude),
      ];

      const distance = geofire.distanceBetween(groupLocation, meetingLocation);

      if (distance <= MAX_DISTANCE_METERS) {
        return hasNameOverlap(meeting, groupData.name);
      }
    }

    return hasNameOverlap(meeting, groupData.name);
  });
}

export const setUserAsSuperAdmin = functions.https.onCall(
  async (request, context) => {
    // Check if request is made by an authenticated admin
    if (!request.auth) {
      throw new functions.https.HttpsError("unauthenticated", "Unauthorized");
    }

    // Verify the caller has permission to set super admin (existing super admin)
    const callerUid = request.auth.uid;
    const callerSnapshot = await admin.auth().getUser(callerUid);
    const callerCustomClaims = callerSnapshot.customClaims || {};

    if (!callerCustomClaims.superAdmin) {
      throw new functions.https.HttpsError(
        "permission-denied",
        "Only super admins can create other super admins"
      );
    }

    // Get the user ID to promote
    const userId = request.auth.uid;
    if (!userId) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "User ID is required"
      );
    }

    try {
      // Set custom user claim
      await admin.auth().setCustomUserClaims(userId, { superAdmin: true });

      // Optionally update Firestore document as well
      await admin.firestore().collection("users").doc(userId).update({
        role: "superAdmin",
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      // Force token refresh
      await admin.auth().revokeRefreshTokens(userId);

      return { success: true, message: "User promoted to super admin" };
    } catch (error) {
      throw new functions.https.HttpsError("internal", error.message);
    }
  }
);

/**
 * Generates a unique invite code and web link for a group.
 * - Checks if caller is an admin of the group.
 * - Creates an invite document in Firestore.
 * - Returns the code and a standard HTTPS link.
 */
export const generateGroupInvite = functions.https.onCall(
  async (request, context) => {
    const { groupId } = request.data;
    const inviterUid = request.auth?.uid;

    if (!inviterUid) {
      throw new HttpsError("unauthenticated", "User must be logged in.");
    }
    if (!groupId) {
      throw new HttpsError("invalid-argument", "Group ID is required.");
    }

    // --- Configuration ---
    const webLinkBase = "https://homegroups-app.com/"; // Your main web domain

    try {
      const groupRef = admin.firestore().collection("groups").doc(groupId);
      const groupSnap = await groupRef.get();

      if (!groupSnap.exists) {
        throw new HttpsError("not-found", "Group not found.");
      }

      const groupData = groupSnap.data();
      const admins = groupData?.admins || groupData?.adminUids || [];

      // --- Authorization Check --- (Keep existing logic)
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

      // --- Generate Unique Code --- (Keep existing logic)
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
        const existingInvite = await admin
          .firestore()
          .collection("groupInvites")
          .where("code", "==", code)
          .limit(1)
          .get();
        codeExists = !existingInvite.empty;
      }

      // --- Create Invite Document --- (Keep existing logic)
      const expiresAt = admin.firestore.Timestamp.fromDate(
        new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      );
      const inviteRef = admin.firestore().collection("groupInvites").doc();
      await inviteRef.set({
        code: code,
        groupId: groupId,
        groupName: groupData?.name || "Unknown Group",
        inviterUid: inviterUid,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        expiresAt: expiresAt,
        status: "pending",
      });

      // --- Construct Standard Web Link ---
      const link = `${webLinkBase}join?code=${code}`;

      console.log(
        `Generated invite code ${code} and link ${link} for group ${groupId} by user ${inviterUid}`
      );
      return { code, link }; // Return the standard web link
    } catch (error) {
      console.error("Error in generateGroupInvite:", error);
      if (error instanceof HttpsError) {
        throw error;
      }
      throw new HttpsError(
        "internal",
        "Failed to generate group invite.",
        error
      );
    }
  }
);

/**
 * Sends an invitation email using a generated invite code.
 * - Checks if caller is an admin of the group.
 * - Looks up group details.
 * - Sends email via configured service.
 */
export const sendGroupInviteEmail = functions.https.onCall(
  async (request, context) => {
    const { groupId, inviteeEmail, inviteCode } = request.data;
    const inviterUid = request.auth?.uid;

    if (!inviterUid) {
      throw new HttpsError("unauthenticated", "User must be logged in.");
    }
    if (!groupId || !inviteeEmail || !inviteCode) {
      throw new HttpsError(
        "invalid-argument",
        "Missing required fields: groupId, inviteeEmail, inviteCode."
      );
    }

    // Basic email validation
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(inviteeEmail)) {
      throw new HttpsError(
        "invalid-argument",
        "Invalid email format provided."
      );
    }

    try {
      const groupRef = admin.firestore().collection("groups").doc(groupId);
      const inviteQuery = admin
        .firestore()
        .collection("groupInvites")
        .where("code", "==", inviteCode)
        .where("groupId", "==", groupId)
        .limit(1);
      const userRef = admin.firestore().collection("users").doc(inviterUid);

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
          `Invite code ${inviteCode} is invalid or does not belong to this group.`
        );
      }

      const groupData = groupSnap.data();
      const inviteData = inviteSnap.docs[0].data();
      const userData = userSnap.data();

      // --- Authorization Check ---
      const admins = groupData?.admins || groupData?.adminUids || [];
      if (!admins.includes(inviterUid)) {
        if (admins.length > 0) {
          // Only deny if admins exist
          throw new HttpsError(
            "permission-denied",
            "Only group admins can send invites."
          );
        }
        if (admins.length === 0) {
          // Deny if no admins exist yet
          throw new HttpsError(
            "failed-precondition",
            "Group needs at least one admin to send invites."
          );
        }
      }

      // --- Check Invite Status ---
      if (inviteData.status !== "pending") {
        throw new HttpsError(
          "failed-precondition",
          `Invite code ${inviteCode} has already been ${inviteData.status}.`
        );
      }
      if (inviteData.expiresAt.toDate() < new Date()) {
        // Optionally update status to 'expired' here
        await inviteSnap.docs[0].ref.update({ status: "expired" });
        throw new HttpsError(
          "failed-precondition",
          `Invite code ${inviteCode} has expired.`
        );
      }

      // --- Construct Deep Link ---
      const deepLinkBase = "recoveryconnect://";
      const universalLinkBase = "https://recoveryconnect.app/";
      const link = `${universalLinkBase}join?code=${inviteCode}`;

      // --- Prepare Email Content ---
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
        `; // Improve formatting as needed

      // --- Send Email ---
      // Replace this with your actual email sending logic
      console.log(`Simulating email send to: ${inviteeEmail}`);
      console.log(`Subject: ${subject}`);
      console.log(`Body: (HTML)`);
      // await sendEmail({
      //     to: inviteeEmail,
      //     subject: subject,
      //     html: emailBody,
      // });

      // --- Update Invite Doc (Optional: Track email sent) ---
      // You could add a field like 'emailSentAt' to the invite doc
      await inviteSnap.docs[0].ref.update({
        emailSentTo: inviteeEmail, // Record where it was sent
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
        error
      );
    }
  }
);

/**
 * Validates an invite code and adds the requesting user to the corresponding group.
 * - Checks if user is already in the group.
 * - Verifies the code exists, is valid (status: pending), and not expired.
 * - Adds user to the group's members collection (or updates role if needed).
 * - Updates the group's member count.
 * - Marks the invite code as used.
 */
export const joinGroupByInviteCode = functions.https.onCall(
  async (request, context) => {
    const { code } = request.data;
    const userId = request.auth?.uid;

    if (!userId) {
      throw new HttpsError("unauthenticated", "User must be logged in.");
    }
    if (!code || typeof code !== "string" || code.length !== 6) {
      throw new HttpsError("invalid-argument", "Invalid invite code format.");
    }

    const normalizedCode = code.toUpperCase(); // Ensure case-insensitivity

    try {
      // --- Find the Invite Document ---
      const inviteQuery = admin
        .firestore()
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

      // --- Validate Invite Status and Expiry ---
      if (status !== "pending") {
        throw new HttpsError(
          "failed-precondition",
          `This invite code has already been ${status}.`
        );
      }
      if (expiresAt.toDate() < new Date()) {
        // Update status to expired - prevents reuse
        await inviteDoc.ref.update({ status: "expired" });
        throw new HttpsError(
          "failed-precondition",
          "This invite code has expired."
        );
      }

      // --- Check if User is Already a Member ---
      // Assuming MemberModel exists and has a method like isGroupMember or similar
      // If not, query the members subcollection directly.
      // const isAlreadyMember = await MemberModel.isGroupMember(groupId, userId);
      const memberRef = admin
        .firestore()
        .collection("members")
        .doc(`${groupId}_${userId}`);
      const memberSnap = await memberRef.get();

      if (memberSnap.exists) {
        // User is already in the group. Optionally mark invite as used anyway?
        console.log(
          `User ${userId} already member of group ${groupId}. Marking invite ${normalizedCode} as used.`
        );
        await inviteDoc.ref.update({
          status: "used",
          usedByUid: userId,
          usedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        // Return group info so app can navigate
        return {
          success: true,
          groupId: groupId,
          message: "Already a member of this group.",
        };
      }

      // --- Add User to Group ---
      const groupRef = admin.firestore().collection("groups").doc(groupId);
      const userRef = admin.firestore().collection("users").doc(userId);

      // Fetch user data to add to member doc
      const userSnap = await userRef.get();
      if (!userSnap.exists) {
        throw new HttpsError("not-found", "Invited user profile not found.");
      }
      const userData = userSnap.data();

      const batch = admin.firestore().batch();

      // 1. Create Member Document (assuming a top-level members collection)
      // Adjust fields based on your MemberModel/schema
      const newMemberRef = admin
        .firestore()
        .collection("members")
        .doc(`${groupId}_${userId}`);
      batch.set(newMemberRef, {
        userId: userId,
        groupId: groupId,
        displayName: userData?.displayName || "Unknown User",
        email: userData?.email || null,
        photoURL: userData?.photoURL || null,
        isAdmin: false, // Invites don't grant admin by default
        joinedAt: admin.firestore.FieldValue.serverTimestamp(),
        // Add other default member fields from your schema
        sobrietyDate: userData?.sobrietyStartDate || null,
        showSobrietyDate: userData?.showSobrietyDate ?? true,
        showPhoneNumber: userData?.showPhoneNumber ?? true,
      });

      // 2. Update Group Member Count
      batch.update(groupRef, {
        memberCount: admin.firestore.FieldValue.increment(1),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      // 3. Update Invite Status
      batch.update(inviteDoc.ref, {
        status: "used",
        usedByUid: userId,
        usedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      // 4. Add group to user's list of homegroups (Optional but good practice)
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
        error
      );
    }
  }
);

// Assuming ChatMessage type includes mentionedUserIds: string[]
interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  sentAt: admin.firestore.Timestamp;
  groupId: string;
  mentionedUserIds?: string[]; // Added for mentions
  // ... other fields like reactions, attachments, replyTo
}

/**
 * Triggered when a new chat message is created.
 * Checks for mentioned users and sends them push notifications.
 */
export const sendMentionNotifications = functions.https.onCall(
  async (request, context) => {
    // Use the event object from v2 trigger
    // Get the snapshot of the created document
    const snap: { groupId: string; messageId: string; message: ChatMessage } =
      request.data;
    if (!snap) {
      functions.logger.error("No data associated with the event");
      return null;
    }

    const messageData = snap.message;
    // Get context parameters from the event object
    const { groupId, messageId } = snap;
    const senderId = messageData.senderId;
    const senderName = messageData.senderName || "Someone";
    const messageText = messageData.text || "";

    functions.logger.info(
      `New message ${messageId} in group ${groupId}. Checking for mentions.`
    );

    // --- 1. Identify Mentioned Users ---
    // (Keep the logic for identifying mentionedUserIds as is)
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
      // Fallback logic using regex remains the same...
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
      return null;
    }
    functions.logger.info(
      `Recipients for notification: ${recipients.join(", ")}`
    );

    // --- 2. Get FCM Tokens for Recipients ---
    // (Keep the logic for fetching tokens and checking preferences as is)
    const tokens: string[] = [];
    const userPromises = recipients.map((userId) =>
      admin.firestore().collection("users").doc(userId).get()
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
      return null;
    }

    // --- 3. Construct and Send Notification Payload ---
    // (Keep the logic for constructing the payload as is)
    const groupSnap = await admin
      .firestore()
      .collection("groups")
      .doc(groupId)
      .get();
    const groupName = groupSnap.data()?.name || "a group";
    const truncatedMessage =
      messageText.length > 100
        ? messageText.substring(0, 97) + "..."
        : messageText;
    const payload = {
      notification: {
        title: `New Mention in ${groupName}`,
        body: `${senderName}: ${truncatedMessage}`,
        // Optional: Add sound, badge count etc.
        // sound: "default",
        // badge: "1"
      },
      data: {
        // Custom data for handling click action in the app
        type: "chat_mention",
        groupId: groupId,
        messageId: messageId, // Can be used to highlight the message
        senderName: senderName,
        // Add any other data needed to navigate correctly
      },
      // Optional: APNS specific config (like thread-id)
      // apns: {
      //     payload: {
      //         aps: {
      //             'thread-id': groupId
      //         }
      //     }
      // },
      // Optional: Android specific config (like channel ID)
      // android: {
      //     notification: {
      //         channel_id: "group_chat_mentions" // Ensure this channel is created on the client
      //     }
      // }
    };

    // (Keep the logic for sending the notification via getMessaging().sendToDevice() as is)
    try {
      const response = await getMessaging().sendEachForMulticast({
        tokens,
        notification: {
          title: `New Mention in ${groupName}`,
          body: `${senderName}: ${truncatedMessage}`,
        },
      });
      // ... (logging and error handling for response) ...
      return { success: true, sentCount: response.successCount };
    } catch (error) {
      functions.logger.error("Error sending push notification:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }
);

/**
 * Combines a specific date with a time string (HH:MM) and timezone
 * to create an accurate Firestore Timestamp.
 *
 * @param date The target date (YYYY-MM-DD or Date object)
 * @param time The time string (e.g., "19:00")
 * @param timezone The IANA timezone string (e.g., "America/New_York")
 * @returns Firestore Timestamp or null if inputs are invalid
 */
function createMeetingTimestamp(
  date: Date | string,
  time: string,
  timezone: string
): AdminTimestamp | null {
  try {
    if (!moment.tz.zone(timezone)) {
      functions.logger.warn(
        `Invalid timezone provided: ${timezone}. Falling back to UTC.`
      );
      timezone = "UTC";
    }
    // Use moment(...) directly if default import works
    const dateString =
      typeof date === "string" ? date : moment(date).format("YYYY-MM-DD");
    const dateTimeString = `${dateString} ${time}`;
    // Use moment.tz if default works, or stick to moment.tz if using namespaced import
    const meetingMoment = moment.tz(
      dateTimeString,
      "YYYY-MM-DD HH:mm",
      timezone
    );

    if (!meetingMoment.isValid()) {
      functions.logger.error(
        `Failed to parse combined date/time: ${dateTimeString} in timezone ${timezone}`
      );
      return null;
    }
    return AdminTimestamp.fromDate(meetingMoment.toDate());
  } catch (error) {
    functions.logger.error(
      `Error creating meeting timestamp for ${date} ${time} [${timezone}]:`,
      error
    );
    return null;
  }
}

/**
 * Helper function to generate meeting instances for a single meeting template
 * within a given date range.
 * Returns the number of instances created.
 */
async function generateInstancesForMeeting(
  meetingId: string,
  meetingTemplate: MeetingDocument, // Use the local type with any for timestamps
  startDate: moment.Moment, // Start date (moment object, UTC)
  endDate: moment.Moment, // End date (moment object, UTC)
  groupTimezone: string,
  db: admin.firestore.Firestore // Pass Firestore instance
): Promise<number> {
  const daysOfWeek = [
    "sunday",
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
  ];
  const templateDayIndex = daysOfWeek.indexOf(
    (meetingTemplate.day || "").toLowerCase()
  );
  const templateTime = meetingTemplate.time;
  const templateUpdatedAt: AdminTimestamp =
    meetingTemplate.updatedAt || admin.firestore.Timestamp.now();
  const groupId = meetingTemplate.groupId; // Get groupId from template

  if (templateDayIndex === -1 || !templateTime || !groupId) {
    functions.logger.warn(
      `Cannot generate instances for meeting ${meetingId}: Invalid day, time, or missing groupId.`
    );
    return 0;
  }

  let batch = db.batch();
  let operationsInBatch = 0;
  let createdCount = 0;
  const BATCH_LIMIT = 450;
  const generationPromises: Promise<any>[] = [];

  // Calculate dates within the range matching the template day
  let currentDate = startDate.clone(); // Clone to avoid modifying original
  while (currentDate.isSameOrBefore(endDate)) {
    if (currentDate.day() === templateDayIndex) {
      const scheduledAtTimestamp = createMeetingTimestamp(
        currentDate.toDate(),
        templateTime,
        groupTimezone
      );

      if (scheduledAtTimestamp) {
        // Check if instance already exists for this exact time
        const instanceQuery = db
          .collection("meetingInstances")
          .where("meetingId", "==", meetingId)
          .where("scheduledAt", "==", scheduledAtTimestamp)
          .limit(1);
        const existingInstance = await instanceQuery.get();

        if (existingInstance.empty) {
          const instanceRef = db.collection("meetingInstances").doc();
          const instanceData: MeetingInstanceDocument = {
            meetingId: meetingId,
            groupId: groupId,
            scheduledAt: scheduledAtTimestamp,
            templateUpdatedAt: templateUpdatedAt,
            name: meetingTemplate.name,
            type: meetingTemplate.type,
            format: meetingTemplate.format ?? null,
            location: meetingTemplate.location ?? null,
            address: meetingTemplate.address ?? null,
            city: meetingTemplate.city ?? null,
            state: meetingTemplate.state ?? null,
            zip: meetingTemplate.zip ?? null,
            lat: meetingTemplate.lat ?? null,
            lng: meetingTemplate.lng ?? null,
            locationName: meetingTemplate.locationName ?? null,
            isOnline: meetingTemplate.isOnline ?? false,
            link: meetingTemplate.onlineLink ?? null,
            onlineNotes: meetingTemplate.onlineNotes ?? null,
            isCancelled: false,
            instanceNotice: null,
          };
          batch.set(instanceRef, instanceData);
          operationsInBatch++;
          createdCount++;

          if (operationsInBatch >= BATCH_LIMIT) {
            generationPromises.push(batch.commit());
            batch = db.batch();
            operationsInBatch = 0;
          }
        }
      }
    }
    currentDate.add(1, "day"); // Move to the next day
  }

  if (operationsInBatch > 0) {
    generationPromises.push(batch.commit());
  }

  await Promise.all(generationPromises);
  functions.logger.info(
    `Generated ${createdCount} instances for meeting ${meetingId} between ${startDate.format(
      "YYYY-MM-DD"
    )} and ${endDate.format("YYYY-MM-DD")}.`
  );
  return createdCount;
}

/**
 * Scheduled function to generate meeting instances for the upcoming week.
 */
// Correct scheduled function syntax using v1 for broader compatibility or ensure v2 setup
export const generateWeeklyMeetingInstances = functionsV1.pubsub
  .schedule("0 0 1 * *")
  .timeZone("UTC")
  .onRun(async (context) => {
    functions.logger.info("Starting monthly meeting instance generation...");
    const db = admin.firestore(); // Get Firestore instance
    const today = moment.utc();
    // Calculate end date for the next month
    const nextMonthEnd = moment.utc().add(1, "month").endOf("month"); // Generate instances up to the end of next month

    try {
      const groupsSnapshot = await db.collection("groups").get();
      let totalInstancesCreated = 0;
      const groupPromises: Promise<void>[] = [];

      functions.logger.info(`Processing ${groupsSnapshot.size} groups.`);

      groupsSnapshot.forEach((groupDoc) => {
        const groupProcess = async () => {
          const groupId = groupDoc.id;
          const groupData = groupDoc.data();
          const groupTimezone = groupData?.timezone || "UTC";

          const meetingsSnapshot = await db
            .collection("meetings")
            .where("groupId", "==", groupId)
            .get();

          if (meetingsSnapshot.empty) return;

          for (const meetingDoc of meetingsSnapshot.docs) {
            try {
              const count = await generateInstancesForMeeting(
                meetingDoc.id,
                meetingDoc.data() as MeetingDocument,
                today, // Generate starting from today
                nextMonthEnd, // Generate for the next month
                groupTimezone,
                db
              );
              totalInstancesCreated += count;
            } catch (meetingError) {
              functions.logger.error(
                `Error generating instances for meeting ${meetingDoc.id}:`,
                meetingError
              );
            }
          }
        };
        groupPromises.push(groupProcess());
      });

      await Promise.all(groupPromises);
      functions.logger.info(
        `Monthly meeting instance generation finished. Total instances created/checked: ${totalInstancesCreated}.`
      );
      return null;
    } catch (error) {
      functions.logger.error(
        "Error in generateWeeklyMeetingInstances job:",
        error
      );
      return null;
    }
  });

/**
 * Triggered when a Meeting template document is updated.
 */
export const updateFutureMeetingInstances = functionsV1.firestore
  .document("meetings/{meetingId}")
  .onUpdate(async (change, context) => {
    const meetingId = context.params.meetingId;
    const newData = change.after.data() as MeetingDocument | undefined;
    const previousData = change.before.data() as MeetingDocument | undefined;
    const db = admin.firestore(); // Get Firestore instance

    if (!newData || !newData.updatedAt || !newData.groupId) {
      functions.logger.error(`Missing data for updated meeting ${meetingId}`);
      return null;
    }

    const newTs = newData.updatedAt;
    const prevTs = previousData?.updatedAt;

    if (
      newTs &&
      prevTs &&
      typeof newTs.isEqual === "function" &&
      newTs.isEqual(prevTs)
    ) {
      functions.logger.info(
        `Meeting ${meetingId} timestamp unchanged. No propagation needed.`
      );
      return null;
    }

    // Check if day or time changed
    const dayChanged = newData.day !== previousData?.day;
    const timeChanged = newData.time !== previousData?.time;
    const shouldRegenerate = dayChanged || timeChanged;

    const now = admin.firestore.Timestamp.now();
    const futureInstancesQuery = db
      .collection("meetingInstances")
      .where("meetingId", "==", meetingId)
      .where("scheduledAt", ">=", now);

    try {
      if (shouldRegenerate) {
        functions.logger.info(
          `Regenerating future instances for meeting ${meetingId} due to day/time change.`
        );

        // 1. Delete existing future instances
        const snapshotToDelete = await futureInstancesQuery.get();
        if (!snapshotToDelete.empty) {
          let deleteBatch = db.batch();
          let deleteCount = 0;
          snapshotToDelete.forEach((doc) => {
            deleteBatch.delete(doc.ref);
            deleteCount++;
            if (deleteCount % 450 === 0) {
              // Commit in batches
              deleteBatch
                .commit()
                .catch((err) =>
                  functions.logger.error("Batch delete error:", err)
                );
              deleteBatch = db.batch();
            }
          });
          await deleteBatch.commit();
          functions.logger.info(
            `Deleted ${deleteCount} old future instances for meeting ${meetingId}.`
          );
        }

        // 2. Generate new instances for the next ~4 weeks
        const groupDoc = await db
          .collection("groups")
          .doc(newData.groupId)
          .get();
        const groupTimezone = groupDoc.data()?.timezone || "UTC";
        const startDate = moment.utc(); // Start from today
        const endDate = moment.utc().add(4, "weeks"); // Regenerate for 4 weeks

        await generateInstancesForMeeting(
          meetingId,
          newData,
          startDate,
          endDate,
          groupTimezone,
          db
        );
      } else {
        // Only day/time didn't change, so just update other fields
        functions.logger.info(
          `Propagating non-schedule changes to future instances for meeting ${meetingId}.`
        );
        const instancesSnapshot = await futureInstancesQuery.get();
        if (instancesSnapshot.empty) return null;

        let updateBatch = db.batch();
        let updatedCount = 0;
        const BATCH_LIMIT = 450;

        instancesSnapshot.forEach((doc) => {
          // Prepare update payload excluding schedule and instance-specific fields
          const updatePayload: Partial<MeetingInstanceDocument> = {
            name: newData.name,
            type: newData.type,
            format: newData.format ?? null,
            location: newData.location ?? null,
            address: newData.address ?? null,
            city: newData.city ?? null,
            state: newData.state ?? null,
            zip: newData.zip ?? null,
            lat: newData.lat ?? null,
            lng: newData.lng ?? null,
            locationName: newData.locationName ?? null,
            isOnline: newData.isOnline ?? false,
            link: newData.onlineLink ?? null,
            onlineNotes: newData.onlineNotes ?? null,
            templateUpdatedAt: newData.updatedAt, // Update template timestamp
          };

          Object.keys(updatePayload).forEach(
            (key) =>
              (updatePayload as any)[key] === undefined &&
              delete (updatePayload as any)[key]
          );

          if (Object.keys(updatePayload).length > 0) {
            // Only update if there are changes
            updateBatch.update(doc.ref, updatePayload);
            updatedCount++;
            if (updatedCount % BATCH_LIMIT === 0) {
              updateBatch
                .commit()
                .catch((err) =>
                  functions.logger.error("Batch update error:", err)
                );
              updateBatch = db.batch();
            }
          }
        });

        if (updatedCount % BATCH_LIMIT !== 0 && updatedCount > 0) {
          // Commit remaining updates
          await updateBatch.commit();
        }
        functions.logger.info(
          `Successfully propagated updates to ${updatedCount} future instances for meeting ${meetingId}.`
        );
      }
      return { success: true };
    } catch (error) {
      functions.logger.error(
        `Error processing update trigger for meeting ${meetingId}:`,
        error
      );
      return null;
    }
  });

// ... rest of the file ...

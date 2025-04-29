import * as functions from "firebase-functions";
import {
  getNarcoticsAnoymousMeetings,
  getAll12StepMeetings,
  getCustomMeetings,
  getAlcoholicsAnonymousMeetings,
} from "./utils/meetings";
import {
  Meeting,
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

    if (
      meetingInput.filters &&
      meetingInput.filters.type &&
      meetingInput.filters.type !== "all"
    ) {
      if (meetingInput.filters.type === "AA") {
        const aaMeetings = getAlcoholicsAnonymousMeetings(
          meetingInput.filters.location,
          meetingInput.criteria
        );
        meetingPromises.push(aaMeetings);
      }
      if (meetingInput.filters.type === "NA") {
        const naMeetings = getNarcoticsAnoymousMeetings(
          meetingInput.filters.location,
          meetingInput.criteria,
          meetingInput.filters.day
        );
        meetingPromises.push(naMeetings);
      }
      if (meetingInput.filters.type === "Custom") {
        const customMeetings = getCustomMeetings(
          meetingInput.filters.location,
          meetingInput.criteria
        );
        meetingPromises.push(customMeetings);
      }
    } else if (meetingInput.filters) {
      const all12StepMeetings = getAll12StepMeetings(
        meetingInput.filters.location,
        meetingInput.criteria,
        meetingInput.filters.day
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

      // Create meeting documents in Firestore
      const batch = admin.firestore().batch();
      let meetingsCreated = 0;

      for (const meeting of relevantMeetings) {
        const meetingDocRef = admin.firestore().collection("meetings").doc();

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
 * Generates a unique invite code and link for a group.
 * - Checks if caller is an admin of the group.
 * - Creates an invite document in Firestore.
 * - Returns the code and a deep link.
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

    try {
      const groupRef = admin.firestore().collection("groups").doc(groupId);
      const groupSnap = await groupRef.get();

      if (!groupSnap.exists) {
        throw new HttpsError("not-found", "Group not found.");
      }

      const groupData = groupSnap.data();
      const admins = groupData?.admins || groupData?.adminUids || []; // Support both field names

      // --- Authorization Check ---
      if (!admins.includes(inviterUid)) {
        // Allow any member to invite if group has NO admins (unclaimed scenario?)
        // Or enforce strict admin-only invites. Let's assume admin-only for now.
        if (admins.length > 0) {
          throw new HttpsError(
            "permission-denied",
            "Only group admins can generate invites."
          );
        }
        // If admins array is empty, maybe allow any member? Add check if needed.
        // For now, require at least one admin to invite.
        if (admins.length === 0) {
          throw new HttpsError(
            "failed-precondition",
            "Group needs at least one admin to send invites."
          );
        }
      }

      // --- Generate Unique Code ---
      let code: string;
      let codeExists = true;
      const characters = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // User-friendly chars
      const codeLength = 6;

      while (codeExists) {
        code = "";
        for (let i = 0; i < codeLength; i++) {
          code += characters.charAt(
            Math.floor(Math.random() * characters.length)
          );
        }
        // Check if code already exists (rare, but possible)
        const existingInvite = await admin
          .firestore()
          .collection("groupInvites")
          .where("code", "==", code)
          .limit(1)
          .get();
        codeExists = !existingInvite.empty;
      }

      // --- Create Invite Document ---
      const expiresAt = admin.firestore.Timestamp.fromDate(
        new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // Expires in 7 days
      );

      const inviteRef = admin.firestore().collection("groupInvites").doc(); // Auto-generate ID
      await inviteRef.set({
        code: code,
        groupId: groupId,
        groupName: groupData?.name || "Unknown Group", // Denormalize for email
        inviterUid: inviterUid,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        expiresAt: expiresAt,
        status: "pending", // Initial status
      });

      // --- Construct Deep Link ---
      // Use your app's custom scheme or universal link base URL
      const deepLinkBase = "recoveryconnect://"; // iOS custom scheme
      const universalLinkBase = "https://recoveryconnect.app/"; // Your domain for Android App Links / iOS Universal Links
      // Choose based on platform if possible, or use universal link primarily
      const link = `${universalLinkBase}join?code=${code}`;

      console.log(
        `Generated invite code ${code} for group ${groupId} by user ${inviterUid}`
      );
      return { code, link };
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

// ... other functions ...

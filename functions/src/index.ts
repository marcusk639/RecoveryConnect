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
    location: meeting.location_name || "",
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

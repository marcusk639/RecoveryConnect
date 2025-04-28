// scripts/seedGroupsFromMeetings.ts

import * as admin from "firebase-admin";
import * as geofire from "geofire-common";
import * as path from "path";
import crypto from "crypto";
// --- Configuration ---
// Ensure GOOGLE_APPLICATION_CREDENTIALS is set in your environment
// or update this path:
// const SERVICE_ACCOUNT_PATH = path.resolve('./path/to/your/serviceAccountKey.json');
const MEETINGS_COLLECTION = "meetings";
const GROUPS_COLLECTION = "groups";
const BATCH_SIZE = 400; // Firestore batch write limit is 500
const GEOHASH_PRECISION = 9;
const COORDINATE_PRECISION = 5; // Round lat/lon to this many decimal places for grouping key
const SERVICE_ACCOUNT_PATH = "./recovery-connect.json";

// --- Interfaces (adjust based on your actual data models) ---
export class Meeting {
  name = "";
  time = "";
  street = "";
  city?: string;
  state?: string;
  zip?: string;
  formattedAddress?: string;
  types?: string[];
  lat?: number;
  lng?: number;
  country?: string;
  locationName?: string; // or the directions, if NA meeting
  type?: "AA" | "NA" | "IOP" | "Religious" | "Celebrate Recovery" | "CUSTOM";
  Location?: string[]; // specific to NA meetings
  day?: string;
  online?: boolean;
  link?: string;
  onlineNotes?: string;
  format?: string;
  id?: string;
  address?: string;
  location?: string;
  verified?: boolean;
  addedBy?: string;
  createdAt?: Date;
  updatedAt?: Date;
  groupId?: string; // Optional reference to associated group
}

interface Group {
  id?: string; // Firestore document ID
  name: string;
  type?: string;
  lat?: number;
  lng?: number;
  geohash?: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  online?: boolean;
  link?: string;
  meetingCount: number;
  createdAt: admin.firestore.Timestamp;
  updatedAt: admin.firestore.Timestamp;
  // Add other group fields as needed
}

// --- Helper Functions ---

function initializeFirebaseAdmin(): admin.app.App {
  try {
    console.log(
      "Initializing Firebase Admin SDK using Application Default Credentials..."
    );
    return admin.initializeApp({
      credential: admin.credential.cert(require(SERVICE_ACCOUNT_PATH)),
    });
    // If using a specific path:
    // const serviceAccount = require(SERVICE_ACCOUNT_PATH);
    // console.log("Initializing Firebase Admin SDK using service account file...");
    // return admin.initializeApp({
    //     credential: admin.credential.cert(serviceAccount),
    // });
  } catch (error: any) {
    console.error("Firebase Admin SDK initialization failed:", error);
    process.exit(1);
  }
}

function roundCoordinate(num: number, precision: number): number {
  const factor = Math.pow(10, precision);
  return Math.round(num * factor) / factor;
}

function normalizeString(str?: string): string {
  return (str || "").toLowerCase().trim();
}

// Add this function to extract potential group names from meeting names
function extractGroupName(meetingName: string): string | null {
  if (!meetingName) return null;

  const normalizedName = normalizeString(meetingName);

  // Common patterns to look for:
  // 1. Names in quotes: "Serenity Group" Tuesday Night
  const quotedMatch = normalizedName.match(/"([^"]+)"/);
  if (quotedMatch) return quotedMatch[1];

  // 2. Common group name endings: Something Group, Something Fellowship
  const groupMatch = normalizedName.match(/(.+?)\s+(group|fellowship)/);
  if (groupMatch) return groupMatch[0];

  // 3. Before the hyphen: Serenity Group - Morning Meeting
  const hyphenMatch = normalizedName.match(/(.+?)\s+-/);
  if (hyphenMatch) return hyphenMatch[1];

  // 4. Group names that take a significant portion of the meeting name (if name is long enough)
  const parts = normalizedName.split(/\s+/);
  if (parts.length >= 3) {
    // Look for 2+ word combinations that might be a group name
    return parts.slice(0, Math.min(4, parts.length - 1)).join(" ");
  }

  return null;
}

/**
 * Creates the data object for a new group based on a meeting.
 */
function createGroupDataFromMeeting(meeting: Meeting): Group | null {
  // Try to extract a group name from the meeting name
  const extractedGroupName = extractGroupName(meeting.name);

  // Prioritize extracted group name, then fall back to location name or meeting name
  let groupName = extractedGroupName || meeting.locationName || meeting.name;

  if (!groupName) {
    console.warn(
      `Cannot create group from meeting ${meeting.id}: Missing name/locationName.`
    );
    return null;
  }

  const now = admin.firestore.Timestamp.now();
  const groupData: Partial<Group> = {
    name: groupName,
    type: meeting.type,
    address: meeting.address,
    city: meeting.city,
    state: meeting.state,
    zip: meeting.zip,
    online: meeting.online ?? false,
    link: meeting.online ? meeting.link : undefined,
    meetingCount: 1, // Initial count
    createdAt: now,
    updatedAt: now,
  };

  if (
    !groupData.online &&
    meeting.lat !== undefined &&
    meeting.lng !== undefined
  ) {
    groupData.lat = meeting.lat;
    groupData.lng = meeting.lng;
    try {
      groupData.geohash = geofire.geohashForLocation(
        [meeting.lat, meeting.lng],
        GEOHASH_PRECISION
      );
    } catch (e) {
      console.error(
        `Error generating geohash for meeting ${
          meeting.id || meeting.name
        } at [${meeting.lat}, ${meeting.lng}]:`,
        e
      );
      // Decide how to handle: skip group creation, or create without geohash?
      // Let's create it without, we can fix later.
    }
  } else if (groupData.online && !groupData.link) {
    console.warn(
      `Cannot create online group from meeting ${
        meeting.id || meeting.name
      }: Missing link.`
    );
    return null; // Online group needs a link
  }

  // Remove undefined fields before returning
  Object.keys(groupData).forEach(
    (key) =>
      groupData[key as keyof Group] === undefined &&
      delete groupData[key as keyof Group]
  );

  return groupData as Group; // Assume required fields are now present or handled
}

export function generateMeetingHash(meeting: Meeting): string {
  // Create a consistent string representation including all unique identifiers
  const meetingString = [
    meeting.name?.trim() || "",
    meeting.day || "", // CRITICAL: Include the day
    meeting.time || "",
    meeting.link || "",
    meeting.formattedAddress?.trim() || "", // Use full address string for location part
    // Optional: Add more fields ONLY if they are consistently available and define uniqueness
    // meeting.locationName?.trim() || "",
    // meeting.link?.trim() || "",
  ].join("|");

  // Generate SHA-1 hash
  const hash = crypto.createHash("sha1").update(meetingString).digest("hex");

  // Return a significant portion (e.g., first 24 chars) for practical uniqueness
  return hash.substring(0, 24);
}

// --- Main Script Logic ---

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function seedGroups() {
  const app = initializeFirebaseAdmin();
  const db = admin.firestore(app);
  const meetingsRef = db.collection(MEETINGS_COLLECTION);
  const groupsRef = db.collection(GROUPS_COLLECTION);

  let batch = db.batch();
  let operationsInBatch = 0;
  let totalMeetingsProcessed = 0;
  let totalGroupsCreated = 0;
  let totalGroupsFound = 0;
  let totalGroupsNeedingGeohash = 0;
  let skippedMeetings = 0;

  // Cache to map groupingKey -> groupId (avoids repeated lookups/creations)
  const groupCache = new Map<string, string>();

  console.log("Starting group seeding process...");

  const meetingStream = meetingsRef.stream();

  try {
    for await (const meetingDoc of meetingStream) {
      totalMeetingsProcessed++;
      const meetingData = (meetingDoc as any).data() as Meeting;
      meetingData.id = (meetingDoc as any).id; // Keep Firestore doc ID for logging

      const groupingKey = generateMeetingHash(meetingData);

      if (!groupingKey) {
        skippedMeetings++;
        continue; // Skip meetings that can't be grouped
      }

      // 1. Check cache first
      if (groupCache.has(groupingKey)) {
        // console.log(`Cache hit for key: ${groupingKey}. Skipping lookup.`);
        // Optional: Could potentially increment meetingCount on the cached group ID here,
        // but doing it accurately requires reading the group doc, which slows things down.
        // It's often better to recalculate counts later if perfect accuracy is needed during seeding.
        continue;
      }

      // 2. If not cached, check Firestore for existing group
      let existingGroupFound = false;
      let existingGroupId: string | undefined;
      let existingGroupData: Group | undefined;

      try {
        // --- Query Logic ---
        if (meetingData.online && meetingData.link) {
          // Query by normalized link for online groups
          const normalizedLink = meetingData.link
            .replace(/^https?:\/\//, "")
            .replace(/\/$/, "");
          const onlineQuery = groupsRef
            .where("online", "==", true)
            .where("link", "==", normalizedLink)
            .limit(1);
          const onlineSnapshot = await onlineQuery.get();
          if (!onlineSnapshot.empty) {
            existingGroupFound = true;
            existingGroupId = onlineSnapshot.docs[0].id;
            existingGroupData = onlineSnapshot.docs[0].data() as Group;
          }
        } else if (
          meetingData.lat !== undefined &&
          meetingData.lng !== undefined
        ) {
          // Query by geohash for in-person groups
          const center: [number, number] = [meetingData.lat, meetingData.lng];
          const radiusInM = 100; // Increase to 100m to be more liberal in finding matches
          const bounds = geofire.geohashQueryBounds(center, radiusInM);

          // Extract potential group name from meeting name for matching
          const meetingGroupName = extractGroupName(meetingData.name);

          for (const b of bounds) {
            const query = groupsRef
              .where("online", "==", false) // Ensure it's an in-person group
              .orderBy("geohash")
              .startAt(b[0])
              .endAt(b[1]);

            const snapshot = await query.get();
            for (const doc of snapshot.docs) {
              const group = doc.data() as Group;

              // More comprehensive match criteria:
              // 1. Check for distance
              const distanceInKm = geofire.distanceBetween(
                [group.lat!, group.lng!],
                center
              );

              // 2. Check for name similarity
              let nameMatch = false;

              // If we extracted a potential group name, check if it matches the group name
              if (
                meetingGroupName &&
                normalizeString(group.name).includes(meetingGroupName)
              ) {
                nameMatch = true;
              }

              // Alternatively, check if group name appears in meeting name
              if (
                !nameMatch &&
                meetingData.name
                  .toLowerCase()
                  .includes(normalizeString(group.name))
              ) {
                nameMatch = true;
              }

              // Location identifier match (your existing logic)
              const locationMatch =
                normalizeString(group.name) ===
                (normalizeString(meetingData.locationName) ||
                  normalizeString(meetingData.address) ||
                  normalizeString(meetingData.city));

              // Match if:
              // 1. Very close distance (20m) AND some kind of name match, OR
              // 2. Close distance (100m) AND strong name match
              if (
                (distanceInKm < 0.02 && (nameMatch || locationMatch)) ||
                (distanceInKm < 0.1 && nameMatch && locationMatch)
              ) {
                existingGroupFound = true;
                existingGroupId = doc.id;
                existingGroupData = group;
                break;
              }
            }
            if (existingGroupFound) break; //         Exit bounds loop
          }
        }
        // --- End Query Logic ---

        if (existingGroupFound && existingGroupId && existingGroupData) {
          totalGroupsFound++;
          console.log(
            `Found existing group ${existingGroupId} for key: ${groupingKey}`
          );
          groupCache.set(groupingKey, existingGroupId); // Cache the found group

          // Ensure geohash exists on the found group
          if (
            !existingGroupData.online &&
            (!existingGroupData.geohash ||
              !existingGroupData.lat ||
              !existingGroupData.lng)
          ) {
            totalGroupsNeedingGeohash++;
            const groupLat = existingGroupData.lat ?? meetingData.lat;
            const groupLng = existingGroupData.lng ?? meetingData.lng;
            if (groupLat !== undefined && groupLng !== undefined) {
              try {
                const correctGeohash = geofire.geohashForLocation(
                  [groupLat, groupLng],
                  GEOHASH_PRECISION
                );
                const groupDocRef = groupsRef.doc(existingGroupId);
                batch.update(groupDocRef, {
                  geohash: correctGeohash,
                  lat: groupLat, // Ensure lat/lng are also stored numerically
                  lng: groupLng,
                  updatedAt: admin.firestore.Timestamp.now(),
                });
                console.log(
                  ` -> Queued geohash update for group ${existingGroupId}`
                );
                operationsInBatch++;
              } catch (e) {
                console.error(
                  ` -> Error generating geohash for existing group ${existingGroupId}:`,
                  e
                );
              }
            } else {
              console.warn(
                ` -> Cannot update geohash for group ${existingGroupId}: Missing lat/lng.`
              );
            }
          }
        } else {
          // 3. If no group found, create a new one
          const newGroupData = createGroupDataFromMeeting(meetingData);
          if (newGroupData) {
            totalGroupsCreated++;
            const newGroupRef = groupsRef.doc(); // Auto-generate ID
            console.log(
              `Creating new group (${newGroupRef.id}) for key: ${groupingKey}`
            );
            batch.set(newGroupRef, newGroupData);
            operationsInBatch++;
            groupCache.set(groupingKey, newGroupRef.id); // Cache the new group
          } else {
            skippedMeetings++; // Couldn't create group data
          }
        }

        // Commit batch if full
        if (operationsInBatch >= BATCH_SIZE) {
          console.log(`Committing batch of ${operationsInBatch} operations...`);
          await batch.commit();
          console.log("Batch committed.");
          batch = db.batch(); // Reset batch
          operationsInBatch = 0;
        }
      } catch (error) {
        console.error(
          `Error processing meeting ${
            meetingData.id || meetingData.name
          } with key ${groupingKey}:`,
          error
        );
        // Decide if you want to stop the script or continue
      }

      if (totalMeetingsProcessed % 1000 === 0) {
        console.log(
          `Processed ${totalMeetingsProcessed} meetings... (Created: ${totalGroupsCreated}, Found: ${totalGroupsFound}, Skipped: ${skippedMeetings})`
        );
      }
    }

    // Commit any remaining operations
    if (operationsInBatch > 0) {
      console.log(
        `Committing final batch of ${operationsInBatch} operations...`
      );
      await batch.commit();
      console.log("Final batch committed.");
    }

    console.log("\n--- Seeding Complete ---");
    console.log(`Total Meetings Processed: ${totalMeetingsProcessed}`);
    console.log(`Meetings Skipped (Invalid Data / No Key): ${skippedMeetings}`);
    console.log(`Unique Groups Found in Firestore: ${totalGroupsFound}`);
    console.log(`New Groups Created: ${totalGroupsCreated}`);
    console.log(
      `Existing Groups Queued for Geohash Update: ${totalGroupsNeedingGeohash}`
    );
    console.log("--------------------------\n");
  } catch (error) {
    console.error("Error reading meeting stream:", error);
  }
}

// Execute the script
seedGroups()
  .then(() => {
    console.log("Script finished successfully.");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Script failed with error:", error);
    process.exit(1);
  });

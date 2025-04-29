import * as admin from "firebase-admin";
import * as geofire from "geofire-common";
import * as path from "path";
import crypto from "crypto";
import { Timestamp } from "firebase-admin/firestore";

// --- Configuration ---
const SERVICE_ACCOUNT_PATH = "./recovery-connect.json";
const MEETINGS_COLLECTION = "meetings";
const GROUPS_COLLECTION = "groups";
const BATCH_SIZE = 400; // Firestore batch write limit is 500
const GEOHASH_PRECISION = 9;
const COORDINATE_PRECISION = 5; // Round lat/lon to this many decimal places for grouping key

// Fuzzy matching thresholds
const FUZZY_MATCH_THRESHOLD = 85; // Score threshold (0-100) for considering names a match
const FUZZY_PARTIAL_THRESHOLD = 75; // Score threshold for partial matches
const VERY_CLOSE_DISTANCE_M = 20; // Distance in meters to consider "very close"
const CLOSE_DISTANCE_M = 100; // Distance in meters to consider "close"

// --- Interfaces ---
export interface Meeting {
  name: string;
  time: string;
  street: string;
  city?: string;
  state?: string;
  zip?: string;
  formattedAddress?: string;
  address?: string;
  locationName?: string;
  location?: string;
  country?: string;
  lat?: number;
  lng?: number;
  type?: "AA" | "NA" | "IOP" | "Religious" | "Celebrate Recovery" | "CUSTOM";
  Location?: string[];
  day?: string;
  online?: boolean;
  link?: string;
  onlineNotes?: string;
  format?: string;
  types?: string[];
  id?: string;
  verified?: boolean;
  addedBy?: string;
  createdAt?: Date;
  updatedAt?: Date;
  groupId?: string;
  notes?: string;
}

export interface Group {
  id: string;
  name: string;
  description: string;
  location: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  lat?: number;
  geohash?: string;
  lng?: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  foundedDate?: Timestamp;
  memberCount: number;
  admins: string[]; // For backward compatibility
  isClaimed: boolean; // Flag to indicate if group has been claimed
  pendingAdminRequests: {
    uid: string;
    requestedAt: Timestamp;
    message?: string;
  }[]; // Array to store admin requests
  placeName?: string;
  type: "AA";
  treasurers: string[];
  treasury: {
    balance: number;
    prudentReserve: number;
    monthlyIncome: number;
    monthlyExpenses: number;
    transactions: [];
    summary: {
      balance: number;
      prudentReserve: number;
      monthlyIncome: number;
      monthlyExpenses: number;
      lastUpdated: Date;
    };
  };
  // Add field for meeting count
  meetingCount?: number;
}

// --- Helper Functions ---

/**
 * Initialize Firebase Admin SDK
 */
function initializeFirebaseAdmin(): admin.app.App {
  try {
    console.log("Initializing Firebase Admin SDK...");
    return admin.initializeApp({
      credential: admin.credential.cert(require(SERVICE_ACCOUNT_PATH)),
    });
  } catch (error: any) {
    console.error("Firebase Admin SDK initialization failed:", error);
    process.exit(1);
  }
}

/**
 * Round a coordinate to specified precision
 */
function roundCoordinate(num: number, precision: number): number {
  const factor = Math.pow(10, precision);
  return Math.round(num * factor) / factor;
}

/**
 * Normalize a string for comparison
 */
function normalizeString(str?: string): string {
  return (str || "").toLowerCase().trim();
}

/**
 * Calculate Levenshtein distance between two strings
 * This is a fairly simple fuzzy string matching algorithm
 */
function levenshteinDistance(a: string, b: string): number {
  const matrix: number[][] = [];

  // Initialize matrix
  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  // Fill matrix
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      const cost = a[j - 1] === b[i - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1, // deletion
        matrix[i][j - 1] + 1, // insertion
        matrix[i - 1][j - 1] + cost // substitution
      );
    }
  }

  return matrix[b.length][a.length];
}

/**
 * Calculate similarity score (0-100) between two strings
 */
function stringSimilarity(s1: string, s2: string): number {
  const longer = s1.length > s2.length ? s1 : s2;
  const shorter = s1.length > s2.length ? s2 : s1;

  if (longer.length === 0) {
    return 100; // Both strings are empty, perfect match
  }

  // Calculate Levenshtein distance
  const distance = levenshteinDistance(longer, shorter);

  // Calculate similarity percentage
  return Math.round((1 - distance / longer.length) * 100);
}

/**
 * Fuzzy compare two strings, normalizing and tokenizing
 * This handles word order differences and partial matches better
 */
function fuzzyCompare(
  s1: string | undefined,
  s2: string | undefined
): { score: number; isMatch: boolean } {
  // Normalize inputs
  const str1 = normalizeString(s1 || "");
  const str2 = normalizeString(s2 || "");

  if (!str1 || !str2) {
    return { score: 0, isMatch: false };
  }

  // Direct match
  if (str1 === str2) {
    return { score: 100, isMatch: true };
  }

  // For very short strings, use direct comparison
  if (str1.length < 4 || str2.length < 4) {
    const directScore = stringSimilarity(str1, str2);
    return {
      score: directScore,
      isMatch: directScore >= FUZZY_MATCH_THRESHOLD,
    };
  }

  // For longer strings, try different strategies

  // 1. Direct similarity
  const directScore = stringSimilarity(str1, str2);
  if (directScore >= FUZZY_MATCH_THRESHOLD) {
    return { score: directScore, isMatch: true };
  }

  // 2. Check if one is a substring of the other (with high similarity)
  if (str1.includes(str2) || str2.includes(str1)) {
    const containsScore = Math.min(90, directScore + 15); // Boost score but cap at 90
    if (containsScore >= FUZZY_MATCH_THRESHOLD) {
      return { score: containsScore, isMatch: true };
    }
  }

  // 3. Split into words and compare
  const words1 = str1.split(/\s+/);
  const words2 = str2.split(/\s+/);

  // Calculate word-level matches
  let wordMatches = 0;
  const totalWords = Math.max(words1.length, words2.length);

  for (const word1 of words1) {
    if (word1.length < 3) continue; // Skip very short words

    // Look for this word in words2
    const wordFound = words2.some((word2) => {
      if (word2.length < 3) return false;
      return stringSimilarity(word1, word2) >= FUZZY_PARTIAL_THRESHOLD;
    });

    if (wordFound) {
      wordMatches++;
    }
  }

  // Calculate word match score
  const wordScore = Math.round((wordMatches / totalWords) * 100);

  // Use the better of the direct or word-based scores
  const finalScore = Math.max(directScore, wordScore);

  return {
    score: finalScore,
    isMatch: finalScore >= FUZZY_MATCH_THRESHOLD,
  };
}

/**
 * Extract potential group names from meeting names using various patterns
 */
function extractGroupName(meetingName: string | undefined): string | null {
  if (!meetingName) return null;

  const normalizedName = normalizeString(meetingName);

  // Common patterns in order of confidence

  // 1. Names in quotes: "Serenity Group" Tuesday Night
  const quotedMatch = normalizedName.match(/"([^"]+)"/);
  if (quotedMatch) return quotedMatch[1];

  // 2. Group name with standard suffix: Something Group, Something Fellowship
  const groupMatch = normalizedName.match(
    /(.+?)\s+(group|fellowship|meeting|grapevine)/
  );
  if (groupMatch) return groupMatch[0];

  // 3. Before a hyphen: Serenity Group - Morning Meeting
  const hyphenMatch = normalizedName.match(/(.+?)\s+-/);
  if (hyphenMatch) return hyphenMatch[1];

  // 4. Substrings before day/time indicators
  const dayMatch = normalizedName.match(
    /(.+?)\s+(monday|tuesday|wednesday|thursday|friday|saturday|sunday|am|pm|noon)/
  );
  if (dayMatch) return dayMatch[1];

  // 5. Words likely to be part of the group name (for multi-word names)
  const parts = normalizedName.split(/\s+/);
  if (parts.length >= 3) {
    // Take first several words, as they're likely the group name
    return parts.slice(0, Math.min(4, parts.length - 1)).join(" ");
  }

  return null;
}

/**
 * Creates the data object for a new group based on a meeting
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

  // Clean up the group name - remove day/time suffixes if present
  const cleanName = normalizeString(groupName)
    .replace(
      /\b(mon|tue|wed|thu|fri|sat|sun|monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b.*$/i,
      ""
    )
    .replace(/\b\d{1,2}:\d{2}\s*(am|pm)\b.*$/i, "")
    .replace(/\s{2,}/g, " ") // Collapse multiple spaces
    .trim();

  groupName = cleanName || groupName; // Use cleaned name if valid, otherwise original

  const now = admin.firestore.Timestamp.now();

  // Initialize the group data with all required fields
  const groupData: Group = {
    id: "", // This will be set by Firestore
    name: groupName,
    // Set type properly - default to AA if undefined or not matching expected type
    type: meeting.type === "AA" ? "AA" : "AA",
    description: `${groupName} is a recovery group. This description was auto-generated.`,
    location: meeting.location || meeting.formattedAddress || "",
    address: meeting.address || meeting.street || "",
    city: meeting.city,
    state: meeting.state,
    zip: meeting.zip,
    memberCount: 0,
    meetingCount: 1, // Initialize with 1 meeting
    createdAt: now,
    updatedAt: now,
    admins: [], // Initialize with empty array
    isClaimed: false, // Mark as unclaimed by default
    pendingAdminRequests: [], // Initialize with empty array
    treasurers: [],
    treasury: {
      balance: 0,
      prudentReserve: 0,
      monthlyIncome: 0,
      monthlyExpenses: 0,
      transactions: [],
      summary: {
        balance: 0,
        prudentReserve: 0,
        monthlyIncome: 0,
        monthlyExpenses: 0,
        lastUpdated: now.toDate(),
      },
    },
  };

  // Add coordinates for in-person meetings
  if (
    !meeting.online &&
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
    }
  } else if (meeting.online && !meeting.link) {
    console.warn(
      `Cannot create online group from meeting ${
        meeting.id || meeting.name
      }: Missing link.`
    );
    return null;
  }

  return groupData;
}

/**
 * Generate a hash ID for a meeting
 */
export function generateMeetingHash(meeting: Meeting): string {
  const meetingString = [
    meeting.name?.trim() || "",
    meeting.day || "",
    meeting.time || "",
    meeting.link || "",
    meeting.formattedAddress?.trim() || "",
  ].join("|");

  const hash = crypto.createHash("sha1").update(meetingString).digest("hex");
  return hash.substring(0, 24);
}

// --- Main Script Logic ---

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function seedGroupsWithFuzzyMatching() {
  const app = initializeFirebaseAdmin();
  const db = admin.firestore(app);
  const meetingsRef = db.collection(MEETINGS_COLLECTION);
  const groupsRef = db.collection(GROUPS_COLLECTION);

  let batch = db.batch();
  let operationsInBatch = 0;
  let totalMeetingsProcessed = 0;
  let totalGroupsCreated = 0;
  let totalGroupsFound = 0;
  let totalGroupsUpdated = 0;
  let totalFuzzyMatches = 0;
  let skippedMeetings = 0;

  // Cache to map groupingKey -> groupId (avoids repeated lookups/creations)
  const groupCache = new Map<string, string>();

  console.log("Starting group seeding process with fuzzy matching...");

  try {
    // Get total meeting count for progress tracking
    let totalMeetingsSnapshot = await meetingsRef
      .where("type", "==", "AA")
      .count()
      .get();
    let totalMeetings = totalMeetingsSnapshot.data().count;
    console.log(`Found ${totalMeetings} AA meetings to process.`);

    // Stream through meetings for better memory management
    const meetingStream = meetingsRef.where("type", "==", "AA").stream();

    for await (const meetingDoc of meetingStream) {
      totalMeetingsProcessed++;
      const meetingData = (meetingDoc as any).data() as Meeting;
      meetingData.id = (meetingDoc as any).id;

      if (!meetingData.name) {
        skippedMeetings++;
        console.warn(`Skipping meeting ${meetingData.id}: Missing name`);
        continue;
      }

      // 1. Check cache first for faster processing
      if (groupCache.has(meetingData.id!)) {
        continue; // Skip if we've already processed this meeting pattern
      }

      // 2. If not cached, check Firestore for existing group
      let existingGroupId: string | undefined;
      let existingGroupData: Group | undefined;
      let fuzzyMatchScore = 0;
      let matchReason = "";

      try {
        // Query logic based on meeting type
        if (meetingData.online && meetingData.link) {
          // For online meetings, try to match by link
          const normalizedLink = meetingData.link
            .replace(/^https?:\/\//, "")
            .replace(/\/$/, "");

          const onlineQuery = groupsRef
            .where("online", "==", true)
            .where("link", "==", normalizedLink)
            .limit(1);

          const onlineSnapshot = await onlineQuery.get();

          if (!onlineSnapshot.empty) {
            existingGroupId = onlineSnapshot.docs[0].id;
            existingGroupData = onlineSnapshot.docs[0].data() as Group;
            matchReason = "link match";
          }
        }

        // If no match by link, or it's an in-person meeting...
        if (
          !existingGroupId &&
          meetingData.lat !== undefined &&
          meetingData.lng !== undefined
        ) {
          // Query by geolocation for in-person groups
          const center: [number, number] = [meetingData.lat, meetingData.lng];
          const radiusInM = CLOSE_DISTANCE_M;
          const bounds = geofire.geohashQueryBounds(center, radiusInM);

          // Extract potential group name from meeting name
          const meetingGroupName =
            extractGroupName(meetingData.name) || meetingData.name;

          // Store best match info
          let bestMatchId: string | undefined;
          let bestMatchData: Group | undefined;
          let bestMatchScore = 0;
          let bestMatchDistance = Number.MAX_VALUE;

          // Search through geohash bounds
          for (const b of bounds) {
            const query = groupsRef
              .where("online", "==", false)
              .orderBy("geohash")
              .startAt(b[0])
              .endAt(b[1]);

            const snapshot = await query.get();

            for (const doc of snapshot.docs) {
              const group = doc.data() as Group;

              // Calculate physical distance
              const distanceInKm = geofire.distanceBetween(
                [group.lat!, group.lng!],
                center
              );
              const distanceInM = distanceInKm * 1000;

              // Skip if too far
              if (distanceInM > CLOSE_DISTANCE_M) {
                continue;
              }

              // Do fuzzy name comparison
              const { score, isMatch } = fuzzyCompare(
                meetingGroupName,
                group.name
              );

              // Calculate a combined score that weighs both distance and name similarity
              const combinedScore =
                score * (1 - (distanceInM / CLOSE_DISTANCE_M) * 0.3);

              // If this is a better match than what we've found so far
              if (
                combinedScore > bestMatchScore ||
                (combinedScore === bestMatchScore &&
                  distanceInM < bestMatchDistance)
              ) {
                bestMatchId = doc.id;
                bestMatchData = group;
                bestMatchScore = combinedScore;
                bestMatchDistance = distanceInM;
              }
            }
          }

          // Check if we found a good enough match
          if (
            bestMatchId &&
            bestMatchData &&
            bestMatchScore >= FUZZY_MATCH_THRESHOLD
          ) {
            existingGroupId = bestMatchId;
            existingGroupData = bestMatchData;
            fuzzyMatchScore = bestMatchScore;
            matchReason = `fuzzy match (${Math.round(
              bestMatchScore
            )}) at ${Math.round(bestMatchDistance)}m`;
            totalFuzzyMatches++;
          }
        }

        // Decision point - use the found group or create a new one
        if (existingGroupId && existingGroupData) {
          totalGroupsFound++;
          console.log(
            `Found existing group "${existingGroupData.name}" (${existingGroupId}) for meeting "${meetingData.name}" - ${matchReason}`
          );

          groupCache.set(meetingData.id!, existingGroupId);

          // Update meeting count on the group
          const groupRef = groupsRef.doc(existingGroupId);
          batch.update(groupRef, {
            meetingCount: admin.firestore.FieldValue.increment(1),
            updatedAt: admin.firestore.Timestamp.now(),
          });
          operationsInBatch++;
          totalGroupsUpdated++;

          // Update the meeting with the group reference
          const meetingRef = meetingsRef.doc(meetingData.id!);
          batch.update(meetingRef, {
            groupId: existingGroupId,
          });
          operationsInBatch++;
        } else {
          // Create a new group
          const newGroupData = createGroupDataFromMeeting(meetingData);
          if (newGroupData) {
            totalGroupsCreated++;
            const newGroupRef = groupsRef.doc();
            console.log(
              `Creating new group "${newGroupData.name}" (${newGroupRef.id}) for meeting "${meetingData.name}"`
            );

            batch.set(newGroupRef, newGroupData);
            operationsInBatch++;

            // Update the meeting with the new group reference
            const meetingRef = meetingsRef.doc(meetingData.id!);
            batch.update(meetingRef, {
              groupId: newGroupRef.id,
            });
            operationsInBatch++;

            groupCache.set(meetingData.id!, newGroupRef.id);
          } else {
            skippedMeetings++;
          }
        }

        // Commit batch if full
        if (operationsInBatch >= BATCH_SIZE) {
          console.log(`Committing batch of ${operationsInBatch} operations...`);
          await batch.commit();
          console.log("Batch committed successfully.");
          batch = db.batch();
          operationsInBatch = 0;
        }
      } catch (error) {
        console.error(
          `Error processing meeting ${meetingData.id} "${meetingData.name}":`,
          error
        );
      }

      // Log progress periodically
      if (
        totalMeetingsProcessed % 100 === 0 ||
        totalMeetingsProcessed === totalMeetings
      ) {
        console.log(
          `Progress: ${totalMeetingsProcessed}/${totalMeetings} meetings ` +
            `(${Math.round(
              (totalMeetingsProcessed / totalMeetings) * 100
            )}%) ` +
            `| Created: ${totalGroupsCreated}, Found: ${totalGroupsFound} (Fuzzy: ${totalFuzzyMatches}), ` +
            `Skipped: ${skippedMeetings}`
        );
      }
    }

    // Commit any remaining operations
    if (operationsInBatch > 0) {
      console.log(
        `Committing final batch of ${operationsInBatch} operations...`
      );
      await batch.commit();
      console.log("Final batch committed successfully.");
    }

    console.log("\n--- Seeding Complete ---");
    console.log(`Total Meetings Processed: ${totalMeetingsProcessed}`);
    console.log(`Meetings Skipped: ${skippedMeetings}`);
    console.log(`Existing Groups Found: ${totalGroupsFound}`);
    console.log(`  - Via Fuzzy Matching: ${totalFuzzyMatches}`);
    console.log(`New Groups Created: ${totalGroupsCreated}`);
    console.log(`Groups Updated: ${totalGroupsUpdated}`);
    console.log("--------------------------\n");
  } catch (error) {
    console.error("Error in script execution:", error);
  }
}

// Execute the script
seedGroupsWithFuzzyMatching()
  .then(() => {
    console.log("Script finished successfully.");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Script failed with error:", error);
    process.exit(1);
  });

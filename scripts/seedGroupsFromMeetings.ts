// scripts/seedGroupsFromMeetings.ts

import * as admin from "firebase-admin";
import * as geofire from "geofire-common";
import * as path from "path";
import crypto from "crypto";
import * as fs from "fs";
import { Timestamp } from "firebase-admin/firestore";

// --- Configuration ---
const SERVICE_ACCOUNT_PATH = "./recovery-connect.json";
const MEETINGS_COLLECTION = "meetings";
const GROUPS_COLLECTION = "groups";
const BATCH_SIZE = 400; // Firestore batch write limit is 500
// Lower precision from 9 to 8 to capture more potential matches
// 8 is ~38m x 19m, 7 is ~153m x 153m precision
const GEOHASH_PRECISION = 8;
const ERROR_LOG_PATH = "./group_seeding_errors.log";

// Matching thresholds - adjust these based on testing results
const CONFIG = {
  // Confidence thresholds
  CONFIDENCE_THRESHOLD: 60, // Minimum confidence to create a group

  // Distance thresholds (in meters)
  VERY_CLOSE_DISTANCE_M: 20, // Very close proximity (likely same building)
  CLOSE_DISTANCE_M: 100, // Reasonable walking distance

  // Fuzzy matching thresholds (0-100)
  FUZZY_MATCH_THRESHOLD: 85, // Score threshold for considering names a match
  FUZZY_PARTIAL_THRESHOLD: 75, // Score threshold for partial word matches

  // Weights for scoring components
  DISTANCE_WEIGHT: 0.4, // Weight for physical distance
  NAME_WEIGHT: 0.6, // Weight for name similarity

  // Debug options
  VERBOSE_LOGGING: false, // Set to true for more detailed logs
};

// --- Interfaces (with clarified field documentation) ---
export class Meeting {
  name = ""; // Full meeting name
  time = ""; // Meeting start time
  street = ""; // Street address
  city?: string; // City
  state?: string; // State abbreviation
  zip?: string; // Postal/ZIP code
  // These are distinct location-related fields:
  formattedAddress?: string; // Full formatted address string
  address?: string; // Alternate structured address
  locationName?: string; // Building/venue name (e.g., "St. Mary's Church")
  location?: string; // Legacy field - general location description

  // Coordinates
  lat?: number; // Latitude
  lng?: number; // Longitude

  // Meeting details
  country?: string;
  type?: "AA" | "NA" | "IOP" | "Religious" | "Celebrate Recovery" | "CUSTOM";
  Location?: string[]; // Specific to NA meetings - location categories
  day?: string; // Day of week
  online?: boolean; // Whether meeting is online
  link?: string; // Online meeting link
  onlineNotes?: string; // Notes about online access
  format?: string; // Meeting format
  types?: string[]; // Meeting types/tags
  id?: string; // Firestore document ID
  verified?: boolean; // Whether meeting is verified
  addedBy?: string; // Who added the meeting
  createdAt?: Date; // Creation timestamp
  updatedAt?: Date; // Last update timestamp
  groupId?: string; // Reference to parent group (if assigned)
  notes?: string; // General notes
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
  lng?: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  foundedDate?: Timestamp;
  memberCount: number;
  admins: string[]; // For backward compatibility
  adminUids: string[]; // New field explicitly for admin user IDs
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
    id: string;
    groupId: string;
    balance: number;
    prudentReserve: number;
    transactions: [];
    createdAt: Date;
    updatedAt: Date;
  };
}

// Track failed meetings for logging
interface FailedMeeting {
  id: string;
  name: string;
  error: string;
  timestamp: Date;
}

// --- Helper Functions ---

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

function roundCoordinate(num: number, precision: number): number {
  const factor = Math.pow(10, precision);
  return Math.round(num * factor) / factor;
}

function normalizeString(str?: string): string {
  return (str || "").toLowerCase().trim();
}

/**
 * Creates a cache key from meeting data for more effective caching
 * This allows multiple similar meetings to map to the same group
 */
function createGroupCacheKey(meeting: Meeting): string | null {
  // For online meetings, use a different approach since online field is not used anymore
  if (meeting.link) {
    return (
      "online:" + meeting.link.replace(/^https?:\/\//, "").replace(/\/$/, "")
    );
  }

  // For in-person meetings, use rounded coordinates + potential group name
  if (meeting.lat !== undefined && meeting.lng !== undefined) {
    // Round coordinates to capture nearby meetings
    const roundedLat = roundCoordinate(meeting.lat, 3); // ~111m precision
    const roundedLng = roundCoordinate(meeting.lng, 3); // ~111m precision at equator, less elsewhere

    // Extract potential group name or use location name
    const { name } = extractGroupName(meeting.name);
    const groupNamePart = normalizeString(name || meeting.locationName || "");

    // Create a key combining location and name
    return `inperson:${roundedLat},${roundedLng}:${groupNamePart.substring(
      0,
      20
    )}`;
  }

  return null;
}

/**
 * Generates a unique hash ID for a meeting based on key properties
 * This function is retained for reference but not actively used in group creation
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

/**
 * Calculate Levenshtein distance between two strings for fuzzy matching
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
 * Extract potential group names from meeting names using various patterns
 * Note: This function uses heuristics and might not work for all meeting name formats
 */
function extractGroupName(meetingName: string): {
  name: string | null;
  confidence: number;
} {
  if (!meetingName) return { name: null, confidence: 0 };

  const normalizedName = normalizeString(meetingName);

  // 2. Specifically look for word "group" followed by modifiers like "- ONLINE" or "- IN-PERSON"
  // This is a very strong signal - high confidence
  const groupModifierMatch = normalizedName.match(
    /(.+?\s+group)\s+(-\s+(online|in-person|zoom|hybrid))/i
  );
  if (groupModifierMatch)
    return { name: groupModifierMatch[1], confidence: 90 };

  // 3. Common group name endings: Something Group, Something Fellowship
  // Also a strong signal
  const groupMatch = normalizedName.match(/(.+?)\s+(group|fellowship)/);
  if (groupMatch) return { name: groupMatch[0], confidence: 85 };

  // 4. Before the hyphen: Serenity Group - Morning Meeting
  // Moderate confidence signal
  const hyphenMatch = normalizedName.match(/(.+?)\s+-/);
  if (hyphenMatch) return { name: hyphenMatch[1], confidence: 70 };

  // 5. Group names that take a significant portion of the meeting name (if name is long enough)
  // Low confidence heuristic
  const parts = normalizedName.split(/\s+/);
  if (parts.length >= 3) {
    // Look for 2+ word combinations that might be a group name
    return {
      name: parts.slice(0, Math.min(4, parts.length - 1)).join(" "),
      confidence: 40,
    };
  }

  return { name: null, confidence: 0 };
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
      isMatch: directScore >= CONFIG.FUZZY_MATCH_THRESHOLD,
    };
  }

  // For longer strings, try different strategies

  // 1. Direct similarity
  const directScore = stringSimilarity(str1, str2);
  if (directScore >= CONFIG.FUZZY_MATCH_THRESHOLD) {
    return { score: directScore, isMatch: true };
  }

  // 2. Check if one is a substring of the other (with high similarity)
  if (str1.includes(str2) || str2.includes(str1)) {
    const containsScore = Math.min(90, directScore + 15); // Boost score but cap at 90
    if (containsScore >= CONFIG.FUZZY_MATCH_THRESHOLD) {
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
      return stringSimilarity(word1, word2) >= CONFIG.FUZZY_PARTIAL_THRESHOLD;
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
    isMatch: finalScore >= CONFIG.FUZZY_MATCH_THRESHOLD,
  };
}

/**
 * Creates the data object for a new group based on a meeting.
 * Returns null if confidence is too low.
 */
function createGroupDataFromMeeting(meeting: Meeting): {
  groupData: Group | null;
  confidence: number;
} {
  // Try to extract a group name from the meeting name with confidence
  const { name: extractedGroupName, confidence: nameConfidence } =
    extractGroupName(meeting.name);

  // Default confidence for different sources
  const locationNameConfidence = 50; // Medium confidence when using location name
  const meetingNameConfidence = 30; // Low confidence when using full meeting name

  let confidence = 0;
  let groupName = "";

  // Prioritize extracted group name, then fall back to location name or meeting name
  if (extractedGroupName) {
    groupName = extractedGroupName;
    confidence = nameConfidence;
  } else if (meeting.locationName) {
    groupName = meeting.locationName;
    confidence = locationNameConfidence;
  } else {
    groupName = meeting.name;
    confidence = meetingNameConfidence;
  }

  if (!groupName) {
    console.warn(
      `Cannot create group from meeting ${meeting.id}: Missing name/locationName.`
    );
    return { groupData: null, confidence: 0 };
  }

  // Minimum confidence threshold for group creation
  // Only proceed if we're reasonably confident this is a valid group
  if (confidence < CONFIG.CONFIDENCE_THRESHOLD) {
    if (CONFIG.VERBOSE_LOGGING) {
      console.log(
        `Skipping group creation for "${meeting.name}" - confidence too low (${confidence})`
      );
    }
    return { groupData: null, confidence };
  }

  const now = admin.firestore.Timestamp.now();

  // Create a new treasury object for the group
  const treasuryData = {
    id: crypto.randomUUID(),
    groupId: "", // Will be set after group ID is generated
    balance: 0,
    prudentReserve: 0,
    transactions: [] as [], // Explicitly typed empty array
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  // Format the location string based on available data
  const location = [
    meeting.locationName,
    meeting.address,
    meeting.city
      ? meeting.state
        ? `${meeting.city}, ${meeting.state}`
        : meeting.city
      : meeting.state,
  ]
    .filter(Boolean)
    .join(", ");

  // Create the group data with the new structure
  const groupData: Partial<Group> = {
    id: "", // Will be set after Firestore document ID is created
    name: groupName,
    description: `Group created from meeting: ${meeting.name}`,
    location: location || "Unknown location",
    address: meeting.address,
    city: meeting.city,
    state: meeting.state,
    zip: meeting.zip,
    lat: meeting.lat,
    lng: meeting.lng,
    createdAt: now,
    updatedAt: now,
    memberCount: 0,
    admins: [], // Keep for backward compatibility
    adminUids: [], // Initialize empty admin array
    isClaimed: false, // Initialize as unclaimed
    pendingAdminRequests: [], // Initialize empty requests array
    type: "AA",
    treasurers: [],
    placeName: meeting.locationName,
    treasury: treasuryData,
  };

  // Remove undefined fields before returning
  Object.keys(groupData).forEach(
    (key) =>
      groupData[key as keyof Group] === undefined &&
      delete groupData[key as keyof Group]
  );

  return { groupData: groupData as Group, confidence };
}

/**
 * Log errors to a file for later review
 */
function logError(failedMeeting: FailedMeeting): void {
  try {
    const logEntry = `[${failedMeeting.timestamp.toISOString()}] Meeting ID: ${
      failedMeeting.id
    } - Name: "${failedMeeting.name}" - Error: ${failedMeeting.error}\n`;

    fs.appendFileSync(ERROR_LOG_PATH, logEntry);
  } catch (e) {
    console.error("Failed to write to error log:", e);
  }
}

// --- Main Script Logic ---

async function seedGroups() {
  const app = initializeFirebaseAdmin();
  const db = admin.firestore(app);
  const meetingsRef = db.collection(MEETINGS_COLLECTION);
  const groupsRef = db.collection(GROUPS_COLLECTION);

  let batch = db.batch();
  let operationsInBatch = 0;
  let totalMeetingsProcessed = 0;
  let totalMeetingsSkipped = 0;
  let totalGroupsCreated = 0;
  let totalGroupsFound = 0;
  let totalGroupsNeedingUpdate = 0;
  let lowConfidenceSkips = 0;
  let alreadyAssignedSkips = 0;
  let failedMeetings: FailedMeeting[] = [];

  // Cache to map groupingKey -> groupId (more effective caching using location+name)
  const groupCache = new Map<string, string>();

  console.log("Starting group seeding process...");

  try {
    // Get total meeting count for progress tracking
    let totalMeetingsSnapshot = await meetingsRef
      .where("type", "==", "AA")
      .count()
      .get();
    let totalMeetings = totalMeetingsSnapshot.data().count;
    console.log(`Found ${totalMeetings} AA meetings to process.`);

    // Use stream to efficiently process large collections
    const meetingStream = meetingsRef.where("type", "==", "AA").stream();

    for await (const meetingDoc of meetingStream) {
      totalMeetingsProcessed++;
      const meetingData = (meetingDoc as any).data() as Meeting;
      meetingData.id = (meetingDoc as any).id; // Keep Firestore doc ID for logging

      // Skip meetings that already have a group assigned (idempotency)
      if (meetingData.groupId) {
        if (CONFIG.VERBOSE_LOGGING) {
          console.log(
            `Skipping meeting ${meetingData.id}: Already has groupId ${meetingData.groupId}`
          );
        }
        alreadyAssignedSkips++;
        continue;
      }

      // Create a cache key for more effective grouping
      const cacheKey = createGroupCacheKey(meetingData);

      if (!cacheKey) {
        totalMeetingsSkipped++;
        if (CONFIG.VERBOSE_LOGGING) {
          console.log(
            `Skipping meeting ${meetingData.id}: Cannot create cache key`
          );
        }
        continue; // Skip meetings that can't be grouped
      }

      // 1. Check cache first for more effective caching
      if (groupCache.has(cacheKey)) {
        const cachedGroupId = groupCache.get(cacheKey)!;
        if (CONFIG.VERBOSE_LOGGING) {
          console.log(
            `Cache hit for key: ${cacheKey} -> Using group ${cachedGroupId}`
          );
        }

        // Update meeting with groupId
        const meetingRef = meetingsRef.doc(meetingData.id!);
        batch.update(meetingRef, {
          groupId: cachedGroupId,
        });
        operationsInBatch++;

        // Update group to add the meeting to its meetings array
        const groupRef = groupsRef.doc(cachedGroupId);
        batch.update(groupRef, {
          updatedAt: admin.firestore.Timestamp.now(),
        });
        operationsInBatch++;

        totalGroupsFound++;

        // Commit batch if needed
        if (operationsInBatch >= BATCH_SIZE) {
          await commitBatch(batch);
          batch = db.batch();
          operationsInBatch = 0;
        }

        continue;
      }

      // 2. If not cached, check Firestore for existing group
      let existingGroupFound = false;
      let existingGroupId: string | undefined;
      let existingGroupData: Group | undefined;
      let matchConfidence = 0;

      try {
        if (
          !existingGroupFound &&
          meetingData.lat !== undefined &&
          meetingData.lng !== undefined
        ) {
          // Query nearby groups based on lat/lng
          const center: [number, number] = [meetingData.lat, meetingData.lng];
          const radiusInM = CONFIG.CLOSE_DISTANCE_M;

          // Extract potential group name from meeting name for matching
          const { name: meetingGroupName, confidence: nameConfidence } =
            extractGroupName(meetingData.name);

          // Track best match
          let bestMatchConfidence = 0;

          // Query groups with location data
          const nearbyQuery = groupsRef.where("type", "==", "AA").limit(20); // Limit to 20 potential matches

          const snapshot = await nearbyQuery.get();
          for (const doc of snapshot.docs) {
            const group = doc.data() as Group;

            // Skip groups that don't have location data
            if (!group.lat || !group.lng) continue;

            // Calculate physical distance
            const distanceInKm = geofire.distanceBetween(
              [group.lat, group.lng],
              center
            );

            // Skip if too far
            if (distanceInKm * 1000 > CONFIG.CLOSE_DISTANCE_M) continue;

            // Calculate distance confidence (0-100)
            // 100 for very close (0m), 0 for max distance (100m)
            const distanceConfidence = Math.max(0, 100 - distanceInKm * 1000);

            // Do name comparison
            let nameMatchConfidence = 0;

            // If we extracted a potential group name, check if it matches the group name
            if (meetingGroupName) {
              const { score } = fuzzyCompare(meetingGroupName, group.name);
              nameMatchConfidence = score;
            } else {
              // Compare meeting name to group name
              const { score } = fuzzyCompare(meetingData.name, group.name);
              nameMatchConfidence = score * 0.8; // Slightly lower confidence for full meeting name
            }

            // Calculate combined confidence (weighted average)
            const combinedConfidence =
              distanceConfidence * CONFIG.DISTANCE_WEIGHT +
              nameMatchConfidence * CONFIG.NAME_WEIGHT;

            // Check if this is our best match so far
            if (combinedConfidence > bestMatchConfidence) {
              bestMatchConfidence = combinedConfidence;

              // Only consider as a match if confidence is high enough
              if (combinedConfidence >= 70) {
                existingGroupFound = true;
                existingGroupId = doc.id;
                existingGroupData = group;
                matchConfidence = combinedConfidence;
              }
            }
          }
        }
        // --- End Query Logic ---

        if (existingGroupFound && existingGroupId && existingGroupData) {
          totalGroupsFound++;
          if (CONFIG.VERBOSE_LOGGING) {
            console.log(
              `Found existing group ${existingGroupId} for key: ${cacheKey} (confidence: ${matchConfidence.toFixed(
                1
              )})`
            );
          }

          // Cache the found group with our more effective cache key
          groupCache.set(cacheKey, existingGroupId);

          // Update the meeting with the groupId reference
          const meetingRef = meetingsRef.doc(meetingData.id!);
          batch.update(meetingRef, {
            groupId: existingGroupId,
          });
          operationsInBatch++;

          // Update group to add the meeting to its meetings array
          const groupRef = groupsRef.doc(existingGroupId);
          batch.update(groupRef, {
            meetings: admin.firestore.FieldValue.arrayUnion(meetingData.id!),
            updatedAt: admin.firestore.Timestamp.now(),
          });
          operationsInBatch++;

          // Update group location if it's missing
          if (!existingGroupData.lat || !existingGroupData.lng) {
            totalGroupsNeedingUpdate++;
            if (
              meetingData.lat !== undefined &&
              meetingData.lng !== undefined
            ) {
              try {
                const updates: any = {
                  lat: meetingData.lat,
                  lng: meetingData.lng,
                  updatedAt: admin.firestore.Timestamp.now(),
                };

                batch.update(groupRef, updates);
                if (CONFIG.VERBOSE_LOGGING) {
                  console.log(
                    ` -> Queued location update for group ${existingGroupId}`
                  );
                }
                operationsInBatch++;
              } catch (e) {
                console.error(
                  ` -> Error updating location for existing group ${existingGroupId}:`,
                  e
                );
              }
            }
          }
        } else {
          // 3. If no group found, create a new one if confidence is high enough
          const { groupData: newGroupData, confidence: createConfidence } =
            createGroupDataFromMeeting(meetingData);

          if (newGroupData) {
            totalGroupsCreated++;
            const newGroupRef = groupsRef.doc(); // Auto-generate ID

            // Set the ID in the group data and treasury
            newGroupData.id = newGroupRef.id;
            newGroupData.treasury.groupId = newGroupRef.id;

            console.log(
              `Creating new group "${newGroupData.name}" (${
                newGroupRef.id
              }) for meeting "${
                meetingData.name
              }" (confidence: ${createConfidence.toFixed(1)})`
            );

            batch.set(newGroupRef, newGroupData);
            operationsInBatch++;

            // Update the meeting with groupId reference
            const meetingRef = meetingsRef.doc(meetingData.id!);
            batch.update(meetingRef, {
              groupId: newGroupRef.id,
            });
            operationsInBatch++;

            // Cache the new group with our more effective cache key
            groupCache.set(cacheKey, newGroupRef.id);
          } else {
            if (createConfidence < CONFIG.CONFIDENCE_THRESHOLD) {
              lowConfidenceSkips++;
              if (CONFIG.VERBOSE_LOGGING) {
                console.log(
                  `Skipping group creation for "${
                    meetingData.name
                  }" due to low confidence (${createConfidence.toFixed(1)})`
                );
              }
            }
            totalMeetingsSkipped++; // Couldn't create group data
          }
        }

        // Commit batch if full
        if (operationsInBatch >= BATCH_SIZE) {
          await commitBatch(batch);
          batch = db.batch();
          operationsInBatch = 0;
        }
      } catch (error) {
        // Enhanced error tracking
        const errorMsg = error instanceof Error ? error.message : String(error);
        console.error(
          `Error processing meeting ${meetingData.id} "${meetingData.name}": ${errorMsg}`
        );

        // Store failed meeting for later review
        failedMeetings.push({
          id: meetingData.id || "unknown",
          name: meetingData.name || "unnamed",
          error: errorMsg,
          timestamp: new Date(),
        });

        // Log to file immediately
        logError(failedMeetings[failedMeetings.length - 1]);
      }

      // Log progress periodically
      if (
        totalMeetingsProcessed % 100 === 0 ||
        totalMeetingsProcessed === totalMeetings
      ) {
        const progressPct = Math.round(
          (totalMeetingsProcessed / totalMeetings) * 100
        );
        console.log(
          `Progress: ${totalMeetingsProcessed}/${totalMeetings} meetings (${progressPct}%) | ` +
            `Created: ${totalGroupsCreated}, Found: ${totalGroupsFound}, ` +
            `Skipped: ${totalMeetingsSkipped}, Low Confidence: ${lowConfidenceSkips}, ` +
            `Already Assigned: ${alreadyAssignedSkips}, Errors: ${failedMeetings.length}`
        );
      }
    }

    // Commit any remaining operations
    if (operationsInBatch > 0) {
      await commitBatch(batch);
    }

    console.log("\n--- Seeding Complete ---");
    console.log(`Total Meetings Processed: ${totalMeetingsProcessed}`);
    console.log(`Meetings Already Having Groups: ${alreadyAssignedSkips}`);
    console.log(
      `Meetings Skipped (Invalid Data / No Key): ${totalMeetingsSkipped}`
    );
    console.log(`Meetings Skipped (Low Confidence): ${lowConfidenceSkips}`);
    console.log(`Unique Groups Found in Firestore: ${totalGroupsFound}`);
    console.log(`New Groups Created: ${totalGroupsCreated}`);
    console.log(`Existing Groups Updated: ${totalGroupsNeedingUpdate}`);
    console.log(`Failed Meetings: ${failedMeetings.length}`);
    if (failedMeetings.length > 0) {
      console.log(`Error details logged to: ${ERROR_LOG_PATH}`);
    }
    console.log("--------------------------\n");
  } catch (error) {
    console.error("Fatal error in script execution:", error);
  }

  // Helper function to commit batch with logging
  async function commitBatch(
    batchToCommit: admin.firestore.WriteBatch
  ): Promise<void> {
    console.log(`Committing batch of ${operationsInBatch} operations...`);
    try {
      await batchToCommit.commit();
      console.log("Batch committed successfully.");
    } catch (error) {
      console.error("Error committing batch:", error);
      throw error; // Re-throw to be caught by main try/catch
    }
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

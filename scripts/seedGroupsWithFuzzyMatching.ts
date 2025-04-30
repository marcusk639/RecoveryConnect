import * as admin from "firebase-admin";
import * as geofire from "geofire-common";
import * as path from "path";
import crypto from "crypto";
import { Timestamp } from "firebase-admin/firestore";
import * as fs from "fs"; // Import fs for error logging

// --- Configuration ---
const SERVICE_ACCOUNT_PATH = "./recovery-connect.json";
const MEETINGS_COLLECTION = "meetings";
const GROUPS_COLLECTION = "groups";
const BATCH_SIZE = 400; // Firestore batch write limit is 500
const GEOHASH_PRECISION = 9;
const COORDINATE_PRECISION = 5; // Round lat/lon for cache key precision
const ERROR_LOG_PATH = "./group_seeding_errors.log"; // Path for error log file

// Fuzzy matching thresholds
const FUZZY_MATCH_THRESHOLD = 85; // Score threshold (0-100) for considering names a match
const FUZZY_PARTIAL_THRESHOLD = 75; // Score threshold for partial word matches
const VERY_CLOSE_DISTANCE_M = 20; // Distance in meters to consider "very close"
const CLOSE_DISTANCE_M = 100; // Distance in meters to consider "close" for querying
const MAX_MATCH_DISTANCE_M = 50; // Max distance in meters to consider a fuzzy match valid

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
  groupId?: string; // <<< Important for idempotency check
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
  online?: boolean;
  link?: string;
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
  type: "AA"; // Assuming AA focus for now
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
  meetingCount?: number; // Ensure this is part of your Group model
}

// Track failed meetings for logging
interface FailedMeeting {
  meetingId: string;
  meetingName: string;
  error: string;
  timestamp: Date;
}

// --- Helper Functions ---

/**
 * Converts a string to Title Case, handling acronyms and minor words.
 */
function toTitleCase(str: string): string {
  if (!str) return "";

  const minorWords = new Set([
    "a",
    "an",
    "the",
    "and",
    "but",
    "or",
    "for",
    "nor",
    "on",
    "at",
    "to",
    "from",
    "by",
    "in",
    "of",
  ]);
  const acronyms = new Set(["aa", "na", "iop"]); // Add other acronyms as needed

  return str
    .toLowerCase()
    .split(" ")
    .map((word, index, arr) => {
      if (!word) return "";

      // Keep acronyms uppercase
      if (acronyms.has(word)) {
        return word.toUpperCase();
      }

      // Handle possessives like "Men's"
      if (word.includes("'")) {
        const parts = word.split("'");
        return parts
          .map((part, partIndex) =>
            partIndex === 0
              ? part.charAt(0).toUpperCase() + part.slice(1)
              : part
          )
          .join("'");
      }

      // Capitalize if it's the first or last word, or not a minor word
      if (index === 0 || index === arr.length - 1 || !minorWords.has(word)) {
        return word.charAt(0).toUpperCase() + word.slice(1);
      }

      return word; // Keep minor words lowercase in the middle
    })
    .join(" ");
}

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
 * Log errors to a file for later review
 */
function logErrorToFile(failedMeeting: FailedMeeting): void {
  try {
    const logEntry = `[${failedMeeting.timestamp.toISOString()}] Meeting ID: ${
      failedMeeting.meetingId
    } - Name: "${failedMeeting.meetingName}" - Error: ${failedMeeting.error}\n`;
    fs.appendFileSync(ERROR_LOG_PATH, logEntry);
  } catch (e) {
    console.error("Failed to write to error log:", e);
  }
}

/**
 * NEW: Creates a cache key for grouping meetings.
 */
function createGroupCacheKey(meeting: Meeting): string | null {
  if (meeting.online && meeting.link) {
    const normalizedLink = meeting.link
      .replace(/^https?:\/\//, "")
      .replace(/\/$/, "");
    return `online|${normalizeString(normalizedLink)}`;
  } else if (meeting.lat !== undefined && meeting.lng !== undefined) {
    const roundedLat = roundCoordinate(meeting.lat, COORDINATE_PRECISION);
    const roundedLng = roundCoordinate(meeting.lng, COORDINATE_PRECISION);
    // Use locationName primarily, fallback to address or city
    const locationIdentifier =
      normalizeString(meeting.locationName) ||
      normalizeString(meeting.address) ||
      normalizeString(meeting.city);
    if (!locationIdentifier) {
      console.warn(
        `Skipping cache key generation for meeting ${
          meeting.id || meeting.name
        }: In-person meeting missing locationName, address, or city.`
      );
      return null;
    }
    return `inplace|${roundedLat}|${roundedLng}|${locationIdentifier.substring(
      0,
      50
    )}`; // Truncate identifier for key length
  } else {
    console.warn(
      `Skipping cache key generation for meeting ${
        meeting.id || meeting.name
      }: Missing required fields (link or lat/lng).`
    );
    return null;
  }
}

/**
 * Calculate Levenshtein distance between two strings
 */
function levenshteinDistance(a: string, b: string): number {
  const matrix: number[][] = [];
  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }
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
  if (longer.length === 0) return 100;
  const distance = levenshteinDistance(longer, shorter);
  return Math.round((1 - distance / longer.length) * 100);
}

/**
 * Fuzzy compare two strings
 */
function fuzzyCompare(
  s1: string | undefined,
  s2: string | undefined
): { score: number; isMatch: boolean } {
  const str1 = normalizeString(s1 || "");
  const str2 = normalizeString(s2 || "");
  if (!str1 || !str2) return { score: 0, isMatch: false };
  if (str1 === str2) return { score: 100, isMatch: true };
  if (str1.length < 4 || str2.length < 4) {
    const directScore = stringSimilarity(str1, str2);
    return {
      score: directScore,
      isMatch: directScore >= FUZZY_MATCH_THRESHOLD,
    };
  }
  const directScore = stringSimilarity(str1, str2);
  if (directScore >= FUZZY_MATCH_THRESHOLD)
    return { score: directScore, isMatch: true };
  if (str1.includes(str2) || str2.includes(str1)) {
    const containsScore = Math.min(90, directScore + 15);
    if (containsScore >= FUZZY_MATCH_THRESHOLD)
      return { score: containsScore, isMatch: true };
  }
  const words1 = str1.split(/\s+/);
  const words2 = str2.split(/\s+/);
  let wordMatches = 0;
  const totalWords = Math.max(words1.length, words2.length);
  for (const word1 of words1) {
    if (word1.length < 3) continue;
    const wordFound = words2.some((word2) => {
      if (word2.length < 3) return false;
      return stringSimilarity(word1, word2) >= FUZZY_PARTIAL_THRESHOLD;
    });
    if (wordFound) wordMatches++;
  }
  const wordScore = Math.round((wordMatches / totalWords) * 100);
  const finalScore = Math.max(directScore, wordScore);
  return { score: finalScore, isMatch: finalScore >= FUZZY_MATCH_THRESHOLD };
}

/**
 * Extract potential group names from meeting names
 */
function extractGroupName(meetingName: string | undefined): string | null {
  if (!meetingName) return null;
  const normalizedName = normalizeString(meetingName);
  const quotedMatch = normalizedName.match(/"([^"]+)"/);
  if (quotedMatch) return quotedMatch[1];
  const groupMatch = normalizedName.match(
    /(.+?)\s+(group|fellowship|meeting|grapevine)/
  );
  if (groupMatch) return groupMatch[0];
  const hyphenMatch = normalizedName.match(/(.+?)\s+-/);
  if (hyphenMatch) return hyphenMatch[1];
  const dayMatch = normalizedName.match(
    /(.+?)\s+(monday|tuesday|wednesday|thursday|friday|saturday|sunday|am|pm|noon)/
  );
  if (dayMatch) return dayMatch[1];
  const parts = normalizedName.split(/\s+/);
  if (parts.length >= 3)
    return parts.slice(0, Math.min(4, parts.length - 1)).join(" ");
  return null;
}

/**
 * REFINED: Creates the data object for a *new* group based on a meeting.
 * Focuses on essential fields derived from the first meeting encountered for this group.
 */
function createGroupDataFromMeeting(meeting: Meeting): Group | null {
  const extractedGroupName = extractGroupName(meeting.name);
  let groupName = extractedGroupName || meeting.locationName || meeting.name;

  if (!groupName) {
    console.warn(
      `Cannot create group data from meeting ${meeting.id}: Missing name/locationName.`
    );
    return null;
  }

  // Minimal name cleaning
  const cleanName = normalizeString(groupName)
    .replace(/\s{2,}/g, " ")
    .trim();
  groupName = toTitleCase(cleanName || groupName); // Apply Title Case

  const now = admin.firestore.Timestamp.now();

  // Start with a base structure including required fields
  const groupData: Omit<Group, "id"> = {
    // Omit 'id' as it's set later
    name: groupName,
    type: meeting.type === "AA" ? "AA" : "AA",
    description: `AA Meeting Group that hosts meetings such as "${meeting.name}".`,
    location: meeting.location || meeting.formattedAddress || "",
    createdAt: now,
    updatedAt: now,
    meetingCount: 1,
    isClaimed: false,
    admins: [],
    memberCount: 0,
    pendingAdminRequests: [],
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
    // Initialize other non-optional fields from Group interface here if needed
  };

  // Add optional fields based on the meeting
  if (meeting.address || meeting.street)
    groupData.address = meeting.address || meeting.street || "";
  if (meeting.city) groupData.city = meeting.city;
  if (meeting.state) groupData.state = meeting.state;
  if (meeting.zip) groupData.zip = meeting.zip;
  // if (meeting.foundedDate) groupData.foundedDate = meeting.foundedDate; // Assuming foundedDate could come from meeting? Adjust if not.

  if (
    !meeting.online &&
    meeting.lat !== undefined &&
    meeting.lng !== undefined
  ) {
    groupData.lat = meeting.lat;
    groupData.lng = meeting.lng;
    groupData.placeName = meeting.locationName;
    groupData.online = false; // Explicitly set
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
  } else if (meeting.online) {
    groupData.online = true;
    if (meeting.link) {
      groupData.link = meeting.link;
    } else {
      console.warn(
        `Cannot create online group from meeting ${
          meeting.id || meeting.name
        }: Missing link.`
      );
      return null;
    }
  } else {
    // It's an in-person meeting but lacks coordinates
    groupData.online = false;
    console.warn(
      `Creating in-person group for meeting ${
        meeting.id || meeting.name
      } without coordinates.`
    );
  }

  // The object `groupData` now conforms to `Omit<Group, 'id'>`
  // We cast to `Group` assuming the calling context handles the `id` assignment.
  return groupData as Group;
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
  db.settings({ ignoreUndefinedProperties: true });
  const meetingsRef = db.collection(MEETINGS_COLLECTION);
  const groupsRef = db.collection(GROUPS_COLLECTION);

  let batch = db.batch();
  let operationsInBatch = 0;
  let totalMeetingsProcessed = 0;
  let totalGroupsCreated = 0;
  let totalGroupsFound = 0;
  let totalGroupsUpdated = 0; // Count groups where meetingCount was incremented
  let totalFuzzyMatches = 0;
  let skippedMeetings = 0; // Meetings skipped due to missing data or already having groupId
  let failedMeetings: FailedMeeting[] = []; // Store meetings that caused errors

  // Cache maps group identity key -> groupId
  const groupCache = new Map<string, string>();

  console.log("Starting group seeding process with fuzzy matching...");

  try {
    // Clear error log at start
    if (fs.existsSync(ERROR_LOG_PATH)) {
      fs.unlinkSync(ERROR_LOG_PATH);
    }

    let totalMeetingsSnapshot = await meetingsRef
      .where("type", "==", "AA")
      .count()
      .get();
    let totalMeetings = totalMeetingsSnapshot.data().count;
    console.log(`Found ${totalMeetings} AA meetings to process.`);

    const meetingStream = meetingsRef.where("type", "==", "AA").stream();

    for await (const meetingDoc of meetingStream as AsyncIterable<admin.firestore.QueryDocumentSnapshot>) {
      totalMeetingsProcessed++;
      const meetingData = meetingDoc.data() as Meeting;
      meetingData.id = meetingDoc.id;

      // 1. Idempotency Check: Skip if meeting already has a groupId
      if (meetingData.groupId) {
        skippedMeetings++;
        continue;
      }

      if (!meetingData.name) {
        skippedMeetings++;
        const failure: FailedMeeting = {
          meetingId: meetingData.id!,
          meetingName: "N/A",
          error: "Missing name",
          timestamp: new Date(),
        };
        failedMeetings.push(failure);
        logErrorToFile(failure);
        continue;
      }

      // 2. Generate Cache Key
      const cacheKey = createGroupCacheKey(meetingData);
      if (!cacheKey) {
        skippedMeetings++;
        const failure: FailedMeeting = {
          meetingId: meetingData.id!,
          meetingName: meetingData.name,
          error: "Cannot generate cache key (missing link or lat/lng/location)",
          timestamp: new Date(),
        };
        failedMeetings.push(failure);
        logErrorToFile(failure);
        continue;
      }

      // 3. Check Cache
      if (groupCache.has(cacheKey)) {
        const cachedGroupId = groupCache.get(cacheKey)!;
        // Link meeting to cached group
        const meetingRef = meetingsRef.doc(meetingData.id!);
        batch.update(meetingRef, {
          groupId: cachedGroupId,
          updatedAt: Timestamp.now(),
        });
        operationsInBatch++;

        // Increment meeting count (best effort)
        const groupRef = groupsRef.doc(cachedGroupId);
        batch.update(groupRef, {
          meetingCount: admin.firestore.FieldValue.increment(1),
        });
        operationsInBatch++;
        totalGroupsUpdated++; // Count as an update

        // Commit batch if full
        if (operationsInBatch >= BATCH_SIZE) {
          await commitBatch(batch, operationsInBatch); // Pass count for logging
          batch = db.batch();
          operationsInBatch = 0;
        }
        continue; // Move to next meeting
      }

      // 4. If not cached, Query Firestore for BEST MATCH *before* transaction
      let existingGroupId: string | undefined;
      let existingGroupData: Group | undefined;
      let matchReason = "";
      let fuzzyMatchScore = 0;

      try {
        // --- Query Logic (Find Best Match Candidate) ---
        if (meetingData.online && meetingData.link) {
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
            matchReason = "exact link match candidate";
          }
        } else if (
          meetingData.lat !== undefined &&
          meetingData.lng !== undefined
        ) {
          const center: [number, number] = [meetingData.lat, meetingData.lng];
          const radiusInM = CLOSE_DISTANCE_M;
          const bounds = geofire.geohashQueryBounds(center, radiusInM);
          const meetingGroupName =
            extractGroupName(meetingData.name) || meetingData.name;
          let bestMatchId: string | undefined;
          let bestMatchData: Group | undefined;
          let bestMatchScore = 0;
          let bestMatchDistance = Number.MAX_VALUE;
          for (const b of bounds) {
            const query = groupsRef
              .where("online", "==", false)
              .orderBy("geohash")
              .startAt(b[0])
              .endAt(b[1]);
            const snapshot = await query.get();
            for (const doc of snapshot.docs) {
              const group = doc.data() as Group;
              if (!group.lat || !group.lng) continue;
              const distanceInKm = geofire.distanceBetween(
                [group.lat, group.lng],
                center
              );
              const distanceInM = distanceInKm * 1000;
              if (distanceInM > MAX_MATCH_DISTANCE_M) continue;
              const { score } = fuzzyCompare(meetingGroupName, group.name);
              const combinedScore =
                score * (1 - (distanceInM / MAX_MATCH_DISTANCE_M) * 0.3);
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
          if (
            bestMatchId &&
            bestMatchData &&
            bestMatchScore >= FUZZY_MATCH_THRESHOLD
          ) {
            existingGroupId = bestMatchId; // Found a candidate
            existingGroupData = bestMatchData;
            fuzzyMatchScore = bestMatchScore;
            matchReason = `fuzzy match candidate (${Math.round(
              bestMatchScore
            )}) at ${Math.round(bestMatchDistance)}m`;
            totalFuzzyMatches++; // Count potential fuzzy match
          }
        }
        // --- End Query Logic ---

        // 5. Process Results: Link to Existing (if found outside tx) OR Use Transaction to Create/Link
        if (existingGroupId && existingGroupData) {
          // Strong candidate found BEFORE transaction
          totalGroupsFound++;
          console.log(
            `Linking to existing group "${existingGroupData.name}" (${existingGroupId}) for meeting "${meetingData.name}" - ${matchReason}`
          );
          groupCache.set(cacheKey, existingGroupId); // Cache the result

          // Update meeting with groupId (using main batch)
          const meetingRef = meetingsRef.doc(meetingData.id!);
          batch.update(meetingRef, {
            groupId: existingGroupId,
            updatedAt: Timestamp.now(),
          });
          operationsInBatch++;

          // Increment meeting count on the group (using main batch)
          const groupRef = groupsRef.doc(existingGroupId);
          batch.update(groupRef, {
            meetingCount: admin.firestore.FieldValue.increment(1),
            updatedAt: admin.firestore.Timestamp.now(),
          });
          operationsInBatch++;
          totalGroupsUpdated++;
        } else {
          // 6. No strong candidate found. Prepare potential new group data BEFORE the transaction.
          const newGroupData = createGroupDataFromMeeting(meetingData);

          if (!newGroupData) {
            // Was not possible to create group data from this meeting
            skippedMeetings++;
            const failure: FailedMeeting = {
              meetingId: meetingData.id!,
              meetingName: meetingData.name,
              error: "Failed to generate group data before transaction",
              timestamp: new Date(),
            };
            failedMeetings.push(failure);
            logErrorToFile(failure);
            // Continue to the next meeting, skipping the transaction for this one
            continue;
          }

          // Use Transaction to Create or Link atomically
          await db.runTransaction(async (transaction) => {
            // Final, QUICK check within transaction using cache key components
            let finalCheckQuery;
            let queryForCreateCheck = true;
            const precalculatedIdentifier = cacheKey.startsWith("inplace|")
              ? cacheKey.split("|")[3]
              : null; // Pre-calculate for loop

            if (cacheKey.startsWith("online|")) {
              const link = cacheKey.split("|")[1];
              finalCheckQuery = groupsRef
                .where("online", "==", true)
                .where("link", "==", link)
                .limit(1);
            } else if (cacheKey.startsWith("inplace|")) {
              const parts = cacheKey.split("|");
              const lat = parseFloat(parts[1]);
              const lng = parseFloat(parts[2]);
              const bounds = geofire.geohashQueryBounds([lat, lng], 5); // 5m radius check
              finalCheckQuery = groupsRef
                .where("online", "==", false)
                .orderBy("geohash")
                .startAt(bounds[0][0])
                .endAt(bounds[0][1])
                .limit(5);
              queryForCreateCheck = false;
            } else {
              throw new Error(
                "Invalid cache key format during transaction check"
              );
            }

            const finalCheckSnapshot = await transaction.get(finalCheckQuery);
            let foundDuringTx = false;
            let concurrentGroupId: string | undefined;

            // Post-process results if querying by geohash (keep this minimal)
            if (cacheKey.startsWith("inplace|") && !finalCheckSnapshot.empty) {
              for (const doc of finalCheckSnapshot.docs) {
                const group = doc.data() as Partial<Group>;
                // Use precalculated identifier
                const groupIdentifier =
                  normalizeString(group.name) ||
                  normalizeString(group.address) ||
                  normalizeString(group.city);
                if (
                  precalculatedIdentifier &&
                  groupIdentifier &&
                  fuzzyCompare(groupIdentifier, precalculatedIdentifier).score >
                    90
                ) {
                  // High similarity check
                  foundDuringTx = true;
                  concurrentGroupId = doc.id;
                  break;
                }
              }
            } else if (!finalCheckSnapshot.empty) {
              foundDuringTx = true;
              concurrentGroupId = finalCheckSnapshot.docs[0].id;
            }
            // --- End Transaction Read Phase ---

            // --- Transaction Write Phase ---
            if (!foundDuringTx) {
              // Create New Group using pre-calculated data
              const newGroupRef = groupsRef.doc(); // Auto-generate ID
              console.log(
                `TX: Creating new group "${newGroupData.name}" (${newGroupRef.id}) for meeting "${meetingData.name}"`
              );
              // Use the pre-calculated newGroupData, adding the generated ID
              const completeGroupData = {
                ...newGroupData,
                id: newGroupRef.id,
                meetingCount: 1,
              };
              transaction.set(newGroupRef, completeGroupData);
              transaction.update(meetingsRef.doc(meetingData.id!), {
                groupId: newGroupRef.id,
                updatedAt: Timestamp.now(),
              });
              groupCache.set(cacheKey, newGroupRef.id); // Cache the new group
              totalGroupsCreated++;
            } else {
              // Link to Concurrently Created Group
              console.log(
                `TX: Group ${concurrentGroupId} created concurrently, linking meeting ${meetingData.id}`
              );
              transaction.update(meetingsRef.doc(meetingData.id!), {
                groupId: concurrentGroupId,
                updatedAt: Timestamp.now(),
              });
              transaction.update(groupsRef.doc(concurrentGroupId!), {
                meetingCount: admin.firestore.FieldValue.increment(1),
              });
              groupCache.set(cacheKey, concurrentGroupId!); // Cache the concurrently found group
              totalGroupsFound++;
              totalGroupsUpdated++;
            }
          }); // End Transaction
          operationsInBatch++; // Count transaction as one operation for batching
        }

        // 7. Commit main batch if full (outside transaction)
        if (operationsInBatch >= BATCH_SIZE) {
          await commitBatch(batch, operationsInBatch);
          batch = db.batch();
          operationsInBatch = 0;
        }
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        const failure: FailedMeeting = {
          meetingId: meetingData.id!,
          meetingName: meetingData.name,
          error: errorMsg,
          timestamp: new Date(),
        };
        console.error(
          `Error processing meeting ${failure.meetingId} "${failure.meetingName}": ${errorMsg}`
        );
        failedMeetings.push(failure);
        logErrorToFile(failure);
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
            `Skipped: ${skippedMeetings}, Updated: ${totalGroupsUpdated}, Errors: ${failedMeetings.length}`
        );
      }
    }

    // Commit any remaining operations
    if (operationsInBatch > 0) {
      await commitBatch(batch, operationsInBatch);
    }

    console.log("\n--- Seeding Complete ---");
    console.log(`Total Meetings Processed: ${totalMeetingsProcessed}`);
    console.log(
      `Meetings Skipped (No Key/Already Grouped): ${skippedMeetings}`
    );
    console.log(`Existing Groups Found & Linked: ${totalGroupsFound}`);
    console.log(`  - Via Fuzzy Matching: ${totalFuzzyMatches}`);
    console.log(`New Groups Created: ${totalGroupsCreated}`);
    console.log(
      `Groups Updated (Meeting Count Incremented): ${totalGroupsUpdated}`
    );
    console.log(`Meetings Failed Processing: ${failedMeetings.length}`);
    if (failedMeetings.length > 0) {
      console.log(`Error details logged to: ${ERROR_LOG_PATH}`);
    }
    console.log("--------------------------\n");
  } catch (error) {
    console.error("Fatal error in script execution:", error);
  }
}

// Helper function to commit batch with logging
async function commitBatch(
  batchToCommit: admin.firestore.WriteBatch,
  count: number
): Promise<void> {
  console.log(`Committing batch of ${count} operations...`);
  try {
    await batchToCommit.commit();
    console.log("Batch committed successfully.");
  } catch (error) {
    console.error("Error committing batch:", error);
    // Log details about the batch failure if possible
    throw error; // Re-throw to be caught by main try/catch
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

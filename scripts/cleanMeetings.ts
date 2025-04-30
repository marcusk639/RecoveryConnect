// scripts/cleanMeetings.ts

import * as admin from "firebase-admin";
import { Timestamp } from "firebase-admin/firestore";
import * as fs from "fs";

// --- Configuration ---
const SERVICE_ACCOUNT_PATH = "./recovery-connect.json"; // Adjust path relative to script location
const MEETINGS_COLLECTION = "meetings";
const BATCH_DELETE_SIZE = 400; // Firestore batch limit is 500
const COORDINATE_PRECISION = 5; // How many decimal places to match coordinates
const LOG_FILE = "./duplicate _meetings_deleted.log";

// --- Interfaces ---
// Ensure this matches your Firestore structure accurately
interface Meeting {
  id?: string; // Document ID
  groupId?: string; // If grouped by the previous script
  name: string;
  day?: string; // e.g., "monday", "0" etc. Needs normalization
  time?: string; // e.g., "19:00"
  lat?: number;
  lng?: number;
  link?: string | null; // Allow null for link
  address?: string;
  city?: string;
  state?: string;
  // Add any other fields present in your documents
  [key: string]: any; // Allow other fields
}

// --- Helper Functions ---

function initializeFirebaseAdmin(): admin.app.App {
  try {
    console.log("Initializing Firebase Admin SDK...");
    const serviceAccount = require(SERVICE_ACCOUNT_PATH);
    return admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  } catch (error: any) {
    console.error("Firebase Admin SDK initialization failed:", error);
    process.exit(1);
  }
}

function normalizeString(str?: string): string {
  return (str || "").toLowerCase().replace(/\s+/g, " ").trim(); // Lowercase, collapse whitespace, trim
}

function roundCoordinate(
  num: number | undefined,
  precision: number
): number | undefined {
  if (num === undefined) return undefined;
  const factor = Math.pow(10, precision);
  return Math.round(num * factor) / factor;
}

// Normalize day: convert numeric day (0-6, Sun-Sat) or full names to lowercase abbreviation
function normalizeDay(day?: string): string | null {
  if (!day) return null;
  const dayStr = String(day).toLowerCase().trim();
  const dayMap: { [key: string]: string } = {
    "0": "sun",
    sunday: "sun",
    "1": "mon",
    monday: "mon",
    "2": "tue",
    tuesday: "tue",
    "3": "wed",
    wednesday: "wed",
    "4": "thu",
    thursday: "thu",
    "5": "fri",
    friday: "fri",
    "6": "sat",
    saturday: "sat",
  };
  // Also handle abbreviated inputs
  const abbrMap: { [key: string]: string } = {
    sun: "sun",
    mon: "mon",
    tue: "tue",
    wed: "wed",
    thu: "thu",
    fri: "fri",
    sat: "sat",
  };
  return dayMap[dayStr] || abbrMap[dayStr] || null; // Return standard abbreviation or null if invalid
}

// Normalize time: Ensure HH:MM format
function normalizeTime(time?: string): string | null {
  if (!time) return null;
  const timeStr = String(time).trim();
  // Basic check for HH:MM format (can be enhanced)
  if (/^\d{1,2}:\d{2}$/.test(timeStr)) {
    const parts = timeStr.split(":");
    const hour = parts[0].padStart(2, "0");
    const minute = parts[1];
    return `${hour}:${minute}`;
  }
  // Try to parse less common formats if needed (e.g., "7pm") - requires more complex logic
  // For now, just warn if format is unexpected
  // console.warn(`Unsupported time format encountered: ${timeStr}`);
  return null; // Treat unsupported formats as invalid for key generation
}

/**
 * Generates a canonical key to identify logically duplicate meetings.
 */
function generateDuplicateCheckKey(meeting: Meeting): string | null {
  const normName = normalizeString(meeting.name);
  const normDay = normalizeDay(meeting.day);
  const normTime = normalizeTime(meeting.time);

  if (!normName || !normDay || !normTime) {
    // Missing essential info to determine uniqueness
    // console.warn(`Skipping meeting ${meeting.id}: Missing essential data (name, day, or time) for key generation. Name: ${meeting.name}, Day: ${meeting.day}, Time: ${meeting.time}`);
    return null;
  }

  // Priority 1: Use existing groupId if available (most reliable)
  if (meeting.groupId) {
    // Use a slightly more robust name check for grouped meetings if desired
    // For now, keeping it simple: group + day + time identifies the core meeting slot
    // return `GROUP|${meeting.groupId}|${normDay}|${normTime}`;              cvvvv
    // Alternative: include name if meetings within a group can have diff names but same time/day
    // return `GROUP|${meeting.groupId}|${normName}|${normDay}|${normTime}`;
  }

  // Priority 2: Online meeting link (if not grouped)
  if (meeting.link) {
    // Check specifically for link presence
    const normLink = normalizeString(meeting.link)
      .replace(/^https?:\/\//, "")
      .replace(/\/$/, "");
    // Include name for online meetings as link might be reused contextually (less likely but possible)
    return `LINK|${normLink}|${normName}|${normDay}|${normTime}`;
  }

  // Priority 3: In-person location coordinates (if not grouped and no link)
  if (meeting.lat !== undefined && meeting.lng !== undefined) {
    const lat = roundCoordinate(meeting.lat, COORDINATE_PRECISION);
    const lng = roundCoordinate(meeting.lng, COORDINATE_PRECISION);
    if (lat !== undefined && lng !== undefined) {
      // Include name for coordinate-based key as multiple groups/meetings might be at same coords
      return `COORD|${lat}|${lng}|${normName}|${normDay}|${normTime}`;
    }
  }

  // Fallback: Address string (least reliable, use as last resort)
  const locationString = normalizeString(
    `${meeting.address || ""}-${meeting.city || ""}-${meeting.state || ""}`
  );
  if (locationString && locationString !== "--") {
    return `ADDR|${locationString}|${normName}|${normDay}|${normTime}`;
  }

  // Cannot determine uniqueness
  // console.warn(`Skipping meeting ${meeting.id}: Could not determine unique location identifier (groupId, link, coordinates, or address).`);
  return null;
}

/**
 * Commits a batch of delete operations or logs them in dry run mode.
 */
async function commitDeleteBatch(
  batch: admin.firestore.WriteBatch | null, // Batch can be null in dry run
  idsToDelete: string[],
  logStream: fs.WriteStream,
  isDryRun: boolean
): Promise<void> {
  if (idsToDelete.length === 0) return;

  const action = isDryRun ? "WOULD DELETE" : "DELETING";
  console.log(`Batch: ${action} ${idsToDelete.length} duplicate meetings...`);

  // Log IDs that would be/are being deleted
  idsToDelete.forEach((id) =>
    logStream.write(`${new Date().toISOString()} - ${action}: ${id}\n`)
  );

  if (isDryRun || !batch) {
    // console.log(`(Dry Run) Skipped actual deletion of ${idsToDelete.length} documents.`);
    return; // Skip commit in dry run mode or if batch is null
  }

  // --- Actual Deletion ---
  try {
    await batch.commit();
    console.log(`Successfully deleted ${idsToDelete.length} documents.`);
    // Log confirmation (optional)
    // idsToDelete.forEach(id => logStream.write(`${new Date().toISOString()} - CONFIRMED DELETE: ${id}\n`));
  } catch (error) {
    console.error("Error committing delete batch:", error);
    idsToDelete.forEach((id) =>
      logStream.write(
        `${new Date().toISOString()} - FAILED BATCH DELETE for ID: ${id} - Error: ${error}\n`
      )
    );
    // Optionally re-throw or handle more gracefully
  }
}

// --- Main Script Logic ---

async function cleanupDuplicateMeetings() {
  // Check for --dry-run flag
  const isDryRun = process.argv.includes("--dry-run");
  if (isDryRun) {
    console.log("\n--- RUNNING IN DRY RUN MODE ---");
    console.log("--- No documents will be deleted. ---");
  } else {
    console.log("\n--- RUNNING IN LIVE DELETION MODE ---");
    console.log("--- Duplicate documents WILL be deleted. ---");
  }

  initializeFirebaseAdmin();
  const db = admin.firestore();
  const meetingsRef = db.collection(MEETINGS_COLLECTION);

  // Map to store the first encountered doc ID for each unique key
  const processedMeetings = new Map<string, string>();
  const duplicatesToDelete: string[] = [];
  let documentsProcessed = 0;
  let potentialKept = 0;
  let skippedNoKey = 0;

  // Create/clear log file
  const logStream = fs.createWriteStream(LOG_FILE, { flags: "w" });
  console.log(`Logging actions to ${LOG_FILE}`);
  logStream.write(
    `--- Duplicate Meeting Cleanup Started: ${new Date().toISOString()} --- ${
      isDryRun ? "(Dry Run)" : ""
    }\n`
  );

  console.log("Starting duplicate meeting cleanup process...");
  console.log("Streaming meetings collection...");

  try {
    const meetingStream = meetingsRef.stream();

    for await (const meetingDoc of meetingStream as AsyncIterable<admin.firestore.QueryDocumentSnapshot>) {
      documentsProcessed++;
      const meetingData = meetingDoc.data() as Meeting;
      meetingData.id = meetingDoc.id; // Store the Firestore ID

      const duplicateKey = generateDuplicateCheckKey(meetingData);

      if (!duplicateKey) {
        skippedNoKey++;
        logStream.write(
          `${new Date().toISOString()} - SKIPPED (No Key): ${
            meetingData.id
          } - ${meetingData.name}\n`
        );
        continue; // Skip meetings where key generation failed
      }

      if (processedMeetings.has(duplicateKey)) {
        // This is a duplicate, mark for deletion
        duplicatesToDelete.push(meetingData.id);
        // Log immediately which one is marked duplicate vs kept
        const keptId = processedMeetings.get(duplicateKey);
        logStream.write(
          `${new Date().toISOString()} - MARKED DUPLICATE: ${
            meetingData.id
          } (Key: ${duplicateKey}, Kept: ${keptId})\n`
        );
      } else {
        // First time seeing this key, keep this document
        processedMeetings.set(duplicateKey, meetingData.id);
        potentialKept++;
      }

      if (documentsProcessed % 1000 === 0) {
        // Log progress every 1000 docs
        console.log(
          `Processed ${documentsProcessed} documents... Found ${duplicatesToDelete.length} potential duplicates so far.`
        );
      }
    }

    console.log("\n--- Deletion Phase ---");
    console.log(`Finished processing ${documentsProcessed} documents.`);
    console.log(
      `Found ${duplicatesToDelete.length} potential duplicate documents ${
        isDryRun ? "to delete" : "for deletion"
      }.`
    );
    console.log(`Keeping ${potentialKept} unique documents.`);
    console.log(`Skipped ${skippedNoKey} documents due to missing key data.`);

    if (duplicatesToDelete.length === 0) {
      console.log("No duplicates found to delete.");
      logStream.write("--- No duplicates found ---\n");
      logStream.end(); // Close the log stream
      return;
    }

    let deleteBatch = isDryRun ? null : db.batch(); // Only create batch if not dry run
    let idsInBatch: string[] = [];
    let totalDeletedCount = 0; // Only count actual deletions if not dry run

    for (let i = 0; i < duplicatesToDelete.length; i++) {
      const docId = duplicatesToDelete[i];
      idsInBatch.push(docId); // Add ID to current batch list (for logging)

      if (!isDryRun && deleteBatch) {
        const docRef = meetingsRef.doc(docId);
        deleteBatch.delete(docRef); // Add delete operation to Firestore batch if not dry run
      }

      // Commit when batch is full OR it's the last item
      if (
        idsInBatch.length >= BATCH_DELETE_SIZE ||
        i === duplicatesToDelete.length - 1
      ) {
        await commitDeleteBatch(deleteBatch, idsInBatch, logStream, isDryRun);
        if (!isDryRun) {
          totalDeletedCount += idsInBatch.length; // Increment actual delete count
        }
        // Reset for next batch
        if (!isDryRun) {
          deleteBatch = db.batch(); // Start a new batch only if not dry run
        }
        idsInBatch = []; // Reset batch list
        // Add delay only if actually deleting and not the last batch
        if (!isDryRun && i < duplicatesToDelete.length - 1) {
          await new Promise((resolve) => setTimeout(resolve, 60)); // Slightly longer delay
        }
      }
    }

    console.log(`\n--- Cleanup Complete ${isDryRun ? "(Dry Run)" : ""} ---`);
    console.log(`Total Documents Processed: ${documentsProcessed}`);
    console.log(`Unique Documents Kept: ${potentialKept}`);
    console.log(`Documents Skipped (Missing Key Data): ${skippedNoKey}`);
    if (isDryRun) {
      console.log(
        `Documents that WOULD BE Deleted: ${duplicatesToDelete.length}`
      );
    } else {
      console.log(`Duplicate Documents Deleted: ${totalDeletedCount}`);
    }
    console.log(`See ${LOG_FILE} for details.`);
    logStream.write(
      `--- Duplicate Meeting Cleanup Finished: ${new Date().toISOString()} --- ${
        isDryRun ? "(Dry Run)" : ""
      }\n`
    );
    logStream.write(
      `Total Processed: ${documentsProcessed}, Kept: ${potentialKept}, ${
        isDryRun ? "Would Delete" : "Deleted"
      }: ${
        isDryRun ? duplicatesToDelete.length : totalDeletedCount
      }, Skipped (No Key): ${skippedNoKey}\n`
    );
  } catch (error) {
    console.error("Fatal error during script execution:", error);
    logStream.write(`${new Date().toISOString()} - FATAL ERROR: ${error}\n`);
  } finally {
    logStream.end(); // Ensure log stream is closed
  }
}

// Execute the script
cleanupDuplicateMeetings()
  .then(() => {
    console.log("Script finished.");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Script failed:", error);
    process.exit(1);
  });

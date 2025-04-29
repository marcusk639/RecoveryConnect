import { Firestore, FieldValue, Timestamp } from "@google-cloud/firestore";
import axios from "axios";
import * as admin from "firebase-admin";
import * as path from "path";
import * as ngeohash from "ngeohash"; // Import ngeohash
import * as crypto from "crypto"; // Import crypto module

// --- Configuration ---
const SERVICE_ACCOUNT_PATH = "./recovery-connect.json"; // Ensure this env var is set
const FIRESTORE_COLLECTION = "meetings";
const MEETING_GUIDE_API_URL = "https://api.meetingguide.org/app/v2/request"; // Using the correct v2 URL
const BATCH_SIZE = 400; // Firestore batch write limit is 500, stay below it
const DELAY_MS = 500; // Delay between API calls to avoid rate limiting
const RETRY_LIMIT = 3;
const RETRY_DELAY_MS = 1000;
const GEOHASH_PRECISION = 9; // Geohash precision level

// Continental US Bounding Box (approximate)
const LAT_MIN = 24.0;
const LAT_MAX = 49.0;
const LON_MIN = -125.0;
const LON_MAX = -67.0;
const STEP = 0.25; // Grid step in degrees - adjust for desired overlap/coverage

// Keep track of processed *generated* meeting IDs in this run to avoid duplicate batch writes
const processedMeetingHashIds = new Set<string>();

export const daysOfWeek = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
];

// Define the structure expected from the Meeting Guide API
// Based on https://github.com/meeting-guide/api/blob/main/src/sync/sources/app.php
interface ApiMeeting {
  id: string; // API's internal ID, not used for Firestore ID anymore
  name: string;
  slug?: string;
  notes?: string;
  formatted_address?: string;
  updated?: string; // ISO 8601 string e.g. "2024-07-15 18:08:39" - needs parsing
  url?: string;
  time?: string; // "HH:MM"
  end_time?: string; // "HH:MM"
  day?: string; // "0" (Sun) to "6" (Sat)
  types?: string; // e.g., "Closed, Big Book, Step"
  location?: string; // Building name
  address?: string; // Street
  city?: string;
  state?: string; // Abbreviation e.g., "TX"
  postal_code?: string;
  country?: string; // Abbreviation e.g., "US"
  latitude?: string;
  longitude?: string;
  approximate?: boolean;
  location_notes?: string;
  group?: string; // Group name associated with meeting
  district?: string;
  conference_url?: string;
  conference_url_notes?: string;
  conference_phone?: string;
  conference_phone_notes?: string;
  timezone?: string; // e.g., "America/New_York"
  venmo?: string; // Added based on API source exploration
  square?: string; // Added based on API source exploration
  paypal?: string; // Added based on API source exploration
  // Potentially other fields like regions, sub_region etc.
}

// Define the target Firestore Meeting structure using the class
class Meeting {
  name = "";
  time = "";
  address?: string; // Using address for the full string from API
  city?: string;
  state?: string;
  street?: string;
  zip?: string;
  formattedAddress?: string;
  types?: string;
  lat?: number;
  lng?: number;
  geohash?: string; // Added for geohashing
  country?: string;
  locationName?: string; // Building Name / Location details from API
  type?: "AA"; // Hardcoding for this script
  day?: string; // Store as string "0"-"6"
  online?: boolean;
  link?: string;
  onlineNotes?: string;
  format: string = ""; // Comma-separated string of types
  id?: string; // Our generated hash ID
  apiId?: string; // Store the original API ID for reference
  notes?: string; // Meeting notes
  locationNotes?: string; // Location-specific notes
  groupName?: string; // Group name associated with meeting
  district?: string;
  timezone?: string;
  venmo?: string;
  square?: string;
  paypal?: string;
  // Fields set by script
  verified?: boolean;
  addedBy?: string;
  createdAt?: Date;
  updatedAt?: Date; // Corresponds to API 'updated' field
}

// --- Helper Functions ---

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Function to initialize Firebase Admin SDK
function initializeFirebaseAdmin(): admin.app.App {
  if (!SERVICE_ACCOUNT_PATH) {
    throw new Error(
      "GOOGLE_APPLICATION_CREDENTIALS environment variable is not set."
    );
  }
  const serviceAccount = require(path.resolve(SERVICE_ACCOUNT_PATH));
  console.log("Initializing Firebase Admin SDK...");
  return admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

/**
 * Generates a unique hash ID for a meeting based on key properties using SHA-1.
 * @param meeting The meeting object to generate a hash for.
 * @returns A 24-character hexadecimal string hash.
 */
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

// Function to fetch meetings from the API with retries
async function fetchMeetingsFromApi(
  lat: number,
  lon: number
): Promise<ApiMeeting[]> {
  const url = `${MEETING_GUIDE_API_URL}?latitude=${lat}&longitude=${lon}`;
  let attempts = 0;
  while (attempts < RETRY_LIMIT) {
    try {
      const response = await axios.get<{ meetings: ApiMeeting[] }>(url, {
        timeout: 10000,
      }); // 10 second timeout
      return response.data.meetings || []; // Return empty array if data is null/undefined
    } catch (error: any) {
      attempts++;
      console.warn(
        `Error fetching meetings for ${lat}, ${lon} (Attempt ${attempts}/${RETRY_LIMIT}): ${error.message}`
      );
      if (axios.isAxiosError(error) && error.response) {
        console.warn(`API Response Status: ${error.response.status}`);
        // Handle specific status codes if needed (e.g., 429 for rate limit)
      }
      if (attempts >= RETRY_LIMIT) {
        console.error(
          `Failed to fetch meetings for ${lat}, ${lon} after ${RETRY_LIMIT} attempts.`
        );
        return []; // Return empty on final failure
      }
      await sleep(RETRY_DELAY_MS * Math.pow(2, attempts - 1)); // Exponential backoff
    }
  }
  return []; // Should not be reached, but satisfies TS
}

// Function to map API data to Firestore Meeting class instance
function mapApiToFirestore(apiMeeting: ApiMeeting): Meeting | null {
  if (
    !apiMeeting.id ||
    !apiMeeting.name ||
    !apiMeeting.latitude ||
    !apiMeeting.longitude
  ) {
    console.warn(
      `Skipping meeting due to missing critical data (id, name, lat, lon): ${JSON.stringify(
        apiMeeting
      )}`
    );
    return null;
  }

  // Basic validation and type conversion
  const latitude = parseFloat(apiMeeting.latitude);
  const longitude = parseFloat(apiMeeting.longitude);
  if (isNaN(latitude) || isNaN(longitude)) {
    console.warn(
      `Skipping meeting due to invalid lat/lon: ${apiMeeting.id} (${apiMeeting.name})`
    );
    return null;
  }

  // Validate day string ("monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday")
  let validDay: string | undefined = undefined;
  if (apiMeeting.day !== undefined && apiMeeting.day !== null) {
    const dayNum = parseInt(apiMeeting.day, 10);
    if (!isNaN(dayNum) && dayNum >= 0 && dayNum <= 6) {
      validDay = daysOfWeek[dayNum];
    } else {
      console.warn(
        `Invalid day format for meeting ${apiMeeting.id}: ${apiMeeting.day}`
      );
    }
  }

  let parsedUpdatedAt: Date | undefined = undefined;
  if (apiMeeting.updated) {
    try {
      // Attempt to parse the date string (might need adjustments based on exact format)
      const updatedDate = new Date(apiMeeting.updated.replace(" ", "T") + "Z"); // Assume UTC if no offset
      if (!isNaN(updatedDate.getTime())) {
        parsedUpdatedAt = updatedDate;
      } else {
        console.warn(
          `Invalid updated date format for meeting ${apiMeeting.id}: ${apiMeeting.updated}`
        );
      }
    } catch (e) {
      console.warn(
        `Error parsing updated date for meeting ${apiMeeting.id}: ${apiMeeting.updated}`,
        e
      );
    }
  }

  const meeting = new Meeting();

  // Populate the Meeting instance first
  meeting.name = apiMeeting.name;
  meeting.time =
    apiMeeting.time?.substring(0, apiMeeting.time?.lastIndexOf(":")) || "";
  meeting.street = apiMeeting.address;
  meeting.address = `${apiMeeting.address}, ${apiMeeting.city}, ${apiMeeting.state} ${apiMeeting.postal_code}`;
  meeting.city = apiMeeting.city;
  meeting.state = apiMeeting.state;
  meeting.zip = apiMeeting.postal_code;
  meeting.types = apiMeeting.types || "";
  meeting.lat = latitude;
  meeting.lng = longitude;
  meeting.geohash = ngeohash.encode(latitude, longitude, GEOHASH_PRECISION); // Add geohash
  meeting.country = apiMeeting.country;
  meeting.locationName = apiMeeting.location;
  meeting.type = "AA";
  meeting.day = validDay;
  meeting.formattedAddress = apiMeeting.formatted_address;
  meeting.online = !!(
    apiMeeting.conference_url ||
    apiMeeting.conference_phone ||
    apiMeeting.types?.includes("ONL") ||
    apiMeeting.types?.includes("HYB")
  );
  meeting.link = apiMeeting.conference_url;
  meeting.onlineNotes =
    apiMeeting.conference_url_notes || apiMeeting.conference_phone_notes;
  meeting.format = apiMeeting.types || "";
  meeting.apiId = apiMeeting.id; // Store original API ID for reference
  meeting.notes = apiMeeting.notes;
  meeting.locationNotes = apiMeeting.location_notes;
  meeting.groupName = apiMeeting.group;
  meeting.district = apiMeeting.district;
  meeting.timezone = apiMeeting.timezone;
  meeting.venmo = apiMeeting.venmo;
  meeting.square = apiMeeting.square;
  meeting.paypal = apiMeeting.paypal;
  // Fields set by script
  meeting.verified = true;
  meeting.addedBy = "script:meeting-guide";
  meeting.createdAt = new Date();
  meeting.updatedAt = parsedUpdatedAt || meeting.createdAt; // Use parsed date, fallback to createdAt

  // Now generate the hash ID *from* the populated meeting object
  meeting.id = generateMeetingHash(meeting);

  // Convert class instance to a plain object for Firestore batch write
  // This also implicitly handles removing undefined optional fields
  const meetingObject = { ...meeting };

  return meetingObject as Meeting; // Cast back for type consistency if needed
}

/**
 * Removes properties with undefined values from an object.
 * @param obj The object to clean.
 * @returns A new object with undefined properties removed.
 */
function removeUndefinedProperties(
  obj: Record<string, any>
): Record<string, any> {
  const cleaned: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined) {
      cleaned[key] = value;
    }
  }
  return cleaned;
}

// --- Main Script Logic ---

async function populateMeetings() {
  const app = initializeFirebaseAdmin();
  const db = admin.firestore(app);
  // db.settings({ ignoreUndefinedProperties: true }); // Keep or remove based on preference
  const meetingsCollection = db.collection(FIRESTORE_COLLECTION);
  let batch = db.batch();
  let meetingsInBatch = 0;
  let totalMeetingsFetched = 0;
  let totalMeetingsProcessed = 0;
  let totalNewMeetingsStored = 0;
  let apiCallCount = 0;

  console.log(
    `Starting meeting population for US (Lat: ${LAT_MIN}-${LAT_MAX}, Lon: ${LON_MIN}-${LON_MAX}, Step: ${STEP})...`
  );

  for (let lat = LAT_MIN; lat <= LAT_MAX; lat += STEP) {
    for (let lon = LON_MIN; lon <= LON_MAX; lon += STEP) {
      apiCallCount++;
      console.log(
        `[${new Date().toISOString()}] Fetching meetings for Lat: ${lat.toFixed(
          4
        )}, Lon: ${lon.toFixed(4)} (Call #${apiCallCount})`
      );

      const apiMeetings = await fetchMeetingsFromApi(lat, lon);
      totalMeetingsFetched += apiMeetings.length;

      if (apiMeetings.length > 0) {
        console.log(` -> Fetched ${apiMeetings.length} meetings.`);
        for (const apiMeeting of apiMeetings) {
          const mappedMeetingData = mapApiToFirestore(apiMeeting);

          if (mappedMeetingData && mappedMeetingData.id) {
            if (!processedMeetingHashIds.has(mappedMeetingData.id)) {
              processedMeetingHashIds.add(mappedMeetingData.id);

              // Clean the object before adding to batch
              const cleanedMeetingData =
                removeUndefinedProperties(mappedMeetingData);

              const docRef = meetingsCollection.doc(mappedMeetingData.id);

              console.log("Adding meeting to batch:", cleanedMeetingData.id);
              // Use the cleaned object for the batch operation
              batch.set(docRef, cleanedMeetingData, { merge: true });

              meetingsInBatch++;
              totalNewMeetingsStored++;

              if (meetingsInBatch >= BATCH_SIZE) {
                try {
                  console.log(
                    `Committing batch of ${meetingsInBatch} meetings...`
                  );
                  await batch.commit();
                  totalMeetingsProcessed += meetingsInBatch;
                  console.log("Batch committed successfully.");
                } catch (error) {
                  console.error("Error committing batch:", error);
                } finally {
                  batch = db.batch();
                  meetingsInBatch = 0;
                }
              }
            }
          } else {
            if (!mappedMeetingData) {
              // Logged in mapApiToFirestore
            } else {
              console.warn(
                `Generated meeting data missing ID for API meeting: ${apiMeeting.id}`
              );
            }
          }
        }
      } else {
        console.log(` -> No meetings found for this location.`);
      }

      // Delay between API calls
      await sleep(DELAY_MS);
    }
    console.log(`Completed latitude band ${lat.toFixed(4)}.`);
  }

  // Commit any remaining meetings in the last batch
  if (meetingsInBatch > 0) {
    try {
      console.log(`Committing final batch of ${meetingsInBatch} meetings...`);
      await batch.commit();
      console.log("Final batch committed successfully.");
    } catch (error) {
      console.error("Error committing final batch:", error);
    }
  }

  console.log("\n--- Population Complete ---");
  console.log(`Total API Calls: ${apiCallCount}`);
  console.log(`Total Meetings Fetched from API: ${totalMeetingsFetched}`);
  console.log(`Total Meetings Processed: ${totalMeetingsProcessed}`);
  console.log(
    `Total Unique Meetings Stored/Updated in this run (based on generated hash): ${totalNewMeetingsStored}`
  );
  console.log("---------------------------\n");

  // Optional: Clean up Firebase app instance if needed
  // await app.delete();
}

// Execute the script
populateMeetings()
  .then(() => {
    console.log("Script finished successfully.");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Script failed with error:", error);
    process.exit(1);
  });

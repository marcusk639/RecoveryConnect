import * as functions from "firebase-functions";
import {
  getNarcoticsAnoymousMeetings,
  getAll12StepMeetings,
  getCustomMeetings,
  getAlcoholicsAnonymousMeetings,
} from "../utils/meetings"; // Assuming meetings utils are one level up
import {
  Meeting,
  MeetingSearchCriteria,
  MeetingType,
} from "../entities/Meeting";

// Define input type again for clarity within this file
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

// Define filter type again
export type MeetingTypeFilters =
  | "AA"
  | "NA"
  | "AL-ANON"
  | "Religious"
  | "Custom"
  | "all"
  | "Celebrate Recovery";

export const findMeetings = functions.https.onCall(async (request) => {
  // Keep the original function logic here...
  try {
    const meetingInput = request.data as MeetingSearchInput;
    const meetingPromises: Promise<Meeting[]>[] = [];
    const start = Date.now();
    const dayFilter = meetingInput.filters?.day?.toLowerCase();

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
      // ... other type checks ...
      if (meetingInput.filters.type === "NA") {
        const naMeetings = getNarcoticsAnoymousMeetings(
          meetingInput.filters.location,
          meetingInput.criteria,
          dayFilter
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
        dayFilter
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

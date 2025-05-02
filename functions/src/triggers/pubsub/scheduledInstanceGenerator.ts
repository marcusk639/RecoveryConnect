import * as functionsV1 from "firebase-functions/v1";
import * as functions from "firebase-functions";
import moment from "moment-timezone";
import { db } from "../../utils/firebase";
import { MeetingDocument } from "../../entities/Meeting";
import { generateInstancesForMeeting } from "../../utils/meetingUtils";

export const generateMonthlyMeetingInstances = functionsV1.pubsub // Renamed for clarity
  .schedule("0 0 1 * *") // Run 1st day of month at 00:00 UTC
  .timeZone("UTC")
  .onRun(async (context) => {
    functions.logger.info("Starting monthly meeting instance generation...");
    const today = moment.utc();
    const nextMonthEnd = moment.utc().add(1, "month").endOf("month");

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
            .collection("homegroups-meetings")
            .where("groupId", "==", groupId)
            .get();

          if (meetingsSnapshot.empty) return;

          for (const meetingDoc of meetingsSnapshot.docs) {
            try {
              const count = await generateInstancesForMeeting(
                meetingDoc.id,
                meetingDoc.data() as MeetingDocument,
                today, // Generate starting from today
                nextMonthEnd, // Generate up to the end of next month
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
        "Error in generateMonthlyMeetingInstances job:",
        error
      );
      return null;
    }
  });

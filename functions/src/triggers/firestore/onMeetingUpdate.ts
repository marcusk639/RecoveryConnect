import * as functionsV1 from "firebase-functions/v1";
import * as admin from "firebase-admin";
import * as functions from "firebase-functions";
import moment from "moment-timezone";
import { db } from "../../utils/firebase";
import {
  MeetingDocument,
  MeetingInstanceDocument,
} from "../../entities/Meeting";
import { generateInstancesForMeeting } from "../../utils/meetingUtils";

export const updateFutureMeetingInstances = functionsV1.firestore
  .document("meetings/{meetingId}")
  .onUpdate(async (change, context) => {
    const meetingId = context.params.meetingId;
    const newData = change.after.data() as MeetingDocument | undefined;
    const previousData = change.before.data() as MeetingDocument | undefined;

    if (!newData || !newData.updatedAt || !newData.groupId) {
      functions.logger.error(`Missing data for updated meeting ${meetingId}`);
      return null;
    }

    const newTs = newData.updatedAt;
    const prevTs = previousData?.updatedAt;

    if (
      newTs &&
      prevTs &&
      typeof newTs.isEqual === "function" &&
      newTs.isEqual(prevTs)
    ) {
      functions.logger.info(
        `Meeting ${meetingId} timestamp unchanged. No propagation needed.`
      );
      return null;
    }

    const dayChanged = newData.day !== previousData?.day;
    const timeChanged = newData.time !== previousData?.time;
    const shouldRegenerate = dayChanged || timeChanged;

    const now = admin.firestore.Timestamp.now();
    const futureInstancesQuery = db
      .collection("meetingInstances")
      .where("meetingId", "==", meetingId)
      .where("scheduledAt", ">=", now);

    try {
      if (shouldRegenerate) {
        functions.logger.info(
          `Regenerating future instances for meeting ${meetingId} due to day/time change.`
        );
        const snapshotToDelete = await futureInstancesQuery.get();
        if (!snapshotToDelete.empty) {
          let deleteBatch = db.batch();
          let deleteCount = 0;
          snapshotToDelete.forEach((doc) => {
            deleteBatch.delete(doc.ref);
            deleteCount++;
            if (deleteCount % 450 === 0) {
              deleteBatch
                .commit()
                .catch((err) =>
                  functions.logger.error("Batch delete error:", err)
                );
              deleteBatch = db.batch();
            }
          });
          await deleteBatch.commit();
          functions.logger.info(
            `Deleted ${deleteCount} old future instances for meeting ${meetingId}.`
          );
        }

        const groupDoc = await db
          .collection("groups")
          .doc(newData.groupId)
          .get();
        const groupTimezone = groupDoc.data()?.timezone || "UTC";
        const startDate = moment.utc();
        const endDate = moment.utc().add(4, "weeks"); // Regenerate for 4 weeks
        await generateInstancesForMeeting(
          meetingId,
          newData,
          startDate,
          endDate,
          groupTimezone,
          db
        );
      } else {
        functions.logger.info(
          `Propagating non-schedule changes to future instances for meeting ${meetingId}.`
        );
        const instancesSnapshot = await futureInstancesQuery.get();
        if (instancesSnapshot.empty) return null;

        let updateBatch = db.batch();
        let updatedCount = 0;
        const BATCH_LIMIT = 450;

        instancesSnapshot.forEach((doc) => {
          const updatePayload: Partial<MeetingInstanceDocument> = {
            name: newData.name,
            type: newData.type,
            format: newData.format ?? null,
            location: newData.location ?? null,
            address: newData.address ?? null,
            city: newData.city ?? null,
            state: newData.state ?? null,
            zip: newData.zip ?? null,
            lat: newData.lat ?? null,
            lng: newData.lng ?? null,
            locationName: newData.locationName ?? null,
            isOnline: newData.isOnline ?? false,
            link: newData.onlineLink ?? null,
            onlineNotes: newData.onlineNotes ?? null,
            templateUpdatedAt: newData.updatedAt,
          };

          Object.keys(updatePayload).forEach(
            (key) =>
              (updatePayload as any)[key] === undefined &&
              delete (updatePayload as any)[key]
          );

          if (Object.keys(updatePayload).length > 0) {
            updateBatch.update(doc.ref, updatePayload);
            updatedCount++;
            if (updatedCount % BATCH_LIMIT === 0) {
              updateBatch
                .commit()
                .catch((err) =>
                  functions.logger.error("Batch update error:", err)
                );
              updateBatch = db.batch();
            }
          }
        });

        if (updatedCount % BATCH_LIMIT !== 0 && updatedCount > 0) {
          await updateBatch.commit();
        }
        functions.logger.info(
          `Successfully propagated updates to ${updatedCount} future instances for meeting ${meetingId}.`
        );
      }
      return { success: true };
    } catch (error) {
      functions.logger.error(
        `Error processing update trigger for meeting ${meetingId}:`,
        error
      );
      return null;
    }
  });

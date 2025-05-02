// This is the main entry point for Cloud Functions for Firebase.
// It should only import and re-export functions from other files.

// Initialize Firebase Admin SDK *once* globally (usually implicitly via first import)
// We ensure it's initialized in utils/firebase.ts
import dotenv from "dotenv";

dotenv.config();

import "./utils/firebase";

// --- Callable Functions --- (Exported for client SDKs to call)
export { findMeetings } from "./callable/findMeetings";
export { generateGroupInvite } from "./callable/generateGroupInvite";
export { sendGroupInviteEmail } from "./callable/sendGroupInviteEmail";
export { joinGroupByInviteCode } from "./callable/joinGroupByInviteCode";
export { sendMentionNotifications } from "./callable/sendMentionNotifications";
export { setUserAsSuperAdmin } from "./callable/setUserAsSuperAdmin";
export { createStripeCheckoutSession } from "./callable/createStripeCheckoutSession";
export { createStripePaymentIntent } from "./callable/createStripePaymentIntent";
export { createStripeAccountLink } from "./callable/createStripeAccountLink";
export { searchGroupsByLocation } from "./callable/searchGroupsByLocation";

// --- HTTP Request Functions --- (Exported as endpoints)
export { stripeWebhook } from "./http/stripeWebhook";

// --- Firestore Trigger Functions --- (Exported for background triggers)
export {
  onGroupCreateSetGeolocation,
  onGroupCreateFetchMeetings,
} from "./triggers/firestore/onGroupCreate";
export { updateFutureMeetingInstances } from "./triggers/firestore/onMeetingUpdate";

// --- Pub/Sub Scheduled Functions --- (Exported for scheduled execution)
export { generateMonthlyMeetingInstances } from "./triggers/pubsub/scheduledInstanceGenerator";

// --- Potentially other exports if needed ---
// Example: If you had other types of triggers like Auth triggers
// export * from "./triggers/auth/onUserCreate";

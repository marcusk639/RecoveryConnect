import * as functions from "firebase-functions";
import Stripe from "stripe";
import dotenv from "dotenv";

dotenv.config();

// --- Environment Variable Names (Use uppercase by convention) ---
const STRIPE_TEST_SECRET_KEY_ENV = "STRIPE_TEST_SECRET_KEY"; // Use test key for development, live for production
const STRIPE_TEST_WEBHOOK_SECRET_ENV = "STRIPE_TEST_WEBHOOK_SECRET";
const STRIPE_TEST_PRICE_ID_BASE_ENV = "STRIPE_TEST_PRICE_ID_BASE";
const STRIPE_TEST_PRICE_ID_MEMBER_ENV = "STRIPE_TEST_PRICE_ID_MEMBER";

// Retrieve configuration securely from process.env
const stripeSecretKey = process.env[STRIPE_TEST_SECRET_KEY_ENV];
const webhookSecret = process.env[STRIPE_TEST_WEBHOOK_SECRET_ENV];
const priceIdBase = process.env[STRIPE_TEST_PRICE_ID_BASE_ENV];
const priceIdMember = process.env[STRIPE_TEST_PRICE_ID_MEMBER_ENV];

// Basic validation
if (!stripeSecretKey) {
  console.error(
    `Stripe secret key (${STRIPE_TEST_SECRET_KEY_ENV}) not configured in Firebase environment variables.`
  );
  // Throw error during initialization if essential keys are missing
  throw new Error(
    `Stripe secret key (${STRIPE_TEST_SECRET_KEY_ENV}) is not configured.`
  );
}
if (!webhookSecret) {
  console.warn(
    `Stripe webhook secret (${STRIPE_TEST_WEBHOOK_SECRET_ENV}) is not configured. Webhook verification will fail.`
  );
  // Depending on your logic, you might want to throw an error here too
}
if (!priceIdBase || !priceIdMember) {
  console.warn(
    `Stripe Price IDs (${STRIPE_TEST_PRICE_ID_BASE_ENV}, ${STRIPE_TEST_PRICE_ID_MEMBER_ENV}) are not fully configured.`
  );
  // Depending on your logic, you might want to throw an error here too
}

// Initialize Stripe instance
const stripe = new Stripe(stripeSecretKey, {
  // Use the variable read from process.env
  apiVersion: "2025-03-31.basil", // Use the version compatible with your @types/stripe
  typescript: true,
});

// Export the initialized instance and config values
export {
  stripe,
  webhookSecret,
  priceIdBase,
  priceIdMember,
  // Exporting the env var names can be useful for setting them
  STRIPE_TEST_SECRET_KEY_ENV,
  STRIPE_TEST_WEBHOOK_SECRET_ENV,
  STRIPE_TEST_PRICE_ID_BASE_ENV,
  STRIPE_TEST_PRICE_ID_MEMBER_ENV,
};

import * as functions from "firebase-functions";
import { stripe, webhookSecret } from "../utils/stripe"; // Import stripe instance and secret
import Stripe from "stripe";
import {
  handleCheckoutSessionCompleted,
  handleInvoicePaymentSucceeded,
  handleInvoicePaymentFailed,
  handleSubscriptionUpdated,
  handleSubscriptionDeleted,
} from "../utils/stripeUtils"; // Import webhook handlers

// Define the webhook handler using functions.https.onRequest
export const stripeWebhook = functions.https.onRequest(async (req, res) => {
  if (!webhookSecret) {
    console.error("Stripe webhook secret not configured.");
    res.status(500).send("Webhook secret not configured.");
    return;
  }

  const sig = req.headers["stripe-signature"] as string;
  let event: Stripe.Event;

  try {
    // Use the imported stripe instance and webhookSecret
    event = stripe.webhooks.constructEvent(req.rawBody, sig, webhookSecret);
  } catch (err: any) {
    console.error("Webhook signature verification failed.", err.message);
    res.status(400).send(`Webhook Error: ${err.message}`);
    return;
  }

  console.log(`Received Stripe event: ${event.type}`);

  // Handle the event by calling the appropriate helper function
  try {
    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutSessionCompleted(
          event.data.object as Stripe.Checkout.Session
        );
        break;
      case "invoice.payment_succeeded":
        await handleInvoicePaymentSucceeded(
          event.data.object as Stripe.Invoice
        );
        break;
      case "invoice.payment_failed":
        await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice);
        break;
      case "customer.subscription.updated":
        await handleSubscriptionUpdated(
          event.data.object as Stripe.Subscription
        );
        break;
      case "customer.subscription.deleted":
        await handleSubscriptionDeleted(
          event.data.object as Stripe.Subscription
        );
        break;
      case "payment_intent.succeeded":
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        // TODO: Add logic to handle successful payment intents (e.g., donations)
        console.log(`PaymentIntent succeeded: ${paymentIntent.id}`);
        break;
      case "payment_intent.payment_failed":
        const paymentIntentFailed = event.data.object as Stripe.PaymentIntent;
        console.warn(
          `PaymentIntent failed: ${paymentIntentFailed.id}`,
          paymentIntentFailed.last_payment_error
        );
        break;
      default:
        console.log(`Unhandled event type ${event.type}`);
    }
    res.status(200).send({ received: true });
  } catch (error: any) {
    console.error(`Error handling webhook ${event.type}:`, error);
    res.status(500).send({ error: "Webhook handler failed." });
  }
});

// We keep the helper functions in stripeUtils.ts now

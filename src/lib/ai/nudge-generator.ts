import { NudgeMessage, NudgeChannel, Transaction } from "../types";

/**
 * Generates personalized multi-channel customer recovery nudges.
 * Formatted realistically for WhatsApp, SMS, Push Notifications, and UPI Intent flows.
 */
export function generateCustomerNudge(txn: Transaction): NudgeMessage {
  const shortId = txn.transaction_id.replace("TXN_", "");
  const formattedAmount = `₹${txn.amount.toLocaleString("en-IN")}`;
  const payLink = `https://pay.rzp.io/rcv/${shortId}`;

  // Channel determination strategy:
  // - High-Value -> WhatsApp Rich Message with direct 1-click link
  // - OTP / Network Drop -> Immediate Push / SMS with countdown
  // - Insufficient funds -> WhatsApp / SMS with 3-hr delay
  let channel: NudgeChannel = "whatsapp";
  let delay = "Instant (within 90s)";
  let rationale = "";

  if (txn.user_segment === "high_value") {
    channel = "whatsapp";
    delay = txn.failure_reason === "insufficient_funds" ? "After 3 hours" : "Instant (within 60s)";
    rationale = "High-Value VIP treatment: WhatsApp Business API yields 89% read-rate within 3 minutes and enables 1-tap rich payment buttons.";
  } else if (txn.failure_reason === "otp_timeout" || txn.failure_reason === "network_drop") {
    channel = "sms";
    delay = "Instant (under 2 mins)";
    rationale = "Time-sensitive intent: Direct transactional SMS provides lowest latency for users already holding their phone.";
  } else if (txn.failure_reason === "upi_collect_expired") {
    channel = "push";
    delay = "Instant";
    rationale = "App notification triggers direct deep-link into the customer's UPI app (GPay/PhonePe/Paytm).";
  } else {
    channel = "whatsapp";
    delay = txn.failure_reason === "insufficient_funds" ? "After 4 hours" : "Instant (within 2 mins)";
    rationale = "Interactive WhatsApp conversational nudge provides seamless method-switching fallback.";
  }

  // Generate specific content based on Failure Reason + Segment
  switch (txn.failure_reason) {
    case "otp_timeout":
      return {
        channel,
        title: "⚡ Complete Your Order — Payment Pending",
        body: `Hi there! Your payment of ${formattedAmount} couldn't complete because the OTP expired. We've saved your cart and payment details so you don't have to start over. Tap below to retry with 1-tap OTP verification.`,
        ctaText: `Complete Payment (${formattedAmount})`,
        ctaLink: payLink,
        scheduledDelay: delay,
        incentiveOffer: txn.user_segment === "high_value" ? "Priority Express Processing" : undefined,
        channelRationale: rationale,
      };

    case "insufficient_funds":
      return {
        channel: "whatsapp",
        title: "💳 Payment Options for Your Order",
        body: `Hello! We noticed your payment of ${formattedAmount} was interrupted. You can easily complete this using an alternate bank account, UPI, or split it into No-Cost EMI. Your order is reserved for 6 hours.`,
        ctaText: "Choose Alternate Payment Method",
        ctaLink: payLink,
        scheduledDelay: "Delayed (3–4 hours)",
        incentiveOffer: txn.amount > 5000 ? "Zero-Fee 3-Month EMI Available" : "Instant UPI / Wallet Switch",
        channelRationale: "Delayed delivery aligns with bank balance replenishment or salary credit windows.",
      };

    case "bank_server_error":
      return {
        channel,
        title: "🔄 Bank Downtime Detected — Quick Retry Ready",
        body: `Your bank server experienced a temporary pause during your ${formattedAmount} transaction. We have verified a healthy redundant route for you. Tap below to complete your payment smoothly without re-entering details.`,
        ctaText: "Resume via Fast Route",
        ctaLink: payLink,
        scheduledDelay: "After 5–10 mins",
        channelRationale: "Allows the issuing bank's transient load to clear before re-attempting.",
      };

    case "card_declined":
      return {
        channel: "whatsapp",
        title: "✨ Quick Update on Your Transaction",
        body: `Your bank declined the card charge of ${formattedAmount} (often due to daily online limits or international blocks). Tap below to instantly pay via UPI (Google Pay, PhonePe, Paytm) in 5 seconds!`,
        ctaText: "Pay with 1-Click UPI",
        ctaLink: `upi://pay?pa=razorpay.recovery@icici&pn=Razorpay&am=${txn.amount}&tr=${txn.transaction_id}`,
        scheduledDelay: "Instant (within 90s)",
        incentiveOffer: txn.user_segment === "high_value" ? "VIP Dedicated Checkout Link" : undefined,
        channelRationale: rationale,
      };

    case "upi_collect_expired":
      return {
        channel: "push",
        title: "🔔 UPI Payment Request Waiting",
        body: `Your UPI collect request of ${formattedAmount} timed out. We just sent a fresh request to your UPI app. Approve it now to confirm your order!`,
        ctaText: "Open UPI App & Approve",
        ctaLink: payLink,
        scheduledDelay: "Instant Re-trigger",
        channelRationale: "Immediate push notification catches customer while purchase context is freshest.",
      };

    case "network_drop":
    default:
      return {
        channel: "sms",
        title: "📶 Order Saved: Resume Your Checkout",
        body: `Looks like your network dropped during your ${formattedAmount} payment. Good news — your money was NOT deducted and your cart is reserved. Tap here to finish in 1 tap: ${payLink}`,
        ctaText: "Resume Checkout (1-Tap)",
        ctaLink: payLink,
        scheduledDelay: "Within 2 mins",
        channelRationale: "SMS assures the user that no double-deduction occurred and provides an instant 1-tap recovery link.",
      };
  }
}

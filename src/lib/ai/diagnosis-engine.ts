import { FailureReason, PaymentMethod, Transaction } from "../types";

// Diagnosis result from the rules engine
export interface DiagnosisResult {
  root_cause: string;
  recommended_action: string;
  retry_delay: string;
  alternate_method: PaymentMethod | null;
}

// Rule definitions per failure reason
const DIAGNOSIS_RULES: Record<
  FailureReason,
  (txn: Transaction) => DiagnosisResult
> = {
  otp_timeout: (txn) => ({
    root_cause: "User did not enter OTP within the bank's time window",
    recommended_action:
      "Retry immediately with the same payment method. Send a push notification prompting the user to keep their OTP SMS ready.",
    retry_delay: "< 2 minutes",
    alternate_method: null,
  }),

  insufficient_funds: (txn) => ({
    root_cause: `Account balance was insufficient for ₹${txn.amount.toLocaleString("en-IN")} at the time of transaction`,
    recommended_action:
      txn.amount > 5000
        ? "Delay retry by 3-6 hours (payday/transfer window). Suggest splitting via EMI or switching to a credit card/wallet."
        : "Delay retry by 3-6 hours. Suggest an alternate payment method (UPI from a different bank, or wallet).",
    retry_delay: "3–6 hours",
    alternate_method:
      txn.payment_method === "UPI"
        ? "Wallet"
        : txn.payment_method === "Card"
          ? "UPI"
          : "Wallet",
  }),

  bank_server_error: (txn) => ({
    root_cause:
      "The issuing bank's server returned an error or timed out — likely temporary downtime",
    recommended_action:
      "Retry after 5-15 minutes via a different bank route/gateway. If the user has multiple saved methods, suggest an alternate.",
    retry_delay: "5–15 minutes",
    alternate_method:
      txn.payment_method === "Netbanking" ? "UPI" : "Netbanking",
  }),

  card_declined: (txn) => ({
    root_cause:
      "Card was declined — possible reasons: daily/transaction limit reached, international block, expired card, or bank-side risk flag",
    recommended_action:
      "Do not retry the same card immediately. Suggest switching to UPI or Netbanking. If the user is high-value, send a personalized WhatsApp nudge with alternate payment link.",
    retry_delay: "Immediate (alternate method)",
    alternate_method: "UPI",
  }),

  upi_collect_expired: (txn) => ({
    root_cause:
      "UPI collect request expired before the user approved it in their UPI app",
    recommended_action:
      "Resend the UPI collect request immediately. Send a push notification: 'Your payment is waiting — approve in your UPI app now.'",
    retry_delay: "Immediate",
    alternate_method: null,
  }),

  network_drop: (txn) => ({
    root_cause:
      "Network connectivity was lost during the transaction — the request did not complete",
    recommended_action:
      "Auto-retry with the same method after a brief delay. The transaction is safe to retry as the original did not reach the bank.",
    retry_delay: "1–2 minutes",
    alternate_method: null,
  }),
};

/**
 * Diagnoses a failed transaction using deterministic rules.
 * Returns root cause, recommended action, and suggested alternate method.
 */
export function diagnose(transaction: Transaction): DiagnosisResult {
  const rule = DIAGNOSIS_RULES[transaction.failure_reason];
  return rule(transaction);
}

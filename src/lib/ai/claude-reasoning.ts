import { Transaction, FailureReason, UserSegment } from "../types";

// -------------------------------------------------------------------
// Claude API reasoning — calls claude-sonnet-5 to generate a
// human-readable explanation for each recovery recommendation.
//
// Fallback: if ANTHROPIC_API_KEY is missing or the call fails,
// returns a high-quality template-based explanation instead, so the
// demo never breaks.
// -------------------------------------------------------------------

const MODEL = "claude-3-5-sonnet-latest";

interface ReasoningResult {
  reasoning: string;
  source: "claude" | "template"; // so the UI can show a badge
}

// Cache key = failure_reason + user_segment + payment_method
// ~18 unique combos instead of 200 individual API calls
const reasoningCache = new Map<string, string>();

function cacheKey(txn: Transaction): string {
  return `${txn.failure_reason}|${txn.user_segment}|${txn.payment_method}`;
}

/**
 * Get AI reasoning for a recovery recommendation.
 * Tries Claude API first, falls back to template.
 */
export async function getRecoveryReasoning(
  txn: Transaction,
  recommendedAction: string,
  rootCause: string
): Promise<ReasoningResult> {
  const key = cacheKey(txn);

  // Check cache first
  const cached = reasoningCache.get(key);
  if (cached) {
    return { reasoning: cached, source: "claude" };
  }

  // Try Claude API if key is available
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (apiKey && apiKey.startsWith("sk-")) {
    try {
      const reasoning = await callClaudeAPI(
        txn,
        recommendedAction,
        rootCause,
        apiKey
      );
      reasoningCache.set(key, reasoning);
      return { reasoning, source: "claude" };
    } catch (err) {
      console.error(
        `Claude API call failed for ${txn.transaction_id}, falling back to template:`,
        err
      );
    }
  }

  // Fallback to template reasoning
  const template = generateTemplateReasoning(txn, recommendedAction, rootCause);
  return { reasoning: template, source: "template" };
}

// --- Claude API call ---

async function callClaudeAPI(
  txn: Transaction,
  recommendedAction: string,
  rootCause: string,
  apiKey: string
): Promise<string> {
  const prompt = `You are an AI payment recovery specialist at Razorpay. Analyze this failed transaction and explain in 2-3 concise sentences WHY the recommended recovery action is the best choice for this specific case. Be specific about the reasoning — mention the payment method, failure type, user segment, and amount context.

Transaction:
${JSON.stringify(
  {
    transaction_id: txn.transaction_id,
    amount: txn.amount,
    payment_method: txn.payment_method,
    failure_reason: txn.failure_reason,
    user_segment: txn.user_segment,
    retry_count_so_far: txn.retry_count_so_far,
  },
  null,
  2
)}

Root Cause: ${rootCause}
Recommended Action: ${recommendedAction}

Respond with ONLY the 2-3 sentence explanation, no preamble or headers.`;

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 200,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(
      `Claude API ${response.status}: ${errorBody.substring(0, 200)}`
    );
  }

  const data = await response.json();
  return data.content[0].text;
}

// --- Template fallback reasoning ---

const TEMPLATE_REASONINGS: Record<
  FailureReason,
  Record<UserSegment, string>
> = {
  otp_timeout: {
    new: "This new user likely encountered an unfamiliar OTP flow, causing the timeout. An immediate retry with a clear instruction to keep their phone ready for the OTP SMS gives the highest conversion probability, as the payment intent is still fresh.",
    returning:
      "As a returning user, this OTP timeout is likely situational (distraction, SMS delay) rather than confusion. Immediate retry is optimal since they know the flow — the payment intent window is still open.",
    high_value:
      "For this high-value customer, the OTP timeout represents significant recoverable revenue. Immediate retry with a proactive SMS alert ensures they're prepared, and their established trust with the platform means high retry success rates.",
  },
  insufficient_funds: {
    new: "Insufficient funds for a new user suggests they may not have a backup payment method saved. A delayed retry (3-6 hours) combined with suggesting a wallet or different UPI handle maximizes recovery without creating a negative first impression.",
    returning:
      "This returning user's balance shortfall is likely temporary. A 3-6 hour delay aligns with typical bank transfer/salary credit windows, and suggesting an alternate saved payment method provides an immediate fallback path.",
    high_value:
      "For a high-value customer with insufficient funds, the amount likely exceeds a single account's available balance. Suggesting EMI options or credit card payment provides a premium recovery path appropriate to their segment.",
  },
  bank_server_error: {
    new: "Bank-side errors are not the user's fault. Retrying through a different gateway route after 5-15 minutes avoids the same server issue while the bank resolves the problem. Offering an alternate method prevents new user drop-off.",
    returning:
      "The bank server error is transient and unrelated to this returning user's credentials. A short delay with route switching typically resolves these issues, and their familiarity with the platform means they'll respond well to a retry prompt.",
    high_value:
      "Given the transaction value for this high-value customer, routing through a different bank gateway after a brief wait ensures we don't lose significant revenue to a temporary bank-side issue. Priority retry routing is recommended.",
  },
  card_declined: {
    new: "A card decline for a new user could indicate a limit issue, international restriction, or expired card. Suggesting UPI as an immediate alternative avoids friction — UPI has higher success rates in India and doesn't require the user to troubleshoot their card.",
    returning:
      "This returning user's card decline may be due to a daily transaction limit or a temporary bank hold. Switching to UPI or Netbanking bypasses the card-specific issue entirely, with high adoption rates among returning users.",
    high_value:
      "For high-value customers, card declines often relate to transaction limits rather than credit issues. Suggesting UPI for the retry preserves the user experience, and a personalized WhatsApp nudge with a direct payment link significantly boosts recovery rates.",
  },
  upi_collect_expired: {
    new: "New users may not have noticed or understood the UPI collect notification. Resending immediately with a clear push notification ('Approve your ₹X payment in your UPI app') improves visibility and guides them through the approval step.",
    returning:
      "This returning UPI user likely missed the notification due to timing. An immediate re-send with a push alert is the fastest path to recovery since UPI is already their preferred method and they're familiar with the approve flow.",
    high_value:
      "For a high-value UPI transaction that expired, immediately resending the collect request paired with a real-time push notification ensures the customer can complete the payment before intent decays. UPI re-collects have high success rates.",
  },
  network_drop: {
    new: "The network drop means the transaction never reached the bank — it's completely safe to auto-retry. For a new user, a seamless automatic retry after 1-2 minutes creates a smooth experience and prevents unnecessary abandonment.",
    returning:
      "Since the network dropped before the bank received the request, auto-retrying after connectivity stabilizes (1-2 minutes) is risk-free. Returning users expect seamless recovery from transient network issues.",
    high_value:
      "Network drops on high-value transactions are fully recoverable since no bank processing occurred. Automatic retry with the same method after a brief delay preserves the transaction context and ensures zero revenue loss from infrastructure issues.",
  },
};

function generateTemplateReasoning(
  txn: Transaction,
  _recommendedAction: string,
  _rootCause: string
): string {
  return TEMPLATE_REASONINGS[txn.failure_reason][txn.user_segment];
}

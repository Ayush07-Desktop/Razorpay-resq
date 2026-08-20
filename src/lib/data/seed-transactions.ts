import {
  Transaction,
  PaymentMethod,
  FailureReason,
  UserSegment,
} from "../types";

// --- Distribution weights ---

const PAYMENT_METHODS: { method: PaymentMethod; weight: number }[] = [
  { method: "UPI", weight: 40 },
  { method: "Card", weight: 30 },
  { method: "Netbanking", weight: 20 },
  { method: "Wallet", weight: 10 },
];

const FAILURE_REASONS: { reason: FailureReason; weight: number }[] = [
  { reason: "otp_timeout", weight: 20 },
  { reason: "bank_server_error", weight: 20 },
  { reason: "insufficient_funds", weight: 18 },
  { reason: "card_declined", weight: 17 },
  { reason: "upi_collect_expired", weight: 15 },
  { reason: "network_drop", weight: 10 },
];

const USER_SEGMENTS: { segment: UserSegment; weight: number }[] = [
  { segment: "returning", weight: 50 },
  { segment: "new", weight: 30 },
  { segment: "high_value", weight: 20 },
];

// Constraints: which failure reasons make sense for which payment methods
const METHOD_FAILURE_MAP: Record<PaymentMethod, FailureReason[]> = {
  UPI: [
    "upi_collect_expired",
    "bank_server_error",
    "network_drop",
    "insufficient_funds",
  ],
  Card: [
    "card_declined",
    "otp_timeout",
    "bank_server_error",
    "network_drop",
    "insufficient_funds",
  ],
  Netbanking: [
    "otp_timeout",
    "bank_server_error",
    "network_drop",
    "insufficient_funds",
  ],
  Wallet: ["insufficient_funds", "network_drop", "bank_server_error"],
};

// --- Helpers ---

function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return s / 2147483647;
  };
}

function weightedPick<T>(
  items: { weight: number }[],
  rand: () => number
): number {
  const total = items.reduce((sum, i) => sum + i.weight, 0);
  let r = rand() * total;
  for (let i = 0; i < items.length; i++) {
    r -= items[i].weight;
    if (r <= 0) return i;
  }
  return items.length - 1;
}

function generateAmount(rand: () => number): number {
  // Skewed distribution: mostly ₹200–₹5,000 with some outliers up to ₹50,000
  const r = rand();
  let amount: number;
  if (r < 0.6) {
    amount = 200 + rand() * 4800; // ₹200 – ₹5,000 (60%)
  } else if (r < 0.85) {
    amount = 5000 + rand() * 10000; // ₹5,000 – ₹15,000 (25%)
  } else if (r < 0.95) {
    amount = 15000 + rand() * 20000; // ₹15,000 – ₹35,000 (10%)
  } else {
    amount = 35000 + rand() * 15000; // ₹35,000 – ₹50,000 (5%)
  }
  return Math.round(amount * 100) / 100;
}

function generateTimestamp(rand: () => number): string {
  // Spread across last 24 hours
  const now = new Date("2025-07-15T18:00:00+05:30");
  const msAgo = rand() * 24 * 60 * 60 * 1000;
  return new Date(now.getTime() - msAgo).toISOString();
}

function generateRetryCount(rand: () => number): number {
  const r = rand();
  if (r < 0.6) return 0;
  if (r < 0.85) return 1;
  if (r < 0.95) return 2;
  return 3;
}

// --- Main generator ---

export function generateSeedTransactions(count: number = 200): Transaction[] {
  const rand = seededRandom(42); // deterministic for reproducibility
  const transactions: Transaction[] = [];

  for (let i = 0; i < count; i++) {
    const methodIdx = weightedPick(PAYMENT_METHODS, rand);
    const method = PAYMENT_METHODS[methodIdx].method;

    // Pick a failure reason compatible with this payment method
    const compatibleReasons = FAILURE_REASONS.filter((fr) =>
      METHOD_FAILURE_MAP[method].includes(fr.reason)
    );
    const reasonIdx = weightedPick(compatibleReasons, rand);
    const reason = compatibleReasons[reasonIdx].reason;

    const segmentIdx = weightedPick(USER_SEGMENTS, rand);
    const segment = USER_SEGMENTS[segmentIdx].segment;

    transactions.push({
      transaction_id: `TXN_${String(i + 1).padStart(3, "0")}`,
      amount: generateAmount(rand),
      payment_method: method,
      failure_reason: reason,
      user_segment: segment,
      time_of_failure: generateTimestamp(rand),
      retry_count_so_far: generateRetryCount(rand),
    });
  }

  // Sort by time_of_failure descending (most recent first)
  transactions.sort(
    (a, b) =>
      new Date(b.time_of_failure).getTime() -
      new Date(a.time_of_failure).getTime()
  );

  return transactions;
}

// Pre-generated dataset — imported by API routes
export const SEED_TRANSACTIONS = generateSeedTransactions(200);

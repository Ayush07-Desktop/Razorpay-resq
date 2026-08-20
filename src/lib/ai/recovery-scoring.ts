import { FailureReason, Transaction, UserSegment } from "../types";

// Base recovery rates per failure reason (percentage)
const BASE_RECOVERY_RATES: Record<FailureReason, number> = {
  otp_timeout: 75,
  network_drop: 70,
  upi_collect_expired: 65,
  bank_server_error: 55,
  card_declined: 40,
  insufficient_funds: 35,
};

// User segment multipliers
const SEGMENT_MULTIPLIERS: Record<UserSegment, number> = {
  high_value: 1.3,
  returning: 1.1,
  new: 0.85,
};

/**
 * Calculates recovery probability (0–100%) for a single transaction.
 *
 * Formula:
 *   base_score(failure_reason)
 *     × user_segment_multiplier
 *     × amount_factor (lower amounts recover easier)
 *     × retry_decay (each prior retry reduces probability by 15%)
 *     + random_noise (deterministic, based on transaction_id hash)
 */
export function calculateRecoveryProbability(txn: Transaction): number {
  const base = BASE_RECOVERY_RATES[txn.failure_reason];
  const segmentMult = SEGMENT_MULTIPLIERS[txn.user_segment];

  // Amount factor: transactions under ₹2000 are easier to recover
  let amountFactor: number;
  if (txn.amount < 500) amountFactor = 1.2;
  else if (txn.amount < 2000) amountFactor = 1.1;
  else if (txn.amount < 10000) amountFactor = 1.0;
  else if (txn.amount < 30000) amountFactor = 0.9;
  else amountFactor = 0.8;

  // Retry decay: each prior retry reduces probability by 15%
  const retryDecay = Math.pow(0.85, txn.retry_count_so_far);

  // Deterministic noise based on transaction_id hash
  const hash = simpleHash(txn.transaction_id);
  const noise = ((hash % 100) - 50) / 10; // range: -5 to +5

  let probability = base * segmentMult * amountFactor * retryDecay + noise;

  // Clamp to 0–100
  probability = Math.max(0, Math.min(100, probability));

  return Math.round(probability * 10) / 10;
}

/**
 * Simulates whether the transaction was actually recovered,
 * using the probability as the chance of success.
 * Deterministic based on transaction_id.
 */
export function simulateRecovery(
  txn: Transaction,
  probability: number
): boolean {
  const hash = simpleHash(txn.transaction_id + "_outcome");
  const roll = (hash % 100) + 1; // 1–100
  return roll <= probability;
}

// Simple deterministic hash for reproducible randomness
function simpleHash(str: string): number {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 33) ^ str.charCodeAt(i);
  }
  return Math.abs(hash);
}

// Payment method types supported by Razorpay
export type PaymentMethod = "UPI" | "Card" | "Netbanking" | "Wallet";

// Failure reason categories
export type FailureReason =
  | "insufficient_funds"
  | "otp_timeout"
  | "bank_server_error"
  | "card_declined"
  | "upi_collect_expired"
  | "network_drop";

// User segments for personalization
export type UserSegment = "new" | "returning" | "high_value";

// A single failed/abandoned transaction
export interface Transaction {
  transaction_id: string;
  amount: number;
  payment_method: PaymentMethod;
  failure_reason: FailureReason;
  user_segment: UserSegment;
  time_of_failure: string; // ISO 8601 timestamp
  retry_count_so_far: number;
}

// Result of the AI recovery engine for a single transaction
export interface RecoveryResult {
  transaction_id: string;
  amount: number;
  payment_method: PaymentMethod;
  failure_reason: FailureReason;
  user_segment: UserSegment;
  root_cause: string;
  recommended_action: string;
  ai_reasoning: string; // from Claude API or template fallback
  recovery_probability: number; // 0–100
  recovered: boolean; // simulated outcome
  recovered_amount: number; // amount if recovered, else 0
  time_of_failure: string;
}

// Aggregated stats for dashboard summary cards
export interface RecoverySummary {
  total_transactions: number;
  total_value_at_risk: number;
  total_recovered_value: number;
  recovery_rate: number; // percentage
  recovered_count: number;
  by_failure_reason: Record<
    FailureReason,
    { total: number; recovered: number; rate: number }
  >;
}

// Chart data point for revenue timeline
export interface TimelineDataPoint {
  hour: string; // e.g. "14:00"
  recovered: number; // cumulative recovered amount
  at_risk: number; // cumulative at-risk amount
}

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

// Nudge communication channels
export type NudgeChannel = "whatsapp" | "sms" | "push" | "upi_intent";

// Structured customer communication payload
export interface NudgeMessage {
  channel: NudgeChannel;
  title: string;
  body: string;
  ctaText: string;
  ctaLink: string;
  scheduledDelay: string;
  incentiveOffer?: string;
  channelRationale: string;
}

// Multi-Agent execution trace for transparency
export interface AgentTrace {
  step: number;
  agentName: "Sentinel Agent" | "Smart Routing Agent" | "Behavioral Agent" | "Arbitrage & Risk Agent";
  action: string;
  confidence: number; // 0–100
  detail: string;
  timestampMs: number;
}

// Real-time bank & gateway telemetry node
export interface BankNodeHealth {
  id: string;
  name: string;
  type: "bank" | "upi" | "card_network" | "wallet";
  latencyMs: number;
  successRate: number; // 0–100%
  status: "healthy" | "degraded" | "critical";
  lastIncident?: string;
  recommendedAlternative?: string;
}

// Policy Sandbox configuration
export interface PolicySettings {
  minConfidence: number; // e.g. 40%
  enableWhatsApp: boolean;
  enableSMS: boolean;
  enablePush: boolean;
  enableAutoReroute: boolean;
  dynamicDiscountPct: number; // 0-5% incentive
  targetSegments: UserSegment[];
}

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
  // Extended Next-Gen fields
  nudge?: NudgeMessage;
  agent_traces?: AgentTrace[];
  failover_gateway?: string;
  estimated_ltv_impact?: number;
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


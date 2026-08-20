import {
  Transaction,
  RecoveryResult,
  AgentTrace,
} from "../types";
import { diagnose } from "./diagnosis-engine";
import { calculateRecoveryProbability, simulateRecovery } from "./recovery-scoring";
import { getRecoveryReasoning } from "./claude-reasoning";
import { generateCustomerNudge } from "./nudge-generator";
import { getFailoverGatewayRecommendation } from "../data/gateway-data";

/**
 * Executes the 4-Agent Autonomous Recovery Pipeline on a transaction.
 */
export async function executeMultiAgentRecovery(txn: Transaction): Promise<RecoveryResult> {
  const traces: AgentTrace[] = [];
  const startMs = Date.now();

  // ----------------------------------------------------
  // Agent 1: Sentinel Telemetry & Failure Classifier Agent
  // ----------------------------------------------------
  const diagnosis = diagnose(txn);
  traces.push({
    step: 1,
    agentName: "Sentinel Agent",
    action: "Telemetry Ingestion & Root Cause Classification",
    confidence: 96.5,
    detail: `Intercepted error code on ${txn.payment_method} rail. Classified root cause: "${diagnosis.root_cause}". Prior attempts: ${txn.retry_count_so_far}.`,
    timestampMs: Date.now() - startMs,
  });

  // ----------------------------------------------------
  // Agent 2: Smart Routing & Failover Optimizer Agent
  // ----------------------------------------------------
  const failoverInfo = getFailoverGatewayRecommendation(txn.payment_method, txn.failure_reason);
  traces.push({
    step: 2,
    agentName: "Smart Routing Agent",
    action: "Bank Switch Health Evaluation & Failover Route Selection",
    confidence: 92.0,
    detail: `${failoverInfo.rerouteAction} Recommended alternate rail: ${diagnosis.alternate_method || txn.payment_method}.`,
    timestampMs: Date.now() - startMs + 2,
  });

  // ----------------------------------------------------
  // Agent 3: Behavioral Copywriter & Channel Orchestrator Agent
  // ----------------------------------------------------
  const nudge = generateCustomerNudge(txn);
  traces.push({
    step: 3,
    agentName: "Behavioral Agent",
    action: "Psychographic Nudge Personalization & Channel Selection",
    confidence: 89.0,
    detail: `Selected ${nudge.channel.toUpperCase()} channel for ${txn.user_segment} customer. Scheduled delay: ${nudge.scheduledDelay}. Rationale: ${nudge.channelRationale}`,
    timestampMs: Date.now() - startMs + 5,
  });

  // ----------------------------------------------------
  // Agent 4: Arbitrage, Scoring & Risk Engine
  // ----------------------------------------------------
  const probability = calculateRecoveryProbability(txn);
  const recovered = simulateRecovery(txn, probability);
  const { reasoning } = await getRecoveryReasoning(
    txn,
    diagnosis.recommended_action,
    diagnosis.root_cause
  );

  traces.push({
    step: 4,
    agentName: "Arbitrage & Risk Agent",
    action: "Revenue Probability Scoring & Outcome Resolution",
    confidence: probability,
    detail: `Calculated recovery probability: ${probability}%. Simulated resolution: ${recovered ? "RECOVERED (₹" + txn.amount.toLocaleString("en-IN") + ")" : "ABANDONED"}.`,
    timestampMs: Date.now() - startMs + 8,
  });

  // Estimated LTV preservation (High-value customer retention multiplier)
  const ltvMultiplier = txn.user_segment === "high_value" ? 4.5 : txn.user_segment === "returning" ? 2.2 : 1.0;
  const estimatedLtv = recovered ? Math.round(txn.amount * ltvMultiplier) : 0;

  return {
    transaction_id: txn.transaction_id,
    amount: txn.amount,
    payment_method: txn.payment_method,
    failure_reason: txn.failure_reason,
    user_segment: txn.user_segment,
    root_cause: diagnosis.root_cause,
    recommended_action: diagnosis.recommended_action,
    ai_reasoning: reasoning,
    recovery_probability: probability,
    recovered,
    recovered_amount: recovered ? txn.amount : 0,
    time_of_failure: txn.time_of_failure,
    nudge,
    agent_traces: traces,
    failover_gateway: failoverInfo.failoverGateway,
    estimated_ltv_impact: estimatedLtv,
  };
}

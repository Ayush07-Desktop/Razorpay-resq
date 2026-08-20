import { BankNodeHealth, PaymentMethod, FailureReason } from "../types";

export const BANK_GATEWAY_NODES: BankNodeHealth[] = [
  {
    id: "node_hdfc",
    name: "HDFC Bank PG Direct",
    type: "bank",
    latencyMs: 142,
    successRate: 98.4,
    status: "healthy",
    recommendedAlternative: "node_icici",
  },
  {
    id: "node_icici",
    name: "ICICI Corporate Switch",
    type: "bank",
    latencyMs: 118,
    successRate: 99.1,
    status: "healthy",
    recommendedAlternative: "node_axis",
  },
  {
    id: "node_sbi",
    name: "SBI Core Banking Hub",
    type: "bank",
    latencyMs: 460,
    successRate: 78.2,
    status: "degraded",
    lastIncident: "Intermittent timeouts observed during peak load (7:30 PM - 9:00 PM)",
    recommendedAlternative: "node_npci_upi",
  },
  {
    id: "node_axis",
    name: "Axis Bank E-Pay Route",
    type: "bank",
    latencyMs: 135,
    successRate: 97.8,
    status: "healthy",
    recommendedAlternative: "node_hdfc",
  },
  {
    id: "node_npci_upi",
    name: "NPCI Central UPI Switch",
    type: "upi",
    latencyMs: 82,
    successRate: 99.6,
    status: "healthy",
    recommendedAlternative: "node_paytm_psp",
  },
  {
    id: "node_paytm_psp",
    name: "Paytm Payments Bank PSP",
    type: "wallet",
    latencyMs: 195,
    successRate: 94.3,
    status: "healthy",
    recommendedAlternative: "node_npci_upi",
  },
  {
    id: "node_visa_mc",
    name: "Visa / Mastercard India Gateway",
    type: "card_network",
    latencyMs: 220,
    successRate: 96.5,
    status: "healthy",
    recommendedAlternative: "node_npci_upi",
  },
];

/**
 * Recommends smart failover route when a payment fails on a particular method / reason.
 */
export function getFailoverGatewayRecommendation(
  method: PaymentMethod,
  reason: FailureReason
): { primaryGateway: string; failoverGateway: string; rerouteAction: string } {
  switch (reason) {
    case "bank_server_error":
      return {
        primaryGateway: method === "Netbanking" ? "SBI Core Banking Hub (Degraded)" : "HDFC Bank PG Direct",
        failoverGateway: "ICICI Corporate Switch + NPCI UPI Fallback",
        rerouteAction: "Dynamic Route Switching: Traffic rerouted to ICICI redundant gateway with sub-50ms failover.",
      };
    case "card_declined":
      return {
        primaryGateway: "Visa / Mastercard India Gateway",
        failoverGateway: "NPCI Central UPI Switch (Instant Collect)",
        rerouteAction: "Cross-Rail Shift: Seamlessly shifted from Card rail to 1-click UPI deep-link rail.",
      };
    case "upi_collect_expired":
      return {
        primaryGateway: "NPCI Central UPI Switch",
        failoverGateway: "NPCI Fast-Lane Intent Re-send",
        rerouteAction: "Direct Intent Push: Re-triggered UPI Collect notification with high priority flag.",
      };
    case "otp_timeout":
      return {
        primaryGateway: "Issuing Bank ACS Server",
        failoverGateway: "Razorpay Turbo-OTP Auto-Reader Service",
        rerouteAction: "OTP Fast Track: Instant SMS re-trigger with auto-read SDK hook enabled.",
      };
    case "network_drop":
      return {
        primaryGateway: "Client Edge Gateway",
        failoverGateway: "Zero-Data-Loss Background Retry Queue",
        rerouteAction: "Idempotent Re-execution: Background worker executed idempotent retry on connectivity resume.",
      };
    case "insufficient_funds":
    default:
      return {
        primaryGateway: "Primary Bank Account",
        failoverGateway: "Multi-Wallet & Instant BNPL / Card Rail",
        rerouteAction: "Balance Alternate: Prompted saved secondary wallet or credit EMI fallback.",
      };
  }
}

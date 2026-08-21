"use client";

import { useState, useMemo } from "react";
import { RecoveryResult, PaymentMethod, FailureReason, UserSegment } from "@/lib/types";
import DeviceNudgeModal from "./DeviceNudgeModal";

interface LiveFeedTabProps {
  results: RecoveryResult[];
  loading: boolean;
  summary: {
    total_transactions: number;
    total_value_at_risk: number;
    total_recovered_value: number;
    recovery_rate: number;
    recovered_count: number;
  } | null;
  onRun: () => void;
}

const FAILURE_LABELS: Record<string, string> = {
  otp_timeout: "OTP Timeout",
  insufficient_funds: "Insufficient Funds",
  bank_server_error: "Bank Server Error",
  card_declined: "Card Declined",
  upi_collect_expired: "UPI Collect Expired",
  network_drop: "Network Drop",
};

export default function LiveFeedTab({
  results,
  loading,
  summary,
  onRun,
}: LiveFeedTabProps) {
  const [visibleCount, setVisibleCount] = useState<number>(10);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [selectedNudgeTxn, setSelectedNudgeTxn] = useState<RecoveryResult | null>(null);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMethod, setSelectedMethod] = useState<string>("ALL");
  const [selectedReason, setSelectedReason] = useState<string>("ALL");
  const [selectedSegment, setSelectedSegment] = useState<string>("ALL");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");

  // Filtered & Sorted dataset
  const filteredResults = useMemo(() => {
    return results.filter((r) => {
      // Search
      if (
        searchQuery &&
        !r.transaction_id.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !r.amount.toString().includes(searchQuery)
      ) {
        return false;
      }
      // Method filter
      if (selectedMethod !== "ALL" && r.payment_method !== selectedMethod) return false;
      // Reason filter
      if (selectedReason !== "ALL" && r.failure_reason !== selectedReason) return false;
      // Segment filter
      if (selectedSegment !== "ALL" && r.user_segment !== selectedSegment) return false;
      // Status filter
      if (selectedStatus === "RECOVERED" && !r.recovered) return false;
      if (selectedStatus === "FAILED" && r.recovered) return false;

      return true;
    });
  }, [results, searchQuery, selectedMethod, selectedReason, selectedSegment, selectedStatus]);

  const sortedResults = useMemo(() => {
    return [...filteredResults].sort((a, b) => b.amount - a.amount);
  }, [filteredResults]);

  const visibleResults = sortedResults.slice(0, visibleCount);

  const showNext = () => {
    setVisibleCount((c) => Math.min(sortedResults.length, c + 10));
  };

  const showAll = () => {
    setVisibleCount(sortedResults.length);
  };

  const resetFeed = () => {
    setVisibleCount(10);
    setExpandedId(null);
    setSearchQuery("");
    setSelectedMethod("ALL");
    setSelectedReason("ALL");
    setSelectedSegment("ALL");
    setSelectedStatus("ALL");
  };


  // CSV Export functionality
  const exportCSV = () => {
    if (results.length === 0) return;
    const headers = [
      "Transaction ID",
      "Amount (INR)",
      "Payment Method",
      "Failure Reason",
      "User Segment",
      "Recovery Probability (%)",
      "Recovered Status",
      "Channel Nudge",
      "Failover Gateway",
      "Root Cause",
    ];

    const rows = results.map((r) => [
      r.transaction_id,
      r.amount,
      r.payment_method,
      r.failure_reason,
      r.user_segment,
      r.recovery_probability,
      r.recovered ? "RECOVERED" : "UNRECOVERED",
      r.nudge?.channel || "N/A",
      r.failover_gateway || "N/A",
      `"${r.root_cause.replace(/"/g, '""')}"`,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Razorpay_PayRecover_Audit_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Pre-simulation state
  if (results.length === 0 && !loading) {
    return (
      <div className="text-center py-10 sm:py-16 px-2">
        <div className="text-5xl sm:text-6xl mb-4 sm:mb-6">🔍</div>
        <h2 className="text-xl sm:text-2xl font-bold text-[#FAFAFA] mb-2 sm:mb-3">
          Ready to Intercept Failed Transactions
        </h2>
        <p className="text-xs sm:text-sm text-[#6B7B8D] max-w-md mx-auto mb-6">
          200 synthetic failed transactions loaded. Run the 4-Agent Autonomous Recovery Engine
          to diagnose, reroute, and generate customer nudges.
        </p>

        <div className="mb-8">
          <button
            onClick={onRun}
            className="bg-[#388BFD] hover:bg-[#4D9CFF] text-white px-5 sm:px-6 py-3 rounded-xl font-semibold text-xs sm:text-sm transition-all shadow-lg hover:shadow-blue-500/25 cursor-pointer inline-flex items-center gap-2"
          >
            ▶ Run Multi-Agent Recovery Simulation
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 max-w-2xl mx-auto text-left">
          <div className="bg-[#161B22] rounded-xl p-3.5 sm:p-4 border border-[#242D3D]">
            <span className="text-[10px] text-[#388BFD] font-bold block mb-1">AGENT 1</span>
            <p className="text-xs font-bold text-[#FAFAFA] mb-1">Sentinel Ingestion</p>
            <p className="text-[11px] text-[#8B949E]">Root cause taxonomy</p>
          </div>
          <div className="bg-[#161B22] rounded-xl p-3.5 sm:p-4 border border-[#242D3D]">
            <span className="text-[10px] text-[#2EA043] font-bold block mb-1">AGENT 2</span>
            <p className="text-xs font-bold text-[#FAFAFA] mb-1">Smart Routing</p>
            <p className="text-[11px] text-[#8B949E]">Bank failover switch</p>
          </div>
          <div className="bg-[#161B22] rounded-xl p-3.5 sm:p-4 border border-[#242D3D]">
            <span className="text-[10px] text-[#A371F7] font-bold block mb-1">AGENT 3</span>
            <p className="text-xs font-bold text-[#FAFAFA] mb-1">Behavioral Nudge</p>
            <p className="text-[11px] text-[#8B949E]">WhatsApp / SMS copy</p>
          </div>
          <div className="bg-[#161B22] rounded-xl p-3.5 sm:p-4 border border-[#242D3D]">
            <span className="text-[10px] text-[#E6A817] font-bold block mb-1">AGENT 4</span>
            <p className="text-xs font-bold text-[#FAFAFA] mb-1">Risk & Scoring</p>
            <p className="text-[11px] text-[#8B949E]">Probability & LTV</p>
          </div>
        </div>
      </div>
    );
  }

  // Loading state
  if (loading) {
    return (
      <div className="text-center py-16 sm:py-20 px-4">
        <div className="text-5xl sm:text-6xl mb-4 sm:mb-6 animate-pulse">⚡</div>
        <h2 className="text-xl sm:text-2xl font-bold text-[#FAFAFA] mb-2 sm:mb-3">
          Multi-Agent Recovery Pipeline Active
        </h2>
        <p className="text-xs sm:text-sm text-[#6B7B8D] max-w-lg mx-auto">
          Orchestrating Sentinel → Routing → Behavioral → Risk Agents across 200 transactions…
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#FAFAFA]">Live Payment Failure Feed & Interceptor</h2>
          <p className="text-xs sm:text-sm text-[#8B949E] mt-0.5">
            Real-time failed transactions with automated root-cause diagnosis, failover routing, and customer nudges.
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={exportCSV}
            className="w-full sm:w-auto justify-center bg-[#1C2333] hover:bg-[#2A3244] border border-[#2D3748] text-[#FAFAFA] px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-2"
          >
            <span>📥</span> Export Audit CSV
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-[#161B22] p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border border-[#242D3D] space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:flex lg:items-center gap-2 sm:gap-3">
          {/* Search Box */}
          <div className="sm:col-span-2 lg:flex-1 min-w-[200px] relative">
            <input
              type="text"
              placeholder="Search Txn ID or Amount (e.g. TXN_042)..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setVisibleCount(10);
              }}
              className="w-full bg-[#0E1117] border border-[#242D3D] rounded-xl px-3.5 py-2 text-xs text-[#FAFAFA] placeholder-[#5C6C7F] focus:outline-none focus:border-[#388BFD]"
            />
          </div>

          {/* Payment Method Filter */}
          <select
            value={selectedMethod}
            onChange={(e) => {
              setSelectedMethod(e.target.value);
              setVisibleCount(10);
            }}
            className="w-full lg:w-auto bg-[#0E1117] border border-[#242D3D] rounded-xl px-3 py-2 text-xs text-[#C9D1D9] cursor-pointer"
          >
            <option value="ALL">All Rails (UPI, Card...)</option>
            <option value="UPI">UPI</option>
            <option value="Card">Card</option>
            <option value="Netbanking">Netbanking</option>
            <option value="Wallet">Wallet</option>
          </select>

          {/* Failure Reason Filter */}
          <select
            value={selectedReason}
            onChange={(e) => {
              setSelectedReason(e.target.value);
              setVisibleCount(10);
            }}
            className="w-full lg:w-auto bg-[#0E1117] border border-[#242D3D] rounded-xl px-3 py-2 text-xs text-[#C9D1D9] cursor-pointer"
          >
            <option value="ALL">All Failure Types</option>
            <option value="otp_timeout">OTP Timeout</option>
            <option value="insufficient_funds">Insufficient Funds</option>
            <option value="bank_server_error">Bank Server Error</option>
            <option value="card_declined">Card Declined</option>
            <option value="upi_collect_expired">UPI Expired</option>
            <option value="network_drop">Network Drop</option>
          </select>

          {/* Segment Filter */}
          <select
            value={selectedSegment}
            onChange={(e) => {
              setSelectedSegment(e.target.value);
              setVisibleCount(10);
            }}
            className="w-full lg:w-auto bg-[#0E1117] border border-[#242D3D] rounded-xl px-3 py-2 text-xs text-[#C9D1D9] cursor-pointer"
          >
            <option value="ALL">All Segments</option>
            <option value="high_value">High Value (VIP)</option>
            <option value="returning">Returning</option>
            <option value="new">New Users</option>
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => {
              setSelectedStatus(e.target.value);
              setVisibleCount(10);
            }}
            className="w-full lg:w-auto bg-[#0E1117] border border-[#242D3D] rounded-xl px-3 py-2 text-xs text-[#C9D1D9] cursor-pointer"
          >
            <option value="ALL">All Statuses</option>
            <option value="RECOVERED">Recovered Only</option>
            <option value="FAILED">Unrecovered Only</option>
          </select>
        </div>

        {/* Action Controls */}
        <div className="flex items-center justify-between pt-2 border-t border-[#242D3D]/50 text-xs text-[#8B949E] flex-wrap gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={showNext}
              disabled={visibleResults.length >= sortedResults.length}
              className="bg-[#1C2333] hover:bg-[#2A3244] border border-[#2D3748] text-[#FAFAFA] px-3 py-1.5 rounded-lg font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              ▶ Reveal +10
            </button>
            <button
              onClick={showAll}
              disabled={visibleResults.length >= sortedResults.length}
              className="bg-[#388BFD]/15 hover:bg-[#388BFD]/25 border border-[#388BFD]/30 text-[#7EB6F0] px-3 py-1.5 rounded-lg font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              ⚡ Show All ({sortedResults.length})
            </button>
            <button
              onClick={resetFeed}
              className="bg-[#1C2333] hover:bg-[#2A3244] border border-[#2D3748] text-[#FAFAFA] px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer"
            >
              🔄 Reset
            </button>
          </div>
          <span className="text-[11px] sm:text-xs">
            Displaying <strong className="text-[#FAFAFA]">{visibleResults.length}</strong> of{" "}
            <strong className="text-[#FAFAFA]">{sortedResults.length}</strong> filtered
          </span>
        </div>
      </div>

      {/* Transaction Cards Feed */}
      <div className="space-y-3">
        {visibleResults.map((result, idx) => (
          <EnhancedTransactionCard
            key={result.transaction_id}
            result={result}
            isExpanded={expandedId === result.transaction_id}
            onToggle={() =>
              setExpandedId(
                expandedId === result.transaction_id ? null : result.transaction_id
              )
            }
            onOpenNudgeModal={() => setSelectedNudgeTxn(result)}
            index={idx}
          />
        ))}
      </div>

      {/* Bottom Load More & Actions Bar */}
      {visibleResults.length < sortedResults.length && (
        <div className="bg-[#161B22] p-4 rounded-xl border border-[#242D3D] flex items-center justify-between flex-wrap gap-3 mt-4 animate-fade-in">
          <span className="text-xs text-[#8B949E]">
            Showing <strong className="text-[#FAFAFA]">{visibleResults.length}</strong> of{" "}
            <strong className="text-[#FAFAFA]">{sortedResults.length}</strong> transactions
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={showNext}
              className="bg-[#1C2333] hover:bg-[#2A3244] border border-[#2D3748] text-[#FAFAFA] px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer transition-colors"
            >
              ▶ Reveal +10 More
            </button>
            <button
              onClick={showAll}
              className="bg-[#388BFD]/15 hover:bg-[#388BFD]/25 border border-[#388BFD]/30 text-[#7EB6F0] px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer transition-colors"
            >
              ⚡ Show All ({sortedResults.length})
            </button>
          </div>
        </div>
      )}

      {/* Device Nudge Simulator Modal */}
      {selectedNudgeTxn && (
        <DeviceNudgeModal
          result={selectedNudgeTxn}
          onClose={() => setSelectedNudgeTxn(null)}
        />
      )}
    </div>
  );
}

function EnhancedTransactionCard({
  result,
  isExpanded,
  onToggle,
  onOpenNudgeModal,
  index,
}: {
  result: RecoveryResult;
  isExpanded: boolean;
  onToggle: () => void;
  onOpenNudgeModal: () => void;
  index: number;
}) {
  const probColor =
    result.recovery_probability >= 60
      ? "#2EA043"
      : result.recovery_probability >= 35
        ? "#E6A817"
        : "#F85149";

  return (
    <div
      className="bg-[#161B22] border border-[#242D3D] rounded-xl overflow-hidden animate-fade-in card-hover"
      style={{ animationDelay: `${index * 20}ms` }}
    >
      {/* Responsive Card Header Bar */}
      <div className="w-full p-3.5 sm:px-5 sm:py-3.5 text-left flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Clickable Header Info Area */}
        <div
          onClick={onToggle}
          className="flex-1 cursor-pointer flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 min-w-0"
        >
          {/* Main Identifier & Amount Line */}
          <div className="flex items-center gap-2.5">
            <span className="text-[#8B949E] text-xs font-mono shrink-0">
              {isExpanded ? "▾" : "▸"}
            </span>
            <span
              className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                result.recovered ? "bg-[#2EA043] shadow-[0_0_8px_#2EA043]" : "bg-[#F85149]"
              }`}
            />
            <span className="font-mono text-xs font-bold text-[#7EB6F0]">
              {result.transaction_id}
            </span>
            <span className="text-sm sm:text-base font-bold text-[#FAFAFA] ml-1">
              ₹{result.amount.toLocaleString("en-IN")}
            </span>
          </div>

          {/* Badges / Details Row (flows nicely on mobile and desktop) */}
          <div className="flex items-center flex-wrap gap-1.5 sm:gap-2 ml-5 sm:ml-0 text-xs">
            <span className="bg-[#0E1117] text-[#C9D1D9] px-2 py-0.5 rounded border border-[#242D3D] text-[11px]">
              {result.payment_method}
            </span>
            <span className="text-[#8B949E] bg-[#0E1117] px-2 py-0.5 rounded border border-[#242D3D] text-[11px] truncate max-w-[160px] sm:max-w-none">
              {FAILURE_LABELS[result.failure_reason]}
            </span>
            <span
              className="text-[11px] font-semibold px-2 py-0.5 rounded"
              style={{
                backgroundColor: `${probColor}15`,
                color: probColor,
                border: `1px solid ${probColor}30`,
              }}
            >
              {result.recovery_probability}% Rec
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between sm:justify-end gap-2 pt-2 md:pt-0 border-t md:border-t-0 border-[#242D3D]/50">
          {result.nudge && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onOpenNudgeModal();
              }}
              className="bg-[#1C2333] hover:bg-[#2A3244] border border-[#2D3748] text-xs font-semibold text-[#388BFD] hover:text-white px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 shrink-0 touch-target"
            >
              <span>📱</span> Preview Nudge
            </button>
          )}
          <button
            onClick={onToggle}
            className="text-[#8B949E] hover:text-[#FAFAFA] text-xs px-2.5 py-1.5 rounded-lg hover:bg-[#1C2333] cursor-pointer"
          >
            {isExpanded ? "Collapse ▲" : "Details ▼"}
          </button>
        </div>
      </div>

      {/* Expanded multi-agent breakdown */}
      {isExpanded && (
        <div className="border-t border-[#242D3D] p-3.5 sm:p-5 space-y-3 sm:space-y-4 bg-[#0E1117]">
          {/* Metadata Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4 text-xs">
            <div className="bg-[#161B22] p-3 rounded-xl border border-[#242D3D]">
              <span className="text-[#8B949E] block text-[10px] uppercase">User Segment</span>
              <span className="font-semibold text-[#FAFAFA] capitalize">
                {result.user_segment === "high_value" ? "👑 High Value (VIP)" : result.user_segment}
              </span>
            </div>
            <div className="bg-[#161B22] p-3 rounded-xl border border-[#242D3D]">
              <span className="text-[#8B949E] block text-[10px] uppercase">Smart Failover Rail</span>
              <span className="font-semibold text-[#2EA043] break-words">
                {result.failover_gateway || "Standard Redundant Route"}
              </span>
            </div>
            <div className="bg-[#161B22] p-3 rounded-xl border border-[#242D3D]">
              <span className="text-[#8B949E] block text-[10px] uppercase">Communication Channel</span>
              <span className="font-semibold text-[#388BFD] uppercase">
                {result.nudge?.channel || "N/A"} ({result.nudge?.scheduledDelay || "Immediate"})
              </span>
            </div>
            <div className="bg-[#161B22] p-3 rounded-xl border border-[#242D3D]">
              <span className="text-[#8B949E] block text-[10px] uppercase">Simulated Settlement</span>
              <span
                className={`font-bold ${
                  result.recovered ? "text-[#2EA043]" : "text-[#F85149]"
                }`}
              >
                {result.recovered ? "✓ Recovered (+₹" + result.amount.toLocaleString("en-IN") + ")" : "✗ Unrecovered"}
              </span>
            </div>
          </div>

          {/* Root cause & action */}
          <div className="bg-[#161B22] p-3.5 sm:p-4 rounded-xl border border-[#242D3D] space-y-2 text-xs">
            <div>
              <span className="text-[#8B949E] font-bold uppercase text-[10px]">Diagnosis & Root Cause: </span>
              <span className="text-[#FAFAFA]">{result.root_cause}</span>
            </div>
            <div>
              <span className="text-[#388BFD] font-bold uppercase text-[10px]">Recommended Recovery Action: </span>
              <span className="text-[#C9D1D9]">{result.recommended_action}</span>
            </div>
          </div>

          {/* AI Reasoning */}
          <div className="bg-gradient-to-r from-[#161B22] to-[#1C2333] p-3.5 sm:p-4 rounded-xl border border-[#2D3748] text-xs">
            <p className="font-semibold text-[#388BFD] mb-1 flex items-center gap-1.5">
              <span>🤖</span> Autonomous Claude Reasoning:
            </p>
            <p className="text-[#C9D1D9] leading-relaxed italic">&quot;{result.ai_reasoning}&quot;</p>
          </div>

          {/* 4-Agent Execution Timeline */}
          {result.agent_traces && (
            <div className="bg-[#161B22] p-3.5 sm:p-4 rounded-xl border border-[#242D3D] text-xs">
              <span className="text-[10px] font-bold text-[#8B949E] uppercase block mb-2 sm:mb-3">
                ⚡ 4-Agent Execution Audit Trace
              </span>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 sm:gap-3">
                {result.agent_traces.map((trace) => (
                  <div
                    key={trace.step}
                    className="bg-[#0E1117] p-2.5 rounded-lg border border-[#242D3D] text-[11px]"
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-bold text-[#7EB6F0]">
                        Step {trace.step}: {trace.agentName}
                      </span>
                      <span className="text-[10px] text-[#8B949E] font-mono">
                        +{trace.timestampMs}ms
                      </span>
                    </div>
                    <p className="text-[#8B949E] leading-relaxed">{trace.detail}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}


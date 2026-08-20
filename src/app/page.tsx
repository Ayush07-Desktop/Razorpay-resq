"use client";

import { useState, useCallback } from "react";
import { RecoveryResult } from "@/lib/types";
import LiveFeedTab from "@/components/LiveFeedTab";
import RevenueRecoveryTab from "@/components/RevenueRecoveryTab";
import PolicySandboxTab from "@/components/PolicySandboxTab";
import GatewayMatrixTab from "@/components/GatewayMatrixTab";
import MultiAgentTab from "@/components/MultiAgentTab";

type TabId =
  | "live-feed"
  | "policy-sandbox"
  | "gateway-matrix"
  | "revenue-recovery"
  | "multi-agent";

interface RecoverySummary {
  total_transactions: number;
  total_value_at_risk: number;
  total_recovered_value: number;
  recovery_rate: number;
  recovered_count: number;
}

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<TabId>("live-feed");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<RecoveryResult[]>([]);
  const [summary, setSummary] = useState<RecoverySummary | null>(null);
  const [error, setError] = useState<string | null>(null);

  const runSimulation = useCallback(async () => {
    if (loading || results.length > 0) return;
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/recover", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });

      if (!response.ok) throw new Error(`API returned ${response.status}`);

      const data = await response.json();
      setResults(data.results);
      setSummary(data.summary);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to run recovery simulation"
      );
    } finally {
      setLoading(false);
    }
  }, [loading, results.length]);

  const tabs: { id: TabId; label: string; emoji: string }[] = [
    { id: "live-feed", label: "Live Interceptor", emoji: "⚡" },
    { id: "policy-sandbox", label: "AI Policy Sandbox", emoji: "🎛️" },
    { id: "gateway-matrix", label: "Gateway Matrix", emoji: "🌐" },
    { id: "revenue-recovery", label: "Analytics & ROI", emoji: "📈" },
    { id: "multi-agent", label: "Multi-Agent Core", emoji: "🧠" },
  ];

  const baselineRate = 12;
  const recoveryLift = summary
    ? Math.round(summary.recovery_rate - baselineRate)
    : 0;

  return (
    <div className="flex min-h-screen">
      {/* ===== SIDEBAR ===== */}
      <aside className="w-[280px] bg-[#0E1117] border-r border-[#1E2533] flex flex-col shrink-0 sticky top-0 h-screen overflow-y-auto">
        {/* Logo area */}
        <div className="px-6 pt-8 pb-5">
          <div className="flex items-center gap-3 mb-1">
            <span className="text-[28px] leading-none">🛡️</span>
            <div>
              <h1 className="text-[18px] font-bold tracking-tight text-[#F0F6FC]">
                Razorpay <span className="text-[#388BFD]">ResQ</span>
              </h1>
            </div>
          </div>
          <p className="text-[11px] text-[#5C6C7F] leading-tight mt-0.5">
            Autonomous Payment Recovery & Orchestration
          </p>
        </div>

        <div className="mx-6 h-px bg-[#1E2533]" />

        {/* Live System Health Badge */}
        <div className="px-6 py-4">
          <div className="bg-[#161B22] p-3 rounded-xl border border-[#242D3D] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#2EA043] animate-pulse" />
              <span className="text-[11px] font-semibold text-[#FAFAFA]">
                7 Bank Nodes Live
              </span>
            </div>
            <span className="text-[10px] text-[#2EA043] font-mono font-bold">
              99.2% SR
            </span>
          </div>
        </div>

        <div className="mx-6 h-px bg-[#1E2533]" />

        {/* Key Numbers */}
        <div className="px-6 py-4">
          <h3 className="text-[10px] font-bold text-[#5C6C7F] uppercase tracking-widest mb-4">
            Telemetry Key Stats
          </h3>
          <ul className="space-y-3.5">
            <SidebarStat
              label="ResQ Recovery Rate"
              value={summary ? `${summary.recovery_rate}%` : "—"}
              color="#388BFD"
            />
            <SidebarStat
              label="Recovered Revenue"
              value={
                summary
                  ? `₹${summary.total_recovered_value.toLocaleString("en-IN", {
                      maximumFractionDigits: 0,
                    })}`
                  : "—"
              }
              color="#2EA043"
            />
            <SidebarStat
              label="Dataset Processed"
              value="200 transactions"
              color="#F0F6FC"
            />
            <SidebarStat
              label="Incremental Lift"
              value={summary ? `+${recoveryLift}pp` : "—"}
              color="#2EA043"
            />
            <SidebarStat
              label="Transactions Rescued"
              value={summary ? `${summary.recovered_count}` : "—"}
              color="#388BFD"
            />
          </ul>
        </div>

        <div className="mx-6 h-px bg-[#1E2533]" />

        {/* Run CTA button */}
        <div className="px-6 py-5">
          <button
            onClick={runSimulation}
            disabled={loading || results.length > 0}
            className={`w-full py-3.5 px-4 rounded-xl font-semibold text-[13px] transition-all duration-300 cursor-pointer shadow-lg ${
              results.length > 0
                ? "bg-[#2EA043]/15 text-[#2EA043] border border-[#2EA043]/25"
                : loading
                  ? "bg-[#388BFD]/20 text-[#388BFD] border border-[#388BFD]/20"
                  : "bg-[#388BFD] text-white hover:bg-[#4D9CFF] animate-pulse-glow"
            }`}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2.5">
                <svg
                  className="animate-spin h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
                Processing 4 Agents…
              </span>
            ) : results.length > 0 ? (
              "✓ Analysis Complete"
            ) : (
              "▶ Run Multi-Agent Recovery"
            )}
          </button>
        </div>

        {/* Footer */}
        <div className="mt-auto px-6 pb-6">
          <div className="h-px bg-[#1E2533] mb-4" />
          <p className="text-[10px] text-[#3A4A5C] leading-relaxed">
            Razorpay AI Builder Track 3 Submission.
            <br />
            Powered by Multi-Agent AI & Claude.
          </p>
        </div>
      </aside>

      {/* ===== MAIN CONTENT ===== */}
      <main className="flex-1 min-w-0 overflow-y-auto bg-[#0E1117]">
        {/* Header */}
        <div className="px-10 pt-8 pb-2">
          <div className="flex items-center justify-between flex-wrap gap-4 mb-2">
            <div className="flex items-center gap-3">
              <span className="text-[32px] leading-none">🛡️</span>
              <div>
                <h1 className="text-[26px] font-bold tracking-tight text-[#F0F6FC]">
                  Razorpay <span className="text-[#388BFD]">ResQ</span>
                </h1>
                <p className="text-[12px] text-[#5C6C7F]">
                  Autonomous Multi-Agent Payment Failure Interception & Smart Orchestration Engine
                </p>
              </div>
            </div>

            {/* Enterprise Tag */}
            <div className="flex items-center gap-2 bg-[#161B22] border border-[#242D3D] px-3.5 py-1.5 rounded-full text-xs">
              <span className="w-2 h-2 rounded-full bg-[#2EA043]" />
              <span className="text-[#8B949E]">Track 3: AI Revenue Recovery</span>
            </div>
          </div>

          {/* Top Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6 mb-6">
            <MetricCard
              label="Autonomous Recovery Rate"
              value={summary ? `${summary.recovery_rate}%` : "—"}
              loaded={!!summary}
              sub={summary ? `Baseline: ${baselineRate}%` : undefined}
            />
            <MetricCard
              label="Net Recovery Lift"
              value={summary ? `+${recoveryLift}pp` : "—"}
              sub={summary ? "Over standard retry" : undefined}
              subColor="text-[#2EA043]"
              loaded={!!summary}
            />
            <MetricCard
              label="Scale: Failed Txns/Month"
              value="6M"
              sub="Across 300M+ Users"
              loaded={true}
            />
            <MetricCard
              label="Projected Revenue Rescued"
              value={
                summary
                  ? `₹${Math.round((summary.recovery_rate / 100) * 1200)}Cr/mo`
                  : "—"
              }
              sub={
                summary
                  ? `+₹${Math.round(((summary.recovery_rate - baselineRate) / 100) * 1200)}Cr/mo net lift`
                  : undefined
              }
              subColor="text-[#2EA043]"
              loaded={!!summary}
            />
          </div>

          {/* Impact Banner */}
          {summary && (
            <div className="bg-gradient-to-r from-[#0D2847] to-[#0D1F3C] border border-[#1E3A5F]/60 rounded-xl px-6 py-3.5 mb-6 animate-fade-in-up flex items-center justify-between flex-wrap gap-3">
              <p className="text-[12px] text-[#7EB6F0] leading-relaxed">
                🚀 At 300M users scale, PayRecover ResQ rescues an estimated{" "}
                <span className="text-[#F0F6FC] font-semibold">
                  ₹{Math.round((summary.recovery_rate / 100) * 1200)} crore/month
                </span>{" "}
                (
                <span className="text-[#2EA043] font-semibold">
                  +₹{Math.round(((summary.recovery_rate - baselineRate) / 100) * 1200)} Cr/mo
                </span>{" "}
                net incremental uplift) via autonomous 4-agent orchestration.
              </p>
              <span className="text-[11px] font-mono bg-[#388BFD]/20 text-[#7EB6F0] px-2.5 py-1 rounded border border-[#388BFD]/30">
                ACTIVE 4-AGENT CORE
              </span>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="bg-[#F85149]/10 border border-[#F85149]/30 rounded-xl px-5 py-4 text-[#F85149] text-sm mb-6">
              ⚠️ {error}
            </div>
          )}
        </div>

        {/* Tab Navigation */}
        <div className="px-10 border-b border-[#1E2533]">
          <div className="flex gap-6 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`pb-3.5 text-[13px] font-medium transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === tab.id ? "tab-active font-bold" : "tab-inactive"
                }`}
              >
                {tab.emoji} <span className="ml-1.5">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="px-10 py-8">
          {activeTab === "live-feed" && (
            <LiveFeedTab
              results={results}
              loading={loading}
              summary={summary}
              onRun={runSimulation}
            />
          )}
          {activeTab === "policy-sandbox" && (
            <PolicySandboxTab results={results} />
          )}
          {activeTab === "gateway-matrix" && <GatewayMatrixTab />}
          {activeTab === "revenue-recovery" && (
            <RevenueRecoveryTab results={results} summary={summary} />
          )}
          {activeTab === "multi-agent" && <MultiAgentTab />}
        </div>
      </main>
    </div>
  );
}

/* ---- Sub-components ---- */

function SidebarStat({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color: string;
}) {
  return (
    <li>
      <span className="text-[10px] text-[#5C6C7F] block mb-0.5">{label}</span>
      <span className="text-[13px] font-bold" style={{ color }}>
        {value}
      </span>
    </li>
  );
}

function MetricCard({
  label,
  value,
  sub,
  subColor,
  loaded,
}: {
  label: string;
  value: string;
  sub?: string;
  subColor?: string;
  loaded: boolean;
}) {
  return (
    <div className="bg-[#161B22] rounded-xl px-5 py-4 border border-[#1E2533] card-hover">
      <p className="text-[10px] text-[#5C6C7F] font-medium uppercase tracking-wider mb-2">
        {label}
      </p>
      <p
        className={`text-[24px] font-bold tracking-tight ${
          loaded ? "animate-count-up" : ""
        }`}
        style={{ color: "#F0F6FC" }}
      >
        {loaded ? value : "—"}
      </p>
      {sub && (
        <p className={`text-[10px] mt-1.5 font-medium ${subColor || "text-[#5C6C7F]"}`}>
          {sub}
        </p>
      )}
    </div>
  );
}

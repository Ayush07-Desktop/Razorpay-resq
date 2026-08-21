"use client";

export default function MultiAgentTab() {
  const agents = [
    {
      id: "agent_1",
      name: "Sentinel Telemetry Agent",
      role: "Real-Time Interception & Root-Cause Classification",
      badge: "AGENT 1 • INGESTION",
      color: "#388BFD",
      icon: "🛰️",
      latency: "< 3ms",
      description:
        "Hooks into checkout drop-off webhooks. Inspects HTTP response payloads, bank error sub-codes, and historical customer attempt counters to isolate exact root cause.",
      outputs: ["Error taxonomy classification", "Intent freshness score", "Idempotency validation"],
    },
    {
      id: "agent_2",
      name: "Smart Routing & Failover Agent",
      role: "Bank Switch Health Evaluation & Rail Optimization",
      badge: "AGENT 2 • TELEMETRY",
      color: "#2EA043",
      icon: "🌐",
      latency: "< 4ms",
      description:
        "Continuously monitors real-time success rates across SBI, HDFC, ICICI, and NPCI UPI switches. Detects localized bank downtime and computes redundant fallback rails.",
      outputs: ["Redundant gateway path", "Cross-rail shift recommendation", "Sub-50ms failover trigger"],
    },
    {
      id: "agent_3",
      name: "Behavioral Copywriter Agent",
      role: "Psychographic Nudge Generation & Timing",
      badge: "AGENT 3 • ENGAGEMENT",
      color: "#A371F7",
      icon: "🧠",
      latency: "< 8ms",
      description:
        "Selects the highest-conversion channel (WhatsApp Business, Transactional SMS, App Push, 1-Click UPI Intent) and synthesizes personalized, localized copy tailored to customer segment.",
      outputs: ["Channel selection matrix", "Dynamic deep-link generation", "Incentive / EMI offer pairing"],
    },
    {
      id: "agent_4",
      name: "Arbitrage, Scoring & Risk Agent",
      role: "Recovery Probability & Merchant Margin Optimization",
      badge: "AGENT 4 • SETTLEMENT",
      color: "#E6A817",
      icon: "⚖️",
      latency: "< 2ms",
      description:
        "Evaluates customer Lifetime Value (LTV) against communication delivery cost. Assigns final probability confidence score and orchestrates settlement simulation.",
      outputs: ["0–100% Recovery Probability", "Customer LTV preservation model", "Merchant net margin verification"],
    },
  ];

  return (
    <div className="space-y-6 sm:space-y-10 max-w-5xl">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-[#FAFAFA]">4-Agent Autonomous Multi-Agent Pipeline</h2>
        <p className="text-xs sm:text-sm text-[#8B949E] mt-0.5 sm:mt-1">
          PayRecover ResQ decomposes payment failure recovery into specialized autonomous agents operating with sub-15ms end-to-end latency.
        </p>
      </div>

      {/* Interactive Agent Flow Visualizer */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {agents.map((ag) => (
          <div
            key={ag.id}
            className="bg-[#161B22] p-4 sm:p-6 rounded-2xl border border-[#242D3D] flex flex-col justify-between card-hover relative overflow-hidden"
          >
            <div
              className="absolute top-0 left-0 h-1 w-full"
              style={{ backgroundColor: ag.color }}
            />
            <div>
              <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
                <span
                  className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border"
                  style={{
                    backgroundColor: `${ag.color}15`,
                    color: ag.color,
                    borderColor: `${ag.color}30`,
                  }}
                >
                  {ag.badge}
                </span>
                <span className="text-[11px] sm:text-xs font-mono text-[#8B949E]">
                  ⚡ Latency: <strong className="text-[#FAFAFA]">{ag.latency}</strong>
                </span>
              </div>

              <div className="flex items-center gap-3 mb-2">
                <span className="text-xl sm:text-2xl shrink-0">{ag.icon}</span>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-[#FAFAFA]">{ag.name}</h3>
                  <p className="text-xs text-[#8B949E]">{ag.role}</p>
                </div>
              </div>

              <p className="text-xs text-[#C9D1D9] leading-relaxed my-3">{ag.description}</p>
            </div>

            <div className="pt-3 border-t border-[#242D3D]">
              <span className="text-[10px] font-bold text-[#8B949E] uppercase block mb-1.5">
                Key Agent Deliverables
              </span>
              <ul className="space-y-1">
                {ag.outputs.map((out, i) => (
                  <li key={i} className="text-[11px] text-[#8B949E] flex items-center gap-2">
                    <span style={{ color: ag.color }}>•</span>
                    <span>{out}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>

      {/* Production Architecture & 300M Scale Table */}
      <div className="bg-[#161B22] p-4 sm:p-6 rounded-2xl border border-[#242D3D]">
        <h3 className="text-base sm:text-lg font-bold text-[#FAFAFA] mb-1 sm:mb-2">
          🌍 Enterprise Production Blueprint (300M+ Scale)
        </h3>
        <p className="text-xs text-[#8B949E] mb-4 sm:mb-6">
          Architectural mapping showing how this autonomous pipeline scales horizontally across Kafka event streams.
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-xs min-w-[540px]">
            <thead>
              <tr className="border-b border-[#242D3D]">
                <th className="text-left py-2.5 sm:py-3 px-3 sm:px-4 text-[#8B949E] font-semibold">Subsystem</th>
                <th className="text-left py-2.5 sm:py-3 px-3 sm:px-4 text-[#8B949E] font-semibold">Demo Sandbox</th>
                <th className="text-left py-2.5 sm:py-3 px-3 sm:px-4 text-[#8B949E] font-semibold">Production at Scale</th>
                <th className="text-left py-2.5 sm:py-3 px-3 sm:px-4 text-[#8B949E] font-semibold">SLA / Latency</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#242D3D]/50 text-[#C9D1D9]">
              <tr>
                <td className="py-2.5 sm:py-3 px-3 sm:px-4 font-semibold text-[#FAFAFA]">Event Ingestion</td>
                <td className="py-2.5 sm:py-3 px-3 sm:px-4 text-[#8B949E]">POST /api/recover</td>
                <td className="py-2.5 sm:py-3 px-3 sm:px-4 text-[#388BFD]">Apache Kafka Event Stream</td>
                <td className="py-2.5 sm:py-3 px-3 sm:px-4 font-mono text-[#2EA043]">p99 &lt; 8ms</td>
              </tr>
              <tr>
                <td className="py-2.5 sm:py-3 px-3 sm:px-4 font-semibold text-[#FAFAFA]">Multi-Agent Pipeline</td>
                <td className="py-2.5 sm:py-3 px-3 sm:px-4 text-[#8B949E]">TypeScript Orchestrator</td>
                <td className="py-2.5 sm:py-3 px-3 sm:px-4 text-[#388BFD]">Distributed Go / Rust Microservices (K8s)</td>
                <td className="py-2.5 sm:py-3 px-3 sm:px-4 font-mono text-[#2EA043]">p99 &lt; 15ms</td>
              </tr>
              <tr>
                <td className="py-2.5 sm:py-3 px-3 sm:px-4 font-semibold text-[#FAFAFA]">AI Reasoning (LLM)</td>
                <td className="py-2.5 sm:py-3 px-3 sm:px-4 text-[#8B949E]">Claude API + 18 Pattern Cache</td>
                <td className="py-2.5 sm:py-3 px-3 sm:px-4 text-[#388BFD]">Redis Embeddings + Async Batch Claude</td>
                <td className="py-2.5 sm:py-3 px-3 sm:px-4 font-mono text-[#2EA043]">&lt; 1ms (Cached)</td>
              </tr>
              <tr>
                <td className="py-2.5 sm:py-3 px-3 sm:px-4 font-semibold text-[#FAFAFA]">Nudge Dispatch</td>
                <td className="py-2.5 sm:py-3 px-3 sm:px-4 text-[#8B949E]">Device Simulator Drawer</td>
                <td className="py-2.5 sm:py-3 px-3 sm:px-4 text-[#388BFD]">Gupshup (WhatsApp) + Karix (SMS) + APNs/FCM</td>
                <td className="py-2.5 sm:py-3 px-3 sm:px-4 font-mono text-[#2EA043]">Sub-30s Dispatch</td>
              </tr>
              <tr>
                <td className="py-2.5 sm:py-3 px-3 sm:px-4 font-semibold text-[#FAFAFA]">Analytics & Audit</td>
                <td className="py-2.5 sm:py-3 px-3 sm:px-4 text-[#8B949E]">In-Memory Recharts</td>
                <td className="py-2.5 sm:py-3 px-3 sm:px-4 text-[#388BFD]">ClickHouse + Apache Pinot + Superset</td>
                <td className="py-2.5 sm:py-3 px-3 sm:px-4 font-mono text-[#2EA043]">Real-time OLAP</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Internship & Project Footer */}
      <div className="bg-gradient-to-r from-[#0D2847] to-[#0A192F] p-4 sm:p-6 rounded-2xl border border-[#1E3A5F] flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h4 className="text-xs sm:text-sm font-bold text-[#F0F6FC]">Razorpay AI Builder Internship — Track 3: AI Revenue Recovery</h4>
          <p className="text-[11px] sm:text-xs text-[#7EB6F0] mt-0.5">
            Designed and built with Next.js 16 (App Router), React 19, TypeScript, Recharts, and Claude AI.
          </p>
        </div>
        <span className="self-start sm:self-auto text-xs font-mono bg-[#388BFD]/20 text-[#7EB6F0] px-3 py-1.5 rounded-lg border border-[#388BFD]/30 shrink-0">
          PROD-READY ARCHITECTURE
        </span>
      </div>
    </div>
  );
}


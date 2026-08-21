"use client";

import { useState } from "react";
import { BANK_GATEWAY_NODES } from "@/lib/data/gateway-data";
import { BankNodeHealth } from "@/lib/types";

export default function GatewayMatrixTab() {
  const [nodes, setNodes] = useState<BankNodeHealth[]>(BANK_GATEWAY_NODES);
  const [simulatedOutage, setSimulatedOutage] = useState<boolean>(false);
  const [rerouteLog, setRerouteLog] = useState<string[]>([
    "09:41:02 • [SMART_ROUTER] HDFC PG: 98.4% SR, latency 142ms — Route optimal",
    "09:41:04 • [SMART_ROUTER] NPCI Central UPI: 99.6% SR, latency 82ms — Fast-lane intent enabled",
    "09:41:08 • [FAILOVER_AGENT] SBI Core Banking switch latency spike (460ms). Auto-rerouted 14 transactions to ICICI switch.",
  ]);

  const triggerSimulatedOutage = () => {
    if (!simulatedOutage) {
      // Degrade HDFC and trigger failovers
      setNodes((prev) =>
        prev.map((n) =>
          n.id === "node_hdfc"
            ? { ...n, status: "critical", successRate: 42.1, latencyMs: 1250, lastIncident: "SIMULATED OUTAGE: Bank gateway timeout threshold exceeded" }
            : n
        )
      );
      setSimulatedOutage(true);
      setRerouteLog((prev) => [
        `09:42:15 • [CRITICAL_ALERT] HDFC PG degradation detected (SR: 42.1%, latency 1250ms).`,
        `09:42:16 • [AUTO_FAILOVER] Intercepted 38 active HDFC transactions → Rerouted to ICICI Corporate Switch + NPCI UPI Intent fallback.`,
        `09:42:17 • [RECOVERY_CONFIRMED] Zero checkout drop-offs; 36/38 transactions recovered via redundant rail.`,
        ...prev,
      ]);
    } else {
      // Reset
      setNodes(BANK_GATEWAY_NODES);
      setSimulatedOutage(false);
      setRerouteLog((prev) => [
        `09:43:00 • [SYSTEM_NORMAL] Gateway health restored across all nodes.`,
        ...prev,
      ]);
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#FAFAFA]">Live Bank Gateway & UPI Health Matrix</h2>
          <p className="text-xs sm:text-sm text-[#8B949E] mt-0.5">
            Real-time telemetry and sub-50ms automated failover across Indian banking switches and UPI nodes.
          </p>
        </div>
        <button
          onClick={triggerSimulatedOutage}
          className={`w-full sm:w-auto justify-center px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-lg cursor-pointer flex items-center gap-2 shrink-0 ${
            simulatedOutage
              ? "bg-[#F85149] text-white hover:bg-[#ff645e] animate-pulse"
              : "bg-[#1C2333] hover:bg-[#2A3244] border border-[#2D3748] text-[#E6A817]"
          }`}
        >
          <span>⚡</span>
          {simulatedOutage ? "Reset Gateway Outage Simulation" : "Simulate Live Bank Outage"}
        </button>
      </div>

      {/* Gateway Node Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-5">
        {nodes.map((node) => {
          const isHealthy = node.status === "healthy";
          const isDegraded = node.status === "degraded";
          const isCritical = node.status === "critical";

          const statusColor = isHealthy
            ? "#2EA043"
            : isDegraded
              ? "#E6A817"
              : "#F85149";

          return (
            <div
              key={node.id}
              className={`p-4 sm:p-5 rounded-2xl border transition-all duration-300 ${
                isCritical
                  ? "bg-[#1E1117] border-[#F85149]/50 shadow-lg shadow-red-900/20"
                  : isDegraded
                    ? "bg-[#181611] border-[#E6A817]/40"
                    : "bg-[#161B22] border-[#242D3D] card-hover"
              }`}
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#8B949E] tracking-wider">
                    {node.type.replace("_", " ")}
                  </span>
                  <h3 className="text-sm sm:text-base font-bold text-[#FAFAFA]">{node.name}</h3>
                </div>
                <span
                  className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 shrink-0"
                  style={{
                    backgroundColor: `${statusColor}20`,
                    color: statusColor,
                    border: `1px solid ${statusColor}40`,
                  }}
                >
                  <span
                    className="w-1.5 h-1.5 rounded-full animate-pulse"
                    style={{ backgroundColor: statusColor }}
                  />
                  {node.status}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 py-3 border-y border-[#242D3D] text-xs">
                <div>
                  <span className="text-[10px] text-[#8B949E] block">Success Rate</span>
                  <span
                    className="text-sm sm:text-base font-bold"
                    style={{ color: statusColor }}
                  >
                    {node.successRate}%
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-[#8B949E] block">Average Latency</span>
                  <span className="text-sm sm:text-base font-bold text-[#FAFAFA]">
                    {node.latencyMs} ms
                  </span>
                </div>
              </div>

              <div className="mt-3 text-[11px] text-[#8B949E]">
                {node.lastIncident ? (
                  <p className="text-[#E6A817] text-[10px] leading-tight">
                    ⚠️ {node.lastIncident}
                  </p>
                ) : (
                  <p className="text-[#2EA043] text-[10px]">
                    ✓ Redundant failover route active & standby
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Real-Time Smart Reroute Audit Stream */}
      <div className="bg-[#0E1117] p-4 sm:p-6 rounded-2xl border border-[#242D3D]">
        <div className="flex items-center justify-between flex-wrap gap-2 mb-3 sm:mb-4">
          <h3 className="text-xs sm:text-sm font-bold text-[#FAFAFA] uppercase tracking-wider flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#2EA043] animate-ping" />
            Live Smart Failover Telemetry Stream
          </h3>
          <span className="text-[10px] text-[#8B949E] font-mono">AUTONOMOUS DISPATCH ACTIVE</span>
        </div>
        <div className="space-y-2 font-mono text-xs max-h-48 overflow-y-auto">
          {rerouteLog.map((log, idx) => (
            <div
              key={idx}
              className={`p-2.5 rounded-lg border text-[11px] leading-relaxed break-words ${
                log.includes("CRITICAL") || log.includes("OUTAGE")
                  ? "bg-[#F85149]/10 border-[#F85149]/30 text-[#F85149]"
                  : log.includes("FAILOVER") || log.includes("RECOVERY")
                    ? "bg-[#388BFD]/10 border-[#388BFD]/30 text-[#7EB6F0]"
                    : "bg-[#161B22] border-[#242D3D] text-[#8B949E]"
              }`}
            >
              {log}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}


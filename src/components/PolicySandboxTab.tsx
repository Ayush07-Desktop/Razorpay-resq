"use client";

import { useState, useMemo } from "react";
import { RecoveryResult } from "@/lib/types";

interface PolicySandboxTabProps {
  results: RecoveryResult[];
}

export default function PolicySandboxTab({ results }: PolicySandboxTabProps) {
  // Policy Knobs
  const [minConfidence, setMinConfidence] = useState<number>(40);
  const [discountPct, setDiscountPct] = useState<number>(2.0);
  const [enableWhatsApp, setEnableWhatsApp] = useState<boolean>(true);
  const [enableSMS, setEnableSMS] = useState<boolean>(true);
  const [enablePush, setEnablePush] = useState<boolean>(true);
  const [enableAutoReroute, setEnableAutoReroute] = useState<boolean>(true);
  const [selectedSegments, setSelectedSegments] = useState<string[]>([
    "high_value",
    "returning",
    "new",
  ]);

  // Recalculate simulation outcomes dynamically based on sandbox knobs
  const policyMetrics = useMemo(() => {
    if (results.length === 0) {
      return {
        eligibleTxns: 0,
        recoveredTxns: 0,
        recoveredGross: 0,
        commCost: 0,
        discountCost: 0,
        netProfit: 0,
        roiMultiplier: 0,
        recoveryRate: 0,
      };
    }

    let eligible = 0;
    let recoveredCount = 0;
    let gross = 0;
    let commCost = 0;
    let discountCost = 0;

    results.forEach((txn) => {
      // Check segment eligibility
      if (!selectedSegments.includes(txn.user_segment)) return;

      // Check confidence filter
      if (txn.recovery_probability < minConfidence) return;

      eligible++;

      // Channel cost
      const channel = txn.nudge?.channel;
      if (channel === "whatsapp" && enableWhatsApp) {
        commCost += 0.45; // ₹0.45 per WhatsApp template
      } else if (channel === "sms" && enableSMS) {
        commCost += 0.15; // ₹0.15 per transactional SMS
      } else if (channel === "push" && enablePush) {
        commCost += 0.01; // negligible
      }

      // Conversion uplift with discount incentive & routing
      let effectiveProb = txn.recovery_probability;
      if (discountPct > 0) effectiveProb += discountPct * 2.5; // +5% conversion per 2% discount
      if (enableAutoReroute && txn.failure_reason === "bank_server_error") effectiveProb += 12;

      // Simulated success with adjusted probability
      const isRecovered = txn.recovered || effectiveProb >= 60;

      if (isRecovered) {
        recoveredCount++;
        gross += txn.amount;
        if (discountPct > 0) {
          discountCost += (txn.amount * discountPct) / 100;
        }
      }
    });

    const totalCost = commCost + discountCost;
    const netProfit = gross - totalCost;
    const roiMultiplier = totalCost > 0 ? gross / totalCost : gross > 0 ? 100 : 0;
    const rate = eligible > 0 ? (recoveredCount / eligible) * 100 : 0;

    return {
      eligibleTxns: eligible,
      recoveredTxns: recoveredCount,
      recoveredGross: Math.round(gross),
      commCost: Math.round(commCost * 100) / 100,
      discountCost: Math.round(discountCost),
      netProfit: Math.round(netProfit),
      roiMultiplier: Math.round(roiMultiplier * 10) / 10,
      recoveryRate: Math.round(rate * 10) / 10,
    };
  }, [
    results,
    minConfidence,
    discountPct,
    enableWhatsApp,
    enableSMS,
    enablePush,
    enableAutoReroute,
    selectedSegments,
  ]);

  const toggleSegment = (seg: string) => {
    setSelectedSegments((prev) =>
      prev.includes(seg) ? prev.filter((s) => s !== seg) : [...prev, seg]
    );
  };

  // Presets
  const applyPreset = (preset: "max_recovery" | "cost_optimized" | "vip_only") => {
    if (preset === "max_recovery") {
      setMinConfidence(25);
      setDiscountPct(3.0);
      setEnableWhatsApp(true);
      setEnableSMS(true);
      setEnablePush(true);
      setEnableAutoReroute(true);
      setSelectedSegments(["high_value", "returning", "new"]);
    } else if (preset === "cost_optimized") {
      setMinConfidence(55);
      setDiscountPct(0);
      setEnableWhatsApp(false);
      setEnableSMS(true);
      setEnablePush(true);
      setEnableAutoReroute(true);
      setSelectedSegments(["high_value", "returning"]);
    } else if (preset === "vip_only") {
      setMinConfidence(30);
      setDiscountPct(2.0);
      setEnableWhatsApp(true);
      setEnableSMS(false);
      setEnablePush(false);
      setEnableAutoReroute(true);
      setSelectedSegments(["high_value"]);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <div className="flex items-center justify-between flex-wrap gap-4 mb-2">
          <div>
            <h2 className="text-2xl font-bold text-[#FAFAFA]">AI Policy & Strategy Sandbox</h2>
            <p className="text-sm text-[#8B949E]">
              Test what-if recovery strategies in real time. Adjust thresholds, channels, and incentive economics.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-[#8B949E]">Strategy Presets:</span>
            <button
              onClick={() => applyPreset("max_recovery")}
              className="bg-[#1C2333] hover:bg-[#2A3244] border border-[#2D3748] px-3 py-1.5 rounded-lg text-xs font-semibold text-[#388BFD] cursor-pointer"
            >
              🚀 Max Revenue
            </button>
            <button
              onClick={() => applyPreset("cost_optimized")}
              className="bg-[#1C2333] hover:bg-[#2A3244] border border-[#2D3748] px-3 py-1.5 rounded-lg text-xs font-semibold text-[#2EA043] cursor-pointer"
            >
              💰 Zero Cost
            </button>
            <button
              onClick={() => applyPreset("vip_only")}
              className="bg-[#1C2333] hover:bg-[#2A3244] border border-[#2D3748] px-3 py-1.5 rounded-lg text-xs font-semibold text-[#A371F7] cursor-pointer"
            >
              👑 VIP Protection
            </button>
          </div>
        </div>
      </div>

      {/* Grid: Controls on Left, Real-Time ROI Output on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Interactive Policy Knobs (7 cols) */}
        <div className="lg:col-span-7 space-y-6 bg-[#161B22] p-6 rounded-2xl border border-[#242D3D]">
          <h3 className="text-sm font-bold uppercase tracking-wider text-[#388BFD] flex items-center gap-2">
            <span>⚙️</span> Strategy Knobs & Thresholds
          </h3>

          {/* Slider 1: Confidence Cutoff */}
          <div>
            <div className="flex justify-between text-xs mb-2">
              <span className="font-semibold text-[#FAFAFA]">Minimum AI Confidence Threshold</span>
              <span className="font-bold text-[#388BFD] bg-[#388BFD]/10 px-2 py-0.5 rounded border border-[#388BFD]/20">
                {minConfidence}%
              </span>
            </div>
            <input
              type="range"
              min="20"
              max="80"
              step="5"
              value={minConfidence}
              onChange={(e) => setMinConfidence(Number(e.target.value))}
              className="w-full accent-[#388BFD] cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-[#8B949E] mt-1">
              <span>Aggressive (20%+)</span>
              <span>Balanced (40%)</span>
              <span>Conservative (80%)</span>
            </div>
          </div>

          {/* Slider 2: Dynamic Incentive Discount */}
          <div>
            <div className="flex justify-between text-xs mb-2">
              <span className="font-semibold text-[#FAFAFA]">Dynamic Recovery Incentive (Cashback / Discount)</span>
              <span className="font-bold text-[#2EA043] bg-[#2EA043]/10 px-2 py-0.5 rounded border border-[#2EA043]/20">
                {discountPct}% OFF
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="5"
              step="0.5"
              value={discountPct}
              onChange={(e) => setDiscountPct(Number(e.target.value))}
              className="w-full accent-[#2EA043] cursor-pointer"
            />
            <p className="text-[11px] text-[#8B949E] mt-1">
              Provides small temporary incentive for instant UPI payment. Models conversion uplift vs discount cost.
            </p>
          </div>

          {/* Channel Multi-Toggles */}
          <div>
            <span className="font-semibold text-xs text-[#FAFAFA] block mb-3">Communication & Routing Channels</span>
            <div className="grid grid-cols-2 gap-3">
              <label className="flex items-center gap-2.5 bg-[#0E1117] p-3 rounded-xl border border-[#242D3D] cursor-pointer">
                <input
                  type="checkbox"
                  checked={enableWhatsApp}
                  onChange={(e) => setEnableWhatsApp(e.target.checked)}
                  className="accent-[#25D366]"
                />
                <div>
                  <span className="text-xs font-semibold text-[#FAFAFA] block">WhatsApp Business</span>
                  <span className="text-[10px] text-[#8B949E]">₹0.45/msg • 89% read-rate</span>
                </div>
              </label>

              <label className="flex items-center gap-2.5 bg-[#0E1117] p-3 rounded-xl border border-[#242D3D] cursor-pointer">
                <input
                  type="checkbox"
                  checked={enableSMS}
                  onChange={(e) => setEnableSMS(e.target.checked)}
                  className="accent-[#388BFD]"
                />
                <div>
                  <span className="text-xs font-semibold text-[#FAFAFA] block">Transactional SMS</span>
                  <span className="text-[10px] text-[#8B949E]">₹0.15/msg • Instant fallback</span>
                </div>
              </label>

              <label className="flex items-center gap-2.5 bg-[#0E1117] p-3 rounded-xl border border-[#242D3D] cursor-pointer">
                <input
                  type="checkbox"
                  checked={enablePush}
                  onChange={(e) => setEnablePush(e.target.checked)}
                  className="accent-[#A371F7]"
                />
                <div>
                  <span className="text-xs font-semibold text-[#FAFAFA] block">App Push & UPI Deep-Link</span>
                  <span className="text-[10px] text-[#8B949E]">₹0.00 • Zero latency</span>
                </div>
              </label>

              <label className="flex items-center gap-2.5 bg-[#0E1117] p-3 rounded-xl border border-[#242D3D] cursor-pointer">
                <input
                  type="checkbox"
                  checked={enableAutoReroute}
                  onChange={(e) => setEnableAutoReroute(e.target.checked)}
                  className="accent-[#E6A817]"
                />
                <div>
                  <span className="text-xs font-semibold text-[#FAFAFA] block">Smart Bank Rerouting</span>
                  <span className="text-[10px] text-[#8B949E]">Automatic failover switch</span>
                </div>
              </label>
            </div>
          </div>

          {/* Segment Targeting */}
          <div>
            <span className="font-semibold text-xs text-[#FAFAFA] block mb-2">Target Customer Segments</span>
            <div className="flex gap-2">
              {[
                { id: "high_value", label: "High Value (VIP)", color: "#A371F7" },
                { id: "returning", label: "Returning Customers", color: "#388BFD" },
                { id: "new", label: "New Users", color: "#8B949E" },
              ].map((seg) => {
                const active = selectedSegments.includes(seg.id);
                return (
                  <button
                    key={seg.id}
                    onClick={() => toggleSegment(seg.id)}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                      active
                        ? "bg-[#1C2333] text-[#FAFAFA] border-[#388BFD]"
                        : "bg-[#0E1117] text-[#6E7681] border-[#242D3D]"
                    }`}
                  >
                    {active ? "✓ " : "+ "} {seg.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right: Dynamic Unit Economics & Net Profit (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-gradient-to-br from-[#0D2847] to-[#0A192F] p-6 rounded-2xl border border-[#1E3A5F] shadow-xl">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#7EB6F0]">
              LIVE POLICY UNIT ECONOMICS
            </span>
            <h3 className="text-xl font-bold text-[#F0F6FC] mt-1 mb-4">Net Merchant Yield</h3>

            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-white/10 text-xs">
                <span className="text-[#8B949E]">Gross Recovered Revenue</span>
                <span className="font-bold text-base text-[#2EA043]">
                  ₹{policyMetrics.recoveredGross.toLocaleString("en-IN")}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-white/10 text-xs">
                <span className="text-[#8B949E]">Communication Dispatch Costs</span>
                <span className="font-semibold text-[#F85149]">
                  -₹{policyMetrics.commCost.toLocaleString("en-IN")}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-white/10 text-xs">
                <span className="text-[#8B949E]">Dynamic Incentive Discount Cost</span>
                <span className="font-semibold text-[#F85149]">
                  -₹{policyMetrics.discountCost.toLocaleString("en-IN")}
                </span>
              </div>
              <div className="flex justify-between items-center pt-2 text-sm">
                <span className="font-bold text-[#FAFAFA]">Net Merchant Bottom-Line</span>
                <span className="font-extrabold text-lg text-[#388BFD]">
                  ₹{policyMetrics.netProfit.toLocaleString("en-IN")}
                </span>
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-white/10 grid grid-cols-2 gap-3 text-center">
              <div className="bg-[#0E1117]/60 p-3 rounded-xl">
                <span className="text-[10px] text-[#8B949E] block">Policy ROI</span>
                <span className="text-lg font-bold text-[#2EA043]">
                  {policyMetrics.roiMultiplier}x
                </span>
              </div>
              <div className="bg-[#0E1117]/60 p-3 rounded-xl">
                <span className="text-[10px] text-[#8B949E] block">Recovery Yield</span>
                <span className="text-lg font-bold text-[#F0F6FC]">
                  {policyMetrics.recoveryRate}%
                </span>
              </div>
            </div>
          </div>

          <div className="bg-[#161B22] p-5 rounded-2xl border border-[#242D3D] text-xs space-y-2">
            <p className="font-bold text-[#FAFAFA]">💡 Policy Insight</p>
            <p className="text-[#8B949E] leading-relaxed">
              With a dynamic {discountPct}% incentive and multi-channel fallback, the engine preserves high conversion
              on high-ticket items while maintaining a {policyMetrics.roiMultiplier}x recovery ROI over communication costs.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

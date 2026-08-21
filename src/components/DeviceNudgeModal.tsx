"use client";

import { useState } from "react";
import { RecoveryResult, NudgeChannel } from "@/lib/types";

interface DeviceNudgeModalProps {
  result: RecoveryResult;
  onClose: () => void;
}

export default function DeviceNudgeModal({ result, onClose }: DeviceNudgeModalProps) {
  const nudge = result.nudge;
  const [activeChannel, setActiveChannel] = useState<NudgeChannel>(nudge?.channel || "whatsapp");

  if (!nudge) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div
        className="relative w-full max-w-4xl bg-[#161B22] border border-[#2D3748] rounded-2xl shadow-2xl overflow-y-auto md:overflow-hidden flex flex-col md:flex-row max-h-[92vh] md:max-h-[88vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Left: Device Simulator */}
        <div className="md:w-1/2 bg-[#0A0D14] p-4 sm:p-6 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-[#1E2533]">
          {/* Channel selector tabs */}
          <div className="flex gap-2 p-1 bg-[#161B22] rounded-xl border border-[#2A3244] mb-3 sm:mb-4 w-full max-w-[280px]">
            <button
              onClick={() => setActiveChannel("whatsapp")}
              className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold transition-all cursor-pointer touch-target flex items-center justify-center ${
                activeChannel === "whatsapp"
                  ? "bg-[#25D366] text-black shadow"
                  : "text-[#8B949E] hover:text-[#FAFAFA]"
              }`}
            >
              WhatsApp
            </button>
            <button
              onClick={() => setActiveChannel("sms")}
              className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold transition-all cursor-pointer touch-target flex items-center justify-center ${
                activeChannel === "sms"
                  ? "bg-[#388BFD] text-white shadow"
                  : "text-[#8B949E] hover:text-[#FAFAFA]"
              }`}
            >
              SMS
            </button>
            <button
              onClick={() => setActiveChannel("push")}
              className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold transition-all cursor-pointer touch-target flex items-center justify-center ${
                activeChannel === "push"
                  ? "bg-[#A371F7] text-white shadow"
                  : "text-[#8B949E] hover:text-[#FAFAFA]"
              }`}
            >
              Push
            </button>
          </div>

          {/* Smartphone Frame */}
          <div className="w-[270px] xs:w-[290px] sm:w-[300px] h-[460px] sm:h-[500px] bg-[#12161F] rounded-[36px] sm:rounded-[40px] border-[5px] sm:border-[6px] border-[#2A3244] shadow-2xl relative overflow-hidden flex flex-col">
            {/* Notch / Dynamic Island */}
            <div className="h-6 w-full flex justify-between items-center px-4 sm:px-6 pt-2 text-[10px] text-[#8B949E]">
              <span>9:41</span>
              <div className="w-16 sm:w-20 h-3 sm:h-3.5 bg-black rounded-full mx-auto" />
              <span>5G 88%</span>
            </div>

            {/* Simulated Channel Screens */}
            {activeChannel === "whatsapp" && (
              <div className="flex-1 flex flex-col bg-[#0B141B] text-[#E9EDEF] overflow-y-auto">
                {/* WhatsApp Chat Header */}
                <div className="bg-[#1F2C34] px-3 py-2 flex items-center gap-2.5 border-b border-[#2A3942]">
                  <div className="w-8 h-8 rounded-full bg-[#00A884] flex items-center justify-center font-bold text-white text-xs shrink-0">
                    R
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1">
                      <p className="text-xs font-semibold truncate text-[#E9EDEF]">Razorpay Checkout</p>
                      <span className="text-[10px] text-[#00A884]">✓</span>
                    </div>
                    <p className="text-[9px] text-[#8696A0]">Official Business Account</p>
                  </div>
                </div>

                {/* WhatsApp Chat Body */}
                <div className="flex-1 p-3 space-y-2 text-xs">
                  <div className="bg-[#1F2C34] rounded-lg p-2.5 max-w-[95%] shadow text-[11px] leading-relaxed border-l-4 border-[#00A884]">
                    <p className="font-bold text-[#00A884] mb-1">{nudge.title}</p>
                    <p className="text-[#D1D7DB] whitespace-pre-line mb-2">{nudge.body}</p>
                    {nudge.incentiveOffer && (
                      <div className="bg-[#2A3942] rounded p-1.5 mb-2 text-[10px] text-[#F39C12] font-semibold flex items-center gap-1">
                        🎁 <span>{nudge.incentiveOffer}</span>
                      </div>
                    )}
                    <div className="mt-2 pt-2 border-t border-[#2A3942] flex justify-between items-center">
                      <span className="text-[9px] text-[#8696A0]">Delivered • {nudge.scheduledDelay}</span>
                      <span className="text-[9px] text-[#53BDEB]">✓✓</span>
                    </div>
                  </div>

                  {/* WhatsApp Quick Action Button */}
                  <div className="max-w-[95%]">
                    <a
                      href={nudge.ctaLink}
                      target="_blank"
                      rel="noreferrer"
                      className="block w-full text-center py-2 bg-[#00A884] hover:bg-[#008f6f] text-white font-semibold text-[11px] rounded-lg shadow transition-colors"
                    >
                      ⚡ {nudge.ctaText}
                    </a>
                  </div>
                </div>
              </div>
            )}

            {activeChannel === "sms" && (
              <div className="flex-1 flex flex-col bg-[#000000] text-white p-3 overflow-y-auto">
                <div className="text-center py-2 border-b border-[#222]">
                  <p className="text-xs font-bold text-[#388BFD]">VK-RAZORPAY</p>
                  <p className="text-[9px] text-[#666]">Transactional SMS • Verified</p>
                </div>
                <div className="mt-4 bg-[#1C1C1E] p-3 rounded-2xl rounded-tl-sm text-[11px] text-[#E5E5EA] leading-relaxed border border-[#2C2C2E]">
                  <p className="font-semibold text-[#388BFD] mb-1">{nudge.title}</p>
                  <p className="mb-2">{nudge.body}</p>
                  <div className="bg-[#2C2C2E] p-2 rounded-lg text-[10px] text-[#64D2FF] font-mono break-all">
                    🔗 {nudge.ctaLink}
                  </div>
                  <span className="block text-right text-[8px] text-[#8E8E93] mt-2">Today 9:42 AM</span>
                </div>
              </div>
            )}

            {activeChannel === "push" && (
              <div className="flex-1 flex flex-col bg-gradient-to-b from-[#1C1C1E] to-[#0A0A0C] p-4 text-white">
                <div className="text-center text-[10px] text-[#8E8E93] mt-6 sm:mt-8 mb-3 sm:mb-4">NOTIFICATION BANNER</div>
                <div className="bg-[#2C2C2E]/90 backdrop-blur-md p-3.5 rounded-2xl shadow-xl border border-white/10 text-xs">
                  <div className="flex items-center gap-2 mb-1.5">
                    <div className="w-5 h-5 rounded-md bg-[#388BFD] flex items-center justify-center font-bold text-[10px]">
                      R
                    </div>
                    <span className="font-semibold text-[11px]">Razorpay Security</span>
                    <span className="text-[9px] text-[#8E8E93] ml-auto">Now</span>
                  </div>
                  <p className="font-bold text-[11px] text-[#FAFAFA] mb-0.5">{nudge.title}</p>
                  <p className="text-[10px] text-[#D1D1D6] leading-relaxed mb-3">{nudge.body}</p>
                  <button className="w-full py-1.5 bg-[#388BFD] text-white text-[10px] font-semibold rounded-lg">
                    {nudge.ctaText}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right: Telemetry & Multi-Agent Rationale */}
        <div className="md:w-1/2 p-4 sm:p-6 flex flex-col overflow-y-auto">
          <div className="flex justify-between items-start mb-3 sm:mb-4">
            <div>
              <span className="text-[10px] font-bold text-[#388BFD] uppercase tracking-wider bg-[#388BFD]/10 px-2 py-0.5 rounded border border-[#388BFD]/20">
                Agent 3: Behavioral Output
              </span>
              <h3 className="text-base sm:text-lg font-bold text-[#F0F6FC] mt-1">Customer Recovery Experience</h3>
            </div>
            <button
              onClick={onClose}
              className="text-[#8B949E] hover:text-[#FAFAFA] text-lg font-bold p-1 cursor-pointer"
            >
              ✕
            </button>
          </div>

          <div className="space-y-3 sm:space-y-4 text-xs">
            <div className="bg-[#1C2333] p-3.5 sm:p-4 rounded-xl border border-[#2D3748]">
              <p className="text-[#8B949E] mb-1 font-semibold uppercase text-[10px]">Strategic Channel Selection</p>
              <p className="text-[#F0F6FC] font-medium leading-relaxed">{nudge.channelRationale}</p>
            </div>

            <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
              <div className="bg-[#1C2333] p-2.5 sm:p-3 rounded-lg border border-[#2D3748]">
                <span className="text-[#8B949E] block text-[10px]">Dispatch Timing</span>
                <span className="font-bold text-[#2EA043]">{nudge.scheduledDelay}</span>
              </div>
              <div className="bg-[#1C2333] p-2.5 sm:p-3 rounded-lg border border-[#2D3748]">
                <span className="text-[#8B949E] block text-[10px]">User Segment</span>
                <span className="font-bold text-[#388BFD] capitalize">{result.user_segment}</span>
              </div>
              <div className="bg-[#1C2333] p-2.5 sm:p-3 rounded-lg border border-[#2D3748]">
                <span className="text-[#8B949E] block text-[10px]">Recovery Value</span>
                <span className="font-bold text-[#F0F6FC]">₹{result.amount.toLocaleString("en-IN")}</span>
              </div>
              <div className="bg-[#1C2333] p-2.5 sm:p-3 rounded-lg border border-[#2D3748]">
                <span className="text-[#8B949E] block text-[10px]">AI Estimated LTV</span>
                <span className="font-bold text-[#A371F7]">₹{(result.estimated_ltv_impact || result.amount).toLocaleString("en-IN")}</span>
              </div>
            </div>

            {/* Multi-Agent Trace Snapshot */}
            <div className="bg-[#0E1117] p-3.5 sm:p-4 rounded-xl border border-[#2D3748]">
              <p className="text-[11px] font-bold text-[#F0F6FC] mb-2">⚡ Multi-Agent Execution Audit</p>
              <div className="space-y-2">
                {result.agent_traces?.map((trace) => (
                  <div key={trace.step} className="flex items-start gap-2 text-[11px]">
                    <span className="w-4 h-4 rounded-full bg-[#388BFD]/20 text-[#388BFD] font-bold flex items-center justify-center text-[9px] shrink-0 mt-0.5">
                      {trace.step}
                    </span>
                    <div>
                      <span className="font-semibold text-[#C9D1D9]">{trace.agentName}: </span>
                      <span className="text-[#8B949E]">{trace.action}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-[#242D3D] flex justify-end">
            <button
              onClick={onClose}
              className="w-full sm:w-auto bg-[#2D3748] hover:bg-[#3D4758] text-white px-5 py-2.5 rounded-xl font-semibold text-xs transition-colors cursor-pointer"
            >
              Close Simulator
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}


"use client";

import { useState, useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  LineChart,
  Line,
} from "recharts";
import { RecoveryResult, FailureReason } from "@/lib/types";

interface RevenueRecoveryTabProps {
  results: RecoveryResult[];
  summary: {
    total_transactions: number;
    total_value_at_risk: number;
    total_recovered_value: number;
    recovery_rate: number;
    recovered_count: number;
  } | null;
}

const FAILURE_LABELS: Record<FailureReason, string> = {
  otp_timeout: "OTP Timeout",
  network_drop: "Network Drop",
  upi_collect_expired: "UPI Collect Expired",
  bank_server_error: "Bank Server Error",
  card_declined: "Card Declined",
  insufficient_funds: "Insufficient Balance",
};

const BASELINE_RATES: Record<FailureReason, number> = {
  otp_timeout: 22,
  network_drop: 20,
  upi_collect_expired: 8,
  bank_server_error: 18,
  card_declined: 15,
  insufficient_funds: 5,
};

export default function RevenueRecoveryTab({
  results,
  summary,
}: RevenueRecoveryTabProps) {
  // Custom Merchant Calculator State
  const [merchantGmvCrore, setMerchantGmvCrore] = useState<number>(50); // ₹50 Cr / mo
  const [failureRatePct, setFailureRatePct] = useState<number>(8.5); // 8.5%
  const [avgTicketSize, setAvgTicketSize] = useState<number>(2500); // ₹2,500

  // No data state
  if (results.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="text-6xl mb-6">📊</div>
        <h2 className="text-2xl font-bold text-[#FAFAFA] mb-3">
          No Recovery Analytics Yet
        </h2>
        <p className="text-[#6B7B8D]">
          Run the AI Recovery Engine first to generate recovery projections and failure distribution models.
        </p>
      </div>
    );
  }

  const aiRecoveryRate = summary?.recovery_rate || 55;
  const baselineRate = 12;
  const netLift = aiRecoveryRate - baselineRate;

  // Custom Merchant ROI Calculations
  const merchantCalculations = useMemo(() => {
    const monthlyFailedGmv = (merchantGmvCrore * failureRatePct) / 100; // in Cr
    const baselineRecovered = (monthlyFailedGmv * baselineRate) / 100; // in Cr
    const aiRecovered = (monthlyFailedGmv * aiRecoveryRate) / 100; // in Cr
    const netMonthlyLift = aiRecovered - baselineRecovered; // in Cr
    const netAnnualizedLift = netMonthlyLift * 12; // in Cr

    const totalFailedTxns = Math.round((monthlyFailedGmv * 10000000) / avgTicketSize);
    const rescuedTxnsMonthly = Math.round((totalFailedTxns * netLift) / 100);

    return {
      monthlyFailedGmv: Math.round(monthlyFailedGmv * 10) / 10,
      baselineRecovered: Math.round(baselineRecovered * 10) / 10,
      aiRecovered: Math.round(aiRecovered * 10) / 10,
      netMonthlyLift: Math.round(netMonthlyLift * 10) / 10,
      netAnnualizedLift: Math.round(netAnnualizedLift * 10) / 10,
      totalFailedTxns,
      rescuedTxnsMonthly,
    };
  }, [merchantGmvCrore, failureRatePct, avgTicketSize, aiRecoveryRate, netLift]);

  // Before vs After data
  const beforeAfterData = [
    { name: "Without AI (Baseline)", rate: baselineRate, fill: "#F85149" },
    { name: "With PayRecover ResQ", rate: aiRecoveryRate, fill: "#388BFD" },
  ];

  // Grouped bar data by failure reason
  const byReasonData = useMemo(() => {
    const map = new Map<FailureReason, { total: number; recovered: number }>();
    results.forEach((r) => {
      const entry = map.get(r.failure_reason) || { total: 0, recovered: 0 };
      entry.total++;
      if (r.recovered) entry.recovered++;
      map.set(r.failure_reason, entry);
    });

    return Array.from(map.entries()).map(([reason, stats]) => ({
      name: FAILURE_LABELS[reason],
      baseline: BASELINE_RATES[reason],
      ai: Math.round((stats.recovered / stats.total) * 100),
    }));
  }, [results]);

  // 12-Month Projection
  const monthlyProjection = useMemo(() => {
    const monthlyFailedCrore = 1200; // ₹1200 Cr at 300M scale

    return Array.from({ length: 12 }, (_, i) => {
      const month = i + 1;
      const aiRate = Math.min(aiRecoveryRate + month * 1.2, aiRecoveryRate + 12);
      const baseRate = baselineRate + month * 0.1;
      return {
        month,
        withAI: Math.round((aiRate / 100) * monthlyFailedCrore),
        withoutAI: Math.round((baseRate / 100) * monthlyFailedCrore),
      };
    });
  }, [aiRecoveryRate]);

  return (
    <div className="space-y-10">
      <div>
        <h2 className="text-2xl font-bold text-[#FAFAFA] mb-1">Recovery Analytics & Enterprise ROI</h2>
        <p className="text-sm text-[#8B949E]">
          Performance benchmark metrics, comparative breakdown, and personalized merchant unit economics.
        </p>
      </div>

      {/* ===== INTERACTIVE MERCHANT ROI CALCULATOR ===== */}
      <div className="bg-[#161B22] p-6 rounded-2xl border border-[#242D3D] space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-2 border-b border-[#242D3D] pb-4">
          <div>
            <span className="text-[10px] font-bold text-[#2EA043] uppercase tracking-wider bg-[#2EA043]/10 px-2 py-0.5 rounded border border-[#2EA043]/20">
              Interactive ROI Simulator
            </span>
            <h3 className="text-lg font-bold text-[#FAFAFA] mt-1">Personalized Merchant Economics Calculator</h3>
          </div>
          <span className="text-xs text-[#8B949E]">Customize your store parameters below:</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="text-xs font-semibold text-[#8B949E] block mb-2">
              Monthly Store GMV (₹ Crore)
            </label>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="5"
                max="200"
                step="5"
                value={merchantGmvCrore}
                onChange={(e) => setMerchantGmvCrore(Number(e.target.value))}
                className="w-full accent-[#388BFD]"
              />
              <span className="font-bold text-sm text-[#FAFAFA] min-w-[60px] text-right">
                ₹{merchantGmvCrore} Cr
              </span>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-[#8B949E] block mb-2">
              Payment Failure Rate (%)
            </label>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="3"
                max="20"
                step="0.5"
                value={failureRatePct}
                onChange={(e) => setFailureRatePct(Number(e.target.value))}
                className="w-full accent-[#E6A817]"
              />
              <span className="font-bold text-sm text-[#FAFAFA] min-w-[60px] text-right">
                {failureRatePct}%
              </span>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-[#8B949E] block mb-2">
              Average Order Value (₹)
            </label>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="500"
                max="10000"
                step="500"
                value={avgTicketSize}
                onChange={(e) => setAvgTicketSize(Number(e.target.value))}
                className="w-full accent-[#2EA043]"
              />
              <span className="font-bold text-sm text-[#FAFAFA] min-w-[60px] text-right">
                ₹{avgTicketSize.toLocaleString("en-IN")}
              </span>
            </div>
          </div>
        </div>

        {/* Dynamic Calculation Output Banner */}
        <div className="bg-gradient-to-r from-[#0D2847] to-[#0A192F] p-5 rounded-xl border border-[#1E3A5F] grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <span className="text-[10px] uppercase font-bold text-[#8B949E] block mb-1">
              Monthly Value at Risk
            </span>
            <span className="text-xl font-bold text-[#F85149]">
              ₹{merchantCalculations.monthlyFailedGmv} Cr
            </span>
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-[#8B949E] block mb-1">
              Recovered by ResQ
            </span>
            <span className="text-xl font-bold text-[#388BFD]">
              ₹{merchantCalculations.aiRecovered} Cr/mo
            </span>
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-[#8B949E] block mb-1">
              Net Incremental Lift
            </span>
            <span className="text-xl font-bold text-[#2EA043]">
              +₹{merchantCalculations.netMonthlyLift} Cr/mo
            </span>
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-[#8B949E] block mb-1">
              Annualized Revenue Rescued
            </span>
            <span className="text-xl font-extrabold text-[#F0F6FC]">
              ₹{merchantCalculations.netAnnualizedLift} Cr/yr
            </span>
          </div>
        </div>
      </div>

      {/* Before vs After & Grouped Bar Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 bg-[#161B22] p-6 rounded-2xl border border-[#242D3D]">
          <h3 className="text-base font-bold text-[#FAFAFA] mb-4">
            Recovery Rate: Baseline vs ResQ
          </h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={beforeAfterData} barSize={80}>
              <CartesianGrid strokeDasharray="3 3" stroke="#242D3D" vertical={false} />
              <XAxis dataKey="name" stroke="#8B949E" fontSize={11} tickLine={false} />
              <YAxis stroke="#8B949E" fontSize={11} tickFormatter={(v) => `${v}%`} domain={[0, 70]} />
              <Tooltip
                contentStyle={{
                  background: "#161B22",
                  border: "1px solid #242D3D",
                  borderRadius: "8px",
                  color: "#FAFAFA",
                }}
                formatter={(value: unknown) => [`${value}%`, "Recovery Rate"]}
              />
              <Bar dataKey="rate" radius={[6, 6, 0, 0]}>
                {beforeAfterData.map((entry, index) => (
                  <rect key={index} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div className="flex justify-around text-center text-xs text-[#8B949E] mt-3">
            <div>
              <span className="text-lg font-bold text-[#F85149] block">{baselineRate}%</span>
              Standard Retry
            </div>
            <div>
              <span className="text-lg font-bold text-[#388BFD] block">{aiRecoveryRate}%</span>
              Autonomous ResQ
            </div>
          </div>
        </div>

        <div className="lg:col-span-7 bg-[#161B22] p-6 rounded-2xl border border-[#242D3D]">
          <h3 className="text-base font-bold text-[#FAFAFA] mb-4">
            Recovery Yield by Payment Failure Reason
          </h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={byReasonData} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="#242D3D" vertical={false} />
              <XAxis dataKey="name" stroke="#8B949E" fontSize={10} tickLine={false} />
              <YAxis stroke="#8B949E" fontSize={10} tickFormatter={(v) => `${v}%`} />
              <Tooltip
                contentStyle={{
                  background: "#161B22",
                  border: "1px solid #242D3D",
                  borderRadius: "8px",
                  color: "#FAFAFA",
                }}
                formatter={(value: unknown, name: unknown) => [
                  `${value}%`,
                  name === "baseline" ? "Baseline (12%)" : "PayRecover ResQ",
                ]}
              />
              <Legend wrapperStyle={{ color: "#8B949E", fontSize: "11px" }} />
              <Bar dataKey="baseline" fill="#F85149" radius={[3, 3, 0, 0]} barSize={20} name="Baseline" />
              <Bar dataKey="ai" fill="#388BFD" radius={[3, 3, 0, 0]} barSize={20} name="PayRecover ResQ" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 12-Month Projected Growth Curve */}
      <div className="bg-[#161B22] p-6 rounded-2xl border border-[#242D3D]">
        <h3 className="text-base font-bold text-[#FAFAFA] mb-1">
          12-Month Enterprise Recovery Trajectory at 300M Scale
        </h3>
        <p className="text-xs text-[#8B949E] mb-4">
          Models self-learning conversion improvement as the behavioral engine optimizes channel timings.
        </p>
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={monthlyProjection}>
            <CartesianGrid strokeDasharray="3 3" stroke="#242D3D" vertical={false} />
            <XAxis dataKey="month" stroke="#8B949E" fontSize={11} label={{ value: "Month", position: "insideBottom", offset: -5, fill: "#8B949E" }} />
            <YAxis stroke="#8B949E" fontSize={11} tickFormatter={(v) => `₹${v} Cr`} />
            <Tooltip
              contentStyle={{ background: "#161B22", border: "1px solid #242D3D", borderRadius: "8px", color: "#FAFAFA" }}
              formatter={(value: unknown, name: unknown) => [`₹${value} Cr`, name === "withAI" ? "With PayRecover ResQ" : "Without AI"]}
              labelFormatter={(label) => `Month ${label}`}
            />
            <Legend wrapperStyle={{ color: "#8B949E", fontSize: "11px" }} />
            <Line type="monotone" dataKey="withAI" stroke="#388BFD" strokeWidth={3} dot={{ fill: "#388BFD", r: 4 }} name="withAI" />
            <Line type="monotone" dataKey="withoutAI" stroke="#F85149" strokeWidth={2} strokeDasharray="5 5" dot={{ fill: "#F85149", r: 3 }} name="withoutAI" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

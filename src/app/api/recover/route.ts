import { NextRequest, NextResponse } from "next/server";
import { SEED_TRANSACTIONS } from "@/lib/data/seed-transactions";
import { executeMultiAgentRecovery } from "@/lib/ai/multi-agent-orchestrator";
import { RecoveryResult, Transaction } from "@/lib/types";

export const maxDuration = 60; // allow up to 60s for Claude API calls

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const transactionIds: string[] | undefined = body.transaction_ids;

    // Filter to requested transactions, or process all
    let transactions: Transaction[];
    if (transactionIds && transactionIds.length > 0) {
      transactions = SEED_TRANSACTIONS.filter((t) =>
        transactionIds.includes(t.transaction_id)
      );
    } else {
      transactions = SEED_TRANSACTIONS;
    }

    // Process all transactions through the multi-agent recovery engine
    const CONCURRENCY = 6;
    const results: RecoveryResult[] = [];

    for (let i = 0; i < transactions.length; i += CONCURRENCY) {
      const batch = transactions.slice(i, i + CONCURRENCY);
      const batchResults = await Promise.all(
        batch.map((txn) => executeMultiAgentRecovery(txn))
      );
      results.push(...batchResults);
    }

    // Calculate summary stats
    const totalAtRisk = results.reduce((sum, r) => sum + r.amount, 0);
    const totalRecovered = results.reduce(
      (sum, r) => sum + r.recovered_amount,
      0
    );
    const recoveredCount = results.filter((r) => r.recovered).length;

    return NextResponse.json({
      results,
      summary: {
        total_transactions: results.length,
        total_value_at_risk: Math.round(totalAtRisk * 100) / 100,
        total_recovered_value: Math.round(totalRecovered * 100) / 100,
        recovery_rate:
          Math.round((recoveredCount / results.length) * 100 * 10) / 10,
        recovered_count: recoveredCount,
      },
    });
  } catch (error) {
    console.error("Multi-Agent Recovery engine error:", error);
    return NextResponse.json(
      { error: "Multi-Agent Recovery engine failed" },
      { status: 500 }
    );
  }
}

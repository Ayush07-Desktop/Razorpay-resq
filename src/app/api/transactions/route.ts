import { NextResponse } from "next/server";
import { SEED_TRANSACTIONS } from "@/lib/data/seed-transactions";

export async function GET() {
  return NextResponse.json({ transactions: SEED_TRANSACTIONS });
}

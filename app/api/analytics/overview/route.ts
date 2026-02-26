import { NextRequest, NextResponse } from "next/server";
import { getTransactions } from "@/lib/data/store";
import { applyFilters } from "@/lib/analytics/filters";
import { computeMetrics } from "@/lib/analytics/aggregations";
import type { FilterParams } from "@/types/analytics";

export function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;

  const filters: FilterParams = {
    paymentMethod: searchParams.get("paymentMethod") ?? undefined,
    processor: searchParams.get("processor") ?? undefined,
    country: searchParams.get("country") ?? undefined,
    declineCategory: searchParams.get("declineCategory") ?? undefined,
    declineCode: searchParams.get("declineCode") ?? undefined,
    cardBin: searchParams.get("cardBin") ?? undefined,
    dateFrom: searchParams.get("dateFrom") ?? undefined,
    dateTo: searchParams.get("dateTo") ?? undefined,
  };

  const transactions = getTransactions();
  const filtered = applyFilters(transactions, filters);
  const metrics = computeMetrics(filtered);

  return NextResponse.json(metrics);
}

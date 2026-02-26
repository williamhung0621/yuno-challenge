import { NextRequest, NextResponse } from "next/server";
import { getTransactions } from "@/lib/data/store";
import { applyFilters } from "@/lib/analytics/filters";
import { aggregateBreakdown } from "@/lib/analytics/aggregations";
import type { FilterParams, BreakdownDimension } from "@/types/analytics";

export function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;

  const dimension = (searchParams.get("dimension") ?? "processor") as BreakdownDimension;

  const filters: FilterParams = {
    paymentMethod: searchParams.get("paymentMethod") ?? undefined,
    processor: searchParams.get("processor") ?? undefined,
    country: searchParams.get("country") ?? undefined,
    declineCategory: searchParams.get("declineCategory") ?? undefined,
    dateFrom: searchParams.get("dateFrom") ?? undefined,
    dateTo: searchParams.get("dateTo") ?? undefined,
  };

  const transactions = getTransactions();
  const filtered = applyFilters(transactions, filters);
  const breakdown = aggregateBreakdown(filtered, dimension);

  return NextResponse.json(breakdown);
}

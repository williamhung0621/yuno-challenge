import { format, eachDayOfInterval, parseISO } from "date-fns";
import type { Transaction } from "../data/types";
import type {
  OverviewResponse,
  BreakdownItem,
  BreakdownDimension,
  TimeSeriesGroup,
  DeclineCodeItem,
} from "../../types/analytics";

export function computeMetrics(transactions: Transaction[]): OverviewResponse {
  const total = transactions.length;
  const approved = transactions.filter((t) => t.status === "approved").length;
  const declined = total - approved;
  const approvalRate = total > 0 ? (approved / total) * 100 : 0;
  const declineRate = total > 0 ? (declined / total) * 100 : 0;
  const totalAmount = transactions.reduce((sum, t) => sum + t.amount, 0);

  return {
    total,
    approved,
    declined,
    approvalRate: Math.round(approvalRate * 100) / 100,
    declineRate: Math.round(declineRate * 100) / 100,
    totalAmount: Math.round(totalAmount * 100) / 100,
  };
}

export function aggregateBreakdown(
  transactions: Transaction[],
  dimension: BreakdownDimension
): BreakdownItem[] {
  const groups = new Map<string, { approved: number; declined: number }>();

  for (const t of transactions) {
    let key: string;
    switch (dimension) {
      case "processor":
        key = t.processor;
        break;
      case "paymentMethod":
        key = t.paymentMethod;
        break;
      case "country":
        key = t.country;
        break;
      case "declineCode":
        key = t.declineCode ?? "none";
        break;
      case "declineCategory":
        key = t.declineCategory ?? "none";
        break;
      default:
        key = "unknown";
    }

    const existing = groups.get(key) ?? { approved: 0, declined: 0 };
    if (t.status === "approved") {
      existing.approved++;
    } else {
      existing.declined++;
    }
    groups.set(key, existing);
  }

  const result: BreakdownItem[] = [];
  for (const [label, { approved, declined }] of groups) {
    const total = approved + declined;
    const declineRate = total > 0 ? (declined / total) * 100 : 0;
    const approvalRate = 100 - declineRate;
    result.push({
      label,
      total,
      approved,
      declined,
      declineRate: Math.round(declineRate * 100) / 100,
      approvalRate: Math.round(approvalRate * 100) / 100,
    });
  }

  return result.sort((a, b) => b.total - a.total);
}

export function aggregateTimeSeries(
  transactions: Transaction[],
  groupBy?: string
): TimeSeriesGroup[] {
  if (transactions.length === 0) return [];

  // Determine date range
  const dates = transactions.map((t) => parseISO(t.timestamp));
  const minDate = new Date(Math.min(...dates.map((d) => d.getTime())));
  const maxDate = new Date(Math.max(...dates.map((d) => d.getTime())));

  const allDates = eachDayOfInterval({ start: minDate, end: maxDate }).map((d) =>
    format(d, "yyyy-MM-dd")
  );

  if (!groupBy) {
    // Single series
    const byDate = new Map<string, { total: number; declined: number }>();
    for (const dateStr of allDates) {
      byDate.set(dateStr, { total: 0, declined: 0 });
    }

    for (const t of transactions) {
      const dateStr = format(parseISO(t.timestamp), "yyyy-MM-dd");
      const entry = byDate.get(dateStr);
      if (entry) {
        entry.total++;
        if (t.status === "declined") entry.declined++;
      }
    }

    const series = allDates.map((date) => {
      const entry = byDate.get(date) ?? { total: 0, declined: 0 };
      const declineRate =
        entry.total > 0 ? (entry.declined / entry.total) * 100 : 0;
      return {
        date,
        total: entry.total,
        declined: entry.declined,
        declineRate: Math.round(declineRate * 100) / 100,
      };
    });

    return [{ groupKey: "all", series }];
  }

  // Group by dimension
  const groupKeys = new Set<string>();
  for (const t of transactions) {
    let key: string;
    switch (groupBy) {
      case "processor":
        key = t.processor;
        break;
      case "paymentMethod":
        key = t.paymentMethod;
        break;
      case "country":
        key = t.country;
        break;
      default:
        key = "all";
    }
    groupKeys.add(key);
  }

  const result: TimeSeriesGroup[] = [];

  for (const groupKey of groupKeys) {
    const groupTxns = transactions.filter((t) => {
      switch (groupBy) {
        case "processor":
          return t.processor === groupKey;
        case "paymentMethod":
          return t.paymentMethod === groupKey;
        case "country":
          return t.country === groupKey;
        default:
          return true;
      }
    });

    const byDate = new Map<string, { total: number; declined: number }>();
    for (const dateStr of allDates) {
      byDate.set(dateStr, { total: 0, declined: 0 });
    }

    for (const t of groupTxns) {
      const dateStr = format(parseISO(t.timestamp), "yyyy-MM-dd");
      const entry = byDate.get(dateStr);
      if (entry) {
        entry.total++;
        if (t.status === "declined") entry.declined++;
      }
    }

    const series = allDates.map((date) => {
      const entry = byDate.get(date) ?? { total: 0, declined: 0 };
      const declineRate =
        entry.total > 0 ? (entry.declined / entry.total) * 100 : 0;
      return {
        date,
        total: entry.total,
        declined: entry.declined,
        declineRate: Math.round(declineRate * 100) / 100,
      };
    });

    result.push({ groupKey, series });
  }

  return result;
}

export function aggregateDeclineCodes(
  transactions: Transaction[]
): DeclineCodeItem[] {
  const declined = transactions.filter((t) => t.status === "declined");
  const totalDeclined = declined.length;

  const codeMap = new Map<
    string,
    { category: string; count: number; processors: Map<string, number> }
  >();

  for (const t of declined) {
    const code = t.declineCode ?? "unknown";
    const category = t.declineCategory ?? "unknown";
    const existing = codeMap.get(code) ?? {
      category,
      count: 0,
      processors: new Map(),
    };
    existing.count++;
    existing.processors.set(
      t.processor,
      (existing.processors.get(t.processor) ?? 0) + 1
    );
    codeMap.set(code, existing);
  }

  const items = Array.from(codeMap.entries())
    .map(([code, { category, count, processors }]) => {
      const topProcessors = Array.from(processors.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([p]) => p);
      return {
        code,
        category,
        count,
        percentOfDeclines:
          totalDeclined > 0
            ? Math.round((count / totalDeclined) * 10000) / 100
            : 0,
        topProcessors,
      };
    })
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  return items.map((item, i) => ({ rank: i + 1, ...item }));
}

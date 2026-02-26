"use client";

import { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useTimeSeries } from "@/hooks/useTimeSeries";
import { CHART_COLORS } from "@/lib/analytics/utils";
import type { FilterParams } from "@/types/analytics";
import { format, parseISO } from "date-fns";

const GROUP_BY_OPTIONS = [
  { value: "none", label: "Overall" },
  { value: "processor", label: "By Processor" },
  { value: "paymentMethod", label: "By Payment Method" },
  { value: "country", label: "By Country" },
];

interface TimeSeriesChartProps {
  filters: FilterParams;
}

export function TimeSeriesChart({ filters }: TimeSeriesChartProps) {
  const [groupBy, setGroupBy] = useState<string>("none");
  const { data, isLoading } = useTimeSeries(
    groupBy === "none" ? undefined : groupBy,
    filters
  );

  // Transform series-first data to recharts flat format
  const chartData = (() => {
    if (!data || data.length === 0) return [];
    // Collect all dates from first group (all groups have same dates)
    const dates = data[0].series.map((s) => s.date);
    return dates.map((date) => {
      const point: Record<string, unknown> = {
        date,
        label: format(parseISO(date), "MMM d"),
      };
      for (const group of data) {
        const s = group.series.find((x) => x.date === date);
        point[group.groupKey] = s?.declineRate ?? 0;
      }
      return point;
    });
  })();

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <CardTitle className="text-base">Decline Rate Over Time</CardTitle>
        <Select value={groupBy} onValueChange={setGroupBy}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {GROUP_BY_OPTIONS.map((o) => (
              <SelectItem key={o.value} value={o.value}>
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-64 w-full" />
        ) : !data || data.length === 0 ? (
          <div className="flex h-64 items-center justify-center text-muted-foreground">
            No data available
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart
              data={chartData}
              margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 11 }}
                interval={Math.ceil(chartData.length / 10)}
              />
              <YAxis
                tickFormatter={(v) => `${v}%`}
                domain={[0, 100]}
                tick={{ fontSize: 12 }}
              />
              <Tooltip formatter={(v: number | undefined) => [v != null ? `${v.toFixed(1)}%` : "N/A", ""]} />
              {data.length > 1 && <Legend />}
              <ReferenceLine
                y={22}
                stroke="#f59e0b"
                strokeDasharray="4 4"
                label={{ value: "22% baseline", fill: "#f59e0b", fontSize: 11 }}
              />
              {data.map((group, i) => (
                <Line
                  key={group.groupKey}
                  type="monotone"
                  dataKey={group.groupKey}
                  stroke={CHART_COLORS[i % CHART_COLORS.length]}
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}

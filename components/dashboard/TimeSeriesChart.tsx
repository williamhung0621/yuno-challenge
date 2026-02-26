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
  { value: "paymentMethod", label: "By Method" },
  { value: "country", label: "By Country" },
];

const GRID_COLOR = "oklch(0.22 0.026 255)";
const AXIS_COLOR = "oklch(0.57 0.022 258)";

interface TooltipEntry {
  dataKey: string;
  value: number;
  color: string;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipEntry[];
  label?: string;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg bg-popover border border-border px-3 py-2.5 shadow-xl text-xs min-w-[150px]">
      <div className="font-semibold text-foreground mb-2">{label}</div>
      <div className="space-y-1">
        {payload.map((entry) => (
          <div key={entry.dataKey} className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-1.5">
              <div
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-muted-foreground truncate max-w-[80px]">
                {entry.dataKey}
              </span>
            </div>
            <span className="font-mono font-semibold" style={{ color: entry.color }}>
              {entry.value?.toFixed(1)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

interface TimeSeriesChartProps {
  filters: FilterParams;
}

export function TimeSeriesChart({ filters }: TimeSeriesChartProps) {
  const [groupBy, setGroupBy] = useState<string>("none");
  const { data, isLoading } = useTimeSeries(
    groupBy === "none" ? undefined : groupBy,
    filters
  );

  const chartData = (() => {
    if (!data || data.length === 0) return [];
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
    <Card className="gap-0 py-0 overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between px-5 py-4 border-b border-border">
        <div>
          <CardTitle className="text-sm font-semibold">Decline Rate Over Time</CardTitle>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            Dashed line = 22% baseline
          </p>
        </div>
        <Select value={groupBy} onValueChange={setGroupBy}>
          <SelectTrigger className="w-44 h-7 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {GROUP_BY_OPTIONS.map((o) => (
              <SelectItem key={o.value} value={o.value} className="text-xs">
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardHeader>

      <CardContent className="px-4 pt-4 pb-4">
        {isLoading ? (
          <Skeleton className="h-[380px] w-full bg-muted/30" />
        ) : !data || data.length === 0 ? (
          <div className="flex h-[380px] items-center justify-center text-sm text-muted-foreground">
            No data available
          </div>
        ) : (
          <div className="h-[380px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ top: 10, right: 16, left: 0, bottom: 5 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke={GRID_COLOR}
                vertical={false}
              />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 11, fill: AXIS_COLOR }}
                tickLine={false}
                axisLine={{ stroke: GRID_COLOR }}
                interval={Math.ceil(chartData.length / 7)}
              />
              <YAxis
                tickFormatter={(v) => `${v}%`}
                domain={[0, 100]}
                tick={{ fontSize: 11, fill: AXIS_COLOR }}
                tickLine={false}
                axisLine={false}
                width={38}
              />
              <Tooltip content={<CustomTooltip />} />
              {data.length > 1 && (
                <Legend
                  wrapperStyle={{ fontSize: "11px", paddingTop: "12px", color: AXIS_COLOR }}
                />
              )}
              <ReferenceLine
                y={22}
                stroke="oklch(0.78 0.17 82)"
                strokeDasharray="5 4"
                strokeWidth={1.5}
              />
              {data.map((group, i) => (
                <Line
                  key={group.groupKey}
                  type="monotone"
                  dataKey={group.groupKey}
                  stroke={CHART_COLORS[i % CHART_COLORS.length]}
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 3, strokeWidth: 0 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

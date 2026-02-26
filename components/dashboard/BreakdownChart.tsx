"use client";

import { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
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
import { useBreakdown } from "@/hooks/useBreakdown";
import type { FilterParams, BreakdownDimension } from "@/types/analytics";

const DIMENSIONS: { value: BreakdownDimension; label: string }[] = [
  { value: "processor", label: "Processor" },
  { value: "paymentMethod", label: "Payment Method" },
  { value: "country", label: "Country" },
  { value: "declineCategory", label: "Decline Category" },
  { value: "declineCode", label: "Decline Code" },
];

// Colors for dark theme
const GRID_COLOR = "oklch(0.22 0.026 255)";
const AXIS_COLOR = "oklch(0.57 0.022 258)";
const BAR_NORMAL = "oklch(0.71 0.19 213)";   // cyan
const BAR_DANGER = "oklch(0.63 0.24 22)";    // rose

interface TooltipProps {
  active?: boolean;
  payload?: Array<{ value: number; payload: { label: string; total: number; approved: number } }>;
  label?: string;
}

function CustomTooltip({ active, payload }: TooltipProps) {
  if (!active || !payload?.length) return null;
  const d = payload[0];
  return (
    <div className="rounded-lg bg-popover border border-border px-3 py-2.5 shadow-xl text-xs min-w-[140px]">
      <div className="font-semibold text-foreground mb-2">{d.payload.label}</div>
      <div className="space-y-1">
        <div className="flex justify-between gap-4">
          <span className="text-muted-foreground">Decline rate</span>
          <span
            className={`font-mono font-semibold ${
              d.value > 60 ? "text-rose-400" : "text-primary"
            }`}
          >
            {d.value.toFixed(1)}%
          </span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-muted-foreground">Total txns</span>
          <span className="font-mono text-foreground">{d.payload.total}</span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-muted-foreground">Approved</span>
          <span className="font-mono text-emerald-400">{d.payload.approved}</span>
        </div>
      </div>
    </div>
  );
}

interface BreakdownChartProps {
  filters: FilterParams;
}

export function BreakdownChart({ filters }: BreakdownChartProps) {
  const [dimension, setDimension] = useState<BreakdownDimension>("processor");
  const { data, isLoading } = useBreakdown(dimension, filters);

  return (
    <Card className="gap-0 py-0 overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between px-5 py-4 border-b border-border">
        <div>
          <CardTitle className="text-sm font-semibold">Decline Rate by Dimension</CardTitle>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            Red bars indicate &gt;60% decline rate
          </p>
        </div>
        <Select
          value={dimension}
          onValueChange={(v) => setDimension(v as BreakdownDimension)}
        >
          <SelectTrigger className="w-44 h-7 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {DIMENSIONS.map((d) => (
              <SelectItem key={d.value} value={d.value} className="text-xs">
                {d.label}
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
            <BarChart
              data={data}
              margin={{ top: 10, right: 10, left: 0, bottom: 95 }}
              barCategoryGap="30%"
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke={GRID_COLOR}
                vertical={false}
              />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 11, fill: AXIS_COLOR }}
                angle={-45}
                textAnchor="end"
                interval={0}
                height={95}
                tickLine={false}
                axisLine={{ stroke: GRID_COLOR }}
              />
              <YAxis
                tickFormatter={(v) => `${v}%`}
                domain={[0, 100]}
                tick={{ fontSize: 11, fill: AXIS_COLOR }}
                tickLine={false}
                axisLine={false}
                width={38}
              />
              <Tooltip
                content={<CustomTooltip />}
                cursor={{ fill: "oklch(0.22 0.026 255 / 0.4)" }}
              />
              <Bar dataKey="declineRate" radius={[3, 3, 0, 0]} maxBarSize={56}>
                {data.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.declineRate > 60 ? BAR_DANGER : BAR_NORMAL}
                    fillOpacity={0.9}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

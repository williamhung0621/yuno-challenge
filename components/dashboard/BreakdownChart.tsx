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

interface BreakdownChartProps {
  filters: FilterParams;
}

export function BreakdownChart({ filters }: BreakdownChartProps) {
  const [dimension, setDimension] = useState<BreakdownDimension>("processor");
  const { data, isLoading } = useBreakdown(dimension, filters);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <CardTitle className="text-base">Decline Rate by Dimension</CardTitle>
        <Select
          value={dimension}
          onValueChange={(v) => setDimension(v as BreakdownDimension)}
        >
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {DIMENSIONS.map((d) => (
              <SelectItem key={d.value} value={d.value}>
                {d.label}
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
            <BarChart
              data={data}
              margin={{ top: 5, right: 20, left: 0, bottom: 60 }}
            >
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 12 }}
                angle={-30}
                textAnchor="end"
                interval={0}
              />
              <YAxis
                tickFormatter={(v) => `${v}%`}
                domain={[0, 100]}
                tick={{ fontSize: 12 }}
              />
              <Tooltip
                formatter={(value: number | undefined) => [
                  value != null ? `${value.toFixed(1)}%` : "N/A",
                  "Decline Rate",
                ]}
                labelFormatter={(label) => `${label}`}
              />
              <Bar dataKey="declineRate" radius={[4, 4, 0, 0]}>
                {data.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.declineRate > 60 ? "#ef4444" : "#6366f1"}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}

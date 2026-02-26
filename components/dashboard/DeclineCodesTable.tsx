"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useDeclineCodes } from "@/hooks/useDeclineCodes";
import type { FilterParams } from "@/types/analytics";

interface DeclineCodesTableProps {
  filters: FilterParams;
}

const CATEGORY_STYLES: Record<string, string> = {
  soft_decline: "text-amber-400 bg-amber-400/10 border-amber-400/20",
  hard_decline: "text-rose-400 bg-rose-400/10 border-rose-400/20",
  processing_error: "text-sky-400 bg-sky-400/10 border-sky-400/20",
};

const PROCESSOR_COLORS: Record<string, string> = {
  LatamPay: "text-rose-400 bg-rose-400/10 border-rose-400/20",
  dLocal: "text-amber-400 bg-amber-400/10 border-amber-400/20",
  AcquireMax: "text-primary bg-primary/10 border-primary/20",
  Kushki: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
};

export function DeclineCodesTable({ filters }: DeclineCodesTableProps) {
  const { data, isLoading, error } = useDeclineCodes(filters);

  return (
    <Card className="gap-0 py-0 overflow-hidden">
      <CardHeader className="px-5 py-4 border-b border-border">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-sm font-semibold">Top Decline Codes</CardTitle>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Ranked by frequency across all filtered transactions
            </p>
          </div>
          {data && (
            <div className="text-[11px] text-muted-foreground font-mono">
              {data.length} codes
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {isLoading ? (
          <div className="space-y-px p-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full bg-muted/20 rounded-md" />
            ))}
          </div>
        ) : error ? (
          <p className="text-sm text-destructive py-10 text-center">
            Failed to load decline codes
          </p>
        ) : !data || data.length === 0 ? (
          <p className="text-sm text-muted-foreground py-10 text-center">
            No decline codes in current filter set
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="w-10 text-[10px] uppercase tracking-wider text-muted-foreground pl-5">
                  #
                </TableHead>
                <TableHead className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  Code
                </TableHead>
                <TableHead className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  Category
                </TableHead>
                <TableHead className="text-right text-[10px] uppercase tracking-wider text-muted-foreground">
                  Count
                </TableHead>
                <TableHead className="text-[10px] uppercase tracking-wider text-muted-foreground w-52">
                  % of Declines
                </TableHead>
                <TableHead className="text-[10px] uppercase tracking-wider text-muted-foreground pr-5">
                  Top Processors
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((item) => (
                <TableRow
                  key={item.code}
                  className="border-border/50 hover:bg-muted/30 transition-colors"
                >
                  <TableCell className="font-mono text-xs text-muted-foreground w-10 pl-5">
                    {item.rank}
                  </TableCell>
                  <TableCell className="font-mono text-xs text-foreground">
                    {item.code}
                  </TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium ${
                        CATEGORY_STYLES[item.category] ??
                        "text-muted-foreground bg-muted/30 border-border"
                      }`}
                    >
                      {item.category.replace(/_/g, " ")}
                    </span>
                  </TableCell>
                  <TableCell className="text-right font-mono text-xs text-foreground">
                    {item.count}
                  </TableCell>
                  <TableCell className="w-52">
                    <div className="flex items-center gap-2.5">
                      <div className="flex-1 h-1.5 bg-muted/50 rounded-full overflow-hidden max-w-[80px]">
                        <div
                          className={`h-full rounded-full transition-all ${
                            item.percentOfDeclines > 30
                              ? "bg-rose-500"
                              : item.percentOfDeclines > 15
                              ? "bg-amber-500"
                              : "bg-primary"
                          }`}
                          style={{
                            width: `${Math.min(100, item.percentOfDeclines * 2)}%`,
                          }}
                        />
                      </div>
                      <span
                        className={`font-mono text-xs tabular-nums ${
                          item.percentOfDeclines > 30
                            ? "text-rose-400 font-semibold"
                            : item.percentOfDeclines > 15
                            ? "text-amber-400"
                            : "text-muted-foreground"
                        }`}
                      >
                        {item.percentOfDeclines.toFixed(1)}%
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="pr-5">
                    <div className="flex gap-1 flex-wrap">
                      {item.topProcessors.map((p) => (
                        <span
                          key={p}
                          className={`inline-flex items-center rounded-full border px-1.5 py-0.5 text-[10px] font-medium ${
                            PROCESSOR_COLORS[p] ??
                            "text-muted-foreground bg-muted/20 border-border"
                          }`}
                        >
                          {p}
                        </span>
                      ))}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}

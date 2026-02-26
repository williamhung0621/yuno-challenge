"use client";

import { Badge } from "@/components/ui/badge";
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

const CATEGORY_VARIANTS: Record<
  string,
  "default" | "secondary" | "destructive" | "outline"
> = {
  soft_decline: "secondary",
  hard_decline: "destructive",
  processing_error: "outline",
};

export function DeclineCodesTable({ filters }: DeclineCodesTableProps) {
  const { data, isLoading } = useDeclineCodes(filters);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Top Decline Codes</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        ) : !data || data.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4 text-center">
            No decline codes found
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">#</TableHead>
                <TableHead>Code</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">Count</TableHead>
                <TableHead className="text-right">% of Declines</TableHead>
                <TableHead>Top Processors</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((item) => (
                <TableRow key={item.code}>
                  <TableCell className="font-mono text-muted-foreground">
                    {item.rank}
                  </TableCell>
                  <TableCell className="font-mono text-sm">
                    {item.code}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        CATEGORY_VARIANTS[item.category] ?? "default"
                      }
                    >
                      {item.category.replace(/_/g, " ")}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {item.count}
                  </TableCell>
                  <TableCell className="text-right">
                    <span
                      className={
                        item.percentOfDeclines > 30
                          ? "text-red-600 font-semibold"
                          : ""
                      }
                    >
                      {item.percentOfDeclines.toFixed(1)}%
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1 flex-wrap">
                      {item.topProcessors.map((p) => (
                        <Badge key={p} variant="outline" className="text-xs">
                          {p}
                        </Badge>
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

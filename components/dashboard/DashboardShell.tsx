"use client";

import { useFilters } from "@/hooks/useFilters";
import { FilterPanel } from "./FilterPanel";
import { MetricsRow } from "./MetricsRow";
import { BreakdownChart } from "./BreakdownChart";
import { TimeSeriesChart } from "./TimeSeriesChart";
import { DeclineCodesTable } from "./DeclineCodesTable";

export function DashboardShell() {
  const { filters, setFilter, resetFilters } = useFilters();

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="w-[280px] shrink-0 border-r border-border bg-card">
        <div className="sticky top-0">
          <div className="flex items-center gap-2 border-b border-border px-4 py-3">
            <div className="h-6 w-6 rounded-sm bg-primary" />
            <span className="font-semibold text-sm">Luxara Analytics</span>
          </div>
          <FilterPanel
            filters={filters}
            onFilterChange={setFilter}
            onReset={resetFilters}
          />
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <div className="border-b border-border bg-card px-6 py-4">
          <h1 className="text-xl font-semibold">Decline Analytics Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Payment decline diagnostics · Jan 1 – Jan 21, 2025
          </p>
        </div>

        <div className="p-6 space-y-6">
          <MetricsRow filters={filters} />

          <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
            <BreakdownChart filters={filters} />
            <TimeSeriesChart filters={filters} />
          </div>

          <DeclineCodesTable filters={filters} />
        </div>
      </main>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { useFilters } from "@/hooks/useFilters";
import { FilterPanel } from "./FilterPanel";
import { MetricsRow } from "./MetricsRow";
import { BreakdownChart } from "./BreakdownChart";
import { TimeSeriesChart } from "./TimeSeriesChart";
import { DeclineCodesTable } from "./DeclineCodesTable";

function SunIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="4" />
      <line x1="12" y1="2" x2="12" y2="6" />
      <line x1="12" y1="18" x2="12" y2="22" />
      <line x1="4.93" y1="4.93" x2="7.76" y2="7.76" />
      <line x1="16.24" y1="16.24" x2="19.07" y2="19.07" />
      <line x1="2" y1="12" x2="6" y2="12" />
      <line x1="18" y1="12" x2="22" y2="12" />
      <line x1="4.93" y1="19.07" x2="7.76" y2="16.24" />
      <line x1="16.24" y1="7.76" x2="19.07" y2="4.93" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}

export function DashboardShell() {
  const { filters, setFilter, resetFilters } = useFilters();
  const [isDark, setIsDark] = useState(false);

  // Initialise from localStorage after mount (avoids SSR mismatch)
  useEffect(() => {
    const saved = localStorage.getItem("theme");
    if (saved === "dark") {
      setIsDark(true);
      document.documentElement.classList.add("dark");
    }
  }, []);

  const toggleTheme = () => {
    const next = !isDark;
    setIsDark(next);
    if (next) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };

  const activeFilterCount = Object.values(filters).filter(Boolean).length;

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="w-[268px] shrink-0 border-r border-border bg-sidebar flex flex-col">
        {/* Brand */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-sidebar-border">
          <div className="relative flex items-center justify-center w-7 h-7 rounded-md bg-primary/15 border border-primary/30">
            <div className="absolute bottom-1.5 left-1.5 w-[2px] h-3 bg-primary rounded-full" />
            <div className="absolute bottom-1.5 left-1.5 w-2.5 h-[2px] bg-primary rounded-full" />
            <div className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-primary/60 rounded-full" />
          </div>
          <div className="flex-1">
            <div className="text-xs font-semibold tracking-[0.15em] text-primary uppercase leading-none">
              Luxara
            </div>
            <div className="text-[10px] text-muted-foreground tracking-wider mt-0.5">
              Decline Analytics
            </div>
          </div>
        </div>

        {/* Filter panel */}
        <div className="flex-1 overflow-y-auto">
          <FilterPanel
            filters={filters}
            onFilterChange={setFilter}
            onReset={resetFilters}
          />
        </div>

        {/* Theme toggle — pinned to sidebar bottom */}
        <div className="border-t border-sidebar-border px-5 py-3">
          <button
            onClick={toggleTheme}
            className="flex items-center gap-2.5 w-full text-left text-[11px] text-muted-foreground hover:text-foreground transition-colors group"
          >
            <span className="flex items-center justify-center w-6 h-6 rounded-md border border-border bg-background group-hover:border-primary/40 transition-colors text-muted-foreground group-hover:text-primary">
              {isDark ? <SunIcon /> : <MoonIcon />}
            </span>
            {isDark ? "Light mode" : "Dark mode"}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 min-w-0 overflow-auto">
        {/* Sticky header */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-3.5 border-b border-border bg-background/90 backdrop-blur-sm">
          <div>
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-60" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
              </span>
              <h1 className="text-sm font-semibold tracking-tight">
                Decline Analytics
              </h1>
            </div>
            <p className="text-[11px] text-muted-foreground mt-0.5 ml-4">
              Jan 1 – Jan 21, 2025 · Payment diagnostics
            </p>
          </div>

          {activeFilterCount > 0 && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/25 text-xs text-primary">
              <div className="w-1.5 h-1.5 rounded-full bg-primary" />
              {activeFilterCount} filter{activeFilterCount > 1 ? "s" : ""} active
            </div>
          )}
        </div>

        {/* Dashboard content */}
        <div className="p-6 space-y-5">
          <MetricsRow filters={filters} />

          <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
            <BreakdownChart filters={filters} />
            <TimeSeriesChart filters={filters} />
          </div>

          <DeclineCodesTable filters={filters} />
        </div>
      </main>
    </div>
  );
}

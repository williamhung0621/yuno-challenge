"use client";

import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";
import type { FilterParams } from "@/types/analytics";

interface FilterPanelProps {
  filters: FilterParams;
  onFilterChange: (key: keyof FilterParams, value: string | undefined) => void;
  onReset: () => void;
}

const PROCESSORS = ["AcquireMax", "Kushki", "dLocal", "LatamPay"];
const PAYMENT_METHODS = ["credit_card", "debit_card", "pix", "oxxo", "pse"];
const COUNTRIES = ["MX", "CO", "AR", "BR"];
const DECLINE_CATEGORIES = ["soft_decline", "hard_decline", "processing_error"];
const DECLINE_CODES = [
  "issuer_unavailable",
  "insufficient_funds",
  "suspected_fraud",
  "card_expired",
  "invalid_card",
  "do_not_honor",
  "card_velocity_exceeded",
  "processing_error",
  "timeout",
  "network_error",
];

/** "credit_card" → "Credit Card" */
function formatLabel(str: string): string {
  return str.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground mb-2.5">
      {children}
    </div>
  );
}

function FilterSelect({
  label,
  value,
  options,
  onChange,
  placeholder,
}: {
  label: string;
  value: string | undefined;
  options: string[];
  onChange: (value: string | undefined) => void;
  placeholder: string;
}) {
  const isActive = !!value;
  return (
    <div className="space-y-1.5">
      <label className="text-[11px] font-medium text-muted-foreground flex items-center gap-1.5">
        {isActive && (
          <span className="w-1 h-1 rounded-full bg-primary inline-block" />
        )}
        {label}
      </label>
      <Select
        value={value ?? "all"}
        onValueChange={(v) => onChange(v === "all" ? undefined : v)}
      >
        <SelectTrigger
          className={`w-full h-8 text-xs ${
            isActive
              ? "border-primary/50 bg-primary/8 text-foreground"
              : "border-border bg-background/40 text-muted-foreground"
          }`}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">{placeholder}</SelectItem>
          {options.map((opt) => (
            <SelectItem key={opt} value={opt} className="text-xs">
              {formatLabel(opt)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

export function FilterPanel({ filters, onFilterChange, onReset }: FilterPanelProps) {
  const activeCount = Object.values(filters).filter(Boolean).length;

  // Local state for the BIN input so we don't fire a URL update on every keystroke
  const [binInput, setBinInput] = useState(filters.cardBin ?? "");

  function commitBin(value: string) {
    const trimmed = value.trim();
    onFilterChange("cardBin", trimmed || undefined);
  }

  return (
    <div className="px-4 py-4 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          Filters
        </span>
        {activeCount > 0 && (
          <button
            onClick={onReset}
            className="text-[10px] text-primary hover:text-primary/70 transition-colors tracking-wide"
          >
            Clear {activeCount}
          </button>
        )}
      </div>

      {/* Processor + Method */}
      <div className="space-y-3">
        <SectionLabel>Processor &amp; Method</SectionLabel>
        <FilterSelect
          label="Processor"
          value={filters.processor}
          options={PROCESSORS}
          onChange={(v) => onFilterChange("processor", v)}
          placeholder="All processors"
        />
        <FilterSelect
          label="Payment Method"
          value={filters.paymentMethod}
          options={PAYMENT_METHODS}
          onChange={(v) => onFilterChange("paymentMethod", v)}
          placeholder="All methods"
        />
      </div>

      {/* Geography */}
      <div className="space-y-3">
        <div className="h-px bg-border" />
        <SectionLabel>Geography</SectionLabel>
        <FilterSelect
          label="Country"
          value={filters.country}
          options={COUNTRIES}
          onChange={(v) => onFilterChange("country", v)}
          placeholder="All countries"
        />
      </div>

      {/* Decline type */}
      <div className="space-y-3">
        <div className="h-px bg-border" />
        <SectionLabel>Decline Type</SectionLabel>
        <FilterSelect
          label="Category"
          value={filters.declineCategory}
          options={DECLINE_CATEGORIES}
          onChange={(v) => onFilterChange("declineCategory", v)}
          placeholder="All categories"
        />
        <FilterSelect
          label="Decline Code"
          value={filters.declineCode}
          options={DECLINE_CODES}
          onChange={(v) => onFilterChange("declineCode", v)}
          placeholder="All codes"
        />
      </div>

      {/* Card BIN */}
      <div className="space-y-3">
        <div className="h-px bg-border" />
        <SectionLabel>Card BIN</SectionLabel>
        <div className="space-y-1.5">
          <label className="text-[11px] font-medium text-muted-foreground flex items-center gap-1.5">
            {filters.cardBin && (
              <span className="w-1 h-1 rounded-full bg-primary inline-block" />
            )}
            BIN Prefix
          </label>
          <input
            type="text"
            inputMode="numeric"
            maxLength={6}
            placeholder="e.g. 400001"
            value={binInput}
            onChange={(e) => setBinInput(e.target.value.replace(/\D/g, ""))}
            onBlur={(e) => commitBin(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") commitBin(binInput);
              if (e.key === "Escape") {
                setBinInput("");
                onFilterChange("cardBin", undefined);
              }
            }}
            className={`w-full h-8 rounded-md border px-2.5 text-xs bg-background/40 outline-none transition-colors
              ${filters.cardBin
                ? "border-primary/50 bg-primary/8 text-foreground"
                : "border-border text-muted-foreground"
              }
              focus:border-primary/50 focus:text-foreground placeholder:text-muted-foreground/50`}
          />
          <p className="text-[10px] text-muted-foreground">
            Enter 6 digits · press Enter to apply
          </p>
        </div>
      </div>

      {/* Date range */}
      <div className="space-y-3">
        <div className="h-px bg-border" />
        <SectionLabel>Date Range</SectionLabel>
        <div className="space-y-1.5">
          <label className="text-[11px] font-medium text-muted-foreground">From</label>
          <DatePicker
            value={filters.dateFrom}
            onChange={(v) => onFilterChange("dateFrom", v)}
            placeholder="Jan 1, 2025"
            fromDate={new Date("2025-01-01T12:00:00")}
            toDate={filters.dateTo ? new Date(filters.dateTo + "T12:00:00") : new Date("2025-01-21T12:00:00")}
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-[11px] font-medium text-muted-foreground">To</label>
          <DatePicker
            value={filters.dateTo}
            onChange={(v) => onFilterChange("dateTo", v)}
            placeholder="Jan 21, 2025"
            fromDate={filters.dateFrom ? new Date(filters.dateFrom + "T12:00:00") : new Date("2025-01-01T12:00:00")}
            toDate={new Date("2025-01-21T12:00:00")}
          />
        </div>
      </div>
    </div>
  );
}

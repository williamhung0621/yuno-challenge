"use client";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
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
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
        {label}
      </label>
      <Select
        value={value ?? "all"}
        onValueChange={(v) => onChange(v === "all" ? undefined : v)}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">{placeholder}</SelectItem>
          {options.map((opt) => (
            <SelectItem key={opt} value={opt}>
              {opt}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

export function FilterPanel({ filters, onFilterChange, onReset }: FilterPanelProps) {
  const hasActiveFilters = Object.values(filters).some(Boolean);

  return (
    <div className="space-y-5 p-4">
      <div>
        <h2 className="text-sm font-semibold">Filters</h2>
        <p className="text-xs text-muted-foreground mt-0.5">
          Narrow down transaction data
        </p>
      </div>

      <Separator />

      <FilterSelect
        label="Processor"
        value={filters.processor}
        options={PROCESSORS}
        onChange={(v) => onFilterChange("processor", v)}
        placeholder="All Processors"
      />

      <FilterSelect
        label="Payment Method"
        value={filters.paymentMethod}
        options={PAYMENT_METHODS}
        onChange={(v) => onFilterChange("paymentMethod", v)}
        placeholder="All Methods"
      />

      <FilterSelect
        label="Country"
        value={filters.country}
        options={COUNTRIES}
        onChange={(v) => onFilterChange("country", v)}
        placeholder="All Countries"
      />

      <FilterSelect
        label="Decline Category"
        value={filters.declineCategory}
        options={DECLINE_CATEGORIES}
        onChange={(v) => onFilterChange("declineCategory", v)}
        placeholder="All Categories"
      />

      <Separator />

      <div className="space-y-1.5">
        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          Date From
        </label>
        <input
          type="date"
          value={filters.dateFrom ?? ""}
          onChange={(e) =>
            onFilterChange("dateFrom", e.target.value || undefined)
          }
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          Date To
        </label>
        <input
          type="date"
          value={filters.dateTo ?? ""}
          onChange={(e) =>
            onFilterChange("dateTo", e.target.value || undefined)
          }
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
        />
      </div>

      {hasActiveFilters && (
        <Button variant="outline" className="w-full" onClick={onReset}>
          Reset Filters
        </Button>
      )}
    </div>
  );
}

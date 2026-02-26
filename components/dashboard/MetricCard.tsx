"use client";

import { Skeleton } from "@/components/ui/skeleton";

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  variant?: "default" | "danger" | "success" | "warning";
  isLoading?: boolean;
}

const VARIANT_STYLES = {
  default: {
    border: "border-l-primary/50",
    value: "text-foreground",
    glow: "",
  },
  success: {
    border: "border-l-emerald-500",
    value: "text-emerald-400",
    glow: "",
  },
  danger: {
    border: "border-l-rose-500",
    value: "text-rose-400",
    glow: "",
  },
  warning: {
    border: "border-l-amber-400",
    value: "text-amber-400",
    glow: "",
  },
};

export function MetricCard({
  title,
  value,
  subtitle,
  variant = "default",
  isLoading,
}: MetricCardProps) {
  const styles = VARIANT_STYLES[variant];

  return (
    <div
      className={`relative bg-card rounded-xl border border-border border-l-[3px] ${styles.border} px-5 py-4 transition-colors hover:border-border/80`}
    >
      <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground mb-3">
        {title}
      </div>

      {isLoading ? (
        <div className="space-y-2">
          <Skeleton className="h-8 w-28 bg-muted/50" />
          <Skeleton className="h-3 w-20 bg-muted/30" />
        </div>
      ) : (
        <>
          <div
            className={`text-[1.75rem] font-mono font-semibold leading-none tracking-tight ${styles.value}`}
          >
            {value}
          </div>
          {subtitle && (
            <p className="text-[11px] text-muted-foreground mt-2">{subtitle}</p>
          )}
        </>
      )}
    </div>
  );
}

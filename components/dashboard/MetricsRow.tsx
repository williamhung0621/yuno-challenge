"use client";

import { MetricCard } from "./MetricCard";
import { useOverview } from "@/hooks/useOverview";
import type { FilterParams } from "@/types/analytics";

interface MetricsRowProps {
  filters: FilterParams;
}

export function MetricsRow({ filters }: MetricsRowProps) {
  const { data, isLoading } = useOverview(filters);

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      <MetricCard
        title="Total Transactions"
        value={isLoading ? "-" : (data?.total ?? 0).toLocaleString()}
        isLoading={isLoading}
      />
      <MetricCard
        title="Approval Rate"
        value={isLoading ? "-" : `${data?.approvalRate?.toFixed(1)}%`}
        variant={
          !isLoading && data && data.approvalRate < 70 ? "danger" : "success"
        }
        isLoading={isLoading}
      />
      <MetricCard
        title="Decline Rate"
        value={isLoading ? "-" : `${data?.declineRate?.toFixed(1)}%`}
        variant={
          !isLoading && data && data.declineRate > 30 ? "danger" : "default"
        }
        isLoading={isLoading}
      />
      <MetricCard
        title="Total Volume"
        value={
          isLoading
            ? "-"
            : `$${(data?.totalAmount ?? 0).toLocaleString("en-US", {
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
              })}`
        }
        isLoading={isLoading}
      />
    </div>
  );
}

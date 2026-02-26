"use client";

import { useState, useEffect } from "react";
import type { TimeSeriesGroup, FilterParams } from "@/types/analytics";
import { filtersToQueryString } from "@/lib/analytics/utils";

export function useTimeSeries(groupBy: string | undefined, filters: FilterParams) {
  const [data, setData] = useState<TimeSeriesGroup[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsLoading(true);
    const qs = filtersToQueryString(filters);
    const groupByParam = groupBy ? `groupBy=${groupBy}` : "";
    const sep = qs && groupByParam ? "&" : "";
    const queryString = [groupByParam, qs].filter(Boolean).join(sep);
    fetch(`/api/analytics/timeseries${queryString ? `?${queryString}` : ""}`)
      .then((res) => res.json())
      .then((d) => {
        setData(d);
        setIsLoading(false);
      })
      .catch((e) => {
        setError(e.message);
        setIsLoading(false);
      });
  }, [
    groupBy,
    filters.paymentMethod,
    filters.processor,
    filters.country,
    filters.declineCategory,
    filters.declineCode,
    filters.cardBin,
    filters.dateFrom,
    filters.dateTo,
  ]);

  return { data, isLoading, error };
}

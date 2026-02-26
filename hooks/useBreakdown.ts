"use client";

import { useState, useEffect } from "react";
import type { BreakdownItem, BreakdownDimension, FilterParams } from "@/types/analytics";
import { filtersToQueryString } from "@/lib/analytics/utils";

export function useBreakdown(dimension: BreakdownDimension, filters: FilterParams) {
  const [data, setData] = useState<BreakdownItem[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsLoading(true);
    const qs = filtersToQueryString(filters);
    const sep = qs ? "&" : "";
    fetch(`/api/analytics/breakdown?dimension=${dimension}${sep}${qs}`)
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
    dimension,
    filters.paymentMethod,
    filters.processor,
    filters.country,
    filters.declineCategory,
    filters.dateFrom,
    filters.dateTo,
  ]);

  return { data, isLoading, error };
}

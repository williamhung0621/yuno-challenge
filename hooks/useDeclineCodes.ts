"use client";

import { useState, useEffect } from "react";
import type { DeclineCodeItem, FilterParams } from "@/types/analytics";
import { filtersToQueryString } from "@/lib/analytics/utils";

export function useDeclineCodes(filters: FilterParams) {
  const [data, setData] = useState<DeclineCodeItem[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsLoading(true);
    const qs = filtersToQueryString(filters);
    fetch(`/api/analytics/decline-codes${qs ? `?${qs}` : ""}`)
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

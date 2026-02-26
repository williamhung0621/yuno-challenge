"use client";

import { useCallback } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import type { FilterParams } from "@/types/analytics";

export function useFilters(): {
  filters: FilterParams;
  setFilter: (key: keyof FilterParams, value: string | undefined) => void;
  resetFilters: () => void;
} {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const filters: FilterParams = {
    paymentMethod: searchParams.get("paymentMethod") ?? undefined,
    processor: searchParams.get("processor") ?? undefined,
    country: searchParams.get("country") ?? undefined,
    declineCategory: searchParams.get("declineCategory") ?? undefined,
    declineCode: searchParams.get("declineCode") ?? undefined,
    cardBin: searchParams.get("cardBin") ?? undefined,
    dateFrom: searchParams.get("dateFrom") ?? undefined,
    dateTo: searchParams.get("dateTo") ?? undefined,
  };

  const setFilter = useCallback(
    (key: keyof FilterParams, value: string | undefined) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      router.replace(`${pathname}?${params.toString()}`);
    },
    [searchParams, router, pathname]
  );

  const resetFilters = useCallback(() => {
    router.replace(pathname);
  }, [router, pathname]);

  return { filters, setFilter, resetFilters };
}

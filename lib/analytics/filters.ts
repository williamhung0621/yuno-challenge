import type { Transaction } from "../data/types";
import type { FilterParams } from "../../types/analytics";

export function applyFilters(
  transactions: Transaction[],
  params: FilterParams
): Transaction[] {
  return transactions.filter((t) => {
    if (params.paymentMethod && t.paymentMethod !== params.paymentMethod) return false;
    if (params.processor && t.processor !== params.processor) return false;
    if (params.country && t.country !== params.country) return false;
    if (params.declineCategory && t.declineCategory !== params.declineCategory) return false;
    if (params.dateFrom) {
      const from = new Date(params.dateFrom);
      if (new Date(t.timestamp) < from) return false;
    }
    if (params.dateTo) {
      const to = new Date(params.dateTo);
      to.setHours(23, 59, 59, 999);
      if (new Date(t.timestamp) > to) return false;
    }
    return true;
  });
}

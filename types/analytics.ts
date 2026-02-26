// Shared request/response types (safe for client + server)

export interface FilterParams {
  paymentMethod?: string;
  processor?: string;
  country?: string;
  declineCategory?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface OverviewResponse {
  total: number;
  approved: number;
  declined: number;
  approvalRate: number;
  declineRate: number;
  totalAmount: number;
}

export interface BreakdownItem {
  label: string;
  total: number;
  approved: number;
  declined: number;
  declineRate: number;
  approvalRate: number;
}

export type BreakdownDimension =
  | "processor"
  | "paymentMethod"
  | "country"
  | "declineCode"
  | "declineCategory";

export interface TimeSeriesDataPoint {
  date: string;
  total: number;
  declined: number;
  declineRate: number;
}

export interface TimeSeriesGroup {
  groupKey: string;
  series: TimeSeriesDataPoint[];
}

export interface DeclineCodeItem {
  rank: number;
  code: string;
  category: string;
  count: number;
  percentOfDeclines: number;
  topProcessors: string[];
}

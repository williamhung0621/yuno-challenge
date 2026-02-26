export type TransactionStatus = "approved" | "declined";
export type PaymentMethod = "credit_card" | "debit_card" | "pix" | "oxxo" | "pse";
export type Processor = "AcquireMax" | "Kushki" | "dLocal" | "LatamPay";
export type Country = "MX" | "CO" | "AR" | "BR";
export type Currency = "MXN" | "COP" | "ARS" | "BRL";
export type DeclineCategory = "soft_decline" | "hard_decline" | "processing_error";

export type DeclineCode =
  | "issuer_unavailable"
  | "insufficient_funds"
  | "suspected_fraud"
  | "card_expired"
  | "invalid_card"
  | "do_not_honor"
  | "card_velocity_exceeded"
  | "processing_error"
  | "timeout"
  | "network_error";

export interface Transaction {
  id: string;
  timestamp: string;
  status: TransactionStatus;
  paymentMethod: PaymentMethod;
  processor: Processor;
  country: Country;
  currency: Currency;
  amount: number;
  declineCode: DeclineCode | null;
  declineCategory: DeclineCategory | null;
  cardBin: string | null;
}

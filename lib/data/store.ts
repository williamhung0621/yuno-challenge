import type { Transaction } from "./types";
import { generateTransactions } from "./seed";

let _transactions: Transaction[] | null = null;

export function getTransactions(): Transaction[] {
  if (!_transactions) {
    _transactions = generateTransactions();
  }
  return _transactions;
}

import { addDays, format, startOfDay } from "date-fns";
import type { Transaction, PaymentMethod, Processor, Country, Currency, DeclineCode, DeclineCategory } from "./types";

const START_DATE = new Date("2025-01-01T00:00:00.000Z");
const DAYS = 21;

const PROCESSORS: Processor[] = ["AcquireMax", "Kushki", "dLocal", "LatamPay"];
const COUNTRIES: Country[] = ["MX", "CO", "AR", "BR"];

const COUNTRY_METHODS: Record<Country, PaymentMethod[]> = {
  MX: ["credit_card", "debit_card", "oxxo"],
  CO: ["credit_card", "debit_card", "pse"],
  AR: ["credit_card", "debit_card"],
  BR: ["credit_card", "debit_card", "pix"],
};

const COUNTRY_CURRENCY: Record<Country, Currency> = {
  MX: "MXN",
  CO: "COP",
  AR: "ARS",
  BR: "BRL",
};

const PROCESSOR_VOLUME: Record<Processor, number> = {
  AcquireMax: 0.30,
  Kushki: 0.30,
  dLocal: 0.20,
  LatamPay: 0.20,
};

// Base decline rates (before time-based modifiers)
const PROCESSOR_BASE_DECLINE: Record<Processor, number> = {
  AcquireMax: 0.28,
  Kushki: 0.32,
  dLocal: 0.38,
  LatamPay: 0.75, // The culprit
};

const DECLINE_CODES_NORMAL: Array<[DeclineCode, DeclineCategory, number]> = [
  ["insufficient_funds", "soft_decline", 0.30],
  ["card_expired", "hard_decline", 0.15],
  ["suspected_fraud", "hard_decline", 0.10],
  ["do_not_honor", "soft_decline", 0.15],
  ["card_velocity_exceeded", "soft_decline", 0.10],
  ["invalid_card", "hard_decline", 0.10],
  ["processing_error", "processing_error", 0.05],
  ["timeout", "processing_error", 0.03],
  ["network_error", "processing_error", 0.02],
];

const DECLINE_CODES_CRISIS: Array<[DeclineCode, DeclineCategory, number]> = [
  ["issuer_unavailable", "processing_error", 0.40], // The spike signal
  ["insufficient_funds", "soft_decline", 0.20],
  ["suspected_fraud", "hard_decline", 0.10],
  ["card_expired", "hard_decline", 0.07],
  ["do_not_honor", "soft_decline", 0.07],
  ["invalid_card", "hard_decline", 0.06],
  ["card_velocity_exceeded", "soft_decline", 0.05],
  ["processing_error", "processing_error", 0.03],
  ["timeout", "processing_error", 0.01],
  ["network_error", "processing_error", 0.01],
];

const BAD_BINS = ["400001", "400002", "400003"];

function randomBetween(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

function weightedRandom<T>(items: Array<[T, number]>): T {
  const total = items.reduce((sum, [, w]) => sum + w, 0);
  let r = Math.random() * total;
  for (const [item, weight] of items) {
    r -= weight;
    if (r <= 0) return item;
  }
  return items[items.length - 1][0];
}

function getDeclineRate(day: number, processor: Processor): number {
  const base = PROCESSOR_BASE_DECLINE[processor];
  if (processor === "LatamPay") return base; // Always high

  if (day < 11) return base;
  if (day < 14) return base + (base * 0.10 * (day - 10)); // Degradation onset
  return base + (base * 0.20); // Crisis multiplier
}

let counter = 0;

function generateTransaction(day: number, baseDate: Date): Transaction {
  counter++;
  const id = `txn_${counter.toString().padStart(6, "0")}`;

  // Random time within the day
  const hour = Math.floor(randomBetween(0, 23));
  const minute = Math.floor(randomBetween(0, 59));
  const second = Math.floor(randomBetween(0, 59));
  const txDate = new Date(startOfDay(addDays(baseDate, day)));
  txDate.setHours(hour, minute, second);

  // Choose processor based on volume weights
  const processorItems: Array<[Processor, number]> = PROCESSORS.map(p => [p, PROCESSOR_VOLUME[p]]);
  const processor = weightedRandom(processorItems);

  // Choose country
  const country = COUNTRIES[Math.floor(Math.random() * COUNTRIES.length)] as Country;

  // Choose payment method based on country affinity
  const methods = COUNTRY_METHODS[country];
  const paymentMethod = methods[Math.floor(Math.random() * methods.length)];

  // Determine if card-based
  const isCard = paymentMethod === "credit_card" || paymentMethod === "debit_card";

  // Generate BIN for card payments
  let cardBin: string | null = null;
  if (isCard) {
    // 15% chance of being a "bad" BIN
    if (Math.random() < 0.15) {
      cardBin = BAD_BINS[Math.floor(Math.random() * BAD_BINS.length)];
    } else {
      cardBin = `4${Math.floor(10000 + Math.random() * 89999).toString()}`;
    }
  }

  // Determine decline rate
  let declineRate = getDeclineRate(day, processor);

  // Bad BIN multiplier
  if (cardBin && BAD_BINS.includes(cardBin)) {
    declineRate = Math.min(0.99, declineRate * 1.20);
  }

  // Determine status
  const status = Math.random() < declineRate ? "declined" : "approved";

  // If declined, pick a decline code
  let declineCode: DeclineCode | null = null;
  let declineCategory: DeclineCategory | null = null;

  if (status === "declined") {
    const isCrisis = day >= 14; // Days 15-21 (0-indexed: 14-20)
    const codes = isCrisis ? DECLINE_CODES_CRISIS : DECLINE_CODES_NORMAL;
    const codeItems: Array<[DeclineCode, number]> = codes.map(([code, , weight]) => [code, weight]);
    const categoryItems: Array<[DeclineCategory, number]> = codes.map(([, cat, weight]) => [cat, weight]);

    declineCode = weightedRandom(codeItems);
    // Get the category matching the chosen code
    const matchedEntry = codes.find(([code]) => code === declineCode);
    declineCategory = matchedEntry ? matchedEntry[1] : "processing_error";
  }

  // Generate amount
  const amount = Math.round(randomBetween(10, 500) * 100) / 100;

  return {
    id,
    timestamp: txDate.toISOString(),
    status,
    paymentMethod,
    processor,
    country,
    currency: COUNTRY_CURRENCY[country],
    amount,
    declineCode,
    declineCategory,
    cardBin,
  };
}

export function generateTransactions(): Transaction[] {
  counter = 0;
  const transactions: Transaction[] = [];

  for (let day = 0; day < DAYS; day++) {
    // ~30 transactions per day with some variance
    const txPerDay = Math.floor(randomBetween(25, 35));
    for (let i = 0; i < txPerDay; i++) {
      transactions.push(generateTransaction(day, START_DATE));
    }
  }

  return transactions.sort((a, b) =>
    new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );
}

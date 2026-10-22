// Business rules for ObraFácil pricing (keep in sync with the database function consume_quote).
export const FREE_QUOTES = 3;
export const PRICE_PER_QUOTE_USD = 1;
export const MONTHLY_PLAN_USD = 10;
export const PRICE_IDS = { perQuote: "presupuesto_1", monthly: "maestro_mensual" } as const;

export type Allowance = { subscribed: boolean; freeUsed: number; paidCredits: number };

export function freeLeft(a: Allowance) {
  return Math.max(0, FREE_QUOTES - a.freeUsed);
}

/** Can the user create one more quote right now? */
export function canCreateQuote(a: Allowance) {
  return a.subscribed || freeLeft(a) > 0 || a.paidCredits > 0;
}

/** Company name, logo and contact on quotes are only for monthly subscribers. */
export function canUseBranding(a: Allowance) {
  return a.subscribed;
}

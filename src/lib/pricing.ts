// Business rules for ObraFácil pricing (keep in sync with the database function consume_quote).
export const PRICE_PER_QUOTE_USD = 1;
export const MONTHLY_PLAN_USD = 10;
export const PRICE_IDS = { perQuote: "presupuesto_1", monthly: "maestro_mensual" } as const;

export type Allowance = {
  subscribed: boolean;
  freeUsed: number;
  paidCredits: number;
  /** When the free first month ends. The database starts it with the account's first quote. */
  trialEndsAt: string | null;
};

/** The first month is free and unlimited. */
export function inFreeMonth(a: Allowance, now: Date = new Date()) {
  return !!a.trialEndsAt && new Date(a.trialEndsAt) > now;
}

/** Can the user create one more quote right now? */
export function canCreateQuote(a: Allowance, now: Date = new Date()) {
  return a.subscribed || inFreeMonth(a, now) || a.paidCredits > 0;
}

/** Company name, logo and contact on quotes are only for monthly subscribers. */
export function canUseBranding(a: Allowance) {
  return a.subscribed;
}

/** "22 de noviembre" style date for the free-month notice, or null when there is none. */
export function freeMonthEnds(a: Allowance) {
  return a.trialEndsAt ? new Date(a.trialEndsAt).toLocaleDateString("es-MX", { day: "numeric", month: "long" }) : null;
}

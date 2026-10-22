import { describe, expect, it } from "vitest";
import { canCreateQuote, canUseBranding, inFreeMonth, type Allowance } from "@/lib/pricing";

const now = new Date("2026-10-22T12:00:00Z");
const base: Allowance = { subscribed: false, freeUsed: 0, paidCredits: 0, trialEndsAt: null };

describe("free first month", () => {
  it("allows quotes while the free month is running, with no quote count limit", () => {
    const inMonth: Allowance = { ...base, trialEndsAt: "2026-11-21T12:00:00Z", freeUsed: 40 };
    expect(inFreeMonth(inMonth, now)).toBe(true);
    expect(canCreateQuote(inMonth, now)).toBe(true);
  });

  it("blocks quotes the day the free month ends when nothing was paid", () => {
    const expired: Allowance = { ...base, trialEndsAt: "2026-09-21T12:00:00Z", freeUsed: 40 };
    expect(inFreeMonth(expired, now)).toBe(false);
    expect(canCreateQuote(expired, now)).toBe(false);
    expect(canCreateQuote(base, now)).toBe(false);
  });

  it("still allows quotes covered by paid credits after the month", () => {
    expect(canCreateQuote({ ...base, trialEndsAt: "2026-09-21T12:00:00Z", paidCredits: 1 }, now)).toBe(true);
  });

  it("keeps company branding for monthly subscribers only", () => {
    expect(canUseBranding({ ...base, subscribed: true })).toBe(true);
    expect(canUseBranding({ ...base, trialEndsAt: "2026-11-21T12:00:00Z" })).toBe(false);
  });
});

import { describe, expect, it } from "vitest";
import { canCreateQuote, canUseBranding, freeLeft, type Allowance } from "@/lib/pricing";

const base: Allowance = { subscribed: false, freeUsed: 0, paidCredits: 0 };

describe("3 free quotes", () => {
  it("allows quotes while free presupuestos remain", () => {
    expect(freeLeft(base)).toBe(3);
    expect(canCreateQuote(base)).toBe(true);
    expect(freeLeft({ ...base, freeUsed: 2 })).toBe(1);
    expect(canCreateQuote({ ...base, freeUsed: 2 })).toBe(true);
  });

  it("blocks quotes once the 3 free presupuestos are used and nothing was paid", () => {
    expect(freeLeft({ ...base, freeUsed: 3 })).toBe(0);
    expect(canCreateQuote({ ...base, freeUsed: 3 })).toBe(false);
  });

  it("still allows quotes covered by paid credits after the free ones", () => {
    expect(canCreateQuote({ ...base, freeUsed: 3, paidCredits: 1 })).toBe(true);
  });

  it("keeps company branding for monthly subscribers only", () => {
    expect(canUseBranding({ ...base, subscribed: true })).toBe(true);
    expect(canUseBranding(base)).toBe(false);
  });
});

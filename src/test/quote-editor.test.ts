import { describe, expect, it } from "vitest";
import { withTotals } from "@/components/QuoteEditor";

describe("edited quote totals", () => {
  it("recalculates each line as quantity × unit price", () => {
    const [a] = withTotals([{ description: "Láminas", qty: 20, unit_price: 35, total: 0 }]);
    expect(a!.total).toBe(700);
  });
  it("rounds to cents", () => {
    const [a] = withTotals([{ description: "x", qty: 3, unit_price: 0.333, total: 0 }]);
    expect(a!.total).toBe(1);
  });
});

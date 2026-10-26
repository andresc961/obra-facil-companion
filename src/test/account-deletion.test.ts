import { beforeEach, describe, expect, it, vi } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

const stripe = vi.hoisted(() => ({ retrieve: vi.fn(), cancel: vi.fn(), create: vi.fn() }));
vi.mock("@/lib/stripe.server", () => ({ createStripeClient: stripe.create }));
import { deleteOwnAccount } from "@/lib/account-deletion.server";

function mockDb(subscriptions: { stripe_subscription_id: string; environment: string }[] = [], failTable?: string) {
  const removed: { table: string; column: string; id: string }[] = [];
  const deleteUser = vi.fn().mockResolvedValue({ error: null });
  const db = {
    from: (table: string) => ({
      select: () => ({ eq: vi.fn().mockResolvedValue({ data: subscriptions, error: null }) }),
      delete: () => ({ eq: async (column: string, id: string) => {
        removed.push({ table, column, id });
        return { error: table === failTable ? new Error("failed") : null };
      } }),
    }),
    auth: { admin: { deleteUser } },
  } as unknown as SupabaseClient<Database>;
  return { db, removed, deleteUser };
}
beforeEach(() => {
  vi.clearAllMocks();
  stripe.create.mockReturnValue({ subscriptions: { retrieve: stripe.retrieve, cancel: stripe.cancel } });
  stripe.retrieve.mockResolvedValue({ id: "sub_live", status: "active" });
  stripe.cancel.mockResolvedValue({});
});
describe("self-service account deletion", () => {
  it("deletes all four requested tables only for the authenticated identity before deleting Auth", async () => {
    const { db, removed, deleteUser } = mockDb();
    deleteUser.mockImplementation(async () => { expect(removed).toHaveLength(4); return { error: null }; });
    await deleteOwnAccount(db, "signed-in-user");
    expect(removed).toEqual(["business_profiles", "quote_usage", "credit_purchases", "subscriptions"].map(table => ({ table, column: "user_id", id: "signed-in-user" })));
    expect(deleteUser).toHaveBeenCalledWith("signed-in-user");
  });
  it("cancels real subscriptions in both environments before removing billing mappings", async () => {
    const { db, removed } = mockDb([{ stripe_subscription_id: "sub_live", environment: "live" }, { stripe_subscription_id: "sub_test", environment: "sandbox" }]);
    stripe.cancel.mockImplementation(async () => { expect(removed).toHaveLength(0); return {}; });
    await deleteOwnAccount(db, "user");
    expect(stripe.create.mock.calls).toEqual([["live"], ["sandbox"]]);
    expect(stripe.cancel).toHaveBeenCalledTimes(2);
  });
  it("leaves account data intact when subscription cancellation fails", async () => {
    const { db, removed, deleteUser } = mockDb([{ stripe_subscription_id: "sub_live", environment: "live" }]);
    stripe.cancel.mockRejectedValue(new Error("unavailable"));
    await expect(deleteOwnAccount(db, "user")).rejects.toThrow();
    expect(removed).toHaveLength(0);
    expect(deleteUser).not.toHaveBeenCalled();
  });
  it("does not delete Auth if any requested table deletion fails", async () => {
    const { db, deleteUser } = mockDb([], "credit_purchases");
    await expect(deleteOwnAccount(db, "user")).rejects.toThrow();
    expect(deleteUser).not.toHaveBeenCalled();
  });
  it("skips free test entitlements that are not Stripe subscriptions", async () => {
    const { db } = mockDb([{ stripe_subscription_id: "test_access", environment: "sandbox" }]);
    await deleteOwnAccount(db, "user");
    expect(stripe.create).not.toHaveBeenCalled();
  });
  it("allows retrying an already canceled subscription", async () => {
    const { db, deleteUser } = mockDb([{ stripe_subscription_id: "sub_live", environment: "live" }]);
    stripe.retrieve.mockResolvedValue({ id: "sub_live", status: "canceled" });
    await deleteOwnAccount(db, "user");
    expect(stripe.cancel).not.toHaveBeenCalled();
    expect(deleteUser).toHaveBeenCalledOnce();
  });
  it("reports Auth deletion failure rather than claiming success", async () => {
    const { db, deleteUser } = mockDb();
    deleteUser.mockResolvedValue({ error: new Error("unavailable") });
    await expect(deleteOwnAccount(db, "user")).rejects.toThrow();
  });
});
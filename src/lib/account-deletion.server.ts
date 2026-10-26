import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import { createStripeClient } from "@/lib/stripe.server";

/** The caller must supply the authenticated identity, never a client-provided ID. */
export async function deleteOwnAccount(db: SupabaseClient<Database>, userId: string) {
  const { data: subscriptions, error: readError } = await db.from("subscriptions")
    .select("stripe_subscription_id, environment").eq("user_id", userId);
  if (readError) throw new Error("No pudimos comprobar tus suscripciones. Intenta de nuevo.");
  // Cancel first: never delete the only subscription mapping while billing continues.
  for (const sub of subscriptions ?? []) {
    if (!sub.stripe_subscription_id.startsWith("sub_")) continue;
    if (sub.environment !== "live" && sub.environment !== "sandbox") throw new Error("No pudimos comprobar tu plan.");
    try {
      const stripe = createStripeClient(sub.environment);
      const current = await stripe.subscriptions.retrieve(sub.stripe_subscription_id);
      if (current.status !== "canceled" && current.status !== "incomplete_expired") {
        await stripe.subscriptions.cancel(current.id);
      }
    } catch {
      throw new Error("No pudimos cancelar tu suscripción. Tu cuenta no se ha eliminado; intenta de nuevo.");
    }
  }
  for (const table of ["business_profiles", "quote_usage", "credit_purchases", "subscriptions"] as const) {
    const { error } = await db.from(table).delete().eq("user_id", userId);
    if (error) throw new Error("No pudimos eliminar todos tus datos. Intenta de nuevo para completar la eliminación.");
  }
  const { error } = await db.auth.admin.deleteUser(userId);
  if (error) throw new Error("No pudimos completar la eliminación de tu cuenta. Intenta de nuevo.");
  return { ok: true as const };
}
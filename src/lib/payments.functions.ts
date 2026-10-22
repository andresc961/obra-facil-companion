import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { type StripeEnv, createStripeClient, getStripeErrorMessage } from "@/lib/stripe.server";

const envOk = (e: unknown): StripeEnv => {
  if (e !== "sandbox" && e !== "live") throw new Error("Invalid environment");
  return e;
};

async function resolveOrCreateCustomer(
  stripe: ReturnType<typeof createStripeClient>,
  options: { email?: string | undefined; userId?: string | undefined },
): Promise<string> {
  if (options.userId && !/^[a-zA-Z0-9_-]+$/.test(options.userId)) throw new Error("Invalid userId");
  if (options.userId) {
    const found = await stripe.customers.search({ query: `metadata['userId']:'${options.userId}'`, limit: 1 });
    if (found.data[0]) return found.data[0].id;
  }
  if (options.email) {
    const existing = await stripe.customers.list({ email: options.email, limit: 1 });
    const customer = existing.data[0];
    if (customer) {
      if (options.userId && customer.metadata?.["userId"] !== options.userId) {
        await stripe.customers.update(customer.id, { metadata: { ...customer.metadata, userId: options.userId } });
      }
      return customer.id;
    }
  }
  const created = await stripe.customers.create({
    ...(options.email && { email: options.email }),
    ...(options.userId && { metadata: { userId: options.userId } }),
  });
  return created.id;
}

export const createCheckoutSession = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { priceId: string; quantity?: number; returnUrl: string; environment: StripeEnv }) => {
    if (data.priceId !== "presupuesto_1" && data.priceId !== "maestro_mensual") throw new Error("Invalid priceId");
    const quantity = Math.min(50, Math.max(1, Math.floor(data.quantity ?? 1)));
    return { ...data, quantity, environment: envOk(data.environment) };
  })
  .handler(async ({ data, context }): Promise<{ clientSecret: string } | { error: string }> => {
    try {
      const { userId, claims } = context;
      const email = (claims as { email?: string }).email;
      const stripe = createStripeClient(data.environment);
      const prices = await stripe.prices.list({ lookup_keys: [data.priceId] });
      const stripePrice = prices.data[0];
      if (!stripePrice) throw new Error("Price not found");
      const isRecurring = stripePrice.type === "recurring";
      const customerId = await resolveOrCreateCustomer(stripe, { email, userId });

      let productDescription: string | undefined;
      if (!isRecurring) {
        const productId = typeof stripePrice.product === "string" ? stripePrice.product : stripePrice.product.id;
        productDescription = (await stripe.products.retrieve(productId)).name;
      }

      const session = await stripe.checkout.sessions.create({
        line_items: [{ price: stripePrice.id, quantity: isRecurring ? 1 : data.quantity }],
        mode: isRecurring ? "subscription" : "payment",
        ui_mode: "embedded_page",
        return_url: data.returnUrl,
        customer: customerId,
        managed_payments: { enabled: true },
        ...(!isRecurring && { payment_intent_data: { description: productDescription } }),
        metadata: { userId, kind: isRecurring ? "subscription" : "quote_credits", quantity: String(data.quantity), managed_payments: "true" },
        ...(isRecurring && { subscription_data: { metadata: { userId } } }),
      } as Parameters<typeof stripe.checkout.sessions.create>[0]);

      return { clientSecret: session.client_secret ?? "" };
    } catch (error) {
      return { error: getStripeErrorMessage(error) };
    }
  });

export const createPortalSession = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { returnUrl?: string; environment: StripeEnv }) => ({ ...data, environment: envOk(data.environment) }))
  .handler(async ({ data, context }): Promise<{ url: string } | { error: string }> => {
    const { data: sub } = await context.supabase
      .from("subscriptions").select("stripe_customer_id")
      .eq("user_id", context.userId).eq("environment", data.environment)
      .order("created_at", { ascending: false }).limit(1).maybeSingle();
    if (!sub?.stripe_customer_id) return { error: "No tienes una suscripción." };
    if (!sub.stripe_customer_id.startsWith("cus_")) return { error: "Este Plan Maestro es un acceso de prueba gratis, sin cobro. No hay nada que administrar ni cancelar: termina solo en la fecha indicada." };
    try {
      const stripe = createStripeClient(data.environment);
      const portal = await stripe.billingPortal.sessions.create({
        customer: sub.stripe_customer_id,
        ...(data.returnUrl && { return_url: data.returnUrl }),
      });
      return { url: portal.url };
    } catch (error) {
      return { error: getStripeErrorMessage(error) };
    }
  });

/** The signed-in user's quota, plan and company info. */
export const getAccount = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { environment: StripeEnv }) => ({ environment: envOk(data.environment) }))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const [{ data: usage }, { data: subscribed }, { data: profile }, { data: sub }] = await Promise.all([
      supabase.from("quote_usage").select("free_used, paid_credits").eq("user_id", userId).eq("environment", data.environment).maybeSingle(),
      supabase.rpc("has_active_subscription", { user_uuid: userId, check_env: data.environment }),
      supabase.from("business_profiles").select("company_name, phone, email, address, logo_url").eq("user_id", userId).maybeSingle(),
      supabase.from("subscriptions").select("status, current_period_end, cancel_at_period_end").eq("user_id", userId).eq("environment", data.environment).order("created_at", { ascending: false }).limit(1).maybeSingle(),
    ]);
    return {
      subscribed: !!subscribed,
      freeUsed: usage?.free_used ?? 0,
      paidCredits: usage?.paid_credits ?? 0,
      profile: profile ?? null,
      subscription: sub ?? null,
    };
  });

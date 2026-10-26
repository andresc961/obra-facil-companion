import { createFileRoute } from "@tanstack/react-router";
import { type StripeEnv, verifyWebhook } from "@/lib/stripe.server";

async function admin() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin;
}

function priceIdOf(item: any) {
  return item?.price?.lookup_key || item?.price?.metadata?.lovable_external_id || item?.price?.id;
}
const iso = (s?: number | null) => (s ? new Date(s * 1000).toISOString() : null);

async function upsertSubscription(subscription: any, env: StripeEnv) {
  const userId = subscription.metadata?.userId;
  if (!userId) return console.error("No userId in subscription metadata");
  const item = subscription.items?.data?.[0];
  const db = await admin();
  const { data: owner, error: ownerError } = await db.auth.admin.getUserById(userId);
  if (ownerError && ownerError.status !== 404) throw ownerError;
  if (!owner.user) return; // Late events must not recreate deleted accounts' data.
  await db.from("subscriptions").upsert(
    {
      user_id: userId,
      stripe_subscription_id: subscription.id,
      stripe_customer_id: subscription.customer,
      product_id: String(item?.price?.product ?? ""),
      price_id: priceIdOf(item),
      status: subscription.status,
      current_period_start: iso(item?.current_period_start ?? subscription.current_period_start),
      current_period_end: iso(item?.current_period_end ?? subscription.current_period_end),
      cancel_at_period_end: subscription.cancel_at_period_end || false,
      environment: env,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "stripe_subscription_id" },
  );
}

async function grantCredits(session: any, env: StripeEnv) {
  if (session.mode !== "payment" || session.metadata?.kind !== "quote_credits") return;
  const userId = session.metadata?.userId;
  const qty = parseInt(session.metadata?.quantity ?? "1", 10);
  if (!userId || !qty) return;
  const db = await admin();
  const { data: owner, error: ownerError } = await db.auth.admin.getUserById(userId);
  if (ownerError && ownerError.status !== 404) throw ownerError;
  if (!owner.user) return;
  await db.rpc("add_quote_credits", { _session: session.id, _user: userId, _qty: qty, _env: env });
}

export const Route = createFileRoute("/api/public/payments/webhook")({
  staticData: { sitemap: false },
  server: {
    handlers: {
      POST: async ({ request }) => {
        const rawEnv = new URL(request.url).searchParams.get("env");
        if (rawEnv !== "sandbox" && rawEnv !== "live") return Response.json({ received: true, ignored: "invalid env" });
        const env: StripeEnv = rawEnv;
        try {
          const event = await verifyWebhook(request, env);
          const obj = event.data.object;
          switch (event.type) {
            case "customer.subscription.created":
            case "customer.subscription.updated":
            case "customer.subscription.deleted":
              await upsertSubscription(obj, env);
              break;
            case "checkout.session.completed":
              if (obj.payment_status !== "unpaid") await grantCredits(obj, env);
              break;
            case "checkout.session.async_payment_succeeded":
              await grantCredits(obj, env);
              break;
            default:
              console.log("Unhandled event:", event.type);
          }
          return Response.json({ received: true });
        } catch (e) {
          console.error("Webhook error:", e);
          return new Response("Webhook error", { status: 400 });
        }
      },
    },
  },
});

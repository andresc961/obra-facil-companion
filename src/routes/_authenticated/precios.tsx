import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, Check, Minus, Plus } from "lucide-react";
import { StripeEmbeddedCheckout } from "@/components/StripeEmbeddedCheckout";
import { PaymentTestModeBanner } from "@/components/PaymentTestModeBanner";
import { useAccount } from "@/hooks/use-account";
import { MONTHLY_PLAN_USD, PRICE_IDS, PRICE_PER_QUOTE_USD, freeLeft } from "@/lib/pricing";

export const Route = createFileRoute("/_authenticated/precios")({
  head: () => ({
    meta: [
      { title: "Precios ObraFácil — $1 por presupuesto o $10 al mes" },
      { name: "description", content: "Paga $1 por presupuesto o $10 al mes por presupuestos ilimitados con tu logo." },
      { property: "og:title", content: "Precios ObraFácil" },
      { property: "og:description", content: "$1 por presupuesto o $10 al mes ilimitado." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Pricing,
});

function Pricing() {
  const { data: acc } = useAccount();
  const [qty, setQty] = useState(5);
  const [checkout, setCheckout] = useState<{ priceId: string; quantity?: number } | null>(null);

  return (
    <main className="min-h-screen bg-background pb-16 font-sans text-foreground">
      <PaymentTestModeBanner />
      <div className="mx-auto max-w-xl px-5">
        <header className="flex items-center gap-3 py-4">
          <Link to="/grabar" className="rounded-lg bg-card p-2"><ArrowLeft className="h-5 w-5" /></Link>
          <span className="font-display text-xl">Elige cómo pagar</span>
        </header>

        {acc && (
          <p className="rounded-xl bg-card p-4 text-sm">
            {acc.subscribed ? "✅ Tienes el Plan Maestro activo." : `Te quedan ${freeLeft(acc)} gratis y ${acc.paidCredits} pagados.`}
          </p>
        )}

        {checkout ? (
          <div className="mt-6">
            <button onClick={() => setCheckout(null)} className="mb-3 text-sm text-primary underline">← Cambiar opción</button>
            <StripeEmbeddedCheckout key={`${checkout.priceId}-${checkout.quantity}`} {...checkout} />
          </div>
        ) : (
          <div className="mt-6 space-y-4">
            <div className="rounded-2xl border-2 border-primary bg-card p-6">
              <p className="text-sm font-semibold text-primary">⭐ Plan Maestro</p>
              <p className="mt-2 font-display text-4xl">${MONTHLY_PLAN_USD}<span className="font-sans text-base text-muted-foreground">/mes</span></p>
              <ul className="mt-4 space-y-2 text-sm">
                {["Presupuestos ilimitados por voz", "El nombre, logo y contacto de tu empresa en cada presupuesto", "Español o inglés para tu cliente", "Cancela cuando quieras"].map((f) => (
                  <li key={f} className="flex items-start gap-2"><Check className="h-5 w-5 shrink-0 text-accent" />{f}</li>
                ))}
              </ul>
              <button disabled={acc?.subscribed} onClick={() => setCheckout({ priceId: PRICE_IDS.monthly })}
                className="mt-5 w-full rounded-xl bg-primary py-4 text-lg font-extrabold text-primary-foreground disabled:opacity-50">
                {acc?.subscribed ? "Ya lo tienes" : "Activar por $10 al mes"}
              </button>
            </div>

            <div className="rounded-2xl border border-border bg-card p-6">
              <p className="text-sm font-semibold text-muted-foreground">Paga solo lo que uses</p>
              <p className="mt-2 font-display text-4xl">${PRICE_PER_QUOTE_USD}<span className="font-sans text-base text-muted-foreground">/presupuesto</span></p>
              <div className="mt-4 flex items-center justify-between rounded-xl bg-secondary p-2">
                <button aria-label="Menos" onClick={() => setQty((q) => Math.max(1, q - 1))} className="rounded-lg bg-card p-3"><Minus className="h-5 w-5" /></button>
                <span className="text-lg font-extrabold">{qty} presupuesto{qty > 1 ? "s" : ""}</span>
                <button aria-label="Más" onClick={() => setQty((q) => Math.min(50, q + 1))} className="rounded-lg bg-card p-3"><Plus className="h-5 w-5" /></button>
              </div>
              <button onClick={() => setCheckout({ priceId: PRICE_IDS.perQuote, quantity: qty })}
                className="mt-4 w-full rounded-xl border-2 border-primary py-4 text-lg font-extrabold text-primary">
                Comprar por ${qty * PRICE_PER_QUOTE_USD}
              </button>
              <p className="mt-2 text-xs text-muted-foreground">No incluye tu logo ni datos de empresa.</p>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

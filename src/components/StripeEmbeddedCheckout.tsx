import { EmbeddedCheckoutProvider, EmbeddedCheckout } from "@stripe/react-stripe-js";
import { useServerFn } from "@tanstack/react-start";
import { getStripe, getStripeEnvironment } from "@/lib/stripe";
import { createCheckoutSession } from "@/lib/payments.functions";

export function StripeEmbeddedCheckout({ priceId, quantity }: { priceId: string; quantity?: number }) {
  const create = useServerFn(createCheckoutSession);
  const fetchClientSecret = async (): Promise<string> => {
    const result = await create({
      data: {
        priceId,
        quantity,
        returnUrl: `${window.location.origin}/checkout/return?session_id={CHECKOUT_SESSION_ID}`,
        environment: getStripeEnvironment(),
      },
    });
    if ("error" in result) throw new Error(result.error);
    if (!result.clientSecret) throw new Error("No se pudo abrir el pago");
    return result.clientSecret;
  };
  return (
    <div id="checkout" className="overflow-hidden rounded-xl bg-paper">
      <EmbeddedCheckoutProvider stripe={getStripe()} options={{ fetchClientSecret }}>
        <EmbeddedCheckout />
      </EmbeddedCheckoutProvider>
    </div>
  );
}

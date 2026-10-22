const clientToken = import.meta.env.VITE_PAYMENTS_CLIENT_TOKEN as string | undefined;

export function PaymentTestModeBanner() {
  if (!clientToken) {
    return (
      <div className="w-full border-b border-destructive bg-destructive px-4 py-2 text-center text-sm text-destructive-foreground">
        Los pagos reales aún no están activados.
      </div>
    );
  }
  if (clientToken.startsWith("pk_test_")) {
    return (
      <div className="w-full border-b border-primary/40 bg-primary/15 px-4 py-2 text-center text-sm text-primary">
        Modo de prueba: los pagos en la vista previa no cobran dinero real.{" "}
        <a href="https://docs.lovable.dev/features/payments#test-and-live-environments" target="_blank" rel="noopener noreferrer" className="font-medium underline">Más info</a>
      </div>
    );
  }
  return null;
}

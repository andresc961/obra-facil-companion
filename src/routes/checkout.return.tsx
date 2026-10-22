import { createFileRoute, Link } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/checkout/return")({
  validateSearch: (s: Record<string, unknown>): { session_id?: string | undefined } => ({
    session_id: typeof s["session_id"] === "string" ? s["session_id"] : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Pago recibido — ObraFácil" },
      { name: "description", content: "Gracias por tu pago en ObraFácil." },
      { property: "og:title", content: "Pago recibido — ObraFácil" },
      { property: "og:description", content: "Gracias por tu pago." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Done,
});

function Done() {
  const qc = useQueryClient();
  useEffect(() => {
    const t = setTimeout(() => qc.invalidateQueries({ queryKey: ["account"] }), 2500);
    return () => clearTimeout(t);
  }, [qc]);
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-5 font-sans text-foreground">
      <div className="max-w-md text-center">
        <CheckCircle2 className="mx-auto h-16 w-16 text-accent" />
        <h1 className="mt-4 font-display text-3xl">¡Pago recibido!</h1>
        <p className="mt-2 text-muted-foreground">En unos segundos tu cuenta se actualiza. Ya puedes seguir haciendo presupuestos.</p>
        <Link to="/grabar" className="mt-6 inline-block rounded-xl bg-primary px-6 py-4 font-extrabold text-primary-foreground">Hacer un presupuesto</Link>
      </div>
    </main>
  );
}

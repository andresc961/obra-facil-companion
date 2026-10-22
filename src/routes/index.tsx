import { createFileRoute, Link } from "@tanstack/react-router";
import { Mic, FileText, MessageCircle, PenLine, Check } from "lucide-react";

// TODO: replace with the real WhatsApp Business number (digits only, with country code)
const WA_NUMBER = "15555555555";
const WA_LINK = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent("Hola, quiero probar ObraFácil y hacer mis presupuestos por voz.")}`;

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ObraFácil — Presupuestos de obra por voz en 30 segundos" },
      { name: "description", content: "Habla a tu teléfono y envía tu presupuesto en PDF por WhatsApp en 30 segundos. Hecho para contratistas y maestros de obra." },
      { property: "og:title", content: "ObraFácil — Presupuestos por voz" },
      { property: "og:description", content: "Habla a tu teléfono. Envía tu presupuesto en PDF por WhatsApp en 30 segundos." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function WhatsAppCta({ label }: { label: string }) {
  return (
    <a href={WA_LINK} target="_blank" rel="noreferrer"
      className="flex w-full items-center justify-center gap-2 rounded-xl bg-accent px-6 py-4 text-lg font-extrabold text-accent-foreground transition-transform active:scale-95">
      <MessageCircle className="h-6 w-6" /> {label}
    </a>
  );
}

function Index() {
  const steps = [
    { icon: Mic, t: "Habla", d: "Di el cliente, el trabajo, materiales y tu mano de obra." },
    { icon: FileText, t: "La IA arma el presupuesto", d: "Partidas, cantidades y totales en lenguaje profesional." },
    { icon: MessageCircle, t: "Envía por WhatsApp", d: "Tu cliente recibe un PDF con tu nombre al instante." },
    { icon: PenLine, t: "El cliente firma", d: "Aprueba con su dedo desde el teléfono y te avisamos." },
  ];
  return (
    <main className="min-h-screen bg-background font-sans text-foreground">
      <div className="hazard h-2" />
      <header className="mx-auto flex max-w-xl items-center justify-between px-5 py-4">
        <span className="font-display text-2xl">Obra<span className="text-primary">Fácil</span></span>
        <span className="rounded-full border border-primary px-3 py-1 text-xs font-semibold text-primary">3 gratis</span>
      </header>

      <section className="mx-auto max-w-xl px-5 pb-10 pt-4">
        <h1 className="font-display text-4xl leading-tight sm:text-5xl">
          Habla a tu teléfono. <span className="text-primary">Envía tu presupuesto</span> por WhatsApp en 30 segundos.
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">Para contratistas y maestros de obra. Sin escribir, sin Excel, sin complicaciones.</p>

        <div className="mt-8 rounded-2xl border border-border bg-card p-5">
          <div className="flex items-center gap-4">
            <div className="mic-pulse flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <Mic className="h-8 w-8" />
            </div>
            <div className="flex h-10 flex-1 items-center gap-1">
              {Array.from({ length: 18 }).map((_, i) => (
                <span key={i} className="wave-bar h-full flex-1 rounded-full bg-primary" style={{ animationDelay: `${(i % 6) * 0.12}s` }} />
              ))}
            </div>
          </div>
          <p className="mt-4 text-sm italic text-muted-foreground">"Doña Martha: tumbar pared, poner chirrock y pintura blanca. Materiales $500, mano de obra $900."</p>
          <div className="mt-4 rounded-xl bg-paper p-4 text-paper-foreground">
            <div className="flex justify-between text-xs font-semibold opacity-60"><span>OF-1001</span><span>Doña Martha</span></div>
            <p className="mt-2 text-sm font-semibold">Demolición de muro e instalación de Drywall</p>
            <div className="mt-2 space-y-1 text-sm">
              <div className="flex justify-between"><span>Materiales (paneles, perfiles, pintura)</span><span>$500</span></div>
              <div className="flex justify-between"><span>Mano de obra</span><span>$900</span></div>
            </div>
            <div className="mt-3 flex justify-between border-t border-paper-foreground/20 pt-2 text-lg font-extrabold"><span>Total</span><span>$1,400</span></div>
          </div>
        </div>

        <Link to="/grabar" className="mt-8 flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 py-4 text-lg font-extrabold text-primary-foreground"><Mic className="h-6 w-6" /> Probar: habla en español, cotiza en inglés</Link>
        <div className="mt-3"><WhatsAppCta label="Pruébalo gratis por WhatsApp" /></div>
        <p className="mt-3 text-center text-sm text-muted-foreground">Tus primeros 3 presupuestos son gratis.</p>
      </section>

      <section className="mx-auto max-w-xl px-5 py-10">
        <h2 className="font-display text-2xl">Así de fácil</h2>
        <ol className="mt-6 space-y-4">
          {steps.map((s, i) => (
            <li key={s.t} className="flex gap-4 rounded-xl border border-border bg-card p-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary font-display text-xl text-primary-foreground">{i + 1}</div>
              <div><p className="font-extrabold">{s.t}</p><p className="text-sm text-muted-foreground">{s.d}</p></div>
            </li>
          ))}
        </ol>
      </section>

      <section className="mx-auto max-w-xl px-5 py-10">
        <div className="rounded-2xl border-2 border-primary bg-card p-6">
          <p className="text-sm font-semibold text-primary">⭐ Plan Maestro</p>
          <p className="mt-2 font-display text-4xl">$19.99<span className="text-base font-sans text-muted-foreground">/mes</span></p>
          <p className="text-sm text-muted-foreground">o $179 al año</p>
          <ul className="mt-5 space-y-2">
            {["Presupuestos ilimitados por voz", "Tu logo en el PDF", "Aviso por WhatsApp cuando el cliente firma", "Soporte VIP"].map((f) => (
              <li key={f} className="flex items-center gap-2"><Check className="h-5 w-5 text-accent" />{f}</li>
            ))}
          </ul>
          <div className="mt-6"><WhatsAppCta label="Quiero ObraFácil" /></div>
        </div>
      </section>

      <footer className="mx-auto max-w-xl px-5 py-8 text-center text-sm text-muted-foreground">© ObraFácil.app</footer>
      <div className="hazard h-2" />
    </main>
  );
}

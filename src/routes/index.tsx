import { createFileRoute, Link } from "@tanstack/react-router";
import { Mic, Check, ArrowDown, Languages, LogIn, UserRound } from "lucide-react";
import logoIcon from "@/assets/logo-icon.png";
import { useSessionUser } from "@/hooks/use-session-user";
import { HowItWorks } from "@/components/HowItWorks";

export const Route = createFileRoute("/")({
  staticData: { sitemap: true },
  head: () => ({
    meta: [
      { title: "ObraFácil | Presupuestos de construcción por voz" },
      { name: "description", content: "Crea presupuestos de construcción por voz con IA. Habla en español y envía el PDF y mensaje en inglés o español. Tus primeros 3 presupuestos son gratis." },
      { property: "og:title", content: "ObraFácil — Hablas español, tu cliente lo recibe en inglés" },
      { property: "og:description", content: "Presupuestos profesionales para contratistas: dicta en español, edita tu cotización y comparte el PDF y mensaje en inglés o español." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://obrafacil.biz/" },
      { property: "og:locale", content: "es_US" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "https://obrafacil.biz/" }],
    scripts: [{
      type: "application/ld+json",
      children: JSON.stringify({
        "@context": "https://schema.org",
        "@graph": [
          { "@type": "Organization", "@id": "https://obrafacil.biz/#organization", name: "ObraFácil", url: "https://obrafacil.biz/" },
          { "@type": "WebSite", "@id": "https://obrafacil.biz/#website", name: "ObraFácil", url: "https://obrafacil.biz/", inLanguage: "es", publisher: { "@id": "https://obrafacil.biz/#organization" } },
          { "@type": "SoftwareApplication", name: "ObraFácil", url: "https://obrafacil.biz/", applicationCategory: "BusinessApplication", operatingSystem: "Web", description: "Aplicación para contratistas que convierte voz en español en presupuestos profesionales y mensajes en inglés o español.", featureList: ["Presupuestos por voz", "PDF en español o inglés", "Edición de partidas y totales", "Logo y datos de empresa con Plan Maestro"] },
        ],
      }),
    }],
  }),
  component: Index,
});

function Index() {
  const { ready, user } = useSessionUser();
  return (
    <main className="min-h-screen bg-background font-sans text-foreground">
      <div className="hazard h-2" />
      <header className="mx-auto flex max-w-xl items-center justify-between gap-3 px-5 py-4">
        <span className="flex items-center gap-2">
          <img src={logoIcon} alt="" aria-hidden="true" width={256} height={256} className="h-7 w-7 shrink-0" />
          <span className="font-display text-xl text-primary">ObraFácil</span>
        </span>
        {user ? (
          <Link to="/cuenta" className="flex shrink-0 items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-bold">
            <UserRound className="h-4 w-4 text-primary" /> Mi cuenta
          </Link>
        ) : (
          <span className="flex shrink-0 items-center gap-2">
            <span className="rounded-full border border-primary px-3 py-1 text-xs font-semibold text-primary">3 gratis</span>
            {ready ? (
              <Link to="/auth" search={{ modo: "entrar" }} className="flex items-center gap-1.5 rounded-full bg-primary px-4 py-1.5 text-xs font-extrabold text-primary-foreground">
                <LogIn className="h-4 w-4" /> Entrar
              </Link>
            ) : (
              <span className="h-8 w-24 rounded-full bg-card" aria-hidden="true" />
            )}
          </span>
        )}
      </header>

      <section className="mx-auto max-w-xl px-5 pb-10 pt-4">
        <span className="inline-flex items-center gap-2 rounded-full border border-primary/60 bg-card px-3 py-1 text-xs font-bold text-primary">
          <Languages className="h-4 w-4" /> Hablas español · tu cliente lo recibe en inglés
        </span>
        <h1 className="mt-4 font-display text-4xl leading-tight sm:text-5xl">
          Habla a tu teléfono. <span className="text-primary">Envía tu presupuesto</span> por Mensaje en 30 segundos.
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">Para contratistas y maestros de obra. Habla en español como siempre — el presupuesto y el mensaje salen en inglés si tu cliente lo necesita.</p>

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
          <p className="mt-4 text-sm italic text-muted-foreground">"Para Doña Martha: 12 paneles de chirrock a $25, otros materiales $200. Tumbar pared $300, instalar chirrock $650… no, mejor $700. Resanar y pintar $400. Tres días, 50% de anticipo."</p>
          <div className="mt-4 rounded-xl bg-paper p-4 text-paper-foreground">
            <div className="flex justify-between text-xs font-semibold opacity-60"><span>OF-1001</span><span>Mrs. Martha</span></div>
            <p className="mt-2 text-sm font-semibold">Living Room Remodeling</p>
            <div className="mt-2 space-y-1 text-sm">
              <div className="flex justify-between gap-3"><span>Drywall panels · 12 × $25</span><span className="shrink-0">$300</span></div>
              <div className="flex justify-between gap-3"><span>Paint and other materials</span><span className="shrink-0">$200</span></div>
              <div className="flex justify-between gap-3"><span>Partition wall demolition</span><span className="shrink-0">$300</span></div>
              <div className="flex justify-between gap-3"><span>Drywall installation</span><span className="shrink-0">$700</span></div>
              <div className="flex justify-between gap-3"><span>Patching and painting</span><span className="shrink-0">$400</span></div>
            </div>
            <div className="mt-3 flex justify-between border-t border-paper-foreground/20 pt-2 text-lg font-extrabold"><span>Total</span><span>$1,900</span></div>
            <p className="mt-2 text-xs opacity-70">3-day project · 50% deposit, balance on completion.</p>
          </div>
        </div>

        <Link to={user ? "/grabar" : "/probar"} className="mt-8 flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 py-4 text-lg font-extrabold text-primary-foreground"><Mic className="h-6 w-6" /> {user ? "Crear mi presupuesto por voz" : "Pruébalo gratis — sin cuenta"}</Link>
        {!user && (ready ? (
          <Link to="/auth" search={{ modo: "entrar" }} className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border-2 border-primary bg-card px-6 py-3.5 font-extrabold text-primary">
            <LogIn className="h-5 w-5" /> Ya tengo cuenta — Entrar
          </Link>
        ) : (
          <span className="mt-3 block h-14 rounded-xl bg-card" aria-hidden="true" />
        ))}
        <p className="mt-3 text-center text-sm text-muted-foreground">Tus primeros 3 presupuestos son gratis.</p>
      </section>

      <section className="mx-auto max-w-xl px-5 py-10">
        <div className="rounded-2xl border-2 border-primary bg-card p-6">
          <h2 className="font-display text-2xl leading-tight">Habla en español. <span className="text-primary">Tu cliente lo recibe en inglés.</span></h2>
          <p className="mt-3 text-muted-foreground">Tú dictas como siempre, sin escribir y sin traductores. El presupuesto, el PDF y el mensaje de WhatsApp salen en inglés — o en español. Tú escoges con un toque.</p>

          <div className="mt-6 space-y-3">
            <div className="rounded-xl border border-primary/50 bg-secondary p-4">
              <p className="text-xs font-bold uppercase tracking-wide text-primary">🇲🇽 Tú dices</p>
              <p className="mt-2 text-sm italic">"Doña Martha, remodelar la sala con chirrock y pintura blanca. El trabajo toma 3 días y pido la mitad de anticipo, el resto al terminar."</p>
            </div>
            <div className="flex justify-center">
              <ArrowDown className="h-5 w-5 text-primary" />
            </div>
            <div className="rounded-xl bg-paper p-4 text-paper-foreground">
              <p className="text-xs font-bold uppercase tracking-wide">🇺🇸 Tu cliente recibe</p>
              <p className="mt-2 text-sm font-semibold">Living Room Remodeling — Mrs. Martha</p>
              <p className="mt-2 text-sm">Demolition of a non-load-bearing partition wall, drywall installation, patching and white paint. Debris removal included.</p>
              <p className="mt-2 text-xs opacity-70">Estimated duration: 3 days. Payment: 50% deposit; remaining balance upon completion.</p>
              <div className="mt-3 border-t border-paper-foreground/20 pt-3">
                <p className="text-xs font-semibold opacity-60">Message to Mrs. Martha</p>
                <p className="mt-2 text-sm">Hi Mrs. Martha, here is your living room remodeling estimate for $1,900. Please review the scope and payment terms and let me know if you’d like to proceed. Thank you!</p>
              </div>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-2 text-xs font-bold">
            <span className="rounded-full border border-border px-3 py-1 text-muted-foreground">🇲🇽 Presupuesto en español</span>
            <span className="text-muted-foreground">o</span>
            <span className="rounded-full border border-primary bg-primary/10 px-3 py-1 text-primary">🇺🇸 Quote in English</span>
          </div>
          <p className="mt-4 text-sm text-muted-foreground">Ideal cuando tu cliente o el que paga habla inglés. Tú no cambias nada.</p>
        </div>
      </section>

      <HowItWorks />

      <section className="mx-auto max-w-xl px-5 py-10">
        <h2 className="font-display text-2xl">Precios simples</h2>
        <p className="mt-2 text-muted-foreground">Tus primeros 3 presupuestos son gratis. Después tú escoges:</p>
        <div className="mt-6 space-y-4">
          <div className="rounded-2xl border border-border bg-card p-6">
            <p className="text-sm font-semibold text-muted-foreground">Paga solo lo que uses</p>
            <p className="mt-2 font-display text-4xl">$1<span className="font-sans text-base text-muted-foreground">/presupuesto</span></p>
          </div>
          <div className="rounded-2xl border-2 border-primary bg-card p-6">
            <p className="text-sm font-semibold text-primary">⭐ Plan Maestro</p>
            <p className="mt-2 font-display text-4xl">$10<span className="font-sans text-base text-muted-foreground">/mes</span></p>
            <ul className="mt-5 space-y-2">
              {["Presupuestos ilimitados por voz", "Presupuesto en español o en inglés", "El nombre, logo y contacto de tu empresa", "Cancela cuando quieras"].map((f) => (
                <li key={f} className="flex items-center gap-2"><Check className="h-5 w-5 text-accent" />{f}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <footer className="mx-auto max-w-xl px-5 py-8 text-center text-sm text-muted-foreground">© ObraFacil.biz</footer>
      <div className="hazard h-2" />
    </main>
  );
}

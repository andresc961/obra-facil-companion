import { createFileRoute, Link } from "@tanstack/react-router";
import { Mic, FileText, MessageCircle, Check, ArrowDown, Languages, LogIn, UserRound } from "lucide-react";
import logoIcon from "@/assets/logo-icon.png";
import { useSessionUser } from "@/hooks/use-session-user";

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
  const steps = [
    { icon: Mic, t: "Habla", d: "Di el cliente, el trabajo, materiales y tu mano de obra." },
    { icon: Languages, t: "Escoge el idioma", d: "Español o inglés para tu cliente. Tú siempre hablas en español." },
    { icon: FileText, t: "La IA arma el presupuesto", d: "Partidas, cantidades y totales en lenguaje profesional." },
    { icon: MessageCircle, t: "Envía por WhatsApp", d: "Tu cliente recibe un PDF con tu nombre al instante." },
  ];
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
          <p className="mt-4 text-sm italic text-muted-foreground">"Doña Martha: tumbar pared, poner chirrock y pintura blanca. Materiales $500, mano de obra $900."</p>
          <div className="mt-4 rounded-xl bg-paper p-4 text-paper-foreground">
            <div className="flex justify-between text-xs font-semibold opacity-60"><span>OF-1001</span><span>Mrs. Martha</span></div>
            <p className="mt-2 text-sm font-semibold">Wall Demolition and Drywall Installation</p>
            <div className="mt-2 space-y-1 text-sm">
              <div className="flex justify-between"><span>Materials (panels, framing, paint)</span><span>$500</span></div>
              <div className="flex justify-between"><span>Labor</span><span>$900</span></div>
            </div>
            <div className="mt-3 flex justify-between border-t border-paper-foreground/20 pt-2 text-lg font-extrabold"><span>Total</span><span>$1,400</span></div>
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
              <p className="mt-2 text-sm italic">"Doña Martha: tumbar pared, poner chirrock y pintura blanca."</p>
            </div>
            <div className="flex justify-center">
              <ArrowDown className="h-5 w-5 text-primary" />
            </div>
            <div className="rounded-xl bg-paper p-4 text-paper-foreground">
              <p className="text-xs font-bold uppercase tracking-wide">🇺🇸 Tu cliente recibe</p>
              <p className="mt-2 text-sm font-semibold">Drywall Installation — Mrs. Martha</p>
              <div className="mt-2 space-y-1 text-sm">
                <div className="flex justify-between"><span>Materials (panels, framing, paint)</span><span>$500</span></div>
                <div className="flex justify-between"><span>Labor</span><span>$900</span></div>
              </div>
              <div className="mt-3 flex justify-between border-t border-paper-foreground/20 pt-2 text-lg font-extrabold"><span>Total</span><span>$1,400</span></div>
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

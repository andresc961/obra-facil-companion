import { createFileRoute, Link } from "@tanstack/react-router";
import { Mic, Check, LogIn, UserRound, ShieldCheck, ArrowRight, ChevronDown } from "lucide-react";
import logoIcon from "@/assets/logo-icon.png";
import { useSessionUser } from "@/hooks/use-session-user";
import { HowItWorks } from "@/components/HowItWorks";
import { Button } from "@/components/ui/button";
import { useIsIosNativeApp } from "@/lib/ios-app";

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
  const ios = useIsIosNativeApp();
  return (
    <main className="min-h-screen bg-background font-sans text-foreground">
      <div className="hazard h-2" />
      <header className="mx-auto flex max-w-xl items-center justify-between gap-3 px-5 py-4">
        <span className="flex items-center gap-2">
          <img src={logoIcon} alt="" aria-hidden="true" width={256} height={256} className="h-7 w-7 shrink-0" />
          <span className="font-display text-xl text-primary">ObraFácil</span>
        </span>
        {user ? (
          <Button asChild variant="outline" size="sm" className="shrink-0 rounded-full bg-card font-bold">
            <Link to="/cuenta"><UserRound className="text-primary" /> Mi cuenta</Link>
          </Button>
        ) : (
          <span className="flex shrink-0 items-center gap-2">
            {ready ? (
              <Button asChild size="sm" className="rounded-full px-4 font-extrabold">
                <Link to="/auth" search={{ modo: "entrar" }}><LogIn /> Entrar</Link>
              </Button>
            ) : (
              <span className="h-8 w-24 rounded-full bg-card" aria-hidden="true" />
            )}
          </span>
        )}
      </header>

      <section className="mx-auto max-w-xl px-5 pb-10 pt-4">
        <h1 className="mt-4 font-display text-4xl leading-tight sm:text-5xl">
          Habla a tu teléfono. <span className="text-primary">Envía tu presupuesto</span> por Mensaje en 30 segundos.
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">Habla en español y crea un presupuesto profesional en español o inglés.</p>

        <Button asChild className="mt-6 h-auto min-h-14 w-full whitespace-normal px-4 py-4 text-base font-extrabold sm:text-lg">
          <Link to={user ? "/grabar" : "/probar"}><Mic /> {user ? "Crear mi presupuesto por voz" : "Pruébalo gratis — sin cuenta"}</Link>
        </Button>
        {!user && <>
          <p className="mt-3 flex items-center justify-center gap-2 text-sm text-muted-foreground"><ShieldCheck className="h-4 w-4 shrink-0 text-accent" /> Prueba sin cuenta ni tarjeta.</p>
          {ready && <Button asChild variant="link" className="mx-auto mt-1 flex h-9 w-fit text-sm"><Link to="/auth" search={{ modo: "entrar" }}>Ya tengo cuenta — Entrar</Link></Button>}
        </>}

        <div className="mt-8 border-t border-border pt-6" aria-label="Ejemplo de presupuesto en inglés">
          <p className="mb-4 flex items-center justify-between gap-3 text-xs font-bold"><span className="text-primary">DE TU VOZ A UN PRESUPUESTO</span><span className="text-muted-foreground">Hablas español → presupuesto en inglés</span></p>
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <Mic className="h-8 w-8" />
            </div>
            <div className="flex h-10 flex-1 items-center gap-1">
              {Array.from({ length: 18 }).map((_, i) => (
                <span
                  key={i}
                  style={{ animationDelay: `${(i % 6) * 0.12}s` }}
                  className={`wave-bar flex-1 rounded-full bg-primary ${["h-3", "h-6", "h-8", "h-4", "h-7", "h-10"][i % 6]}`}
                />
              ))}
            </div>
          </div>
          <p className="mt-4 text-sm italic text-muted-foreground">"Para Doña Martha: 12 paneles de chirrock a $25, otros materiales $200. Tumbar pared $300, instalar chirrock $650… no, mejor $700. Resanar y pintar $400. Tres días, 50% de anticipo."</p>
          <div className="mt-4 rounded-lg bg-paper p-4 text-paper-foreground">
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
            <div className="mt-4 border-t border-paper-foreground/20 pt-3">
              <p className="text-xs font-semibold opacity-60">Mensaje para tu cliente · English</p>
              <p className="mt-2 text-sm">Hi Mrs. Martha, here is your living room remodeling estimate for $1,900. Please review the scope and payment terms and let me know if you’d like to proceed. Thank you!</p>
            </div>
          </div>
          <p className="mt-3 text-sm text-muted-foreground">Tú eliges el idioma y revisas los precios antes de enviarlo.</p>
        </div>
      </section>

      <HowItWorks />

      {!ios && <section className="mx-auto max-w-xl px-5 py-10">
        <h2 className="font-display text-2xl">Precios simples</h2>
        <p className="mt-2 text-muted-foreground">Tus primeros 3 presupuestos son gratis. Después tú escoges:</p>
        <div className="mt-6 space-y-4">
          <div className="rounded-lg border border-border bg-card p-6">
            <p className="text-sm font-semibold text-muted-foreground">Paga solo lo que uses</p>
            <p className="mt-2 font-display text-4xl">$1<span className="font-sans text-base text-muted-foreground">/presupuesto</span></p>
          </div>
          <div className="rounded-lg border-2 border-primary bg-card p-6">
            <p className="text-sm font-semibold text-primary">⭐ Plan Maestro</p>
            <p className="mt-2 font-display text-4xl">$10<span className="font-sans text-base text-muted-foreground">/mes</span></p>
            <ul className="mt-5 space-y-2">
              {["Presupuestos ilimitados por voz", "Presupuesto en español o en inglés", "El nombre, logo y contacto de tu empresa", "Cancela cuando quieras"].map((f) => (
                <li key={f} className="flex items-center gap-2"><Check className="h-5 w-5 text-accent" />{f}</li>
              ))}
            </ul>
          </div>
        </div>
        <div className="mt-8 text-center">
          <Button asChild className="h-auto min-h-14 w-full whitespace-normal px-4 py-4 text-base font-extrabold">
            <Link to={user ? "/grabar" : "/probar"}>{user ? "Crear mi presupuesto por voz" : "Pruébalo gratis — sin cuenta"}<ArrowRight /></Link>
          </Button>
          {!user && <p className="mt-3 text-sm text-muted-foreground">Una prueba sin cuenta ni tarjeta. Regístrate para descargar el PDF y enviarlo.</p>}
        </div>
      </section>}

      <section className="border-t border-border px-5 py-10" aria-labelledby="homepage-questions">
        <div className="mx-auto max-w-xl">
          <h2 id="homepage-questions" className="font-display text-2xl">Antes de empezar</h2>
          <div className="mt-5">
            {[
              ["¿Qué puedo probar gratis?", "Sin cuenta ni tarjeta, puedes crear un presupuesto de prueba y ver el resultado. Después, crea tu cuenta para descargar el PDF y enviarlo. Tu cuenta incluye 3 presupuestos gratis; la prueba no los consume."],
              ["¿Puedo corregir precios o agregar trabajos?", "Sí. Con tu cuenta puedes editar las partidas, cantidades, precios y notas antes de descargar o enviar el presupuesto. Corregirlo no consume otro presupuesto."],
              ["¿Tengo que hablar inglés?", "No. Habla en español y elige español o inglés para el presupuesto, el PDF y el mensaje de tu cliente."],
              ["¿Mi cliente necesita instalar la app?", "No. Tu cliente recibe un PDF y un mensaje que puede abrir sin tener una cuenta en ObraFácil."],
              ["¿Puedo poner el logo de mi empresa?", "Sí. El Plan Maestro de $10 al mes incluye presupuestos ilimitados y la opción de añadir el nombre, logo y contacto de tu empresa."],
            ].filter(([, answer]) => !ios || !answer?.includes("$10 al mes")).map(([question, answer]) => (
              <details key={question} name="homepage-faq" className="group border-b border-border">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-5 text-base font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring [&::-webkit-details-marker]:hidden">
                  {question}<ChevronDown aria-hidden="true" className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-180 motion-reduce:transition-none" />
                </summary>
                <p className="pb-5 text-sm leading-relaxed text-muted-foreground">{answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <footer className="mx-auto max-w-xl px-5 py-8 text-center text-sm text-muted-foreground">© ObraFacil.biz <Button asChild variant="link"><Link to="/privacidad">Privacidad</Link></Button></footer>
      <div className="hazard h-2" />
    </main>
  );
}

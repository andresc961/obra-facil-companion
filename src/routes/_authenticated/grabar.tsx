import { createFileRoute, Link } from "@tanstack/react-router";
import { AppHeader } from "@/components/AppHeader";
import { useEffect, useRef, useState } from "react";
import { Mic, Square, Loader2, Languages, Pencil, Check } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { QuoteEditor } from "@/components/QuoteEditor";
import { QuotePdfDownload } from "@/components/QuotePdfDownload";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { selectedBrand } from "@/lib/quote-branding";
import { useAccount } from "@/hooks/use-account";
import { getStripeEnvironment } from "@/lib/stripe";
import { canCreateQuote, canUseBranding, freeLeft } from "@/lib/pricing";
import { generateEnglishQuote, type Quote } from "@/lib/quote.functions";
import { recordWav } from "@/lib/record-wav";
import { QUOTE_EXAMPLE } from "@/lib/quote-example";
import { useIsIosNativeApp } from "@/lib/ios-app";


export const Route = createFileRoute("/_authenticated/grabar")({
  staticData: { sitemap: false },
  head: () => ({
    meta: [
      { name: "robots", content: "noindex, follow" },
      { title: "Grabadora ObraFácil — Habla en español, cotiza en español o inglés" },
      { name: "description", content: "Dicta tu presupuesto en español y ObraFácil lo convierte en una cotización profesional en español o inglés." },
      { property: "og:title", content: "Grabadora ObraFácil" },
      { property: "og:description", content: "Habla en español. Cotiza en español o inglés." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Recorder,
});

function Recorder() {
  const ios = useIsIosNativeApp();
  const [text, setText] = useState("");
  const [lang, setLang] = useState<"en" | "es">("es");
  const [listening, setListening] = useState(false);
  const [transcribing, setTranscribing] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [quote, setQuote] = useState<Quote | null>(null);
  const [needsPayment, setNeedsPayment] = useState(false);
  const [editing, setEditing] = useState(false);
  const [includeCompany, setIncludeCompany] = useState(true);
  const { data: acc } = useAccount();
  const qc = useQueryClient();
  const genQuote = useServerFn(generateEnglishQuote);
  const brand = selectedBrand(!!acc && canUseBranding(acc), includeCompany, acc?.profile);
  const recRef = useRef<Awaited<ReturnType<typeof recordWav>> | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const demo = localStorage.getItem("obrafacil-demo-text");
    if (demo) { setText(demo); localStorage.removeItem("obrafacil-demo-text"); }
  }, []);
  useEffect(() => () => { recRef.current?.cancel(); if (timerRef.current) clearInterval(timerRef.current); }, []);

  const generate = async (transcript = text) => {
    if (acc && !canCreateQuote(acc)) { setNeedsPayment(true); return; }
    setLoading(true); setError(null); setQuote(null); setNeedsPayment(false);
    try {
      const r = await genQuote({ data: { transcript, language: lang, environment: getStripeEnvironment() } });
      if (r.ok) { setQuote(r.quote); setEditing(false); }
      else if ("needsPayment" in r) setNeedsPayment(true);
      else setError(r.error);
      void qc.invalidateQueries({ queryKey: ["account"] });
    } catch { setError("Error de conexión. Intenta de nuevo."); }
    setLoading(false);
  };

  const toggleMic = async () => {
    if (transcribing || loading) return;
    if (listening) {
      const rec = recRef.current; recRef.current = null;
      setListening(false);
      if (timerRef.current) clearInterval(timerRef.current);
      if (!rec) return;
      setTranscribing(true);
      try {
        const file = await rec.stop();
        const form = new FormData();
        form.append("file", file);
        const res = await fetch("/api/transcribe", { method: "POST", body: form });
        const j = (await res.json().catch(() => ({}))) as { text?: string; error?: string };
        if (!res.ok || !j.text) { setError(j.error ?? "No escuchamos nada. Intenta otra vez."); return; }
        const t = text.trim() ? `${text.trim()} ${j.text}` : j.text;
        setText(t);
        setTranscribing(false);
        if (t.trim().length >= 5) await generate(t);
      } catch (e) {
        setError((e as Error).message === "empty" ? "La grabación salió vacía. Mantén presionado y habla más tiempo." : "No pudimos procesar el audio. Intenta otra vez.");
      } finally { setTranscribing(false); }
      return;
    }
    if (!navigator.mediaDevices?.getUserMedia) return setError("Tu navegador no permite usar el micrófono. Escribe o usa un ejemplo.");
    setError(null);
    try {
      recRef.current = await recordWav();
      setSeconds(0);
      timerRef.current = setInterval(() => setSeconds((s) => {
        if (s + 1 >= 180) void toggleMicRef.current();
        return s + 1;
      }), 1000);
      setListening(true);
    } catch {
      setError("Necesitamos permiso para usar el micrófono. Actívalo en la configuración del navegador.");
    }
  };
  const toggleMicRef = useRef(toggleMic);
  toggleMicRef.current = toggleMic;
  const busy = transcribing || loading;

  const total = quote?.items.reduce((s, i) => s + i.total, 0) ?? 0;
  const fmt = (n: number) => n.toLocaleString("en-US", { style: "currency", currency: "USD" });
  const sig = brand ? `\n\n— ${[brand.company_name, brand.phone, brand.email, brand.address].filter(Boolean).join(" · ")}` : "";
  const waText = quote ? `${quote.whatsapp_message}\n\n${quote.project_title}\n${quote.items.map((i) => `• ${i.description}: ${fmt(i.total)}`).join("\n")}\nTotal: ${fmt(total)}${sig}` : "";

  return (
    <main className="min-h-screen bg-background px-5 pb-16 font-sans text-foreground">
      <div className="mx-auto max-w-xl">
        <AppHeader back="/" />
        {acc && (
          <Link to={ios || acc.subscribed ? "/cuenta" : "/precios"} className="mb-3 block rounded-xl border border-border bg-card px-4 py-2 text-sm">
            {acc.subscribed ? "⭐ Plan Maestro · ilimitado"
              : freeLeft(acc) > 0 ? <>🎁 Te quedan <b>{freeLeft(acc)} presupuesto{freeLeft(acc) > 1 ? "s" : ""} gratis</b>{acc.paidCredits > 0 && <> y <b>{acc.paidCredits} pagados</b></>}{!ios && <> · <span className="text-primary underline">Ver planes</span></>}</>
              : <>Ya usaste tus 3 gratis{acc.paidCredits > 0 && <> · tienes <b>{acc.paidCredits} pagados</b></>}{!ios && <> · <span className="text-primary underline">Ver planes</span></>}</>}
          </Link>
        )}

        <div className="flex items-start gap-3 rounded-xl bg-primary p-4 text-primary-foreground">
          <Languages className="mt-0.5 h-6 w-6 shrink-0" />
          <p className="font-semibold">Habla en español. Elige en qué idioma recibe tu cliente el presupuesto y el mensaje.</p>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2 rounded-xl bg-card p-1" role="radiogroup" aria-label="Idioma del cliente">
          {([["es", "🇲🇽 Español"], ["en", "🇺🇸 English"]] as const).map(([v, l]) => (
            <button key={v} role="radio" aria-checked={lang === v} onClick={() => { setLang(v); setQuote(null); }}
              className={`rounded-lg py-3 font-extrabold ${lang === v ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}>{l}</button>
          ))}
        </div>
        <p className="mt-3 text-sm text-muted-foreground">Habla como hablas normalmente: el cliente, el trabajo, los materiales y lo que cobras. La IA lo ordena y lo deja profesional.</p>

        <div className="my-8 flex flex-col items-center gap-3">
          <button onClick={toggleMic} disabled={busy} aria-label={listening ? "Detener" : "Grabar"}
            className={`flex h-28 w-28 items-center justify-center rounded-full bg-primary text-primary-foreground disabled:opacity-60 ${listening ? "mic-pulse" : ""}`}>
            {busy ? <Loader2 className="h-10 w-10 animate-spin" /> : listening ? <Square className="h-10 w-10" /> : <Mic className="h-12 w-12" />}
          </button>
          <p className="text-sm font-semibold text-muted-foreground">
            {listening ? `Grabando… ${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")} · toca para terminar`
              : transcribing ? "Escuchando tu grabación…"
              : loading ? "Armando tu presupuesto…"
              : "Toca para hablar"}
          </p>
        </div>

        <textarea value={text} onChange={(e) => setText(e.target.value)} rows={4} placeholder="Lo que digas aparece aquí (también puedes escribir)…"
          className="w-full rounded-xl border border-border bg-card p-4 text-base outline-none focus:border-primary" />

        <div className="mt-3 flex flex-col gap-2">
          <Button variant="outline" onClick={() => setText(QUOTE_EXAMPLE.transcript)} disabled={busy || listening}
            className="h-auto w-full justify-start whitespace-normal rounded-lg bg-card px-3 py-3 text-left">
            <span><span className="block font-semibold">Usar ejemplo: {QUOTE_EXAMPLE.title}</span>
              <span className="mt-1 block text-xs text-muted-foreground">Materiales, mano de obra, plazo y anticipo</span></span>
          </Button>
        </div>

        <button onClick={() => generate()} disabled={busy || listening || text.trim().length < 5}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-4 text-lg font-extrabold text-primary-foreground disabled:opacity-50">
          {loading ? <><Loader2 className="h-5 w-5 animate-spin" /> Armando presupuesto…</> : quote ? "Volver a generar" : lang === "en" ? "Crear presupuesto en inglés" : "Crear presupuesto en español"}
        </button>
        {needsPayment && (
          <div className="mt-4 rounded-2xl border-2 border-primary bg-card p-5">
            {ios ? <p className="font-semibold">Has alcanzado el límite de presupuestos incluidos en tu cuenta actual.</p> : <>
            <p className="font-display text-xl">Ya usaste tus 3 presupuestos gratis</p>
            <p className="mt-1 text-sm text-muted-foreground">Paga $1 por presupuesto, o $10 al mes para presupuestos ilimitados con tu logo y datos de empresa.</p>
            <Link to="/precios" className="mt-4 block rounded-xl bg-primary py-3 text-center font-extrabold text-primary-foreground">Ver opciones</Link>
            </>}
          </div>
        )}
        {error && <p className="mt-3 rounded-lg bg-destructive p-3 text-sm text-destructive-foreground">{error}</p>}

        {quote && (
          <section className="mt-8 space-y-4">
            {acc?.subscribed ? (
              <div className="space-y-2 border-b border-border pb-4">
                <div className="flex items-center justify-between gap-3">
                  <label htmlFor="include-company" className="text-sm font-semibold">Incluir logo y datos de mi empresa</label>
                  <Switch id="include-company" checked={includeCompany} onCheckedChange={setIncludeCompany} />
                </div>
                <Button asChild variant="link" className="h-auto px-0"><Link to="/cuenta">{acc.profile ? "Editar datos de empresa" : "Agregar nombre, contacto y logo"}</Link></Button>
              </div>
            ) : !ios && <Button asChild variant="link" className="h-auto whitespace-normal px-0"><Link to="/precios">Agregar tu logo y datos con Plan Maestro</Link></Button>}
            <button onClick={() => setEditing(!editing)}
              className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-primary py-3 font-extrabold text-primary">
              {editing ? <><Check className="h-5 w-5" /> Listo, ver presupuesto</> : <><Pencil className="h-5 w-5" /> Editar o corregir presupuesto</>}
            </button>
            {editing && <div className="rounded-xl bg-paper p-4"><QuoteEditor quote={quote} onChange={setQuote} en={lang === "en"} /></div>}
            {!editing && <>
            <div className="rounded-xl bg-paper p-5 text-paper-foreground">
              {brand && (
                <div className="mb-4 flex items-center gap-3 border-b border-paper-foreground/20 pb-3">
                  {brand.logo_url && <img src={brand.logo_url} alt="" className="h-12 w-12 object-contain" />}
                  <div className="min-w-0 break-words text-xs">
                    <p className="text-base font-extrabold">{brand.company_name}</p>
                    <p className="opacity-70">{[brand.phone, brand.email, brand.address].filter(Boolean).join(" · ")}</p>
                  </div>
                </div>
              )}
              <p className="text-xs font-semibold uppercase opacity-60">{lang === "en" ? "Estimate for" : "Presupuesto para"} {quote.client_name}</p>
              <h2 className="mt-1 text-lg font-extrabold">{quote.project_title}</h2>
              <div className="mt-4 space-y-2 text-sm">
                {quote.items.map((i, k) => (
                  <div key={k} className="flex justify-between gap-3">
                    <span>{i.description}{i.qty !== 1 && <span className="opacity-60"> ({i.qty} × {fmt(i.unit_price)})</span>}</span>
                    <span className="font-semibold">{fmt(i.total)}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex justify-between border-t border-paper-foreground/20 pt-3 text-xl font-extrabold"><span>Total</span><span>{fmt(total)}</span></div>
              {quote.notes && <p className="mt-3 text-xs opacity-70">{quote.notes}</p>}
            </div>
            <div className="rounded-xl border border-border bg-card p-4">
              <p className="text-xs font-semibold text-muted-foreground">Mensaje para tu cliente ({lang === "en" ? "inglés" : "español"})</p>
              <p className="mt-2 text-sm">{quote.whatsapp_message}</p>
            </div>
            <QuotePdfDownload quote={quote} language={lang} brand={brand} message={waText} />
            </>}
          </section>
        )}
      </div>
    </main>
  );
}

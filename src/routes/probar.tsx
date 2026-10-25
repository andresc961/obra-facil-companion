import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Mic, Square, Loader2, Lock, Check } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { AppHeader } from "@/components/AppHeader";
import { generateDemoQuote, type Quote } from "@/lib/quote.functions";
import { recordWav } from "@/lib/record-wav";

const USED_KEY = "obrafacil-demo-used";

export const Route = createFileRoute("/probar")({
  staticData: { sitemap: false },
  head: () => ({
    meta: [
      { name: "robots", content: "noindex, follow" },
      { title: "Prueba ObraFácil gratis, sin cuenta" },
      { name: "description", content: "Habla en español y mira tu presupuesto profesional en segundos. Sin crear cuenta." },
      { property: "og:title", content: "Prueba ObraFácil gratis, sin cuenta" },
      { property: "og:description", content: "Dicta un trabajo y mira el presupuesto en inglés o español al instante." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: TryPage,
});

const EXAMPLE = "Doña Martha: tumbar pared divisoria, poner chirrock con perfiles y pintura blanca. Materiales $500, mano de obra $900.";

function TryPage() {
  const gen = useServerFn(generateDemoQuote);
  const [text, setText] = useState("");
  const [lang, setLang] = useState<"en" | "es">("en");
  const [listening, setListening] = useState(false);
  const [busy, setBusy] = useState<"" | "audio" | "quote">("");
  const [error, setError] = useState<string | null>(null);
  const [quote, setQuote] = useState<Quote | null>(null);
  const [used, setUsed] = useState(false);
  const recRef = useRef<Awaited<ReturnType<typeof recordWav>> | null>(null);

  useEffect(() => { setUsed(localStorage.getItem(USED_KEY) === "1"); return () => recRef.current?.cancel(); }, []);

  const generate = async (t = text) => {
    setBusy("quote"); setError(null);
    try {
      const r = await gen({ data: { transcript: t.slice(0, 1200), language: lang } });
      if (r.ok) { setQuote(r.quote); localStorage.setItem(USED_KEY, "1"); localStorage.setItem("obrafacil-demo-text", t); }
      else setError(r.error);
    } catch { setError("Error de conexión. Intenta de nuevo."); }
    setBusy("");
  };

  const toggleMic = async () => {
    if (busy) return;
    if (listening) {
      const rec = recRef.current; recRef.current = null; setListening(false);
      if (!rec) return;
      setBusy("audio");
      try {
        const form = new FormData(); form.append("file", await rec.stop());
        const res = await fetch("/api/transcribe", { method: "POST", body: form });
        const j = (await res.json().catch(() => ({}))) as { text?: string; error?: string };
        if (!res.ok || !j.text) { setError(j.error ?? "No escuchamos nada. Intenta otra vez."); setBusy(""); return; }
        setText(j.text);
        await generate(j.text);
      } catch { setError("No pudimos procesar el audio. Intenta otra vez."); setBusy(""); }
      return;
    }
    if (!navigator.mediaDevices?.getUserMedia) return setError("Tu navegador no permite usar el micrófono. Usa el ejemplo o escribe.");
    try { recRef.current = await recordWav(); setListening(true); setError(null); }
    catch { setError("Necesitamos permiso para usar el micrófono."); }
  };

  const total = quote?.items.reduce((s, i) => s + i.total, 0) ?? 0;
  const fmt = (n: number) => n.toLocaleString("en-US", { style: "currency", currency: "USD" });

  return (
    <main className="min-h-screen bg-background px-5 pb-16 font-sans text-foreground">
      <div className="mx-auto max-w-xl">
        <AppHeader back="/" />
        <h1 className="font-display text-3xl leading-tight">Pruébalo ahora. <span className="text-primary">Sin crear cuenta.</span></h1>
        <p className="mt-2 text-muted-foreground">Di el cliente, el trabajo y lo que cobras. Mira tu presupuesto en segundos.</p>

        {used && !quote ? (
          <div className="mt-8 rounded-2xl border-2 border-primary bg-card p-6 text-center">
            <p className="font-display text-xl">Ya hiciste tu prueba</p>
            <p className="mt-2 text-sm text-muted-foreground">Crea tu cuenta gratis y sigue con tus 3 presupuestos gratis.</p>
            <Link to="/auth" search={{ modo: "crear" }} className="mt-4 block rounded-xl bg-primary py-4 font-extrabold text-primary-foreground">Crear cuenta gratis</Link>
          </div>
        ) : !quote && (
          <>
            <div className="mt-6 grid grid-cols-2 gap-2 rounded-xl bg-card p-1" role="radiogroup" aria-label="Idioma del cliente">
              {([["es", "🇲🇽 Español"], ["en", "🇺🇸 English"]] as const).map(([v, l]) => (
                <button key={v} role="radio" aria-checked={lang === v} onClick={() => setLang(v)}
                  className={`rounded-lg py-3 font-extrabold ${lang === v ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}>{l}</button>
              ))}
            </div>
            <div className="my-8 flex flex-col items-center gap-3">
              <button onClick={toggleMic} disabled={!!busy} aria-label={listening ? "Detener" : "Grabar"}
                className={`flex h-28 w-28 items-center justify-center rounded-full bg-primary text-primary-foreground disabled:opacity-60 ${listening ? "mic-pulse" : ""}`}>
                {busy ? <Loader2 className="h-10 w-10 animate-spin" /> : listening ? <Square className="h-10 w-10" /> : <Mic className="h-12 w-12" />}
              </button>
              <p className="text-sm font-semibold text-muted-foreground">
                {listening ? "Grabando… toca para terminar" : busy === "audio" ? "Escuchando…" : busy === "quote" ? "Armando tu presupuesto…" : "Toca para hablar"}
              </p>
            </div>
            <textarea value={text} onChange={(e) => setText(e.target.value)} rows={3} maxLength={1200} placeholder="O escribe aquí…"
              className="w-full rounded-xl border border-border bg-card p-4 outline-none focus:border-primary" />
            <button onClick={() => setText(EXAMPLE)} className="mt-2 w-full rounded-lg border border-border bg-card px-3 py-2 text-left text-sm text-muted-foreground">Usar ejemplo: {EXAMPLE.slice(0, 44)}…</button>
            <button onClick={() => generate()} disabled={!!busy || listening || text.trim().length < 5}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-4 text-lg font-extrabold text-primary-foreground disabled:opacity-50">
              {busy === "quote" ? <><Loader2 className="h-5 w-5 animate-spin" /> Armando…</> : "Ver mi presupuesto"}
            </button>
          </>
        )}
        {error && <p className="mt-3 rounded-lg bg-destructive p-3 text-sm text-destructive-foreground">{error}</p>}

        {quote && (
          <section className="mt-6 space-y-4">
            <div className="rounded-2xl bg-paper p-5 text-paper-foreground">
              <p className="text-xs font-semibold opacity-60">{quote.client_name}</p>
              <p className="mt-1 text-lg font-extrabold">{quote.project_title}</p>
              <div className="mt-3 space-y-2 text-sm">
                {quote.items.map((i, k) => (
                  <div key={k} className="flex justify-between gap-3"><span>{i.description}</span><span className="shrink-0 font-semibold">{fmt(i.total)}</span></div>
                ))}
              </div>
              <div className="mt-3 flex justify-between border-t border-paper-foreground/20 pt-2 text-xl font-extrabold"><span>Total</span><span>{fmt(total)}</span></div>
              {quote.notes && <p className="mt-3 text-xs opacity-70">{quote.notes}</p>}
            </div>
            <div className="rounded-2xl border-2 border-primary bg-card p-5">
              <p className="flex items-center gap-2 font-display text-xl"><Lock className="h-5 w-5 text-primary" /> Guárdalo y envíaselo a tu cliente</p>
              <ul className="mt-3 space-y-1 text-sm">
                {["PDF profesional listo para enviar", "Edita precios y partidas", "3 presupuestos gratis, sin tarjeta"].map((f) => (
                  <li key={f} className="flex items-center gap-2"><Check className="h-4 w-4 text-accent" />{f}</li>
                ))}
              </ul>
              <Link to="/auth" search={{ modo: "crear" }} className="mt-4 block rounded-xl bg-primary py-4 text-center text-lg font-extrabold text-primary-foreground">Crear cuenta gratis</Link>
              <Link to="/auth" search={{ modo: "entrar" }} className="mt-3 block text-center text-sm text-primary underline">Ya tengo cuenta — Entrar</Link>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}

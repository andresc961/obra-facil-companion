import { createFileRoute, Link } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { Mic, Square, Loader2, MessageCircle, ArrowLeft, Languages } from "lucide-react";
import { generateEnglishQuote, type Quote } from "@/lib/quote.functions";

export const Route = createFileRoute("/grabar")({
  head: () => ({
    meta: [
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

const PRESETS = [
  "Doña Martha: tumbar pared divisoria, poner chirrock con perfiles y pintura blanca. Materiales $500, mano de obra $900.",
  "Juan Pérez: instalación de porcelanato en baño 15m² con pega y mano de obra $850.",
  "Don Antonio: reemplazo de láminas de zinc en techo, 20 láminas a $35 cada una, mano de obra $600.",
];

type SR = { lang: string; continuous: boolean; interimResults: boolean; start(): void; stop(): void; onresult: (e: { results: ArrayLike<{ 0: { transcript: string } }> }) => void; onend: () => void; onerror: () => void };

function Recorder() {
  const [text, setText] = useState("");
  const [lang, setLang] = useState<"en" | "es">("es");
  const [listening, setListening] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [quote, setQuote] = useState<Quote | null>(null);
  const recRef = useRef<SR | null>(null);

  const toggleMic = () => {
    if (listening) return recRef.current?.stop();
    const W = window as unknown as { SpeechRecognition?: new () => SR; webkitSpeechRecognition?: new () => SR };
    const Ctor = W.SpeechRecognition ?? W.webkitSpeechRecognition;
    if (!Ctor) return setError("Tu navegador no permite dictado. Escribe o usa un ejemplo.");
    const rec = new Ctor();
    rec.lang = "es-US";
    rec.continuous = true;
    rec.interimResults = true;
    rec.onresult = (e) => setText(Array.from(e.results).map((r) => r[0].transcript).join(" "));
    rec.onend = () => setListening(false);
    rec.onerror = () => setListening(false);
    recRef.current = rec;
    setError(null);
    rec.start();
    setListening(true);
  };

  const generate = async () => {
    setLoading(true); setError(null); setQuote(null);
    try {
      const r = await generateEnglishQuote({ data: { transcript: text, language: lang } });
      if (r.ok) setQuote(r.quote); else setError(r.error);
    } catch { setError("Error de conexión. Intenta de nuevo."); }
    setLoading(false);
  };

  const total = quote?.items.reduce((s, i) => s + i.total, 0) ?? 0;
  const fmt = (n: number) => n.toLocaleString("en-US", { style: "currency", currency: "USD" });
  const waText = quote ? `${quote.whatsapp_message}\n\n${quote.project_title}\n${quote.items.map((i) => `• ${i.description}: ${fmt(i.total)}`).join("\n")}\nTotal: ${fmt(total)}` : "";

  return (
    <main className="min-h-screen bg-background px-5 pb-16 font-sans text-foreground">
      <div className="mx-auto max-w-xl">
        <header className="flex items-center gap-3 py-4">
          <Link to="/" className="rounded-lg bg-card p-2"><ArrowLeft className="h-5 w-5" /></Link>
          <span className="font-display text-xl">Grabadora <span className="text-primary">ObraFácil</span></span>
        </header>

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
        <p className="mt-3 text-sm text-muted-foreground">Di el nombre del cliente, el trabajo a realizar, los materiales y el precio de tu mano de obra.</p>

        <div className="my-8 flex justify-center">
          <button onClick={toggleMic} aria-label={listening ? "Detener" : "Grabar"}
            className={`flex h-28 w-28 items-center justify-center rounded-full bg-primary text-primary-foreground ${listening ? "mic-pulse" : ""}`}>
            {listening ? <Square className="h-10 w-10" /> : <Mic className="h-12 w-12" />}
          </button>
        </div>

        <textarea value={text} onChange={(e) => setText(e.target.value)} rows={4} placeholder="Lo que digas aparece aquí…"
          className="w-full rounded-xl border border-border bg-card p-4 text-base outline-none focus:border-primary" />

        <div className="mt-3 flex flex-col gap-2">
          {PRESETS.map((p, i) => (
            <button key={i} onClick={() => setText(p)} className="rounded-lg border border-border bg-card px-3 py-2 text-left text-sm text-muted-foreground">
              Ejemplo {i + 1}: {p.slice(0, 48)}…
            </button>
          ))}
        </div>

        <button onClick={generate} disabled={loading || text.trim().length < 5}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-4 text-lg font-extrabold text-primary-foreground disabled:opacity-50">
          {loading ? <><Loader2 className="h-5 w-5 animate-spin" /> Traduciendo y calculando…</> : {lang === "en" ? "Crear presupuesto en inglés" : "Crear presupuesto en español"}}
        </button>
        {error && <p className="mt-3 rounded-lg bg-destructive p-3 text-sm text-destructive-foreground">{error}</p>}

        {quote && (
          <section className="mt-8 space-y-4">
            <div className="rounded-xl bg-paper p-5 text-paper-foreground">
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
            <a href={`https://wa.me/?text=${encodeURIComponent(waText)}`} target="_blank" rel="noreferrer"
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-accent py-4 text-lg font-extrabold text-accent-foreground">
              <MessageCircle className="h-6 w-6" /> Enviar por WhatsApp
            </a>
          </section>
        )}
      </div>
    </main>
  );
}

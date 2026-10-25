import { Check, FileText, Mic, Send } from "lucide-react";

export function VoiceToQuoteGraphic() {
  return (
    <section className="voice-journey mx-auto max-w-xl px-5 pb-2 pt-4" aria-label="De tu voz al presupuesto de tu cliente">
      <ol className="relative grid grid-cols-3 gap-3">
        <span className="journey-track" aria-hidden="true"><span /></span>
        <li className="relative min-w-0 text-center">
          <div className="journey-stage journey-voice mx-auto flex h-24 w-full max-w-28 flex-col items-center justify-center gap-3 rounded-lg border border-primary/40 bg-secondary/30" aria-hidden="true">
            <Mic className="h-7 w-7 text-primary" />
            <div className="flex h-5 items-center gap-1">
              {["h-2", "h-4", "h-5", "h-3", "h-5", "h-4", "h-2"].map((height, i) => <span key={i} className={`journey-wave w-1 rounded-full bg-primary ${height}`} />)}
            </div>
          </div>
          <p className="mt-3 text-sm font-bold">Habla</p>
          <p className="mt-1 text-xs text-muted-foreground">En español</p>
        </li>
        <li className="relative min-w-0 text-center">
          <div className="journey-stage journey-quote mx-auto flex h-24 w-full max-w-28 items-center justify-center rounded-lg border border-border bg-secondary/30" aria-hidden="true">
            <div className="w-16 rounded-sm bg-paper px-2 py-2 text-paper-foreground">
              <div className="flex items-center justify-between"><FileText className="h-4 w-4" /><span className="text-[8px] font-bold">PDF</span></div>
              <div className="mt-2 space-y-1.5"><span className="journey-ink block h-0.5 w-full bg-paper-foreground/30" /><span className="journey-ink block h-0.5 w-4/5 bg-paper-foreground/30" /></div>
              <div className="mt-2 border-t border-paper-foreground/20 pt-1 text-right text-[10px] font-extrabold">$1,900</div>
            </div>
          </div>
          <p className="mt-3 text-sm font-bold">Revisa</p>
          <p className="mt-1 text-xs text-muted-foreground">Español o inglés</p>
        </li>
        <li className="relative min-w-0 text-center">
          <div className="journey-stage journey-delivery mx-auto flex h-24 w-full max-w-28 items-center justify-center rounded-lg border border-accent/40 bg-secondary/30" aria-hidden="true">
            <div className="relative flex h-12 w-12 items-center justify-center rounded-full bg-accent/10 text-accent">
              <Send className="journey-plane h-6 w-6" />
              <span className="journey-received absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-accent text-accent-foreground"><Check className="h-3 w-3" /></span>
            </div>
          </div>
          <p className="mt-3 text-sm font-bold">Envía</p>
          <p className="mt-1 text-xs text-muted-foreground">PDF + mensaje</p>
        </li>
      </ol>
    </section>
  );
}
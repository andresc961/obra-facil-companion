import { ArrowDown, ArrowRight, Check, FileText, Mic, Send } from "lucide-react";
import logoIcon from "@/assets/logo-icon.png";

const stages = [
  { title: "Habla como siempre", label: "TU VOZ", color: "text-primary" },
  { title: "Elige español o inglés", label: "EL IDIOMA DE TU CLIENTE", color: "text-primary" },
  { title: "Revisa tu presupuesto", label: "TU TRABAJO, EN ORDEN", color: "text-primary" },
  { title: "Envía PDF y mensaje", label: "LISTO PARA TU CLIENTE", color: "text-accent" },
];

function StepVisual({ step }: { step: number }) {
  return (
    <div className="relative mx-auto flex h-64 w-full max-w-56 flex-col overflow-hidden rounded-lg border border-border bg-card p-4">
      <div className="mb-5 flex items-center gap-2 border-b border-border pb-3">
        <img src={logoIcon} alt="" className="h-5 w-5" />
        <span className="text-xs font-extrabold text-primary">ObraFácil</span>
        <span className="ml-auto h-1 w-6 rounded-full bg-muted-foreground/40" />
      </div>
      {step === 0 && <>
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground"><Mic className="h-7 w-7" /></div>
        <div className="my-3 flex h-6 items-center justify-center gap-1" aria-hidden="true">
          {["h-2", "h-4", "h-6", "h-3", "h-5", "h-6", "h-4", "h-2"].map((height, i) => <span key={i} className={`w-1 rounded-full bg-primary ${height}`} />)}
        </div>
        <p className="text-center text-xs leading-relaxed text-muted-foreground">“Para Doña Martha… chirrock, pintura y mano de obra…”</p>
      </>}
      {step === 1 && <>
        <p className="mb-3 text-xs font-semibold text-muted-foreground">Idioma del cliente</p>
        <div className="flex items-center justify-between border-b border-border py-3 text-sm"><span>🇲🇽 Español</span><span className="h-4 w-4 rounded-full border border-muted-foreground" /></div>
        <div className="flex items-center justify-between border-b border-primary py-3 text-sm font-bold text-primary"><span>🇺🇸 English</span><Check className="h-4 w-4" /></div>
        <p className="mt-5 text-xs text-muted-foreground">Tu voz sigue en español.</p>
      </>}
      {step === 2 && <div className="flex-1 bg-paper p-3 text-paper-foreground">
        <div className="flex items-center justify-between"><p className="text-[10px] font-bold">ESTIMATE</p><FileText className="h-4 w-4" /></div>
        <p className="mt-2 text-xs font-bold">Mrs. Martha</p>
        <div className="mt-3 space-y-2 text-[10px]">
          <div className="flex justify-between gap-2"><span>Materials</span><span>$500</span></div>
          <div className="flex justify-between gap-2"><span>Labor</span><span>$1,400</span></div>
        </div>
        <div className="mt-3 flex justify-between border-t border-paper-foreground/20 pt-2 text-sm font-extrabold"><span>Total</span><span>$1,900</span></div>
        <p className="mt-2 text-[10px] opacity-70">3 days · 50% deposit</p>
      </div>}
      {step === 3 && <>
        <div className="flex items-center gap-2 border-b border-border pb-3"><FileText className="h-7 w-7 shrink-0 text-accent" /><div><p className="text-xs font-bold">Presupuesto.pdf</p><p className="text-[10px] text-muted-foreground">Mrs. Martha · $1,900</p></div></div>
        <p className="mt-3 text-xs leading-relaxed">“Hi Mrs. Martha, here is your remodeling estimate. Thank you!”</p>
        <div className="mt-auto flex items-center justify-center gap-2 pt-3 text-xs font-bold text-accent"><Send className="h-4 w-4" /> PDF + mensaje</div>
      </>}
    </div>
  );
}

export function HowItWorks() {
  return (
    <section className="border-y border-border bg-secondary/30 px-5 py-12" aria-labelledby="how-it-works">
      <div className="mx-auto max-w-5xl">
        <div className="mb-10 text-center">
          <p className="text-xs font-bold uppercase text-primary">De tu voz a tu cliente</p>
          <h2 id="how-it-works" className="mt-3 font-display text-3xl">Así de fácil</h2>
        </div>
        <ol className="grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
          {stages.map((stage, i) => (
            <li key={stage.title} className="relative">
              <div className="mb-4 flex items-center justify-center gap-2">
                <span className={`flex h-7 w-7 items-center justify-center rounded-full border border-current text-xs font-extrabold ${stage.color}`}>{i + 1}</span>
                <span className={`text-[10px] font-bold ${stage.color}`}>{stage.label}</span>
              </div>
              <StepVisual step={i} />
              <h3 className="mt-4 text-center text-sm font-extrabold">{stage.title}</h3>
              {i < stages.length - 1 && <>
                <ArrowRight aria-hidden="true" className="absolute -right-7 top-40 hidden h-5 w-5 text-primary lg:block" />
                <ArrowDown aria-hidden="true" className="mx-auto mt-5 h-5 w-5 text-primary sm:hidden" />
              </>}
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
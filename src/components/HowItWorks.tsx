import { Check, FileText, Mic, Send } from "lucide-react";
import { useEffect, useRef } from "react";

const stages = [
  { title: "Habla en español", color: "text-primary" },
  { title: "Elige el idioma", color: "text-primary" },
  { title: "Revisa y corrige", color: "text-primary" },
  { title: "Envía a tu cliente", color: "text-accent" },
];

function StepVisual({ step }: { step: number }) {
  return (
    <div className="workflow-visual flex min-h-40 flex-col justify-center lg:min-h-52">
      {step === 0 && <>
        <div className="flex items-center gap-4" aria-hidden="true">
          <div className="workflow-mic flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground"><Mic className="h-6 w-6" /></div>
          <div className="flex h-9 flex-1 items-center gap-1.5">
            {["h-3", "h-5", "h-8", "h-4", "h-7", "h-9", "h-5", "h-3"].map((height, i) => <span key={i} className={`workflow-wave w-1.5 rounded-full bg-primary ${height}`} />)}
          </div>
        </div>
        <p className="mt-4 text-sm leading-relaxed text-muted-foreground">“Para Doña Martha: materiales $500 y mano de obra $1,400…”</p>
      </>}
      {step === 1 && <>
        <p className="mb-2 text-sm text-muted-foreground">Para tu cliente</p>
        <div className="flex items-center justify-between border-b border-border py-3 text-base"><span>Español</span><span aria-hidden="true" className="h-4 w-4 rounded-full border border-muted-foreground" /></div>
        <div className="flex items-center justify-between border-b border-primary py-3 text-base font-bold text-primary"><span>English</span><Check aria-hidden="true" className="workflow-check h-5 w-5" /></div>
        <p className="mt-3 text-sm text-muted-foreground">Tú sigues hablando español.</p>
      </>}
      {step === 2 && <div className="workflow-document border-l-2 border-primary bg-paper p-4 text-paper-foreground">
        <div className="flex items-center justify-between"><p className="text-xs font-bold">ESTIMATE</p><FileText aria-hidden="true" className="h-4 w-4" /></div>
        <p className="mt-1 text-sm font-bold">Mrs. Martha</p>
        <div className="mt-3 space-y-2 text-sm">
          <div className="flex justify-between gap-2"><span>Materials</span><span>$500</span></div>
          <div className="flex justify-between gap-2"><span>Labor</span><span>$1,400</span></div>
        </div>
        <div className="mt-3 flex justify-between border-t border-paper-foreground/20 pt-2 text-base font-extrabold"><span>Total</span><span>$1,900</span></div>
        <p className="mt-2 text-xs opacity-70">3 days · 50% deposit</p>
      </div>}
      {step === 3 && <>
        <div className="flex min-w-0 items-center gap-3 border-b border-border pb-3"><FileText aria-hidden="true" className="h-7 w-7 shrink-0 text-accent" /><div className="min-w-0"><p className="text-sm font-bold">Presupuesto.pdf</p><p className="text-sm text-muted-foreground">Mrs. Martha · $1,900</p></div></div>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">“Hi Mrs. Martha, here is your remodeling estimate. Thank you!”</p>
        <div className="mt-4 flex items-center gap-2 text-sm font-bold text-accent"><Send aria-hidden="true" className="workflow-send h-4 w-4" /> PDF + mensaje</div>
      </>}
    </div>
  );
}

export function HowItWorks() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section || !("IntersectionObserver" in window)) return;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.setAttribute("data-visible", "true");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.2 });
    section.querySelectorAll("li").forEach((step) => observer.observe(step));
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className="workflow border-y border-border bg-secondary/30 px-5 py-12 sm:py-16" aria-labelledby="how-it-works">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 text-center sm:mb-10">
          <p className="text-xs font-bold uppercase text-primary">De tu voz a tu cliente</p>
          <h2 id="how-it-works" className="mt-3 font-display text-3xl">Así de fácil</h2>
        </div>
        <ol className="grid gap-x-8 sm:grid-cols-2 sm:gap-y-8 lg:grid-cols-4">
          {stages.map((stage, i) => (
            <li key={stage.title} className="workflow-step relative grid min-w-0 grid-cols-[2rem_minmax(0,1fr)] gap-x-4 pb-8 last:pb-0 sm:pb-0">
              <span aria-hidden="true" className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-current bg-background text-sm font-extrabold ${stage.color}`}>{i + 1}</span>
              <div className="min-w-0">
                <h3 className="mb-3 pt-1 text-lg font-extrabold leading-snug">{stage.title}</h3>
                <StepVisual step={i} />
              </div>
              {i < stages.length - 1 && <span aria-hidden="true" className="absolute bottom-0 left-4 top-8 w-px bg-border sm:hidden" />}
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
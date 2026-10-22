import { useEffect, useState } from "react";
import { Download, Loader2, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Quote } from "@/lib/quote.functions";
import type { CompanyBrand } from "@/lib/quote-branding";
import { deliverFile, sendPdfWithMessage } from "@/lib/file-download";

export function QuotePdfDownload({ quote, language, brand, message }: { quote: Quote; language: "en" | "es"; brand: CompanyBrand | null; message: string }) {
  const [ready, setReady] = useState<{ quote: Quote; brand: CompanyBrand | null; language: string; blob: Blob; filename: string } | null>(null);
  const [error, setError] = useState("");
  useEffect(() => {
    let cancelled = false;
    setError("");
    import("@/lib/quote-pdf").then(async ({ createQuotePdf, quotePdfFilename }) => {
      const blob = await createQuotePdf(quote, language, brand);
      if (!cancelled) setReady({ quote, brand, language, blob, filename: quotePdfFilename(quote) });
    }).catch((e: unknown) => { if (!cancelled) setError(e instanceof Error ? e.message : "No pudimos preparar el PDF."); });
    return () => { cancelled = true; };
  }, [quote, language, brand]);
  const current = ready?.quote === quote && ready?.brand === brand && ready?.language === language ? ready : null;
  const disabled = !current || !!error;
  return <div className="space-y-3">
    <button disabled={disabled}
      onClick={() => { if (current) void sendPdfWithMessage(current.blob, current.filename, message).catch(() => setError("No pudimos enviar. Intenta de nuevo.")); }}
      className="flex w-full items-center justify-center gap-2 rounded-xl bg-accent py-4 text-lg font-extrabold text-accent-foreground disabled:opacity-60">
      {current ? <MessageCircle className="h-6 w-6" /> : <Loader2 className="h-6 w-6 animate-spin" />} {current ? "Enviar PDF y mensaje por WhatsApp" : "Preparando PDF…"}
    </button>
    <Button variant="outline" className="h-12 w-full text-base font-bold" disabled={disabled}
      onClick={() => { if (current) void deliverFile(current.blob, current.filename).catch(() => setError("No pudimos descargar el archivo. Intenta de nuevo.")); }}>
      <Download /> Solo descargar PDF
    </Button>
    {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
  </div>;
}

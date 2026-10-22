import { useEffect, useState } from "react";
import { Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Quote } from "@/lib/quote.functions";
import type { CompanyBrand } from "@/lib/quote-branding";
import { deliverFile } from "@/lib/file-download";

export function QuotePdfDownload({ quote, language, brand }: { quote: Quote; language: "en" | "es"; brand: CompanyBrand | null }) {
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
  return <div>
    <Button variant="outline" className="h-12 w-full text-base font-bold" disabled={!current || !!error}
      onClick={() => { if (current) void deliverFile(current.blob, current.filename).catch(() => setError("No pudimos descargar el archivo. Intenta de nuevo.")); }}>
      {current ? <Download /> : <Loader2 className="animate-spin" />} {current ? "Descargar PDF" : "Preparando PDF…"}
    </Button>
    {error && <p role="alert" className="mt-2 text-sm text-destructive">{error}</p>}
  </div>;
}
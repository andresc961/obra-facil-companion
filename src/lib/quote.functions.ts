import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const QuoteSchema = z.object({
  client_name: z.string(),
  project_title: z.string(),
  items: z.array(
    z.object({ description: z.string(), qty: z.number(), unit_price: z.number(), total: z.number() }),
  ),
  notes: z.string(),
  whatsapp_message: z.string(),
});
export type Quote = z.infer<typeof QuoteSchema>;

const BASE = `You are the AI engine of ObraFácil, an expert construction and remodeling estimator.
The contractor talks NATURALLY into the phone, usually in informal SPANISH (any Latin American dialect, construction slang, Spanglish), sometimes rambling, repeating or correcting himself. Your job is to understand what he means and turn it into a formal, clear, professional estimate written ENTIRELY IN {LANG} for the client.
Rules:
1. Ignore filler words, greetings and off-topic talk. When he corrects himself ("no, mejor ponle 600", "espérate, son 3 cuartos"), use the LAST stated value.
2. Extract the client name (keep it as spoken, translating honorifics, e.g. "Doña Martha" -> "Mrs. Martha" in English). If no name is said, use "Client" / "Cliente". Write a concise professional project title.
3. Split every material and every labor task into separate, well-described line items with qty, unit_price and total (total = qty * unit_price). Understand spoken numbers ("mil quinientos", "dos cincuenta" = 250, "a 35 cada una"). If only a lump price is given, use qty 1. Never invent prices: if a task has no price, include it with unit_price 0 and mention in notes that the price is pending.
4. Turn slang into professional US construction terms in {LANG} (e.g. "tumbar pared y poner chirrock" -> "Demolition of existing partition wall and installation of drywall panels"; "porcelanato" -> "porcelain tile"; "láminas de zinc" -> "corrugated metal roofing sheets"; "resanar" -> "patch and repair").
5. notes: short professional {LANG} notes for the client: scope, timeline, warranty, payment terms or conditions he mentioned, and any pending items. Use "" if none.
6. whatsapp_message: a short, warm, professional {LANG} WhatsApp message from the contractor to the client presenting the estimate with the total in USD, asking them to review and approve.
Write every output field in {LANG} only (proper names excepted).`;

export const generateEnglishQuote = createServerFn({ method: "POST" })
  .inputValidator((input) => z.object({ transcript: z.string().min(5).max(4000), language: z.enum(["en", "es"]) }).parse(input))
  .handler(async ({ data }) => {
    const apiKey = process.env["LOVABLE_API_KEY"];
    if (!apiKey) throw new Error("AI is not configured.");
    const { createOpenAI } = await import("@ai-sdk/openai");
    const { streamText, Output, NoObjectGeneratedError } = await import("ai");

    let runId: string | undefined;
    const provider = createOpenAI({
      baseURL: "https://ai.gateway.lovable.dev/v1",
      apiKey,
      headers: { "Lovable-API-Key": apiKey, "X-Lovable-AIG-SDK": "vercel-ai-sdk" },
      fetch: async (input, init) => {
        const headers = new Headers(init?.headers);
        if (runId) headers.set("X-Lovable-AIG-Run-ID", runId);
        const res = await fetch(input, { ...init, headers });
        runId ??= res.headers.get("X-Lovable-AIG-Run-ID") ?? undefined;
        return res;
      },
    });

    const result = streamText({
      model: provider.responses("openai/gpt-6-astra"),
      system: BASE.replaceAll("{LANG}", data.language === "en" ? "ENGLISH (US)" : "NEUTRAL SPANISH"),
      prompt: `Contractor voice note (Spanish):\n"""${data.transcript}"""`,
      output: Output.object({ schema: QuoteSchema }),
      providerOptions: {
        openai: {
          forceReasoning: true,
          reasoningEffort: "low",
          reasoningSummary: "auto",
          store: false,
          include: ["reasoning.encrypted_content"],
        },
      },
    });

    try {
      const quote = await result.output;
      quote.items = quote.items.map((i) => ({ ...i, total: Math.round(i.qty * i.unit_price * 100) / 100 }));
      return { ok: true as const, quote };
    } catch (e) {
      if (NoObjectGeneratedError.isInstance(e)) return { ok: false as const, error: "No pudimos armar el presupuesto. Intenta describirlo otra vez." };
      const status = (e as { statusCode?: number })?.statusCode;
      if (status === 429) return { ok: false as const, error: "Demasiadas solicitudes. Espera un momento." };
      if (status === 402) return { ok: false as const, error: "Se acabaron los créditos de IA del espacio de trabajo." };
      console.error(e);
      return { ok: false as const, error: "Error al generar el presupuesto." };
    }
  });

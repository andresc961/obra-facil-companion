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

const INSTRUCTIONS = `You are the AI engine of ObraFácil, an expert construction and remodeling assistant.
The contractor speaks informal SPANISH (any Latin American dialect, construction slang). Your job is to turn the voice note into a formal, clear, professional estimate written ENTIRELY IN ENGLISH for an English-speaking client.
Rules:
1. Extract the client name (keep it as spoken, e.g. "Doña Martha" -> "Mrs. Martha") and an English project title.
2. Split every material and every labor task into separate line items with qty, unit_price and total (total = qty * unit_price). If only a lump price is given, use qty 1.
3. Translate slang into professional US construction terms (e.g. "tumbar pared y poner chirrock" -> "Demolition of existing partition wall and installation of drywall panels"; "porcelanato" -> "porcelain tile"; "láminas de zinc" -> "corrugated metal roofing sheets").
4. notes: short English notes for the client (scope, warranty or conditions mentioned), or "".
5. whatsapp_message: a short, friendly, professional English WhatsApp message from the contractor to the client presenting the estimate with the total in USD, asking them to review and approve.
Never output Spanish except proper names.`;

export const generateEnglishQuote = createServerFn({ method: "POST" })
  .inputValidator((input) => z.object({ transcript: z.string().min(5).max(4000) }).parse(input))
  .handler(async ({ data }) => {
    const apiKey = process.env.LOVABLE_API_KEY;
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
      system: INSTRUCTIONS,
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

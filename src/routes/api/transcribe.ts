import { createFileRoute } from "@tanstack/react-router";

const MAX = 20 * 1024 * 1024;

export const Route = createFileRoute("/api/transcribe")({
  staticData: { sitemap: false },
  server: {
    handlers: {
      POST: async ({ request }) => {
        const apiKey = process.env["LOVABLE_API_KEY"];
        if (!apiKey) return Response.json({ error: "IA no configurada." }, { status: 500 });
        const len = Number(request.headers.get("content-length") ?? 0);
        if (len > MAX) return Response.json({ error: "La grabación es muy larga." }, { status: 413 });
        const form = await request.formData();
        const file = form.get("file");
        if (!(file instanceof File) || file.size < 2048 || file.size > MAX || !file.type.startsWith("audio/"))
          return Response.json({ error: "Grabación vacía. Intenta de nuevo." }, { status: 400 });

        const up = new FormData();
        up.append("model", "openai/gpt-transcribe");
        up.append("file", file, file.name || "recording.wav");
        up.append("response_format", "json");
        up.append("stream", "true");
        up.append("language", "es");
        const res = await fetch("https://ai.gateway.lovable.dev/v1/audio/transcriptions", {
          method: "POST",
          headers: { Authorization: `Bearer ${apiKey}` },
          body: up,
          signal: request.signal,
        });
        if (!res.ok || !res.body) {
          const msg = res.status === 429 ? "Demasiadas solicitudes. Espera un momento."
            : res.status === 402 ? "Se acabaron los créditos de IA." : "No pudimos entender el audio. Intenta otra vez.";
          console.error("transcribe", res.status, await res.text().catch(() => ""));
          return Response.json({ error: msg }, { status: res.status || 500 });
        }
        // Read the SSE stream to the end and assemble the final transcript.
        const reader = res.body.pipeThrough(new TextDecoderStream()).getReader();
        let buf = "", text = "", final: string | null = null;
        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;
          buf += value;
          const lines = buf.split("\n");
          buf = lines.pop() ?? "";
          for (const line of lines) {
            if (!line.startsWith("data:")) continue;
            const raw = line.slice(5).trim();
            if (!raw || raw === "[DONE]") continue;
            try {
              const ev = JSON.parse(raw);
              if (ev.type === "transcript.text.delta") text += ev.delta ?? "";
              else if (ev.type === "transcript.text.done") final = ev.text ?? text;
              else if (ev.type === "error") return Response.json({ error: "Error al transcribir." }, { status: 502 });
            } catch { /* ignore partial */ }
          }
        }
        return Response.json({ text: (final ?? text).trim() });
      },
    },
  },
});

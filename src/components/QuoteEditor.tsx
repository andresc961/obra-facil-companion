import { Plus, Trash2 } from "lucide-react";
import type { Quote } from "@/lib/quote.functions";

type Item = Quote["items"][number];
const round = (n: number) => Math.round(n * 100) / 100;

export function withTotals(items: Item[]): Item[] {
  return items.map((i) => ({ ...i, total: round(i.qty * i.unit_price) }));
}

const input = "w-full rounded-lg border border-paper-foreground/25 bg-paper p-2 text-sm text-paper-foreground outline-none focus:border-primary";

export function QuoteEditor({ quote, onChange, en }: { quote: Quote; onChange: (q: Quote) => void; en: boolean }) {
  const set = (patch: Partial<Quote>) => onChange({ ...quote, ...patch });
  const setItem = (k: number, patch: Partial<Item>) =>
    set({ items: withTotals(quote.items.map((it, i) => (i === k ? { ...it, ...patch } : it))) });
  const num = (v: string) => (Number.isFinite(parseFloat(v)) ? parseFloat(v) : 0);

  return (
    <div className="space-y-3 text-paper-foreground">
      <label className="block text-xs font-semibold opacity-70">Cliente
        <input className={input} value={quote.client_name} onChange={(e) => set({ client_name: e.target.value })} />
      </label>
      <label className="block text-xs font-semibold opacity-70">Título del trabajo
        <input className={input} value={quote.project_title} onChange={(e) => set({ project_title: e.target.value })} />
      </label>

      <p className="pt-2 text-xs font-semibold opacity-70">Partidas</p>
      {quote.items.map((it, k) => (
        <div key={k} className="space-y-2 rounded-lg border border-paper-foreground/15 p-3">
          <textarea rows={2} className={input} value={it.description} placeholder="Descripción" onChange={(e) => setItem(k, { description: e.target.value })} />
          <div className="flex items-end gap-2">
            <label className="w-20 text-xs opacity-70">Cant.
              <input type="number" inputMode="decimal" min={0} className={input} value={it.qty} onChange={(e) => setItem(k, { qty: num(e.target.value) })} />
            </label>
            <label className="flex-1 text-xs opacity-70">Precio c/u ($)
              <input type="number" inputMode="decimal" min={0} step="0.01" className={input} value={it.unit_price} onChange={(e) => setItem(k, { unit_price: num(e.target.value) })} />
            </label>
            <button aria-label="Quitar partida" onClick={() => set({ items: quote.items.filter((_, i) => i !== k) })}
              className="rounded-lg border border-destructive p-2 text-destructive"><Trash2 className="h-4 w-4" /></button>
          </div>
          <p className="text-right text-sm font-semibold">= ${it.total.toFixed(2)}</p>
        </div>
      ))}
      <button onClick={() => set({ items: [...quote.items, { description: "", qty: 1, unit_price: 0, total: 0 }] })}
        className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-paper-foreground/40 py-2 text-sm font-semibold">
        <Plus className="h-4 w-4" /> Agregar partida
      </button>

      <label className="block text-xs font-semibold opacity-70">Notas
        <textarea rows={3} className={input} value={quote.notes} onChange={(e) => set({ notes: e.target.value })} />
      </label>
      <label className="block text-xs font-semibold opacity-70">Mensaje para tu cliente ({en ? "inglés" : "español"})
        <textarea rows={4} className={input} value={quote.whatsapp_message} onChange={(e) => set({ whatsapp_message: e.target.value })} />
      </label>
    </div>
  );
}

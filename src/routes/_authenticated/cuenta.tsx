import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { ArrowLeft, Lock, Loader2, ImagePlus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAccount } from "@/hooks/use-account";
import { createPortalSession } from "@/lib/payments.functions";
import { getStripeEnvironment } from "@/lib/stripe";
import { canUseBranding, freeLeft } from "@/lib/pricing";

export const Route = createFileRoute("/_authenticated/cuenta")({
  head: () => ({
    meta: [
      { title: "Mi cuenta — ObraFácil" },
      { name: "description", content: "Tu plan, tus presupuestos y los datos de tu empresa." },
      { property: "og:title", content: "Mi cuenta — ObraFácil" },
      { property: "og:description", content: "Tu plan y los datos de tu empresa." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Account,
});

async function shrinkLogo(file: File): Promise<string> {
  if (!file.type.startsWith("image/") || file.size > 10 * 1024 * 1024) throw new Error("Elige una imagen de hasta 10 MB.");
  const img = await createImageBitmap(file);
  const scale = Math.min(1, 300 / Math.max(img.width, img.height));
  const c = document.createElement("canvas");
  c.width = Math.round(img.width * scale); c.height = Math.round(img.height * scale);
  const ctx = c.getContext("2d");
  if (!ctx) throw new Error("No pudimos cargar el logo.");
  ctx.drawImage(img, 0, 0, c.width, c.height);
  img.close();
  return c.toDataURL("image/png");
}

function Account() {
  const { data: acc } = useAccount();
  const qc = useQueryClient();
  const navigate = useNavigate();
  const portal = useServerFn(createPortalSession);
  const [form, setForm] = useState({ company_name: "", phone: "", email: "", address: "", logo_url: "" });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    if (acc?.profile) setForm({
      company_name: acc.profile.company_name ?? "", phone: acc.profile.phone ?? "", email: acc.profile.email ?? "",
      address: acc.profile.address ?? "", logo_url: acc.profile.logo_url ?? "",
    });
  }, [acc?.profile]);

  const branding = acc ? canUseBranding(acc) : false;

  const save = async () => {
    if (!branding) return;
    setSaving(true); setMsg(null);
    try {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) { setMsg("Inicia sesión para guardar."); return; }
      const { error } = await supabase.from("business_profiles").upsert({ user_id: u.user.id, ...form, updated_at: new Date().toISOString() });
      setMsg(error ? "No se pudo guardar." : "¡Guardado!");
      if (!error) await qc.invalidateQueries({ queryKey: ["account"] });
    } catch { setMsg("No se pudo guardar. Intenta de nuevo."); }
    finally { setSaving(false); }
  };

  const signOut = async () => {
    await qc.cancelQueries(); qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  };

  const manage = async () => {
    const r = await portal({ data: { environment: getStripeEnvironment(), returnUrl: window.location.href } });
    if ("error" in r) return setMsg(r.error);
    window.open(r.url, "_blank");
  };

  const field = (k: keyof typeof form, label: string, type = "text") => (
    <input type={type} aria-label={label} disabled={!branding} value={form[k]} onChange={(e) => setForm({ ...form, [k]: e.target.value })} placeholder={label}
      className="w-full rounded-xl border border-border bg-background p-3 outline-none focus:border-primary disabled:opacity-50" />
  );

  return (
    <main className="min-h-screen bg-background px-5 pb-16 font-sans text-foreground">
      <div className="mx-auto max-w-xl">
        <header className="flex items-center gap-3 py-4">
          <Link to="/grabar" className="rounded-lg bg-card p-2"><ArrowLeft className="h-5 w-5" /></Link>
          <span className="font-display text-xl">Mi cuenta</span>
        </header>

        <section className="rounded-2xl bg-card p-5">
          <p className="text-xs font-semibold uppercase text-muted-foreground">Tu plan</p>
          {acc ? (
            acc.subscribed ? (
              <>
                <p className="mt-1 text-xl font-extrabold">⭐ Plan Maestro · ilimitado</p>
                {acc.subscription?.cancel_at_period_end && acc.subscription.current_period_end && (
                  <p className="text-sm text-muted-foreground">Termina el {new Date(acc.subscription.current_period_end).toLocaleDateString("es")}</p>
                )}
                <button onClick={manage} className="mt-3 text-sm text-primary underline">Administrar o cancelar suscripción</button>
              </>
            ) : (
              <>
                <p className="mt-1 text-xl font-extrabold">{freeLeft(acc)} gratis · {acc.paidCredits} pagados</p>
                <Link to="/precios" className="mt-3 inline-block rounded-xl bg-primary px-4 py-3 font-extrabold text-primary-foreground">Comprar o activar Plan Maestro</Link>
              </>
            )
          ) : <Loader2 className="mt-2 h-5 w-5 animate-spin" />}
        </section>

        <section className="mt-6 rounded-2xl bg-card p-5">
          <p className="font-extrabold">Datos de tu empresa</p>
          {!branding && (
            <div className="mt-3 flex items-start gap-2 rounded-xl border border-primary p-3 text-sm">
              <Lock className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <span>Disponible con el Plan Maestro ($10/mes). <Link to="/precios" className="font-bold text-primary underline">Activar</Link></span>
            </div>
          )}
          <div className="mt-4 space-y-3">
            <div className="flex items-center gap-3">
              {form.logo_url ? <img src={form.logo_url} alt="Logo" className="h-16 w-16 rounded-lg bg-paper object-contain" /> : <div className="h-16 w-16 rounded-lg border border-dashed border-border" />}
              <Button asChild variant="outline" disabled={!branding}><label className={branding ? "cursor-pointer" : "pointer-events-none opacity-50"}>
                <ImagePlus /> Subir logo
                <input type="file" aria-label="Subir logo" accept="image/*" hidden disabled={!branding}
                  onChange={async (e) => {
                    const f = e.target.files?.[0];
                    if (!f || !branding) return;
                    try { const logo_url = await shrinkLogo(f); setForm((previous) => ({ ...previous, logo_url })); setMsg(null); }
                    catch (error) { setMsg(error instanceof Error ? error.message : "No pudimos cargar el logo."); }
                  }} />
              </label></Button>
              {form.logo_url && <Button variant="ghost" size="icon" title="Quitar logo" aria-label="Quitar logo" disabled={!branding} onClick={() => setForm({ ...form, logo_url: "" })}><Trash2 /></Button>}
            </div>
            {field("company_name", "Nombre de tu empresa")}
            {field("phone", "Teléfono", "tel")}
            {field("email", "Correo de contacto", "email")}
            {field("address", "Dirección o ciudad")}
            <Button onClick={save} disabled={!branding || saving} className="h-12 w-full font-extrabold">
              {saving ? "Guardando…" : "Guardar"}
            </Button>
            {msg && <p role="status" className="text-sm text-muted-foreground">{msg}</p>}
          </div>
        </section>

        <button onClick={signOut} className="mt-8 w-full rounded-xl border border-border py-3 text-sm text-muted-foreground">Cerrar sesión</button>
      </div>
    </main>
  );
}

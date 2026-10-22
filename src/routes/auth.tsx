import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";

type AuthSearch = { modo?: "entrar" | "crear" };

export const Route = createFileRoute("/auth")({
  validateSearch: (search: Record<string, unknown>): AuthSearch => ({
    modo: search.modo === "entrar" ? "entrar" : search.modo === "crear" ? "crear" : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Entrar a ObraFácil" },
      { name: "description", content: "Crea tu cuenta gratis o entra para hacer presupuestos por voz." },
      { property: "og:title", content: "Entrar a ObraFácil" },
      { property: "og:description", content: "Tus primeros 3 presupuestos son gratis." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const { modo } = Route.useSearch();
  const [mode, setMode] = useState<"in" | "up">(modo === "entrar" ? "in" : "up");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ err?: string; ok?: string }>({});
  useEffect(() => { if (modo) setMode(modo === "entrar" ? "in" : "up"); }, [modo]);



  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => { if (data.session) navigate({ to: "/grabar", replace: true }); });
    const { data } = supabase.auth.onAuthStateChange((e, s) => { if (e === "SIGNED_IN" && s) navigate({ to: "/grabar", replace: true }); });
    return () => data.subscription.unsubscribe();
  }, [navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setBusy(true); setMsg({});
    if (mode === "up") {
      const { data, error } = await supabase.auth.signUp({ email, password, options: { emailRedirectTo: window.location.origin + "/grabar" } });
      if (error) setMsg({ err: error.message });
      else if (!data.session) setMsg({ ok: "Te enviamos un correo. Ábrelo y confirma tu cuenta para entrar." });
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setMsg({ err: "Correo o contraseña incorrectos." });
    }
    setBusy(false);
  };

  const google = async () => {
    setMsg({});
    const r = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin + "/auth" });
    if (r.error) setMsg({ err: "No se pudo entrar con Google." });
  };

  return (
    <main className="min-h-screen bg-background px-5 font-sans text-foreground">
      <div className="mx-auto max-w-md py-4">
        <Link to="/" className="inline-flex rounded-lg bg-card p-2"><ArrowLeft className="h-5 w-5" /></Link>
        <h1 className="mt-6 font-display text-3xl">{mode === "up" ? "Crea tu cuenta gratis" : "Entra a tu cuenta"}</h1>
        <p className="mt-2 text-muted-foreground">Tus primeros 3 presupuestos son gratis.</p>

        <button onClick={google} className="mt-6 w-full rounded-xl bg-paper py-4 font-extrabold text-paper-foreground">Continuar con Google</button>
        <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground"><span className="h-px flex-1 bg-border" />o con tu correo<span className="h-px flex-1 bg-border" /></div>

        <form onSubmit={submit} className="space-y-3">
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Tu correo" autoComplete="email"
            className="w-full rounded-xl border border-border bg-card p-4 outline-none focus:border-primary" />
          <input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Contraseña (mínimo 6)" autoComplete={mode === "up" ? "new-password" : "current-password"}
            className="w-full rounded-xl border border-border bg-card p-4 outline-none focus:border-primary" />
          <button disabled={busy} className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-4 text-lg font-extrabold text-primary-foreground disabled:opacity-60">
            {busy && <Loader2 className="h-5 w-5 animate-spin" />}{mode === "up" ? "Crear cuenta" : "Entrar"}
          </button>
        </form>
        {msg.err && <p className="mt-3 rounded-lg bg-destructive p-3 text-sm text-destructive-foreground">{msg.err}</p>}
        {msg.ok && <p className="mt-3 rounded-lg border border-accent p-3 text-sm">{msg.ok}</p>}
        <button onClick={() => { setMode(mode === "up" ? "in" : "up"); setMsg({}); }} className="mt-5 w-full text-sm text-primary underline">
          {mode === "up" ? "¿Ya tienes cuenta? Entra aquí" : "¿No tienes cuenta? Créala gratis"}
        </button>
      </div>
    </main>
  );
}

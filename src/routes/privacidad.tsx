import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/privacidad")({
  staticData: { sitemap: false },
  head: () => ({ meta: [
    { title: "Privacidad y Términos / Privacy & Terms — ObraFácil" },
    { name: "description", content: "Política de privacidad y términos de servicio de ObraFácil en español e inglés, incluida la autorización de mensajes SMS y WhatsApp." },
    { property: "og:title", content: "Privacidad y Términos / Privacy & Terms — ObraFácil" },
    { property: "og:description", content: "Bilingual privacy policy and terms of service for ObraFácil, a U.S. company." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: Privacy,
});

type Sec = [string, string[]];

const ES: Sec[] = [
  ["Quiénes somos", ["ObraFácil (www.obrafacil.biz) es un servicio operado por una empresa de los Estados Unidos. Estos términos y esta política se rigen por las leyes de los Estados Unidos y del estado donde la empresa está registrada."]],
  ["Datos de tu cuenta", ["Tratamos tu correo, identificador de cuenta y datos de acceso para iniciar sesión y proteger tu cuenta. Si usas Apple o Google, recibimos la información que autorizas. Registramos el uso de presupuestos, créditos y estado de tu plan."]],
  ["Voz, transcripción y presupuestos", ["El audio se envía a servicios de transcripción y la transcripción a servicios de IA únicamente para generar tu presupuesto y mensaje. No vendemos tus grabaciones ni las usamos para publicidad, y no guardamos una biblioteca de audio.", "La prueba sin cuenta guarda en tu navegador un indicador de uso y el texto, para continuar tras registrarte."]],
  ["Protección de datos", ["Usamos conexiones cifradas (HTTPS), controles de acceso por usuario y proveedores reconocidos (Lovable Cloud para cuentas y Stripe para pagos). No almacenamos números completos de tarjeta. Ningún sistema garantiza seguridad absoluta."]],
  ["Mensajes SMS y WhatsApp", ["Solo te enviaremos SMS o WhatsApp si das tu consentimiento expreso al proporcionar tu número. Pueden incluir códigos de acceso, avisos de cuenta y novedades del servicio. La frecuencia varía; pueden aplicar tarifas de mensajes y datos.", "Responde STOP para cancelar o HELP para ayuda. El consentimiento no es condición de compra. No vendemos ni compartimos tu número con terceros para marketing.", "Los mensajes que tú envías a tus clientes desde tu teléfono los eliges y envías tú; eres responsable de tener permiso para contactarlos."]],
  ["Datos de empresa", ["Nombre, teléfono, correo, dirección y logo son opcionales y se muestran en tus presupuestos solo si tu plan lo permite y tú lo eliges."]],
  ["Conservación y eliminación", ["Conservamos tus datos mientras tengas cuenta. Puedes borrarlos en Mi cuenta → Eliminar mi cuenta y datos. Se cancelan suscripciones activas (sin reembolso automático) y se pierden los créditos. Los PDFs ya enviados no se borran de otros dispositivos."]],
  ["Términos de servicio", ["Debes tener 18 años o más. Los presupuestos generados por IA son borradores: revisa precios, cantidades y condiciones antes de enviarlos; tú eres responsable del contenido y de tus acuerdos con clientes.", "Planes: 3 presupuestos gratis, luego $1 por presupuesto o $10 al mes ilimitado. La suscripción se renueva hasta que la canceles. No uses el servicio para fines ilegales o abusivos.", "El servicio se ofrece \"tal cual\"; en la medida permitida por la ley, nuestra responsabilidad se limita a lo que hayas pagado en los últimos 12 meses. Publicaremos aquí cualquier cambio con su fecha."]],
];

const EN: Sec[] = [
  ["Who we are", ["ObraFácil (www.obrafacil.biz) is operated by a United States company. These terms and this policy are governed by the laws of the United States and of the state where the company is registered."]],
  ["Account data", ["We process your email, account ID and sign-in data to log you in and protect your account. If you use Apple or Google, we receive the information you authorize. We record quote usage, credits and plan status."]],
  ["Voice, transcription and quotes", ["Audio is sent to transcription services and the transcript to AI services solely to create your quote and message. We do not sell recordings or use them for advertising, and we keep no audio library.", "The no-account trial stores a usage flag and the text in your browser so you can continue after signing up."]],
  ["Data protection", ["We use encrypted connections (HTTPS), per-user access controls and established providers (Lovable Cloud for accounts, Stripe for payments). We never store full card numbers. No system can guarantee absolute security."]],
  ["SMS and WhatsApp messages", ["We only send SMS or WhatsApp messages if you expressly opt in when providing your number. Messages may include sign-in codes, account notices and service updates. Frequency varies; message and data rates may apply.", "Reply STOP to unsubscribe or HELP for help. Consent is not a condition of purchase. We do not sell or share your number with third parties for marketing.", "Messages you send to your own clients from your phone are chosen and sent by you; you are responsible for having permission to contact them."]],
  ["Business data", ["Company name, phone, email, address and logo are optional and appear on your quotes only when your plan allows it and you choose to include them."]],
  ["Retention and deletion", ["We keep your data while you have an account. Delete it in My account → Delete my account and data. Active subscriptions are canceled (no automatic refund) and credits are lost. PDFs already sent are not removed from other devices."]],
  ["Terms of service", ["You must be 18 or older. AI-generated quotes are drafts: review prices, quantities and terms before sending; you are responsible for their content and your agreements with clients.", "Plans: 3 free quotes, then $1 per quote or $10/month unlimited. Subscriptions renew until canceled. Do not use the service for illegal or abusive purposes.", "The service is provided \"as is\"; to the extent allowed by law, our liability is limited to what you paid in the last 12 months. Any changes will be posted here with their date."]],
];

function Block({ id, title, updated, secs }: { id: string; title: string; updated: string; secs: Sec[] }) {
  return <section id={id} className="mt-10">
    <h2 className="font-display text-2xl">{title}</h2>
    <p className="mt-2 text-sm text-muted-foreground">{updated}</p>
    <div className="mt-6 space-y-7 leading-relaxed">
      {secs.map(([h, ps]) => <div key={h}><h3 className="text-lg font-bold">{h}</h3>{ps.map((p) => <p key={p} className="mt-2 text-muted-foreground">{p}</p>)}</div>)}
    </div>
  </section>;
}

function Privacy() {
  return <main className="min-h-screen bg-background px-5 py-8 font-sans text-foreground">
    <div className="mx-auto max-w-2xl">
      <Button asChild variant="outline"><Link to="/"><ArrowLeft /> ObraFácil</Link></Button>
      <h1 className="mt-8 font-display text-3xl">Privacidad y Términos · Privacy & Terms</h1>
      <nav className="mt-4 flex gap-3 text-sm font-semibold">
        <a href="#es" className="rounded-lg bg-card px-3 py-2">🇲🇽 Español</a>
        <a href="#en" className="rounded-lg bg-card px-3 py-2">🇺🇸 English</a>
      </nav>
      <Block id="es" title="Política de privacidad y Términos de servicio" updated="Actualizada el 26 de octubre de 2026" secs={ES} />
      <Block id="en" title="Privacy Policy and Terms of Service" updated="Updated October 26, 2026" secs={EN} />
    </div>
  </main>;
}

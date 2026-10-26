import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/privacidad")({
  staticData: { sitemap: false },
  head: () => ({ meta: [
    { title: "Política de privacidad — ObraFácil" },
    { name: "description", content: "Cómo ObraFácil trata los datos de cuenta, grabaciones de voz y datos de empresa, y cómo eliminar tu cuenta." },
    { property: "og:title", content: "Política de privacidad — ObraFácil" },
    { property: "og:description", content: "Información sobre tus datos, permisos y eliminación de cuenta en ObraFácil." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: Privacy,
});

function Privacy() {
  return <main className="min-h-screen bg-background px-5 py-8 font-sans text-foreground">
    <div className="mx-auto max-w-2xl">
      <Button asChild variant="outline"><Link to="/"><ArrowLeft /> ObraFácil</Link></Button>
      <h1 className="mt-8 font-display text-3xl">Política de privacidad</h1>
      <p className="mt-3 text-sm text-muted-foreground">ObraFácil · www.obrafacil.biz · Actualizada el 26 de octubre de 2026</p>
      <div className="mt-8 space-y-8 text-base leading-relaxed">
        <section><h2 className="text-xl font-bold">Datos de tu cuenta</h2><p className="mt-2 text-muted-foreground">Tratamos tu correo electrónico, identificador de cuenta e información de acceso para iniciar sesión y proteger tu cuenta. Si usas Apple o Google, recibimos la información que autorizas compartir. Registramos el uso de presupuestos, los créditos disponibles y el estado de tu plan para ofrecer el servicio.</p></section>
        <section><h2 className="text-xl font-bold">Voz, transcripción y presupuestos</h2><p className="mt-2 text-muted-foreground">Al grabar, enviamos el audio a servicios de transcripción y la transcripción a servicios de inteligencia artificial para generar tu presupuesto y el mensaje para tu cliente. Procesamos la grabación únicamente con esa finalidad; no vendemos tus grabaciones ni las usamos para publicidad. ObraFácil no guarda una biblioteca de audio. Los proveedores pueden conservar datos técnicos según sus políticas y obligaciones de seguridad. Evita dictar datos sensibles que no sean necesarios para el presupuesto.</p><p className="mt-2 text-muted-foreground">La prueba sin cuenta guarda en tu navegador un indicador de uso y el texto de ejemplo o transcripción para continuar tras registrarte. Los presupuestos se preparan en la sesión actual; los archivos descargados o enviados quedan bajo tu control.</p></section>
        <section><h2 className="text-xl font-bold">Datos opcionales de empresa</h2><p className="mt-2 text-muted-foreground">Puedes guardar el nombre, teléfono, correo, dirección y logo de tu empresa. Son opcionales y se usan para personalizar tus presupuestos cuando tu plan lo permite y tú eliges incluirlos. Al compartir un PDF o mensaje, estos datos y los datos del cliente que hayas incluido serán visibles para el destinatario.</p></section>
        <section><h2 className="text-xl font-bold">Permisos del dispositivo</h2><p className="mt-2 text-muted-foreground">Solicitamos acceso al micrófono cuando decides grabar. El selector de fotos o archivos permite elegir una imagen para tu logo, sin acceder a toda tu biblioteca. Puedes denegar o revocar estos permisos en los ajustes del dispositivo; podrás seguir escribiendo presupuestos. Para enviar un PDF, tú seleccionas la aplicación y el destinatario.</p></section>
        <section><h2 className="text-xl font-bold">Proveedores, pagos y seguridad</h2><p className="mt-2 text-muted-foreground">Usamos Lovable Cloud para gestionar cuentas y datos, proveedores de IA para procesar el presupuesto y Stripe para los pagos disponibles en la web. No almacenamos los números completos de tus tarjetas. Estos proveedores reciben los datos necesarios para prestar sus servicios y pueden procesarlos fuera de tu país. Aplicamos controles de acceso para limitar el acceso a los datos de tu cuenta; ningún sistema garantiza seguridad absoluta.</p></section>
        <section><h2 className="text-xl font-bold">Conservación y eliminación</h2><p className="mt-2 text-muted-foreground">Conservamos los datos de cuenta y empresa mientras mantengas tu cuenta o sean necesarios para prestar el servicio. Para eliminarlos, entra en <strong>Mi cuenta → Eliminar mi cuenta y datos</strong> y confirma con <strong>Sí, eliminar cuenta</strong>. Se eliminarán tu cuenta, perfil de empresa, uso, créditos y registros de suscripción de ObraFácil. La eliminación es permanente y los créditos restantes se pierden. Se cancelarán las suscripciones vinculadas para evitar renovaciones futuras; esto no genera un reembolso automático.</p><p className="mt-2 text-muted-foreground">Las copias de PDFs que hayas descargado o enviado no se eliminan de tus dispositivos ni de los de tus clientes. Stripe y otros proveedores pueden conservar registros que deban mantener por motivos legales, contables o de seguridad.</p></section>
        <section><h2 className="text-xl font-bold">Tus decisiones y cambios</h2><p className="mt-2 text-muted-foreground">Puedes revisar y corregir los datos de empresa desde Mi cuenta, no incluirlos en un presupuesto, revocar permisos o eliminar tu cuenta. Publicaremos aquí cualquier actualización de esta política con su fecha de revisión.</p></section>
      </div>
    </div>
  </main>;
}
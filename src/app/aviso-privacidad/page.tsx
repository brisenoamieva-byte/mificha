import type { Metadata } from "next";
import Link from "next/link";
import {
  LegalList,
  LegalPageShell,
  LegalParagraph,
  LegalSection,
} from "@/components/marketing/legal-page-shell";
import { LEGAL_ENTITY, LEGAL_ROUTES, PRIVACY_NOTICE_SHORT } from "@/lib/legal";

export const metadata: Metadata = {
  title: "Aviso de privacidad | MiFicha",
  description:
    "Aviso de privacidad integral conforme a la LFPDPPP. Tratamiento de datos personales y protección de menores en MiFicha.",
  robots: { index: true, follow: true },
};

export default function AvisoPrivacidadPage() {
  return (
    <LegalPageShell
      kicker="Protección de datos"
      title="Aviso de privacidad integral"
      description="MiFicha procesa datos de academias deportivas escolares y, en su nombre, datos de jugadores — incluidos menores de edad — con fines deportivos, de comunicación con padres y, opcionalmente, de visibilidad controlada para visorías. Este documento cumple con la Ley Federal de Protección de Datos Personales en Posesión de los Particulares (LFPDPPP) y su Reglamento."
    >
      <LegalSection title="Identidad y domicilio del responsable">
        <LegalParagraph>
          <strong className="text-mf-text">{LEGAL_ENTITY.operator}</strong>, operador
          de la plataforma digital {LEGAL_ENTITY.domain}, con domicilio en{" "}
          {LEGAL_ENTITY.address}, es responsable del tratamiento de los datos
          personales de las cuentas de academia (administradores) y actúa como
          encargado del tratamiento respecto de los datos de jugadores que cada
          academia carga en la plataforma.
        </LegalParagraph>
        <LegalParagraph>
          Para dudas generales:{" "}
          <a href={`mailto:${LEGAL_ENTITY.contactEmail}`} className="text-mf-brand hover:underline">
            {LEGAL_ENTITY.contactEmail}
          </a>
          . Para privacidad y derechos ARCO sobre tu cuenta de academia:{" "}
          <a href={`mailto:${LEGAL_ENTITY.privacyEmail}`} className="text-mf-brand hover:underline">
            {LEGAL_ENTITY.privacyEmail}
          </a>
          .
        </LegalParagraph>
      </LegalSection>

      <LegalSection title="Aviso simplificado">
        <div className="rounded-xl border border-mf-border bg-mf-surface p-5">
          <p className="text-sm leading-7 text-mf-text-secondary">{PRIVACY_NOTICE_SHORT}</p>
        </div>
        <LegalParagraph>
          Este aviso simplificado se muestra en formularios de registro. El presente
          documento es el aviso integral.
        </LegalParagraph>
      </LegalSection>

      <LegalSection title="Datos personales que tratamos">
        <LegalParagraph>
          <strong className="text-mf-text">Cuentas de academia (responsable MiFicha):</strong>
        </LegalParagraph>
        <LegalList
          items={[
            "Identificación: nombre del administrador, correo electrónico.",
            "Credenciales de acceso: contraseña (almacenada de forma cifrada por nuestro proveedor de autenticación).",
            "Datos operativos de la academia: nombre, ciudad, estado, logo, colores, enlaces a calendario de liga y configuración de visibilidad.",
            "Datos de facturación cuando contrates un plan de pago (procesados por Stripe).",
          ]}
        />
        <LegalParagraph>
          <strong className="text-mf-text">Jugadores (responsable la academia; MiFicha como encargado):</strong>
        </LegalParagraph>
        <LegalList
          items={[
            "Identificación deportiva: nombre, fecha de nacimiento, categoría/generación, posición, pie dominante, número.",
            "Desempeño: estadísticas de partidos verificados por la academia (goles, asistencias, minutos, etc.).",
            "Multimedia opcional: fotografía y video cargados por la academia.",
            "Contacto del tutor (opcional): correo o teléfono para reportes, solo si la academia lo captura.",
            "Passport Score y métricas derivadas del rendimiento registrado.",
          ]}
        />
        <LegalParagraph>
          No solicitamos datos personales sensibles en el sentido del artículo 3,
          fracción VI, de la LFPDPPP (origen racial, salud, creencias, etc.), salvo
          que la academia los incluya por error en campos libres; recomendamos no
          hacerlo.
        </LegalParagraph>
      </LegalSection>

      <LegalSection title="Finalidades del tratamiento">
        <LegalParagraph>
          <strong className="text-mf-text">Finalidades primarias (necesarias para el servicio):</strong>
        </LegalParagraph>
        <LegalList
          items={[
            "Crear, autenticar y administrar cuentas de academia.",
            "Almacenar planteles, partidos, estadísticas y generar fichas digitales.",
            "Permitir compartir fichas por link o QR y, si la academia lo autoriza, mostrar perfiles en el directorio público.",
            "Enviar reportes y comunicaciones operativas solicitadas por la academia (correo o WhatsApp).",
            "Cobrar suscripciones y cumplir obligaciones fiscales cuando aplique.",
            "Mantener la seguridad, integridad y disponibilidad de la plataforma.",
          ]}
        />
        <LegalParagraph>
          <strong className="text-mf-text">Finalidades secundarias (requieren consentimiento):</strong>
        </LegalParagraph>
        <LegalList
          items={[
            "Enviarte novedades, tips de producto o invitaciones a eventos de MiFicha.",
            "Elaborar estadísticas agregadas y anónimas para mejorar el servicio.",
          ]}
        />
        <LegalParagraph>
          Si no deseas finalidades secundarias, escríbenos a {LEGAL_ENTITY.privacyEmail};
          ello no afectará las finalidades primarias del servicio contratado.
        </LegalParagraph>
      </LegalSection>

      <LegalSection title="Fundamento y consentimiento">
        <LegalParagraph>
          El tratamiento de datos de cuentas de academia se basa en la relación
          contractual y en tu consentimiento al registrarte. El tratamiento de datos
          de jugadores menores requiere consentimiento del padre, madre o tutor legal;
          la academia es quien debe obtenerlo y documentarlo antes de activar fichas
          públicas o directorio. MiFicha bloquea técnicamente la publicación sin
          registro de ese consentimiento.
        </LegalParagraph>
      </LegalSection>

      <LegalSection title="Dos niveles de visibilidad">
        <LegalParagraph>
          <strong className="text-mf-text">Ficha por link o QR:</strong> accesible
          solo para quien tenga el enlace. No está pensada para indexación en
          buscadores; aplicamos metadatos acotados en perfiles de menores.
        </LegalParagraph>
        <LegalParagraph>
          <strong className="text-mf-text">Directorio y rankings (/explorar):</strong>{" "}
          requiere autorización adicional explícita de la academia y consentimiento
          parental registrado. Solo aparece si se activan ambas opciones en el panel
          del jugador.
        </LegalParagraph>
      </LegalSection>

      <LegalSection title="Transferencias y encargados">
        <LegalParagraph>
          Podemos compartir datos con proveedores que nos ayudan a operar el
          servicio, bajo contratos de confidencialidad y solo para las finalidades
          descritas:
        </LegalParagraph>
        <LegalList
          items={[
            "Supabase (base de datos, autenticación y almacenamiento) — servidores conforme a su política de privacidad.",
            "Vercel (hosting de la aplicación web).",
            "Stripe (pagos y facturación), cuando contrates un plan de pago.",
            "Resend u otro proveedor de correo transaccional, para reportes y notificaciones.",
            "Meta / WhatsApp Cloud API, solo si la academia configura envío de reportes por WhatsApp.",
          ]}
        />
        <LegalParagraph>
          No vendemos ni rentamos datos personales. Si realizamos transferencias
          internacionales, nos aseguramos de que existan las salvaguardas previstas
          en la LFPDPPP.
        </LegalParagraph>
      </LegalSection>

      <LegalSection title="Medidas de seguridad">
        <LegalList
          items={[
            "Fichas privadas por defecto al crear un jugador.",
            "Consentimiento parental obligatorio para cualquier ficha pública.",
            "Políticas de acceso (RLS) en base de datos por rol y visibilidad.",
            "Restricción de acceso a fotos y videos de jugadores no autorizados.",
            "Comunicación cifrada (HTTPS) y contraseñas gestionadas por proveedor especializado.",
            "Acceso al panel restringido a usuarios autenticados de la academia.",
          ]}
        />
      </LegalSection>

      <LegalSection title="Conservación">
        <LegalParagraph>
          Conservamos los datos mientras exista la relación con la academia o el
          jugador en la plataforma. Puedes solicitar eliminación de jugadores desde
          el panel; al cancelar la cuenta de academia, eliminaremos o anonimizaremos
          los datos conforme a plazos técnicos razonables y obligaciones legales
          aplicables.
        </LegalParagraph>
      </LegalSection>

      <LegalSection title="Derechos ARCO y revocación del consentimiento">
        <LegalParagraph>
          Tú, o en el caso de menores su padre, madre o tutor, pueden ejercer los
          derechos de Acceso, Rectificación, Cancelación y Oposición (ARCO), así
          como revocar el consentimiento otorgado.
        </LegalParagraph>
        <LegalList
          items={[
            `Datos de tu cuenta de academia: envía solicitud a ${LEGAL_ENTITY.privacyEmail} con nombre, correo registrado y descripción del derecho que deseas ejercer. Responderemos en un plazo máximo de 20 días hábiles.`,
            "Datos de un jugador: contacta primero a la academia registrada en MiFicha; la academia puede rectificar, desactivar la ficha o eliminar al jugador desde su panel. Si la academia no responde, escríbenos a privacidad@mificha.mx indicando el slug o link de la ficha.",
          ]}
        />
        <LegalParagraph>
          También puedes acudir al Instituto Nacional de Transparencia, Acceso a la
          Información y Protección de Datos Personales (INAI) si consideras que tu
          derecho no fue atendido.
        </LegalParagraph>
      </LegalSection>

      <LegalSection title="Cookies y tecnologías similares">
        <LegalParagraph>
          Utilizamos cookies técnicas necesarias para mantener tu sesión y la
          seguridad del sitio. Consulta el detalle en nuestra{" "}
          <Link href={LEGAL_ROUTES.cookies} className="text-mf-brand hover:underline">
            Política de cookies
          </Link>
          .
        </LegalParagraph>
      </LegalSection>

      <LegalSection title="Cambios al aviso">
        <LegalParagraph>
          Podemos actualizar este aviso para reflejar cambios legales o del
          servicio. Publicaremos la versión vigente en {LEGAL_ENTITY.domain}
          {LEGAL_ROUTES.privacy} e indicaremos la fecha de última actualización. Los
          cambios sustanciales se comunicarán por correo a cuentas registradas cuando
          sea razonablemente posible.
        </LegalParagraph>
      </LegalSection>

      <section className="mt-10 rounded-xl border border-mf-border bg-mf-surface p-5">
        <p className="text-sm font-medium text-mf-text">¿Eres academia en MiFicha?</p>
        <LegalParagraph>
          Activa fichas públicas solo con autorización documentada del tutor. Usa el
          directorio abierto únicamente cuando tenga sentido deportivo y legal para el
          jugador. Revisa también los{" "}
          <Link href={LEGAL_ROUTES.terms} className="text-mf-brand hover:underline">
            Términos y Condiciones
          </Link>
          .
        </LegalParagraph>
        <Link href="/dashboard/plantel" className="mf-btn-secondary mt-4 inline-flex">
          Ir a mi plantel
        </Link>
      </section>
    </LegalPageShell>
  );
}

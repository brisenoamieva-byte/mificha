import type { Metadata } from "next";
import Link from "next/link";
import {
  LegalList,
  LegalPageShell,
  LegalParagraph,
  LegalSection,
} from "@/components/marketing/legal-page-shell";
import { LEGAL_ENTITY, LEGAL_ROUTES } from "@/lib/legal";

export const metadata: Metadata = {
  title: "Política de cookies | MiFicha",
  description:
    "Uso de cookies y tecnologías similares en mificha.mx conforme a la LFPDPPP.",
  robots: { index: true, follow: true },
};

export default function CookiesPage() {
  return (
    <LegalPageShell
      kicker="Transparencia"
      title="Política de cookies"
      description={`En ${LEGAL_ENTITY.domain} utilizamos cookies y almacenamiento local únicamente para operar el sitio de forma segura. No usamos cookies de publicidad ni rastreo con fines comerciales de terceros.`}
    >
      <LegalSection title="¿Qué son las cookies?">
        <LegalParagraph>
          Las cookies son archivos pequeños que un sitio web guarda en tu navegador
          para recordar preferencias o mantener tu sesión. Algunas funciones de
          MiFicha dependen de ellas para funcionar correctamente.
        </LegalParagraph>
      </LegalSection>

      <LegalSection title="Cookies que utilizamos">
        <LegalParagraph>
          <strong className="text-mf-text">Cookies estrictamente necesarias</strong>{" "}
          (no requieren consentimiento adicional porque son imprescindibles para el
          servicio):
        </LegalParagraph>
        <LegalList
          items={[
            "Sesión de autenticación (Supabase Auth): mantienen tu inicio de sesión en el panel de academia.",
            "Cookies de seguridad: ayudan a prevenir accesos no autorizados y ataques CSRF en el flujo de login.",
          ]}
        />
        <LegalParagraph>
          <strong className="text-mf-text">Almacenamiento local (localStorage)</strong>:
        </LegalParagraph>
        <LegalList
          items={[
            "Preferencia de aviso de cookies: recordamos si ya leíste el banner informativo del sitio.",
          ]}
        />
        <LegalParagraph>
          Actualmente <strong className="text-mf-text">no utilizamos</strong> cookies
          de analítica (Google Analytics, Meta Pixel, etc.) ni cookies de publicidad.
          Si en el futuro las incorporamos, actualizaremos esta política y, cuando la
          ley lo exija, solicitaremos tu consentimiento previo.
        </LegalParagraph>
      </LegalSection>

      <LegalSection title="Cookies de terceros">
        <LegalParagraph>
          Al iniciar sesión o usar pagos, interactúas con servicios de terceros que
          pueden establecer sus propias cookies:
        </LegalParagraph>
        <LegalList
          items={[
            "Supabase — autenticación y base de datos.",
            "Stripe — checkout de suscripciones (solo en flujo de pago).",
          ]}
        />
        <LegalParagraph>
          Consulta las políticas de privacidad de esos proveedores para más detalle.
        </LegalParagraph>
      </LegalSection>

      <LegalSection title="Cómo gestionar o desactivar cookies">
        <LegalParagraph>
          Puedes configurar tu navegador para bloquear o eliminar cookies. Ten en
          cuenta que, si desactivas las cookies necesarias, no podrás iniciar sesión
          ni usar el panel de academia.
        </LegalParagraph>
        <LegalList
          items={[
            "Chrome: Configuración → Privacidad y seguridad → Cookies.",
            "Safari: Preferencias → Privacidad.",
            "Firefox: Opciones → Privacidad y seguridad.",
            "Edge: Configuración → Cookies y permisos del sitio.",
          ]}
        />
      </LegalSection>

      <LegalSection title="Relación con el aviso de privacidad">
        <LegalParagraph>
          El tratamiento de datos personales vinculado al uso del sitio se describe en
          nuestro{" "}
          <Link href={LEGAL_ROUTES.privacy} className="text-mf-brand hover:underline">
            Aviso de privacidad integral
          </Link>
          . Para ejercer derechos ARCO:{" "}
          <a href={`mailto:${LEGAL_ENTITY.privacyEmail}`} className="text-mf-brand hover:underline">
            {LEGAL_ENTITY.privacyEmail}
          </a>
          .
        </LegalParagraph>
      </LegalSection>
    </LegalPageShell>
  );
}

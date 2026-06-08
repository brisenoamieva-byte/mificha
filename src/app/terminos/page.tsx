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
  title: "Términos y Condiciones | MiFicha",
  description:
    "Condiciones de uso de la plataforma MiFicha para academias deportivas escolares.",
  robots: { index: true, follow: true },
};

export default function TerminosPage() {
  return (
    <LegalPageShell
      kicker="Condiciones de uso"
      title="Términos y Condiciones"
      description={`Al acceder o usar ${LEGAL_ENTITY.domain}, aceptas estos Términos y Condiciones. Si no estás de acuerdo, no utilices el servicio.`}
    >
      <LegalSection title="1. Partes y objeto">
        <LegalParagraph>
          Estos Términos regulan el uso de la plataforma MiFicha, operada por{" "}
          {LEGAL_ENTITY.operator} ({LEGAL_ENTITY.domain}), por personas físicas o
          morales que administran academias o programas deportivos escolares
          (&quot;Academia&quot; o &quot;Usuario&quot;).
        </LegalParagraph>
        <LegalParagraph>
          MiFicha es una herramienta digital para gestionar planteles, registrar
          estadísticas de partidos, generar fichas técnicas compartibles por link y, opcionalmente,
          publicar perfiles en un directorio de visorías. Complementa — no sustituye —
          los sistemas oficiales de ligas o federaciones.
        </LegalParagraph>
      </LegalSection>

      <LegalSection title="2. Registro y cuenta">
        <LegalList
          items={[
            "Debes ser mayor de edad y tener facultad para representar a la academia que registras.",
            "La información que proporciones debe ser veraz, exacta y actualizada.",
            "Eres responsable de mantener la confidencialidad de tus credenciales y de toda actividad en tu cuenta.",
            "Debes notificarnos de inmediato cualquier uso no autorizado en hola@mificha.mx.",
          ]}
        />
      </LegalSection>

      <LegalSection title="3. Obligaciones de la academia">
        <LegalParagraph>
          La Academia es la <strong className="text-mf-text">responsable</strong> del
          tratamiento de los datos personales de sus jugadores conforme a la LFPDPPP.
          MiFicha actúa como encargado del tratamiento respecto de esos datos.
        </LegalParagraph>
        <LegalList
          items={[
            "Obtener y documentar el consentimiento del padre, madre o tutor antes de activar fichas públicas o directorio, especialmente para menores de edad.",
            "Capturar solo datos necesarios para fines deportivos y de comunicación autorizados.",
            "No subir contenido difamatorio, violento, sexualizado, discriminatorio o que vulnere derechos de terceros.",
            "No usar MiFicha para acoso, contacto no solicitado con menores ni fines ajenos al deporte formativo.",
            "Verificar que las estadísticas registradas correspondan a partidos reales bajo tu responsabilidad.",
            "Informar a padres y tutores sobre el aviso de privacidad y sus derechos ARCO.",
          ]}
        />
      </LegalSection>

      <LegalSection title="4. Fichas públicas y directorio">
        <LegalParagraph>
          Las fichas son privadas por defecto. La activación de link compartible o aparición en
          /explorar requiere consentimiento registrado en la plataforma. MiFicha puede
          retirar perfiles que violen estos Términos, la ley o derechos de menores, sin
          previo aviso cuando exista riesgo inmediato.
        </LegalParagraph>
      </LegalSection>

      <LegalSection title="5. Propiedad intelectual">
        <LegalParagraph>
          MiFicha, su marca, diseño, software y documentación son propiedad de{" "}
          {LEGAL_ENTITY.operator} o sus licenciantes. La Academia conserva los
          derechos sobre el contenido que carga (fotos, videos, datos). Otorgas a
          MiFicha una licencia limitada para alojar, procesar y mostrar ese contenido
          únicamente para prestar el servicio según la configuración de privacidad que
          elijas.
        </LegalParagraph>
      </LegalSection>

      <LegalSection title="6. Planes, pagos y cancelación">
        <LegalParagraph>
          Algunas funciones pueden requerir suscripción de pago procesada por Stripe.
          Los precios y características se muestran al contratar. Puedes cancelar
          conforme a las opciones del panel o contactando a {LEGAL_ENTITY.contactEmail}.
          No hay reembolsos por periodos ya iniciados salvo que la ley aplicable lo
          exija.
        </LegalParagraph>
      </LegalSection>

      <LegalSection title="7. Disponibilidad y limitación de responsabilidad">
        <LegalParagraph>
          Procuramos alta disponibilidad pero no garantizamos operación ininterrumpida.
          El servicio se ofrece &quot;tal cual&quot;. MiFicha no es responsable de
          decisiones deportivas, reclutamiento, lesiones ni disputas entre academias,
          padres o terceros derivadas del uso de fichas o estadísticas.
        </LegalParagraph>
        <LegalParagraph>
          En la medida permitida por la ley mexicana, la responsabilidad total de
          MiFicha por daños directos derivados del servicio se limita al monto pagado
          por la Academia en los últimos doce meses, o cien dólares estadounidenses
          equivalentes en pesos mexicanos si no hubo pago.
        </LegalParagraph>
      </LegalSection>

      <LegalSection title="8. Suspensión y terminación">
        <LegalParagraph>
          Podemos suspender o terminar cuentas que incumplan estos Términos, la
          LFPDPPP o pongan en riesgo a menores o a la plataforma. La Academia puede
          dejar de usar el servicio en cualquier momento; conviene exportar o respaldar
          su información antes de solicitar eliminación de la cuenta.
        </LegalParagraph>
      </LegalSection>

      <LegalSection title="9. Privacidad">
        <LegalParagraph>
          El tratamiento de datos personales se rige por nuestro{" "}
          <Link href={LEGAL_ROUTES.privacy} className="text-mf-brand hover:underline">
            Aviso de privacidad integral
          </Link>{" "}
          y la{" "}
          <Link href={LEGAL_ROUTES.cookies} className="text-mf-brand hover:underline">
            Política de cookies
          </Link>
          , los cuales forman parte de estos Términos.
        </LegalParagraph>
      </LegalSection>

      <LegalSection title="10. Modificaciones">
        <LegalParagraph>
          Podemos actualizar estos Términos. La versión vigente estará publicada en{" "}
          {LEGAL_ENTITY.domain}
          {LEGAL_ROUTES.terms}. El uso continuado del servicio después de cambios
          relevantes implica aceptación, salvo que la ley exija consentimiento expreso.
        </LegalParagraph>
      </LegalSection>

      <LegalSection title="11. Ley aplicable y jurisdicción">
        <LegalParagraph>
          Estos Términos se rigen por las leyes de {LEGAL_ENTITY.jurisdiction}. Para
          cualquier controversia, las partes se someten a los tribunales competentes
          de Querétaro, Querétaro, renunciando a cualquier otro fuero que pudiera
          corresponderles por razón de domicilio presente o futuro.
        </LegalParagraph>
      </LegalSection>

      <LegalSection title="12. Contacto">
        <LegalParagraph>
          Dudas sobre estos Términos:{" "}
          <a href={`mailto:${LEGAL_ENTITY.contactEmail}`} className="text-mf-brand hover:underline">
            {LEGAL_ENTITY.contactEmail}
          </a>
        </LegalParagraph>
      </LegalSection>
    </LegalPageShell>
  );
}

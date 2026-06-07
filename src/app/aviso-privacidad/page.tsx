import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter, SiteHeader } from "@/components/marketing/site-header";

export const metadata: Metadata = {
  title: "Aviso de privacidad | MiFicha",
  description:
    "Tratamiento de datos personales y protección de menores en MiFicha.",
  robots: { index: true, follow: true },
};

export default function AvisoPrivacidadPage() {
  return (
    <div className="flex min-h-full flex-col bg-mf-canvas">
      <SiteHeader actionHref="/login" actionLabel="Iniciar sesión" />

      <main className="flex-1">
        <article className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
          <p className="mf-section-kicker">Protección de datos</p>
          <h1 className="mt-2 mf-page-title">Aviso de privacidad</h1>
          <p className="mt-4 text-sm leading-7 text-mf-text-secondary">
            MiFicha procesa datos de academias y jugadores menores de edad con
            fines deportivos, de comunicación con padres y, opcionalmente, de
            visibilidad controlada para visorías. Este aviso resume cómo
            protegemos esa información.
          </p>

          <section className="mt-10 space-y-4">
            <h2 className="mf-section-title">Responsable del tratamiento</h2>
            <p className="text-sm leading-7 text-mf-text-secondary">
              La academia registrada en MiFicha es responsable de obtener el
              consentimiento del padre, madre o tutor antes de activar fichas
              públicas. MiFicha provee la plataforma y controles técnicos para
              limitar la exposición de datos.
            </p>
          </section>

          <section className="mt-10 space-y-4">
            <h2 className="mf-section-title">Datos que se tratan</h2>
            <ul className="list-disc space-y-2 pl-5 text-sm leading-7 text-mf-text-secondary">
              <li>Identificación deportiva: nombre, categoría/edad, posición, pie dominante.</li>
              <li>Desempeño: estadísticas de partidos verificados por la academia.</li>
              <li>Multimedia opcional: foto y video cargados por la academia.</li>
              <li>Datos de contacto operativos de la academia (no de menores por defecto).</li>
            </ul>
          </section>

          <section className="mt-10 space-y-4">
            <h2 className="mf-section-title">Dos niveles de visibilidad</h2>
            <div className="space-y-3 text-sm leading-7 text-mf-text-secondary">
              <p>
                <strong className="text-mf-text">Ficha por link o QR:</strong>{" "}
                solo accesible para quien tenga el enlace. No está pensada para
                indexación en buscadores.
              </p>
              <p>
                <strong className="text-mf-text">Directorio y rankings:</strong>{" "}
                requiere autorización adicional. Solo aparece en /explorar,
                rankings e ideal 11 si la academia activa explícitamente esa
                opción y documenta consentimiento parental.
              </p>
            </div>
          </section>

          <section className="mt-10 space-y-4">
            <h2 className="mf-section-title">Medidas de seguridad</h2>
            <ul className="list-disc space-y-2 pl-5 text-sm leading-7 text-mf-text-secondary">
              <li>Fichas privadas por defecto al crear un jugador.</li>
              <li>Consentimiento parental obligatorio para cualquier ficha pública.</li>
              <li>Políticas de acceso (RLS) en base de datos por rol y visibilidad.</li>
              <li>Restricción de acceso a fotos/videos de jugadores no autorizados.</li>
              <li>Metadatos acotados en perfiles de menores (sin indexación orientada a SEO).</li>
            </ul>
          </section>

          <section className="mt-10 space-y-4">
            <h2 className="mf-section-title">Derechos ARCO</h2>
            <p className="text-sm leading-7 text-mf-text-secondary">
              Padres, madres o tutores pueden solicitar acceso, rectificación,
              cancelación u oposición contactando a la academia. La academia
              puede desactivar la ficha o eliminar al jugador desde su panel.
            </p>
          </section>

          <section className="mt-10 rounded-xl border border-mf-border bg-mf-surface p-5">
            <p className="text-sm font-medium text-mf-text">
              ¿Eres academia en MiFicha?
            </p>
            <p className="mt-2 text-sm leading-6 text-mf-text-secondary">
              Activa fichas públicas solo con autorización documentada del tutor.
              Usa el directorio abierto únicamente cuando tenga sentido deportivo
              y legal para el jugador.
            </p>
            <Link href="/dashboard/plantel" className="mf-btn-secondary mt-4 inline-flex">
              Ir a mi plantel
            </Link>
          </section>
        </article>
      </main>

      <SiteFooter />
    </div>
  );
}

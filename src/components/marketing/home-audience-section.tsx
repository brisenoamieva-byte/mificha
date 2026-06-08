import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { ArrowRight, Building2, QrCode, Search } from "lucide-react";
import { MarketingCardPhoto } from "@/components/marketing/marketing-hero-visual";
import { MARKETING_IMAGES } from "@/lib/marketing-assets";
import { cn } from "@/lib/utils";

interface AudienceItem {
  icon: LucideIcon;
  title: string;
  description: string;
  href: string;
  cta: string;
  imageSrc: string;
  imageAlt: string;
  secondaryHref?: string;
  secondaryLabel?: string;
  featured?: boolean;
}

const audiences: AudienceItem[] = [
  {
    icon: Building2,
    title: "Colegios y academias",
    description:
      "Plantel, partidos, reportes y QR imprimible. Todo el plantel escolar en un panel.",
    href: "/signup",
    secondaryHref: "/login",
    secondaryLabel: "Iniciar sesión",
    cta: "Crear cuenta",
    imageSrc: MARKETING_IMAGES.audienceAcademias,
    imageAlt: "Coordinador deportivo con plantel en cancha escolar",
    featured: true,
  },
  {
    icon: QrCode,
    title: "Padres",
    description:
      "Abre el link o QR que te comparte el colegio. Stats y Passport Score sin registro.",
    href: "/padres",
    cta: "Abrir ficha",
    imageSrc: MARKETING_IMAGES.audiencePadres,
    imageAlt: "Padre e hija saliendo de la cancha revisando el celular",
  },
  {
    icon: Search,
    title: "Torneos y visorías",
    description:
      "Directorio, marcador semanal, rankings por posición e 11 ideal verificado.",
    href: "/explorar",
    cta: "Explorar directorio",
    imageSrc: MARKETING_IMAGES.audienceScouts,
    imageAlt: "Torneo escolar de fin de semana en Querétaro",
  },
];

export function HomeAudienceSection() {
  return (
    <section id="accesos" className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-20">
      <div className="max-w-2xl">
        <p className="mf-marketing-eyebrow">Tres accesos, una plataforma</p>
        <h2 className="mt-3 text-2xl font-semibold tracking-[-0.02em] text-mf-text sm:text-3xl">
          Para colegios, padres y torneos
        </h2>
      </div>

      <div className="mt-10 grid gap-5 lg:grid-cols-3">
        {audiences.map((item) => (
          <article
            key={item.title}
            className={cn(
              "group flex flex-col overflow-hidden rounded-xl border bg-mf-surface transition",
              item.featured
                ? "border-mf-brand/25 shadow-[0_0_0_1px_rgba(27,79,140,0.08)]"
                : "border-mf-border hover:border-mf-brand/20",
            )}
          >
            <MarketingCardPhoto src={item.imageSrc} alt={item.imageAlt} />
            <div className="flex flex-1 flex-col px-6 pb-6">
              <div
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-lg",
                  item.featured
                    ? "bg-mf-brand text-white"
                    : "bg-mf-brand-soft text-mf-brand",
                )}
              >
                <item.icon className="h-5 w-5" strokeWidth={1.75} />
              </div>
              <h3 className="mt-4 text-lg font-semibold tracking-[-0.01em] text-mf-text">
                {item.title}
              </h3>
              <p className="mt-2 flex-1 text-sm leading-7 text-mf-text-secondary">
                {item.description}
              </p>
              <div className="mt-6 flex flex-wrap items-center gap-3">
                <Link
                  href={item.href}
                  className={cn(
                    "inline-flex items-center gap-1.5 text-sm font-semibold transition",
                    item.featured
                      ? "text-mf-brand hover:text-mf-brand-dark"
                      : "text-mf-text hover:text-mf-brand",
                  )}
                >
                  {item.cta}
                  <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
                </Link>
                {item.secondaryHref ? (
                  <Link
                    href={item.secondaryHref}
                    className="text-sm font-medium text-mf-text-muted hover:text-mf-text"
                  >
                    {item.secondaryLabel}
                  </Link>
                ) : null}
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

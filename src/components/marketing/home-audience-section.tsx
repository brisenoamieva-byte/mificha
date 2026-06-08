import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { ArrowRight, Building2, MessageCircle, Search } from "lucide-react";
import { MarketingCardPhoto } from "@/components/marketing/marketing-hero-visual";
import type { MarketingImageKey } from "@/lib/marketing-assets";
import { MARKETING_MEDIA } from "@/lib/marketing-assets";
import { cn } from "@/lib/utils";

interface AudienceItem {
  icon: LucideIcon;
  title: string;
  description: string;
  href: string;
  cta: string;
  imageKey: MarketingImageKey;
  iconTone?: "brand" | "accent";
  secondaryHref?: string;
  secondaryLabel?: string;
  featured?: boolean;
}

const audiences: AudienceItem[] = [
  {
    icon: Building2,
    title: "Colegios y academias",
    description:
      "Plantel, captura de minutos, acta oficial y avisos automáticos a tutores. Todo el plantel en un panel.",
    href: "/signup",
    secondaryHref: "/login",
    secondaryLabel: "Iniciar sesión",
    cta: "Crear cuenta",
    imageKey: "audienceAcademias",
    iconTone: "brand",
    featured: true,
  },
  {
    icon: MessageCircle,
    title: "Padres",
    description:
      "Recibe el link por email o WhatsApp tras cada partido. Stats y Passport Score sin registro.",
    href: "/padres",
    cta: "Abrir ficha",
    imageKey: "audiencePadres",
    iconTone: "accent",
  },
  {
    icon: Search,
    title: "Torneos y visorías",
    description:
      "Directorio, destacados semanales y referencia por posición — siempre por categoría.",
    href: "/explorar",
    cta: "Explorar directorio",
    imageKey: "audienceScouts",
    iconTone: "accent",
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
                : item.iconTone === "accent"
                  ? "border-mf-border hover:border-mf-accent/35 hover:shadow-[0_0_0_1px_rgba(52,211,153,0.12)]"
                  : "border-mf-border hover:border-mf-brand/20",
            )}
          >
            <MarketingCardPhoto meta={MARKETING_MEDIA[item.imageKey]} />
            <div className="flex flex-1 flex-col px-6 pb-6 pt-6">
              <div
                className={cn(
                  item.featured || item.iconTone === "brand"
                    ? "mf-icon-brand"
                    : "mf-icon-accent",
                  item.featured && "bg-mf-brand text-white",
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
                      : item.iconTone === "accent"
                        ? "text-mf-accent-dark hover:text-[#047857]"
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

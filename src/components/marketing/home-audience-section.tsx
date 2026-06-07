import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { ArrowRight, Building2, QrCode, Search } from "lucide-react";
import { cn } from "@/lib/utils";

interface AudienceItem {
  icon: LucideIcon;
  title: string;
  description: string;
  href: string;
  cta: string;
  secondaryHref?: string;
  secondaryLabel?: string;
  featured?: boolean;
}

const audiences: AudienceItem[] = [
  {
    icon: Building2,
    title: "Academias",
    description:
      "Plantel, partidos, reportes comparativos y QR imprimible. Operación centralizada en un solo panel.",
    href: "/signup",
    secondaryHref: "/login",
    secondaryLabel: "Iniciar sesión",
    cta: "Crear cuenta",
    featured: true,
  },
  {
    icon: QrCode,
    title: "Padres",
    description:
      "Escanea el QR en la cancha o abre el link. Stats y Passport Score sin registro ni contraseña.",
    href: "/padres",
    cta: "Abrir ficha",
  },
  {
    icon: Search,
    title: "Scouts y visorías",
    description:
      "Directorio público, marcador semanal, rankings por posición e 11 ideal verificado.",
    href: "/explorar",
    cta: "Explorar directorio",
  },
];

export function HomeAudienceSection() {
  return (
    <section id="accesos" className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-20">
      <div className="max-w-2xl">
        <p className="mf-marketing-eyebrow">Tres accesos, una plataforma</p>
        <h2 className="mt-3 text-2xl font-semibold tracking-[-0.02em] text-mf-text sm:text-3xl">
          Diseñado para cada actor del ecosistema
        </h2>
      </div>

      <div className="mt-10 grid gap-5 lg:grid-cols-3">
        {audiences.map((item) => (
          <article
            key={item.title}
            className={cn(
              "group flex flex-col rounded-xl border bg-mf-surface p-6 transition",
              item.featured
                ? "border-mf-brand/25 shadow-[0_0_0_1px_rgba(27,79,140,0.08)]"
                : "border-mf-border hover:border-mf-brand/20",
            )}
          >
            <div
              className={cn(
                "flex h-11 w-11 items-center justify-center rounded-lg",
                item.featured
                  ? "bg-mf-brand text-white"
                  : "bg-mf-brand-soft text-mf-brand",
              )}
            >
              <item.icon className="h-5 w-5" strokeWidth={1.75} />
            </div>
            <h3 className="mt-5 text-lg font-semibold tracking-[-0.01em] text-mf-text">
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
          </article>
        ))}
      </div>
    </section>
  );
}

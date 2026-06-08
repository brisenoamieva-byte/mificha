import Link from "next/link";
import type { ReactNode } from "react";
import { SiteFooter, SiteHeader } from "@/components/marketing/site-header";
import { LEGAL_ENTITY, LEGAL_ROUTES } from "@/lib/legal";

interface LegalPageShellProps {
  kicker: string;
  title: string;
  description: string;
  children: ReactNode;
}

export function LegalPageShell({
  kicker,
  title,
  description,
  children,
}: LegalPageShellProps) {
  return (
    <div className="flex min-h-full flex-col bg-mf-canvas">
      <SiteHeader actionHref="/login" actionLabel="Iniciar sesión" />

      <main className="flex-1">
        <article className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
          <p className="mf-marketing-eyebrow">{kicker}</p>
          <h1 className="mt-2 mf-page-title">{title}</h1>
          <p className="mt-4 text-sm leading-7 text-mf-text-secondary">{description}</p>
          <p className="mt-2 text-xs text-mf-text-muted">
            Última actualización: {LEGAL_ENTITY.lastUpdated}
          </p>

          <nav
            aria-label="Documentos legales relacionados"
            className="mt-8 flex flex-wrap gap-x-4 gap-y-2 text-sm"
          >
            <Link href={LEGAL_ROUTES.privacy} className="font-medium text-mf-brand hover:underline">
              Aviso de privacidad
            </Link>
            <Link href={LEGAL_ROUTES.terms} className="font-medium text-mf-brand hover:underline">
              Términos y condiciones
            </Link>
            <Link href={LEGAL_ROUTES.cookies} className="font-medium text-mf-brand hover:underline">
              Política de cookies
            </Link>
          </nav>

          <div className="mf-legal-prose mt-10">{children}</div>
        </article>
      </main>

      <SiteFooter />
    </div>
  );
}

export function LegalSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="mt-10 space-y-4 first:mt-0">
      <h2 className="mf-section-title">{title}</h2>
      {children}
    </section>
  );
}

export function LegalParagraph({ children }: { children: ReactNode }) {
  return <p className="text-sm leading-7 text-mf-text-secondary">{children}</p>;
}

export function LegalList({ items }: { items: string[] }) {
  return (
    <ul className="list-disc space-y-2 pl-5 text-sm leading-7 text-mf-text-secondary">
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}

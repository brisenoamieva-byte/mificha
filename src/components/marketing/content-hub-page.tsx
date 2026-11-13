import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { HubItem } from "@/lib/content-hubs";
import { SiteFooter, SiteHeader } from "@/components/marketing/site-header";

export function ContentHubPage({
  title,
  summary,
  items,
  empty,
}: {
  title: string;
  summary: string;
  items: readonly HubItem[];
  empty?: string;
}) {
  return (
    <div className="flex min-h-dvh flex-col bg-mf-canvas">
      <SiteHeader />
      <main className="flex-1">
        <section className="border-b border-mf-border bg-white">
          <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-mf-gph">
              MiFicha
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-mf-gph-ink sm:text-4xl">
              {title}
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-mf-text-secondary sm:text-base">
              {summary}
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-12">
          {items.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-mf-border bg-white px-6 py-12 text-center">
              <p className="text-sm leading-7 text-mf-text-secondary">
                {empty || "No hay elementos publicados."}
              </p>
            </div>
          ) : (
            <ul className="grid gap-3">
              {items.map((item) => (
                <li
                  key={item.id}
                  id={item.id}
                  className="scroll-mt-24 rounded-2xl border border-mf-border bg-white px-5 py-5 sm:px-6"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                      {item.meta ? (
                        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-mf-text-muted">
                          {item.meta}
                        </p>
                      ) : null}
                      <h2 className="mt-1 text-lg font-semibold text-mf-gph-ink">{item.title}</h2>
                      <p className="mt-1 max-w-2xl text-sm leading-6 text-mf-text-secondary">
                        {item.detail}
                      </p>
                      {item.soon ? (
                        <p className="mt-2 text-xs font-semibold text-mf-text-muted">
                          Próximamente
                        </p>
                      ) : null}
                    </div>
                    {!item.soon ? (
                      item.href.startsWith("http") ? (
                        <a
                          href={item.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mf-btn-gph shrink-0 self-start"
                        >
                          {item.cta || "Ver"}
                          <ArrowRight className="h-4 w-4" />
                        </a>
                      ) : (
                        <Link href={item.href} className="mf-btn-gph shrink-0 self-start">
                          {item.cta || "Ver"}
                          <ArrowRight className="h-4 w-4" />
                        </Link>
                      )
                    ) : null}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter, SiteHeader } from "@/components/marketing/site-header";
import { diagnosisWhatsAppHref } from "@/lib/gph-alliance";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { getFamilyOrderByFolio, markFamilyOrderPaid } from "@/lib/family-orders";

export const metadata: Metadata = {
  title: "Resultado del pago | MiFicha",
};

export default async function PagoRetornoPage({
  searchParams,
}: {
  searchParams: Promise<{
    status?: string;
    folio?: string;
    payment_id?: string;
    collection_status?: string;
  }>;
}) {
  const params = await searchParams;
  const folio = params.folio?.trim() ?? "";
  const collection = params.collection_status || params.status || "";
  let status = collection === "approved" || collection === "success" ? "paid" : collection;
  let membershipUntil: string | null = null;

  if (folio) {
    try {
      const admin = createSupabaseAdminClient();
      if ((collection === "approved" || collection === "success") && params.payment_id) {
        await markFamilyOrderPaid(admin, folio, params.payment_id);
      }
      const order = await getFamilyOrderByFolio(admin, folio);
      if (order) {
        status = order.status;
        membershipUntil = order.membership_until;
      }
    } catch {
      /* show URL status */
    }
  }

  const paid = status === "paid" || status === "approved" || status === "success";
  const pending = status === "pending" || status === "in_process";

  return (
    <div className="flex min-h-dvh flex-col bg-mf-canvas">
      <SiteHeader />
      <main className="flex-1">
        <section className="mx-auto max-w-lg px-4 py-16 sm:px-6">
          <div className="overflow-hidden rounded-xl border border-mf-border bg-white">
            <div className="h-1 bg-mf-gph" aria-hidden />
            <div className="px-6 py-8">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-mf-gph">
                {paid ? "Pago recibido" : pending ? "Pago en proceso" : "Pago no completado"}
              </p>
              <h1 className="mt-2 text-2xl font-semibold tracking-tight text-mf-gph-ink">
                {paid
                  ? "Listo. Ya quedó tu año en MiFicha."
                  : pending
                    ? "Mercado Pago sigue confirmando."
                    : "No se cerró el cobro."}
              </h1>
              {folio ? (
                <p className="mt-3 font-mono text-sm text-mf-text-secondary">Folio {folio}</p>
              ) : null}
              {paid && membershipUntil ? (
                <p className="mt-3 text-sm leading-6 text-mf-text-secondary">
                  Acceso hasta {membershipUntil}. Si contrataste evaluación, Gustavo coordina la
                  sesión por WhatsApp.
                </p>
              ) : null}
              {!paid && !pending ? (
                <p className="mt-3 text-sm leading-6 text-mf-text-secondary">
                  Puedes intentar de nuevo o escribirnos. No se hizo ningún cargo si cancelaste.
                </p>
              ) : null}
              <div className="mt-6 flex flex-wrap gap-3">
                {paid ? (
                  <a
                    href={diagnosisWhatsAppHref()}
                    className="mf-btn-gph"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Avisar a GPH
                  </a>
                ) : (
                  <Link href="/fut/pagar" className="mf-btn-gph">
                    Volver a pagar
                  </Link>
                )}
                <Link href="/fut/membresia" className="mf-btn-gph-ghost">
                  Ver membresía
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter, SiteHeader } from "@/components/marketing/site-header";
import {
  diagnosisBookingCtaLabel,
  diagnosisBookingHref,
  diagnosisBookingIsCalendar,
  diagnosisWhatsAppHref,
} from "@/lib/gph-alliance";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import {
  getAcademyOrderByFolio,
  markAcademyOrderPaid,
} from "@/lib/academy-membership";
import { getFamilyOrderByFolio, markFamilyOrderPaid } from "@/lib/family-orders";
import {
  getPersonaOrderByFolio,
  markPersonaOrderPaid,
} from "@/lib/persona-membership";

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
  const isPersona = folio.startsWith("PE-");
  const isAcademy = folio.startsWith("AC-");

  if (folio) {
    try {
      const admin = createSupabaseAdminClient();
      if ((collection === "approved" || collection === "success") && params.payment_id) {
        if (isPersona) {
          await markPersonaOrderPaid(admin, folio, params.payment_id);
        } else if (isAcademy) {
          await markAcademyOrderPaid(admin, folio, params.payment_id);
        } else {
          await markFamilyOrderPaid(admin, folio, params.payment_id);
        }
      }
      if (isPersona) {
        const order = await getPersonaOrderByFolio(admin, folio);
        if (order) {
          status = order.status;
          membershipUntil = order.membership_until;
        }
      } else if (isAcademy) {
        const order = await getAcademyOrderByFolio(admin, folio);
        if (order) {
          status = order.status;
          membershipUntil = order.membership_until;
        }
      } else {
        const order = await getFamilyOrderByFolio(admin, folio);
        if (order) {
          status = order.status;
          membershipUntil = order.membership_until;
        }
      }
    } catch {
      /* show URL status */
    }
  }

  const paid = status === "paid" || status === "approved" || status === "success";
  const pending = status === "pending" || status === "in_process";

  const paidTitle = isPersona
    ? "Listo. Membresía persona activa."
    : isAcademy
      ? "Listo. Membresía academia activa."
      : "Listo. Ya quedó tu año en MiFicha.";

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
                  ? paidTitle
                  : pending
                    ? "Mercado Pago sigue confirmando."
                    : "No se cerró el cobro."}
              </h1>
              {folio ? (
                <p className="mt-3 font-mono text-sm text-mf-text-secondary">Folio {folio}</p>
              ) : null}
              {paid && membershipUntil ? (
                <p className="mt-3 text-sm leading-6 text-mf-text-secondary">
                  Acceso hasta {membershipUntil}
                  {isPersona
                    ? ". Ya puedes ver fichas completas en Explorar."
                    : isAcademy
                      ? ". Ya puedes operar plantel y partidos en el panel."
                      : diagnosisBookingIsCalendar()
                      ? ". Si contrataste evaluación, elige horario en el calendario GPH (Querétaro)."
                      : ". Si contrataste evaluación, el equipo GPH coordina la sesión por WhatsApp."}
                </p>
              ) : null}
              {!paid && !pending ? (
                <p className="mt-3 text-sm leading-6 text-mf-text-secondary">
                  Puedes intentar de nuevo o escribirnos. No se hizo ningún cargo si cancelaste.
                </p>
              ) : null}
              <div className="mt-6 flex flex-wrap gap-3">
                {paid ? (
                  isPersona ? (
                    <>
                      <Link href="/fut/explorar" className="mf-btn-gph">
                        Ir a Explorar
                      </Link>
                      <Link href="/fut/tutor" className="mf-btn-gph-ghost">
                        Mis fichas
                      </Link>
                    </>
                  ) : isAcademy ? (
                    <Link href="/fut/dashboard" className="mf-btn-gph">
                      Ir al panel academia
                    </Link>
                  ) : (
                    <>
                      <a
                        href={diagnosisBookingHref()}
                        className="mf-btn-gph"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {diagnosisBookingCtaLabel("Avisar a GPH")}
                      </a>
                      {diagnosisBookingIsCalendar() ? (
                        <a
                          href={diagnosisWhatsAppHref()}
                          className="mf-btn-gph-ghost"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          WhatsApp GPH
                        </a>
                      ) : null}
                      <Link href="/fut/tutor" className="mf-btn-gph-ghost">
                        Ir a mi cuenta de tutor
                      </Link>
                    </>
                  )
                ) : pending ? (
                  <Link
                    href={
                      isPersona
                        ? "/fut/explorar"
                        : isAcademy
                          ? "/fut/dashboard"
                          : "/fut/tutor"
                    }
                    className="mf-btn-gph-ghost"
                  >
                    {isPersona
                      ? "Ir a Explorar"
                      : isAcademy
                        ? "Ir al panel"
                        : "Ir a tutor"}
                  </Link>
                ) : (
                  <>
                    {isPersona ? (
                      <Link href="/fut/explorar#pro" className="mf-btn-gph">
                        Reintentar membresía
                      </Link>
                    ) : isAcademy ? (
                      <Link href="/fut/dashboard" className="mf-btn-gph">
                        Reintentar membresía
                      </Link>
                    ) : (
                      <>
                        <a
                          href={diagnosisWhatsAppHref()}
                          className="mf-btn-gph"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Coordinar por WhatsApp
                        </a>
                        <Link href="/fut/pagar?sku=diagnosis" className="mf-btn-gph-ghost">
                          Reintentar pago
                        </Link>
                      </>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}

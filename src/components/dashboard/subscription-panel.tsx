"use client";

import Link from "next/link";
import { CreditCard, ExternalLink, Sparkles } from "lucide-react";
import { useState } from "react";
import { useDashboard } from "@/components/dashboard/dashboard-context";
import { toast } from "@/components/ui/toast";
import { isSubscriptionActive } from "@/lib/dashboard-utils";
import {
  ACADEMY_MEMBERSHIP_FREE_PROMO,
  ACADEMY_PRODUCT,
  academyMembershipPublicCopy,
} from "@/lib/academy-membership";
import { ACADEMY_COMMERCIAL } from "@/lib/academy-role";
import { ACADEMY_ACCESS, isAcademyBillingEnabled } from "@/lib/pricing";
import { cn } from "@/lib/utils";

function AcademyFreePanel() {
  const copy = academyMembershipPublicCopy();
  return (
    <section className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-6 shadow-sm">
      <div className="flex items-start gap-3">
        <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-emerald-700" />
        <div>
          <h2 className="text-lg font-semibold text-slate-900">
            {ACADEMY_ACCESS.headline}
          </h2>
          <p className="mt-2 text-sm leading-7 text-slate-700">
            {ACADEMY_ACCESS.summary}
          </p>
          <ul className="mt-4 space-y-2 text-sm leading-6 text-slate-700">
            {ACADEMY_ACCESS.features.map((item) => (
              <li key={item}>· {item}</li>
            ))}
          </ul>
          {ACADEMY_MEMBERSHIP_FREE_PROMO ? (
            <p className="mt-3 text-xs font-medium text-emerald-800">{copy.priceLine}</p>
          ) : null}
          <p className="mt-2 text-xs leading-5 text-emerald-900/80">
            {ACADEMY_COMMERCIAL.futurePriceHint}
          </p>
          <Link
            href="/fut/organizadores"
            className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-[#1B4F8C] hover:underline"
          >
            ¿Organizas torneo? Ver precios para temporadas
            <ExternalLink className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </section>
  );
}

export function SubscriptionPanel() {
  const { academy } = useDashboard();
  const [loading, setLoading] = useState(false);

  if (!academy) return null;

  if (academy.billing_exempt) {
    return (
      <section className="rounded-xl border border-orange-200 bg-orange-50/70 p-6 shadow-sm">
        <div className="flex items-start gap-3">
          <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-[#f54200]" />
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Socio GPH · sin costo</h2>
            <p className="mt-2 text-sm leading-7 text-slate-700">
              Plantel, partidos, MF y avisos sin cuota. Las evaluaciones GPH a familias
              se cotizan aparte; no son requisito del plantel.
            </p>
          </div>
        </div>
      </section>
    );
  }

  if (ACADEMY_MEMBERSHIP_FREE_PROMO || !isAcademyBillingEnabled()) {
    return <AcademyFreePanel />;
  }

  const academyId = academy.id;
  const active = isSubscriptionActive(academy.plan_status);

  async function handleCheckout() {
    setLoading(true);
    try {
      const response = await fetch("/fut/api/pay/academy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ academy_id: academyId }),
      });
      const result = (await response.json()) as {
        url?: string;
        checkoutUrl?: string;
        error?: string;
        ok?: boolean;
        alreadyActive?: boolean;
      };

      if (result.checkoutUrl) {
        globalThis.location.assign(result.checkoutUrl);
        return;
      }

      if (result.alreadyActive || result.ok) {
        toast.success("Acceso academia activo.");
        globalThis.location.reload();
        return;
      }

      toast.error(result.error ?? "No se pudo iniciar el pago.");
    } catch {
      toast.error("Error de red al iniciar el pago.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-[#1B4F8C]" />
            <h2 className="text-lg font-semibold text-slate-900">
              {ACADEMY_PRODUCT.title}
            </h2>
          </div>
          <p className="mt-2 text-sm text-slate-600">
            {ACADEMY_PRODUCT.priceLabel} {ACADEMY_PRODUCT.currency}{" "}
            {ACADEMY_PRODUCT.period}. Plantel, partidos y avisos a tutores.
          </p>
          <span
            className={cn(
              "mt-3 inline-flex rounded-full px-3 py-1 text-xs font-semibold",
              active ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-600",
            )}
          >
            {active ? "Activa" : "Pendiente de pago"}
          </span>
        </div>

        {!active ? (
          <button
            type="button"
            onClick={() => void handleCheckout()}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#1B4F8C] px-4 py-3 text-sm font-semibold text-white hover:bg-[#164278] disabled:opacity-60"
          >
            {loading
              ? "Redirigiendo…"
              : `Contratar · ${ACADEMY_PRODUCT.priceLabel} USD/año`}
          </button>
        ) : null}
      </div>
    </section>
  );
}

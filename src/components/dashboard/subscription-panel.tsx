"use client";

import { CreditCard, ExternalLink } from "lucide-react";
import { useState } from "react";
import { useDashboard } from "@/components/dashboard/dashboard-context";
import { toast } from "@/components/ui/toast";
import { isSubscriptionActive } from "@/lib/dashboard-utils";
import { supabase } from "@/lib/supabase";
import {
  getPlanStatusLabel,
  PLAN_CONFIG,
  type SubscriptionPlan,
} from "@/lib/stripe";
import { cn } from "@/lib/utils";

export function SubscriptionPanel() {
  const { academy } = useDashboard();
  const [loadingPlan, setLoadingPlan] = useState<SubscriptionPlan | null>(null);
  const [loadingPortal, setLoadingPortal] = useState(false);

  if (!academy) return null;

  const academyId = academy.id;
  const active = isSubscriptionActive(academy.plan_status);

  async function getAccessToken() {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    return session?.access_token ?? null;
  }

  async function handleCheckout(plan: SubscriptionPlan) {
    setLoadingPlan(plan);

    try {
      const accessToken = await getAccessToken();
      if (!accessToken) {
        toast.error("Tu sesión expiró. Vuelve a iniciar sesión.");
        return;
      }

      const response = await fetch("/api/stripe/create-checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          plan,
          academy_id: academyId,
        }),
      });

      const result = (await response.json()) as { url?: string; error?: string };

      if (!response.ok || !result.url) {
        toast.error(result.error ?? "No se pudo iniciar el pago.");
        return;
      }

      globalThis.location.assign(result.url);
    } catch {
      toast.error("Error de red al iniciar el pago.");
    } finally {
      setLoadingPlan(null);
    }
  }

  async function handleManagePayment() {
    setLoadingPortal(true);

    try {
      const accessToken = await getAccessToken();
      if (!accessToken) {
        toast.error("Tu sesión expiró. Vuelve a iniciar sesión.");
        return;
      }

      const response = await fetch("/api/stripe/create-portal", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ academy_id: academyId }),
      });

      const result = (await response.json()) as { url?: string; error?: string };

      if (!response.ok || !result.url) {
        toast.error(result.error ?? "No se pudo abrir el portal de pagos.");
        return;
      }

      globalThis.location.assign(result.url);
    } catch {
      toast.error("Error de red al abrir el portal de pagos.");
    } finally {
      setLoadingPortal(false);
    }
  }

  return (
    <>
      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-[#1B4F8C]" />
              <h2 className="text-lg font-semibold text-slate-900">Suscripción</h2>
            </div>
            <p className="mt-2 text-sm text-slate-600">
              Plan actual:{" "}
              <span className="font-semibold text-slate-900">
                {getPlanStatusLabel(academy.plan_status)}
              </span>
            </p>
            <span
              className={cn(
                "mt-3 inline-flex rounded-full px-3 py-1 text-xs font-semibold",
                active
                  ? "bg-green-100 text-green-700"
                  : "bg-slate-100 text-slate-600",
              )}
            >
              {active ? "Activa" : "Inactiva"}
            </span>
          </div>

          {academy.stripe_customer_id ? (
            <button
              type="button"
              onClick={handleManagePayment}
              disabled={loadingPortal}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
            >
              <ExternalLink className="h-4 w-4" />
              {loadingPortal ? "Abriendo..." : "Gestionar pago"}
            </button>
          ) : null}
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {(Object.keys(PLAN_CONFIG) as SubscriptionPlan[]).map((plan) => {
            const config = PLAN_CONFIG[plan];
            const isCurrent = academy.plan_status === plan;

            return (
              <div
                key={plan}
                className={cn(
                  "rounded-2xl border p-5",
                  isCurrent
                    ? "border-[#1B4F8C] bg-[#1B4F8C]/5"
                    : "border-slate-200 bg-slate-50",
                )}
              >
                <p className="text-sm font-bold uppercase tracking-wide text-[#1B4F8C]">
                  {config.label}
                </p>
                <p className="mt-2 text-2xl font-black text-slate-900">
                  {config.priceLabel}
                </p>
                <button
                  type="button"
                  disabled={loadingPlan !== null || isCurrent}
                  onClick={() => handleCheckout(plan)}
                  className="mt-4 w-full rounded-xl bg-[#1B4F8C] px-4 py-3 text-sm font-semibold text-white hover:bg-[#164278] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loadingPlan === plan
                    ? "Redirigiendo..."
                    : isCurrent
                      ? "Plan actual"
                      : `Elegir ${config.label}`}
                </button>
              </div>
            );
          })}
        </div>
      </section>

    </>
  );
}

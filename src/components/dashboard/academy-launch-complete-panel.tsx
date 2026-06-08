import Link from "next/link";
import { CheckCircle2, ExternalLink, Eye, MessageCircle, Printer } from "lucide-react";
import {
  PARENT_ENGAGEMENT_GOAL,
  type AcademyProfileViewStats,
} from "@/lib/profile-view-tracking";

interface AcademyLaunchCompletePanelProps {
  academySlug: string;
  viewStats: AcademyProfileViewStats;
}

export function AcademyLaunchCompletePanel({
  academySlug,
  viewStats,
}: AcademyLaunchCompletePanelProps) {
  const engagementReady = viewStats.unique_visitors >= PARENT_ENGAGEMENT_GOAL;

  return (
    <section className="overflow-hidden rounded-xl border border-emerald-200 bg-emerald-50/60">
      <div className="border-b border-emerald-100 px-5 py-4">
        <div className="flex items-center gap-2 text-sm font-semibold text-emerald-800">
          <CheckCircle2 className="h-4 w-4" />
          MiFicha activo en tu academia
        </div>
        <h2 className="mt-2 text-lg font-semibold text-slate-900">
          MiFicha activo — rutina de sábado
        </h2>
        <p className="mt-1 text-sm text-slate-600">
          Convocados + captura rápida (~2 min) + WhatsApp al padre. El resto es
          opcional cuando quieras visorías o calendario público.
        </p>
      </div>

      <div className="border-b border-emerald-100 px-5 py-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
            <Eye className="h-4 w-4 text-[#1B4F8C]" />
            Engagement de padres
          </div>
          {engagementReady ? (
            <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800">
              Meta del piloto alcanzada
            </span>
          ) : (
            <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">
              Faltan {Math.max(PARENT_ENGAGEMENT_GOAL - viewStats.unique_visitors, 0)} visitas
            </span>
          )}
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <div className="rounded-lg border border-emerald-100 bg-white px-4 py-3">
            <p className="text-2xl font-bold text-slate-900">{viewStats.unique_visitors}</p>
            <p className="mt-1 text-xs font-medium uppercase tracking-wide text-slate-500">
              Visitas únicas
            </p>
          </div>
          <div className="rounded-lg border border-emerald-100 bg-white px-4 py-3">
            <p className="text-2xl font-bold text-slate-900">{viewStats.total_views}</p>
            <p className="mt-1 text-xs font-medium uppercase tracking-wide text-slate-500">
              Aperturas totales
            </p>
          </div>
          <div className="rounded-lg border border-emerald-100 bg-white px-4 py-3">
            <p className="text-2xl font-bold text-slate-900">{viewStats.views_last_7_days}</p>
            <p className="mt-1 text-xs font-medium uppercase tracking-wide text-slate-500">
              Últimos 7 días
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-3 px-5 py-4 sm:grid-cols-3">
        <Link
          href="/dashboard/plantel/imprimir"
          className="flex items-center gap-3 rounded-lg border border-emerald-100 bg-white px-4 py-3 text-sm font-semibold text-slate-800 transition hover:border-emerald-200"
        >
          <Printer className="h-4 w-4 text-emerald-700" />
          QR imprimibles
        </Link>
        <Link
          href="/dashboard/plantel"
          className="flex items-center gap-3 rounded-lg border border-emerald-100 bg-white px-4 py-3 text-sm font-semibold text-slate-800 transition hover:border-emerald-200"
        >
          <MessageCircle className="h-4 w-4 text-green-700" />
          WhatsApp desde plantel
        </Link>
        <Link
          href={`/a/${academySlug}`}
          target="_blank"
          className="flex items-center gap-3 rounded-lg border border-emerald-100 bg-white px-4 py-3 text-sm font-semibold text-slate-800 transition hover:border-emerald-200"
        >
          <ExternalLink className="h-4 w-4 text-[#1B4F8C]" />
          Ver landing pública
        </Link>
      </div>
    </section>
  );
}

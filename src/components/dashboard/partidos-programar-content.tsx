"use client";

import Link from "next/link";
import { CalendarDays, Mail } from "lucide-react";
import { useDashboard } from "@/components/dashboard/dashboard-context";
import { LeagueOfficialBanner } from "@/components/dashboard/league-official-banner";
import { NoAcademyState } from "@/components/dashboard/no-academy-state";

export function PartidosProgramarContent() {
  const { academy } = useDashboard();

  if (!academy) return <NoAcademyState />;

  return (
    <div className="mx-auto max-w-2xl space-y-6 pb-12">
      <Link
        href="/dashboard/partidos"
        className="text-sm font-medium text-[#1B4F8C] hover:underline"
      >
        ← Volver a partidos
      </Link>

      <div className="rounded-2xl border border-mf-brand/15 bg-gradient-to-br from-mf-brand-soft to-white p-8 shadow-sm">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-mf-brand text-white">
          <CalendarDays className="h-6 w-6" />
        </div>
        <h1 className="mt-5 text-2xl font-bold text-slate-900">
          Calendario oficial MiFicha
        </h1>
        <p className="mt-3 text-sm leading-7 text-slate-600">
          Las jornadas de liga, torneo y amistosos autorizados las publica el
          equipo MiFicha. Así evitamos duplicados, fechas inventadas y stats
          incomparables entre academias.
        </p>
        <p className="mt-3 text-sm leading-7 text-slate-600">
          Cuando publiquemos tu próximo partido, aparecerá en{" "}
          <strong className="font-semibold text-slate-800">Partidos → Capturar resultado</strong>
          . Solo registras stats post-juego (~2 min).
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/dashboard/partidos" className="mf-btn-primary">
            Ver jornadas
          </Link>
          <a
            href="mailto:hola@mificha.mx?subject=Solicitud%20de%20jornada%20MiFicha"
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            <Mail className="h-4 w-4" />
            Solicitar jornada
          </a>
        </div>
      </div>

      <LeagueOfficialBanner academy={academy} />

      <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm leading-6 text-slate-600">
        <p className="font-medium text-slate-900">Calendario de tu liga</p>
        <p className="mt-1">
          MiFicha no reemplaza la fuente oficial FMF / estatal / intercolegial.
          Enlaza tu calendario en Configuración como referencia para padres y
          scouts.
        </p>
      </div>
    </div>
  );
}

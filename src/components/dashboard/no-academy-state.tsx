"use client";

import Link from "next/link";
import { Settings } from "lucide-react";

export function NoAcademyState() {
  return (
    <div className="mx-auto max-w-xl rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm">
      <h1 className="text-2xl font-bold text-slate-900">
        No tienes una academia registrada
      </h1>
      <p className="mt-3 text-slate-600">
        Registra los datos de tu academia para empezar a gestionar jugadores,
        partidos y fichas.
      </p>
      <Link
        href="/dashboard/configuracion"
        className="mt-6 inline-flex items-center gap-2 rounded-lg bg-[#1B4F8C] px-5 py-3 text-sm font-semibold text-white hover:bg-[#164278]"
      >
        <Settings className="h-4 w-4" />
        Ir a configuración
      </Link>
    </div>
  );
}

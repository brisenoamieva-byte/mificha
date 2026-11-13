"use client";

import Link from "next/link";
import { Settings, Users } from "lucide-react";

export function NoAcademyState() {
  return (
    <div className="mx-auto max-w-xl rounded-xl border border-mf-border bg-white p-8 text-center shadow-sm">
      <h1 className="text-2xl font-bold text-mf-text">
        ¿Academia o cuenta de tutor?
      </h1>
      <p className="mt-3 text-sm leading-7 text-mf-text-secondary">
        Academia: plantel, partidos y avisos (rendimiento oficial). Tutor: carta y
        proyección del jugador. Si eres papá o mamá, entra al espacio de tutor.
      </p>
      <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
        <Link href="/fut/tutor" className="mf-btn-gph">
          <Users className="h-4 w-4" />
          Soy tutor / padre
        </Link>
        <Link href="/fut/dashboard/configuracion" className="mf-btn-gph-ghost">
          <Settings className="h-4 w-4" />
          Registrar mi academia
        </Link>
      </div>
    </div>
  );
}

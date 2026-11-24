"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Trash2, UserPlus, Users } from "lucide-react";
import {
  hasMiEquipoMember,
  MI_EQUIPO_MAX,
  readMiEquipo,
  removeMiEquipoMember,
  upsertMiEquipoMember,
  type MiEquipoMember,
} from "@/lib/mi-equipo";
import { tutorSharePath } from "@/lib/tutor-family";
import { cn } from "@/lib/utils";

export function MiEquipoSaveButton({
  code,
  name,
  className,
}: {
  code: string;
  name: string;
  className?: string;
}) {
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setSaved(hasMiEquipoMember(code));
  }, [code]);

  if (!code) return null;

  return (
    <button
      type="button"
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-lg border border-mf-border bg-white px-3.5 py-2 text-sm font-semibold text-mf-text hover:bg-mf-canvas",
        className,
      )}
      onClick={() => {
        const result = upsertMiEquipoMember({ code, name });
        if (result.ok) setSaved(true);
      }}
    >
      <UserPlus className="h-4 w-4" />
      {saved ? "En mi equipo" : "Guardar en mi equipo"}
    </button>
  );
}

export function MiEquipoPanel({ className }: { className?: string }) {
  const [members, setMembers] = useState<MiEquipoMember[]>([]);
  const [draftCode, setDraftCode] = useState("");
  const [draftName, setDraftName] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setMembers(readMiEquipo());
  }, []);

  return (
    <details
      className={cn(
        "rounded-2xl border border-mf-border bg-white px-4 py-3 sm:px-5",
        className,
      )}
    >
      <summary className="flex cursor-pointer list-none items-center gap-2">
        <Users className="h-4 w-4 shrink-0 text-mf-gph" />
        <span className="text-sm font-semibold text-mf-gph-ink">Mi equipo</span>
        {members.length > 0 ? (
          <span className="rounded-full bg-mf-gph-soft px-2 py-0.5 text-[11px] font-semibold text-mf-gph">
            {members.length}
          </span>
        ) : null}
      </summary>

      <p className="mt-2 text-sm leading-6 text-mf-text-secondary">
        Guarda hasta {MI_EQUIPO_MAX} códigos MF- de compañeros en este celular.
      </p>

      <form
        className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-end"
        onSubmit={(event) => {
          event.preventDefault();
          const code = draftCode.trim().toUpperCase();
          if (!/^MF-/i.test(code)) {
            setError("El código debe empezar con MF-");
            return;
          }
          const result = upsertMiEquipoMember({
            code,
            name: draftName.trim() || code,
          });
          if (!result.ok) {
            setError("Código no válido.");
            return;
          }
          setError(null);
          setDraftCode("");
          setDraftName("");
          setMembers(result.members);
        }}
      >
        <label className="block min-w-0 flex-1 text-sm">
          <span className="font-medium text-mf-text">Código MF-</span>
          <input
            value={draftCode}
            onChange={(event) => {
              setError(null);
              setDraftCode(event.target.value.toUpperCase());
            }}
            placeholder="MF-5NQNH"
            className="mf-input mt-1 font-mono"
            autoComplete="off"
          />
        </label>
        <label className="block min-w-0 flex-1 text-sm">
          <span className="font-medium text-mf-text">Nombre</span>
          <input
            value={draftName}
            onChange={(event) => setDraftName(event.target.value)}
            placeholder="Opcional"
            className="mf-input mt-1"
          />
        </label>
        <button type="submit" className="mf-btn-gph shrink-0">
          Agregar
        </button>
      </form>
      {error ? <p className="mt-2 text-xs font-medium text-mf-danger">{error}</p> : null}

      {members.length === 0 ? (
        <p className="mt-3 text-sm text-mf-text-muted">
          Aún no hay nadie. Ábrelo desde su ficha o pide su código.
        </p>
      ) : (
        <ul className="mt-3 divide-y divide-mf-border/80">
          {members.map((row) => (
            <li
              key={row.code}
              className="flex items-center justify-between gap-3 py-2.5"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-mf-gph-ink">
                  {row.name}
                </p>
                <p className="font-mono text-xs text-mf-text-muted">{row.code}</p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <Link
                  href={tutorSharePath(row.code)}
                  className="text-sm font-semibold text-mf-gph hover:underline"
                >
                  Abrir
                </Link>
                <button
                  type="button"
                  aria-label={`Quitar ${row.name}`}
                  className="rounded-lg p-1.5 text-mf-text-muted hover:bg-mf-canvas hover:text-mf-danger"
                  onClick={() => setMembers(removeMiEquipoMember(row.code))}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </details>
  );
}

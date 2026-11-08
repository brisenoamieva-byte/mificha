"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { diagnosisAuthedFetch } from "@/lib/player-diagnosis-client";
import { VISORIA_EVENT, VISORIA_POSITIONS, type VisoriaRegistrationRow } from "@/lib/visoria-event";

type SortKey =
  | "player_full_name"
  | "category"
  | "birth_date"
  | "age_at_registration"
  | "current_club"
  | "guardian_name"
  | "guardian_phone"
  | "created_at";

const SOURCE_LABELS: Record<string, string> = {
  platform: "Página",
  google_forms: "Excel",
  whatsapp: "WhatsApp",
  import: "Importación",
};

function sourceLabel(value: string | null | undefined) {
  if (!value) return "";
  return SOURCE_LABELS[value] ?? value;
}

function positionLabel(value: string | null) {
  if (!value) return "";
  return VISORIA_POSITIONS.find((item) => item.value === value)?.label ?? value;
}

function cellText(row: VisoriaRegistrationRow) {
  return [
    row.folio,
    row.public_code,
    row.player_full_name,
    row.category,
    row.birth_date,
    row.position,
    row.current_club,
    row.city,
    row.nui,
    row.guardian_name,
    row.guardian_phone,
    row.guardian_email,
    row.source,
    row.notes,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function compare(a: VisoriaRegistrationRow, b: VisoriaRegistrationRow, key: SortKey) {
  const left = a[key];
  const right = b[key];
  if (typeof left === "number" || typeof right === "number") {
    return Number(left ?? -1) - Number(right ?? -1);
  }
  return String(left ?? "").localeCompare(String(right ?? ""), "es", { sensitivity: "base" });
}

export function VisoriaAdminList() {
  const [rows, setRows] = useState<VisoriaRegistrationRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<"all" | "femenil" | "varonil">("all");
  const [day, setDay] = useState<"all" | "jueves" | "viernes">("all");
  const [source, setSource] = useState("all");
  const [sortKey, setSortKey] = useState<SortKey>("player_full_name");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  useEffect(() => {
    let cancelled = false;
    void diagnosisAuthedFetch("/fut/api/visorias")
      .then((payload) => {
        if (cancelled) return;
        setRows((payload.registrations as VisoriaRegistrationRow[]) ?? []);
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "No se cargó la lista.");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const filtered = rows.filter((row) => {
      if (category !== "all" && row.category !== category) return false;
      if (day === "jueves" && !row.attend_thursday) return false;
      if (day === "viernes" && !row.attend_friday) return false;
      if (source !== "all" && row.source !== source) return false;
      if (needle && !cellText(row).includes(needle)) return false;
      return true;
    });
    const sorted = [...filtered].sort((a, b) => compare(a, b, sortKey));
    return sortDir === "asc" ? sorted : sorted.reverse();
  }, [rows, query, category, day, source, sortKey, sortDir]);

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((current) => (current === "asc" ? "desc" : "asc"));
      return;
    }
    setSortKey(key);
    setSortDir("asc");
  }

  async function downloadExcel() {
    const XLSX = await import("xlsx");
    const sheetRows = visible.map((row) => ({
      Código: row.public_code ?? "",
      Folio: row.folio,
      Jugador: row.player_full_name,
      Categoría: row.category,
      Nacimiento: row.birth_date,
      Edad: row.age_at_registration ?? "",
      Posición: positionLabel(row.position),
      Club: row.current_club ?? "",
      Ciudad: row.city ?? "",
      NUI: row.nui ?? "",
      "Años entrenando": row.years_training ?? "",
      Tutor: row.guardian_name,
      WhatsApp: row.guardian_phone,
      Correo: row.guardian_email ?? "",
      "Jueves 26": row.attend_thursday ? "Sí" : "",
      "Viernes 27": row.attend_friday ? "Sí" : "",
      "Seleccionado GPH": row.gph_selected ? "Sí" : "",
      Origen: sourceLabel(row.source),
      Notas: row.notes ?? "",
      Registro: row.created_at,
    }));
    const sheet = XLSX.utils.json_to_sheet(sheetRows);
    const book = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(book, sheet, "Visorías");
    XLSX.writeFile(book, "visorias-queretaro-nov-2026.xlsx");
  }

  const header = (key: SortKey, label: string) => (
    <th className="sticky top-0 bg-white px-3 py-2 font-medium">
      <button
        type="button"
        onClick={() => toggleSort(key)}
        className="inline-flex items-center gap-1 text-left hover:text-mf-text"
      >
        {label}
        {sortKey === key ? (sortDir === "asc" ? " ↑" : " ↓") : ""}
      </button>
    </th>
  );

  if (loading) {
    return <p className="text-sm text-mf-text-muted">Cargando registros…</p>;
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-mf-border bg-white p-6">
        <p className="font-semibold text-mf-text">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-mf-gph">
            {VISORIA_EVENT.organizers}
          </p>
          <h1 className="mt-1 text-2xl font-semibold text-mf-text">Registros · visorías Querétaro</h1>
          <p className="mt-1 text-sm text-mf-text-secondary">
            {visible.length} de {rows.length} filas
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => void downloadExcel()} className="mf-btn-gph">
            Descargar Excel
          </button>
          <Link href="/fut/visorias" className="mf-btn-gph-ghost" target="_blank">
            Formulario público
          </Link>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Buscar código MF-, jugador, tutor, WhatsApp, club…"
          className="mf-input min-w-[16rem] flex-1"
        />
        <select
          value={category}
          onChange={(event) => setCategory(event.target.value as typeof category)}
          className="mf-input w-auto"
        >
          <option value="all">Todas las categorías</option>
          <option value="varonil">Varonil</option>
          <option value="femenil">Femenil</option>
        </select>
        <select
          value={day}
          onChange={(event) => setDay(event.target.value as typeof day)}
          className="mf-input w-auto"
        >
          <option value="all">Todos los días</option>
          <option value="jueves">Jueves 26</option>
          <option value="viernes">Viernes 27</option>
        </select>
        <select
          value={source}
          onChange={(event) => setSource(event.target.value)}
          className="mf-input w-auto"
        >
          <option value="all">Todos los orígenes</option>
          <option value="platform">Página</option>
          <option value="google_forms">Excel</option>
          <option value="whatsapp">WhatsApp</option>
        </select>
      </div>

      <div className="max-h-[70vh] overflow-auto rounded-xl border border-mf-border bg-white">
        <table className="min-w-[1100px] text-left text-sm">
          <thead>
            <tr className="border-b border-mf-border text-[11px] text-mf-text-muted">
              <th className="sticky top-0 bg-white px-3 py-2 font-medium">Código</th>
              {header("player_full_name", "Jugador")}
              {header("category", "Cat.")}
              {header("birth_date", "Nacimiento")}
              {header("age_at_registration", "Edad")}
              {header("current_club", "Club")}
              {header("guardian_name", "Tutor")}
              {header("guardian_phone", "WhatsApp")}
              <th className="sticky top-0 bg-white px-3 py-2 font-medium">Días</th>
              <th className="sticky top-0 bg-white px-3 py-2 font-medium">NUI</th>
              <th className="sticky top-0 bg-white px-3 py-2 font-medium">Origen</th>
            </tr>
          </thead>
          <tbody>
            {visible.length === 0 ? (
              <tr>
                <td colSpan={11} className="px-3 py-8 text-center text-mf-text-muted">
                  Ninguna fila coincide con el filtro.
                </td>
              </tr>
            ) : (
              visible.map((row) => (
                <tr key={row.id} className="border-t border-mf-border-subtle align-top">
                  <td className="px-3 py-2 font-mono text-xs font-semibold tracking-wide text-mf-gph">
                    {row.public_code ?? "—"}
                  </td>
                  <td className="px-3 py-2">
                    <p className="font-medium">{row.player_full_name}</p>
                    <p className="text-[11px] text-mf-text-muted">{positionLabel(row.position)}</p>
                  </td>
                  <td className="px-3 py-2 capitalize">{row.category}</td>
                  <td className="px-3 py-2 tabular-nums">{row.birth_date}</td>
                  <td className="px-3 py-2 tabular-nums">{row.age_at_registration ?? ""}</td>
                  <td className="px-3 py-2">{row.current_club}</td>
                  <td className="px-3 py-2">{row.guardian_name}</td>
                  <td className="px-3 py-2">
                    <a
                      className="text-xs font-medium text-mf-gph hover:underline"
                      href={`https://wa.me/${row.guardian_phone}`}
                    >
                      {row.guardian_phone}
                    </a>
                  </td>
                  <td className="px-3 py-2 text-xs">
                    {row.attend_thursday ? "Jue 26" : ""}
                    {row.attend_thursday && row.attend_friday ? " · " : ""}
                    {row.attend_friday ? "Vie 27" : ""}
                  </td>
                  <td className="px-3 py-2 text-xs">{row.nui}</td>
                  <td className="px-3 py-2 text-xs">{sourceLabel(row.source)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

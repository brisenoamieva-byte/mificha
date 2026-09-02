"use client";

import * as XLSX from "xlsx";
import {
  buildPlayerSlug,
  buildPublicPlayerUrl,
} from "@/lib/player-utils";
import { supabase } from "@/lib/supabase";
import type { DominantFoot, PlayerPosition } from "@/types/database";
import { UNKNOWN_BIRTH_DATE, isUnknownBirthDate } from "@/lib/player-category";

const positionMap: Record<string, PlayerPosition> = {
  portero: "goalkeeper",
  porteros: "goalkeeper",
  goalkeeper: "goalkeeper",
  gk: "goalkeeper",
  defensa: "defender",
  defensas: "defender",
  defender: "defender",
  lateral: "defender",
  centrales: "defender",
  central: "defender",
  mediocampista: "midfielder",
  mediocampistas: "midfielder",
  midfielder: "midfielder",
  medio: "midfielder",
  medios: "midfielder",
  volante: "midfielder",
  mid: "midfielder",
  delantero: "forward",
  delantera: "forward",
  delanteros: "forward",
  delanteras: "forward",
  forward: "forward",
  atacante: "forward",
};

const footMap: Record<string, DominantFoot> = {
  derecho: "right",
  derecha: "right",
  diestro: "right",
  right: "right",
  izquierdo: "left",
  izquierda: "left",
  zurdo: "left",
  left: "left",
  ambos: "both",
  ambidiestro: "both",
  both: "both",
};

export interface ParsedPlayerRow {
  rowNumber: number;
  firstName: string;
  lastName: string;
  birthDate: string;
  position: PlayerPosition;
  dominantFoot: DominantFoot;
  jerseyNumber: number | null;
  heightCm: number | null;
  weightKg: number | null;
  guardianName: string | null;
  guardianEmail: string | null;
  warnings: string[];
}

export interface InvalidPlayerRow {
  rowNumber: number;
  reason: string;
  preview: string;
}

export interface PlayerImportPreview {
  valid: ParsedPlayerRow[];
  invalid: InvalidPlayerRow[];
  totalRows: number;
  missingBirthDateCount: number;
}

export interface PlayerImportInsert {
  slug: string;
  first_name: string;
  last_name: string;
  birth_date: string;
  position: PlayerPosition;
  dominant_foot: DominantFoot;
  jersey_number: number | null;
  height_cm: number | null;
  weight_kg: number | null;
  guardian_name: string | null;
  guardian_email: string | null;
  academy_id: string;
  qr_code: string;
  is_public: boolean;
  is_discoverable: boolean;
  public_consent_at: null;
}

function normalizeKey(key: string) {
  return key
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function cleanText(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function getCell(
  row: Record<string, unknown>,
  keys: string[],
  mode: "exact" | "includes" = "includes",
) {
  const entries = Object.entries(row).map(([rawKey, value]) => ({
    key: normalizeKey(rawKey),
    value: cleanText(String(value ?? "")),
  }));

  for (const candidate of keys) {
    const exact = entries.find((entry) => entry.key === candidate);
    if (exact) return exact.value;
  }

  if (mode === "exact") return "";

  for (const candidate of keys) {
    const partial = entries.find(
      (entry) =>
        entry.key.includes(candidate) &&
        !entry.key.includes("tutor") &&
        !entry.key.includes("padre") &&
        !entry.key.includes("madre") &&
        !entry.key.includes("guardian"),
    );
    if (partial) return partial.value;
  }

  return "";
}

function getGuardianCell(row: Record<string, unknown>, keys: string[]) {
  const entries = Object.entries(row).map(([rawKey, value]) => ({
    key: normalizeKey(rawKey),
    value: cleanText(String(value ?? "")),
  }));

  for (const candidate of keys) {
    const exact = entries.find((entry) => entry.key === candidate);
    if (exact) return exact.value;
  }

  for (const candidate of keys) {
    const partial = entries.find((entry) => entry.key.includes(candidate));
    if (partial) return partial.value;
  }

  return "";
}

function parseOptionalNumber(value: string, min: number, max: number) {
  if (!value) return null;
  const parsed = Number(value.replace(",", "."));
  if (!Number.isFinite(parsed) || parsed < min || parsed > max) return null;
  return Math.round(parsed);
}

function parseOptionalEmail(value: string) {
  if (!value) return null;
  const email = value.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return null;
  return email;
}

function parseBirthDate(raw: string): string | null {
  if (!raw) return null;

  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
    return raw;
  }

  const parts = raw.split(/[\/\-.]/).map((part) => part.trim());
  if (parts.length === 3) {
    const [a, b, c] = parts.map(Number);
    if (parts[2].length === 4) {
      const day = a;
      const month = b;
      const year = c;
      if (day >= 1 && day <= 31 && month >= 1 && month <= 12 && year >= 1990) {
        return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
      }
    }
    if (parts[0].length === 4) {
      const year = a;
      const month = b;
      const day = c;
      if (day >= 1 && day <= 31 && month >= 1 && month <= 12 && year >= 1990) {
        return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
      }
    }
  }

  const excelSerial = Number(raw);
  if (Number.isFinite(excelSerial) && excelSerial > 25569 && excelSerial < 60000) {
    const date = XLSX.SSF.parse_date_code(excelSerial);
    if (date) {
      return `${date.y}-${String(date.m).padStart(2, "0")}-${String(date.d).padStart(2, "0")}`;
    }
  }

  return null;
}

function normalizeLookup(value: string) {
  return normalizeKey(value).replace(/\s+/g, " ");
}

function resolvePosition(raw: string): PlayerPosition {
  return positionMap[normalizeLookup(raw)] ?? "midfielder";
}

function resolveFoot(raw: string): DominantFoot {
  return footMap[normalizeLookup(raw)] ?? "right";
}

function buildPreviewLabel(firstName: string, lastName: string) {
  const label = `${firstName} ${lastName}`.trim();
  return label || "Fila sin nombre";
}

export function parsePlayerImportFile(buffer: ArrayBuffer): PlayerImportPreview {
  const workbook = XLSX.read(buffer, { type: "array", cellDates: true });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, {
    defval: "",
  });

  const valid: ParsedPlayerRow[] = [];
  const invalid: InvalidPlayerRow[] = [];

  rows.forEach((row, index) => {
    const rowNumber = index + 2;
    const firstName = getCell(row, ["nombre", "first name", "firstname", "first"], "exact")
      || getCell(row, ["nombre", "first"]);
    const lastName = getCell(row, ["apellido", "apellidos", "last name", "lastname", "last"]);
    const birthRaw = getCell(row, [
      "fecha nacimiento",
      "fecha de nacimiento",
      "nacimiento",
      "birth date",
      "birthdate",
      "birth",
    ]);
    const positionRaw = getCell(row, ["posicion", "position"]);
    const footRaw = getCell(row, ["pierna", "foot", "dominant"]);
    const jerseyRaw = getCell(row, ["numero", "playera", "jersey", "dorsal"]);
    const heightRaw = getCell(row, ["estatura", "height", "altura"]);
    const weightRaw = getCell(row, ["peso", "weight"]);
    const guardianName = getGuardianCell(row, [
      "nombre tutor",
      "tutor",
      "padre",
      "madre",
      "guardian name",
      "guardian",
    ]);
    const guardianEmailRaw = getGuardianCell(row, [
      "email tutor",
      "email padre",
      "correo tutor",
      "correo padre",
      "guardian email",
    ]);

    const preview = buildPreviewLabel(firstName, lastName);

    if (!firstName && !lastName && !birthRaw && !positionRaw) {
      return;
    }

    if (!firstName || !lastName) {
      invalid.push({
        rowNumber,
        reason: "Faltan nombre o apellido.",
        preview,
      });
      return;
    }

    const warnings: string[] = [];
    let birthDate = parseBirthDate(birthRaw);
    if (!birthDate) {
      birthDate = UNKNOWN_BIRTH_DATE;
      warnings.push("Sin fecha de nacimiento: categoría pendiente.");
    }

    const normalizedPosition = normalizeLookup(positionRaw);
    if (positionRaw && !positionMap[normalizedPosition]) {
      warnings.push(
        `Posición «${positionRaw}» no reconocida; se usó mediocampista.`,
      );
    }

    const normalizedFoot = normalizeLookup(footRaw);
    if (footRaw && !footMap[normalizedFoot]) {
      warnings.push(`Pierna «${footRaw}» no reconocida; se usó derecha.`);
    }

    valid.push({
      rowNumber,
      firstName,
      lastName,
      birthDate,
      position: resolvePosition(positionRaw),
      dominantFoot: resolveFoot(footRaw),
      jerseyNumber: parseOptionalNumber(jerseyRaw, 1, 99),
      heightCm: parseOptionalNumber(heightRaw, 100, 220),
      weightKg: parseOptionalNumber(weightRaw, 20, 120),
      guardianName: guardianName || null,
      guardianEmail: parseOptionalEmail(guardianEmailRaw),
      warnings,
    });
  });

  if (valid.length === 0 && invalid.length === 0) {
    throw new Error("El archivo Excel está vacío o no tiene filas con datos.");
  }

  return {
    valid,
    invalid,
    totalRows: rows.length,
    missingBirthDateCount: valid.filter((row) => isUnknownBirthDate(row.birthDate))
      .length,
  };
}

export function buildPlayerImportInserts(
  rows: ParsedPlayerRow[],
  academyId: string,
): PlayerImportInsert[] {
  return rows.map((row) => {
    const slug = buildPlayerSlug(row.firstName, row.lastName);

    return {
      slug,
      first_name: row.firstName,
      last_name: row.lastName,
      birth_date: row.birthDate,
      position: row.position,
      dominant_foot: row.dominantFoot,
      jersey_number: row.jerseyNumber,
      height_cm: row.heightCm,
      weight_kg: row.weightKg,
      guardian_name: row.guardianName,
      guardian_email: row.guardianEmail,
      academy_id: academyId,
      qr_code: buildPublicPlayerUrl(slug),
      is_public: false,
      is_discoverable: false,
      public_consent_at: null,
    };
  });
}

export async function previewPlayersFromExcel(file: File): Promise<PlayerImportPreview> {
  const buffer = await file.arrayBuffer();
  return parsePlayerImportFile(buffer);
}

export async function importParsedPlayers(
  rows: ParsedPlayerRow[],
  academyId: string,
) {
  if (rows.length === 0) {
    throw new Error("No hay jugadores válidos para importar.");
  }

  const inserts = buildPlayerImportInserts(rows, academyId);
  const { error } = await supabase.from("players").insert(inserts);
  if (error) throw error;

  return inserts.length;
}

export async function importPlayersFromExcel(file: File, academyId: string) {
  const preview = await previewPlayersFromExcel(file);
  if (preview.valid.length === 0) {
    throw new Error(
      preview.invalid.length > 0
        ? "Ninguna fila es válida. Revisa nombre y apellido."
        : "No se encontraron filas válidas.",
    );
  }

  return importParsedPlayers(preview.valid, academyId);
}

export function downloadPlayerImportTemplate() {
  const rows = [
    {
      nombre: "Santiago",
      apellido: "Hernández",
      "fecha nacimiento": "2012-05-15",
      posicion: "delantero",
      pierna: "derecha",
      numero: 9,
      estatura: 155,
      peso: 45,
      "nombre tutor": "María Hernández",
      "email tutor": "maria@email.com",
    },
    {
      nombre: "Mateo",
      apellido: "López",
      "fecha nacimiento": "2011-08-22",
      posicion: "medio",
      pierna: "izquierda",
      numero: 8,
      estatura: 162,
      peso: 48,
      "nombre tutor": "Carlos López",
      "email tutor": "carlos@email.com",
    },
  ];

  const worksheet = XLSX.utils.json_to_sheet(rows);
  worksheet["!cols"] = [
    { wch: 14 },
    { wch: 16 },
    { wch: 18 },
    { wch: 14 },
    { wch: 12 },
    { wch: 8 },
    { wch: 10 },
    { wch: 8 },
    { wch: 18 },
    { wch: 24 },
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Plantel");
  XLSX.writeFile(workbook, "mificha-plantel-plantilla.xlsx");
}

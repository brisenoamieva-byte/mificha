"use client";

import * as XLSX from "xlsx";
import {
  buildPlayerSlug,
  buildPublicPlayerUrl,
} from "@/lib/player-utils";
import { supabase } from "@/lib/supabase";
import type { DominantFoot, PlayerPosition } from "@/types/database";

const positionMap: Record<string, PlayerPosition> = {
  portero: "goalkeeper",
  goalkeeper: "goalkeeper",
  defensa: "defender",
  defender: "defender",
  mediocampista: "midfielder",
  midfielder: "midfielder",
  delantero: "forward",
  forward: "forward",
};

const footMap: Record<string, DominantFoot> = {
  derecho: "right",
  right: "right",
  izquierdo: "left",
  left: "left",
  ambos: "both",
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

function getCell(row: Record<string, unknown>, keys: string[]) {
  for (const [rawKey, value] of Object.entries(row)) {
    const key = normalizeKey(rawKey);
    if (keys.some((candidate) => key.includes(candidate))) {
      return String(value ?? "").trim();
    }
  }
  return "";
}

function parseOptionalNumber(value: string, min: number, max: number) {
  if (!value) return null;
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < min || parsed > max) return null;
  return Math.round(parsed);
}

function parseBirthDate(raw: string): string | null {
  if (!raw) return null;

  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
    return raw;
  }

  const parts = raw.split(/[\/\-]/).map((part) => part.trim());
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
    const firstName = getCell(row, ["nombre", "first"]);
    const lastName = getCell(row, ["apellido", "last"]);
    const birthRaw = getCell(row, ["fecha", "birth", "nacimiento"]);
    const positionRaw = getCell(row, ["posicion", "position"]).toLowerCase();
    const footRaw = getCell(row, ["pierna", "foot", "dominant"]).toLowerCase();
    const jerseyRaw = getCell(row, ["numero", "playera", "jersey"]);
    const heightRaw = getCell(row, ["estatura", "height", "altura"]);
    const weightRaw = getCell(row, ["peso", "weight"]);

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

    const birthDate = parseBirthDate(birthRaw);
    if (!birthDate) {
      invalid.push({
        rowNumber,
        reason: "Fecha de nacimiento inválida. Usa AAAA-MM-DD o DD/MM/AAAA.",
        preview,
      });
      return;
    }

    valid.push({
      rowNumber,
      firstName,
      lastName,
      birthDate,
      position: positionMap[positionRaw] ?? "midfielder",
      dominantFoot: footMap[footRaw] ?? "right",
      jerseyNumber: parseOptionalNumber(jerseyRaw, 1, 99),
      heightCm: parseOptionalNumber(heightRaw, 100, 220),
      weightKg: parseOptionalNumber(weightRaw, 30, 120),
    });
  });

  if (valid.length === 0 && invalid.length === 0) {
    throw new Error("El archivo Excel está vacío o no tiene filas con datos.");
  }

  return {
    valid,
    invalid,
    totalRows: rows.length,
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
        ? "Ninguna fila es válida. Revisa nombre, apellido y fecha."
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
      pierna: "derecho",
      numero: 9,
      estatura: 155,
      peso: 45,
    },
    {
      nombre: "Mateo",
      apellido: "López",
      "fecha nacimiento": "2011-08-22",
      posicion: "mediocampista",
      pierna: "izquierdo",
      numero: 8,
      estatura: 162,
      peso: 48,
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
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Plantel");
  XLSX.writeFile(workbook, "mificha-plantel-plantilla.xlsx");
}

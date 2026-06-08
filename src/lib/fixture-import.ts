import * as XLSX from "xlsx";

export interface ParsedFixtureRow {
  rowNumber: number;
  academySlug: string | null;
  opponent: string;
  matchDate: string;
  kickoffTime: string;
  category: string | null;
  venueName: string | null;
  venueAddress: string | null;
  notes: string | null;
}

export interface InvalidFixtureRow {
  rowNumber: number;
  reason: string;
  preview: string;
}

export interface FixtureImportPreview {
  valid: ParsedFixtureRow[];
  invalid: InvalidFixtureRow[];
  totalRows: number;
}

export const FIXTURE_IMPORT_TEMPLATE = `academia,rival,fecha,hora,categoria,sede,notas
colegio-ejemplo,Halcones FC,2026-03-15,10:00,Sub-15 Varonil,Cancha 2 U.D. Querétaro,Jornada 3
colegio-ejemplo,Águilas SC,2026-03-22,09:00,Sub-15 Varonil,Cancha 1 U.D. Querétaro,Jornada 4
`;

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

function parseImportDate(raw: string): string | null {
  if (!raw) return null;

  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
    return raw;
  }

  const parts = raw.split(/[/\-]/).map((part) => part.trim());
  if (parts.length === 3) {
    const [a, b, c] = parts.map(Number);
    if (parts[2].length === 4) {
      const day = a;
      const month = b;
      const year = c;
      if (day >= 1 && day <= 31 && month >= 1 && month <= 12 && year >= 2020) {
        return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
      }
    }
    if (parts[0].length === 4) {
      const year = a;
      const month = b;
      const day = c;
      if (day >= 1 && day <= 31 && month >= 1 && month <= 12 && year >= 2020) {
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

function parseKickoffTime(raw: string): string | null {
  if (!raw) return "10:00";

  const normalized = raw.replace(".", ":").trim();

  if (/^\d{1,2}:\d{2}$/.test(normalized)) {
    const [hours, minutes] = normalized.split(":").map(Number);
    if (hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59) {
      return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
    }
  }

  if (/^\d{1,2}:\d{2}:\d{2}$/.test(normalized)) {
    return normalized.slice(0, 5);
  }

  const hourOnly = Number(normalized);
  if (Number.isFinite(hourOnly) && hourOnly >= 0 && hourOnly <= 23) {
    return `${String(hourOnly).padStart(2, "0")}:00`;
  }

  return null;
}

export function parseFixtureImportFile(buffer: ArrayBuffer): FixtureImportPreview {
  const workbook = XLSX.read(buffer, { type: "array", cellDates: true });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, {
    defval: "",
  });

  const valid: ParsedFixtureRow[] = [];
  const invalid: InvalidFixtureRow[] = [];

  rows.forEach((row, index) => {
    const rowNumber = index + 2;
    const academySlug =
      getCell(row, ["academia", "academy", "slug", "colegio"]) || null;
    const opponent = getCell(row, ["rival", "oponente", "opponent", "vs"]);
    const dateRaw = getCell(row, ["fecha", "date", "match"]);
    const timeRaw = getCell(row, ["hora", "time", "kickoff"]);
    const category = getCell(row, ["categoria", "category", "cat"]) || null;
    const venueName = getCell(row, ["sede", "cancha", "venue"]) || null;
    const venueAddress = getCell(row, ["direccion", "address"]) || null;
    const notes = getCell(row, ["notas", "notes", "jornada"]) || null;

    if (!opponent && !dateRaw && !timeRaw) {
      return;
    }

    const preview = opponent || `Fila ${rowNumber}`;

    if (!opponent) {
      invalid.push({ rowNumber, reason: "Falta el rival.", preview });
      return;
    }

    const matchDate = parseImportDate(dateRaw);
    if (!matchDate) {
      invalid.push({
        rowNumber,
        reason: "Fecha inválida (usa AAAA-MM-DD o DD/MM/AAAA).",
        preview,
      });
      return;
    }

    const kickoffTime = parseKickoffTime(timeRaw);
    if (!kickoffTime) {
      invalid.push({
        rowNumber,
        reason: "Hora inválida (usa HH:MM).",
        preview,
      });
      return;
    }

    valid.push({
      rowNumber,
      academySlug,
      opponent,
      matchDate,
      kickoffTime,
      category,
      venueName,
      venueAddress,
      notes,
    });
  });

  return {
    valid,
    invalid,
    totalRows: rows.length,
  };
}

export function downloadFixtureImportTemplate() {
  const blob = new Blob([FIXTURE_IMPORT_TEMPLATE], {
    type: "text/csv;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "mificha-jornadas-plantilla.csv";
  anchor.click();
  URL.revokeObjectURL(url);
}

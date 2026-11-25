import { PDFDocument, StandardFonts } from "pdf-lib";
import { formatMxn } from "@/lib/gph-commerce";

const TEMPLATE_PATH = "/certificates/pase-anual-gph-cracks-2027.pdf";

export type GphAnnualPassFields = {
  playerName: string;
  folio: string;
  paidAtIso: string;
  amountMxn: number;
  issuedAtIso?: string;
};

function formatDateMx(iso: string) {
  const day = iso.slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(day)) return iso || "—";
  const [y, m, d] = day.split("-");
  return `${d}/${m}/${y}`;
}

async function loadTemplateBytes() {
  const base = (
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.VERCEL_PROJECT_PRODUCTION_URL ||
    "https://www.mificha.mx"
  ).replace(/\/$/, "");
  const url = base.startsWith("http")
    ? `${base}${TEMPLATE_PATH}`
    : `https://${base}${TEMPLATE_PATH}`;
  const response = await fetch(url, { cache: "force-cache" });
  if (!response.ok) {
    throw new Error(`No se pudo cargar la plantilla del certificado (${response.status}).`);
  }
  return new Uint8Array(await response.arrayBuffer());
}

/**
 * Llena el certificado oficial GPH + CRACKS 2027 (plantilla con campos AcroForm).
 * Solo usar en rutas/servidor (webhook / jobs), no en cliente.
 */
export async function buildGphAnnualPassPdfBytes(
  input: GphAnnualPassFields,
): Promise<Uint8Array> {
  const template = await loadTemplateBytes();
  const pdf = await PDFDocument.load(template);
  const form = pdf.getForm();
  const font = await pdf.embedFont(StandardFonts.HelveticaBold);

  const playerName = input.playerName.trim() || "Jugador";
  const folio = input.folio.trim();
  const paidAt = formatDateMx(input.paidAtIso);
  const issuedAt = formatDateMx(input.issuedAtIso || input.paidAtIso);
  const amount = formatMxn(input.amountMxn);

  const set = (name: string, value: string, size = 11) => {
    const field = form.getTextField(name);
    field.setText(value);
    field.updateAppearances(font);
    try {
      field.setFontSize(size);
    } catch {
      /* algunos viewers ignoran size */
    }
  };

  set("nombre_jugador", playerName, 14);
  set("folio", folio, 10);
  set("fecha_pago", paidAt, 10);
  set("importe", amount, 10);
  set("fecha_emision", issuedAt, 10);

  form.flatten();
  return pdf.save();
}

export function gphAnnualPassFilename(folio: string) {
  const clean = folio.replace(/[^A-Za-z0-9_-]+/g, "").slice(0, 24) || "pase";
  return `pase-anual-gph-cracks-2027-${clean}.pdf`;
}

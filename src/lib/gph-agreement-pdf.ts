import { jsPDF } from "jspdf";
import type { GphAgreement } from "@/lib/gph-agreements";
import {
  GPH_LEVELS,
  GPH_POSITIONS,
  GPH_REGLAMENTO_SECTIONS,
  GPH_SCHEDULES,
  GPH_SEDES,
  computeGphPackage,
} from "@/lib/gph-reglamento-content";

function labelOf<T extends { id: string; label: string }>(
  list: readonly T[],
  id: string,
) {
  return list.find((row) => row.id === id)?.label ?? id;
}

function money(n: number) {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    maximumFractionDigits: 0,
  }).format(n);
}

function formatDate(iso: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return iso || "—";
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

/**
 * Genera PDF sellado del acuerdo (servidor o cliente).
 */
export function buildGphAgreementPdfBytes(agreement: GphAgreement): Uint8Array {
  const doc = new jsPDF({ unit: "pt", format: "letter" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 48;
  const maxWidth = pageWidth - margin * 2;
  let y = margin;

  const ensureSpace = (needed: number) => {
    if (y + needed > doc.internal.pageSize.getHeight() - margin) {
      doc.addPage();
      y = margin;
    }
  };

  const write = (
    text: string,
    opts?: { size?: number; bold?: boolean; color?: [number, number, number] },
  ) => {
    const size = opts?.size ?? 10;
    doc.setFont("helvetica", opts?.bold ? "bold" : "normal");
    doc.setFontSize(size);
    if (opts?.color) doc.setTextColor(...opts.color);
    else doc.setTextColor(15, 23, 42);
    const lines = doc.splitTextToSize(text, maxWidth) as string[];
    for (const line of lines) {
      ensureSpace(size + 6);
      doc.text(line, margin, y);
      y += size + 4;
    }
  };

  const pkg = computeGphPackage({
    levelId: agreement.fields.level_id,
    paymentMode: agreement.fields.payment_mode,
    months: agreement.fields.months,
    inscriptionExempt: agreement.fields.inscription_exempt,
  });

  write("GPH PERFORMANCE HUB", { size: 11, bold: true, color: [27, 79, 140] });
  write(agreement.template_title, { size: 16, bold: true });
  write(
    `Versión ${agreement.template_version} · emitida ${agreement.template_issued_at} · acuerdo ${agreement.id.slice(0, 8)}`,
    { size: 9, color: [100, 116, 139] },
  );
  y += 8;

  write("1. Datos de inscripción y vigencia", { size: 12, bold: true });
  write(`Jugador: ${agreement.fields.player_name}`);
  write(`Fecha de nacimiento: ${formatDate(agreement.fields.birth_date)}`);
  write(`Tutor: ${agreement.fields.guardian_name}`);
  write(
    `Teléfono: ${agreement.fields.guardian_phone || "—"} · Email: ${agreement.fields.guardian_email || "—"}`,
  );
  write(
    `Sede: ${labelOf(GPH_SEDES, agreement.fields.sede)} · Grupo/nivel: ${agreement.fields.group_level || "—"}`,
  );
  write(
    `Días: ${labelOf(GPH_SCHEDULES, agreement.fields.schedule)} · Posición: ${labelOf(GPH_POSITIONS, agreement.fields.position)}`,
  );
  write(
    `Programa: ${formatDate(agreement.fields.program_start)} → ${formatDate(agreement.fields.program_end)} · ${agreement.fields.months} mensualidad(es)`,
  );
  y += 6;

  write("2. Programa y esquema económico", { size: 12, bold: true });
  write(
    `Nivel: ${pkg.level.label} · Modalidad: ${
      agreement.fields.payment_mode === "prepaid"
        ? "Pago total anticipado (−10%, inscripción bonificada)"
        : "Pago mensual"
    }`,
  );
  write(
    `Cuota mensual de referencia: ${money(pkg.monthlyMxn)} · Inscripción: ${
      pkg.inscriptionMxn > 0 ? money(pkg.inscriptionMxn) : "Exenta / bonificada"
    }`,
  );
  if (agreement.fields.inscription_exempt && agreement.fields.inscription_exempt_reason) {
    write(`Motivo de exención: ${agreement.fields.inscription_exempt_reason}`);
  }
  write(`Monto pactado: ${money(agreement.fields.amount_agreed_mxn)}`, {
    bold: true,
  });
  if (agreement.fields.payment_note) {
    write(`Nota de pago: ${agreement.fields.payment_note}`);
  }
  write(
    `Referencia de tarifas ${GPH_LEVELS.map((l) => `${l.label} ${money(l.monthlyMxn)}`).join(" · ")}`,
    { size: 8, color: [100, 116, 139] },
  );
  y += 6;

  for (const section of GPH_REGLAMENTO_SECTIONS) {
    write(section.title, { size: 12, bold: true });
    for (const paragraph of section.paragraphs) {
      write(`• ${paragraph}`, { size: 9 });
    }
    y += 4;
  }

  y += 8;
  write("Aceptación electrónica", { size: 12, bold: true });
  if (agreement.tutor_evidence) {
    write(
      `Tutor: ${agreement.tutor_evidence.acceptor_name} (${agreement.tutor_evidence.acceptor_email || "sin email"})`,
    );
    write(
      `Firmado electrónicamente el ${agreement.tutor_evidence.accepted_at} · user ${agreement.tutor_evidence.acceptor_user_id}`,
      { size: 8, color: [100, 116, 139] },
    );
    write(
      `Hash plantilla: ${agreement.tutor_evidence.template_hash.slice(0, 16)}… · Hash campos: ${agreement.tutor_evidence.fields_hash.slice(0, 16)}…`,
      { size: 8, color: [100, 116, 139] },
    );
    if (agreement.tutor_evidence.ip) {
      write(`IP: ${agreement.tutor_evidence.ip}`, {
        size: 8,
        color: [100, 116, 139],
      });
    }
  } else {
    write("Pendiente de firma del tutor.");
  }

  if (agreement.gph_countersign) {
    write(
      `GPH: ${agreement.gph_countersign.name} (${agreement.gph_countersign.email || "sin email"})`,
    );
    write(`Contrafirmado el ${agreement.gph_countersign.at}`, {
      size: 8,
      color: [100, 116, 139],
    });
  } else {
    write("Pendiente de contrafirma GPH.");
  }

  y += 10;
  write(
    "Documento generado por MiFicha para GPH Performance Hub. La aceptación electrónica con cuenta autenticada, marca de tiempo y hash del contenido constituye evidencia del consentimiento de las partes.",
    { size: 8, color: [100, 116, 139] },
  );

  const arrayBuffer = doc.output("arraybuffer");
  return new Uint8Array(arrayBuffer);
}

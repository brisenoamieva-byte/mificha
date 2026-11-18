import { NextResponse } from "next/server";
import {
  acceptGphAgreementAsTutor,
  downloadSealedAgreementPdf,
  getGphAgreement,
  listGphAgreementsForTutor,
  setGphAgreementSealedPdf,
  uploadSealedAgreementPdf,
} from "@/lib/gph-agreements";
import { buildGphAgreementPdfBytes } from "@/lib/gph-agreement-pdf";
import { notifyGphAgreementSigned } from "@/lib/email/gph-agreement-notify";
import { GPH_REGLAMENTO_SECTIONS, GPH_REGLAMENTO_VERSION } from "@/lib/gph-reglamento-content";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { getAuthedSupabaseClient } from "@/lib/supabase-server";

function clientMeta(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for");
  const ip =
    forwarded?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    null;
  const userAgent = request.headers.get("user-agent");
  return { ip, userAgent };
}

export async function GET(request: Request) {
  const supabase = await getAuthedSupabaseClient(request);
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Inicia sesión." }, { status: 401 });

  try {
    const admin = createSupabaseAdminClient();
    const url = new URL(request.url);
    const id = url.searchParams.get("id")?.trim();
    const wantPdf = url.searchParams.get("pdf") === "1";

    if (id) {
      const agreement = await getGphAgreement(admin, id);
      if (!agreement) {
        return NextResponse.json({ error: "No encontrado." }, { status: 404 });
      }
      const email = user.email?.trim().toLowerCase() || "";
      const byUser = agreement.guardian_user_id === user.id;
      const byEmail =
        Boolean(email) &&
        agreement.fields.guardian_email === email &&
        (!agreement.guardian_user_id || agreement.guardian_user_id === user.id);
      if (!byUser && !byEmail) {
        return NextResponse.json({ error: "No autorizado." }, { status: 403 });
      }

      if (wantPdf) {
        if (
          agreement.status !== "signed_tutor" &&
          agreement.status !== "active" &&
          agreement.status !== "sent"
        ) {
          return NextResponse.json({ error: "PDF no disponible." }, { status: 400 });
        }
        let bytes: Buffer;
        if (agreement.sealed_pdf_path && agreement.status === "active") {
          bytes = await downloadSealedAgreementPdf(admin, agreement.sealed_pdf_path);
        } else {
          const pdf = buildGphAgreementPdfBytes(agreement);
          bytes = Buffer.from(pdf);
        }
        return new NextResponse(new Uint8Array(bytes), {
          headers: {
            "Content-Type": "application/pdf",
            "Content-Disposition": `attachment; filename="gph-carta-${agreement.id.slice(0, 8)}.pdf"`,
          },
        });
      }

      return NextResponse.json({
        agreement,
        sections: GPH_REGLAMENTO_SECTIONS,
        version: GPH_REGLAMENTO_VERSION,
      });
    }

    const agreements = await listGphAgreementsForTutor(admin, user.id);
    // Also surface sent drafts addressed to this email but not yet claimed.
    const email = user.email?.trim().toLowerCase();
    if (email) {
      const { listGphAgreementsForAcademy, resolveGphAcademy } = await import(
        "@/lib/gph-agreements"
      );
      const academy = await resolveGphAcademy(admin);
      const all = await listGphAgreementsForAcademy(admin, academy.id);
      for (const row of all) {
        if (row.status !== "sent") continue;
        if (row.guardian_user_id && row.guardian_user_id !== user.id) continue;
        if (row.guardian_user_id === user.id) continue;
        if (row.fields.guardian_email !== email) continue;
        if (!agreements.some((a) => a.id === row.id)) agreements.push(row);
      }
    }

    return NextResponse.json({
      agreements: agreements.sort((a, b) => b.updated_at.localeCompare(a.updated_at)),
      version: GPH_REGLAMENTO_VERSION,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "No se pudo cargar.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function POST(request: Request) {
  const supabase = await getAuthedSupabaseClient(request);
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Inicia sesión." }, { status: 401 });

  const body = (await request.json().catch(() => ({}))) as {
    action?: string;
    agreement_id?: string;
    acceptor_name?: string;
    consent?: boolean;
  };

  try {
    const admin = createSupabaseAdminClient();
    const agreementId = String(body.agreement_id ?? "").trim();
    if (!agreementId) {
      return NextResponse.json({ error: "agreement_id es obligatorio." }, { status: 400 });
    }

    if (body.action === "accept") {
      if (body.consent !== true) {
        return NextResponse.json(
          { error: "Debes marcar que leíste y aceptas el reglamento." },
          { status: 400 },
        );
      }
      const existing = await getGphAgreement(admin, agreementId);
      if (!existing) {
        return NextResponse.json({ error: "No encontrado." }, { status: 404 });
      }
      if (existing.guardian_user_id && existing.guardian_user_id !== user.id) {
        return NextResponse.json({ error: "No autorizado." }, { status: 403 });
      }
      if (
        !existing.guardian_user_id &&
        existing.fields.guardian_email &&
        user.email &&
        existing.fields.guardian_email !== user.email.toLowerCase()
      ) {
        return NextResponse.json(
          { error: "Este correo no coincide con la carta enviada." },
          { status: 403 },
        );
      }

      const meta = clientMeta(request);
      const agreement = await acceptGphAgreementAsTutor(admin, {
        agreementId,
        guardianUserId: user.id,
        acceptorName:
          String(body.acceptor_name ?? "").trim() ||
          user.user_metadata?.full_name ||
          user.email ||
          "Tutor",
        acceptorEmail: user.email,
        ip: meta.ip,
        userAgent: meta.userAgent,
      });

      // PDF preliminar tras firma tutor (se regenera al contrafirmar).
      const pdf = buildGphAgreementPdfBytes(agreement);
      const path = await uploadSealedAgreementPdf(admin, agreement.id, pdf);
      const withPdf = await setGphAgreementSealedPdf(admin, agreement.id, path);
      void notifyGphAgreementSigned(withPdf);

      return NextResponse.json({ ok: true, agreement: withPdf });
    }

    return NextResponse.json({ error: "Acción no reconocida." }, { status: 400 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "No se pudo firmar.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

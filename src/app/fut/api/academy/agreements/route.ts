import { NextResponse } from "next/server";
import {
  assertCanManageGphAgreements,
  cancelGphAgreement,
  correctGphAgreementParties,
  countersignGphAgreement,
  createGphAgreementDraft,
  getGphAgreement,
  listGphAgreementsForAcademy,
  resolveGphAcademy,
  sendGphAgreement,
  setGphAgreementSealedPdf,
  updateGphAgreementDraft,
  uploadSealedAgreementPdf,
} from "@/lib/gph-agreements";
import { buildGphAgreementPdfBytes } from "@/lib/gph-agreement-pdf";
import {
  notifyAgreementActive,
  notifyTutorAgreementSent,
} from "@/lib/email/gph-agreement-notify";
import { listTutorLinksByAcademy } from "@/lib/tutor-family";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { getAuthedSupabaseClient } from "@/lib/supabase-server";

export async function GET(request: Request) {
  const supabase = await getAuthedSupabaseClient(request);
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Inicia sesión." }, { status: 401 });

  try {
    const admin = createSupabaseAdminClient();
    const academy = await resolveGphAcademy(admin);
    await assertCanManageGphAgreements(admin, user, academy.id);

    const url = new URL(request.url);
    const id = url.searchParams.get("id")?.trim();
    if (id) {
      const agreement = await getGphAgreement(admin, id);
      if (!agreement || agreement.academy_id !== academy.id) {
        return NextResponse.json({ error: "No encontrado." }, { status: 404 });
      }
      return NextResponse.json({ agreement });
    }

    const [agreements, links, playersResult] = await Promise.all([
      listGphAgreementsForAcademy(admin, academy.id),
      listTutorLinksByAcademy(admin, academy.id),
      admin
        .from("players")
        .select("id, first_name, last_name, birth_date, guardian_name, guardian_phone, guardian_email")
        .eq("academy_id", academy.id)
        .order("last_name", { ascending: true }),
    ]);

    return NextResponse.json({
      academy: { id: academy.id, name: academy.name, slug: academy.slug },
      agreements,
      links,
      players: playersResult.data ?? [],
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "No se pudo cargar.";
    const status = message.includes("autorizado") || message.includes("solo aplica") ? 403 : 400;
    return NextResponse.json({ error: message }, { status });
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
    player_id?: string;
    tutor_child_id?: string;
    guardian_user_id?: string;
    fields?: Record<string, unknown>;
    guardian_name?: string;
    acceptor_name?: string;
  };

  try {
    const admin = createSupabaseAdminClient();
    const academy = await resolveGphAcademy(admin);
    await assertCanManageGphAgreements(admin, user, academy.id);

    if (body.action === "create") {
      const agreement = await createGphAgreementDraft(admin, {
        academyId: academy.id,
        createdBy: user.id,
        playerId: body.player_id,
        tutorChildId: body.tutor_child_id,
        guardianUserId: body.guardian_user_id,
        fields: (body.fields ?? {}) as never,
      });
      return NextResponse.json({ ok: true, agreement });
    }

    const agreementId = String(body.agreement_id ?? "").trim();
    if (!agreementId) {
      return NextResponse.json({ error: "agreement_id es obligatorio." }, { status: 400 });
    }

    if (body.action === "update") {
      const agreement = await updateGphAgreementDraft(admin, {
        agreementId,
        fields: body.fields as never,
        playerId: body.player_id,
        tutorChildId: body.tutor_child_id,
        guardianUserId: body.guardian_user_id,
      });
      return NextResponse.json({ ok: true, agreement });
    }

    if (body.action === "send") {
      const agreement = await sendGphAgreement(admin, agreementId);
      void notifyTutorAgreementSent(agreement);
      return NextResponse.json({ ok: true, agreement });
    }

    if (body.action === "countersign") {
      let agreement = await countersignGphAgreement(admin, {
        agreementId,
        userId: user.id,
        name: user.user_metadata?.full_name || user.email || "GPH",
        email: user.email,
      });
      const pdf = buildGphAgreementPdfBytes(agreement);
      const path = await uploadSealedAgreementPdf(admin, agreement.id, pdf);
      agreement = await setGphAgreementSealedPdf(admin, agreement.id, path);
      void notifyAgreementActive(agreement);
      return NextResponse.json({ ok: true, agreement });
    }

    if (body.action === "cancel") {
      const agreement = await cancelGphAgreement(admin, agreementId);
      return NextResponse.json({ ok: true, agreement });
    }

    if (body.action === "correct_parties") {
      let agreement = await correctGphAgreementParties(admin, {
        agreementId,
        guardianName: body.guardian_name,
        acceptorName: body.acceptor_name,
      });
      // Si ya había PDF sellado, regenerarlo con los nombres corregidos.
      if (agreement.status === "active" || agreement.status === "signed_tutor") {
        const pdf = buildGphAgreementPdfBytes(agreement);
        const path = await uploadSealedAgreementPdf(admin, agreement.id, pdf);
        agreement = await setGphAgreementSealedPdf(admin, agreement.id, path);
      }
      return NextResponse.json({ ok: true, agreement });
    }

    return NextResponse.json({ error: "Acción no reconocida." }, { status: 400 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "No se pudo guardar.";
    const status = message.includes("autorizado") || message.includes("solo aplica") ? 403 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}

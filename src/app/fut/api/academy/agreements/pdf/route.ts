import { NextResponse } from "next/server";
import {
  assertCanManageGphAgreements,
  downloadSealedAgreementPdf,
  getGphAgreement,
  resolveGphAcademy,
  setGphAgreementSealedPdf,
  uploadSealedAgreementPdf,
} from "@/lib/gph-agreements";
import { buildGphAgreementPdfBytes } from "@/lib/gph-agreement-pdf";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { getAuthedSupabaseClient } from "@/lib/supabase-server";

export async function GET(request: Request) {
  const supabase = await getAuthedSupabaseClient(request);
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Inicia sesión." }, { status: 401 });

  const id = new URL(request.url).searchParams.get("id")?.trim();
  if (!id) return NextResponse.json({ error: "id es obligatorio." }, { status: 400 });

  try {
    const admin = createSupabaseAdminClient();
    const academy = await resolveGphAcademy(admin);
    await assertCanManageGphAgreements(admin, user, academy.id);
    let agreement = await getGphAgreement(admin, id);
    if (!agreement || agreement.academy_id !== academy.id) {
      return NextResponse.json({ error: "No encontrado." }, { status: 404 });
    }

    let bytes: Buffer;
    if (agreement.sealed_pdf_path) {
      bytes = await downloadSealedAgreementPdf(admin, agreement.sealed_pdf_path);
    } else {
      const pdf = buildGphAgreementPdfBytes(agreement);
      const path = await uploadSealedAgreementPdf(admin, agreement.id, pdf);
      agreement = await setGphAgreementSealedPdf(admin, agreement.id, path);
      bytes = Buffer.from(pdf);
    }

    return new NextResponse(new Uint8Array(bytes), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="gph-carta-${agreement.fields.player_name.replace(/\s+/g, "-").toLowerCase()}.pdf"`,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "No se pudo descargar.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

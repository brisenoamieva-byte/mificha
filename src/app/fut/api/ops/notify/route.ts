import { NextResponse } from "next/server";
import {
  fireAndForgetOpsNotify,
  type OpsNotifyKind,
} from "@/lib/email/ops-notify";
import { getAuthedSupabaseClient } from "@/lib/supabase-server";

const ALLOWED: OpsNotifyKind[] = [
  "tutor_signup",
  "academy_created",
  "diagnosis_paid",
];

export async function POST(request: Request) {
  const supabase = await getAuthedSupabaseClient(request);
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "No autenticado." }, { status: 401 });
  }

  const body = (await request.json().catch(() => ({}))) as {
    kind?: string;
    subject?: string;
    details?: Record<string, string | null | undefined>;
  };

  const kind = body.kind as OpsNotifyKind | undefined;
  if (!kind || !ALLOWED.includes(kind)) {
    return NextResponse.json({ error: "Evento inválido." }, { status: 400 });
  }

  const details = body.details ?? {};
  const lines: Array<[string, string | null | undefined]> = [
    ["Cuenta", user.email ?? user.id],
    ...Object.entries(details),
  ];

  const subject =
    body.subject?.trim() ||
    (kind === "tutor_signup"
      ? `Nuevo tutor · ${user.email ?? "sin correo"}`
      : kind === "academy_created"
        ? `Nueva academia · ${details.Nombre ?? user.email ?? "sin nombre"}`
        : `Pago evaluación GPH · ${details.Folio ?? "sin folio"}`);

  fireAndForgetOpsNotify({ kind, subject, lines });

  return NextResponse.json({ ok: true });
}

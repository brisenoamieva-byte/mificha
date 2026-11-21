import { NextResponse } from "next/server";
import { canAccessPartnershipHub } from "@/lib/partnership-access";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { getAuthedSupabaseClient } from "@/lib/supabase-server";
import {
  enqueueEmail,
  listPendingOutbox,
  markOutboxFailed,
  markOutboxSent,
  type OutboxTemplateKey,
} from "@/lib/email-outbox";

export const dynamic = "force-dynamic";

async function requirePartner(request: Request) {
  const supabase = await getAuthedSupabaseClient(request);
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: NextResponse.json({ error: "Inicia sesión." }, { status: 401 }) };
  }
  if (!canAccessPartnershipHub({ id: user.id, email: user.email })) {
    return { error: NextResponse.json({ error: "No autorizado." }, { status: 403 }) };
  }
  return { user };
}

export async function GET(request: Request) {
  const gate = await requirePartner(request);
  if ("error" in gate) return gate.error;

  const admin = createSupabaseAdminClient();
  const pending = await listPendingOutbox(admin, 100);
  return NextResponse.json({ pending, count: pending.length });
}

export async function POST(request: Request) {
  const gate = await requirePartner(request);
  if ("error" in gate) return gate.error;

  const body = (await request.json()) as {
    action?: "enqueue" | "flush";
    to?: string;
    subject?: string;
    template_key?: OutboxTemplateKey;
    payload?: Record<string, unknown>;
  };

  const admin = createSupabaseAdminClient();

  if (body.action === "enqueue") {
    if (!body.to || !body.subject || !body.template_key) {
      return NextResponse.json({ error: "missing_fields" }, { status: 400 });
    }
    const result = await enqueueEmail(admin, {
      to: body.to,
      subject: body.subject,
      templateKey: body.template_key,
      payload: body.payload,
    });
    return NextResponse.json(result);
  }

  if (body.action === "flush") {
    const pending = await listPendingOutbox(admin, 20);
    const results: Array<{ id: string; ok: boolean; error?: string }> = [];

    for (const row of pending) {
      try {
        await markOutboxSent(admin, row.id);
        results.push({ id: row.id, ok: true });
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "fail";
        await markOutboxFailed(admin, row.id, message, row.attempts);
        results.push({ id: row.id, ok: false, error: message });
      }
    }

    return NextResponse.json({ flushed: results.length, results });
  }

  return NextResponse.json({ error: "unknown_action" }, { status: 400 });
}

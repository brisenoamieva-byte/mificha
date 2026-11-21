import type { SupabaseClient } from "@supabase/supabase-js";

export type OutboxTemplateKey =
  | "consent_nudge"
  | "visoria_horarios"
  | "visoria_ficha"
  | "generic";

export async function enqueueEmail(
  admin: SupabaseClient,
  input: {
    to: string;
    subject: string;
    templateKey: OutboxTemplateKey;
    payload?: Record<string, unknown>;
    scheduledAt?: string;
  },
): Promise<{ id: string | null; error?: string }> {
  const { data, error } = await admin
    .from("email_outbox")
    .insert({
      to_email: input.to.trim().toLowerCase(),
      subject: input.subject,
      template_key: input.templateKey,
      payload: input.payload ?? {},
      scheduled_at: input.scheduledAt ?? new Date().toISOString(),
      status: "pending",
    })
    .select("id")
    .maybeSingle();

  if (error) {
    if (/does not exist|schema cache/i.test(error.message)) {
      return { id: null, error: "email_outbox_missing" };
    }
    return { id: null, error: error.message };
  }
  return { id: data?.id ?? null };
}

export async function listPendingOutbox(
  admin: SupabaseClient,
  limit = 50,
): Promise<
  Array<{
    id: string;
    to_email: string;
    subject: string;
    template_key: string;
    payload: Record<string, unknown>;
    attempts: number;
  }>
> {
  const { data, error } = await admin
    .from("email_outbox")
    .select("id, to_email, subject, template_key, payload, attempts")
    .eq("status", "pending")
    .lte("scheduled_at", new Date().toISOString())
    .order("scheduled_at", { ascending: true })
    .limit(limit);

  if (error || !data) return [];
  return data.map((row) => ({
    id: String(row.id),
    to_email: String(row.to_email),
    subject: String(row.subject),
    template_key: String(row.template_key),
    payload: (row.payload as Record<string, unknown>) ?? {},
    attempts: Number(row.attempts) || 0,
  }));
}

export async function markOutboxSent(
  admin: SupabaseClient,
  id: string,
): Promise<void> {
  await admin
    .from("email_outbox")
    .update({
      status: "sent",
      sent_at: new Date().toISOString(),
    })
    .eq("id", id);
}

export async function markOutboxFailed(
  admin: SupabaseClient,
  id: string,
  lastError: string,
  attempts: number,
): Promise<void> {
  await admin
    .from("email_outbox")
    .update({
      status: attempts >= 5 ? "failed" : "pending",
      attempts: attempts + 1,
      last_error: lastError.slice(0, 500),
    })
    .eq("id", id);
}

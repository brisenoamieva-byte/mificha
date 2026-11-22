/**
 * Backfill dual-write: roster.json → public.tutor_children
 * Requiere SUPABASE_URL + SERVICE_ROLE y haber corrido supabase/tutor-children-moat.sql
 *
 *   node --env-file=.env.local tmp/sync-tutor-children-pg.mjs
 */
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("Missing Supabase env");
  process.exit(1);
}

const admin = createClient(url, key, { auth: { persistSession: false } });
const { data, error } = await admin.storage
  .from("mificha-ops")
  .download("families/roster.json");
if (error || !data) {
  console.error("roster download", error?.message);
  process.exit(1);
}

const roster = JSON.parse(await data.text());
if (!Array.isArray(roster)) {
  console.error("roster invalid");
  process.exit(1);
}

let ok = 0;
let fail = 0;
for (const child of roster) {
  const guardianId =
    typeof child.guardian_user_id === "string" && child.guardian_user_id.trim()
      ? child.guardian_user_id.trim()
      : null;
  const row = {
    id: child.id,
    guardian_user_id: guardianId,
    guardian_email: (child.guardian_email ?? "").trim().toLowerCase() || null,
    guardian_phone: child.guardian_phone || null,
    player_name: child.player_name,
    public_code: child.public_code || null,
    share_token: child.share_token || null,
    explore_opt_in: Boolean(child.explore_opt_in),
    explore_opt_in_at: child.explore_opt_in_at,
    birth_date: child.profile?.birth_date || null,
    position: child.profile?.position || null,
    city: child.profile?.city || null,
    state: child.profile?.state || null,
    club: child.profile?.club || null,
    profile: child.profile ?? {},
    linked_player_id: child.linked_player_id || null,
    linked_academy_id: child.linked_academy_id || null,
    source:
      Array.isArray(child.source_folios) && child.source_folios.length
        ? "visoria"
        : "tutor",
    updated_at: new Date().toISOString(),
    created_at: child.created_at || new Date().toISOString(),
  };
  let { error: upErr } = await admin.from("tutor_children").upsert(row, {
    onConflict: "id",
  });
  // Código MF duplicado en roster: guarda la fila sin código (se reasigna después).
  if (upErr && /public_code|unique/i.test(upErr.message)) {
    row.public_code = null;
    ({ error: upErr } = await admin.from("tutor_children").upsert(row, {
      onConflict: "id",
    }));
    if (!upErr) {
      console.warn(child.id, "saved without duplicate public_code");
    }
  }
  if (upErr) {
    fail += 1;
    console.warn(child.id, upErr.message);
  } else {
    ok += 1;
  }
}

console.log(JSON.stringify({ ok, fail, total: roster.length }, null, 2));

import fs from "fs";
import path from "path";
import { createClient } from "@supabase/supabase-js";
import { fileURLToPath } from "url";
import { randomUUID } from "crypto";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
for (const line of fs.readFileSync(path.join(__dirname, "..", ".env.local"), "utf8").split(/\r?\n/)) {
  const match = line.match(/^([A-Z0-9_]+)=(.*)$/);
  if (!match) continue;
  let value = match[2].trim();
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    value = value.slice(1, -1);
  }
  process.env[match[1]] = value;
}

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false, autoRefreshToken: false } },
);

const RICARDO_ID = "73e9a159-e464-42b5-a29d-51c678e83813";
const RICARDO_EMAIL = "brisenoamieva@gmail.com";
const OPS = "mificha-ops";

const { data: nortenios } = await admin
  .from("academies")
  .select("id,slug")
  .eq("slug", "academia-nortenios")
  .maybeSingle();
const { data: gph } = await admin
  .from("academies")
  .select("id,slug,owner_id")
  .eq("slug", "academia-gph")
  .maybeSingle();

if (!gph) throw new Error("GPH missing");

async function grantAccess() {
  const { data: existing } = await admin
    .from("academy_members")
    .select("id,status")
    .eq("academy_id", gph.id)
    .eq("user_id", RICARDO_ID)
    .maybeSingle();
  if (existing?.status === "active") {
    console.log("access already active");
    return;
  }
  if (existing) {
    const { error } = await admin
      .from("academy_members")
      .update({
        status: "active",
        accepted_at: new Date().toISOString(),
        invited_email: RICARDO_EMAIL,
        invited_name: "Ricardo Briseño",
      })
      .eq("id", existing.id);
    if (error) throw error;
    console.log("reactivated access");
    return;
  }
  const { error } = await admin.from("academy_members").insert({
    id: randomUUID(),
    academy_id: gph.id,
    user_id: RICARDO_ID,
    invited_email: RICARDO_EMAIL,
    invited_name: "Ricardo Briseño",
    role: "staff",
    status: "active",
    invited_by: gph.owner_id,
    accepted_at: new Date().toISOString(),
  });
  if (error) throw error;
  console.log("granted GPH staff access");
}

if (!nortenios) {
  console.log("nortenios already gone");
  await grantAccess();
  process.exit(0);
}

const academyId = nortenios.id;

// Reasignar actas a GPH para soltar FK restrict
const { error: actaHomeErr } = await admin
  .from("match_acta_sessions")
  .update({ home_academy_id: gph.id })
  .eq("home_academy_id", academyId);
console.log("acta home reassign", actaHomeErr?.message ?? "ok");

const { error: actaAwayErr } = await admin
  .from("match_acta_sessions")
  .update({ away_academy_id: null })
  .eq("away_academy_id", academyId);
console.log("acta away clear", actaAwayErr?.message ?? "ok");

// Soft-hide si el hard delete sigue bloqueado: quitar del producto
const { data: players } = await admin.from("players").select("id").eq("academy_id", academyId);
const playerIds = (players ?? []).map((p) => String(p.id));

for (const table of ["match_stats", "player_season_stats", "player_achievements", "player_profile_views", "player_videos", "email_logs"]) {
  if (!playerIds.length) break;
  const { error } = await admin.from(table).delete().in("player_id", playerIds);
  console.log(`cleanup ${table}`, error?.message ?? "ok");
}

const { error: playersDel } = await admin.from("players").delete().eq("academy_id", academyId);
console.log("players delete", playersDel?.message ?? `ok (${playerIds.length})`);

const { error: matchesUpd } = await admin
  .from("matches")
  .update({ academy_id: gph.id })
  .eq("academy_id", academyId);
console.log("matches reassign", matchesUpd?.message ?? "ok");

const { error: seasonsUpd } = await admin
  .from("seasons")
  .update({ academy_id: gph.id })
  .eq("academy_id", academyId);
console.log("seasons reassign", seasonsUpd?.message ?? "ok");

const { error: delErr } = await admin.from("academies").delete().eq("id", academyId);
if (delErr) {
  console.log("hard delete failed, soft-removing from product:", delErr.message);
  const { error: softErr } = await admin
    .from("academies")
    .update({
      name: "ELIMINADA Norteños",
      slug: `eliminada-nortenios-${Date.now().toString(36)}`,
      is_public: false,
      is_certified: false,
      owner_id: gph.owner_id,
    })
    .eq("id", academyId);
  if (softErr) throw softErr;
  console.log("soft-removed nortenios");
} else {
  console.log("deleted nortenios");
}

if (playerIds.length) {
  const { data, error } = await admin.storage
    .from(OPS)
    .download("families/player-public-codes.json");
  if (!error && data) {
    try {
      const map = JSON.parse(await data.text());
      let removed = 0;
      for (const id of playerIds) {
        if (map[id]) {
          delete map[id];
          removed += 1;
        }
      }
      if (removed) {
        await admin.storage.from(OPS).upload(
          "families/player-public-codes.json",
          Buffer.from(JSON.stringify(map)),
          { upsert: true, contentType: "application/json" },
        );
      }
      console.log("codes cleaned", removed);
    } catch {
      /* ignore */
    }
  }
}

await grantAccess();

const { data: remaining } = await admin.from("academies").select("name,slug,owner_id,is_public");
const { data: membership } = await admin
  .from("academy_members")
  .select("status,role,academy_id")
  .eq("user_id", RICARDO_ID)
  .eq("status", "active");
console.log(
  JSON.stringify(
    {
      remaining: remaining,
      ricardo_memberships: membership,
      login: RICARDO_EMAIL,
      plantel: "https://www.mificha.mx/fut/dashboard/plantel",
    },
    null,
    2,
  ),
);

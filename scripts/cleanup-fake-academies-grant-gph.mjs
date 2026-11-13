/**
 * Elimina academias fake (Norteños, Rickys fut, Gallos vacío)
 * y da acceso staff a Ricardo en Academia Real GPH.
 *
 * node scripts/cleanup-fake-academies-grant-gph.mjs
 */
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

const FAKE_SLUGS = ["academia-nortenios", "rickys-fut", "academia-gallos"];
const RICARDO_ID = "73e9a159-e464-42b5-a29d-51c678e83813";
const RICARDO_EMAIL = "brisenoamieva@gmail.com";
const OPS = "mificha-ops";

async function readPlayerCodeMap() {
  const { data, error } = await admin.storage
    .from(OPS)
    .download("families/player-public-codes.json");
  if (error || !data) return {};
  try {
    const parsed = JSON.parse(await data.text());
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {};
  } catch {
    return {};
  }
}

async function writePlayerCodeMap(map) {
  const body = Buffer.from(JSON.stringify(map));
  const { error } = await admin.storage
    .from(OPS)
    .upload("families/player-public-codes.json", body, {
      upsert: true,
      contentType: "application/json",
    });
  if (error) throw new Error(error.message);
}

async function deleteAcademyHard(academyId, slug) {
  const { data: players } = await admin
    .from("players")
    .select("id")
    .eq("academy_id", academyId);
  const playerIds = (players ?? []).map((p) => String(p.id));

  // Dependencias que no siempre tienen ON DELETE CASCADE.
  const tablesByAcademy = [
    "match_acta_sessions",
    "player_diagnoses",
    "matches",
    "seasons",
    "email_logs",
    "academy_members",
    "platform_fixtures",
  ];
  for (const table of tablesByAcademy) {
    const { error } = await admin.from(table).delete().eq("academy_id", academyId);
    if (error && !/does not exist|Could not find|42703|42P01/i.test(error.message)) {
      // Algunas tablas usan home_academy_id / away_academy_id
      if (table === "match_acta_sessions") {
        await admin.from(table).delete().eq("home_academy_id", academyId);
        await admin.from(table).delete().eq("away_academy_id", academyId);
      } else if (table === "platform_fixtures") {
        await admin.from(table).delete().eq("home_academy_id", academyId);
        await admin.from(table).delete().eq("away_academy_id", academyId);
      } else {
        console.warn(`warn ${table}: ${error.message}`);
      }
    }
  }

  // Acta sessions by home/away specifically
  await admin.from("match_acta_sessions").delete().eq("home_academy_id", academyId);
  await admin.from("match_acta_sessions").delete().eq("away_academy_id", academyId);

  if (playerIds.length) {
    for (const table of [
      "match_stats",
      "player_season_stats",
      "player_diagnoses",
      "player_achievements",
      "player_profile_views",
      "player_videos",
    ]) {
      const { error } = await admin.from(table).delete().in("player_id", playerIds);
      if (error && !/does not exist|Could not find|42703|42P01/i.test(error.message)) {
        console.warn(`warn ${table} players: ${error.message}`);
      }
    }
    const { error: playersErr } = await admin.from("players").delete().eq("academy_id", academyId);
    if (playersErr) console.warn(`warn players: ${playersErr.message}`);
  }

  const { error: delErr } = await admin.from("academies").delete().eq("id", academyId);
  if (delErr) throw new Error(`No se pudo borrar ${slug}: ${delErr.message}`);
  return playerIds;
}

const { data: academies, error: acadErr } = await admin
  .from("academies")
  .select("id,name,slug,owner_id");
if (acadErr) throw acadErr;

const fake = (academies ?? []).filter((a) => FAKE_SLUGS.includes(a.slug));
const gph = (academies ?? []).find((a) => a.slug === "academia-gph");
if (!gph) throw new Error("No está Academia Real GPH");

const deletedPlayerIds = [];
for (const academy of fake) {
  const ids = await deleteAcademyHard(academy.id, academy.slug);
  deletedPlayerIds.push(...ids);
  console.log(`deleted academy ${academy.slug}`);
}

if (deletedPlayerIds.length) {
  const map = await readPlayerCodeMap();
  let removed = 0;
  for (const id of deletedPlayerIds) {
    if (map[id]) {
      delete map[id];
      removed += 1;
    }
  }
  if (removed) await writePlayerCodeMap(map);
  console.log(`cleaned ${removed} player public codes`);
}

const { data: existing } = await admin
  .from("academy_members")
  .select("id,status,user_id")
  .eq("academy_id", gph.id)
  .eq("user_id", RICARDO_ID)
  .maybeSingle();

if (existing?.status === "active") {
  console.log("Ricardo already active staff on GPH");
} else if (existing) {
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
  console.log("reactivated Ricardo as GPH staff");
} else {
  const { data: byEmail } = await admin
    .from("academy_members")
    .select("id,status")
    .eq("academy_id", gph.id)
    .ilike("invited_email", RICARDO_EMAIL)
    .maybeSingle();

  if (byEmail) {
    const { error } = await admin
      .from("academy_members")
      .update({
        user_id: RICARDO_ID,
        status: "active",
        accepted_at: new Date().toISOString(),
        invited_name: "Ricardo Briseño",
      })
      .eq("id", byEmail.id);
    if (error) throw error;
    console.log("accepted pending invite / linked Ricardo to GPH staff");
  } else {
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
    console.log("inserted Ricardo as active GPH staff");
  }
}

const { data: remaining } = await admin
  .from("academies")
  .select("id,name,slug,owner_id");
const ricardoOwned = (remaining ?? []).filter((a) => a.owner_id === RICARDO_ID);
const { data: membership } = await admin
  .from("academy_members")
  .select("academy_id,status,role")
  .eq("user_id", RICARDO_ID)
  .eq("status", "active");

console.log(
  JSON.stringify(
    {
      remaining_academies: (remaining ?? []).map((a) => ({ slug: a.slug, name: a.name })),
      ricardo_still_owns: ricardoOwned.map((a) => a.slug),
      ricardo_memberships: membership,
      login: RICARDO_EMAIL,
      dashboard: "https://www.mificha.mx/fut/dashboard/plantel",
    },
    null,
    2,
  ),
);

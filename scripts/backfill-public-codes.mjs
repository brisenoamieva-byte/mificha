/**
 * Asigna códigos MF-XXXX a:
 * - todos los jugadores de plantel (players)
 * - todos los inscritos a visorías
 * - fichas tutor sin código
 *
 * node scripts/backfill-public-codes.mjs
 */
import fs from "fs";
import path from "path";
import { createClient } from "@supabase/supabase-js";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const envPath = path.join(__dirname, "..", ".env.local");
for (const line of fs.readFileSync(envPath, "utf8").split(/\r?\n/)) {
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

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("Faltan NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const admin = createClient(url, key, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const OPS = "mificha-ops";
const ALPHABET = "23456789ABCDEFGHJKMNPQRSTVWXYZ";

function normalize(code) {
  const clean = String(code ?? "")
    .trim()
    .toUpperCase()
    .replace(/\s+/g, "");
  return /^MF-[23456789ABCDEFGHJKMNPQRSTVWXYZ]{4}$/.test(clean) ? clean : null;
}

function mint(used) {
  for (let attempt = 0; attempt < 40; attempt += 1) {
    let body = "";
    for (let i = 0; i < 4; i += 1) {
      body += ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
    }
    const code = `MF-${body}`;
    if (!used.has(code)) {
      used.add(code);
      return code;
    }
  }
  throw new Error("No se pudo mintar código");
}

async function readMap(file) {
  const { data, error } = await admin.storage.from(OPS).download(file);
  if (error || !data) return {};
  try {
    const parsed = JSON.parse(await data.text());
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return {};
    const out = {};
    for (const [id, code] of Object.entries(parsed)) {
      const n = normalize(code);
      if (id && n) out[id] = n;
    }
    return out;
  } catch {
    return {};
  }
}

async function writeMap(file, map) {
  const body = Buffer.from(JSON.stringify(map));
  const { error } = await admin.storage.from(OPS).upload(file, body, {
    upsert: true,
    contentType: "application/json",
  });
  if (error) throw new Error(`${file}: ${error.message}`);
}

async function readRoster() {
  const { data, error } = await admin.storage.from(OPS).download("families/roster.json");
  if (error || !data) return [];
  try {
    const parsed = JSON.parse(await data.text());
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function writeRoster(rows) {
  const body = Buffer.from(JSON.stringify(rows));
  const { error } = await admin.storage.from(OPS).upload("families/roster.json", body, {
    upsert: true,
    contentType: "application/json",
  });
  if (error) throw new Error(`roster: ${error.message}`);
}

async function listVisoriaIds() {
  const { data, error } = await admin
    .from("visoria_registrations")
    .select("id")
    .eq("event_id", "queretaro-nov-2026");
  if (!error && data?.length) return data.map((row) => String(row.id));

  const { data: file } = await admin.storage
    .from(OPS)
    .download("visorias/queretaro-nov-2026.json");
  if (!file) return [];
  try {
    const parsed = JSON.parse(await file.text());
    return Array.isArray(parsed) ? parsed.map((row) => String(row.id)).filter(Boolean) : [];
  } catch {
    return [];
  }
}

async function main() {
  const { data: players, error: playersError } = await admin.from("players").select("id");
  if (playersError) throw new Error(playersError.message);
  const playerIds = (players ?? []).map((row) => String(row.id));

  const roster = await readRoster();
  const visoriaIds = await listVisoriaIds();

  const playerMap = await readMap("families/player-public-codes.json");
  const visoriaMap = await readMap("visorias/public-codes.json");

  const used = new Set([
    ...Object.values(playerMap),
    ...Object.values(visoriaMap),
    ...roster.map((child) => normalize(child.public_code)).filter(Boolean),
  ]);

  let playersAssigned = 0;
  for (const id of playerIds) {
    if (normalize(playerMap[id])) continue;
    playerMap[id] = mint(used);
    playersAssigned += 1;
  }

  let visoriaAssigned = 0;
  for (const id of visoriaIds) {
    if (normalize(visoriaMap[id])) continue;
    visoriaMap[id] = mint(used);
    visoriaAssigned += 1;
  }

  let tutorAssigned = 0;
  const nextRoster = roster.map((child) => {
    if (normalize(child.public_code)) return child;
    tutorAssigned += 1;
    return { ...child, public_code: mint(used) };
  });

  if (playersAssigned) await writeMap("families/player-public-codes.json", playerMap);
  if (visoriaAssigned) await writeMap("visorias/public-codes.json", visoriaMap);
  if (tutorAssigned) await writeRoster(nextRoster);

  console.log(
    JSON.stringify(
      {
        players_total: playerIds.length,
        players_new_codes: playersAssigned,
        visoria_total: visoriaIds.length,
        visoria_new_codes: visoriaAssigned,
        tutor_total: roster.length,
        tutor_new_codes: tutorAssigned,
      },
      null,
      2,
    ),
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

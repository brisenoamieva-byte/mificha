/**
 * Audita unicidad de códigos MF y reconstruye el registro global.
 * node scripts/audit-public-codes.mjs
 */
import fs from "fs";
import path from "path";
import { createClient } from "@supabase/supabase-js";
import { fileURLToPath } from "url";

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

const OPS = "mificha-ops";
const ALPHABET = "23456789ABCDEFGHJKMNPQRSTVWXYZ";
const PATTERN = new RegExp(`^MF-[${ALPHABET}]{4,6}$`);

function normalize(code) {
  const clean = String(code ?? "")
    .trim()
    .toUpperCase()
    .replace(/\s+/g, "");
  return PATTERN.test(clean) ? clean : null;
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

async function readTutorMap() {
  const { data, error } = await admin.storage.from(OPS).download("families/roster.json");
  if (error || !data) return {};
  try {
    const parsed = JSON.parse(await data.text());
    if (!Array.isArray(parsed)) return {};
    const out = {};
    for (const child of parsed) {
      const n = normalize(child.public_code);
      if (child.id && n) out[child.id] = n;
    }
    return out;
  } catch {
    return {};
  }
}

const players = await readMap("families/player-public-codes.json");
const visoria = await readMap("visorias/public-codes.json");
const tutors = await readTutorMap();

const owners = new Map();
const collisions = [];

function claim(code, kind, id) {
  const prev = owners.get(code);
  if (prev && (prev.kind !== kind || prev.id !== id)) {
    collisions.push({ code, a: prev, b: { kind, id } });
    return;
  }
  owners.set(code, { kind, id });
}

for (const [id, code] of Object.entries(players)) claim(code, "player", id);
for (const [id, code] of Object.entries(tutors)) claim(code, "tutor", id);
for (const [id, code] of Object.entries(visoria)) claim(code, "visoria", id);

const registry = {};
const now = new Date().toISOString();
for (const [code, owner] of owners.entries()) {
  registry[code] = { ...owner, updated_at: now };
}

await admin.storage.from(OPS).upload(
  "families/public-code-registry.json",
  Buffer.from(JSON.stringify(registry)),
  { upsert: true, contentType: "application/json" },
);

console.log(
  JSON.stringify(
    {
      players: Object.keys(players).length,
      tutors: Object.keys(tutors).length,
      visoria: Object.keys(visoria).length,
      unique_codes: owners.size,
      collisions: collisions.length,
      collision_details: collisions.slice(0, 20),
      format: "MF- + 4..6 (nuevos: 5 chars ≈ 33.5M)",
      registry: "families/public-code-registry.json",
    },
    null,
    2,
  ),
);

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

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false, autoRefreshToken: false } },
);

const { data: players, error } = await admin
  .from("players")
  .select(
    "id,first_name,last_name,slug,academy_id,is_public,created_at,academies(name,slug,is_certified,is_public)",
  )
  .order("last_name");

if (error) throw error;

const by = {};
for (const p of players ?? []) {
  const a = Array.isArray(p.academies) ? p.academies[0] : p.academies;
  const key = a
    ? `${a.name} [${a.slug}]`
    : `(sin academia) ${p.academy_id}`;
  if (!by[key]) {
    by[key] = {
      certified: Boolean(a?.is_certified),
      publicAcademy: Boolean(a?.is_public),
      players: [],
    };
  }
  by[key].players.push({
    name: `${p.first_name} ${p.last_name}`,
    slug: p.slug,
    public: p.is_public,
  });
}

console.log(`TOTAL ${players?.length ?? 0}`);
for (const [k, v] of Object.entries(by).sort(
  (a, b) => b[1].players.length - a[1].players.length,
)) {
  console.log(
    `\n=== ${k} | cert=${v.certified} public=${v.publicAcademy} | n=${v.players.length}`,
  );
  for (const p of v.players) {
    console.log(`- ${p.name}${p.public ? "" : " (privado)"}`);
  }
}

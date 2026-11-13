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

const { data: academies } = await admin
  .from("academies")
  .select("id,slug,name")
  .or("slug.ilike.eliminada-%,name.ilike.ELIMINADA%");

for (const a of academies ?? []) {
  const { data: players, error } = await admin
    .from("players")
    .update({ is_public: false })
    .eq("academy_id", a.id)
    .select("id,first_name,last_name");
  console.log(a.slug, error?.message ?? `hidden ${(players ?? []).length} players`, players);
}

const { data: all } = await admin.from("academies").select("name,slug,is_public");
const { count } = await admin
  .from("players")
  .select("id", { count: "exact", head: true })
  .eq(
    "academy_id",
    (
      await admin.from("academies").select("id").eq("slug", "academia-gph").single()
    ).data.id,
  );
console.log({ academies: all, gph_players: count });

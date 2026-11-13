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

const { data: academy } = await admin
  .from("academies")
  .select("id,slug,name")
  .eq("slug", "academia-nortenios")
  .maybeSingle();
console.log("academy", academy);
if (!academy) process.exit(0);

const id = academy.id;
for (const [table, col] of [
  ["match_acta_sessions", "home_academy_id"],
  ["match_acta_sessions", "away_academy_id"],
  ["matches", "academy_id"],
  ["seasons", "academy_id"],
  ["players", "academy_id"],
  ["player_diagnoses", "academy_id"],
]) {
  const { data, error } = await admin.from(table).select("id").eq(col, id).limit(5);
  console.log(table, col, { count: data?.length, error: error?.message, sample: data });
}

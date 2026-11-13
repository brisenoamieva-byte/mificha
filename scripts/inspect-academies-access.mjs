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

const { data: academies, error } = await admin
  .from("academies")
  .select("id,name,slug,owner_id,is_public,is_certified");
console.log("ERR", error);
for (const a of academies ?? []) {
  const { count } = await admin
    .from("players")
    .select("id", { count: "exact", head: true })
    .eq("academy_id", a.id);
  console.log({
    name: a.name,
    slug: a.slug,
    owner_id: a.owner_id,
    public: a.is_public,
    cert: a.is_certified,
    players: count,
  });
}

const gph = (academies ?? []).find(
  (a) => a.slug === "academia-gph" || /gph/i.test(a.slug) || /gph/i.test(a.name),
);
if (gph) {
  const { data: owner } = await admin
    .from("profiles")
    .select("id,email,full_name,role")
    .eq("id", gph.owner_id)
    .maybeSingle();
  console.log("GPH_OWNER", owner);

  const { data: members, error: memErr } = await admin
    .from("academy_members")
    .select("*")
    .eq("academy_id", gph.id);
  console.log("MEM_ERR", memErr?.message);
  console.log("GPH_MEMBERS", members);
}

const { data: ricardo } = await admin
  .from("profiles")
  .select("id,email,full_name,role")
  .eq("email", "brisenoamieva@gmail.com")
  .maybeSingle();
console.log("RICARDO", ricardo);

const { data: owned } = await admin
  .from("academies")
  .select("id,name,slug")
  .eq("owner_id", ricardo?.id ?? "00000000-0000-0000-0000-000000000000");
console.log("RICARDO_OWNS", owned);

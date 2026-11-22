import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { createClient } from "@supabase/supabase-js";

function loadEnvLocal() {
  const text = readFileSync(resolve(process.cwd(), ".env.local"), "utf8");
  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq < 0) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!(key in process.env) || !process.env[key]) process.env[key] = value;
  }
}

loadEnvLocal();
const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } },
);

const { data, error } = await admin
  .from("visoria_registrations")
  .select("folio,player_full_name,guardian_name,guardian_email,guardian_phone")
  .eq("event_id", "queretaro-nov-2026");
if (error) throw error;

const rows = [];
const seenPhone = new Set();
for (const row of data || []) {
  const email = String(row.guardian_email || "")
    .trim()
    .toLowerCase();
  const phone = String(row.guardian_phone || "").trim();
  if (email && email.includes("@") && !email.endsWith("@example.com")) continue;
  if (!phone) continue;
  if (seenPhone.has(phone)) continue;
  seenPhone.add(phone);
  rows.push({
    folio: row.folio,
    guardian_name: row.guardian_name,
    player_name: row.player_full_name,
    phone,
  });
}

const header = "folio,guardian_name,player_name,phone\n";
const csv =
  header +
  rows
    .map((r) =>
      [
        r.folio,
        JSON.stringify(r.guardian_name || ""),
        JSON.stringify(r.player_name || ""),
        r.phone,
      ].join(","),
    )
    .join("\n") +
  "\n";

writeFileSync("tmp/visoria-horarios-sin-email-whatsapp.csv", csv, "utf8");
writeFileSync(
  "tmp/visoria-horarios-sin-email-whatsapp.json",
  JSON.stringify(
    { count: rows.length, generated_at: new Date().toISOString(), rows },
    null,
    2,
  ),
  "utf8",
);
console.log(
  JSON.stringify(
    {
      without_email_unique_phones: rows.length,
      csv: "tmp/visoria-horarios-sin-email-whatsapp.csv",
    },
    null,
    2,
  ),
);

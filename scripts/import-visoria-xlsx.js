/**
 * Importa respuestas de Google Forms a visorías.
 * node scripts/import-visoria-xlsx.js "C:\\Users\\brise\\Downloads\\archivo.xlsx"
 */
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const XLSX = require("xlsx");
const { createClient } = require("@supabase/supabase-js");

const EVENT_ID = "queretaro-nov-2026";
const OPS_BUCKET = "mificha-ops";
const STORE = `visorias/${EVENT_ID}.json`;

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

function clean(value) {
  return String(value ?? "")
    .replace(/\s+/g, " ")
    .trim();
}

function col(row, name) {
  const wanted = name.toLowerCase();
  for (const [key, value] of Object.entries(row)) {
    if (key.trim().toLowerCase() === wanted) return value;
  }
  for (const [key, value] of Object.entries(row)) {
    if (key.trim().toLowerCase().startsWith(wanted)) return value;
  }
  return "";
}

function phone(value) {
  let digits = clean(value).replace(/\D/g, "");
  if (digits.startsWith("52") && digits.length === 12) return digits;
  if (digits.length === 10) return `52${digits}`;
  if (digits.length === 11 && digits.startsWith("1")) return `52${digits.slice(1)}`;
  return digits;
}

function parseAgeAndBirth(raw) {
  const text = clean(raw);
  const dated = text.match(/(\d{1,2})[/-](\d{1,2})[/-](\d{4})/);
  if (dated) {
    const day = dated[1].padStart(2, "0");
    const month = dated[2].padStart(2, "0");
    const year = dated[3];
    return {
      birth: `${year}-${month}-${day}`,
      age: Math.max(0, 2026 - Number(year)),
    };
  }
  const match = text.replace(",", ".").match(/(\d+(?:\.\d+)?)/);
  if (!match) return { birth: "", age: null };
  const age = Math.round(Number(match[1]));
  if (age < 5 || age > 20) return { birth: "", age };
  return { birth: `${2026 - age}-07-01`, age };
}

function categoryOf(value) {
  const text = clean(value).toLowerCase();
  if (text.startsWith("fem")) return "femenil";
  if (text.startsWith("var") || text.startsWith("masc")) return "varonil";
  return "";
}

function yearsTraining(raw) {
  const match = clean(raw).replace(",", ".").match(/(\d+(?:\.\d+)?)/);
  if (!match) return null;
  const value = Number(match[1]);
  return Number.isFinite(value) ? value : null;
}

const file = process.argv[2];
if (!file) {
  console.error("Pasa la ruta del Excel.");
  process.exit(1);
}

const workbook = XLSX.readFile(file);
const sheet = workbook.Sheets[workbook.SheetNames[0]];
const rows = XLSX.utils.sheet_to_json(sheet, { defval: "" });
const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false, autoRefreshToken: false } },
);

function dupKey(name, tel) {
  return `${name.trim().toLowerCase()}|${tel}`;
}

(async () => {
  const probe = await admin
    .from("visoria_registrations")
    .select("id")
    .eq("event_id", EVENT_ID)
    .limit(1);
  const missingTable =
    Boolean(probe.error) &&
    /visoria_registrations|schema cache|PGRST205/i.test(probe.error.message || "");
  const useTable = !missingTable && !probe.error;

  let stored = [];
  if (!useTable) {
    const buckets = await admin.storage.listBuckets();
    if (!buckets.data?.some((item) => item.name === OPS_BUCKET)) {
      const created = await admin.storage.createBucket(OPS_BUCKET, { public: false });
      if (created.error && !String(created.error.message).includes("already")) {
        throw created.error;
      }
    }
    const downloaded = await admin.storage.from(OPS_BUCKET).download(STORE);
    if (downloaded.data) {
      stored = JSON.parse(await downloaded.data.text());
    }
  } else {
    const existing = await admin
      .from("visoria_registrations")
      .select("player_full_name, guardian_phone")
      .eq("event_id", EVENT_ID);
    stored = existing.data ?? [];
  }

  const seen = new Set(
    stored.map((row) => dupKey(row.player_full_name, row.guardian_phone)),
  );

  let imported = 0;
  let skippedEmpty = 0;
  let skippedDup = 0;
  let failed = 0;
  const toStore = [...stored];

  for (const raw of rows) {
    const player = clean(col(raw, "Nombre del jugador"));
    const guardian = clean(col(raw, "Nombre Papá o Mamá responsable"));
    const tel = phone(col(raw, "Teléfono de contacto adulto responsable"));
    const category = categoryOf(col(raw, "Genero"));
    const { birth, age } = parseAgeAndBirth(col(raw, "Edad"));
    if (!player || !guardian || tel.length < 12 || !category || !birth) {
      skippedEmpty += 1;
      continue;
    }
    const key = dupKey(player, tel);
    if (seen.has(key)) {
      skippedDup += 1;
      continue;
    }

    const now = new Date().toISOString();
    const payload = {
      event_id: EVENT_ID,
      folio: `VQ-${crypto.randomBytes(3).toString("hex").toUpperCase()}`,
      source: "google_forms",
      player_full_name: player,
      birth_date: birth,
      category,
      position: clean(col(raw, "Posición jugador")) || null,
      current_club: clean(col(raw, "Escuela o academia donde juega")) || null,
      city: "Querétaro",
      guardian_name: guardian,
      guardian_phone: tel,
      guardian_email: null,
      attend_thursday: true,
      attend_friday: false,
      gph_selected: false,
      privacy_accepted_at: now,
      image_rights_accepted_at: now,
      clubs_share_accepted_at: now,
      notes: "Importado de Google Forms · Visorías GPH/CRACKS noviembre 2026",
      age_at_registration: age,
      years_training: yearsTraining(col(raw, "Años que tiene entrenando")),
      nui: clean(col(raw, "NUI")) || null,
    };

    if (useTable) {
      const inserted = await admin.from("visoria_registrations").insert(payload);
      if (inserted.error) {
        console.error(player, inserted.error.message);
        failed += 1;
        continue;
      }
    } else {
      toStore.push({
        id: crypto.randomUUID(),
        ...payload,
        created_at: now,
      });
    }
    seen.add(key);
    imported += 1;
  }

  if (!useTable) {
    const body = Buffer.from(JSON.stringify(toStore));
    const uploaded = await admin.storage
      .from(OPS_BUCKET)
      .upload(STORE, body, { upsert: true, contentType: "application/json" });
    if (uploaded.error) throw uploaded.error;
  }

  console.log(
    JSON.stringify({
      store: useTable ? "postgres" : "storage",
      imported,
      skippedEmpty,
      skippedDup,
      failed,
      totalExcel: rows.length,
    }),
  );
})().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});

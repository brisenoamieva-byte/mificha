/**
 * Nudge: ficha creada pero sin consentimiento Explorar.
 * Uso: node tmp/send-consent-nudge.mjs dry-run|test|all [limit]
 */
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";

const mode = String(process.argv[2] || "dry-run").toLowerCase();
const LIMIT = process.argv[3] ? Math.max(1, Number(process.argv[3]) || 0) : null;
const FROM = "MiFicha <hola@mificha.mx>";
const TEST_EMAIL = "brisenoamieva@gmail.com";
const REGISTRY_PATH = resolve(process.cwd(), "tmp/visoria-consent-nudge-registry.json");
const SEND_GAP_MS = 700;

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

function loadRegistry() {
  if (!existsSync(REGISTRY_PATH)) {
    return { campaign: "consent-nudge-nov-2026", sends: [] };
  }
  return JSON.parse(readFileSync(REGISTRY_PATH, "utf8"));
}

function saveRegistry(registry) {
  mkdirSync(dirname(REGISTRY_PATH), { recursive: true });
  writeFileSync(REGISTRY_PATH, JSON.stringify(registry, null, 2), "utf8");
}

function firstName(full) {
  const part = String(full || "").trim().split(/\s+/)[0];
  if (!part) return "hola";
  return part.charAt(0).toUpperCase() + part.slice(1).toLowerCase();
}

loadEnvLocal();
const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
const apiKey = process.env.RESEND_API_KEY?.trim();
const appUrl = (process.env.NEXT_PUBLIC_APP_URL || "https://www.mificha.mx").replace(/\/$/, "");

const admin = createClient(url, serviceKey, { auth: { persistSession: false } });
const { data, error } = await admin.storage.from("mificha-ops").download("families/roster.json");
if (error) throw error;
const roster = JSON.parse(await data.text());

const byEmail = new Map();
for (const child of roster) {
  if (child.explore_opt_in) continue;
  const email = String(child.guardian_email || "").trim().toLowerCase();
  if (!email || !email.includes("@") || email === TEST_EMAIL) continue;
  if (email.endsWith("@example.com")) continue;
  const existing = byEmail.get(email);
  if (existing) {
    existing.players.push(child.player_name);
    continue;
  }
  byEmail.set(email, {
    email,
    guardian_name: child.guardian_email?.split("@")[0] || "tutor",
    players: [child.player_name],
    code: child.public_code,
  });
}

const registry = loadRegistry();
const already = new Set(
  (registry.sends || [])
    .filter((s) => s.status === "sent")
    .map((s) => String(s.email).toLowerCase()),
);
let candidates = [...byEmail.values()].filter((c) => !already.has(c.email));
if (LIMIT != null) candidates = candidates.slice(0, LIMIT);

if (mode === "dry-run") {
  console.log(JSON.stringify({ ok: true, pending: candidates.length, sample: candidates.slice(0, 5) }, null, 2));
  process.exit(0);
}

if (!apiKey || apiKey === "re_...") {
  console.error("Falta RESEND_API_KEY");
  process.exit(1);
}

const resend = new Resend(apiKey);
const results = [];

async function sendOne(target) {
  const name = target.players[0] || "tu jugador";
  const tutor = firstName(target.guardian_name);
  const cta = `${appUrl}/fut/entrar?next=${encodeURIComponent("/fut/tutor")}&utm_source=visoria&utm_medium=email&utm_campaign=consent_nudge`;
  const subject = `Tu ficha de ${name} aún no aparece en Explorar`;
  const html = `<p>Hola ${tutor},</p>
<p>Ya tienes la ficha de <strong>${name}</strong> en MiFicha, pero <strong>sin tu consentimiento firmado no aparece en Explorar</strong> (el buscador donde scouts buscan talento).</p>
<p>El link MF- sigue funcionando si lo compartes. Para salir en el directorio:</p>
<p><a href="${cta}" style="display:inline-block;background:#1B4F8C;color:#fff;padding:12px 20px;border-radius:10px;text-decoration:none;font-weight:700;">Firmar y publicar en Explorar</a></p>
<p>Gratis · ~1 minuto</p>
<p>Equipo MiFicha · GPH + CRACKS</p>`;

  const entry = {
    email: target.email,
    players: target.players,
    sent_at: new Date().toISOString(),
    status: "pending",
    mode,
    error: null,
    resend_id: null,
  };
  try {
    const { data: sent, error: sendError } = await resend.emails.send({
      from: FROM,
      to: mode === "test" ? TEST_EMAIL : target.email,
      replyTo: "hola@mificha.mx",
      subject: mode === "test" ? `[PRUEBA] ${subject}` : subject,
      html,
      text: `Hola ${tutor}, firma el consentimiento para que ${name} aparezca en Explorar: ${cta}`,
    });
    if (sendError) throw new Error(sendError.message || "send_failed");
    entry.status = "sent";
    entry.resend_id = sent?.id ?? null;
  } catch (err) {
    entry.status = "error";
    entry.error = err instanceof Error ? err.message : String(err);
  }
  registry.sends.push(entry);
  results.push(entry);
  await new Promise((r) => setTimeout(r, SEND_GAP_MS));
}

if (mode === "test") {
  await sendOne({
    email: TEST_EMAIL,
    guardian_name: "Ricardo",
    players: ["Matías Briseño"],
    code: "MF-DEMO",
  });
} else {
  for (const row of candidates) await sendOne(row);
}

saveRegistry(registry);
console.log(
  JSON.stringify(
    {
      ok: true,
      sent: results.filter((r) => r.status === "sent").length,
      errors: results.filter((r) => r.status === "error").length,
      results: results.slice(0, 20),
    },
    null,
    2,
  ),
);

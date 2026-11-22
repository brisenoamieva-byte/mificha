/**
 * Follow-up: arma la ficha (después del aviso de horarios).
 * 1:1 Resend, dedupe, registry propio, ritmo anti-spam.
 *
 * Uso:
 *   node tmp/send-visoria-ficha-followup.mjs dry-run
 *   node tmp/send-visoria-ficha-followup.mjs test
 *   node tmp/send-visoria-ficha-followup.mjs all
 *   node tmp/send-visoria-ficha-followup.mjs all 40
 */
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";

const EVENT_ID = "queretaro-nov-2026";
const mode = String(process.argv[2] || "dry-run").toLowerCase();
const LIMIT_ARG = process.argv[3];
const LIMIT =
  LIMIT_ARG == null || LIMIT_ARG === ""
    ? null
    : Math.max(1, Number(LIMIT_ARG) || 0);

const FROM = "MiFicha <hola@mificha.mx>";
const REPLY_TO = "hola@mificha.mx";
const WA_DISPLAY = "446 132 2207";
const WA_E164 = "524461322207";
const TEST_EMAIL = "brisenoamieva@gmail.com";
const REGISTRY_PATH = resolve(
  process.cwd(),
  "tmp/visoria-ficha-followup-registry.json",
);
const EXCLUDE_EMAILS = new Set([
  "hola@mificha.mx",
  "notificaciones@mificha.mx",
]);
/** ms entre envíos 1:1 — ritmo suave para reputación */
const SEND_GAP_MS = 700;

function loadEnvLocal() {
  const path = resolve(process.cwd(), ".env.local");
  const text = readFileSync(path, "utf8");
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

function firstName(full) {
  const part = String(full || "")
    .trim()
    .split(/\s+/)[0];
  if (!part) return "hola";
  return part.charAt(0).toUpperCase() + part.slice(1).toLowerCase();
}

function validEmail(value, { allowTest = false } = {}) {
  const email = String(value || "")
    .trim()
    .toLowerCase();
  if (!email || !email.includes("@") || email.endsWith("@example.com")) return null;
  if (!allowTest && EXCLUDE_EMAILS.has(email)) return null;
  if (!allowTest && email === TEST_EMAIL) return null;
  return email;
}

function loadRegistry() {
  if (!existsSync(REGISTRY_PATH)) {
    return {
      campaign: "visorias-ficha-followup-nov-2026",
      created_at: new Date().toISOString(),
      sends: [],
    };
  }
  return JSON.parse(readFileSync(REGISTRY_PATH, "utf8"));
}

function saveRegistry(registry) {
  mkdirSync(dirname(REGISTRY_PATH), { recursive: true });
  writeFileSync(REGISTRY_PATH, JSON.stringify(registry, null, 2), "utf8");
}

function playerLabel(players) {
  if (!players.length) return "tu jugador";
  if (players.length === 1) return players[0];
  if (players.length === 2) return `${players[0]} y ${players[1]}`;
  return `${players[0]} y ${players.length - 1} inscritos más`;
}

function buildHtml({
  tutorFirstName,
  players,
  folio,
  fichaHref,
  horariosHref,
  iconUrl,
  appUrl,
}) {
  const names = playerLabel(players);
  const fichaCtaLabel =
    players.length === 1
      ? `Crear ficha de ${players[0]}`
      : "Crear ficha de tu jugador";
  const subject = `Arma la ficha de ${players[0] || "tu jugador"} · visorías GPH + CRACKS`;

  return {
    subject,
    html: `<!DOCTYPE html>
<html lang="es">
  <head><meta charset="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" /><title>${subject}</title></head>
  <body style="margin:0;padding:0;background:#eef2f7;font-family:Arial,Helvetica,sans-serif;color:#0f172a;">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;">Arma la ficha digital de ${names} en ~5 minutos · gratis</div>
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#eef2f7;padding:24px 12px;">
      <tr><td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 18px 40px rgba(15,45,82,0.12);">
          <tr><td style="background:linear-gradient(135deg,#1B4F8C 0%,#0F2D52 100%);padding:28px 28px 24px;">
            <table cellpadding="0" cellspacing="0"><tr>
              <td style="background:#ffffff;border-radius:12px;padding:10px 14px;"><img src="${iconUrl}" alt="MiFicha" width="32" height="32" style="display:block;width:32px;height:32px;" /></td>
              <td style="padding-left:14px;">
                <div style="font-size:20px;color:#ffffff;"><span style="font-weight:400;">Mi</span><span style="font-weight:700;">Ficha</span></div>
                <div style="margin-top:6px;font-size:11px;letter-spacing:0.08em;text-transform:uppercase;color:rgba(255,255,255,0.72);">GPH + CRACKS · ficha digital</div>
              </td>
            </tr></table>
          </td></tr>
          <tr><td style="padding:28px 28px 8px;">
            <p style="margin:0 0 16px;font-size:16px;line-height:1.5;">Hola ${tutorFirstName},</p>
            <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#334155;">Ya te compartimos los <strong style="color:#0f172a;">horarios de las visorías</strong> (26 y 27 de noviembre).</p>
            <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#334155;">Mientras llega el día, en <strong style="color:#0f172a;">MiFicha</strong> puedes armar la ficha digital de <strong style="color:#0f172a;">${names}</strong>: foto, historia y torneos, lista para compartir con clubes o agentes.</p>
            ${folio ? `<p style="margin:0 0 16px;font-size:13px;color:#64748b;">Folio de referencia: <strong style="color:#0f172a;">${folio}</strong></p>` : ""}
          </td></tr>
          <tr><td align="center" style="padding:8px 28px 8px;">
            <a href="${fichaHref}" style="display:inline-block;background:#1B4F8C;color:#ffffff;text-decoration:none;font-size:15px;font-weight:700;padding:14px 28px;border-radius:12px;">${fichaCtaLabel}</a>
            <p style="margin:12px 0 0;font-size:12px;line-height:1.5;color:#94a3b8;">Gratis · ~5 minutos</p>
          </td></tr>
          <tr><td style="padding:16px 28px 8px;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#fff7ed;border:1px solid #fed7aa;border-radius:14px;"><tr><td style="padding:16px 18px;">
              <div style="font-size:12px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#c2410c;margin-bottom:8px;">Recordatorio de horarios</div>
              <p style="margin:0 0 12px;font-size:14px;line-height:1.55;color:#334155;">Si aún no revisaste la franja de tu categoría, está publicada en MiFicha.</p>
              <a href="${horariosHref}" style="display:inline-block;background:#ffffff;color:#c2410c;border:2px solid #fdba74;text-decoration:none;font-size:13px;font-weight:700;padding:10px 18px;border-radius:10px;">Ver horarios</a>
            </td></tr></table>
          </td></tr>
          <tr><td style="padding:20px 28px 28px;">
            <p style="margin:0 0 4px;font-size:14px;line-height:1.5;color:#334155;">Saludos,<br /><strong style="color:#0f172a;">Equipo GPH + CRACKS</strong><br />con MiFicha</p>
            <p style="margin:12px 0 0;font-size:13px;line-height:1.5;color:#64748b;">WhatsApp: <a href="https://wa.me/${WA_E164}" style="color:#1B4F8C;text-decoration:none;font-weight:600;">${WA_DISPLAY}</a> · <a href="mailto:hola@mificha.mx" style="color:#1B4F8C;text-decoration:none;font-weight:600;">hola@mificha.mx</a></p>
          </td></tr>
          <tr><td style="background:#f8fafc;border-top:1px solid #e2e8f0;padding:16px 28px;">
            <p style="margin:0;font-size:11px;line-height:1.55;color:#94a3b8;">Recibes este correo porque te registraste en las visorías GPH/CRACKS. Si no deseas más mensajes sobre el piloto MiFicha, responde “no gracias”. · <a href="${appUrl}" style="color:#64748b;">mificha.mx</a></p>
          </td></tr>
        </table>
      </td></tr>
    </table>
  </body>
</html>`,
    text: `Hola ${tutorFirstName},

Ya te compartimos los horarios de las visorías (26 y 27 de noviembre).

Mientras llega el día, arma la ficha digital de ${names} en MiFicha (foto, historia y torneos):
${fichaHref}

Gratis · ~5 minutos
${folio ? `Folio: ${folio}\n` : ""}
Ver horarios: ${horariosHref}

WhatsApp ${WA_DISPLAY}
Equipo GPH + CRACKS · MiFicha`,
  };
}

loadEnvLocal();

if (!["dry-run", "test", "all"].includes(mode)) {
  console.error(
    "Uso: node tmp/send-visoria-ficha-followup.mjs dry-run|test|all [limit]",
  );
  process.exit(1);
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
const apiKey = process.env.RESEND_API_KEY?.trim();
if (!url || !serviceKey) {
  console.error("Faltan credenciales Supabase");
  process.exit(1);
}
if (mode !== "dry-run" && (!apiKey || apiKey === "re_...")) {
  console.error("Falta RESEND_API_KEY");
  process.exit(1);
}

const appUrl = (process.env.NEXT_PUBLIC_APP_URL || "https://www.mificha.mx").replace(
  /\/$/,
  "",
);
const fichaHref = `${appUrl}/fut/tutor?utm_source=visoria&utm_medium=email&utm_campaign=horarios_ficha`;
const horariosHref = `${appUrl}/fut/visorias?utm_source=visoria&utm_medium=email&utm_campaign=horarios_ficha#horarios`;
const iconUrl = `${appUrl}/brand/mificha-icon.png`;

const admin = createClient(url, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const { data, error } = await admin
  .from("visoria_registrations")
  .select(
    "id,folio,player_full_name,guardian_name,guardian_email,guardian_phone,created_at",
  )
  .eq("event_id", EVENT_ID)
  .order("created_at", { ascending: true });

if (error) {
  console.error("Error leyendo visoria_registrations:", error.message);
  process.exit(1);
}

const rows = data || [];
const withoutEmail = [];
const byEmail = new Map();

for (const row of rows) {
  const email = validEmail(row.guardian_email);
  if (!email) {
    const phone = String(row.guardian_phone || "").trim();
    if (phone) {
      withoutEmail.push({
        folio: row.folio,
        guardian_name: row.guardian_name,
        player_name: row.player_full_name,
        phone,
      });
    }
    continue;
  }
  const existing = byEmail.get(email);
  if (existing) {
    existing.players.push(String(row.player_full_name || "jugador").trim());
    existing.folios.push(row.folio);
    existing.registration_ids.push(row.id);
    continue;
  }
  byEmail.set(email, {
    email,
    guardian_name: row.guardian_name,
    players: [String(row.player_full_name || "jugador").trim()],
    folios: [row.folio],
    registration_ids: [row.id],
    phone: row.guardian_phone || null,
  });
}

const registry = loadRegistry();
const already = new Set(
  (registry.sends || [])
    .filter((row) => row.status === "sent")
    .map((row) => String(row.email || "").toLowerCase()),
);

let candidates = [...byEmail.values()].filter((row) => !already.has(row.email));
if (LIMIT != null) candidates = candidates.slice(0, LIMIT);

if (mode === "dry-run") {
  console.log(
    JSON.stringify(
      {
        ok: true,
        mode,
        campaign: "ficha-followup",
        total_registrations: rows.length,
        unique_emails_pending: candidates.length,
        unique_emails_already_sent: already.size,
        without_email_with_phone: withoutEmail.length,
        send_gap_ms: SEND_GAP_MS,
        sample_pending: candidates.slice(0, 5).map((c) => ({
          email: c.email,
          players: c.players,
          subject_preview: `Arma la ficha de ${c.players[0]} · visorías GPH + CRACKS`,
        })),
      },
      null,
      2,
    ),
  );
  process.exit(0);
}

const resend = new Resend(apiKey);
const results = [];

async function sendOne(target) {
  const tutorFirstName = firstName(target.guardian_name);
  const folio = target.folios.filter(Boolean).join(", ") || null;
  const payload = buildHtml({
    tutorFirstName,
    players: target.players,
    folio,
    fichaHref,
    horariosHref,
    iconUrl,
    appUrl,
  });

  const subject =
    mode === "test"
      ? `[PRUEBA] Arma la ficha de ${target.players[0]} · visorías GPH`
      : payload.subject;

  const entry = {
    email: target.email,
    guardian_name: target.guardian_name,
    players: target.players,
    folios: target.folios,
    registration_ids: target.registration_ids,
    phone: target.phone,
    sent_at: new Date().toISOString(),
    status: "pending",
    resend_id: null,
    error: null,
    mode,
    subject,
  };

  try {
    const { data: sent, error: sendError } = await resend.emails.send({
      from: FROM,
      to: target.email,
      replyTo: REPLY_TO,
      subject,
      html: payload.html,
      text: payload.text,
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
    guardian_name: "Ricardo Briseño",
    players: ["Matías Briseño"],
    folios: ["VQ-DEMO"],
    registration_ids: ["test"],
    phone: null,
  });
} else {
  if (candidates.length === 0) {
    console.error("No hay destinatarios pendientes con email válido.");
    process.exit(1);
  }
  // Olas de 40 con pausa extra entre olas (anti-spam / reputación)
  const WAVE = 40;
  for (let i = 0; i < candidates.length; i++) {
    if (i > 0 && i % WAVE === 0) {
      console.error(`Pausa entre olas… (${i}/${candidates.length})`);
      await new Promise((r) => setTimeout(r, 12_000));
    }
    await sendOne(candidates[i]);
    if ((i + 1) % 10 === 0 || i + 1 === candidates.length) {
      console.error(`Progreso ${i + 1}/${candidates.length}`);
    }
  }
}

registry.updated_at = new Date().toISOString();
saveRegistry(registry);

const sentCount = results.filter((r) => r.status === "sent").length;
const errorCount = results.filter((r) => r.status === "error").length;

console.log(
  JSON.stringify(
    {
      ok: true,
      mode,
      sent: sentCount,
      errors: errorCount,
      registry: REGISTRY_PATH,
      without_email_with_phone: withoutEmail.length,
      results: results.map((r) => ({
        status: r.status,
        email: r.email,
        players: r.players,
        subject: r.subject,
        resend_id: r.resend_id,
        error: r.error,
      })),
    },
    null,
    2,
  ),
);

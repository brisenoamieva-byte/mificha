/**
 * Prueba de envío Resend a un correo propio.
 * node scripts/send-resend-test.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { Resend } from "resend";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.join(__dirname, "..", ".env.resend.tmp");

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

const to = process.argv[2] || "brisenoamieva@gmail.com";
const apiKey = process.env.RESEND_API_KEY;
const from = process.env.RESEND_FROM_EMAIL;

if (!apiKey || !from) {
  console.error("Faltan RESEND_API_KEY o RESEND_FROM_EMAIL");
  process.exit(1);
}

const resend = new Resend(apiKey);
const { data, error } = await resend.emails.send({
  from,
  to: [to],
  subject: "Prueba MiFicha · aviso automático",
  html: `
    <p>Hola Ricardo,</p>
    <p>Esta es una <strong>prueba</strong> del envío automático de MiFicha (Resend).</p>
    <p>Remitente configurado: <code>${from.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</code></p>
    <p>Si ves este correo, los avisos a tutores ya pueden salir por la plataforma.</p>
    <p>— MiFicha</p>
  `,
  text: `Prueba MiFicha. Remitente: ${from}. Si llega, Resend está OK en producción.`,
});

if (error) {
  console.error(JSON.stringify({ ok: false, error }, null, 2));
  process.exit(1);
}

console.log(JSON.stringify({ ok: true, to, from, id: data?.id ?? null }, null, 2));

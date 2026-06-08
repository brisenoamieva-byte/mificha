/**
 * WhatsApp outbound — Twilio o Meta Cloud API.
 * Sin credenciales, el envío automático usa email (Resend) o queda en modo omitido.
 */

export type WhatsAppProvider = "twilio" | "meta" | "link_only";

export interface WhatsAppSendRequest {
  to: string;
  message: string;
}

export interface WhatsAppSendResult {
  ok: boolean;
  provider: WhatsAppProvider;
  messageId?: string;
  error?: string;
}

function normalizePhone(raw: string) {
  const digits = raw.replace(/\D/g, "");
  if (digits.length === 10) return `52${digits}`;
  if (digits.startsWith("52")) return digits;
  return digits;
}

export function getWhatsAppProvider(): WhatsAppProvider {
  if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_WHATSAPP_FROM) {
    return "twilio";
  }
  if (process.env.WHATSAPP_CLOUD_TOKEN && process.env.WHATSAPP_PHONE_NUMBER_ID) {
    return "meta";
  }
  return "link_only";
}

export async function sendWhatsAppMessage(
  request: WhatsAppSendRequest,
): Promise<WhatsAppSendResult> {
  const provider = getWhatsAppProvider();
  const to = normalizePhone(request.to);

  if (provider === "link_only") {
    return {
      ok: false,
      provider,
      error:
        "WhatsApp API no configurada. Agrega email del tutor o configura Twilio/Meta en Vercel.",
    };
  }

  if (provider === "twilio") {
    return sendViaTwilio(to, request.message);
  }

  return sendViaMetaCloud(to, request.message);
}

async function sendViaTwilio(
  to: string,
  message: string,
): Promise<WhatsAppSendResult> {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_WHATSAPP_FROM;

  if (!accountSid || !authToken || !from) {
    return { ok: false, provider: "twilio", error: "Twilio incompleto." };
  }

  const body = new URLSearchParams({
    To: `whatsapp:+${to}`,
    From: from.startsWith("whatsapp:") ? from : `whatsapp:${from}`,
    Body: message,
  });

  const response = await fetch(
    `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
    {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString("base64")}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body,
    },
  );

  const result = (await response.json()) as { sid?: string; message?: string };

  if (!response.ok) {
    return {
      ok: false,
      provider: "twilio",
      error: result.message ?? "Error Twilio",
    };
  }

  return { ok: true, provider: "twilio", messageId: result.sid };
}

async function sendViaMetaCloud(
  to: string,
  message: string,
): Promise<WhatsAppSendResult> {
  const token = process.env.WHATSAPP_CLOUD_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;

  if (!token || !phoneNumberId) {
    return { ok: false, provider: "meta", error: "Meta Cloud incompleto." };
  }

  const response = await fetch(
    `https://graph.facebook.com/v21.0/${phoneNumberId}/messages`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to,
        type: "text",
        text: { body: message },
      }),
    },
  );

  const result = (await response.json()) as {
    messages?: { id: string }[];
    error?: { message?: string };
  };

  if (!response.ok) {
    return {
      ok: false,
      provider: "meta",
      error: result.error?.message ?? "Error Meta Cloud API",
    };
  }

  return {
    ok: true,
    provider: "meta",
    messageId: result.messages?.[0]?.id,
  };
}

export function buildWhatsAppLink(message: string) {
  return `https://wa.me/?text=${encodeURIComponent(message)}`;
}

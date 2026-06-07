import { NextResponse } from "next/server";
import { sendWhatsAppMessage } from "@/lib/whatsapp";
import { getAuthedSupabaseClient } from "@/lib/supabase-server";

interface WhatsAppBody {
  to?: string;
  message?: string;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as WhatsAppBody;

    if (!body.to || !body.message) {
      return NextResponse.json(
        { error: "to y message son requeridos." },
        { status: 400 },
      );
    }

    const supabase = await getAuthedSupabaseClient(request);
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "No autenticado." }, { status: 401 });
    }

    const result = await sendWhatsAppMessage({
      to: body.to,
      message: body.message,
    });

    if (!result.ok) {
      return NextResponse.json(
        { error: result.error ?? "No se pudo enviar WhatsApp.", provider: result.provider },
        { status: 503 },
      );
    }

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Error al enviar WhatsApp.",
      },
      { status: 500 },
    );
  }
}

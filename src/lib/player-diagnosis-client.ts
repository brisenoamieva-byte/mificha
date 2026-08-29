import { supabase } from "@/lib/supabase";

export async function diagnosisAuthedFetch(
  input: string,
  init?: RequestInit,
): Promise<Record<string, unknown>> {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    throw new Error("Sesión expirada. Vuelve a iniciar sesión.");
  }

  const response = await fetch(input, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.access_token}`,
      ...(init?.headers ?? {}),
    },
  });

  const payload = (await response.json().catch(() => ({}))) as {
    error?: string;
  };

  if (!response.ok) {
    throw new Error(payload.error || "No se pudo completar la acción.");
  }

  return payload as Record<string, unknown>;
}

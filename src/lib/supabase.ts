import { createBrowserClient } from "@supabase/auth-helpers-nextjs";
import type { Database } from "@/types/database";

/**
 * Cliente browser: escribe la sesión en cookies para que Server Components
 * (`createSupabaseServerClient`) vean el mismo login que Tutor / Dashboard.
 * Antes usábamos createClient (solo localStorage) y el kit/ficha completa
 * trataban al usuario como anónimo aunque ya estuviera adentro.
 */
export const supabase = createBrowserClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

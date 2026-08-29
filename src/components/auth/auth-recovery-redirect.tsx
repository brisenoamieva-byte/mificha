"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { consumeAuthRedirect } from "@/lib/auth-recovery";
import { supabase } from "@/lib/supabase";

/** Si el correo de recuperación aterriza fuera de /fut/recuperar/nueva, redirige ahí. */
export function AuthRecoveryRedirect() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY" && pathname !== "/fut/recuperar/nueva") {
        router.replace("/fut/recuperar/nueva");
      }
    });

    void consumeAuthRedirect().catch(() => undefined);

    return () => data.subscription.unsubscribe();
  }, [pathname, router]);

  return null;
}

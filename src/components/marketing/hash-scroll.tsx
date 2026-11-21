"use client";

import { useEffect } from "react";

function scrollToHash(hash: string) {
  const id = hash.replace(/^#/, "").trim();
  if (!id) return;
  const el = document.getElementById(id);
  if (!el) return;
  el.scrollIntoView({ behavior: "smooth", block: "start" });
}

/**
 * Next.js App Router a menudo no hace scroll a #ancla.
 * Corre al montar y cuando cambia el hash.
 */
export function HashScroll() {
  useEffect(() => {
    const run = () => {
      if (window.location.hash) {
        // Espera layout (imágenes / mapa) antes de anclar.
        window.requestAnimationFrame(() => {
          window.setTimeout(() => scrollToHash(window.location.hash), 50);
        });
      }
    };
    run();
    window.addEventListener("hashchange", run);
    return () => window.removeEventListener("hashchange", run);
  }, []);

  return null;
}

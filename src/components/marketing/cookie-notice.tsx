"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { LEGAL_ROUTES } from "@/lib/legal";

const STORAGE_KEY = "mificha-cookie-notice-v1";

export function CookieNotice() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      if (localStorage.getItem(STORAGE_KEY) !== "1") {
        setVisible(true);
      }
    } catch {
      setVisible(true);
    }
  }, []);

  function dismiss() {
    try {
      localStorage.setItem(STORAGE_KEY, "1");
    } catch {
      /* ignore */
    }
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label="Aviso de cookies"
      className="fixed inset-x-0 bottom-0 z-[100] border-t border-mf-border bg-mf-surface p-4 shadow-[0_-4px_24px_rgba(0,0,0,0.08)] sm:p-5"
    >
      <div className="mx-auto flex max-w-6xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm leading-6 text-mf-text-secondary">
          Usamos cookies técnicas necesarias para la sesión y la seguridad del sitio.
          No usamos cookies de publicidad.{" "}
          <Link href={LEGAL_ROUTES.cookies} className="font-medium text-mf-brand hover:underline">
            Política de cookies
          </Link>
        </p>
        <button type="button" onClick={dismiss} className="mf-btn-primary shrink-0 sm:px-6">
          Entendido
        </button>
      </div>
    </div>
  );
}

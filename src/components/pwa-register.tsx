"use client";

import { useEffect } from "react";

/** Registra el SW de producción para que Chrome/Android ofrezcan “Instalar app”. */
export function PwaRegister() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (!("serviceWorker" in navigator)) return;
    void navigator.serviceWorker.register("/sw.js").catch(() => {
      /* silencioso: la página de /fut/app sigue con instrucciones manuales */
    });
  }, []);

  return null;
}

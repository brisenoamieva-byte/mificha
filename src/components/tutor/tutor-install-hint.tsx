"use client";

import { useEffect, useState } from "react";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

export function TutorInstallHint() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const onPrompt = (event: Event) => {
      event.preventDefault();
      setDeferred(event as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    return () => window.removeEventListener("beforeinstallprompt", onPrompt);
  }, []);

  if (done) {
    return (
      <p className="mt-4 text-sm font-medium text-mf-gph">Listo — busca el ícono en tu pantalla de inicio.</p>
    );
  }

  if (!deferred) return null;

  return (
    <button
      type="button"
      className="mf-btn-gph mt-4"
      onClick={() => {
        void deferred.prompt().then(async () => {
          const choice = await deferred.userChoice;
          if (choice.outcome === "accepted") setDone(true);
          setDeferred(null);
        });
      }}
    >
      Instalar MiFicha
    </button>
  );
}

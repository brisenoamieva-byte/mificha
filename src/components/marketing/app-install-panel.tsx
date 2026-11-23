"use client";

import { useEffect, useState } from "react";
import { APP_INSTALL } from "@/lib/app-install";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

function detectPlatform(): "ios" | "android" | "other" {
  if (typeof navigator === "undefined") return "other";
  const ua = navigator.userAgent || "";
  const iOS =
    /iPad|iPhone|iPod/i.test(ua) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  if (iOS) return "ios";
  if (/Android/i.test(ua)) return "android";
  return "other";
}

function isStandaloneDisplay() {
  if (typeof window === "undefined") return false;
  const media = window.matchMedia("(display-mode: standalone)").matches;
  const ios = "standalone" in navigator && Boolean((navigator as Navigator & { standalone?: boolean }).standalone);
  return media || ios;
}

function PlatformSteps({
  title,
  steps,
  highlight,
}: {
  title: string;
  steps: readonly string[];
  highlight?: boolean;
}) {
  return (
    <div
      className={
        highlight
          ? "rounded-xl border-2 border-mf-brand bg-mf-brand-soft/40 px-4 py-5 sm:px-5"
          : "rounded-xl border border-mf-border bg-white px-4 py-5 sm:px-5"
      }
    >
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-mf-brand">
        {title}
      </p>
      <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm leading-6 text-mf-text-secondary">
        {steps.map((step) => (
          <li key={step}>
            <span className="text-mf-gph-ink">{step}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}

type AppInstallPanelProps = {
  /** Compacto para meter en tutor / footer de sección. */
  compact?: boolean;
  /** Si la página ya trae título/ícono. */
  hideIntro?: boolean;
};

export function AppInstallPanel({ compact = false, hideIntro = false }: AppInstallPanelProps) {
  const [platform, setPlatform] = useState<"ios" | "android" | "other">("other");
  const [standalone, setStandalone] = useState(false);
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    setPlatform(detectPlatform());
    setStandalone(isStandaloneDisplay());

    const onPrompt = (event: Event) => {
      event.preventDefault();
      setDeferred(event as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    return () => window.removeEventListener("beforeinstallprompt", onPrompt);
  }, []);

  if (standalone || done) {
    return (
      <div className="rounded-xl border border-mf-accent/40 bg-mf-accent-soft px-4 py-4 text-sm text-mf-gph-ink sm:px-5">
        {APP_INSTALL.installedNote}
      </div>
    );
  }

  return (
    <div className={compact ? "space-y-4" : "space-y-6"}>
      {!hideIntro ? (
        !compact ? (
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-mf-brand">
              {APP_INSTALL.eyebrow}
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-mf-gph-ink sm:text-3xl">
              {APP_INSTALL.title}
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-mf-text-secondary sm:text-base">
              {APP_INSTALL.lead}
            </p>
          </div>
        ) : (
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-mf-brand">
              {APP_INSTALL.eyebrow}
            </p>
            <h2 className="mt-1 text-lg font-semibold tracking-tight text-mf-gph-ink">
              {APP_INSTALL.title}
            </h2>
            <p className="mt-2 text-sm leading-6 text-mf-text-secondary">{APP_INSTALL.lead}</p>
          </div>
        )
      ) : (
        <p className="text-sm leading-6 text-mf-text-secondary">{APP_INSTALL.lead}</p>
      )}

      {deferred ? (
        <button
          type="button"
          className="mf-btn-gph w-full justify-center sm:w-auto"
          onClick={() => {
            void deferred.prompt().then(async () => {
              const choice = await deferred.userChoice;
              if (choice.outcome === "accepted") setDone(true);
              setDeferred(null);
            });
          }}
        >
          {APP_INSTALL.installCta}
        </button>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2">
        <PlatformSteps
          title={APP_INSTALL.androidTitle}
          steps={APP_INSTALL.androidSteps}
          highlight={platform === "android"}
        />
        <PlatformSteps
          title={APP_INSTALL.iosTitle}
          steps={APP_INSTALL.iosSteps}
          highlight={platform === "ios"}
        />
      </div>

      <p className="text-xs leading-5 text-mf-text-muted">{APP_INSTALL.storeNote}</p>
    </div>
  );
}

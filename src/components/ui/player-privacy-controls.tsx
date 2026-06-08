"use client";

import Link from "next/link";
import { Shield } from "lucide-react";
import { PRIVACY_COPY } from "@/lib/privacy";
import { cn } from "@/lib/utils";

interface PlayerPrivacyControlsProps {
  birthDate: string;
  hasConsent: boolean;
  isPublic: boolean;
  isDiscoverable: boolean;
  onConsentChange: (value: boolean) => void;
  onPublicChange: (value: boolean) => void;
  onDiscoverableChange: (value: boolean) => void;
  className?: string;
}

export function PlayerPrivacyControls({
  birthDate,
  hasConsent,
  isPublic,
  isDiscoverable,
  onConsentChange,
  onPublicChange,
  onDiscoverableChange,
  className,
}: PlayerPrivacyControlsProps) {
  const showMinorNotice = Boolean(birthDate);

  return (
    <div
      className={cn(
        "space-y-3 rounded-xl border border-amber-200 bg-amber-50/70 p-4",
        className,
      )}
    >
      <div className="flex items-start gap-2">
        <Shield className="mt-0.5 h-4 w-4 shrink-0 text-amber-700" />
        <div>
          <p className="text-sm font-semibold text-amber-950">
            Privacidad del jugador
          </p>
          <p className="mt-1 text-sm leading-6 text-amber-900/80">
            {showMinorNotice ? PRIVACY_COPY.minorNotice : PRIVACY_COPY.minorNotice}
          </p>
        </div>
      </div>

      <label className="flex items-start gap-3 rounded-lg border border-amber-200 bg-white px-3 py-3">
        <input
          type="checkbox"
          checked={hasConsent}
          onChange={(event) => onConsentChange(event.target.checked)}
          className="mt-1 h-4 w-4 rounded border-amber-300 text-[#1B4F8C]"
        />
        <span className="text-sm leading-6 text-slate-700">
          {PRIVACY_COPY.consentLabel}{" "}
          <Link href="/aviso-privacidad" className="font-semibold text-[#1B4F8C] hover:underline">
            Aviso de privacidad
          </Link>
          {" · "}
          <Link href="/terminos" className="font-semibold text-[#1B4F8C] hover:underline">
            Términos
          </Link>
        </span>
      </label>

      <label className="flex items-start gap-3 rounded-lg border border-slate-200 bg-white px-3 py-3">
        <input
          type="checkbox"
          checked={isPublic}
          disabled={!hasConsent}
          onChange={(event) => onPublicChange(event.target.checked)}
          className="mt-1 h-4 w-4 rounded border-slate-300 text-[#1B4F8C] disabled:opacity-40"
        />
        <span className="text-sm leading-6 text-slate-700">
          <span className="font-medium text-slate-900">
            {PRIVACY_COPY.publicProfileLabel}
          </span>
          <span className="mt-1 block text-slate-500">
            {PRIVACY_COPY.publicProfileHint}
          </span>
        </span>
      </label>

      <label className="flex items-start gap-3 rounded-lg border border-slate-200 bg-white px-3 py-3">
        <input
          type="checkbox"
          checked={isDiscoverable}
          disabled={!hasConsent || !isPublic}
          onChange={(event) => onDiscoverableChange(event.target.checked)}
          className="mt-1 h-4 w-4 rounded border-slate-300 text-[#1B4F8C] disabled:opacity-40"
        />
        <span className="text-sm leading-6 text-slate-700">
          <span className="font-medium text-slate-900">
            {PRIVACY_COPY.discoverableLabel}
          </span>
          <span className="mt-1 block text-slate-500">
            {PRIVACY_COPY.discoverableHint}
          </span>
        </span>
      </label>
    </div>
  );
}

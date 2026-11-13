"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { getPlayerInitials } from "@/lib/player-utils";
import { supabase } from "@/lib/supabase";

interface PlayerAvatarProps {
  firstName: string;
  lastName: string;
  photoUrl?: string | null;
  size?: "sm" | "md" | "lg" | "xl";
}

const sizeClasses = {
  sm: "h-10 w-10 text-xs rounded-full",
  md: "h-12 w-12 text-sm rounded-full",
  lg: "h-16 w-16 text-base rounded-full",
  xl: "h-28 w-28 text-xl rounded-2xl sm:h-32 sm:w-32",
};

function needsPrivateBucketSign(url: string) {
  return (
    url.includes("/storage/v1/object/public/player-photos/") ||
    url.includes("/storage/v1/object/public/player-videos/")
  );
}

const signedCache = new Map<string, string>();

async function resolveSignedPhotoUrl(photoUrl: string): Promise<string> {
  if (!needsPrivateBucketSign(photoUrl)) return photoUrl;
  const cached = signedCache.get(photoUrl);
  if (cached) return cached;

  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session?.access_token) return photoUrl;

  const response = await fetch("/fut/api/media/sign", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.access_token}`,
    },
    body: JSON.stringify({ urls: [photoUrl] }),
  });
  if (!response.ok) return photoUrl;
  const payload = (await response.json().catch(() => ({}))) as {
    signed?: Record<string, string>;
  };
  const next = payload.signed?.[photoUrl] || photoUrl;
  signedCache.set(photoUrl, next);
  return next;
}

export function PlayerAvatar({
  firstName,
  lastName,
  photoUrl,
  size = "sm",
}: PlayerAvatarProps) {
  const [resolvedUrl, setResolvedUrl] = useState<string | null>(
    photoUrl && !needsPrivateBucketSign(photoUrl) ? photoUrl : null,
  );
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setFailed(false);

    if (!photoUrl) {
      setResolvedUrl(null);
      return;
    }

    if (!needsPrivateBucketSign(photoUrl)) {
      setResolvedUrl(photoUrl);
      return;
    }

    setResolvedUrl(signedCache.get(photoUrl) ?? null);
    void resolveSignedPhotoUrl(photoUrl).then((url) => {
      if (!cancelled) setResolvedUrl(url);
    });

    return () => {
      cancelled = true;
    };
  }, [photoUrl]);

  const showPhoto = Boolean(resolvedUrl) && !failed;

  if (showPhoto) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={resolvedUrl!}
        alt=""
        className={cn("object-cover", sizeClasses[size])}
        onError={() => setFailed(true)}
      />
    );
  }

  return (
    <div
      className={cn(
        "flex items-center justify-center bg-slate-100 font-semibold text-slate-500",
        sizeClasses[size],
      )}
    >
      {getPlayerInitials(firstName, lastName)}
    </div>
  );
}

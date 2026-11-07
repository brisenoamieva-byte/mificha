"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { getPlayerInitials } from "@/lib/player-utils";

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

export function PlayerAvatar({
  firstName,
  lastName,
  photoUrl,
  size = "sm",
}: PlayerAvatarProps) {
  const [failed, setFailed] = useState(false);
  const showPhoto = Boolean(photoUrl) && !failed;

  if (showPhoto) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={photoUrl!}
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

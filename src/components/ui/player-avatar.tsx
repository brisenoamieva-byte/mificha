"use client";

import { cn } from "@/lib/utils";
import { getPlayerInitials } from "@/lib/player-utils";

interface PlayerAvatarProps {
  firstName: string;
  lastName: string;
  photoUrl?: string | null;
  size?: "sm" | "md" | "lg";
}

const sizeClasses = {
  sm: "h-10 w-10 text-xs",
  md: "h-12 w-12 text-sm",
  lg: "h-16 w-16 text-base",
};

export function PlayerAvatar({
  firstName,
  lastName,
  photoUrl,
  size = "sm",
}: PlayerAvatarProps) {
  if (photoUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={photoUrl}
        alt={`${firstName} ${lastName}`}
        className={cn("rounded-full object-cover", sizeClasses[size])}
      />
    );
  }

  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-full bg-slate-100 font-semibold text-slate-500",
        sizeClasses[size],
      )}
    >
      {getPlayerInitials(firstName, lastName)}
    </div>
  );
}

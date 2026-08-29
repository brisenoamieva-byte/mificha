"use client";

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
  if (photoUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={photoUrl}
        alt={`${firstName} ${lastName}`}
        className={cn("object-cover", sizeClasses[size])}
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

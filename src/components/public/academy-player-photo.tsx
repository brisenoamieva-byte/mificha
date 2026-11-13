"use client";

import { useState } from "react";
import { getPlayerInitials } from "@/lib/player-utils";

export function AcademyPlayerPhoto({
  photoUrl,
  firstName,
  lastName,
}: {
  photoUrl: string | null;
  firstName: string;
  lastName: string;
}) {
  const [broken, setBroken] = useState(false);
  const initials = getPlayerInitials(firstName, lastName);

  if (!photoUrl || broken) {
    return (
      <div className="flex h-full items-center justify-center bg-gradient-to-br from-slate-800 to-slate-950 text-5xl font-black text-slate-600">
        {initials}
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={photoUrl}
      alt={`${firstName} ${lastName}`}
      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
      onError={() => setBroken(true)}
    />
  );
}

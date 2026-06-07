"use client";

import { LogOut, Menu } from "lucide-react";
import { useRouter } from "next/navigation";
import { useDashboard } from "@/components/dashboard/dashboard-context";
import { signOut } from "@/lib/auth";
import { cn } from "@/lib/utils";

interface DashboardHeaderProps {
  onMenuClick: () => void;
}

function getInitials(name: string | null | undefined, email: string | null | undefined) {
  if (name) {
    return name
      .split(" ")
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("");
  }

  return email?.slice(0, 2).toUpperCase() ?? "MF";
}

export function DashboardHeader({ onMenuClick }: DashboardHeaderProps) {
  const router = useRouter();
  const { profile, academy } = useDashboard();

  async function handleSignOut() {
    await signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-40 border-b border-mf-border bg-mf-surface">
      <div className="flex items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            onClick={onMenuClick}
            className="rounded-md p-2 text-mf-text-secondary hover:bg-black/[0.04] lg:hidden"
            aria-label="Abrir menú"
          >
            <Menu className="h-5 w-5" />
          </button>

          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-mf-text">
              {academy?.name ?? "MiFicha"}
            </p>
            <p className="truncate text-xs text-mf-text-muted">
              {profile?.full_name ?? profile?.email ?? "Panel de academia"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {profile?.avatar_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={profile.avatar_url}
              alt={profile.full_name ?? "Avatar"}
              className="h-9 w-9 rounded-full object-cover ring-1 ring-mf-border"
            />
          ) : (
            <div
              className={cn(
                "flex h-9 w-9 items-center justify-center rounded-full bg-mf-brand-soft text-xs font-semibold text-mf-brand",
              )}
            >
              {getInitials(profile?.full_name, profile?.email)}
            </div>
          )}

          <button
            type="button"
            onClick={handleSignOut}
            className="mf-btn-ghost"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Salir</span>
          </button>
        </div>
      </div>
    </header>
  );
}

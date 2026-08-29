"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState, type ReactNode } from "react";
import { supabase } from "@/lib/supabase";
import type { Academy, Profile } from "@/types/database";
import { DashboardContext } from "@/components/dashboard/dashboard-context";
import { DashboardHeader } from "@/components/dashboard/header";
import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { Skeleton } from "@/components/dashboard/skeletons";

interface DashboardShellProps {
  children: ReactNode;
}

export function DashboardShell({ children }: DashboardShellProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [academy, setAcademy] = useState<Academy | null>(null);
  const [accessRole, setAccessRole] = useState<"owner" | "staff" | null>(null);
  const [isGphEvaluator, setIsGphEvaluator] = useState(false);

  const loadDashboard = useCallback(async () => {
    setLoading(true);

    try {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError) throw sessionError;
      if (!session?.user) {
        router.replace("/fut/login");
        return;
      }

      await fetch("/fut/api/academy/members/claim", {
        method: "POST",
        headers: { Authorization: `Bearer ${session.access_token}` },
      }).catch(() => undefined);

      const response = await fetch("/fut/api/academy/session", {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      const payload = (await response.json()) as {
        profile?: Profile | null;
        academy?: Academy | null;
        role?: "owner" | "staff" | null;
        evaluator?: boolean;
        error?: string;
      };

      if (!response.ok) {
        throw new Error(payload.error || "No se pudo cargar el panel.");
      }

      setProfile(payload.profile ?? null);
      setAcademy(payload.academy ?? null);
      setAccessRole(payload.role ?? null);
      setIsGphEvaluator(Boolean(payload.evaluator));
    } catch (loadError) {
      console.error(
        "dashboard load",
        loadError instanceof Error ? loadError.message : loadError,
      );
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) router.replace("/fut/login");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  if (loading) {
    return (
      <div className="min-h-dvh bg-mf-canvas">
        <div className="flex">
          <aside className="hidden w-64 border-r border-slate-200 bg-white lg:block">
            <div className="space-y-4 p-6">
              <Skeleton className="h-10 w-32" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          </aside>
          <div className="flex-1 p-6">
            <Skeleton className="h-16 w-full" />
            <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <Skeleton key={index} className="h-28" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <DashboardContext.Provider
      value={{
        loading,
        profile,
        academy,
        accessRole,
        isGphEvaluator,
        refresh: loadDashboard,
      }}
    >
      <div className="min-h-dvh bg-mf-canvas">
        <div className="flex min-h-dvh">
          <DashboardSidebar
            open={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
          />

          <div className="flex min-w-0 flex-1 flex-col">
            <DashboardHeader onMenuClick={() => setSidebarOpen(true)} />
            <main className="mf-page-bottom flex-1 px-4 py-6 sm:px-6 sm:py-8">{children}</main>
          </div>
        </div>
      </div>
    </DashboardContext.Provider>
  );
}

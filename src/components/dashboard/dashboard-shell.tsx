"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState, type ReactNode } from "react";
import { getCurrentUser } from "@/lib/auth";
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

  const loadDashboard = useCallback(async () => {
    setLoading(true);

    try {
      const user = await getCurrentUser();
      if (!user) {
        router.replace("/login");
        return;
      }

      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (profileError) throw profileError;

      const { data: academyData } = await supabase
        .from("academies")
        .select("*")
        .eq("owner_id", user.id)
        .maybeSingle();

      setProfile(profileData);
      setAcademy(academyData);
    } catch {
      router.replace("/login");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  if (loading) {
    return (
      <div className="min-h-screen bg-mf-canvas">
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
        refresh: loadDashboard,
      }}
    >
      <div className="min-h-screen bg-mf-canvas">
        <div className="flex min-h-screen">
          <DashboardSidebar
            open={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
          />

          <div className="flex min-w-0 flex-1 flex-col">
            <DashboardHeader onMenuClick={() => setSidebarOpen(true)} />
            <main className="flex-1 px-4 py-6 sm:px-6 sm:py-8">{children}</main>
          </div>
        </div>
      </div>
    </DashboardContext.Provider>
  );
}

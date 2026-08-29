import type { Academy, Profile } from "@/types/database";
import { createContext, useContext } from "react";

interface DashboardContextValue {
  loading: boolean;
  profile: Profile | null;
  academy: Academy | null;
  accessRole: "owner" | "staff" | null;
  isGphEvaluator: boolean;
  refresh: () => Promise<void>;
}

export const DashboardContext = createContext<DashboardContextValue | null>(
  null,
);

export function useDashboard() {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error("useDashboard must be used within DashboardShell");
  }
  return context;
}

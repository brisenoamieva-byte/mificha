"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  LineChart,
  Mail,
  ClipboardList,
  Settings,
  Trophy,
  Users,
  X,
} from "lucide-react";
import { BrandLogo } from "@/components/ui/brand-logo";
import { PitchDeckNavLink } from "@/components/dashboard/pitch-deck-nav-link";
import { useDashboard } from "@/components/dashboard/dashboard-context";

const navItems = [
  { href: "/fut/dashboard", label: "Inicio", icon: LayoutDashboard },
  { href: "/fut/dashboard/diagnostico", label: "Diagnósticos", icon: ClipboardList },
  { href: "/fut/dashboard/plantel", label: "Plantel", icon: Users },
  { href: "/fut/dashboard/plantel/tutores", label: "Avisos a tutores", icon: Mail },
  { href: "/fut/dashboard/partidos", label: "Partidos", icon: Trophy },
  { href: "/fut/dashboard/rendimiento", label: "Rendimiento", icon: LineChart },
  { href: "/fut/dashboard/configuracion", label: "Configuración", icon: Settings },
];

interface DashboardSidebarProps {
  open: boolean;
  onClose: () => void;
}

export function DashboardSidebar({ open, onClose }: DashboardSidebarProps) {
  const pathname = usePathname();
  const { isGphEvaluator } = useDashboard();

  const content = (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-mf-border px-4 py-4 lg:hidden">
        <BrandLogo />
        <button
          type="button"
          onClick={onClose}
          className="rounded-md p-2 text-mf-text-secondary hover:bg-black/[0.04]"
          aria-label="Cerrar menú"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {navItems.map(({ href, label, icon: Icon }) => {
          const itemLabel =
            href === "/fut/dashboard/diagnostico" && isGphEvaluator
              ? "Diagnósticos GPH"
              : label;
          const isActive =
            href === "/fut/dashboard"
              ? pathname === href
              : href === "/fut/dashboard/plantel"
                ? pathname === href
                : pathname.startsWith(href);

          return (
            <Link
              key={href}
              href={href}
              onClick={onClose}
              className={isActive ? "mf-nav-link-active" : "mf-nav-link"}
            >
              <Icon className="h-[18px] w-[18px] shrink-0" />
              {itemLabel}
            </Link>
          );
        })}
        <PitchDeckNavLink onClose={onClose} />
      </nav>
    </div>
  );

  return (
    <>
      <aside className="hidden w-[240px] shrink-0 border-r border-mf-border bg-mf-surface lg:block">
        <div className="sticky top-0 flex h-screen flex-col">
          <div className="border-b border-mf-border px-4 py-4">
            <BrandLogo />
          </div>
          {content}
        </div>
      </aside>

      {open ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/40"
            onClick={onClose}
            aria-label="Cerrar menú"
          />
          <aside className="relative flex h-full max-h-dvh w-[280px] max-w-[85vw] flex-col border-r border-mf-border bg-mf-surface mf-safe-top mf-safe-bottom">
            {content}
          </aside>
        </div>
      ) : null}
    </>
  );
}

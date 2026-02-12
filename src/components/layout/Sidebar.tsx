"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Table,
  Columns3,
  Settings,
  Plus,
} from "lucide-react";
import { cn } from "~/lib/utils";
import { QuickAddModal } from "~/components/shared/QuickAddModal";
import { VictorSierraLogo } from "~/components/shared/VictorSierraLogo";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/", icon: LayoutDashboard },
  { label: "Pipeline", href: "/pipeline", icon: Table },
  { label: "Kanban", href: "/kanban", icon: Columns3 },
  { label: "Settings", href: "/settings", icon: Settings },
] as const;

export function Sidebar() {
  const pathname = usePathname();
  const [quickAddOpen, setQuickAddOpen] = useState(false);

  return (
    <>
      <aside
        className={cn(
          "group/sidebar hidden md:flex flex-col",
          "w-16 hover:w-60 transition-all duration-300 overflow-hidden",
          "bg-[#0f172a] text-white"
        )}
      >
        {/* Logo Area */}
        <div className="flex h-14 items-center px-3 border-b border-white/10 shrink-0">
          {/* Collapsed: mark only */}
          <div className="shrink-0 group-hover/sidebar:hidden">
            <VictorSierraLogo markOnly size={32} navyColor="#93c5fd" goldColor="#E5A21A" />
          </div>
          {/* Expanded: full logo */}
          <div className="hidden group-hover/sidebar:flex items-center">
            <VictorSierraLogo size={36} navyColor="#93c5fd" goldColor="#E5A21A" />
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 space-y-1 px-2">
          {NAV_ITEMS.map((item) => {
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);

            return (
              <Link
                key={`${item.label}-${item.href}`}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors whitespace-nowrap",
                  isActive
                    ? "bg-white/10 text-white border-l-2 border-blue-600"
                    : "text-slate-400 hover:bg-white/5 hover:text-white border-l-2 border-transparent"
                )}
              >
                <item.icon className="h-5 w-5 shrink-0" />
                <span className="opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-300">
                  {item.label}
                </span>
              </Link>
            );
          })}

          {/* Add New Button */}
          <button
            onClick={() => setQuickAddOpen(true)}
            className={cn(
              "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors whitespace-nowrap",
              "text-slate-400 hover:bg-white/5 hover:text-white border-l-2 border-transparent"
            )}
          >
            <Plus className="h-5 w-5 shrink-0" />
            <span className="opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-300">
              Add New
            </span>
          </button>
        </nav>

        {/* Bottom section */}
        <div className="border-t border-white/10 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-semibold">
              VS
            </div>
            <div className="opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-300 whitespace-nowrap">
              <p className="text-sm font-medium">VSA Team</p>
              <p className="text-xs text-slate-400">Acquisitions</p>
            </div>
          </div>
        </div>
      </aside>

      <QuickAddModal open={quickAddOpen} onOpenChange={setQuickAddOpen} />
    </>
  );
}

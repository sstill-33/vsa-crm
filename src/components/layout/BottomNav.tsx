"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Table,
  Plus,
  Columns3,
  MoreHorizontal,
} from "lucide-react";
import { type LucideIcon } from "lucide-react";
import { cn } from "~/lib/utils";
import { QuickAddModal } from "~/components/shared/QuickAddModal";

interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  isAction?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", href: "/", icon: LayoutDashboard },
  { label: "Pipeline", href: "/pipeline", icon: Table },
  { label: "Add", href: "#add", icon: Plus, isAction: true },
  { label: "Kanban", href: "/kanban", icon: Columns3 },
  { label: "More", href: "/settings", icon: MoreHorizontal },
];

export function BottomNav() {
  const pathname = usePathname();
  const [quickAddOpen, setQuickAddOpen] = useState(false);

  return (
    <>
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t bg-white pb-[env(safe-area-inset-bottom)]">
        <nav className="flex items-center justify-around px-2 py-1">
          {NAV_ITEMS.map((item) => {
            if (item.isAction) {
              return (
                <button
                  key={item.label}
                  onClick={() => setQuickAddOpen(true)}
                  className="flex flex-col items-center justify-center gap-0.5 px-3 py-1.5 -mt-4"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg">
                    <item.icon className="h-5 w-5" />
                  </div>
                  <span className="text-xs font-medium text-blue-600">
                    {item.label}
                  </span>
                </button>
              );
            }

            const isActive =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.label}
                href={item.href}
                className="flex flex-col items-center justify-center gap-0.5 px-3 py-1.5"
              >
                <item.icon
                  className={cn(
                    "h-5 w-5",
                    isActive ? "text-blue-600" : "text-slate-400"
                  )}
                />
                <span
                  className={cn(
                    "text-xs",
                    isActive
                      ? "font-medium text-blue-600"
                      : "text-slate-400"
                  )}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>
      </div>

      <QuickAddModal open={quickAddOpen} onOpenChange={setQuickAddOpen} />
    </>
  );
}

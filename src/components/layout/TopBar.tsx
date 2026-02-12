"use client";

import { usePathname } from "next/navigation";
import { GlobalSearch } from "~/components/shared/GlobalSearch";
import { QuickAddButton } from "~/components/shared/QuickAddModal";
import { VictorSierraLogo } from "~/components/shared/VictorSierraLogo";

const PAGE_TITLES: Record<string, string> = {
  "/": "Dashboard",
  "/pipeline": "Pipeline",
  "/kanban": "Kanban Board",
  "/company/new": "New Company",
  "/settings": "Settings",
};

function getPageTitle(pathname: string): string {
  if (PAGE_TITLES[pathname]) {
    return PAGE_TITLES[pathname];
  }
  if (pathname.startsWith("/company/")) {
    return "Company Detail";
  }
  return "VSA CRM";
}

export function TopBar() {
  const pathname = usePathname();
  const title = getPageTitle(pathname);

  return (
    <header className="flex h-14 shrink-0 items-center justify-between gap-4 border-b bg-white px-4 md:px-6">
      {/* Logo (mobile) + Page Title */}
      <div className="flex items-center gap-3">
        <div className="md:hidden">
          <VictorSierraLogo markOnly size={28} />
        </div>
        <h2 className="text-lg font-semibold tracking-tight truncate">{title}</h2>
      </div>

      {/* Search + Actions */}
      <div className="flex items-center gap-2">
        <GlobalSearch />
        <QuickAddButton />
      </div>
    </header>
  );
}

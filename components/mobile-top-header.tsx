"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { DollarSign, ChevronLeft } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { cn } from "@/lib/utils";

// Map paths to display titles for the mobile header
const pageTitles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/dashboard/portfolio": "Businesses",
  "/dashboard/personal": "Personal Finance",
  "/dashboard/net-worth": "Net Worth",
  "/dashboard/accounts": "All Accounts",
  "/dashboard/loans": "Loans & Lending",
  "/dashboard/cash-flow": "Cash Flow",
  "/dashboard/insurance": "Insurance",
  "/dashboard/advisor": "AI Advisor",
  "/dashboard/statements": "Financial Statement",
};

function getPageInfo(pathname: string): { title: string; showBack: boolean; backHref: string } {
  // Business detail pages
  if (pathname.match(/^\/dashboard\/portfolio\/.+/)) {
    return { title: "Business Detail", showBack: true, backHref: "/dashboard/portfolio" };
  }

  const title = pageTitles[pathname] ?? "FinanceOS";
  const showBack = pathname !== "/dashboard" && pathname.split("/").length > 2;
  return { title, showBack, backHref: "/dashboard" };
}

export function MobileTopHeader() {
  const pathname = usePathname();
  const { title, showBack, backHref } = getPageInfo(pathname);
  const isRoot = pathname === "/dashboard";

  return (
    <header className={cn(
      "lg:hidden fixed top-0 left-0 right-0 z-40 h-14",
      "bg-card/95 backdrop-blur-xl border-b border-border",
      "flex items-center px-4 gap-3"
    )}>
      {/* Left: back button or logo */}
      <div className="flex items-center gap-2 flex-1 min-w-0">
        {showBack && !isRoot ? (
          <Link
            href={backHref}
            className="flex items-center gap-1 text-primary text-sm font-medium -ml-1 shrink-0"
          >
            <ChevronLeft className="size-4" />
            <span className="text-xs">Back</span>
          </Link>
        ) : (
          <Link href="/dashboard" className="flex items-center gap-2 shrink-0">
            <div className="flex size-7 items-center justify-center rounded-lg bg-primary shadow-sm">
              <DollarSign className="size-3.5 text-primary-foreground" strokeWidth={2.5} />
            </div>
          </Link>
        )}

        {/* Page title */}
        <h1 className={cn(
          "font-bold text-foreground truncate",
          showBack && !isRoot ? "text-sm ml-1" : "text-base"
        )}>
          {isRoot ? "FinanceOS" : title}
        </h1>
      </div>

      {/* Right: theme toggle */}
      <ThemeToggle size="sm" />
    </header>
  );
}

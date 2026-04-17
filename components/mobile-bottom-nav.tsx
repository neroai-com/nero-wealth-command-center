"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Building2,
  User,
  Brain,
  MoreHorizontal,
  TrendingUp,
  Wallet,
  Landmark,
  Shield,
  BarChart3,
  FileText,
  X,
  DollarSign,
} from "lucide-react";
import { useState } from "react";

// Primary 4 tabs always visible
const primaryTabs = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/dashboard/portfolio", label: "Business", icon: Building2, exact: false },
  { href: "/dashboard/personal", label: "Personal", icon: User, exact: false },
  { href: "/dashboard/advisor", label: "AI Advisor", icon: Brain, exact: false },
];

// All other pages accessible via "More" sheet
const moreItems = [
  { href: "/dashboard/net-worth", label: "Net Worth", icon: TrendingUp },
  { href: "/dashboard/accounts", label: "All Accounts", icon: Wallet },
  { href: "/dashboard/loans", label: "Loans & Lending", icon: Landmark },
  { href: "/dashboard/cash-flow", label: "Cash Flow", icon: BarChart3 },
  { href: "/dashboard/insurance", label: "Insurance", icon: Shield },
  { href: "/dashboard/statements", label: "Financial Statement", icon: FileText },
];

function isActive(href: string, pathname: string, exact: boolean) {
  if (exact) return pathname === href;
  return pathname === href || pathname.startsWith(href + "/");
}

export function MobileBottomNav() {
  const pathname = usePathname();
  const [moreOpen, setMoreOpen] = useState(false);

  const isMoreActive = moreItems.some(
    (item) => pathname === item.href || pathname.startsWith(item.href + "/")
  );

  return (
    <>
      {/* Bottom Nav Bar */}
      <nav
        className={cn(
          "lg:hidden fixed bottom-0 left-0 right-0 z-50",
          "bg-card/95 backdrop-blur-xl border-t border-border",
          "pb-safe"
        )}
        style={{ paddingBottom: "max(env(safe-area-inset-bottom), 0px)" }}
      >
        <div className="flex items-stretch h-16">
          {primaryTabs.map((tab) => {
            const active = isActive(tab.href, pathname, tab.exact ?? false);
            return (
              <Link
                key={tab.href}
                href={tab.href}
                onClick={() => setMoreOpen(false)}
                className={cn(
                  "flex-1 flex flex-col items-center justify-center gap-1 pt-1",
                  "active:scale-95 transition-transform duration-100",
                  "relative group"
                )}
              >
                {active && (
                  <motion.div
                    layoutId="bottom-nav-indicator"
                    className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-primary rounded-full"
                    transition={{ type: "spring", stiffness: 500, damping: 40 }}
                  />
                )}
                <div className={cn(
                  "flex items-center justify-center rounded-xl transition-all duration-200",
                  active ? "text-primary" : "text-muted-foreground",
                )}>
                  <tab.icon
                    className={cn(
                      "transition-all duration-200",
                      active ? "size-5 scale-110" : "size-5"
                    )}
                    strokeWidth={active ? 2.2 : 1.8}
                  />
                </div>
                <span className={cn(
                  "text-[10px] font-medium leading-none transition-colors duration-200",
                  active ? "text-primary" : "text-muted-foreground"
                )}>
                  {tab.label}
                </span>
              </Link>
            );
          })}

          {/* More Tab */}
          <button
            onClick={() => setMoreOpen((v) => !v)}
            className={cn(
              "flex-1 flex flex-col items-center justify-center gap-1 pt-1",
              "active:scale-95 transition-transform duration-100",
              "relative"
            )}
          >
            {isMoreActive && !moreOpen && (
              <motion.div
                layoutId="bottom-nav-indicator"
                className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-primary rounded-full"
                transition={{ type: "spring", stiffness: 500, damping: 40 }}
              />
            )}
            <MoreHorizontal
              className={cn(
                "size-5 transition-colors duration-200",
                isMoreActive || moreOpen ? "text-primary" : "text-muted-foreground"
              )}
              strokeWidth={1.8}
            />
            <span className={cn(
              "text-[10px] font-medium leading-none transition-colors duration-200",
              isMoreActive || moreOpen ? "text-primary" : "text-muted-foreground"
            )}>
              More
            </span>
          </button>
        </div>
      </nav>

      {/* More Sheet (bottom sheet) */}
      {moreOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMoreOpen(false)}
            className="lg:hidden fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
          />

          {/* Sheet */}
          <motion.div
            key="sheet"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 400, damping: 40 }}
            className={cn(
              "lg:hidden fixed left-0 right-0 z-50 bottom-0",
              "bg-card rounded-t-3xl border-t border-border shadow-2xl",
            )}
            style={{ paddingBottom: "max(env(safe-area-inset-bottom), 16px)" }}
          >
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 bg-muted-foreground/25 rounded-full" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-border">
              <div className="flex items-center gap-2.5">
                <div className="flex size-7 items-center justify-center rounded-lg bg-primary">
                  <DollarSign className="size-3.5 text-primary-foreground" strokeWidth={2.5} />
                </div>
                <span className="text-sm font-bold text-foreground">More Sections</span>
              </div>
              <button
                onClick={() => setMoreOpen(false)}
                className="flex size-7 items-center justify-center rounded-full bg-muted text-muted-foreground hover:text-foreground"
              >
                <X className="size-3.5" />
              </button>
            </div>

            {/* Grid of items */}
            <div className="grid grid-cols-3 gap-3 p-4">
              {moreItems.map((item) => {
                const active = pathname === item.href || pathname.startsWith(item.href + "/");
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMoreOpen(false)}
                    className={cn(
                      "flex flex-col items-center gap-2 p-4 rounded-2xl",
                      "active:scale-95 transition-all duration-150",
                      active
                        ? "bg-primary/10 border border-primary/20"
                        : "bg-muted hover:bg-accent border border-transparent"
                    )}
                  >
                    <div className={cn(
                      "flex size-10 items-center justify-center rounded-xl",
                      active ? "bg-primary text-primary-foreground" : "bg-background text-muted-foreground"
                    )}>
                      <item.icon className="size-5" strokeWidth={1.8} />
                    </div>
                    <span className={cn(
                      "text-[11px] font-medium text-center leading-tight",
                      active ? "text-primary" : "text-foreground"
                    )}>
                      {item.label}
                    </span>
                  </Link>
                );
              })}
            </div>
          </motion.div>
        </>
      )}
    </>
  );
}

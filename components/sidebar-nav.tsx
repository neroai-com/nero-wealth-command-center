"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Building2,
  User,
  TrendingUp,
  Brain,
  Landmark,
  FileText,
  ChevronRight,
  Wallet,
  Shield,
  BarChart3,
  DollarSign,
  Settings,
  LogOut,
} from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { motion } from "framer-motion";

const nav = [
  {
    label: "Overview",
    items: [
      { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, exact: true },
      { href: "/dashboard/portfolio", label: "Businesses", icon: Building2 },
      { href: "/dashboard/personal", label: "Personal Finance", icon: User },
      { href: "/dashboard/net-worth", label: "Net Worth", icon: TrendingUp },
    ],
  },
  {
    label: "Finance",
    items: [
      { href: "/dashboard/accounts", label: "All Accounts", icon: Wallet },
      { href: "/dashboard/loans", label: "Loans & Lending", icon: Landmark },
      { href: "/dashboard/insurance", label: "Insurance", icon: Shield },
      { href: "/dashboard/cash-flow", label: "Cash Flow", icon: BarChart3 },
    ],
  },
  {
    label: "Intelligence",
    items: [
      { href: "/dashboard/advisor", label: "AI Advisor", icon: Brain },
      { href: "/dashboard/statements", label: "Financial Statement", icon: FileText },
    ],
  },
];

function isActive(href: string, pathname: string, exact?: boolean) {
  if (exact) return pathname === href;
  return pathname === href || pathname.startsWith(href + "/");
}

export function SidebarNav() {
  const pathname = usePathname();

  return (
    <>
      {/* ─── Desktop Sidebar ─────────────────────────────────────── */}
      <aside className="hidden lg:flex w-64 shrink-0 flex-col border-r border-border bg-sidebar h-screen sticky top-0">
        {/* Logo */}
        <div className="flex items-center justify-between px-5 py-5 border-b border-sidebar-border">
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <div className="flex size-8 items-center justify-center rounded-xl bg-primary shadow-sm">
              <DollarSign className="size-4 text-primary-foreground" strokeWidth={2.5} />
            </div>
            <span className="text-[17px] font-bold text-foreground tracking-tight">FinanceOS</span>
          </Link>
          <ThemeToggle size="sm" />
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
          {nav.map((group) => (
            <div key={group.label}>
              <p className="px-3 mb-1.5 text-[9px] font-bold uppercase tracking-[0.12em] text-muted-foreground/70">
                {group.label}
              </p>
              <ul className="space-y-0.5">
                {group.items.map((item) => {
                  const active = isActive(item.href, pathname, (item as { exact?: boolean }).exact);
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className={cn(
                          "relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150",
                          active
                            ? "bg-primary text-primary-foreground shadow-sm"
                            : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                        )}
                      >
                        {active && (
                          <motion.div
                            layoutId="sidebar-active"
                            className="absolute inset-0 bg-primary rounded-xl -z-10"
                            transition={{ type: "spring", stiffness: 500, damping: 40 }}
                          />
                        )}
                        <item.icon className="size-4 shrink-0" strokeWidth={active ? 2.2 : 1.8} />
                        <span className="flex-1">{item.label}</span>
                        {active && <ChevronRight className="size-3 opacity-60" />}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        {/* User section */}
        <div className="border-t border-sidebar-border px-4 py-4 space-y-1">
          <button className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors">
            <Settings className="size-4" strokeWidth={1.8} />
            <span>Settings</span>
          </button>
          <Link
            href="/"
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
          >
            <LogOut className="size-4" strokeWidth={1.8} />
            <span>Sign out</span>
          </Link>
          <div className="flex items-center gap-3 px-3 py-2 mt-1">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold">
              MJ
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-foreground truncate">Marcus Johnson</p>
              <p className="text-[11px] text-muted-foreground truncate">marcus@financeos.com</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  Building2,
  TrendingUp,
  Users,
  ChevronRight,
  Plus,
  DollarSign,
  ArrowUpRight,
} from "lucide-react";
import { BarChart, Bar, ResponsiveContainer } from "recharts";
import { businesses } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

const fmt = (n: number) =>
  n >= 1_000_000 ? `$${(n / 1_000_000).toFixed(2)}M` :
  n >= 1_000 ? `$${(n / 1_000).toFixed(0)}K` : `$${n.toLocaleString()}`;

const colors = {
  indigo: {
    bg: "bg-primary/10 dark:bg-primary/20",
    text: "text-primary",
    bar: "var(--color-primary)",
    badge: "bg-primary/10 text-primary dark:bg-primary/20",
    profitBg: "bg-primary/5 dark:bg-primary/10",
  },
  violet: {
    bg: "bg-violet-100 dark:bg-violet-950/50",
    text: "text-violet-700 dark:text-violet-400",
    bar: "#7c3aed",
    badge: "bg-violet-100 dark:bg-violet-950/50 text-violet-700 dark:text-violet-400",
    profitBg: "bg-violet-50 dark:bg-violet-950/30",
  },
  emerald: {
    bg: "bg-emerald-100 dark:bg-emerald-950/50",
    text: "text-emerald-700 dark:text-emerald-400",
    bar: "#059669",
    badge: "bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400",
    profitBg: "bg-emerald-50 dark:bg-emerald-950/30",
  },
};

const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.07 } } };
const fadeUp = { hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0, transition: { duration: 0.38, ease: [0.2, 0.8, 0.2, 1] } } };

export default function PortfolioPage() {
  const totalRevenue = businesses.reduce((a, b) => a + b.revenue, 0);
  const totalProfit = businesses.reduce((a, b) => a + b.profit, 0);
  const totalEmployees = businesses.reduce((a, b) => a + b.employees, 0);

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-5 max-w-7xl mx-auto space-y-5 lg:space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.38 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-xl font-bold text-foreground">Businesses</h1>
          <p className="text-xs text-muted-foreground mt-0.5">30,000-ft portfolio view</p>
        </div>
        <button className="inline-flex items-center gap-1.5 rounded-full bg-primary px-3.5 py-2 text-xs font-semibold text-primary-foreground hover:brightness-95 active:scale-95 transition-all duration-150 shadow-sm">
          <Plus className="size-3.5" />
          Add
        </button>
      </motion.div>

      {/* Portfolio KPIs */}
      <motion.div variants={stagger} initial="hidden" animate="show" className="grid grid-cols-3 gap-2.5">
        {[
          { label: "Revenue", value: fmt(totalRevenue), sub: "TTM", icon: DollarSign, color: "text-primary", bg: "bg-primary/10 dark:bg-primary/20" },
          { label: "Profit", value: fmt(totalProfit), sub: `${((totalProfit / totalRevenue) * 100).toFixed(0)}% margin`, icon: TrendingUp, color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-950/40" },
          { label: "Team", value: String(totalEmployees), sub: "Employees", icon: Users, color: "text-violet-600 dark:text-violet-400", bg: "bg-violet-100 dark:bg-violet-950/40" },
        ].map((k) => (
          <motion.div key={k.label} variants={fadeUp}
            className="bg-card rounded-2xl border border-border shadow-sm p-3"
          >
            <div className={cn("flex size-6 items-center justify-center rounded-lg mb-2", k.bg)}>
              <k.icon className={cn("size-3", k.color)} />
            </div>
            <p className="text-base font-bold text-foreground leading-none">{k.value}</p>
            <p className="text-[10px] text-muted-foreground mt-1">{k.sub}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* Business Cards — stack on mobile, 3-col on lg */}
      <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-3 lg:grid lg:grid-cols-3 lg:gap-5 lg:space-y-0">
        {businesses.map((biz) => {
          const c = colors[biz.color as keyof typeof colors];
          return (
            <motion.div key={biz.id} variants={fadeUp}>
              <Link
                href={`/dashboard/portfolio/${biz.id}`}
                className="block bg-card rounded-2xl border border-border shadow-sm overflow-hidden hover:shadow-md active:scale-[0.99] transition-all duration-200 group"
              >
                {/* Card top */}
                <div className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className={cn("flex size-10 shrink-0 items-center justify-center rounded-xl text-sm font-bold", c.bg, c.text)}>
                      {biz.name.charAt(0)}{biz.name.split(" ")[1]?.charAt(0)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-foreground text-sm leading-tight truncate">{biz.name}</h3>
                      <p className="text-[11px] text-muted-foreground">{biz.employees} employees</p>
                    </div>
                    <span className={cn("text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0", c.badge)}>
                      {biz.type}
                    </span>
                  </div>

                  {/* Revenue/Expenses/Profit — horizontal on mobile */}
                  <div className="grid grid-cols-3 gap-2">
                    <div className="bg-muted rounded-xl p-2.5">
                      <p className="text-[9px] text-muted-foreground uppercase tracking-wide font-medium">Revenue</p>
                      <p className="text-xs font-bold text-foreground mt-0.5">{fmt(biz.revenue)}</p>
                    </div>
                    <div className="bg-muted rounded-xl p-2.5">
                      <p className="text-[9px] text-muted-foreground uppercase tracking-wide font-medium">Expenses</p>
                      <p className="text-xs font-bold text-foreground mt-0.5">{fmt(biz.expenses)}</p>
                    </div>
                    <div className={cn("rounded-xl p-2.5", c.profitBg)}>
                      <p className={cn("text-[9px] uppercase tracking-wide font-medium", c.text)}>Profit</p>
                      <p className={cn("text-xs font-bold mt-0.5", c.text)}>{fmt(biz.profit)}</p>
                    </div>
                  </div>
                </div>

                {/* Mini chart */}
                <div className="px-4 pb-1">
                  <ResponsiveContainer width="100%" height={40}>
                    <BarChart data={biz.monthlyRevenue.slice(-6).map((v, i) => ({
                      m: ["A","S","O","N","D","J"][i], v
                    }))} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                      <Bar dataKey="v" fill={c.bar} radius={[2, 2, 0, 0]} opacity={0.8} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-muted/30">
                  <span className="text-[11px] text-muted-foreground">
                    {biz.payables.filter(p => p.status === "overdue").length > 0 ? (
                      <span className="text-destructive font-medium">
                        {biz.payables.filter(p => p.status === "overdue").length} overdue
                      </span>
                    ) : (
                      <span className="text-emerald-600 dark:text-emerald-400 font-medium">All current</span>
                    )}
                  </span>
                  <span className="flex items-center gap-1 text-xs text-primary font-semibold">
                    View <ArrowUpRight className="size-3" />
                  </span>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}

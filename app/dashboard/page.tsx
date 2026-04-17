"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  TrendingUp,
  ArrowUpRight,
  Building2,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Brain,
  Wallet,
  Activity,
  ChevronRight,
  DollarSign,
  Zap,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import {
  user,
  businesses,
  upcomingPayments,
  cashFlow,
  netWorthHistory,
  aiInsights,
  assets,
  liabilities,
} from "@/lib/mock-data";
import { cn } from "@/lib/utils";

const fmt = (n: number) =>
  n >= 1_000_000
    ? `$${(n / 1_000_000).toFixed(2)}M`
    : n >= 1_000
    ? `$${(n / 1_000).toFixed(0)}K`
    : `$${n.toLocaleString()}`;

const statusColors: Record<string, string> = {
  overdue: "text-destructive bg-destructive/10",
  due: "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50",
  upcoming: "text-muted-foreground bg-muted",
};

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};
const fadeUp = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.38, ease: [0.2, 0.8, 0.2, 1] } },
};

export default function DashboardPage() {
  const score = user.financialScore;
  const scorePercent = (score / 850) * 100;

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-5 max-w-7xl mx-auto space-y-5 lg:space-y-8">

      {/* ─── Header ────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.38 }}
        className="flex items-center justify-between"
      >
        <div>
          <p className="text-xs text-muted-foreground">Good morning,</p>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground leading-tight">
            Marcus 👋
          </h1>
        </div>
        <Link
          href="/dashboard/advisor"
          className="inline-flex items-center gap-1.5 rounded-full bg-primary px-3.5 py-2 text-xs font-semibold text-primary-foreground shadow-sm hover:brightness-95 active:scale-95 transition-all duration-150"
        >
          <Zap className="size-3.5" />
          AI Advisor
        </Link>
      </motion.div>

      {/* ─── Score + KPIs ──────────────────────────────────────────── */}
      <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-3">
        {/* Financial Score banner — mobile prominent */}
        <motion.div variants={fadeUp}>
          <Link href="/dashboard/net-worth" className="block">
            <div className="bg-primary rounded-2xl p-4 flex items-center gap-4 shadow-sm hover:brightness-95 active:scale-[0.99] transition-all duration-150">
              {/* Ring */}
              <div className="relative w-16 h-16 shrink-0">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 64 64">
                  <circle cx="32" cy="32" r="26" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="6" />
                  <circle
                    cx="32" cy="32" r="26" fill="none"
                    stroke="white" strokeWidth="6"
                    strokeDasharray={`${(scorePercent / 100) * 163} 163`}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-lg font-bold text-white leading-none">{score}</span>
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-white/70 font-medium">Financial Score</p>
                <p className="text-white font-bold text-lg leading-tight">Very Good</p>
                <p className="text-white/70 text-xs mt-0.5">+{user.scoreChange} pts this month</p>
              </div>
              <div className="shrink-0 flex flex-col items-end gap-1">
                <span className="text-xs text-white/70">Net Worth</span>
                <span className="text-white font-bold text-base">{fmt(user.netWorth)}</span>
                <span className="text-xs text-white/70 flex items-center gap-0.5">
                  <TrendingUp className="size-3" />+{user.netWorthChange}%
                </span>
              </div>
            </div>
          </Link>
        </motion.div>

        {/* KPI grid — 2×2 on mobile */}
        <motion.div variants={fadeUp} className="grid grid-cols-2 gap-3">
          {[
            {
              label: "Liquid Cash",
              value: fmt(user.liquidCash),
              sub: "Available now",
              icon: DollarSign,
              color: "text-primary",
              bg: "bg-primary/10",
            },
            {
              label: "Monthly Burn",
              value: fmt(user.monthlyBurnRate),
              sub: "Avg 3 months",
              icon: Activity,
              color: "text-amber-600 dark:text-amber-400",
              bg: "bg-amber-50 dark:bg-amber-950/40",
            },
            {
              label: "Debt-to-Income",
              value: `${(user.debtToIncome * 100).toFixed(0)}%`,
              sub: "Excellent",
              icon: CheckCircle2,
              color: "text-emerald-600 dark:text-emerald-400",
              bg: "bg-emerald-50 dark:bg-emerald-950/40",
            },
            {
              label: "Total Assets",
              value: fmt(assets.total),
              sub: "All categories",
              icon: TrendingUp,
              color: "text-violet-600 dark:text-violet-400",
              bg: "bg-violet-50 dark:bg-violet-950/40",
            },
          ].map((kpi) => (
            <div
              key={kpi.label}
              className="bg-card rounded-2xl border border-border p-3.5 shadow-sm"
            >
              <div className="flex items-center justify-between mb-2.5">
                <p className="text-[11px] font-medium text-muted-foreground leading-tight">{kpi.label}</p>
                <div className={cn("flex size-6 items-center justify-center rounded-lg", kpi.bg)}>
                  <kpi.icon className={cn("size-3", kpi.color)} />
                </div>
              </div>
              <p className="text-lg font-bold text-foreground leading-none">{kpi.value}</p>
              <p className="text-[10px] text-muted-foreground mt-1">{kpi.sub}</p>
            </div>
          ))}
        </motion.div>
      </motion.div>

      {/* ─── Net Worth Chart ───────────────────────────────────────── */}
      <motion.div
        variants={fadeUp}
        initial="hidden"
        animate="show"
        className="bg-card rounded-2xl border border-border shadow-sm p-4"
      >
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-sm font-semibold text-foreground">Net Worth Trend</h2>
            <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium mt-0.5">
              +$367K (14.8%) past 7 months
            </p>
          </div>
          <Link href="/dashboard/net-worth" className="flex items-center gap-1 text-xs text-primary font-medium">
            Details <ChevronRight className="size-3" />
          </Link>
        </div>
        <ResponsiveContainer width="100%" height={130}>
          <AreaChart data={netWorthHistory} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
            <defs>
              <linearGradient id="nwGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.25} />
                <stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <XAxis dataKey="month" tick={{ fontSize: 10, fill: "var(--color-muted-foreground)" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 10, fill: "var(--color-muted-foreground)" }} axisLine={false} tickLine={false}
              tickFormatter={(v) => `$${(v / 1_000_000).toFixed(1)}M`} />
            <Tooltip
              contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: 10, fontSize: 11 }}
              formatter={(v: number) => [`$${(v / 1_000_000).toFixed(3)}M`, "Net Worth"]}
            />
            <Area type="monotone" dataKey="value" stroke="var(--color-primary)" strokeWidth={2.5}
              fill="url(#nwGrad)" dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </motion.div>

      {/* ─── Business Portfolio ────────────────────────────────────── */}
      <motion.div
        variants={stagger}
        initial="hidden"
        animate="show"
      >
        <motion.div variants={fadeUp} className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-border">
            <h2 className="text-sm font-semibold text-foreground">Business Portfolio</h2>
            <Link href="/dashboard/portfolio" className="flex items-center gap-1 text-xs text-primary font-medium">
              View All <ChevronRight className="size-3" />
            </Link>
          </div>
          <div className="divide-y divide-border">
            {businesses.map((biz) => (
              <Link
                key={biz.id}
                href={`/dashboard/portfolio/${biz.id}`}
                className="flex items-center gap-3 px-4 py-3.5 hover:bg-accent active:bg-accent/80 transition-colors group"
              >
                <div className={cn(
                  "flex size-9 shrink-0 items-center justify-center rounded-xl text-xs font-bold",
                  biz.color === "indigo" ? "bg-primary/10 text-primary" :
                  biz.color === "violet" ? "bg-violet-100 dark:bg-violet-950/50 text-violet-700 dark:text-violet-400" :
                  "bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400"
                )}>
                  {biz.name.charAt(0)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-foreground truncate">{biz.name}</p>
                  <p className="text-[11px] text-muted-foreground">{biz.type}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-bold text-foreground">{fmt(biz.profit)}</p>
                  <p className="text-[10px] text-emerald-600 dark:text-emerald-400">+{biz.profitMargin}%</p>
                </div>
                <ChevronRight className="size-4 text-muted-foreground/50 group-hover:text-muted-foreground transition-colors shrink-0" />
              </Link>
            ))}
          </div>
          <div className="flex items-center justify-between px-4 py-3 bg-muted/40 border-t border-border">
            <span className="text-xs text-muted-foreground">Combined Revenue</span>
            <span className="text-sm font-bold text-foreground">
              {fmt(businesses.reduce((a, b) => a + b.revenue, 0))}
            </span>
          </div>
        </motion.div>
      </motion.div>

      {/* ─── Cash Flow + Upcoming (stacked on mobile, side by side on lg) */}
      <motion.div
        variants={stagger}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 lg:grid-cols-2 gap-5"
      >
        {/* Cash Flow */}
        <motion.div variants={fadeUp} className="bg-card rounded-2xl border border-border shadow-sm p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-foreground">Cash Flow</h2>
            <Link href="/dashboard/cash-flow" className="flex items-center gap-1 text-xs text-primary font-medium">
              Details <ChevronRight className="size-3" />
            </Link>
          </div>
          <div className="flex items-center gap-4 mb-3">
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide font-medium">Income</p>
              <p className="text-base font-bold text-emerald-600 dark:text-emerald-400">{fmt(cashFlow.thisMonth.income)}</p>
            </div>
            <div className="w-px h-7 bg-border" />
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide font-medium">Expenses</p>
              <p className="text-base font-bold text-destructive">{fmt(cashFlow.thisMonth.expenses)}</p>
            </div>
            <div className="w-px h-7 bg-border" />
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide font-medium">Net</p>
              <p className="text-base font-bold text-foreground">{fmt(cashFlow.thisMonth.net)}</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={110}>
            <BarChart data={cashFlow.last6Months} margin={{ top: 4, right: 4, left: -24, bottom: 0 }} barGap={2}>
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: "var(--color-muted-foreground)" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "var(--color-muted-foreground)" }} axisLine={false} tickLine={false}
                tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`} />
              <Tooltip
                contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: 10, fontSize: 11 }}
                formatter={(v: number) => [`$${(v / 1000).toFixed(1)}K`]}
              />
              <Bar dataKey="income" fill="var(--color-chart-1)" radius={[3, 3, 0, 0]} />
              <Bar dataKey="expenses" fill="var(--color-chart-5)" radius={[3, 3, 0, 0]} opacity={0.7} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Upcoming Payments */}
        <motion.div variants={fadeUp} className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-border">
            <div className="flex items-center gap-2">
              <Clock className="size-3.5 text-primary" />
              <h2 className="text-sm font-semibold text-foreground">Upcoming Payments</h2>
            </div>
            <span className="text-xs text-muted-foreground">
              {fmt(upcomingPayments.slice(0, 5).reduce((a, p) => a + p.amount, 0))} due
            </span>
          </div>
          <div className="divide-y divide-border">
            {upcomingPayments.slice(0, 5).map((p, i) => (
              <div key={i} className="flex items-center gap-3 px-4 py-3">
                <div className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-muted">
                  <Wallet className="size-3.5 text-muted-foreground" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-foreground truncate">{p.name}</p>
                  <p className="text-[10px] text-muted-foreground">
                    {new Date(p.due).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </p>
                </div>
                <span className={cn("text-[10px] font-semibold rounded-full px-2 py-0.5 shrink-0", statusColors[p.status])}>
                  {p.status === "overdue" ? "Overdue" : `$${p.amount.toLocaleString()}`}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      </motion.div>

      {/* ─── AI Insights ──────────────────────────────────────────── */}
      <motion.div
        variants={stagger}
        initial="hidden"
        animate="show"
      >
        <motion.div variants={fadeUp} className="bg-card rounded-2xl border border-border shadow-sm p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="flex size-6 items-center justify-center rounded-lg bg-primary/10">
                <Brain className="size-3.5 text-primary" />
              </div>
              <h2 className="text-sm font-semibold text-foreground">AI Advisor Insights</h2>
            </div>
            <Link href="/dashboard/advisor" className="flex items-center gap-1 text-xs text-primary font-medium">
              All <ChevronRight className="size-3" />
            </Link>
          </div>
          <div className="space-y-2.5">
            {aiInsights.slice(0, 3).map((insight) => (
              <div key={insight.id} className={cn(
                "flex gap-3 p-3 rounded-xl border",
                insight.priority === "high"
                  ? "border-amber-200 dark:border-amber-800/50 bg-amber-50/60 dark:bg-amber-950/30"
                  : "border-border bg-muted/40"
              )}>
                <div className={cn(
                  "flex size-5 shrink-0 items-center justify-center rounded-full mt-0.5",
                  insight.priority === "high"
                    ? "bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400"
                    : "bg-primary/10 text-primary"
                )}>
                  {insight.priority === "high" ? <AlertTriangle className="size-3" /> : <Brain className="size-3" />}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-foreground leading-tight">{insight.title}</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-2">{insight.summary}</p>
                </div>
                <ArrowUpRight className="size-3.5 text-muted-foreground/50 shrink-0 mt-0.5" />
              </div>
            ))}
          </div>
        </motion.div>
      </motion.div>

    </div>
  );
}

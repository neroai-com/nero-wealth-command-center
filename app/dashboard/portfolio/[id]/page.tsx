"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  Users,
  Building2,
  Wallet,
  AlertTriangle,
  CheckCircle2,
  Receipt,
  CreditCard,
} from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { businesses } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import { useState } from "react";

const fmt = (n: number) =>
  n >= 1_000_000 ? `$${(n / 1_000_000).toFixed(2)}M` :
  n >= 1_000 ? `$${(n / 1_000).toFixed(1)}K` : `$${n.toLocaleString()}`;

const tabs = [
  { id: "Overview", icon: Building2 },
  { id: "Vendors", icon: Users },
  { id: "Bills", icon: Receipt },
  { id: "Payables", icon: CreditCard },
  { id: "Team", icon: Users },
  { id: "Accounts", icon: Wallet },
];

export default function BusinessDetailPage() {
  const { id } = useParams();
  const biz = businesses.find((b) => b.id === id);
  const [activeTab, setActiveTab] = useState("Overview");

  if (!biz) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <p className="text-muted-foreground">Business not found.</p>
        <Link href="/dashboard/portfolio" className="text-primary underline text-sm">Back to Portfolio</Link>
      </div>
    );
  }

  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const chartData = biz.monthlyRevenue.map((v, i) => ({ month: months[i], revenue: v }));

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-5 max-w-7xl mx-auto space-y-5">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-foreground leading-tight">{biz.name}</h1>
            <p className="text-xs text-muted-foreground mt-0.5">{biz.type} · {biz.employees} employees · EIN: {biz.ein}</p>
          </div>
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold rounded-full px-2.5 py-1 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 shrink-0">
            <CheckCircle2 className="size-3" />
            Active
          </span>
        </div>
      </motion.div>

      {/* KPIs */}
      <motion.div
        initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.38, delay: 0.07 }}
        className="grid grid-cols-2 gap-2.5"
      >
        {[
          { label: "Revenue", value: fmt(biz.revenue), color: "text-foreground" },
          { label: "Expenses", value: fmt(biz.expenses), color: "text-foreground" },
          { label: "Net Profit", value: fmt(biz.profit), color: "text-emerald-600 dark:text-emerald-400" },
          { label: "Margin", value: `${biz.profitMargin}%`, color: "text-primary" },
        ].map((k) => (
          <div key={k.label} className="bg-card rounded-2xl border border-border shadow-sm p-3">
            <p className="text-[10px] text-muted-foreground font-medium">{k.label}</p>
            <p className={cn("text-lg font-bold mt-0.5 leading-none", k.color)}>{k.value}</p>
          </div>
        ))}
      </motion.div>

      {/* Revenue Chart */}
      <motion.div
        initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.38, delay: 0.1 }}
        className="bg-card rounded-2xl border border-border shadow-sm p-4"
      >
        <h2 className="text-sm font-semibold text-foreground mb-3">Monthly Revenue — 2025</h2>
        <ResponsiveContainer width="100%" height={130}>
          <AreaChart data={chartData} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
            <defs>
              <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.2} />
                <stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0.01} />
              </linearGradient>
            </defs>
            <XAxis dataKey="month" tick={{ fontSize: 10, fill: "var(--color-muted-foreground)" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 10, fill: "var(--color-muted-foreground)" }} axisLine={false} tickLine={false}
              tickFormatter={(v) => `$${(v / 1000).toFixed(0)}K`} />
            <Tooltip
              contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: 10, fontSize: 11 }}
              formatter={(v: number) => [`$${(v / 1000).toFixed(1)}K`, "Revenue"]}
            />
            <Area type="monotone" dataKey="revenue" stroke="var(--color-primary)" strokeWidth={2.5}
              fill="url(#revGrad)" dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Pill Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4 scrollbar-none">
        {tabs.map((tab) => {
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex items-center gap-1.5 shrink-0 px-4 py-2 rounded-full text-xs font-semibold transition-all duration-150 active:scale-95",
                active
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-muted text-muted-foreground hover:text-foreground hover:bg-accent"
              )}
            >
              {tab.id}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
      >
        {activeTab === "Overview" && (
          <div className="space-y-3">
            <div className="bg-card rounded-2xl border border-border p-4">
              <div className="flex items-center gap-2 mb-3">
                <Building2 className="size-3.5 text-primary" />
                <h3 className="font-semibold text-foreground text-sm">Quick Summary</h3>
              </div>
              <div className="space-y-2.5 text-sm">
                {[
                  { label: "Type", value: biz.type },
                  { label: "EIN", value: biz.ein },
                  { label: "Employees", value: String(biz.employees) },
                  { label: "Vendors", value: String(biz.vendors.length) },
                  { label: "Open Payables", value: String(biz.payables.length) },
                ].map((r) => (
                  <div key={r.label} className="flex justify-between items-center py-1.5 border-b border-border last:border-0">
                    <span className="text-muted-foreground text-xs">{r.label}</span>
                    <span className="font-medium text-xs">{r.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {biz.payables.length > 0 && (
              <div className="bg-card rounded-2xl border border-border p-4">
                <div className="flex items-center gap-2 mb-3">
                  <AlertTriangle className="size-3.5 text-amber-600 dark:text-amber-400" />
                  <h3 className="font-semibold text-foreground text-sm">Pending Actions</h3>
                </div>
                <div className="space-y-2">
                  {biz.payables.map((p, i) => (
                    <div key={i} className={cn(
                      "flex items-center justify-between p-3 rounded-xl border",
                      p.status === "overdue"
                        ? "bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800/50"
                        : "bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800/50"
                    )}>
                      <span className={cn("text-xs font-medium", p.status === "overdue" ? "text-red-700 dark:text-red-400" : "text-amber-800 dark:text-amber-400")}>{p.vendor}</span>
                      <span className="text-sm font-bold text-foreground">${p.amount.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === "Vendors" && (
          <div className="space-y-2.5">
            {biz.vendors.map((v, i) => (
              <div key={i} className="bg-card rounded-2xl border border-border p-4 flex items-center gap-3">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                  <Users className="size-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">{v.name}</p>
                  <span className="text-[10px] bg-secondary text-secondary-foreground px-2 py-0.5 rounded-full">{v.category}</span>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-bold text-foreground">${v.monthly.toLocaleString()}/mo</p>
                  <p className="text-[10px] text-muted-foreground">${(v.monthly * 12).toLocaleString()}/yr</p>
                </div>
              </div>
            ))}
            <div className="bg-muted rounded-2xl p-4 flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground">Total Monthly</span>
              <span className="text-sm font-bold text-primary">${biz.vendors.reduce((a, v) => a + v.monthly, 0).toLocaleString()}</span>
            </div>
          </div>
        )}

        {activeTab === "Bills" && (
          <div className="space-y-2.5">
            {biz.bills.map((b, i) => (
              <div key={i} className="bg-card rounded-2xl border border-border p-4 flex items-center gap-3">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-muted">
                  <Receipt className="size-4 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground">{b.name}</p>
                  <span className="text-[10px] bg-secondary text-secondary-foreground px-2 py-0.5 rounded-full capitalize">{b.frequency}</span>
                </div>
                <p className="text-sm font-bold text-foreground shrink-0">${b.amount.toLocaleString()}</p>
              </div>
            ))}
          </div>
        )}

        {activeTab === "Payables" && (
          <div className="space-y-2.5">
            {biz.payables.map((p, i) => (
              <div key={i} className={cn(
                "rounded-2xl border p-4",
                p.status === "overdue"
                  ? "bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800/50"
                  : "bg-card border-border"
              )}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-foreground text-sm">{p.vendor}</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      Due: {new Date(p.due).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-lg font-bold text-foreground">${p.amount.toLocaleString()}</p>
                    <span className={cn(
                      "text-[10px] font-bold px-2 py-0.5 rounded-full",
                      p.status === "overdue"
                        ? "bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-400"
                        : "bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-400"
                    )}>
                      {p.status === "overdue" ? "OVERDUE" : "PENDING"}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === "Team" && (
          <div className="space-y-2.5">
            {biz.team.map((m, i) => (
              <div key={i} className="bg-card rounded-2xl border border-border p-4 flex items-center gap-3">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-sm font-bold">
                  {m.name.split(" ").map(n => n[0]).join("")}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-sm text-foreground">{m.name}</p>
                  <p className="text-xs text-muted-foreground">{m.role}</p>
                  <p className="text-[11px] text-muted-foreground truncate">{m.email}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === "Accounts" && (
          <div className="space-y-2.5">
            {biz.accounts.map((a, i) => (
              <div key={i} className="bg-card rounded-2xl border border-border p-4 flex items-center gap-3">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                  <Wallet className="size-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-foreground">{a.name}</p>
                  <span className="text-[10px] bg-secondary text-secondary-foreground px-2 py-0.5 rounded-full capitalize">{a.type}</span>
                </div>
                <p className="text-base font-bold text-foreground shrink-0">${a.balance.toLocaleString()}</p>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}

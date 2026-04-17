"use client";

import { motion } from "framer-motion";
import {
  Home,
  Car,
  CreditCard,
  Wallet,
  TrendingUp,
  AlertTriangle,
  Users,
  Percent,
} from "lucide-react";
import { personalFinances, user } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import { useState } from "react";

const fmt = (n: number) =>
  n >= 1_000_000 ? `$${(n / 1_000_000).toFixed(2)}M` :
  n >= 1_000 ? `$${(n / 1_000).toFixed(1)}K` : `$${n.toLocaleString()}`;

const tabs = [
  { id: "Mortgages", icon: Home },
  { id: "Vehicles", icon: Car },
  { id: "Credit", icon: CreditCard },
  { id: "Accounts", icon: Wallet },
  { id: "Family", icon: Users },
];

export default function PersonalPage() {
  const [activeTab, setActiveTab] = useState("Mortgages");

  const totalMortgageBalance = personalFinances.mortgages.reduce((a, m) => a + m.balance, 0);
  const totalVehicleBalance = personalFinances.vehicles.reduce((a, v) => a + v.balance, 0);
  const totalCCBalance = personalFinances.creditCards.reduce((a, c) => a + c.balance, 0);
  const totalCCLimit = personalFinances.creditCards.reduce((a, c) => a + c.limit, 0);
  const cashAccounts = personalFinances.bankAccounts.filter(a => ["checking","savings"].includes(a.type));
  const investAccounts = personalFinances.bankAccounts.filter(a => ["investment","retirement"].includes(a.type));

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-5 max-w-7xl mx-auto space-y-5">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
        <h1 className="text-xl font-bold text-foreground">Personal Finance</h1>
        <p className="text-xs text-muted-foreground mt-0.5">Mortgages, vehicles, credit & cash</p>
      </motion.div>

      {/* Summary row */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.38, delay: 0.05 }}
        className="grid grid-cols-2 gap-2.5"
      >
        {[
          { label: "Total Debt", value: fmt(totalMortgageBalance + totalVehicleBalance + totalCCBalance), icon: Home, color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-50 dark:bg-amber-950/40" },
          { label: "Available Cash", value: fmt(cashAccounts.reduce((a, b) => a + b.balance, 0)), icon: Wallet, color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-950/40" },
          { label: "Investments", value: fmt(investAccounts.reduce((a, b) => a + b.balance, 0)), icon: TrendingUp, color: "text-primary", bg: "bg-primary/10 dark:bg-primary/20" },
          { label: "Credit Util.", value: `${((totalCCBalance / totalCCLimit) * 100).toFixed(0)}%`, icon: Percent, color: "text-violet-600 dark:text-violet-400", bg: "bg-violet-100 dark:bg-violet-950/40" },
        ].map((k) => (
          <div key={k.label} className="bg-card rounded-2xl border border-border shadow-sm p-3.5">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[11px] font-medium text-muted-foreground">{k.label}</p>
              <div className={cn("flex size-6 items-center justify-center rounded-lg", k.bg)}>
                <k.icon className={cn("size-3", k.color)} />
              </div>
            </div>
            <p className="text-lg font-bold text-foreground leading-none">{k.value}</p>
          </div>
        ))}
      </motion.div>

      {/* Pill tabs — scrollable on mobile */}
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
              <tab.icon className="size-3" />
              {tab.id}
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      <motion.div key={activeTab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.22 }}>

        {activeTab === "Mortgages" && (
          <div className="space-y-3">
            {personalFinances.mortgages.map((m) => (
              <div key={m.id} className="bg-card rounded-2xl border border-border shadow-sm p-4">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-start gap-3">
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                      <Home className="size-4 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground text-sm">{m.property}</h3>
                      <p className="text-[11px] text-muted-foreground">{m.lender} · {m.type}</p>
                    </div>
                  </div>
                  {m.refinanceOpportunity && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800/50 rounded-full px-2 py-0.5 shrink-0">
                      <AlertTriangle className="size-2.5" />
                      Refi
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2 mb-3">
                  {[
                    { label: "Balance", value: fmt(m.balance) },
                    { label: "Rate", value: `${m.rate}%` },
                    { label: "Payment", value: fmt(m.payment) + "/mo" },
                    { label: "Equity", value: fmt(m.equity) },
                  ].map((s) => (
                    <div key={s.label} className="bg-muted rounded-xl p-2.5">
                      <p className="text-[10px] text-muted-foreground">{s.label}</p>
                      <p className="text-sm font-bold text-foreground mt-0.5">{s.value}</p>
                    </div>
                  ))}
                </div>

                <div>
                  <div className="flex justify-between text-[11px] text-muted-foreground mb-1">
                    <span>Equity {((m.equity / m.estimatedValue) * 100).toFixed(0)}%</span>
                    <span>Value: {fmt(m.estimatedValue)}</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full"
                      style={{ width: `${(m.equity / m.estimatedValue) * 100}%` }}
                    />
                  </div>
                  {m.refinanceOpportunity && (
                    <p className="text-[11px] text-amber-600 dark:text-amber-400 mt-1.5 font-medium">
                      💡 Save ~${m.refinanceSavings}/mo by refinancing now
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === "Vehicles" && (
          <div className="space-y-3">
            {personalFinances.vehicles.map((v) => (
              <div key={v.id} className="bg-card rounded-2xl border border-border shadow-sm p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-violet-100 dark:bg-violet-950/50">
                    <Car className="size-4 text-violet-700 dark:text-violet-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground text-sm">{v.vehicle}</h3>
                    <p className="text-[11px] text-muted-foreground">{v.lender}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 mb-3">
                  {[
                    { label: "Balance", value: fmt(v.balance) },
                    { label: "Rate", value: `${v.rate}%` },
                    { label: "Payment", value: `${fmt(v.payment)}/mo` },
                    { label: "Remaining", value: `${v.remainingMonths} mo` },
                  ].map((s) => (
                    <div key={s.label} className="bg-muted rounded-xl p-2.5">
                      <p className="text-[10px] text-muted-foreground">{s.label}</p>
                      <p className="text-sm font-bold">{s.value}</p>
                    </div>
                  ))}
                </div>
                <div>
                  <div className="flex justify-between text-[11px] text-muted-foreground mb-1">
                    <span>{(((v.term - v.remainingMonths) / v.term) * 100).toFixed(0)}% paid off</span>
                    <span>{v.remainingMonths} mo left</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-violet-500 rounded-full"
                      style={{ width: `${((v.term - v.remainingMonths) / v.term) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === "Credit" && (
          <div className="space-y-3">
            {personalFinances.creditCards.map((cc, i) => {
              const utilization = (cc.balance / cc.limit) * 100;
              const statusColor = utilization < 10
                ? "text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40"
                : utilization < 30
                ? "text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40"
                : "text-destructive bg-destructive/10";
              const barColor = utilization < 10 ? "bg-emerald-500" : utilization < 30 ? "bg-amber-500" : "bg-destructive";
              return (
                <div key={i} className="bg-card rounded-2xl border border-border shadow-sm p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                        <CreditCard className="size-4 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground text-sm">{cc.name}</h3>
                        <p className="text-[11px] text-muted-foreground">{cc.rate}% APR</p>
                      </div>
                    </div>
                    <span className={cn("text-[10px] font-bold rounded-full px-2.5 py-1", statusColor)}>
                      {utilization.toFixed(0)}%
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 mb-3">
                    {[
                      { label: "Balance", value: `$${cc.balance.toLocaleString()}` },
                      { label: "Limit", value: `$${cc.limit.toLocaleString()}` },
                      { label: "Min Pay", value: `$${cc.payment}` },
                    ].map((s) => (
                      <div key={s.label} className="bg-muted rounded-xl p-2.5 text-center">
                        <p className="text-[10px] text-muted-foreground">{s.label}</p>
                        <p className="text-xs font-bold">{s.value}</p>
                      </div>
                    ))}
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className={cn("h-full rounded-full", barColor)} style={{ width: `${utilization}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {activeTab === "Accounts" && (
          <div className="space-y-3">
            {personalFinances.bankAccounts.map((acct, i) => {
              const typeMap: Record<string, { bg: string; text: string; label: string }> = {
                checking: { bg: "bg-primary/10 dark:bg-primary/20", text: "text-primary", label: "Checking" },
                savings: { bg: "bg-emerald-50 dark:bg-emerald-950/40", text: "text-emerald-700 dark:text-emerald-400", label: "Savings" },
                investment: { bg: "bg-violet-100 dark:bg-violet-950/40", text: "text-violet-700 dark:text-violet-400", label: "Investment" },
                retirement: { bg: "bg-amber-50 dark:bg-amber-950/40", text: "text-amber-700 dark:text-amber-400", label: "Retirement" },
              };
              const tc = typeMap[acct.type] || typeMap.checking;
              return (
                <div key={i} className="bg-card rounded-2xl border border-border shadow-sm p-4 flex items-center gap-3">
                  <div className={cn("flex size-10 shrink-0 items-center justify-center rounded-xl", tc.bg)}>
                    <Wallet className={cn("size-4", tc.text)} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">{acct.name}</p>
                    <p className="text-[11px] text-muted-foreground">{acct.institution}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-base font-bold text-foreground">${acct.balance.toLocaleString()}</p>
                    <span className={cn("text-[10px] font-semibold rounded-full px-2 py-0.5", tc.bg, tc.text)}>
                      {tc.label}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {activeTab === "Family" && (
          <div className="space-y-3">
            {[{ name: user.name, relation: "You", avatar: user.avatar }, ...user.familyMembers].map((m, i) => (
              <div key={i} className="bg-card rounded-2xl border border-border shadow-sm p-4 flex items-center gap-3">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-sm">
                  {m.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-foreground">{m.name}</p>
                  <p className="text-[11px] text-muted-foreground">{m.relation}</p>
                </div>
                <button className="text-xs text-primary font-medium px-3 py-1.5 rounded-full bg-primary/10 active:scale-95 transition-transform">
                  View
                </button>
              </div>
            ))}
            <div className="bg-primary/5 rounded-2xl border border-primary/20 p-4">
              <p className="text-sm font-medium text-foreground mb-1">👨‍👩‍👦 Family Financial View</p>
              <p className="text-xs text-muted-foreground">
                Add accounts and financial data for family members to see a combined household view, shared goals, and family net worth.
              </p>
            </div>
          </div>
        )}

      </motion.div>
    </div>
  );
}

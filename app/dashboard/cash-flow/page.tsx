"use client";

import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Activity } from "lucide-react";
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend,
} from "recharts";
import { cashFlow } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

const fmt = (n: number) =>
  n >= 1_000 ? `$${(n / 1_000).toFixed(1)}K` : `$${n.toLocaleString()}`;

const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.07 } } };
const fadeUp = { hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0, transition: { duration: 0.35 } } };

const extendedData = [
  ...cashFlow.last6Months.map(m => ({ ...m, net: m.income - m.expenses, savingsRate: (((m.income - m.expenses) / m.income) * 100).toFixed(1) })),
];

const expenseBreakdown = [
  { category: "Housing", amount: 8800, pct: 25.7 },
  { category: "Business Payables", amount: 6200, pct: 18.1 },
  { category: "Insurance", amount: 1293, pct: 3.8 },
  { category: "Vehicles", amount: 2071, pct: 6.1 },
  { category: "Food & Dining", amount: 2800, pct: 8.2 },
  { category: "Utilities", amount: 1800, pct: 5.3 },
  { category: "Subscriptions", amount: 480, pct: 1.4 },
  { category: "Other", amount: 10756, pct: 31.4 },
];

export default function CashFlowPage() {
  const { thisMonth } = cashFlow;
  const savingsRate = (((thisMonth.income - thisMonth.expenses) / thisMonth.income) * 100).toFixed(1);

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 max-w-7xl mx-auto space-y-8">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
        <h1 className="text-2xl font-bold text-foreground">Cash Flow</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Income, expenses, and savings rate analysis</p>
      </motion.div>

      {/* This Month */}
      <motion.div variants={stagger} initial="hidden" animate="show" className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Income This Month", value: fmt(thisMonth.income), icon: TrendingUp, color: "text-emerald-600", bg: "bg-emerald-50" },
          { label: "Expenses This Month", value: fmt(thisMonth.expenses), icon: TrendingDown, color: "text-destructive", bg: "bg-red-50" },
          { label: "Net Cash Flow", value: fmt(thisMonth.net), icon: Activity, color: "text-primary", bg: "bg-primary/10" },
          { label: "Savings Rate", value: `${savingsRate}%`, icon: TrendingUp, color: "text-emerald-600", bg: "bg-emerald-50" },
        ].map((k) => (
          <motion.div key={k.label} variants={fadeUp} className="bg-card rounded-xl border border-border shadow-sm p-4">
            <div className="flex items-start justify-between mb-2">
              <p className="text-xs font-medium text-muted-foreground">{k.label}</p>
              <div className={cn("flex size-7 items-center justify-center rounded-lg", k.bg)}>
                <k.icon className={cn("size-3.5", k.color)} />
              </div>
            </div>
            <p className="text-xl font-bold text-foreground">{k.value}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* Bar Chart */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }}
        className="bg-card rounded-xl border border-border shadow-sm p-6"
      >
        <h2 className="font-semibold text-foreground mb-4">Income vs Expenses (6 Months)</h2>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={extendedData} margin={{ top: 4, right: 4, left: -10, bottom: 0 }} barGap={4}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
            <XAxis dataKey="month" tick={{ fontSize: 12, fill: "var(--color-muted-foreground)" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }} axisLine={false} tickLine={false}
              tickFormatter={(v) => `$${(v / 1000).toFixed(0)}K`} />
            <Tooltip
              contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: 10, fontSize: 12 }}
              formatter={(v: number) => [fmt(v)]}
            />
            <Legend />
            <Bar dataKey="income" name="Income" fill="var(--color-chart-1)" radius={[4, 4, 0, 0]} />
            <Bar dataKey="expenses" name="Expenses" fill="var(--color-chart-5)" radius={[4, 4, 0, 0]} opacity={0.8} />
            <Bar dataKey="net" name="Net" fill="var(--color-chart-2)" radius={[4, 4, 0, 0]} opacity={0.9} />
          </BarChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Expense Breakdown */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.2 }}
        className="bg-card rounded-xl border border-border shadow-sm p-6"
      >
        <h2 className="font-semibold text-foreground mb-4">Expense Breakdown — This Month</h2>
        <div className="space-y-3">
          {expenseBreakdown.map((e) => (
            <div key={e.category}>
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="text-foreground font-medium">{e.category}</span>
                <div className="flex items-center gap-3">
                  <span className="text-muted-foreground text-xs">{e.pct}%</span>
                  <span className="font-bold text-foreground w-20 text-right">${e.amount.toLocaleString()}</span>
                </div>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${e.pct}%`, opacity: 0.6 + (e.pct / 100) * 0.4 }} />
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

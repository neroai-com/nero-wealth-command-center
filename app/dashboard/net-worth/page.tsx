"use client";

import { motion } from "framer-motion";
import {
  TrendingUp,
  Home,
  Car,
  Wallet,
  Building2,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from "recharts";
import { assets, liabilities, netWorthHistory, user } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

const fmt = (n: number) =>
  n >= 1_000_000 ? `$${(n / 1_000_000).toFixed(3)}M` :
  n >= 1_000 ? `$${(n / 1_000).toFixed(1)}K` : `$${n.toLocaleString()}`;

const assetPie = [
  { name: "Real Estate", value: assets.realEstate, color: "#4f46e5" },
  { name: "Business Equity", value: assets.businessEquity, color: "#7c3aed" },
  { name: "Investments", value: assets.investments, color: "#059669" },
  { name: "Cash", value: assets.cash, color: "#0ea5e9" },
  { name: "Vehicles", value: assets.vehicles, color: "#f59e0b" },
  { name: "Other", value: assets.other, color: "#94a3b8" },
];

const liabPie = [
  { name: "Mortgages", value: liabilities.mortgages, color: "#4f46e5" },
  { name: "Vehicle Loans", value: liabilities.vehicleLoans, color: "#7c3aed" },
  { name: "Credit Cards", value: liabilities.creditCards, color: "#ef4444" },
];

const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.07 } } };
const fadeUp = { hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0, transition: { duration: 0.35 } } };

export default function NetWorthPage() {
  const netWorth = assets.total - liabilities.total;

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 max-w-7xl mx-auto space-y-8">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
        <h1 className="text-2xl font-bold text-foreground">Net Worth</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Complete assets vs. liabilities breakdown</p>
      </motion.div>

      {/* Big Number */}
      <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4 }}
        className="bg-card rounded-2xl border border-border shadow-sm p-8 text-center"
      >
        <p className="text-sm font-medium text-muted-foreground mb-2">Total Net Worth</p>
        <p className="text-5xl sm:text-6xl font-extrabold text-foreground mb-2">{fmt(netWorth)}</p>
        <div className="flex items-center justify-center gap-2">
          <TrendingUp className="size-4 text-emerald-600" />
          <span className="text-sm font-semibold text-emerald-600">+{user.netWorthChange}% this quarter</span>
        </div>
      </motion.div>

      {/* Assets vs Liabilities */}
      <motion.div variants={stagger} initial="hidden" animate="show" className="grid sm:grid-cols-2 gap-6">
        <motion.div variants={fadeUp} className="bg-card rounded-xl border border-border shadow-sm p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="flex size-7 items-center justify-center rounded-lg bg-emerald-50">
              <ArrowUpRight className="size-4 text-emerald-600" />
            </div>
            <h2 className="font-semibold text-foreground">Total Assets</h2>
            <span className="ml-auto text-lg font-bold text-emerald-600">{fmt(assets.total)}</span>
          </div>
          <div className="space-y-3">
            {assetPie.map((a) => (
              <div key={a.name}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-muted-foreground">{a.name}</span>
                  <span className="font-semibold text-foreground">{fmt(a.value)}</span>
                </div>
                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${(a.value / assets.total) * 100}%`, background: a.color }} />
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">{((a.value / assets.total) * 100).toFixed(1)}%</p>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div variants={fadeUp} className="bg-card rounded-xl border border-border shadow-sm p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="flex size-7 items-center justify-center rounded-lg bg-red-50">
              <ArrowDownRight className="size-4 text-destructive" />
            </div>
            <h2 className="font-semibold text-foreground">Total Liabilities</h2>
            <span className="ml-auto text-lg font-bold text-destructive">{fmt(liabilities.total)}</span>
          </div>
          <div className="space-y-3">
            {liabPie.map((l) => (
              <div key={l.name}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-muted-foreground">{l.name}</span>
                  <span className="font-semibold text-foreground">{fmt(l.value)}</span>
                </div>
                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${(l.value / liabilities.total) * 100}%`, background: l.color }} />
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">{((l.value / liabilities.total) * 100).toFixed(1)}%</p>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-border">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Debt-to-Asset Ratio</span>
              <span className="font-bold text-emerald-600">{((liabilities.total / assets.total) * 100).toFixed(1)}%</span>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Trend Chart */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.2 }}
        className="bg-card rounded-xl border border-border shadow-sm p-6"
      >
        <h2 className="font-semibold text-foreground mb-4">Net Worth Trend (7 months)</h2>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={netWorthHistory} margin={{ top: 4, right: 4, left: -10, bottom: 0 }}>
            <defs>
              <linearGradient id="nwGrad2" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.25} />
                <stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <XAxis dataKey="month" tick={{ fontSize: 12, fill: "var(--color-muted-foreground)" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }} axisLine={false} tickLine={false}
              tickFormatter={(v) => `$${(v / 1_000_000).toFixed(2)}M`} />
            <Tooltip
              contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: 10, fontSize: 12 }}
              formatter={(v: number) => [fmt(v), "Net Worth"]}
            />
            <Area type="monotone" dataKey="value" stroke="var(--color-primary)" strokeWidth={2.5}
              fill="url(#nwGrad2)" dot={{ r: 4, fill: "var(--color-primary)", strokeWidth: 0 }} />
          </AreaChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Asset Pie */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.25 }}
        className="bg-card rounded-xl border border-border shadow-sm p-6"
      >
        <h2 className="font-semibold text-foreground mb-4">Asset Allocation</h2>
        <ResponsiveContainer width="100%" height={280}>
          <PieChart>
            <Pie data={assetPie} cx="50%" cy="50%" innerRadius={70} outerRadius={110}
              paddingAngle={3} dataKey="value"
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              labelLine={false}
            >
              {assetPie.map((entry, i) => (
                <Cell key={i} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: 10, fontSize: 12 }}
              formatter={(v: number) => [fmt(v)]}
            />
          </PieChart>
        </ResponsiveContainer>
      </motion.div>
    </div>
  );
}

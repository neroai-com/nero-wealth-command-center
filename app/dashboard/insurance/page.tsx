"use client";

import { motion } from "framer-motion";
import { Shield, Home, Car, Heart, Umbrella, Building2, AlertTriangle, CheckCircle2 } from "lucide-react";
import { personalFinances } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

const fmt = (n: number) =>
  n >= 1_000_000 ? `$${(n / 1_000_000).toFixed(1)}M` :
  n >= 1_000 ? `$${(n / 1_000).toFixed(0)}K` : `$${n}`;

const typeConfig: Record<string, { icon: React.ElementType; bg: string; text: string; badge: string }> = {
  home: { icon: Home, bg: "bg-blue-50", text: "text-blue-700", badge: "bg-blue-100 text-blue-700" },
  auto: { icon: Car, bg: "bg-orange-50", text: "text-orange-700", badge: "bg-orange-100 text-orange-700" },
  life: { icon: Heart, bg: "bg-rose-50", text: "text-rose-700", badge: "bg-rose-100 text-rose-700" },
  umbrella: { icon: Umbrella, bg: "bg-violet-100", text: "text-violet-700", badge: "bg-violet-100 text-violet-700" },
  business: { icon: Building2, bg: "bg-primary/10", text: "text-primary", badge: "bg-primary/10 text-primary" },
};

const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.07 } } };
const fadeUp = { hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0, transition: { duration: 0.35 } } };

export default function InsurancePage() {
  const policies = personalFinances.insurancePolicies;
  const totalPremium = policies.reduce((a, p) => a + p.premium, 0);
  const totalCoverage = policies.reduce((a, p) => a + p.coverage, 0);

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 max-w-7xl mx-auto space-y-8">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
        <h1 className="text-2xl font-bold text-foreground">Insurance Policies</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Manage all your coverage, premiums, and policy details</p>
      </motion.div>

      {/* Summary */}
      <motion.div variants={stagger} initial="hidden" animate="show" className="grid grid-cols-3 gap-4">
        {[
          { label: "Total Policies", value: policies.length, sub: "Active policies" },
          { label: "Monthly Premium", value: `$${totalPremium.toLocaleString()}`, sub: "Combined premium" },
          { label: "Total Coverage", value: fmt(totalCoverage), sub: "Combined coverage limit" },
        ].map((k) => (
          <motion.div key={k.label} variants={fadeUp} className="bg-card rounded-xl border border-border shadow-sm p-4">
            <p className="text-xs text-muted-foreground">{k.label}</p>
            <p className="text-xl font-bold text-foreground mt-1">{k.value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{k.sub}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* AI Alert */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.1 }}
        className="flex gap-3 p-4 rounded-xl bg-amber-50 border border-amber-200"
      >
        <AlertTriangle className="size-5 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-amber-900">AI Advisor Alert: Underinsured Business Assets</p>
          <p className="text-sm text-amber-800 mt-0.5">
            Your Business Owners Policy covers $1.5M but combined business assets exceed $2.1M.
            Consider increasing coverage by at least $600K.
          </p>
        </div>
      </motion.div>

      {/* Policies */}
      <motion.div variants={stagger} initial="hidden" animate="show" className="grid sm:grid-cols-2 gap-5">
        {policies.map((p, i) => {
          const tc = typeConfig[p.type] || typeConfig.home;
          return (
            <motion.div key={i} variants={fadeUp}
              className="bg-card rounded-xl border border-border shadow-sm p-5 hover:-translate-y-1 transition-transform duration-200"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={cn("flex size-11 items-center justify-center rounded-xl", tc.bg)}>
                    <tc.icon className={cn("size-5", tc.text)} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{p.name}</h3>
                    <p className="text-xs text-muted-foreground">{p.provider}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="size-3.5 text-emerald-600" />
                  <span className="text-xs font-medium text-emerald-700">Active</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5 mb-4">
                <div className="bg-muted rounded-lg p-3">
                  <p className="text-xs text-muted-foreground">Monthly Premium</p>
                  <p className="text-base font-bold text-foreground">${p.premium}</p>
                </div>
                <div className="bg-muted rounded-lg p-3">
                  <p className="text-xs text-muted-foreground">Coverage</p>
                  <p className="text-base font-bold text-foreground">{fmt(p.coverage)}</p>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className={cn("text-xs font-semibold px-2.5 py-1 rounded-full capitalize", tc.badge)}>
                  {p.type} insurance
                </span>
                <span className="text-xs text-muted-foreground capitalize">{p.frequency}</span>
              </div>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}

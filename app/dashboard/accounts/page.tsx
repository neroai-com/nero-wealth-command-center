"use client";

import { motion } from "framer-motion";
import { Wallet, Building2, TrendingUp, CreditCard, Home, Car } from "lucide-react";
import { personalFinances, businesses } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

const fmt = (n: number) => `$${n.toLocaleString()}`;

const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };
const fadeUp = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0, transition: { duration: 0.32 } } };

const typeConfig: Record<string, { label: string; icon: React.ElementType; bg: string; text: string }> = {
  checking: { label: "Checking", icon: Wallet, bg: "bg-primary/10", text: "text-primary" },
  savings: { label: "Savings", icon: Wallet, bg: "bg-emerald-50", text: "text-emerald-700" },
  investment: { label: "Brokerage", icon: TrendingUp, bg: "bg-violet-100", text: "text-violet-700" },
  retirement: { label: "Retirement", icon: TrendingUp, bg: "bg-amber-50", text: "text-amber-700" },
  credit: { label: "Credit Card", icon: CreditCard, bg: "bg-red-50", text: "text-red-700" },
  mortgage: { label: "Mortgage", icon: Home, bg: "bg-blue-50", text: "text-blue-700" },
  auto: { label: "Auto Loan", icon: Car, bg: "bg-orange-50", text: "text-orange-700" },
  business: { label: "Business", icon: Building2, bg: "bg-primary/10", text: "text-primary" },
};

export default function AccountsPage() {
  const personal = personalFinances.bankAccounts.map((a) => ({
    name: a.name,
    institution: a.institution,
    balance: a.balance,
    type: a.type,
    entity: "Personal",
    isLiability: false,
  }));

  const bizAccounts = businesses.flatMap((b) =>
    b.accounts.map((a) => ({
      name: a.name,
      institution: b.name,
      balance: a.balance,
      type: "business",
      entity: b.name,
      isLiability: false,
    }))
  );

  const mortgages = personalFinances.mortgages.map((m) => ({
    name: m.property,
    institution: m.lender,
    balance: m.balance,
    type: "mortgage",
    entity: "Personal",
    isLiability: true,
  }));

  const vehicles = personalFinances.vehicles.map((v) => ({
    name: v.vehicle,
    institution: v.lender,
    balance: v.balance,
    type: "auto",
    entity: "Personal",
    isLiability: true,
  }));

  const cards = personalFinances.creditCards.map((c) => ({
    name: c.name,
    institution: c.name,
    balance: c.balance,
    type: "credit",
    entity: "Personal",
    isLiability: true,
  }));

  const allAccounts = [...personal, ...bizAccounts, ...mortgages, ...vehicles, ...cards];

  const totalAssets = allAccounts.filter(a => !a.isLiability).reduce((s, a) => s + a.balance, 0);
  const totalLiabilities = allAccounts.filter(a => a.isLiability).reduce((s, a) => s + a.balance, 0);

  const groups = [
    { label: "Personal Banking", accounts: personal },
    { label: "Business Accounts", accounts: bizAccounts },
    { label: "Real Estate Loans", accounts: mortgages },
    { label: "Auto Loans", accounts: vehicles },
    { label: "Credit Cards", accounts: cards },
  ];

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 max-w-7xl mx-auto space-y-8">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
        <h1 className="text-2xl font-bold text-foreground">All Accounts</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Every financial account — personal, business, and liabilities</p>
      </motion.div>

      {/* Summary */}
      <motion.div variants={stagger} initial="hidden" animate="show" className="grid grid-cols-3 gap-4">
        {[
          { label: "Total Accounts", value: allAccounts.length, sub: "Linked accounts" },
          { label: "Total Assets", value: fmt(totalAssets), sub: "Across all asset accounts" },
          { label: "Total Liabilities", value: fmt(totalLiabilities), sub: "All outstanding balances" },
        ].map((k) => (
          <motion.div key={k.label} variants={fadeUp} className="bg-card rounded-xl border border-border shadow-sm p-4">
            <p className="text-xs text-muted-foreground">{k.label}</p>
            <p className="text-xl font-bold text-foreground mt-1">{k.value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{k.sub}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* Account Groups */}
      <div className="space-y-6">
        {groups.map((group) => (
          <motion.div
            key={group.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
          >
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-foreground">{group.label}</h2>
              <span className="text-xs text-muted-foreground">
                {group.accounts.length} account{group.accounts.length !== 1 ? "s" : ""}
              </span>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {group.accounts.map((acct, i) => {
                const tc = typeConfig[acct.type] || typeConfig.checking;
                return (
                  <div key={i} className="bg-card rounded-xl border border-border shadow-sm p-4 hover:-translate-y-0.5 transition-transform duration-150">
                    <div className="flex items-start justify-between mb-2.5">
                      <div className={cn("flex size-8 items-center justify-center rounded-lg", tc.bg)}>
                        <tc.icon className={cn("size-4", tc.text)} />
                      </div>
                      <span className={cn("text-xs font-semibold px-2 py-0.5 rounded-full", tc.bg, tc.text)}>
                        {tc.label}
                      </span>
                    </div>
                    <p className="text-sm font-semibold text-foreground truncate">{acct.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{acct.institution}</p>
                    <p className={cn("text-xl font-bold mt-2", acct.isLiability ? "text-destructive" : "text-foreground")}>
                      {acct.isLiability ? "-" : ""}{fmt(acct.balance)}
                    </p>
                  </div>
                );
              })}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

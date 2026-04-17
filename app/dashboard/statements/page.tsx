"use client";

import { motion } from "framer-motion";
import { Download, Printer, Calendar } from "lucide-react";
import { assets, liabilities, personalFinances, businesses, user, cashFlow } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

function fmtPlain(n: number) {
  return `$${n.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

const today = new Date();
const dateStr = today.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });

function StatRow({
  label,
  value,
  indent = false,
  negative = false,
}: {
  label: string;
  value: number;
  indent?: boolean;
  negative?: boolean;
}) {
  return (
    <div className={cn("flex justify-between text-sm py-1", indent && "pl-4")}>
      <span className={cn("text-foreground", indent && "text-muted-foreground")}>{label}</span>
      <span className={cn("font-medium shrink-0 ml-2", negative ? "text-destructive" : "text-foreground")}>
        {negative ? `(${fmtPlain(value)})` : fmtPlain(value)}
      </span>
    </div>
  );
}

function Subtotal({
  label,
  value,
  negative = false,
}: {
  label: string;
  value: number;
  negative?: boolean;
}) {
  return (
    <div className="flex justify-between text-sm font-bold py-1.5 px-3 bg-muted rounded-xl">
      <span>{label}</span>
      <span className={cn("shrink-0 ml-2", negative ? "text-destructive" : "text-emerald-600 dark:text-emerald-400")}>
        {negative ? `(${fmtPlain(value)})` : fmtPlain(value)}
      </span>
    </div>
  );
}

export default function StatementsPage() {
  const netWorth = assets.total - liabilities.total;
  const monthlyIncome = cashFlow.thisMonth.income;
  const monthlyExpenses = cashFlow.thisMonth.expenses;

  const personalBankAssets = personalFinances.bankAccounts.filter(
    (a) => ["checking", "savings"].includes(a.type)
  );
  const investmentAssets = personalFinances.bankAccounts.filter(
    (a) => ["investment", "retirement"].includes(a.type)
  );

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-5 max-w-5xl mx-auto space-y-5">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-foreground">Financial Statement</h1>
            <p className="text-xs text-muted-foreground mt-0.5">SBA-style personal financial statement</p>
          </div>
          <div className="flex gap-2 shrink-0">
            <button className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground bg-card border border-border rounded-xl px-3 py-2 transition-colors">
              <Printer className="size-3.5" />
              <span className="hidden sm:inline">Print</span>
            </button>
            <button className="inline-flex items-center gap-1.5 text-xs font-semibold bg-primary text-primary-foreground rounded-xl px-3 py-2 active:scale-95 transition-transform duration-150 shadow-sm">
              <Download className="size-3.5" />
              PDF
            </button>
          </div>
        </div>
      </motion.div>

      {/* Statement Document */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.1 }}
        className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden"
      >
        {/* Document Header */}
        <div className="bg-primary px-5 py-5 sm:px-8 sm:py-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-primary-foreground/70 text-[10px] font-semibold uppercase tracking-widest mb-1">
                Personal Financial Statement
              </p>
              <h2 className="text-xl font-bold text-primary-foreground">{user.name}</h2>
              <p className="text-primary-foreground/70 text-xs mt-0.5">{user.email}</p>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-1.5 text-primary-foreground/70 text-[11px] mb-1 justify-end">
                <Calendar className="size-3" />
                <span>Statement Date</span>
              </div>
              <p className="text-primary-foreground font-bold text-sm">{dateStr}</p>
              <p className="text-primary-foreground/60 text-[11px] mt-0.5">Prepared by FinanceOS</p>
            </div>
          </div>
        </div>

        <div className="p-4 sm:p-8 space-y-6">
          {/* Net Worth Summary */}
          <div className="grid grid-cols-3 gap-3 pb-5 border-b border-border">
            {[
              { label: "Assets", value: fmtPlain(assets.total), color: "text-emerald-600 dark:text-emerald-400" },
              { label: "Liabilities", value: fmtPlain(liabilities.total), color: "text-destructive" },
              { label: "Net Worth", value: fmtPlain(netWorth), color: "text-foreground" },
            ].map((k) => (
              <div key={k.label} className="text-center">
                <p className="text-[10px] text-muted-foreground mb-1">{k.label}</p>
                <p className={cn("text-sm sm:text-xl font-bold", k.color)}>{k.value}</p>
              </div>
            ))}
          </div>

          {/* I: Assets */}
          <section>
            <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
              <span className="flex size-5 items-center justify-center rounded bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold">I</span>
              ASSETS
            </h3>
            <div className="space-y-1">
              <StatRow label="Cash on Hand (Personal)" value={personalBankAssets.reduce((a, b) => a + b.balance, 0)} />
              {businesses.map((biz) => biz.accounts.map((acct) => (
                <StatRow key={acct.name} label={`${acct.name} (${biz.name})`} value={acct.balance} indent />
              )))}
              <Subtotal label="Total Cash & Bank" value={
                personalBankAssets.reduce((a, b) => a + b.balance, 0) +
                businesses.flatMap(b => b.accounts).reduce((a, b) => a + b.balance, 0)
              } />
            </div>
            <div className="space-y-1 mt-3">
              {investmentAssets.map((a) => (
                <StatRow key={a.name} label={`${a.name} (${a.institution})`} value={a.balance} />
              ))}
              <Subtotal label="Total Investments & Retirement" value={investmentAssets.reduce((a, b) => a + b.balance, 0)} />
            </div>
            <div className="space-y-1 mt-3">
              {personalFinances.mortgages.map((m) => (
                <StatRow key={m.id} label={`${m.property} — Est. Value`} value={m.estimatedValue} />
              ))}
              <Subtotal label="Total Real Estate" value={personalFinances.mortgages.reduce((a, m) => a + m.estimatedValue, 0)} />
            </div>
            <div className="space-y-1 mt-3">
              {businesses.map((biz) => (
                <StatRow key={biz.id} label={`${biz.name} — Equity`} value={biz.profit * 5} />
              ))}
              <Subtotal label="Total Business Interests" value={businesses.reduce((a, b) => a + b.profit * 5, 0)} />
            </div>
            <div className="mt-3 pt-3 border-t-2 border-foreground">
              <div className="flex justify-between font-bold text-sm">
                <span>TOTAL ASSETS</span>
                <span className="text-emerald-600 dark:text-emerald-400">{fmtPlain(assets.total)}</span>
              </div>
            </div>
          </section>

          {/* II: Liabilities */}
          <section>
            <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
              <span className="flex size-5 items-center justify-center rounded bg-red-100 dark:bg-red-950/50 text-red-700 dark:text-red-400 text-[10px] font-bold">II</span>
              LIABILITIES
            </h3>
            <div className="space-y-1">
              {personalFinances.mortgages.map((m) => (
                <StatRow key={m.id} label={`Mortgage — ${m.property}`} value={m.balance} negative />
              ))}
              <Subtotal label="Total Mortgage Debt" value={personalFinances.mortgages.reduce((a, m) => a + m.balance, 0)} negative />
            </div>
            <div className="space-y-1 mt-3">
              {personalFinances.vehicles.map((v) => (
                <StatRow key={v.id} label={`Auto — ${v.vehicle}`} value={v.balance} negative />
              ))}
              <Subtotal label="Total Auto Loans" value={personalFinances.vehicles.reduce((a, v) => a + v.balance, 0)} negative />
            </div>
            <div className="space-y-1 mt-3">
              {personalFinances.creditCards.map((c, i) => (
                <StatRow key={i} label={c.name} value={c.balance} negative />
              ))}
              <Subtotal label="Total Credit Card Debt" value={personalFinances.creditCards.reduce((a, c) => a + c.balance, 0)} negative />
            </div>
            <div className="mt-3 pt-3 border-t-2 border-foreground">
              <div className="flex justify-between font-bold text-sm">
                <span>TOTAL LIABILITIES</span>
                <span className="text-destructive">{fmtPlain(liabilities.total)}</span>
              </div>
            </div>
          </section>

          {/* III: Net Worth */}
          <section className="bg-muted/50 rounded-2xl p-4">
            <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
              <span className="flex size-5 items-center justify-center rounded bg-primary/10 text-primary text-[10px] font-bold">III</span>
              NET WORTH
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Assets</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">{fmtPlain(assets.total)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Less: Liabilities</span>
                <span className="text-destructive font-bold">({fmtPlain(liabilities.total)})</span>
              </div>
              <div className="flex justify-between font-bold text-base border-t border-border pt-2">
                <span>NET WORTH</span>
                <span>{fmtPlain(netWorth)}</span>
              </div>
            </div>
          </section>

          {/* IV: Income */}
          <section>
            <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
              <span className="flex size-5 items-center justify-center rounded bg-blue-100 dark:bg-blue-950/50 text-blue-700 dark:text-blue-400 text-[10px] font-bold">IV</span>
              MONTHLY INCOME & EXPENSES
            </h3>
            <div className="space-y-1">
              {businesses.map((biz) => (
                <StatRow key={biz.id} label={`Net Income — ${biz.name}`} value={Math.round(biz.profit / 12)} />
              ))}
              <StatRow label="Investment Income" value={2400} />
              <StatRow label="Rental Income (Net)" value={4800} />
              <div className="pt-2 border-t border-border flex justify-between font-bold text-sm">
                <span>TOTAL MONTHLY INCOME</span>
                <span className="text-emerald-600 dark:text-emerald-400">{fmtPlain(monthlyIncome)}</span>
              </div>
            </div>
            <div className="space-y-1 mt-4">
              <StatRow label="Housing" value={8800} negative />
              <StatRow label="Vehicle Payments" value={2071} negative />
              <StatRow label="Insurance Premiums" value={1293} negative />
              <StatRow label="Business Expenses" value={10000} negative />
              <StatRow label="Living Expenses" value={5000} negative />
              <StatRow label="Credit Card Minimums" value={673} negative />
              <div className="pt-2 border-t border-border flex justify-between font-bold text-sm">
                <span>TOTAL MONTHLY EXPENSES</span>
                <span className="text-destructive">{fmtPlain(monthlyExpenses)}</span>
              </div>
              <div className="flex justify-between font-bold text-sm mt-2 pt-2 border-t-2 border-foreground">
                <span>NET MONTHLY CASH FLOW</span>
                <span className={monthlyIncome - monthlyExpenses >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-destructive"}>
                  {fmtPlain(monthlyIncome - monthlyExpenses)}
                </span>
              </div>
            </div>
          </section>

          {/* Signature */}
          <div className="border-t border-border pt-5 grid sm:grid-cols-2 gap-5">
            <div>
              <p className="text-xs text-muted-foreground mb-4">I certify that the above information is true and correct.</p>
              <div className="border-b border-dashed border-foreground/40 h-8 mb-1" />
              <p className="text-xs text-muted-foreground">{user.name} — Signature</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-4 sm:text-right">Date</p>
              <div className="border-b border-dashed border-foreground/40 h-8 mb-1" />
              <p className="text-xs text-muted-foreground sm:text-right">{dateStr}</p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

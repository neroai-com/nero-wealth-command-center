"use client";

import { motion } from "framer-motion";
import { useState, useMemo } from "react";
import {
  Landmark,
  Calculator,
  TrendingDown,
  Building2,
  Home,
  Car,
  ChevronDown,
  ChevronUp,
  Download,
  BarChart2,
  ArrowRight,
  Handshake,
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts";
import { loans } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import { CfoBrokeragePhone } from "@/app/dashboard/loans/cfoworks-brokerage";

const fmt = (n: number) =>
  n >= 1_000_000 ? `$${(n / 1_000_000).toFixed(3)}M` :
  n >= 1_000 ? `$${(n / 1_000).toFixed(1)}K` : `$${n.toLocaleString()}`;

const fmtCur = (n: number) =>
  `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const loanIcons: Record<string, React.ElementType> = {
  "Primary Mortgage": Home,
  "Commercial Real Estate": Building2,
  "Auto Loan": Car,
};

function computeAmortization(principal: number, annualRate: number, termMonths: number) {
  const r = annualRate / 100 / 12;
  const payment = r === 0
    ? principal / termMonths
    : (principal * r * Math.pow(1 + r, termMonths)) / (Math.pow(1 + r, termMonths) - 1);

  const schedule = [];
  let balance = principal;
  let totalInterest = 0;

  for (let m = 1; m <= termMonths; m++) {
    const interestPmt = balance * r;
    const principalPmt = payment - interestPmt;
    balance = Math.max(0, balance - principalPmt);
    totalInterest += interestPmt;

    if (m % 12 === 0 || m === 1 || m === termMonths) {
      schedule.push({
        month: m,
        year: Math.ceil(m / 12),
        payment,
        principal: principalPmt,
        interest: interestPmt,
        balance,
        totalInterest,
      });
    }
  }

  return { schedule, payment, totalInterest, totalPaid: payment * termMonths };
}

type TabId = "loans" | "brokerage" | "modeler" | "schedule";

export default function LoansPage() {
  const [activeTab, setActiveTab] = useState<TabId>("loans");
  const [selectedLoan, setSelectedLoan] = useState(loans[1]);
  const [expandedLoan, setExpandedLoan] = useState<string | null>(null);

  const [modelAmount, setModelAmount] = useState(400000);
  const [modelRate, setModelRate] = useState(6.5);
  const [modelTerm, setModelTerm] = useState(360);
  const [compareRate, setCompareRate] = useState(5.75);

  const model1 = useMemo(() => computeAmortization(modelAmount, modelRate, modelTerm), [modelAmount, modelRate, modelTerm]);
  const model2 = useMemo(() => computeAmortization(modelAmount, compareRate, modelTerm), [modelAmount, compareRate, modelTerm]);

  const amortData = useMemo(() =>
    computeAmortization(selectedLoan.originalAmount, selectedLoan.rate, selectedLoan.term),
    [selectedLoan]
  );

  const yearlyData = amortData.schedule
    .filter(s => s.month % 12 === 0 || s.month === 1)
    .map(s => ({ year: `Yr ${s.year}`, balance: s.balance }));

  const totalLoans = loans.reduce((a, l) => a + l.balance, 0);
  const totalPayments = loans.reduce((a, l) => a + l.payment, 0);

  const tabs = [
    { id: "loans" as TabId, label: "Loans", icon: Landmark },
    { id: "brokerage" as TabId, label: "Brokerage", icon: Handshake },
    { id: "modeler" as TabId, label: "Modeler", icon: Calculator },
    { id: "schedule" as TabId, label: "Schedule", icon: BarChart2 },
  ];

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-5 max-w-7xl mx-auto space-y-5">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
        <h1 className="text-xl font-bold text-foreground">Loans & Lending</h1>
        <p className="text-xs text-muted-foreground mt-0.5">Track, model, broker, and optimize across all entities</p>
      </motion.div>

      {/* Summary */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.38, delay: 0.05 }}
        className="grid grid-cols-3 gap-2.5"
      >
        {[
          { label: "Total Balance", value: fmt(totalLoans) },
          { label: "Monthly Pmts", value: `$${totalPayments.toLocaleString()}` },
          { label: "Active Loans", value: String(loans.length) },
        ].map((k) => (
          <div key={k.label} className="bg-card rounded-2xl border border-border shadow-sm p-3">
            <p className="text-[10px] text-muted-foreground font-medium">{k.label}</p>
            <p className="text-base font-bold text-foreground mt-1 leading-none">{k.value}</p>
          </div>
        ))}
      </motion.div>

      {/* Pill tabs */}
      <div className="flex gap-2 overflow-x-auto -mx-4 px-4 pb-0.5">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold transition-all duration-150 active:scale-95",
              activeTab === tab.id
                ? "bg-primary text-primary-foreground shadow-sm"
                : "bg-muted text-muted-foreground hover:text-foreground hover:bg-accent"
            )}
          >
            <tab.icon className="size-3" />
            {tab.label}
          </button>
        ))}
      </div>

      <motion.div key={activeTab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.22 }}>

        {/* ── All Loans ──────────────────────────────────────────── */}
        {activeTab === "loans" && (
          <div className="space-y-3">
            <button
              onClick={() => setActiveTab("brokerage")}
              className="group relative w-full overflow-hidden rounded-2xl border border-dashed border-primary/40 bg-gradient-to-br from-primary/5 via-primary/10 to-transparent p-4 text-left transition-all hover:border-primary/60 hover:from-primary/10 hover:to-primary/5 active:scale-[0.99]"
            >
              <div className="flex items-center gap-3">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
                  <Handshake className="size-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-foreground">Loan Brokerage & Refi Marketplace</p>
                  <p className="text-[11px] text-muted-foreground">Package, match, and close commercial deals</p>
                </div>
                <ArrowRight className="size-4 text-primary transition-transform group-hover:translate-x-0.5" />
              </div>
            </button>

            {loans.map((loan) => {
              const Icon = loanIcons[loan.type] || Landmark;
              const paidOff = ((loan.originalAmount - loan.balance) / loan.originalAmount) * 100;
              const expanded = expandedLoan === loan.id;
              const remainingMonths = loan.term - loan.monthsElapsed;
              const amort = computeAmortization(loan.originalAmount, loan.rate, loan.term);
              const interestRemaining = amort.totalInterest * (remainingMonths / loan.term);

              return (
                <div key={loan.id} className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-3">
                        <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                          <Icon className="size-4 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-foreground text-sm">{loan.type}</h3>
                          <p className="text-[11px] text-muted-foreground">{loan.entity} · {loan.lender}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[10px] font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 px-2 py-0.5 rounded-full">
                          Current
                        </span>
                        <button
                          onClick={() => setExpandedLoan(expanded ? null : loan.id)}
                          className="flex size-7 items-center justify-center rounded-lg hover:bg-muted transition-colors"
                        >
                          {expanded ? <ChevronUp className="size-3.5" /> : <ChevronDown className="size-3.5" />}
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 mb-3">
                      {[
                        { label: "Balance", value: fmt(loan.balance) },
                        { label: "Rate", value: `${loan.rate}%` },
                        { label: "Payment", value: `${fmt(loan.payment)}/mo` },
                        { label: "Remaining", value: `${remainingMonths} mo` },
                      ].map((s) => (
                        <div key={s.label} className="bg-muted rounded-xl p-2.5">
                          <p className="text-[10px] text-muted-foreground">{s.label}</p>
                          <p className="text-sm font-bold">{s.value}</p>
                        </div>
                      ))}
                    </div>

                    <div>
                      <div className="flex justify-between text-[11px] text-muted-foreground mb-1">
                        <span>Paid off</span>
                        <span>{paidOff.toFixed(1)}%</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-primary rounded-full" style={{ width: `${paidOff}%` }} />
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-1">
                        ~{fmt(interestRemaining)} interest remaining
                      </p>
                    </div>
                  </div>

                  {expanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      className="border-t border-border p-4 bg-muted/30"
                    >
                      <div className="grid grid-cols-3 gap-2 mb-3">
                        {[
                          { label: "Original", value: fmt(loan.originalAmount) },
                          { label: "Total Paid", value: fmt(loan.monthsElapsed * loan.payment) },
                          { label: "Total Interest", value: fmt(amort.totalInterest) },
                        ].map((s) => (
                          <div key={s.label} className="bg-card rounded-xl p-2.5 border border-border">
                            <p className="text-[10px] text-muted-foreground">{s.label}</p>
                            <p className="text-xs font-bold text-foreground mt-0.5">{s.value}</p>
                          </div>
                        ))}
                      </div>
                      <button
                        onClick={() => { setSelectedLoan(loan); setActiveTab("schedule"); }}
                        className="text-xs text-primary font-medium flex items-center gap-1"
                      >
                        View Amortization Schedule →
                      </button>
                    </motion.div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* ── Loan Brokerage ─────────────────────────────────────── */}
        {activeTab === "brokerage" && <CfoBrokeragePhone />}

        {/* ── Loan Modeler ──────────────────────────────────────── */}
        {activeTab === "modeler" && (
          <div className="space-y-4">
            <div className="bg-card rounded-2xl border border-border shadow-sm p-4">
              <div className="flex items-center gap-2 mb-4">
                <Calculator className="size-4 text-primary" />
                <h2 className="font-semibold text-foreground text-sm">Scenario Modeler</h2>
                <span className="ml-auto text-[11px] text-muted-foreground">Compare 2 rates</span>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1.5">Loan Amount</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
                    <input
                      type="number"
                      value={modelAmount}
                      onChange={(e) => setModelAmount(Number(e.target.value))}
                      className="w-full bg-muted rounded-xl pl-7 pr-3 py-3 text-sm font-medium outline-none ring-1 ring-transparent focus:ring-primary transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1.5">Term</label>
                    <select
                      value={modelTerm}
                      onChange={(e) => setModelTerm(Number(e.target.value))}
                      className="w-full bg-muted rounded-xl px-3 py-3 text-sm font-medium outline-none ring-1 ring-transparent focus:ring-primary transition-all"
                    >
                      <option value={60}>5 yr (60)</option>
                      <option value={120}>10 yr (120)</option>
                      <option value={180}>15 yr (180)</option>
                      <option value={240}>20 yr (240)</option>
                      <option value={360}>30 yr (360)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1.5">Entity</label>
                    <select className="w-full bg-muted rounded-xl px-3 py-3 text-sm font-medium outline-none ring-1 ring-transparent focus:ring-primary transition-all">
                      <option>Personal</option>
                      <option>Johnson Real Estate LLC</option>
                      <option>MJ Tech Consulting</option>
                      <option>Urban Eats Group</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: "Rate A (%)", value: modelRate, setter: setModelRate, highlight: "border-primary/50" },
                    { label: "Rate B (%)", value: compareRate, setter: setCompareRate, highlight: "border-violet-400/50" },
                  ].map((s) => (
                    <div key={s.label}>
                      <label className="block text-xs font-semibold text-foreground mb-1.5">{s.label}</label>
                      <div className="relative">
                        <input
                          type="number"
                          value={s.value}
                          step={0.125}
                          onChange={(e) => s.setter(Number(e.target.value))}
                          className="w-full bg-muted rounded-xl px-3 pr-8 py-3 text-sm font-medium outline-none ring-1 ring-transparent focus:ring-primary transition-all"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {[
                { label: `Scenario A`, rate: modelRate, data: model1, color: "text-primary", bg: "bg-primary/10 dark:bg-primary/20", border: "border-primary/30" },
                { label: `Scenario B`, rate: compareRate, data: model2, color: "text-violet-600 dark:text-violet-400", bg: "bg-violet-100 dark:bg-violet-950/40", border: "border-violet-300 dark:border-violet-700/50" },
              ].map((s) => (
                <div key={s.label} className={cn("bg-card rounded-2xl border shadow-sm p-4", s.border)}>
                  <p className={cn("text-xs font-bold mb-0.5", s.color)}>{s.label}</p>
                  <p className={cn("text-[11px] mb-3", s.color)}>{s.rate}% APR</p>
                  <div className="space-y-2">
                    {[
                      { label: "Monthly", value: fmtCur(s.data.payment) },
                      { label: "Total Interest", value: fmt(s.data.totalInterest) },
                      { label: "Total Paid", value: fmt(s.data.totalPaid) },
                    ].map((k) => (
                      <div key={k.label} className={cn("rounded-xl p-2", s.bg)}>
                        <p className="text-[10px] text-muted-foreground">{k.label}</p>
                        <p className="text-xs font-bold text-foreground">{k.value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {model1.payment !== model2.payment && (
              <div className={cn(
                "rounded-2xl border p-4 flex items-center gap-3",
                model1.payment < model2.payment
                  ? "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/50"
                  : "bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800/50"
              )}>
                <TrendingDown className={cn("size-5 shrink-0", model1.payment < model2.payment ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400")} />
                <div>
                  <p className="font-semibold text-sm text-foreground">
                    {model1.payment < model2.payment
                      ? `Rate A saves ${fmtCur(model2.payment - model1.payment)}/mo`
                      : `Rate B saves ${fmtCur(model1.payment - model2.payment)}/mo`}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Interest diff: {fmt(Math.abs(model1.totalInterest - model2.totalInterest))} over term
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Amortization ──────────────────────────────────────── */}
        {activeTab === "schedule" && (
          <div className="space-y-4">
            <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4">
              {loans.map((l) => (
                <button
                  key={l.id}
                  onClick={() => setSelectedLoan(l)}
                  className={cn(
                    "shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors active:scale-95",
                    selectedLoan.id === l.id
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-accent"
                  )}
                >
                  {l.type}
                </button>
              ))}
            </div>

            <div className="bg-card rounded-2xl border border-border shadow-sm p-4">
              <div className="flex items-center justify-between mb-1">
                <div>
                  <h2 className="font-semibold text-foreground text-sm">{selectedLoan.type}</h2>
                  <p className="text-[11px] text-muted-foreground">{selectedLoan.lender} · {selectedLoan.rate}%</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-muted-foreground">Total Interest</p>
                  <p className="text-sm font-bold text-destructive">{fmt(amortData.totalInterest)}</p>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={160}>
                <AreaChart data={yearlyData} margin={{ top: 4, right: 4, left: -16, bottom: 0 }}>
                  <defs>
                    <linearGradient id="balGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.2} />
                      <stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0.01} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                  <XAxis dataKey="year" tick={{ fontSize: 10, fill: "var(--color-muted-foreground)" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: "var(--color-muted-foreground)" }} axisLine={false} tickLine={false}
                    tickFormatter={(v) => `$${(v / 1000).toFixed(0)}K`} />
                  <Tooltip
                    contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: 10, fontSize: 11 }}
                    formatter={(v: number) => [fmt(v)]}
                  />
                  <Area type="monotone" dataKey="balance" stroke="var(--color-primary)" strokeWidth={2.5}
                    fill="url(#balGrad)" dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                <h3 className="font-semibold text-foreground text-sm">Payment Schedule</h3>
                <button className="flex items-center gap-1 text-xs text-primary font-medium">
                  <Download className="size-3" />Export
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead className="bg-muted/50">
                    <tr>
                      {["Mo", "Payment", "Principal", "Interest", "Balance"].map((h) => (
                        <th key={h} className="text-left px-3 py-2.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wide whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {amortData.schedule.slice(0, 20).map((row, i) => (
                      <tr key={i} className="hover:bg-muted/30 transition-colors">
                        <td className="px-3 py-2.5 text-muted-foreground">{row.month}</td>
                        <td className="px-3 py-2.5 font-medium">{fmtCur(row.payment)}</td>
                        <td className="px-3 py-2.5 text-emerald-600 dark:text-emerald-400 font-medium">{fmtCur(row.principal)}</td>
                        <td className="px-3 py-2.5 text-destructive">{fmtCur(row.interest)}</td>
                        <td className="px-3 py-2.5 font-semibold">{fmtCur(row.balance)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <p className="text-[11px] text-muted-foreground text-center py-3 border-t border-border">
                  Showing first 20 of {selectedLoan.term} months
                </p>
              </div>
            </div>
          </div>
        )}

      </motion.div>
    </div>
  );
}


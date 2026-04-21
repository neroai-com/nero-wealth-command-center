"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useMemo, useEffect } from "react";
import {
  Landmark,
  Calculator,
  TrendingDown,
  Building2,
  Home,
  Car,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  Download,
  BarChart2,
  Briefcase,
  Check,
  ArrowRight,
  Info,
  ShieldCheck,
  Handshake,
  FileText,
  Users,
  UserCircle,
  FolderOpen,
  LineChart,
  ClipboardCheck,
  SlidersHorizontal,
  Scale,
  Flag,
  AlertTriangle,
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts";
import { loans } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

const fmt = (n: number) =>
  n >= 1_000_000 ? `$${(n / 1_000_000).toFixed(3)}M` :
  n >= 1_000 ? `$${(n / 1_000).toFixed(1)}K` : `$${n.toLocaleString()}`;

const fmtCur = (n: number) =>
  `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const fmtCur0 = (n: number) =>
  `$${Math.round(n).toLocaleString("en-US")}`;

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

function monthlyPaymentFor(principal: number, annualRatePct: number, amortYears: number) {
  const r = annualRatePct / 100 / 12;
  const n = amortYears * 12;
  if (r === 0) return principal / n;
  return (principal * (r * Math.pow(1 + r, n))) / (Math.pow(1 + r, n) - 1);
}

function buildBrokerSchedule(
  principal: number,
  annualRatePct: number,
  amortYears: number,
  remainingYears: number
) {
  const r = annualRatePct / 100 / 12;
  const totalAmortMonths = Math.round(amortYears * 12);
  const horizonMonths = Math.round(remainingYears * 12);
  const payment = monthlyPaymentFor(principal, annualRatePct, amortYears);
  let bal = principal;
  const rows: { month: number; payment: number; interest: number; principal: number; balance: number }[] = [];
  let totalInt = 0;

  for (let m = 1; m <= horizonMonths; m++) {
    const interest = r === 0 ? 0 : bal * r;
    let principalPaid = payment - interest;
    if (m > totalAmortMonths) principalPaid = 0;
    if (principalPaid > bal) principalPaid = bal;
    bal -= principalPaid;
    totalInt += interest;
    rows.push({ month: m, payment, interest, principal: principalPaid, balance: bal < 0 ? 0 : bal });
    if (bal <= 0.01) break;
  }

  return { payment, rows, totalInterest: totalInt, balloon: bal < 0 ? 0 : bal };
}

function aggregateAnnual(rows: { month: number; payment: number; interest: number; principal: number; balance: number }[]) {
  const out = [];
  for (let i = 0; i < rows.length; i += 12) {
    const chunk = rows.slice(i, i + 12);
    if (!chunk.length) continue;
    const year = Math.floor(i / 12) + 1;
    out.push({
      year,
      payment: chunk.reduce((a, r) => a + r.payment, 0),
      interest: chunk.reduce((a, r) => a + r.interest, 0),
      principal: chunk.reduce((a, r) => a + r.principal, 0),
      balance: chunk[chunk.length - 1].balance,
    });
  }
  return out;
}

type TabId = "loans" | "brokerage" | "modeler" | "schedule";

type BrokerScreen =
  | "home"
  | "intake"
  | "ownership"
  | "sponsors"
  | "sponsor-detail"
  | "borrower-package"
  | "collateral"
  | "projections"
  | "qa"
  | "scenario"
  | "lender-match"
  | "term-sheets"
  | "closing";

const dealTypes = [
  "Refinance",
  "Acquisition",
  "Cash-out refi",
  "Working capital LOC",
  "Construction / bridge",
  "SBA / owner-occupied",
];

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
        {activeTab === "brokerage" && <BrokerageFlow />}

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

// ═══════════════════════════════════════════════════════════════════════════
//  Loan Brokerage / Refi Marketplace sub-flow (13 screens)
// ═══════════════════════════════════════════════════════════════════════════

type StatusTone = "good" | "warn" | "danger" | "muted";

function StatusPill({ children, tone = "muted" }: { children: React.ReactNode; tone?: StatusTone }) {
  const cls =
    tone === "good"
      ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400"
      : tone === "warn"
      ? "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400"
      : tone === "danger"
      ? "bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-400"
      : "bg-muted text-muted-foreground";
  return (
    <span className={cn("text-[10px] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap", cls)}>
      {children}
    </span>
  );
}

function ListRow({
  title,
  sub,
  right,
  onClick,
  subTone,
}: {
  title: string;
  sub?: React.ReactNode;
  right?: React.ReactNode;
  onClick?: () => void;
  subTone?: StatusTone;
}) {
  const subCls =
    subTone === "danger"
      ? "text-red-600 dark:text-red-400"
      : subTone === "warn"
      ? "text-amber-600 dark:text-amber-400"
      : subTone === "good"
      ? "text-emerald-600 dark:text-emerald-400"
      : "text-muted-foreground";

  const Content = (
    <div className="flex items-start justify-between gap-3 py-3 border-t border-border first:border-t-0">
      <div className="min-w-0">
        <p className="text-xs font-semibold text-foreground">{title}</p>
        {sub && <p className={cn("text-[11px] mt-0.5 leading-snug", subCls)}>{sub}</p>}
      </div>
      {right && <div className="shrink-0 flex items-center gap-1.5">{right}</div>}
    </div>
  );

  if (onClick) {
    return (
      <button onClick={onClick} className="w-full text-left hover:bg-muted/30 -mx-4 px-4 transition-colors">
        {Content}
      </button>
    );
  }
  return Content;
}

function SectionCard({
  label,
  children,
  sub,
}: {
  label: string;
  children: React.ReactNode;
  sub?: string;
}) {
  return (
    <div className="bg-card rounded-2xl border border-border shadow-sm p-4">
      <div className="mb-2">
        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{label}</p>
        {sub && <p className="text-[11px] text-muted-foreground mt-0.5">{sub}</p>}
      </div>
      {children}
    </div>
  );
}

function KpiBox({ label, value, sub, tone }: { label: string; value: string; sub?: string; tone?: StatusTone }) {
  const valueCls =
    tone === "danger" ? "text-red-600 dark:text-red-400" : tone === "good" ? "text-emerald-600 dark:text-emerald-400" : "text-foreground";
  return (
    <div className="bg-muted/50 rounded-xl border border-border p-3">
      <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">{label}</p>
      <p className={cn("text-base font-bold mt-1 leading-none", valueCls)}>{value}</p>
      {sub && <p className="text-[11px] text-muted-foreground mt-1">{sub}</p>}
    </div>
  );
}

function PillGroup({
  options,
  value,
  onChange,
}: {
  options: string[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map((o) => {
        const active = o === value;
        return (
          <button
            key={o}
            onClick={() => onChange(o)}
            className={cn(
              "text-[11px] font-semibold px-3 py-1.5 rounded-full border transition-all active:scale-95",
              active
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-muted text-muted-foreground border-border hover:bg-accent hover:text-foreground"
            )}
          >
            {o}
          </button>
        );
      })}
    </div>
  );
}

function FormField({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return (
    <div>
      <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1.5">{label}</label>
      {children}
      {hint && <p className="text-[11px] text-muted-foreground mt-1">{hint}</p>}
    </div>
  );
}

function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={cn(
        "w-full bg-muted rounded-xl px-3 py-2.5 text-sm text-foreground outline-none ring-1 ring-transparent focus:ring-primary transition-all",
        props.className
      )}
    />
  );
}

function PrimaryBtn({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={cn(
        "w-full rounded-full bg-primary text-primary-foreground py-3 text-sm font-semibold transition-all active:scale-[0.98] hover:opacity-95 flex items-center justify-center gap-1.5",
        props.disabled && "opacity-40 cursor-not-allowed hover:opacity-40",
        props.className
      )}
    >
      {children}
    </button>
  );
}

function SecondaryBtn({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={cn(
        "w-full rounded-full bg-muted border border-border text-foreground py-2.5 text-sm font-medium hover:bg-accent transition-colors active:scale-[0.98]",
        props.className
      )}
    >
      {children}
    </button>
  );
}

// ─── Main orchestrator ───────────────────────────────────────────────────
function BrokerageFlow() {
  const [screen, setScreen] = useState<BrokerScreen>("home");

  // Shared deal state across screens
  const [dealType, setDealType] = useState("Refinance");
  const [entity, setEntity] = useState("");
  const [collateral, setCollateral] = useState("");
  const [amount, setAmount] = useState("");
  const [useOfProceeds, setUseOfProceeds] = useState("");
  const [closeDate, setCloseDate] = useState("");
  const [narrativeHeadline, setNarrativeHeadline] = useState("");
  const [narrative1, setNarrative1] = useState("");
  const [narrative2, setNarrative2] = useState("");
  const [consented, setConsented] = useState(false);

  const headerCfg: Record<BrokerScreen, { chip: string; title: string; subtitle: string; icon: React.ElementType }> = {
    home: { chip: "Loan brokerage", title: "Loans & refi marketplace", subtitle: "Package commercial deals for lender partners, compare term sheets, and track fees.", icon: Handshake },
    intake: { chip: "New deal", title: "Create a loan package", subtitle: "Choose the deal type, borrowing entity, collateral, and target structure.", icon: FileText },
    ownership: { chip: "Borrower", title: "Borrower & ownership tree", subtitle: "Who is borrowing, who owns it, and any parent / holdco structures above it.", icon: UserCircle },
    sponsors: { chip: "Sponsors", title: "All shareholders & guarantors", subtitle: "All current shareholders / members, plus PFS for guarantors and often for 20%+ owners.", icon: Users },
    "sponsor-detail": { chip: "Sara · sponsor", title: "Sponsor detail · Sara", subtitle: "PFS, liquidity, and cash flow for commercial guarantor package.", icon: UserCircle },
    "borrower-package": { chip: "Borrower package", title: "Borrower financial package", subtitle: "Auto-assemble the package your bank partners expect for the borrowing entity.", icon: FolderOpen },
    collateral: { chip: "Collateral", title: "Property / collateral package", subtitle: "Everything a commercial lender needs on the real estate or operating collateral.", icon: Building2 },
    projections: { chip: "Projections", title: "Projections & deal story", subtitle: "Build the forward case: NOI, cash flow, DSCR, and the lender narrative.", icon: LineChart },
    qa: { chip: "Package QA", title: "Is the package lender-ready?", subtitle: "CFOworks scores the package before you send it.", icon: ClipboardCheck },
    scenario: { chip: "Scenario runner", title: "Run rate & amortization scenarios", subtitle: "Test rates, terms, and amortization structures with schedules.", icon: SlidersHorizontal },
    "lender-match": { chip: "Lender match", title: "Match this deal to lenders", subtitle: "Share your package with selected lenders once you consent.", icon: Scale },
    "term-sheets": { chip: "Term sheets", title: "Compare term sheets", subtitle: "Side-by-side lender offers: rate, term, fees, covenants, guaranties.", icon: FileText },
    closing: { chip: "Closing tracker", title: "Closing tracker · First National Bank", subtitle: "Keep appraisal, title, legal, insurance, and funding organized until close.", icon: Flag },
  };

  const cfg = headerCfg[screen];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <button
          onClick={() => setScreen("home")}
          disabled={screen === "home"}
          className={cn(
            "flex items-center gap-1 text-[11px] font-semibold text-muted-foreground hover:text-foreground transition-colors",
            screen === "home" && "opacity-0 pointer-events-none"
          )}
        >
          <ChevronLeft className="size-3.5" /> Brokerage home
        </button>
        <span className="text-[10px] font-semibold uppercase tracking-widest bg-primary/10 text-primary px-2.5 py-1 rounded-full">
          {cfg.chip}
        </span>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={screen}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.18 }}
          className="space-y-4"
        >
          {/* Screen title */}
          <div className="flex items-start gap-3">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <cfg.icon className="size-4" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground leading-tight">{cfg.title}</h2>
              <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">{cfg.subtitle}</p>
            </div>
          </div>

          {/* ── LB1 Home ───────────────────────────────────── */}
          {screen === "home" && (
            <>
              <SectionCard label="Pipeline snapshot" sub="Across all active commercial deals.">
                <div className="grid grid-cols-2 gap-2">
                  <KpiBox label="Open deals" value="9" sub="4 refi · 3 acquisition · 2 LOC" />
                  <KpiBox label="Term sheets out" value="3" sub="Awaiting borrower response" />
                  <KpiBox label="Funded YTD" value="$18.6M" sub="6 closed deals" tone="good" />
                  <KpiBox label="Fee pipeline" value="$224k" sub="Modeled brokerage fees" />
                </div>
              </SectionCard>

              <SectionCard label="Workspaces">
                <ListRow
                  title="New loan package"
                  sub="Start refinance, acquisition, bridge, construction, or working capital deal."
                  right={<span className="text-[11px] text-primary font-semibold">Start →</span>}
                  onClick={() => setScreen("intake")}
                />
                <ListRow
                  title="Package QA"
                  sub="See what's missing before sending to lender partners."
                  right={<span className="text-[11px] text-primary font-semibold">Open →</span>}
                  onClick={() => setScreen("qa")}
                />
                <ListRow
                  title="Lender match"
                  sub="Match deals to banks, debt funds, credit unions, or SBA lenders."
                  right={<span className="text-[11px] text-primary font-semibold">Open →</span>}
                  onClick={() => setScreen("lender-match")}
                />
                <ListRow
                  title="Refi scenarios"
                  sub="Run rate, term, amortization, and break-even what-ifs."
                  right={<span className="text-[11px] text-primary font-semibold">Open →</span>}
                  onClick={() => setScreen("scenario")}
                />
                <ListRow
                  title="Term sheets"
                  sub="Compare current lender offers side by side."
                  right={<span className="text-[11px] text-primary font-semibold">Open →</span>}
                  onClick={() => setScreen("term-sheets")}
                />
                <ListRow
                  title="Closing tracker"
                  sub="Track active closings through funding."
                  right={<span className="text-[11px] text-primary font-semibold">Open →</span>}
                  onClick={() => setScreen("closing")}
                />
              </SectionCard>

              <div className="rounded-2xl border border-border bg-muted/30 p-3 flex items-start gap-2">
                <Info className="size-4 text-muted-foreground shrink-0 mt-0.5" />
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  CFOworks may receive lender compensation on commercial deals. Borrower disclosure and consent happen before any package is shared.
                </p>
              </div>
            </>
          )}

          {/* ── LB2 Intake ──────────────────────────────────── */}
          {screen === "intake" && (
            <>
              <SectionCard label="Deal type">
                <PillGroup options={dealTypes} value={dealType} onChange={setDealType} />
              </SectionCard>

              <SectionCard label="Deal details">
                <div className="space-y-3">
                  <FormField label="Borrowing entity">
                    <TextInput placeholder="e.g. Johnson Realty LLC" value={entity} onChange={(e) => setEntity(e.target.value)} />
                  </FormField>
                  <FormField label="Collateral / property" hint="Leave blank for unsecured / company loan">
                    <TextInput placeholder="Select property" value={collateral} onChange={(e) => setCollateral(e.target.value)} />
                  </FormField>
                  <FormField label="Requested amount">
                    <TextInput placeholder="$ amount" inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value)} />
                  </FormField>
                  <FormField label="Use of proceeds">
                    <TextInput placeholder="e.g. Refinance existing debt + fund reserves" value={useOfProceeds} onChange={(e) => setUseOfProceeds(e.target.value)} />
                  </FormField>
                  <FormField label="Target close date">
                    <TextInput placeholder="MM / DD / YYYY" value={closeDate} onChange={(e) => setCloseDate(e.target.value)} />
                  </FormField>
                </div>
              </SectionCard>

              <PrimaryBtn onClick={() => setScreen("ownership")}>
                Next: Borrower & ownership <ArrowRight className="size-3.5" />
              </PrimaryBtn>
              <SecondaryBtn onClick={() => setScreen("home")}>Save draft</SecondaryBtn>
            </>
          )}

          {/* ── LB3 Ownership ───────────────────────────────── */}
          {screen === "ownership" && (
            <>
              <SectionCard label="Borrower structure">
                <ListRow
                  title="Johnson Realty LLC"
                  sub="Borrower · Owns Maplewood Apartments directly."
                  right={<StatusPill tone="good">Borrower</StatusPill>}
                />
                <ListRow
                  title="BlueLake Holdings LP"
                  sub="Parent / holdco owner of Johnson Realty LLC."
                  right={<span className="text-[11px] text-primary font-semibold">Open entity →</span>}
                />
                <div className="mt-3 p-3 rounded-xl bg-muted/40 border border-border">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Why this matters</p>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    We&apos;ll include the borrowing entity plus any parent / holdco relationship the lender should see.
                  </p>
                </div>
              </SectionCard>

              <SectionCard label="Current ownership">
                <ListRow
                  title="You"
                  sub="52% indirect ownership via BlueLake Holdings LP."
                  right={<span className="text-[11px] text-primary font-semibold">Open →</span>}
                />
                <ListRow
                  title="Sara"
                  sub="18% indirect ownership."
                  right={<span className="text-[11px] text-primary font-semibold">Open →</span>}
                />
                <ListRow
                  title="Other LPs / shareholders"
                  sub="All current owners shown from Equity module."
                  right={<span className="text-[11px] text-primary font-semibold">View all →</span>}
                />
              </SectionCard>

              <PrimaryBtn onClick={() => setScreen("sponsors")}>
                Next: Shareholders / sponsor package <ArrowRight className="size-3.5" />
              </PrimaryBtn>
              <SecondaryBtn onClick={() => setScreen("intake")}>Back</SecondaryBtn>
            </>
          )}

          {/* ── LB4 Sponsors ────────────────────────────────── */}
          {screen === "sponsors" && (
            <>
              <SectionCard label="Sponsor roster">
                <ListRow
                  title="You"
                  sub={<>52% owner · Personal guarantor: Yes.<br />PFS complete · Global cash flow complete · Personal taxes 2022–2024 uploaded.</>}
                  right={<StatusPill tone="good">Ready</StatusPill>}
                />
                <ListRow
                  title="Sara"
                  sub={<>18% owner · Personal guarantor: Yes. <span className="text-red-600 dark:text-red-400 font-semibold">PFS missing current statement · Cash flow incomplete.</span></>}
                  right={<span className="text-[11px] text-primary font-semibold">Edit →</span>}
                  onClick={() => setScreen("sponsor-detail")}
                />
                <ListRow
                  title="BlueLake Holdings LP"
                  sub="Entity owner · Needs controlling persons attached."
                  right={<span className="text-[11px] text-primary font-semibold">Open →</span>}
                />
                <div className="mt-3 p-3 rounded-xl bg-muted/40 border border-border">
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    Default rule: show <strong className="text-foreground">all current shareholders</strong>. Lender templates can later filter to guarantors or 20%+ owners only.
                  </p>
                </div>
              </SectionCard>

              <PrimaryBtn onClick={() => setScreen("sponsor-detail")}>
                Next: Sponsor detail / PFS <ArrowRight className="size-3.5" />
              </PrimaryBtn>
              <SecondaryBtn onClick={() => setScreen("ownership")}>Back</SecondaryBtn>
            </>
          )}

          {/* ── LB5 Sponsor PFS ─────────────────────────────── */}
          {screen === "sponsor-detail" && (
            <>
              <SectionCard label="Sponsor summary">
                <div className="grid grid-cols-2 gap-2 mb-3">
                  <KpiBox label="Net worth" value="$6.4M" sub="From Personal CFO" />
                  <KpiBox label="Liquidity" value="$1.1M" sub="Cash + marketable" />
                </div>
                <div className="p-3 rounded-xl bg-muted/40 border border-border">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Global cash flow</p>
                  <p className="text-base font-bold text-emerald-600 dark:text-emerald-400">+$18k / month</p>
                  <p className="text-[11px] text-muted-foreground mt-1">Salary, distributions, debt service, family burn considered.</p>
                </div>
              </SectionCard>

              <SectionCard label="Package completeness">
                <ListRow
                  title="Personal financial statement"
                  sub="Last updated 4 months ago."
                  right={<StatusPill tone="warn">Refresh</StatusPill>}
                />
                <ListRow
                  title="Global cash flow statement"
                  sub="Draft exists, not finalized."
                  right={<StatusPill tone="danger">Missing</StatusPill>}
                />
                <ListRow
                  title="Personal tax returns"
                  sub="2022, 2023, 2024 uploaded to Vault."
                  right={<StatusPill tone="good">Complete</StatusPill>}
                />
              </SectionCard>

              <PrimaryBtn onClick={() => setScreen("borrower-package")}>
                Update PFS & cash flow <ArrowRight className="size-3.5" />
              </PrimaryBtn>
              <SecondaryBtn onClick={() => setScreen("sponsors")}>
                Pull latest from Personal CFO
              </SecondaryBtn>
            </>
          )}

          {/* ── LB6 Borrower Package ────────────────────────── */}
          {screen === "borrower-package" && (
            <>
              <SectionCard label="Required package">
                <ListRow title="Business tax returns (3 years)" sub="2022, 2023, 2024 federal + state returns from Vault." right={<StatusPill tone="good">Complete</StatusPill>} />
                <ListRow title="Current year financials" sub="YTD P&L, balance sheet, cash flow, trial balance." right={<StatusPill tone="good">Live</StatusPill>} />
                <ListRow title="AP / AR aging" sub="Pulled from modules and attached automatically." right={<StatusPill tone="good">Live</StatusPill>} />
                <ListRow title="Debt schedule" sub="From Loans module, current balance + maturity." right={<StatusPill tone="good">Live</StatusPill>} />
              </SectionCard>

              <SectionCard label="Preview exports">
                <ListRow title="YTD financial package" sub="P&L + BS + cash flow + TB." right={<span className="text-[11px] text-primary font-semibold">Preview →</span>} />
                <ListRow title="Banking liquidity summary" sub="Operating balances, recent statements if lender asks." right={<span className="text-[11px] text-primary font-semibold">Preview →</span>} />
                <SecondaryBtn className="mt-3">Generate borrower package PDF / ZIP</SecondaryBtn>
              </SectionCard>

              <PrimaryBtn onClick={() => setScreen("collateral")}>
                Next: Collateral package <ArrowRight className="size-3.5" />
              </PrimaryBtn>
              <SecondaryBtn onClick={() => setScreen("sponsor-detail")}>Back</SecondaryBtn>
            </>
          )}

          {/* ── LB7 Collateral ──────────────────────────────── */}
          {screen === "collateral" && (
            <>
              <SectionCard label="Maplewood Apartments">
                <ListRow title="Rent roll" sub="Current rent roll + occupancy from AR / Property module." right={<StatusPill tone="good">Ready</StatusPill>} />
                <ListRow title="T-12 / T-24 operating statements" sub="Pulled from Accounting automatically." right={<StatusPill tone="good">Ready</StatusPill>} />
                <ListRow title="Property tax history" sub="2025 protest active · 2024 reduction achieved." right={<span className="text-[11px] text-primary font-semibold">Open tax →</span>} />
                <ListRow title="Insurance summary" sub="COIs + current coverage + renewal dates." right={<span className="text-[11px] text-primary font-semibold">Open insurance →</span>} />
              </SectionCard>

              <SectionCard label="Optional collateral docs">
                <ListRow title="Photos / site package" sub="Exterior, units, deferred maintenance, before/after." right={<span className="text-[11px] text-primary font-semibold">Upload →</span>} />
                <ListRow title="Title / survey / legal" sub="Pulled from Vault if available." right={<span className="text-[11px] text-primary font-semibold">Open Vault →</span>} />
              </SectionCard>

              <PrimaryBtn onClick={() => setScreen("projections")}>
                Next: Projections & narrative <ArrowRight className="size-3.5" />
              </PrimaryBtn>
              <SecondaryBtn onClick={() => setScreen("borrower-package")}>Back</SecondaryBtn>
            </>
          )}

          {/* ── LB8 Projections ─────────────────────────────── */}
          {screen === "projections" && (
            <>
              <SectionCard label="Forward package">
                <ListRow title="12-month projection" sub="Base case for NOI, debt service, and DSCR." right={<StatusPill tone="good">Ready</StatusPill>} />
                <ListRow title="24-month projection" sub="Optional for lenders asking for more runway." right={<span className="text-[11px] text-primary font-semibold">Generate</span>} />
                <ListRow title="Stress case" sub="Lower occupancy / lower rents / higher rates." right={<span className="text-[11px] text-primary font-semibold">Generate</span>} />
              </SectionCard>

              <SectionCard label="Deal narrative" sub="AI CFO drafts a lender-ready summary of property, borrower, sponsorship, performance, and credit strength.">
                <div className="space-y-2">
                  <TextInput placeholder="Headline: e.g. Stabilized multifamily refi with strong DSCR" value={narrativeHeadline} onChange={(e) => setNarrativeHeadline(e.target.value)} />
                  <TextInput placeholder="Top narrative point 1" value={narrative1} onChange={(e) => setNarrative1(e.target.value)} />
                  <TextInput placeholder="Top narrative point 2" value={narrative2} onChange={(e) => setNarrative2(e.target.value)} />
                </div>
                <SecondaryBtn className="mt-3">Ask AI CFO to draft narrative</SecondaryBtn>
              </SectionCard>

              <PrimaryBtn onClick={() => setScreen("qa")}>
                Next: Package QA <ArrowRight className="size-3.5" />
              </PrimaryBtn>
              <SecondaryBtn onClick={() => setScreen("collateral")}>Back</SecondaryBtn>
            </>
          )}

          {/* ── LB9 QA ──────────────────────────────────────── */}
          {screen === "qa" && (
            <>
              <SectionCard label="Completeness score">
                <div className="grid grid-cols-2 gap-2">
                  <KpiBox label="Overall package" value="86%" sub="Needs 3 items" />
                  <KpiBox label="Sponsor package" value="71%" sub="Sara missing updated PFS" tone="danger" />
                </div>
              </SectionCard>

              <SectionCard label="Missing / weak items">
                <ListRow title="Updated PFS – Sara" sub="Last statement older than lender template allows." right={<StatusPill tone="danger">Required</StatusPill>} />
                <ListRow title="Global cash flow – Sara" sub="Draft exists but not finalized." right={<StatusPill tone="danger">Required</StatusPill>} />
                <ListRow title="Updated site photos" sub="Helpful, not mandatory for this lender tier." right={<StatusPill tone="warn">Optional</StatusPill>} />
              </SectionCard>

              <PrimaryBtn onClick={() => setScreen("scenario")}>
                Next: Scenario runner & lender match <ArrowRight className="size-3.5" />
              </PrimaryBtn>
              <SecondaryBtn onClick={() => setScreen("projections")}>Export QA checklist</SecondaryBtn>
            </>
          )}

          {/* ── LB10 Scenario ───────────────────────────────── */}
          {screen === "scenario" && <ScenarioRunner onNext={() => setScreen("lender-match")} onBack={() => setScreen("qa")} />}

          {/* ── LB11 Lender match ───────────────────────────── */}
          {screen === "lender-match" && (
            <>
              <SectionCard label="Potential lender matches">
                <ListRow title="First National Bank" sub="Multifamily bridge / perm lender · DSCR and sponsor fit strong." right={<span className="text-[11px] text-primary font-semibold">Send →</span>} />
                <ListRow title="Lone Star Credit Union" sub="Lower leverage target, but competitive fixed rates." right={<span className="text-[11px] text-primary font-semibold">Send →</span>} />
                <ListRow title="Summit Debt Fund" sub="Good for quicker close; higher coupon." right={<span className="text-[11px] text-primary font-semibold">Send →</span>} />
              </SectionCard>

              <SectionCard label="Disclosure & consent">
                <p className="text-[11px] text-muted-foreground leading-relaxed mb-3">
                  I authorize CFOworks to share this package with selected lenders and understand that CFOworks may receive referral or brokerage compensation if a loan closes.
                </p>
                <button
                  onClick={() => setConsented((v) => !v)}
                  className={cn(
                    "text-[11px] font-semibold px-3 py-1.5 rounded-full border transition-all active:scale-95 flex items-center gap-1.5",
                    consented
                      ? "bg-primary/10 text-primary border-primary"
                      : "bg-muted text-muted-foreground border-border hover:bg-accent hover:text-foreground"
                  )}
                >
                  {consented && <Check className="size-3" strokeWidth={3} />}
                  I understand & consent
                </button>
                <div className="mt-3 flex items-start gap-2 p-3 rounded-xl bg-muted/40 border border-border">
                  <ShieldCheck className="size-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    This disclosure does not increase your rate or lender fees. Compensation is governed by separate agreements and applicable commercial lending rules.
                  </p>
                </div>
              </SectionCard>

              <PrimaryBtn disabled={!consented} onClick={() => setScreen("term-sheets")}>
                Send package to selected lenders <ArrowRight className="size-3.5" />
              </PrimaryBtn>
              <SecondaryBtn onClick={() => setScreen("term-sheets")}>Share with my own lender / broker</SecondaryBtn>
            </>
          )}

          {/* ── LB12 Term sheets ────────────────────────────── */}
          {screen === "term-sheets" && (
            <>
              <SectionCard label="Top offers">
                <ListRow
                  title="First National Bank"
                  sub="4.90% fixed · 10 yrs · 25-yr amort · 0.75 pts · Recourse limited."
                  right={<StatusPill tone="good">Best fit</StatusPill>}
                />
                <ListRow
                  title="Lone Star Credit Union"
                  sub="4.82% fixed · 7 yrs · 25-yr amort · 1.10 pts · Full recourse."
                  right={<span className="text-[11px] text-primary font-semibold">Compare</span>}
                />
                <ListRow
                  title="Summit Debt Fund"
                  sub="6.10% floating · 3 yrs · IO 12 mo · Fast close."
                  right={<span className="text-[11px] text-primary font-semibold">Compare</span>}
                />
              </SectionCard>

              <PrimaryBtn onClick={() => setScreen("closing")}>
                Mark chosen lender <ArrowRight className="size-3.5" />
              </PrimaryBtn>
              <SecondaryBtn onClick={() => setScreen("lender-match")}>Export comparison memo</SecondaryBtn>
            </>
          )}

          {/* ── LB13 Closing ────────────────────────────────── */}
          {screen === "closing" && (
            <>
              <SectionCard label="Checklist">
                <ListRow title="Appraisal ordered" sub="Expected back May 20." right={<StatusPill tone="good">Done</StatusPill>} />
                <ListRow title="Title / survey" sub="Vault docs shared to lender counsel." right={<StatusPill tone="good">Done</StatusPill>} />
                <ListRow title="Insurance certificates" sub="Need lender named as mortgagee / additional insured." right={<StatusPill tone="warn">Pending</StatusPill>} />
                <ListRow title="Entity resolution / signatures" sub="Borrowing resolution for Johnson Realty LLC." right={<StatusPill tone="warn">Pending</StatusPill>} />
              </SectionCard>

              <SectionCard label="When funded">
                <div className="flex items-start gap-2 mb-3">
                  <AlertTriangle className="size-4 text-muted-foreground shrink-0 mt-0.5" />
                  <div className="text-[11px] text-muted-foreground leading-relaxed space-y-1">
                    <p>On funding, CFOworks should:</p>
                    <ul className="list-disc list-inside space-y-0.5">
                      <li>Create / update the live loan in Loans module</li>
                      <li>Update Banking funding account</li>
                      <li>Post accounting entries (liability, fees, payoff)</li>
                      <li>Refresh AI CFO cashflow / refi logic</li>
                    </ul>
                  </div>
                </div>
                <PrimaryBtn onClick={() => setScreen("home")}>
                  <Check className="size-3.5" strokeWidth={3} /> Mark loan funded
                </PrimaryBtn>
                <SecondaryBtn className="mt-2">Upload closing package</SecondaryBtn>
              </SectionCard>
            </>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// ─── LB10 Scenario runner (interactive) ────────────────────────────────
function ScenarioRunner({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
  const [balance, setBalance] = useState("8420000");
  const [currentRate, setCurrentRate] = useState("5.65");
  const [scenarioRate, setScenarioRate] = useState("4.85");
  const [remainingYears, setRemainingYears] = useState("9.5");
  const [amortYears, setAmortYears] = useState("25");
  const [closingCosts, setClosingCosts] = useState("95000");
  const [monthlyEscrow, setMonthlyEscrow] = useState("10500");
  const [view, setView] = useState<"monthly" | "annual">("monthly");

  const [result, setResult] = useState<{
    current: ReturnType<typeof buildBrokerSchedule>;
    scenario: ReturnType<typeof buildBrokerSchedule>;
    annual: ReturnType<typeof aggregateAnnual>;
    monthlySavings: number;
    annualSavings: number;
    breakeven: number;
  } | null>(null);

  const run = () => {
    const p = parseFloat(balance) || 0;
    const cr = parseFloat(currentRate) || 0;
    const sr = parseFloat(scenarioRate) || 0;
    const ry = parseFloat(remainingYears) || 0;
    const ay = parseFloat(amortYears) || 0;
    const cc = parseFloat(closingCosts) || 0;
    if (!p || !ry || !ay) return;

    const current = buildBrokerSchedule(p, cr, ay, ry);
    const scenario = buildBrokerSchedule(p, sr, ay, ry);
    const monthlySavings = current.payment - scenario.payment;
    const annualSavings = monthlySavings * 12;
    const breakeven = monthlySavings > 0 ? cc / monthlySavings : 0;

    setResult({
      current,
      scenario,
      annual: aggregateAnnual(scenario.rows),
      monthlySavings,
      annualSavings,
      breakeven,
    });
  };

  useEffect(() => {
    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const escrow = parseFloat(monthlyEscrow) || 0;

  return (
    <>
      <SectionCard label="Inputs">
        <div className="grid grid-cols-2 gap-3">
          <FormField label="Current balance">
            <TextInput inputMode="decimal" value={balance} onChange={(e) => setBalance(e.target.value)} />
          </FormField>
          <FormField label="Current rate (%)">
            <TextInput inputMode="decimal" value={currentRate} onChange={(e) => setCurrentRate(e.target.value)} />
          </FormField>
          <FormField label="Scenario rate (%)">
            <TextInput inputMode="decimal" value={scenarioRate} onChange={(e) => setScenarioRate(e.target.value)} />
          </FormField>
          <FormField label="Remaining term (yrs)">
            <TextInput inputMode="decimal" value={remainingYears} onChange={(e) => setRemainingYears(e.target.value)} />
          </FormField>
          <FormField label="Amortization (yrs)">
            <TextInput inputMode="decimal" value={amortYears} onChange={(e) => setAmortYears(e.target.value)} />
          </FormField>
          <FormField label="Closing costs">
            <TextInput inputMode="decimal" value={closingCosts} onChange={(e) => setClosingCosts(e.target.value)} />
          </FormField>
          <div className="col-span-2">
            <FormField label="Monthly escrow (optional)">
              <TextInput inputMode="decimal" value={monthlyEscrow} onChange={(e) => setMonthlyEscrow(e.target.value)} />
            </FormField>
          </div>
        </div>

        <div className="flex gap-1.5 mt-4">
          {(["monthly", "annual"] as const).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={cn(
                "text-[11px] font-semibold px-3 py-1.5 rounded-full border transition-all active:scale-95",
                view === v
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-muted text-muted-foreground border-border hover:bg-accent hover:text-foreground"
              )}
            >
              {v === "monthly" ? "Monthly amortization" : "Annual amortization"}
            </button>
          ))}
        </div>

        <PrimaryBtn className="mt-4" onClick={run}>Run scenario</PrimaryBtn>
      </SectionCard>

      {result && (
        <>
          <SectionCard label="Scenario summary">
            <div className="grid grid-cols-2 gap-2">
              <KpiBox label="Current P&I" value={fmtCur0(result.current.payment + escrow)} sub="Includes escrow" />
              <KpiBox label="Scenario P&I" value={fmtCur0(result.scenario.payment + escrow)} sub="Includes escrow" />
              <KpiBox label="Monthly savings" value={fmtCur0(result.monthlySavings)} sub="Current vs scenario" tone={result.monthlySavings > 0 ? "good" : "danger"} />
              <KpiBox label="Annual savings" value={fmtCur0(result.annualSavings)} sub="12 × monthly delta" tone={result.annualSavings > 0 ? "good" : "danger"} />
              <KpiBox label="Break-even" value={result.monthlySavings > 0 ? `${result.breakeven.toFixed(1)} mo` : "—"} sub="Closing / savings" />
              <KpiBox label="Balloon at maturity" value={fmtCur0(result.scenario.balloon)} sub="End of remaining term" />
            </div>
            <p className="text-[11px] text-muted-foreground leading-relaxed mt-3">
              Scenario compares <strong className="text-foreground">{parseFloat(currentRate).toFixed(2)}%</strong> vs <strong className="text-foreground">{parseFloat(scenarioRate).toFixed(2)}%</strong> over <strong className="text-foreground">{parseFloat(remainingYears).toFixed(1)} years</strong> with <strong className="text-foreground">{parseFloat(amortYears).toFixed(1)}-yr amortization</strong>. Payments include escrow of {fmtCur0(escrow)}.
            </p>
          </SectionCard>

          <SectionCard label={view === "monthly" ? "Monthly amortization" : "Annual amortization"}>
            <div className="overflow-x-auto -mx-4">
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-[10px] text-muted-foreground uppercase tracking-widest">
                    {view === "monthly" ? (
                      <>
                        <th className="text-left px-4 py-2 font-semibold">Mo</th>
                        <th className="text-right px-2 py-2 font-semibold">Payment</th>
                        <th className="text-right px-2 py-2 font-semibold">Principal</th>
                        <th className="text-right px-2 py-2 font-semibold">Interest</th>
                        <th className="text-right px-4 py-2 font-semibold">Balance</th>
                      </>
                    ) : (
                      <>
                        <th className="text-left px-4 py-2 font-semibold">Year</th>
                        <th className="text-right px-2 py-2 font-semibold">Total Pmts</th>
                        <th className="text-right px-2 py-2 font-semibold">Principal</th>
                        <th className="text-right px-2 py-2 font-semibold">Interest</th>
                        <th className="text-right px-4 py-2 font-semibold">Ending Bal</th>
                      </>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {view === "monthly"
                    ? result.scenario.rows.slice(0, 24).map((r) => (
                        <tr key={r.month} className="hover:bg-muted/30">
                          <td className="px-4 py-2 text-muted-foreground">{r.month}</td>
                          <td className="px-2 py-2 text-right font-medium">{fmtCur(r.payment)}</td>
                          <td className="px-2 py-2 text-right text-emerald-600 dark:text-emerald-400 font-medium">{fmtCur(r.principal)}</td>
                          <td className="px-2 py-2 text-right text-destructive">{fmtCur(r.interest)}</td>
                          <td className="px-4 py-2 text-right font-semibold">{fmtCur(r.balance)}</td>
                        </tr>
                      ))
                    : result.annual.map((r) => (
                        <tr key={r.year} className="hover:bg-muted/30">
                          <td className="px-4 py-2 text-muted-foreground">Year {r.year}</td>
                          <td className="px-2 py-2 text-right font-medium">{fmtCur(r.payment)}</td>
                          <td className="px-2 py-2 text-right text-emerald-600 dark:text-emerald-400 font-medium">{fmtCur(r.principal)}</td>
                          <td className="px-2 py-2 text-right text-destructive">{fmtCur(r.interest)}</td>
                          <td className="px-4 py-2 text-right font-semibold">{fmtCur(r.balance)}</td>
                        </tr>
                      ))}
                </tbody>
              </table>
            </div>
            {view === "monthly" && (
              <p className="text-[11px] text-muted-foreground text-center mt-2">
                Showing first 24 months. Export full schedule in production.
              </p>
            )}
            <SecondaryBtn className="mt-3">Export schedule (CSV / PDF)</SecondaryBtn>
          </SectionCard>
        </>
      )}

      <PrimaryBtn onClick={onNext}>
        Next: Lender match <ArrowRight className="size-3.5" />
      </PrimaryBtn>
      <SecondaryBtn onClick={onBack}>Back</SecondaryBtn>
    </>
  );
}

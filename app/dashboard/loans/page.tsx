"use client";

import { motion, AnimatePresence } from "framer-motion";
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
  Plus,
  FilePlus2,
  GraduationCap,
  Briefcase,
  Check,
  ArrowRight,
  Sparkles,
  Info,
  ShieldCheck,
  FolderPlus,
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts";
import { loans as seedLoans } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

type Loan = {
  id: string;
  entity: string;
  lender: string;
  type: string;
  originalAmount: number;
  balance: number;
  rate: number;
  term: number;
  monthsElapsed: number;
  payment: number;
  nextPayment: string;
  status: string;
};

const fmt = (n: number) =>
  n >= 1_000_000 ? `$${(n / 1_000_000).toFixed(3)}M` :
  n >= 1_000 ? `$${(n / 1_000).toFixed(1)}K` : `$${n.toLocaleString()}`;

const fmtCur = (n: number) => `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const loanIcons: Record<string, React.ElementType> = {
  "Primary Mortgage": Home,
  "Commercial Real Estate": Building2,
  "Auto Loan": Car,
  "Business Loan": Briefcase,
  "Education Loan": GraduationCap,
  "Personal Loan": Landmark,
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

type TabId = "loans" | "modeler" | "schedule" | "apply" | "add";

const assetTypes = [
  { id: "mortgage", label: "Home Mortgage", sub: "Primary or secondary residence", icon: Home, rateHint: 6.5 },
  { id: "commercial", label: "Commercial RE", sub: "Investment property", icon: Building2, rateHint: 7.25 },
  { id: "auto", label: "Auto Loan", sub: "New or used vehicle", icon: Car, rateHint: 5.9 },
  { id: "business", label: "Business Loan", sub: "Working capital / growth", icon: Briefcase, rateHint: 8.5 },
  { id: "student", label: "Education", sub: "Student or continuing ed", icon: GraduationCap, rateHint: 6.8 },
  { id: "personal", label: "Personal", sub: "Unsecured personal loan", icon: Landmark, rateHint: 9.5 },
];

const termOptions = [
  { months: 60, label: "5 yr" },
  { months: 120, label: "10 yr" },
  { months: 180, label: "15 yr" },
  { months: 240, label: "20 yr" },
  { months: 360, label: "30 yr" },
];

const entityOptions = [
  "Personal",
  "Johnson Real Estate LLC",
  "MJ Tech Consulting",
  "Urban Eats Group",
];

function computeMonthlyPayment(principal: number, annualRate: number, termMonths: number) {
  const r = annualRate / 100 / 12;
  if (r === 0) return principal / termMonths;
  return (principal * r * Math.pow(1 + r, termMonths)) / (Math.pow(1 + r, termMonths) - 1);
}

export default function LoansPage() {
  const [activeTab, setActiveTab] = useState<TabId>("loans");
  const [loans, setLoans] = useState<Loan[]>(seedLoans);
  const [selectedLoan, setSelectedLoan] = useState<Loan>(seedLoans[1]);
  const [expandedLoan, setExpandedLoan] = useState<string | null>(null);

  // Add existing loan state
  const [addSavedId, setAddSavedId] = useState<string | null>(null);
  const [addAssetType, setAddAssetType] = useState<string | null>(null);
  const [addBalance, setAddBalance] = useState("");
  const [addOriginal, setAddOriginal] = useState("");
  const [addRate, setAddRate] = useState("");
  const [addTerm, setAddTerm] = useState<number>(360);
  const [addMonthsElapsed, setAddMonthsElapsed] = useState("");
  const [addLender, setAddLender] = useState("");
  const [addEntity, setAddEntity] = useState(entityOptions[0]);

  const selectedAddAsset = assetTypes.find((a) => a.id === addAssetType) || null;
  const addBalanceNum = Number(addBalance) || 0;
  const addOriginalNum = Number(addOriginal) || addBalanceNum;
  const addRateNum = Number(addRate) || 0;
  const addMonthsElapsedNum = Math.max(0, Math.min(addTerm, Number(addMonthsElapsed) || 0));

  const addCalculatedPayment = useMemo(() => {
    if (addOriginalNum <= 0 || addRateNum <= 0 || addTerm <= 0) return 0;
    return computeMonthlyPayment(addOriginalNum, addRateNum, addTerm);
  }, [addOriginalNum, addRateNum, addTerm]);

  const canSaveExisting =
    !!addAssetType &&
    addBalanceNum > 0 &&
    addRateNum > 0 &&
    addTerm > 0 &&
    addLender.trim().length > 0;

  const resetAddExisting = () => {
    setAddAssetType(null);
    setAddBalance("");
    setAddOriginal("");
    setAddRate("");
    setAddTerm(360);
    setAddMonthsElapsed("");
    setAddLender("");
    setAddEntity(entityOptions[0]);
    setAddSavedId(null);
  };

  const assetToLoanType = (id: string): string => {
    switch (id) {
      case "mortgage": return "Primary Mortgage";
      case "commercial": return "Commercial Real Estate";
      case "auto": return "Auto Loan";
      case "business": return "Business Loan";
      case "student": return "Education Loan";
      case "personal": return "Personal Loan";
      default: return "Loan";
    }
  };

  const saveExistingLoan = () => {
    if (!canSaveExisting || !selectedAddAsset) return;
    const original = addOriginalNum > 0 ? addOriginalNum : addBalanceNum;
    const payment = Math.round(
      computeMonthlyPayment(original, addRateNum, addTerm)
    );
    const newLoan: Loan = {
      id: `loan-${Date.now()}`,
      entity: addEntity,
      lender: addLender.trim(),
      type: assetToLoanType(addAssetType!),
      originalAmount: original,
      balance: addBalanceNum,
      rate: addRateNum,
      term: addTerm,
      monthsElapsed: addMonthsElapsedNum,
      payment,
      nextPayment: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
      status: "current",
    };
    setLoans((prev) => [newLoan, ...prev]);
    setAddSavedId(newLoan.id);
  };

  const [modelAmount, setModelAmount] = useState(400000);
  const [modelRate, setModelRate] = useState(6.5);
  const [modelTerm, setModelTerm] = useState(360);
  const [compareRate, setCompareRate] = useState(5.75);

  // Apply flow state
  const [applyStep, setApplyStep] = useState<1 | 2 | 3>(1);
  const [applyAssetType, setApplyAssetType] = useState<string | null>(null);
  const [applyBalance, setApplyBalance] = useState<string>("");
  const [applyRate, setApplyRate] = useState<string>("");
  const [applyTerm, setApplyTerm] = useState<number>(360);
  const [applySubmitted, setApplySubmitted] = useState(false);

  const selectedAsset = assetTypes.find((a) => a.id === applyAssetType) || null;
  const applyBalanceNum = Number(applyBalance) || 0;
  const applyRateNum = Number(applyRate) || 0;
  const applyPreview = useMemo(() => {
    if (applyBalanceNum <= 0 || applyRateNum <= 0) return null;
    return computeAmortization(applyBalanceNum, applyRateNum, applyTerm);
  }, [applyBalanceNum, applyRateNum, applyTerm]);

  const canAdvanceStep1 = !!applyAssetType;
  const canAdvanceStep2 = applyBalanceNum > 0 && applyRateNum > 0 && applyTerm > 0;

  const resetApply = () => {
    setApplyStep(1);
    setApplyAssetType(null);
    setApplyBalance("");
    setApplyRate("");
    setApplyTerm(360);
    setApplySubmitted(false);
  };

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
    { id: "apply" as TabId, label: "Apply", icon: FilePlus2 },
    { id: "add" as TabId, label: "Add Existing", icon: FolderPlus },
    { id: "modeler" as TabId, label: "Modeler", icon: Calculator },
    { id: "schedule" as TabId, label: "Schedule", icon: BarChart2 },
  ];

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-5 max-w-7xl mx-auto space-y-5">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
        <h1 className="text-xl font-bold text-foreground">Loans & Lending</h1>
        <p className="text-xs text-muted-foreground mt-0.5">Track, model, and optimize across all entities</p>
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <button
                onClick={() => { resetApply(); setActiveTab("apply"); }}
                className="group relative w-full overflow-hidden rounded-2xl border border-dashed border-primary/40 bg-gradient-to-br from-primary/5 via-primary/10 to-transparent p-4 text-left transition-all hover:border-primary/60 hover:from-primary/10 hover:to-primary/5 active:scale-[0.99]"
              >
                <div className="flex items-center gap-3">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
                    <Plus className="size-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-foreground">Apply for a New Loan</p>
                    <p className="text-[11px] text-muted-foreground">Pre-qualify in 3 quick steps</p>
                  </div>
                  <ArrowRight className="size-4 text-primary transition-transform group-hover:translate-x-0.5" />
                </div>
              </button>

              <button
                onClick={() => { resetAddExisting(); setActiveTab("add"); }}
                className="group relative w-full overflow-hidden rounded-2xl border border-dashed border-border bg-card p-4 text-left transition-all hover:border-foreground/30 hover:bg-muted/40 active:scale-[0.99]"
              >
                <div className="flex items-center gap-3">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-muted text-foreground">
                    <FolderPlus className="size-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-foreground">Add Existing Loan</p>
                    <p className="text-[11px] text-muted-foreground">Track a loan you already have</p>
                  </div>
                  <ArrowRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                </div>
              </button>
            </div>

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

        {/* ── Apply for New Loan ────────────────────────────────── */}
        {activeTab === "apply" && (
          <div className="space-y-4">
            {applySubmitted ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="relative overflow-hidden rounded-2xl border border-emerald-200 dark:border-emerald-800/50 bg-gradient-to-br from-emerald-50 via-card to-card dark:from-emerald-950/30 shadow-sm p-6 text-center"
              >
                <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-full bg-emerald-500/15 ring-8 ring-emerald-500/5">
                  <Check className="size-7 text-emerald-600 dark:text-emerald-400" strokeWidth={3} />
                </div>
                <h2 className="text-base font-bold text-foreground">Application submitted</h2>
                <p className="text-xs text-muted-foreground mt-1 max-w-xs mx-auto">
                  We've received your {selectedAsset?.label.toLowerCase()} request. Your advisor will reach out within 1 business day.
                </p>

                <div className="mt-5 grid grid-cols-2 gap-2 text-left">
                  <div className="rounded-xl bg-muted/60 p-2.5">
                    <p className="text-[10px] text-muted-foreground">Requested</p>
                    <p className="text-sm font-bold">{fmt(applyBalanceNum)}</p>
                  </div>
                  <div className="rounded-xl bg-muted/60 p-2.5">
                    <p className="text-[10px] text-muted-foreground">Est. Monthly</p>
                    <p className="text-sm font-bold">{applyPreview ? fmtCur(applyPreview.payment) : "—"}</p>
                  </div>
                  <div className="rounded-xl bg-muted/60 p-2.5">
                    <p className="text-[10px] text-muted-foreground">Rate</p>
                    <p className="text-sm font-bold">{applyRateNum}%</p>
                  </div>
                  <div className="rounded-xl bg-muted/60 p-2.5">
                    <p className="text-[10px] text-muted-foreground">Term</p>
                    <p className="text-sm font-bold">{applyTerm / 12} yr</p>
                  </div>
                </div>

                <div className="mt-5 flex gap-2">
                  <button
                    onClick={() => { resetApply(); setActiveTab("loans"); }}
                    className="flex-1 rounded-xl bg-muted py-2.5 text-xs font-semibold text-foreground hover:bg-accent transition-colors"
                  >
                    Back to Loans
                  </button>
                  <button
                    onClick={resetApply}
                    className="flex-1 rounded-xl bg-primary py-2.5 text-xs font-semibold text-primary-foreground hover:opacity-95 transition-opacity"
                  >
                    Start Another
                  </button>
                </div>
              </motion.div>
            ) : (
              <>
                {/* Hero */}
                <div className="relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-primary/10 via-card to-card shadow-sm p-5">
                  <div className="absolute -right-8 -top-8 size-32 rounded-full bg-primary/10 blur-2xl" />
                  <div className="relative flex items-start gap-3">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
                      <Sparkles className="size-5" />
                    </div>
                    <div className="flex-1">
                      <h2 className="text-base font-bold text-foreground">Apply for a New Loan</h2>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        Tell us what you need — get an indicative rate in under a minute.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Stepper */}
                <div className="flex items-center gap-2 px-0.5">
                  {[1, 2, 3].map((step, i) => (
                    <div key={step} className="flex items-center flex-1 last:flex-none">
                      <div
                        className={cn(
                          "flex size-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold transition-colors",
                          step < applyStep
                            ? "bg-primary text-primary-foreground"
                            : step === applyStep
                            ? "bg-primary text-primary-foreground ring-4 ring-primary/20"
                            : "bg-muted text-muted-foreground"
                        )}
                      >
                        {step < applyStep ? <Check className="size-3" strokeWidth={3} /> : step}
                      </div>
                      <div className="ml-2 text-[10px] font-semibold text-foreground whitespace-nowrap">
                        {step === 1 ? "Asset" : step === 2 ? "Details" : "Review"}
                      </div>
                      {i < 2 && (
                        <div
                          className={cn(
                            "mx-2 flex-1 h-0.5 rounded-full transition-colors",
                            step < applyStep ? "bg-primary" : "bg-muted"
                          )}
                        />
                      )}
                    </div>
                  ))}
                </div>

                {/* Step content */}
                <AnimatePresence mode="wait">
                  {applyStep === 1 && (
                    <motion.div
                      key="step-1"
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      transition={{ duration: 0.2 }}
                      className="bg-card rounded-2xl border border-border shadow-sm p-4"
                    >
                      <div className="mb-3">
                        <h3 className="text-sm font-semibold text-foreground">What are you borrowing for?</h3>
                        <p className="text-[11px] text-muted-foreground mt-0.5">Choose the asset type below.</p>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        {assetTypes.map((a) => {
                          const active = applyAssetType === a.id;
                          return (
                            <button
                              key={a.id}
                              onClick={() => {
                                setApplyAssetType(a.id);
                                if (!applyRate) setApplyRate(String(a.rateHint));
                              }}
                              className={cn(
                                "group relative text-left rounded-xl border p-3 transition-all active:scale-[0.98]",
                                active
                                  ? "border-primary bg-primary/5 shadow-sm"
                                  : "border-border bg-card hover:border-primary/40 hover:bg-muted/40"
                              )}
                            >
                              <div className={cn(
                                "flex size-8 items-center justify-center rounded-lg mb-2 transition-colors",
                                active ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"
                              )}>
                                <a.icon className="size-4" />
                              </div>
                              <p className="text-xs font-semibold text-foreground leading-tight">{a.label}</p>
                              <p className="text-[10px] text-muted-foreground mt-0.5 leading-tight">{a.sub}</p>
                              {active && (
                                <div className="absolute top-2 right-2 flex size-4 items-center justify-center rounded-full bg-primary">
                                  <Check className="size-2.5 text-primary-foreground" strokeWidth={4} />
                                </div>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}

                  {applyStep === 2 && (
                    <motion.div
                      key="step-2"
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      transition={{ duration: 0.2 }}
                      className="bg-card rounded-2xl border border-border shadow-sm p-4 space-y-4"
                    >
                      <div>
                        <h3 className="text-sm font-semibold text-foreground">Loan details</h3>
                        <p className="text-[11px] text-muted-foreground mt-0.5">
                          {selectedAsset?.label} · typical rate {selectedAsset?.rateHint}%
                        </p>
                      </div>

                      {/* Current Balance */}
                      <div>
                        <label className="block text-xs font-semibold text-foreground mb-1.5">
                          Current Balance
                          <span className="ml-1 font-normal text-muted-foreground">(amount you need)</span>
                        </label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-medium">$</span>
                          <input
                            type="number"
                            inputMode="decimal"
                            placeholder="0"
                            value={applyBalance}
                            onChange={(e) => setApplyBalance(e.target.value)}
                            className="w-full bg-muted rounded-xl pl-7 pr-3 py-3 text-sm font-semibold outline-none ring-1 ring-transparent focus:ring-primary transition-all"
                          />
                        </div>
                        <div className="mt-2 flex gap-1.5 flex-wrap">
                          {[50000, 100000, 250000, 500000].map((v) => (
                            <button
                              key={v}
                              onClick={() => setApplyBalance(String(v))}
                              className="text-[10px] font-medium px-2 py-1 rounded-full bg-muted hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
                            >
                              {fmt(v)}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Rate */}
                      <div>
                        <label className="block text-xs font-semibold text-foreground mb-1.5">Interest Rate</label>
                        <div className="relative">
                          <input
                            type="number"
                            inputMode="decimal"
                            step={0.125}
                            placeholder="0.00"
                            value={applyRate}
                            onChange={(e) => setApplyRate(e.target.value)}
                            className="w-full bg-muted rounded-xl px-3 pr-8 py-3 text-sm font-semibold outline-none ring-1 ring-transparent focus:ring-primary transition-all"
                          />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-medium">%</span>
                        </div>
                      </div>

                      {/* Term */}
                      <div>
                        <label className="block text-xs font-semibold text-foreground mb-1.5">Term</label>
                        <div className="grid grid-cols-5 gap-1.5">
                          {termOptions.map((t) => (
                            <button
                              key={t.months}
                              onClick={() => setApplyTerm(t.months)}
                              className={cn(
                                "rounded-xl py-2.5 text-xs font-semibold transition-all active:scale-95",
                                applyTerm === t.months
                                  ? "bg-primary text-primary-foreground shadow-sm"
                                  : "bg-muted text-muted-foreground hover:bg-accent hover:text-foreground"
                              )}
                            >
                              {t.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Live preview */}
                      {applyPreview && (
                        <div className="rounded-xl border border-primary/30 bg-primary/5 p-3">
                          <div className="flex items-center gap-1.5 mb-2">
                            <Info className="size-3 text-primary" />
                            <p className="text-[10px] font-bold text-primary uppercase tracking-wide">Estimated</p>
                          </div>
                          <div className="grid grid-cols-3 gap-2">
                            <div>
                              <p className="text-[10px] text-muted-foreground">Monthly</p>
                              <p className="text-sm font-bold text-foreground">{fmtCur(applyPreview.payment)}</p>
                            </div>
                            <div>
                              <p className="text-[10px] text-muted-foreground">Total Interest</p>
                              <p className="text-sm font-bold text-foreground">{fmt(applyPreview.totalInterest)}</p>
                            </div>
                            <div>
                              <p className="text-[10px] text-muted-foreground">Total Paid</p>
                              <p className="text-sm font-bold text-foreground">{fmt(applyPreview.totalPaid)}</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  )}

                  {applyStep === 3 && (
                    <motion.div
                      key="step-3"
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      transition={{ duration: 0.2 }}
                      className="space-y-3"
                    >
                      <div className="bg-card rounded-2xl border border-border shadow-sm p-4">
                        <h3 className="text-sm font-semibold text-foreground mb-3">Review your application</h3>

                        <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/60 mb-3">
                          {selectedAsset && (
                            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                              <selectedAsset.icon className="size-5" />
                            </div>
                          )}
                          <div>
                            <p className="text-sm font-semibold text-foreground">{selectedAsset?.label}</p>
                            <p className="text-[11px] text-muted-foreground">{selectedAsset?.sub}</p>
                          </div>
                        </div>

                        <div className="divide-y divide-border">
                          {[
                            { label: "Current Balance", value: fmt(applyBalanceNum) },
                            { label: "Interest Rate", value: `${applyRateNum}%` },
                            { label: "Term", value: `${applyTerm / 12} years (${applyTerm} mo)` },
                            { label: "Est. Monthly Payment", value: applyPreview ? fmtCur(applyPreview.payment) : "—", emphasize: true },
                            { label: "Est. Total Interest", value: applyPreview ? fmt(applyPreview.totalInterest) : "—" },
                          ].map((r) => (
                            <div key={r.label} className="flex items-center justify-between py-2.5">
                              <p className="text-xs text-muted-foreground">{r.label}</p>
                              <p className={cn("text-xs font-semibold text-foreground", r.emphasize && "text-sm text-primary")}>
                                {r.value}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-start gap-2 rounded-xl bg-muted/40 border border-border p-3">
                        <ShieldCheck className="size-4 shrink-0 text-emerald-600 dark:text-emerald-400 mt-0.5" />
                        <p className="text-[11px] text-muted-foreground leading-relaxed">
                          This is a soft inquiry and will not affect your credit score. Final terms subject to underwriting and verification.
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Navigation */}
                <div className="flex gap-2 pt-1">
                  <button
                    onClick={() => {
                      if (applyStep === 1) {
                        setActiveTab("loans");
                      } else {
                        setApplyStep((applyStep - 1) as 1 | 2 | 3);
                      }
                    }}
                    className="flex-1 rounded-xl bg-muted py-3 text-xs font-semibold text-foreground hover:bg-accent transition-colors active:scale-[0.98]"
                  >
                    {applyStep === 1 ? "Cancel" : "Back"}
                  </button>
                  <button
                    disabled={(applyStep === 1 && !canAdvanceStep1) || (applyStep === 2 && !canAdvanceStep2)}
                    onClick={() => {
                      if (applyStep < 3) {
                        setApplyStep((applyStep + 1) as 1 | 2 | 3);
                      } else {
                        setApplySubmitted(true);
                      }
                    }}
                    className={cn(
                      "flex-[1.3] rounded-xl py-3 text-xs font-semibold transition-all active:scale-[0.98] flex items-center justify-center gap-1.5",
                      "bg-primary text-primary-foreground hover:opacity-95",
                      "disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:opacity-40"
                    )}
                  >
                    {applyStep === 3 ? (
                      <>Submit Application <Check className="size-3.5" strokeWidth={3} /></>
                    ) : (
                      <>Continue <ArrowRight className="size-3.5" /></>
                    )}
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {/* ── Add Existing Loan ─────────────────────────────────── */}
        {activeTab === "add" && (
          <div className="space-y-4">
            {addSavedId ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="relative overflow-hidden rounded-2xl border border-emerald-200 dark:border-emerald-800/50 bg-gradient-to-br from-emerald-50 via-card to-card dark:from-emerald-950/30 shadow-sm p-6 text-center"
              >
                <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-full bg-emerald-500/15 ring-8 ring-emerald-500/5">
                  <Check className="size-7 text-emerald-600 dark:text-emerald-400" strokeWidth={3} />
                </div>
                <h2 className="text-base font-bold text-foreground">Loan added</h2>
                <p className="text-xs text-muted-foreground mt-1 max-w-xs mx-auto">
                  Your {selectedAddAsset?.label.toLowerCase()} from {addLender} is now being tracked.
                </p>

                <div className="mt-5 flex gap-2">
                  <button
                    onClick={() => { resetAddExisting(); setActiveTab("loans"); }}
                    className="flex-1 rounded-xl bg-primary py-2.5 text-xs font-semibold text-primary-foreground hover:opacity-95 transition-opacity"
                  >
                    View Loans
                  </button>
                  <button
                    onClick={() => resetAddExisting()}
                    className="flex-1 rounded-xl bg-muted py-2.5 text-xs font-semibold text-foreground hover:bg-accent transition-colors"
                  >
                    Add Another
                  </button>
                </div>
              </motion.div>
            ) : (
              <>
                {/* Hero */}
                <div className="relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-muted/60 via-card to-card shadow-sm p-5">
                  <div className="absolute -right-8 -top-8 size-32 rounded-full bg-foreground/5 blur-2xl" />
                  <div className="relative flex items-start gap-3">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-foreground text-background shadow-sm">
                      <FolderPlus className="size-5" />
                    </div>
                    <div className="flex-1">
                      <h2 className="text-base font-bold text-foreground">Add Existing Loan</h2>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        Track a loan you already have — we&apos;ll calculate the monthly payment for you.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Asset type */}
                <div className="bg-card rounded-2xl border border-border shadow-sm p-4">
                  <div className="mb-3">
                    <h3 className="text-sm font-semibold text-foreground">Asset Type</h3>
                    <p className="text-[11px] text-muted-foreground mt-0.5">What kind of loan is this?</p>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {assetTypes.map((a) => {
                      const active = addAssetType === a.id;
                      return (
                        <button
                          key={a.id}
                          onClick={() => setAddAssetType(a.id)}
                          className={cn(
                            "group relative text-left rounded-xl border p-3 transition-all active:scale-[0.98]",
                            active
                              ? "border-primary bg-primary/5 shadow-sm"
                              : "border-border bg-card hover:border-primary/40 hover:bg-muted/40"
                          )}
                        >
                          <div className={cn(
                            "flex size-8 items-center justify-center rounded-lg mb-2 transition-colors",
                            active ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"
                          )}>
                            <a.icon className="size-4" />
                          </div>
                          <p className="text-xs font-semibold text-foreground leading-tight">{a.label}</p>
                          <p className="text-[10px] text-muted-foreground mt-0.5 leading-tight">{a.sub}</p>
                          {active && (
                            <div className="absolute top-2 right-2 flex size-4 items-center justify-center rounded-full bg-primary">
                              <Check className="size-2.5 text-primary-foreground" strokeWidth={4} />
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Balances */}
                <div className="bg-card rounded-2xl border border-border shadow-sm p-4 space-y-4">
                  <div>
                    <h3 className="text-sm font-semibold text-foreground">Balances</h3>
                    <p className="text-[11px] text-muted-foreground mt-0.5">Current balance is what you still owe.</p>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1.5">
                      Current Balance <span className="font-normal text-muted-foreground">(remaining)</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-medium">$</span>
                      <input
                        type="number"
                        inputMode="decimal"
                        placeholder="0"
                        value={addBalance}
                        onChange={(e) => setAddBalance(e.target.value)}
                        className="w-full bg-muted rounded-xl pl-7 pr-3 py-3 text-sm font-semibold outline-none ring-1 ring-transparent focus:ring-primary transition-all"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-foreground mb-1.5">
                        Original Amount <span className="font-normal text-muted-foreground">(opt.)</span>
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-medium">$</span>
                        <input
                          type="number"
                          inputMode="decimal"
                          placeholder="0"
                          value={addOriginal}
                          onChange={(e) => setAddOriginal(e.target.value)}
                          className="w-full bg-muted rounded-xl pl-7 pr-3 py-3 text-sm font-semibold outline-none ring-1 ring-transparent focus:ring-primary transition-all"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-foreground mb-1.5">
                        Months Paid <span className="font-normal text-muted-foreground">(opt.)</span>
                      </label>
                      <input
                        type="number"
                        inputMode="numeric"
                        placeholder="0"
                        value={addMonthsElapsed}
                        onChange={(e) => setAddMonthsElapsed(e.target.value)}
                        className="w-full bg-muted rounded-xl px-3 py-3 text-sm font-semibold outline-none ring-1 ring-transparent focus:ring-primary transition-all"
                      />
                    </div>
                  </div>
                </div>

                {/* Rate & Term */}
                <div className="bg-card rounded-2xl border border-border shadow-sm p-4 space-y-4">
                  <div>
                    <h3 className="text-sm font-semibold text-foreground">Rate & Term</h3>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1.5">Interest Rate</label>
                    <div className="relative">
                      <input
                        type="number"
                        inputMode="decimal"
                        step={0.125}
                        placeholder="0.00"
                        value={addRate}
                        onChange={(e) => setAddRate(e.target.value)}
                        className="w-full bg-muted rounded-xl px-3 pr-8 py-3 text-sm font-semibold outline-none ring-1 ring-transparent focus:ring-primary transition-all"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-medium">%</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1.5">Term</label>
                    <div className="grid grid-cols-5 gap-1.5">
                      {termOptions.map((t) => (
                        <button
                          key={t.months}
                          onClick={() => setAddTerm(t.months)}
                          className={cn(
                            "rounded-xl py-2.5 text-xs font-semibold transition-all active:scale-95",
                            addTerm === t.months
                              ? "bg-primary text-primary-foreground shadow-sm"
                              : "bg-muted text-muted-foreground hover:bg-accent hover:text-foreground"
                          )}
                        >
                          {t.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Lender & Entity */}
                <div className="bg-card rounded-2xl border border-border shadow-sm p-4 space-y-4">
                  <div>
                    <h3 className="text-sm font-semibold text-foreground">Lender & Entity</h3>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-foreground mb-1.5">Lender</label>
                      <input
                        type="text"
                        placeholder="e.g. Chase Bank"
                        value={addLender}
                        onChange={(e) => setAddLender(e.target.value)}
                        className="w-full bg-muted rounded-xl px-3 py-3 text-sm font-semibold outline-none ring-1 ring-transparent focus:ring-primary transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-foreground mb-1.5">Entity</label>
                      <select
                        value={addEntity}
                        onChange={(e) => setAddEntity(e.target.value)}
                        className="w-full bg-muted rounded-xl px-3 py-3 text-sm font-semibold outline-none ring-1 ring-transparent focus:ring-primary transition-all"
                      >
                        {entityOptions.map((e) => (
                          <option key={e} value={e}>{e}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Calculated payment */}
                {addCalculatedPayment > 0 && (
                  <div className="rounded-2xl border border-primary/30 bg-primary/5 p-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Info className="size-4 text-primary" />
                      <div>
                        <p className="text-[11px] font-semibold text-primary uppercase tracking-wide">Calculated</p>
                        <p className="text-xs text-muted-foreground">Monthly payment</p>
                      </div>
                    </div>
                    <p className="text-lg font-bold text-primary">{fmtCur(addCalculatedPayment)}</p>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2 pt-1">
                  <button
                    onClick={() => { resetAddExisting(); setActiveTab("loans"); }}
                    className="flex-1 rounded-xl bg-muted py-3 text-xs font-semibold text-foreground hover:bg-accent transition-colors active:scale-[0.98]"
                  >
                    Cancel
                  </button>
                  <button
                    disabled={!canSaveExisting}
                    onClick={saveExistingLoan}
                    className={cn(
                      "flex-[1.3] rounded-xl py-3 text-xs font-semibold transition-all active:scale-[0.98] flex items-center justify-center gap-1.5",
                      "bg-primary text-primary-foreground hover:opacity-95",
                      "disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:opacity-40"
                    )}
                  >
                    <Check className="size-3.5" strokeWidth={3} /> Save Loan
                  </button>
                </div>
              </>
            )}
          </div>
        )}

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

            {/* Comparison cards */}
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

            {/* Savings callout */}
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
            {/* Loan selector pills */}
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

            {/* Chart */}
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

            {/* Table */}
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

"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Brain,
  Building2,
  TrendingUp,
  Shield,
  Landmark,
  FileText,
  ArrowRight,
  CheckCircle2,
  BarChart3,
  Wallet,
  DollarSign,
  Star,
} from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

const features = [
  { icon: Building2, title: "Multi-Business Portfolio", desc: "Manage unlimited entities — vendors, payables, team, and financials per business from one command center." },
  { icon: Brain, title: "AI Financial Advisor", desc: "Your personal CFO analyzes mortgages, debt, insurance gaps, refinance opportunities, and tax estimates in real-time." },
  { icon: TrendingUp, title: "Net Worth Tracking", desc: "Live net worth with complete asset vs. liability breakdown, trend charts, and equity tracking across all properties." },
  { icon: Landmark, title: "Loans & Lending Module", desc: "Track all loans per entity, model different rates and terms, run amortization schedules, and optimize your debt structure." },
  { icon: Shield, title: "Insurance Management", desc: "Track all policies, coverage amounts, premiums, and get AI-powered alerts for coverage gaps across businesses and personal." },
  { icon: FileText, title: "Personal Financial Statement", desc: "Instantly generate a professional SBA-style personal financial statement for loans, banking, or personal planning." },
  { icon: BarChart3, title: "Cash Flow Analysis", desc: "Monthly income vs. expenses by category, savings rate trends, and 6-month historical cash flow visualization." },
  { icon: Wallet, title: "All Accounts Hub", desc: "See every account — checking, savings, investments, retirement, and credit — in one unified, organized view." },
];

const stats = [
  { value: "$2.8M+", label: "Avg. Net Worth Tracked" },
  { value: "17+", label: "Accounts Connected" },
  { value: "3×", label: "Businesses per User" },
  { value: "782", label: "Avg. Financial Score" },
];

const testimonials = [
  { name: "Denise Carter", role: "Real Estate Investor", quote: "FinanceOS is the first tool that actually understands I'm a person AND a business owner. The AI advisor flagged a refinance opportunity that saved me $340/month." },
  { name: "James Okafor", role: "Restaurant Chain Owner", quote: "Managing vendors, payables, and team across 3 locations used to be a nightmare. Now it's one screen. The financial statement feature alone is worth it for my SBA loans." },
  { name: "Priya Singh", role: "Tech Entrepreneur", quote: "The loans & lending module with the amortization calculator is a game-changer. I modeled 6 different scenarios before refinancing my commercial property." },
];

const pricing = [
  { name: "Personal", price: 19, desc: "For individuals with complex personal finances", features: ["Net Worth Tracking", "Personal Finance Hub", "All Accounts", "Basic AI Advisor", "Financial Statement"] },
  { name: "Professional", price: 49, desc: "For business owners with 1-3 entities", featured: true, features: ["Everything in Personal", "Up to 3 Businesses", "Loans & Lending Module", "Full AI Advisor", "Insurance Manager", "Team Members (10)", "Vendor & Payables"] },
  { name: "Enterprise", price: 99, desc: "For complex portfolios and family offices", features: ["Everything in Pro", "Unlimited Businesses", "Family Members", "White-label Reports", "Priority Support", "CPA Export", "Custom Integrations"] },
];

const fadeUp = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.2, 0.8, 0.2, 1] as [number, number, number, number] } } };
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-md">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 flex items-center justify-between h-16">
          <div className="flex items-center gap-2.5">
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary shadow-sm">
              <DollarSign className="size-4 text-primary-foreground" strokeWidth={2.5} />
            </div>
            <span className="text-lg font-bold text-foreground">FinanceOS</span>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-sm text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition-colors">Features</a>
            <a href="#pricing" className="hover:text-foreground transition-colors">Pricing</a>
            <a href="#testimonials" className="hover:text-foreground transition-colors">Reviews</a>
          </nav>
          <div className="flex items-center gap-2">
            <ThemeToggle size="sm" />
            <Link href="/login" className="hidden sm:inline-flex text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5">
              Sign In
            </Link>
            <Link href="/signup" className="inline-flex items-center gap-1.5 text-sm font-semibold bg-primary text-primary-foreground rounded-lg px-4 py-2 hover:brightness-95 active:scale-95 transition-all duration-150 shadow-sm">
              Get Started <ArrowRight className="size-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative pt-28 pb-20 sm:pt-36 sm:pb-28 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" aria-hidden>
          <div className="absolute top-20 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-violet-500/5 rounded-full blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-6xl px-4 sm:px-6 text-center">
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <span className="inline-flex items-center gap-2 text-xs font-semibold bg-primary/10 text-primary px-3 py-1.5 rounded-full mb-6 border border-primary/20">
              <Brain className="size-3.5" />
              AI-Powered Financial Command Center
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-foreground tracking-tight leading-tight mb-6"
          >
            Manage Your Businesses<br />
            <span className="text-primary">And Your Life</span>
            {" "}From One Place
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-8 text-balance"
          >
            FinanceOS combines business financials, personal wealth tracking, AI advisory, loan modeling, and insurance management — built for entrepreneurs who own companies and have a life.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-3"
          >
            <Link href="/signup"
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-semibold rounded-xl px-7 py-3.5 text-base hover:brightness-95 active:scale-[0.98] transition-all duration-150 shadow-sm w-full sm:w-auto justify-center"
            >
              Start Free Trial <ArrowRight className="size-4" />
            </Link>
            <Link href="/dashboard"
              className="inline-flex items-center gap-2 bg-card text-foreground font-semibold rounded-xl px-7 py-3.5 text-base border border-border hover:bg-muted active:scale-[0.98] transition-all duration-150 w-full sm:w-auto justify-center"
            >
              View Live Demo
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.45 }}
            className="mt-16 grid grid-cols-2 sm:grid-cols-4 gap-6 max-w-3xl mx-auto"
          >
            {stats.map((s) => (
              <div key={s.label} className="text-center">
                <p className="text-2xl sm:text-3xl font-extrabold text-foreground">{s.value}</p>
                <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 sm:py-28 bg-muted/40">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="text-center mb-14">
            <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-3">Everything You Need</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">Built for complex financial lives</h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto text-balance">
              One platform for your businesses, personal finances, investments, and AI-powered guidance.
            </p>
          </div>

          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-50px" }}
            className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5"
          >
            {features.map((f) => (
              <motion.div key={f.title} variants={fadeUp}
                className="bg-card rounded-xl border border-border p-5 hover:-translate-y-1 hover:shadow-md transition-all duration-200"
              >
                <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 mb-4">
                  <f.icon className="size-5 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-20 sm:py-28">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="text-center mb-14">
            <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-3">Real Results</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">What our users say</h2>
          </div>
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-50px" }}
            className="grid sm:grid-cols-3 gap-6"
          >
            {testimonials.map((t) => (
              <motion.div key={t.name} variants={fadeUp}
                className="bg-card rounded-xl border border-border p-6 hover:-translate-y-1 transition-transform duration-200"
              >
                <div className="flex gap-1 mb-3">
                  {Array(5).fill(0).map((_, i) => (
                    <Star key={i} className="size-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <blockquote className="text-sm text-foreground leading-relaxed mb-4">"{t.quote}"</blockquote>
                <div className="flex items-center gap-2.5">
                  <div className="flex size-8 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold">
                    {t.name.split(" ").map(n => n[0]).join("")}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 sm:py-28 bg-muted/40">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="text-center mb-14">
            <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-3">Simple Pricing</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">Plans for every stage</h2>
            <p className="text-muted-foreground text-lg">14-day free trial. No credit card required.</p>
          </div>
          <div className="grid sm:grid-cols-3 gap-6 items-start">
            {pricing.map((plan) => (
              <div key={plan.name} className={`bg-card rounded-2xl border p-6 ${plan.featured ? "border-primary shadow-lg sm:scale-[1.03]" : "border-border"}`}>
                {plan.featured && (
                  <div className="text-xs font-bold text-primary bg-primary/10 rounded-full px-3 py-1 w-fit mb-3">Most Popular</div>
                )}
                <h3 className="text-lg font-bold text-foreground mb-1">{plan.name}</h3>
                <p className="text-xs text-muted-foreground mb-4">{plan.desc}</p>
                <div className="mb-5">
                  <span className="text-4xl font-extrabold text-foreground">${plan.price}</span>
                  <span className="text-sm text-muted-foreground">/month</span>
                </div>
                <ul className="space-y-2.5 mb-6">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm">
                      <CheckCircle2 className="size-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                      <span className="text-foreground">{f}</span>
                    </li>
                  ))}
                </ul>
                <Link href="/signup"
                  className={`block text-center font-semibold rounded-xl py-2.5 active:scale-[0.98] transition-all duration-150 ${
                    plan.featured
                      ? "bg-primary text-primary-foreground hover:brightness-95 shadow-sm"
                      : "bg-muted text-foreground hover:bg-accent"
                  }`}
                >
                  Get Started
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 sm:py-28">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 text-center">
          <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Take control of your financial future
            </h2>
            <p className="text-lg text-muted-foreground mb-8 text-balance">
              Join thousands of business owners who've unified their finances with FinanceOS.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link href="/signup"
                className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-semibold rounded-xl px-8 py-3.5 text-base hover:brightness-95 active:scale-[0.98] transition-all duration-150 shadow-sm"
              >
                Start Free Trial <ArrowRight className="size-4" />
              </Link>
              <Link href="/dashboard"
                className="inline-flex items-center gap-2 text-foreground font-semibold rounded-xl px-8 py-3.5 text-base border border-border hover:bg-muted active:scale-[0.98] transition-all duration-150"
              >
                Explore Demo
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="flex size-6 items-center justify-center rounded-md bg-primary">
              <DollarSign className="size-3.5 text-primary-foreground" strokeWidth={2.5} />
            </div>
            <span className="font-bold text-foreground">FinanceOS</span>
          </div>
          <p className="text-xs text-muted-foreground">© 2026 FinanceOS. All rights reserved.</p>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
            <a href="#" className="hover:text-foreground transition-colors">Terms</a>
            <a href="#" className="hover:text-foreground transition-colors">Security</a>
            <ThemeToggle size="sm" />
          </div>
        </div>
      </footer>
    </div>
  );
}

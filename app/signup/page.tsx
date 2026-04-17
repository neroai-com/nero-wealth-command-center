"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { DollarSign, Eye, EyeOff, ArrowRight, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ThemeToggle } from "@/components/theme-toggle";

const perks = [
  "Multi-business portfolio management",
  "AI Financial Advisor included",
  "Personal Financial Statement (SBA)",
  "Loans & amortization modeling",
];

export default function SignUpPage() {
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => router.push("/dashboard"), 1000);
  };

  return (
    <div className="min-h-screen bg-muted/40 flex flex-col items-center justify-center px-4 py-16 relative">
      {/* Theme toggle */}
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      {/* Logo */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex items-center gap-2.5 mb-8"
      >
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex size-9 items-center justify-center rounded-xl bg-primary shadow-sm">
            <DollarSign className="size-5 text-primary-foreground" strokeWidth={2.5} />
          </div>
          <span className="text-xl font-bold text-foreground">FinanceOS</span>
        </Link>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.1 }}
        className="bg-card rounded-2xl border border-border shadow-sm p-6 sm:p-8 w-full max-w-md"
      >
        <div className="mb-4">
          <h1 className="text-2xl font-bold text-foreground">Create your account</h1>
          <p className="text-sm text-muted-foreground mt-1">14-day free trial · No credit card required</p>
        </div>

        {/* Perks */}
        <ul className="space-y-1.5 mb-5">
          {perks.map((p) => (
            <li key={p} className="flex items-center gap-2 text-xs text-muted-foreground">
              <CheckCircle2 className="size-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              {p}
            </li>
          ))}
        </ul>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-semibold text-foreground mb-1.5">First Name</label>
              <input type="text" placeholder="Marcus"
                className="w-full bg-muted rounded-xl px-4 py-3 text-sm outline-none ring-1 ring-transparent focus:ring-primary transition-all placeholder:text-muted-foreground" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-foreground mb-1.5">Last Name</label>
              <input type="text" placeholder="Johnson"
                className="w-full bg-muted rounded-xl px-4 py-3 text-sm outline-none ring-1 ring-transparent focus:ring-primary transition-all placeholder:text-muted-foreground" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-foreground mb-1.5">Email address</label>
            <input type="email" placeholder="marcus@example.com"
              className="w-full bg-muted rounded-xl px-4 py-3 text-sm outline-none ring-1 ring-transparent focus:ring-primary transition-all placeholder:text-muted-foreground" />
          </div>

          <div>
            <label className="block text-sm font-semibold text-foreground mb-1.5">Password</label>
            <div className="relative">
              <input type={show ? "text" : "password"} placeholder="Min. 8 characters"
                className="w-full bg-muted rounded-xl px-4 py-3 pr-10 text-sm outline-none ring-1 ring-transparent focus:ring-primary transition-all placeholder:text-muted-foreground" />
              <button type="button" onClick={() => setShow(!show)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-foreground mb-1.5">Primary use</label>
            <select className="w-full bg-muted rounded-xl px-4 py-3 text-sm outline-none ring-1 ring-transparent focus:ring-primary transition-all text-foreground">
              <option>Business owner (1-3 entities)</option>
              <option>Business owner (4+ entities)</option>
              <option>Personal finance only</option>
              <option>Real estate investor</option>
              <option>Family office / wealth management</option>
            </select>
          </div>

          <button type="submit" disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground font-semibold rounded-xl py-3 text-sm hover:brightness-95 active:scale-[0.98] transition-all duration-150 shadow-sm disabled:opacity-60 mt-1">
            {loading ? (
              <span className="flex gap-1">
                {[0,1,2].map(i => (
                  <span key={i} className="size-1.5 rounded-full bg-primary-foreground animate-bounce" style={{ animationDelay: `${i*150}ms` }} />
                ))}
              </span>
            ) : (
              <>Create Account <ArrowRight className="size-4" /></>
            )}
          </button>
        </form>

        <div className="flex items-center gap-3 my-4">
          <div className="flex-1 h-px bg-border" />
          <span className="text-xs text-muted-foreground">or</span>
          <div className="flex-1 h-px bg-border" />
        </div>

        <Link href="/dashboard"
          className="w-full flex items-center justify-center gap-2 bg-muted text-foreground font-semibold rounded-xl py-3 text-sm hover:bg-accent active:scale-[0.98] transition-all duration-150">
          Continue as Guest →
        </Link>

        <p className="text-center text-xs text-muted-foreground mt-4">
          By signing up, you agree to our{" "}
          <a href="#" className="text-primary hover:underline">Terms</a> and{" "}
          <a href="#" className="text-primary hover:underline">Privacy Policy</a>
        </p>
        <p className="text-center text-sm text-muted-foreground mt-3">
          Already have an account?{" "}
          <Link href="/login" className="text-primary font-semibold hover:underline">Sign in</Link>
        </p>
      </motion.div>

      <p className="text-xs text-muted-foreground mt-6">© 2026 FinanceOS · All rights reserved</p>
    </div>
  );
}

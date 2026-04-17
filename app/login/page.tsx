"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { DollarSign, Eye, EyeOff, ArrowRight } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ThemeToggle } from "@/components/theme-toggle";

export default function LoginPage() {
  const [show, setShow] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => router.push("/dashboard"), 1000);
  };

  return (
    <div className="min-h-screen bg-muted/40 flex flex-col items-center justify-center px-4 py-16 relative">
      {/* Theme toggle top-right */}
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
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground">Welcome back</h1>
          <p className="text-sm text-muted-foreground mt-1">Sign in to your FinanceOS account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-foreground mb-1.5">Email address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="marcus@example.com"
              className="w-full bg-muted rounded-xl px-4 py-3 text-sm outline-none ring-1 ring-transparent focus:ring-primary transition-all placeholder:text-muted-foreground"
            />
          </div>
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-sm font-semibold text-foreground">Password</label>
              <a href="#" className="text-xs text-primary hover:underline">Forgot password?</a>
            </div>
            <div className="relative">
              <input
                type={show ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-muted rounded-xl px-4 py-3 pr-10 text-sm outline-none ring-1 ring-transparent focus:ring-primary transition-all placeholder:text-muted-foreground"
              />
              <button
                type="button"
                onClick={() => setShow(!show)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground font-semibold rounded-xl py-3 text-sm hover:brightness-95 active:scale-[0.98] transition-all duration-150 shadow-sm disabled:opacity-60 disabled:cursor-not-allowed mt-2"
          >
            {loading ? (
              <span className="flex gap-1">
                {[0,1,2].map(i => (
                  <span key={i} className="size-1.5 rounded-full bg-primary-foreground animate-bounce" style={{ animationDelay: `${i*150}ms` }} />
                ))}
              </span>
            ) : (
              <>Sign In <ArrowRight className="size-4" /></>
            )}
          </button>
        </form>

        <div className="flex items-center gap-3 my-5">
          <div className="flex-1 h-px bg-border" />
          <span className="text-xs text-muted-foreground">or</span>
          <div className="flex-1 h-px bg-border" />
        </div>

        <Link href="/dashboard"
          className="w-full flex items-center justify-center gap-2 bg-muted text-foreground font-semibold rounded-xl py-3 text-sm hover:bg-accent active:scale-[0.98] transition-all duration-150"
        >
          Continue as Guest →
        </Link>

        <p className="text-center text-sm text-muted-foreground mt-5">
          Don't have an account?{" "}
          <Link href="/signup" className="text-primary font-semibold hover:underline">
            Sign up
          </Link>
        </p>
      </motion.div>

      <p className="text-xs text-muted-foreground mt-6">
        © 2026 FinanceOS · All rights reserved
      </p>
    </div>
  );
}

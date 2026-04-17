"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import {
  Brain,
  Send,
  TrendingUp,
  Shield,
  RefreshCw,
  DollarSign,
  FileText,
  Sparkles,
  ChevronRight,
  AlertTriangle,
} from "lucide-react";
import { aiInsights } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

const fmt = (n: number) =>
  n >= 1_000_000 ? `$${(n / 1_000_000).toFixed(1)}M` :
  n >= 1_000 ? `$${(n / 1_000).toFixed(0)}K` : `$${n.toLocaleString()}`;

const typeIcons: Record<string, React.ElementType> = {
  refinance: RefreshCw,
  debt: DollarSign,
  insurance: Shield,
  investment: TrendingUp,
  tax: FileText,
};

const priorityColors = {
  high: {
    border: "border-amber-200 dark:border-amber-800/50",
    bg: "bg-amber-50/60 dark:bg-amber-950/30",
    badge: "bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-300",
    icon: "text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/50",
  },
  medium: {
    border: "border-blue-200 dark:border-blue-800/50",
    bg: "bg-blue-50/40 dark:bg-blue-950/30",
    badge: "bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300",
    icon: "text-primary bg-primary/10",
  },
  low: {
    border: "border-border",
    bg: "bg-muted/30",
    badge: "bg-secondary text-secondary-foreground",
    icon: "text-muted-foreground bg-muted",
  },
};

const starterPrompts = [
  "Should I refinance my mortgage?",
  "How to reduce my burn rate?",
  "Biggest debt risk right now?",
  "Analyze insurance gaps",
  "Build a debt payoff plan",
];

type Message = { role: "user" | "ai"; content: string };

const aiResponses: Record<string, string> = {
  "Should I refinance my mortgage?": "Based on your current mortgage at 6.875% and today's rate environment around 6.1%, **refinancing could save you ~$340/month** — $4,080 annually. With $312K in equity, you have strong leverage. I'd recommend getting 2-3 quotes and targeting an 18-24 month break-even on closing costs.",
  "How to reduce my burn rate?": "Your current monthly burn is $28,450. Top three areas:\n\n1. **Payables timing** — Urban Eats has $32K overdue. Net-45 terms save ~$5K/month.\n2. **SaaS audit** — $1,959/mo across entities. Eliminating 20% saves ~$400.\n3. **Insurance bundling** — Multi-policy discounts could save ~$70/month.",
  "Biggest debt risk right now?": "Your highest-risk debt is the $2.1M commercial mortgage at 7.25% on the retail center. With cap rates rising, I'd recommend ensuring NOI coverage stays above 1.35x. Currently you're at 1.28x — borderline. Consider accelerating a lease renewal with the anchor tenant this quarter.",
};

type TabId = "insights" | "chat";

export default function AdvisorPage() {
  const [activeTab, setActiveTab] = useState<TabId>("insights");
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "ai",
      content: "Hi Marcus! I've analyzed your complete financial picture across all 3 businesses, personal accounts, and liabilities. I have **5 priority insights** for you today. What would you like to explore?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const sendMessage = (text?: string) => {
    const msg = text || input.trim();
    if (!msg) return;
    setInput("");
    if (activeTab !== "chat") setActiveTab("chat");

    const newMessages: Message[] = [...messages, { role: "user", content: msg }];
    setMessages(newMessages);
    setIsTyping(true);

    setTimeout(() => {
      const resp = aiResponses[msg] ||
        "I'm analyzing your financial data. Based on your current portfolio, I'd recommend reviewing your cash flow trends and ensuring you have 6 months of liquid reserves. Would you like a detailed scenario analysis?";
      setMessages([...newMessages, { role: "ai", content: resp }]);
      setIsTyping(false);
    }, 1200);
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-5 max-w-7xl mx-auto space-y-5 lg:space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
        <div className="flex items-center gap-3">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10">
            <Brain className="size-4 text-primary" />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-xl font-bold text-foreground leading-tight">AI Advisor</h1>
            <p className="text-xs text-muted-foreground">Analyzing 17 accounts in real-time</p>
          </div>
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 px-2.5 py-1 rounded-full border border-emerald-200 dark:border-emerald-800/50 shrink-0">
            <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Live
          </span>
        </div>
      </motion.div>

      {/* Mobile tabs */}
      <div className="flex gap-2 lg:hidden">
        {(["insights", "chat"] as TabId[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              "flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 active:scale-95 capitalize",
              activeTab === tab
                ? "bg-primary text-primary-foreground shadow-sm"
                : "bg-muted text-muted-foreground hover:text-foreground"
            )}
          >
            {tab === "insights" ? "💡 Insights" : "💬 Chat"}
          </button>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        {/* Insights panel */}
        <div className={cn("space-y-3", activeTab !== "insights" && "hidden lg:block")}>
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider hidden lg:block">Priority Insights</p>
          {aiInsights.map((insight, idx) => {
            const Icon = typeIcons[insight.type] || Brain;
            const colors = priorityColors[insight.priority];
            return (
              <motion.div
                key={insight.id}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: idx * 0.05 }}
                className={cn("rounded-2xl border p-4", colors.border, colors.bg)}
              >
                <div className="flex items-start gap-3">
                  <div className={cn("flex size-8 shrink-0 items-center justify-center rounded-xl mt-0.5", colors.icon)}>
                    <Icon className="size-3.5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <p className="text-sm font-semibold text-foreground leading-tight">{insight.title}</p>
                      <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 capitalize", colors.badge)}>
                        {insight.priority}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2 leading-relaxed">{insight.summary}</p>
                    <div className="flex items-center justify-between">
                      <div className="text-xs">
                        <span className="text-muted-foreground">{insight.impactLabel}: </span>
                        <span className="font-bold text-foreground">{fmt(insight.impact)}</span>
                      </div>
                      <button
                        onClick={() => sendMessage(insight.title)}
                        className="flex items-center gap-1 text-xs text-primary font-medium"
                      >
                        Ask AI <ChevronRight className="size-3" />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Chat panel */}
        <motion.div
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className={cn(
            "bg-card rounded-2xl border border-border shadow-sm flex flex-col",
            activeTab !== "chat" && "hidden lg:flex",
            "h-[520px] lg:h-[calc(100vh-12rem)]"
          )}
        >
          {/* Chat Header */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-border shrink-0">
            <div className="flex size-7 items-center justify-center rounded-lg bg-primary/10">
              <Brain className="size-3.5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">FinanceOS Advisor</p>
              <p className="text-[11px] text-muted-foreground">Full portfolio context</p>
            </div>
            <Sparkles className="ml-auto size-3.5 text-amber-500" />
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((m, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}
              >
                {m.role === "ai" && (
                  <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/10 mr-2 mt-1">
                    <Brain className="size-3 text-primary" />
                  </div>
                )}
                <div className={cn(
                  "max-w-[82%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed",
                  m.role === "user"
                    ? "bg-primary text-primary-foreground rounded-br-sm"
                    : "bg-muted text-foreground rounded-bl-sm"
                )}>
                  {m.content.split("\n").map((line, j) => (
                    <p key={j} className={j > 0 ? "mt-1.5" : ""}>
                      {line.split(/\*\*(.*?)\*\*/g).map((part, k) =>
                        k % 2 === 1 ? <strong key={k}>{part}</strong> : part
                      )}
                    </p>
                  ))}
                </div>
              </motion.div>
            ))}

            {isTyping && (
              <div className="flex items-center gap-2">
                <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/10">
                  <Brain className="size-3 text-primary" />
                </div>
                <div className="bg-muted rounded-2xl rounded-bl-sm px-3.5 py-2.5">
                  <div className="flex gap-1">
                    {[0, 1, 2].map((d) => (
                      <span key={d} className="size-1.5 rounded-full bg-muted-foreground animate-bounce"
                        style={{ animationDelay: `${d * 150}ms` }} />
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Starter prompts */}
          {messages.length <= 1 && (
            <div className="px-4 pb-2 shrink-0">
              <p className="text-[11px] text-muted-foreground mb-2 font-medium">Suggested:</p>
              <div className="flex flex-wrap gap-1.5">
                {starterPrompts.map((p) => (
                  <button
                    key={p}
                    onClick={() => sendMessage(p)}
                    className="text-[11px] bg-muted text-muted-foreground px-2.5 py-1.5 rounded-full hover:bg-primary hover:text-primary-foreground active:scale-95 transition-all duration-150"
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="px-4 py-3 border-t border-border shrink-0">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                placeholder="Ask about your finances..."
                className="flex-1 text-sm bg-muted rounded-xl px-3.5 py-2.5 outline-none ring-1 ring-transparent focus:ring-primary transition-all placeholder:text-muted-foreground"
              />
              <button
                onClick={() => sendMessage()}
                disabled={!input.trim()}
                className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground disabled:opacity-40 active:scale-95 transition-transform duration-150 shadow-sm"
              >
                <Send className="size-4" />
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

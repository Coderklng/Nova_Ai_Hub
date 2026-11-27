import React from "react";
import Link from "next/link";
import {
  Sparkles,
  Workflow,
  Users,
  Cpu,
  ShieldCheck,
  Terminal,
  ArrowLeft,
  ArrowRight,
} from "lucide-react";

interface FeatureItem {
  badge: string;
  title: string;
  desc: string;
  highlights: string[];
  icon: "agent" | "workflow" | "teams" | "routing" | "security" | "docs";
}

const FEATURES: FeatureItem[] = [
  {
    badge: "Core Workspace",
    title: "Multi-Mode Agent Sessions",
    desc: "Research, UI building, sprint planning, aur debugging ke liye dedicated agent modes ke saath live streaming responses.",
    highlights: [
      "Mode-specific prompts & context",
      "Real-time streaming & stop control",
      "Clean thread & session history",
    ],
    icon: "agent",
  },
  {
    badge: "Automation",
    title: "Repeatable Workflow Pipelines",
    desc: "Custom workflows banao, individual steps toggle karo, aur input payloads ke saath step-by-step execution log dekho.",
    highlights: [
      "Create, save & toggle pipeline steps",
      "MongoDB sync via /api/workflows",
      "Instant run & clear log controls",
    ],
    icon: "workflow",
  },
  {
    badge: "Enterprise",
    title: "Functional Pods & Roles",
    desc: "Engineering, Product, aur QA pods ke andar members add karo aur Admin, Builder, ya Viewer permissions manage karo.",
    highlights: [
      "Pod-focused workspace overview",
      "Admin, Builder & Viewer access rules",
      "Quick invite & role updates",
    ],
    icon: "teams",
  },
  {
    badge: "Model Layer",
    title: "Flexible Model Routing",
    desc: "Auto routing ya specific task models ke beech switch karo taaki speed aur depth dono ka balance bana rahe.",
    highlights: [
      "Fast routing for quick tasks",
      "Dedicated presets for specialized flows",
      "Agent template starter prompts",
    ],
    icon: "routing",
  },
  {
    badge: "Notifications & Auth",
    title: "Token Auth & Resend Alerts",
    desc: "Bearer token authentication ke saath backend sync aur Resend email notifications for inquiries aur updates.",
    highlights: [
      "Stateless Authorization: Bearer flow",
      "Enterprise inquiry email alerts",
      "Graceful fallback when offline",
    ],
    icon: "security",
  },
  {
    badge: "Developer Experience",
    title: "Built-In Docs & Community Hub",
    desc: "Searchable technical docs, copyable snippets, aur channel-based community discussions ek hi app ke andar.",
    highlights: [
      "Three-column docs reader + search",
      "Channel filters & thread posting",
      "Dark-mode responsive Next.js UI",
    ],
    icon: "docs",
  },
];

function FeatureIcon({ type }: { type: FeatureItem["icon"] }) {
  switch (type) {
    case "agent":
      return <Sparkles size={16} className="text-amber-400" />;
    case "workflow":
      return <Workflow size={16} className="text-amber-400" />;
    case "teams":
      return <Users size={16} className="text-sky-400" />;
    case "routing":
      return <Cpu size={16} className="text-amber-400" />;
    case "security":
      return <ShieldCheck size={16} className="text-sky-400" />;
    case "docs":
      return <Terminal size={16} className="text-amber-400" />;
  }
}

export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-[#05070d] text-white">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:py-12 md:px-8 space-y-10">
        {/* Top Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900/80 px-4 py-2 text-xs font-semibold text-zinc-200 transition hover:border-amber-400/50 hover:text-white"
          >
            <ArrowLeft size={14} />
            <span>Back to Home</span>
          </Link>

          <div className="flex items-center gap-2.5">
            <Link
              href="/pricing"
              className="rounded-xl border border-zinc-800 bg-zinc-900/80 px-4 py-2 text-xs font-semibold text-zinc-200 transition hover:border-zinc-600 hover:text-white"
            >
              Pricing
            </Link>
            <Link
              href="/changelog"
              className="inline-flex items-center gap-1.5 rounded-xl border border-amber-400/35 bg-amber-500/10 px-4 py-2 text-xs font-semibold text-amber-300 transition hover:bg-amber-500/20"
            >
              <span>Changelog</span>
              <ArrowRight size={13} />
            </Link>
          </div>
        </div>

        {/* Hero */}
        <section className="relative overflow-hidden rounded-3xl border border-zinc-800/80 bg-gradient-to-br from-[#0d0a07] via-[#070b14] to-[#081224] px-6 py-10 sm:px-10 sm:py-14 shadow-2xl">
          <div className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-amber-500/15 blur-3xl" />
          <div className="pointer-events-none absolute -left-24 -bottom-24 h-80 w-80 rounded-full bg-blue-600/20 blur-3xl" />

          <div className="relative z-10 max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-500/10 px-3.5 py-1 text-xs font-semibold text-amber-300">
              <Sparkles size={13} />
              <span>NovaAI Capabilities</span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-5xl leading-[1.08]">
              Everything You Need to{" "}
              <span className="bg-gradient-to-r from-amber-300 via-amber-400 to-orange-500 bg-clip-text text-transparent">
                Build & Automate
              </span>
            </h1>
            <p className="text-xs sm:text-base leading-relaxed text-zinc-300/90">
              Agent sessions, repeatable workflows, team pods, aur documentation
              ko ek fast dark-mode workspace mein combine kiya gaya hai.
            </p>
          </div>
        </section>

        {/* Features Grid */}
        <section className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((item) => (
            <div
              key={item.title}
              className="flex flex-col justify-between rounded-2xl border border-zinc-800/90 bg-[#0a0f1c]/90 p-6 transition hover:border-amber-400/40"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl border border-zinc-800 bg-zinc-950">
                    <FeatureIcon type={item.icon} />
                  </span>
                  <span className="rounded-full border border-amber-400/25 bg-amber-500/10 px-3 py-0.5 text-[11px] font-bold text-amber-300">
                    {item.badge}
                  </span>
                </div>
                <h2 className="text-lg font-bold text-white">{item.title}</h2>
                <p className="text-xs leading-relaxed text-zinc-400">
                  {item.desc}
                </p>
              </div>

              <ul className="mt-5 space-y-2 border-t border-zinc-800/80 pt-4 text-xs text-zinc-200">
                {item.highlights.map((pt) => (
                  <li key={pt} className="flex items-center gap-2">
                    <span className="font-bold text-amber-400">✓</span>
                    <span>{pt}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </section>
      </div>
    </div>
  );
}
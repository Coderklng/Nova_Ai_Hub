"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Check, ArrowLeft, Sparkles } from "lucide-react";

interface PlanItem {
  id: string;
  name: string;
  badge: string;
  monthlyPrice: string;
  yearlyPrice: string;
  desc: string;
  ctaLabel: string;
  ctaHref: string;
  featured?: boolean;
  features: string[];
}

const PLANS: PlanItem[] = [
  {
    id: "starter",
    name: "Starter",
    badge: "Free Tier",
    monthlyPrice: "₹0",
    yearlyPrice: "₹0",
    desc: "Solo builders aur learners ke liye jo agent modes aur local workflows test kar rahe hain.",
    ctaLabel: "Open Workspace",
    ctaHref: "/",
    features: [
      "Core agent modes & templates",
      "Local workflow runner & step toggles",
      "Docs & community hub access",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    badge: "Most Popular",
    monthlyPrice: "₹999 / mo",
    yearlyPrice: "₹799 / mo",
    desc: "Developers aur creators ke liye jinhe saved workflows, backend sync, aur higher throughput chahiye.",
    ctaLabel: "Start with Pro",
    ctaHref: "/workflows",
    featured: true,
    features: [
      "Everything in Starter",
      "Saved workflows & backend persistence",
      "Priority model routing & presets",
    ],
  },
  {
    id: "enterprise",
    name: "Enterprise",
    badge: "Teams & Scale",
    monthlyPrice: "Custom",
    yearlyPrice: "Custom",
    desc: "Organizations ke liye jo functional pods, custom agents, aur dedicated support chahti hain.",
    ctaLabel: "Talk to Sales",
    ctaHref: "/enterprise#enterprise-form",
    features: [
      "Team pods & Admin/Builder/Viewer roles",
      "Custom agent setup & integrations",
      "Dedicated support & SLA targets",
    ],
  },
];

export default function PricingPage() {
  const [billing, setBilling] = useState<"monthly" | "yearly">("monthly");

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
              href="/features"
              className="rounded-xl border border-zinc-800 bg-zinc-900/80 px-4 py-2 text-xs font-semibold text-zinc-200 transition hover:border-zinc-600 hover:text-white"
            >
              Features
            </Link>
            <Link
              href="/enterprise"
              className="rounded-xl border border-amber-400/35 bg-amber-500/10 px-4 py-2 text-xs font-semibold text-amber-300 transition hover:bg-amber-500/20"
            >
              Enterprise
            </Link>
          </div>
        </div>

        {/* Header + Billing Toggle */}
        <section className="flex flex-col justify-between gap-6 rounded-3xl border border-zinc-800/80 bg-gradient-to-br from-[#0d0a07] via-[#070b14] to-[#081224] px-6 py-10 sm:px-10 lg:flex-row lg:items-end">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-500/10 px-3.5 py-1 text-xs font-semibold text-amber-300">
              <Sparkles size={13} />
              <span>NovaAI Pricing</span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-5xl leading-[1.08]">
              Simple Plans That{" "}
              <span className="bg-gradient-to-r from-amber-300 via-amber-400 to-orange-500 bg-clip-text text-transparent">
                Scale With You
              </span>
            </h1>
            <p className="text-xs sm:text-base text-zinc-300/90">
              Solo experimentation se lekar multi-pod team setup tak—sirf wahi
              lo jo tumhare workflows ke liye zaroori hai.
            </p>
          </div>

          <div className="inline-flex items-center rounded-2xl border border-zinc-800 bg-[#050811] p-1 self-start lg:self-auto">
            <button
              type="button"
              onClick={() => setBilling("monthly")}
              className={`rounded-xl px-4 py-2 text-xs font-bold transition ${
                billing === "monthly"
                  ? "bg-gradient-to-r from-amber-400 to-orange-500 text-zinc-950"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              Monthly
            </button>
            <button
              type="button"
              onClick={() => setBilling("yearly")}
              className={`rounded-xl px-4 py-2 text-xs font-bold transition ${
                billing === "yearly"
                  ? "bg-gradient-to-r from-amber-400 to-orange-500 text-zinc-950"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              Yearly (Save 20%)
            </button>
          </div>
        </section>

        {/* Pricing Cards */}
        <section className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {PLANS.map((plan) => {
            const priceLabel =
              billing === "monthly" ? plan.monthlyPrice : plan.yearlyPrice;
            return (
              <div
                key={plan.id}
                className={`flex flex-col justify-between rounded-3xl border p-6 sm:p-7 ${
                  plan.featured
                    ? "border-amber-400/70 bg-gradient-to-b from-[#171208] to-[#0a0f1c] shadow-xl shadow-amber-500/10"
                    : "border-zinc-800/90 bg-[#0a0f1c]/90"
                }`}
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-2">
                    <h2 className="text-xl font-extrabold text-white">
                      {plan.name}
                    </h2>
                    <span className="rounded-full border border-amber-400/25 bg-amber-500/10 px-3 py-0.5 text-[11px] font-bold text-amber-300">
                      {plan.badge}
                    </span>
                  </div>

                  <div>
                    <p className="text-3xl font-extrabold text-white">
                      {priceLabel}
                    </p>
                    {billing === "yearly" && plan.id === "pro" && (
                      <p className="mt-1 text-[11px] text-amber-300">
                        Billed annually • 2 months equivalent savings
                      </p>
                    )}
                  </div>

                  <p className="text-xs leading-relaxed text-zinc-400">
                    {plan.desc}
                  </p>

                  <ul className="space-y-2.5 border-t border-zinc-800/80 pt-4 text-xs text-zinc-200">
                    {plan.features.map((feat) => (
                      <li key={feat} className="flex items-start gap-2">
                        <Check
                          size={14}
                          className="mt-0.5 shrink-0 text-amber-400"
                        />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <Link
                  href={plan.ctaHref}
                  className={`mt-6 inline-flex w-full items-center justify-center rounded-xl px-4 py-2.5 text-xs sm:text-sm font-bold transition ${
                    plan.featured
                      ? "bg-gradient-to-r from-amber-400 to-orange-500 text-zinc-950 shadow-lg shadow-amber-500/20 hover:brightness-110"
                      : "border border-zinc-700 bg-zinc-900 text-white hover:border-amber-400/50"
                  }`}
                >
                  {plan.ctaLabel}
                </Link>
              </div>
            );
          })}
        </section>
      </div>
    </div>
  );
}
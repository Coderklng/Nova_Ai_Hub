"use client";

import React from "react";
import {
  Zap,
  Rocket,
  ArrowRight,
  Play,
  Sparkles,
  FileSearch,
  Code2,
  Database,
  Layers,
  Bot,
} from "lucide-react";

interface HeroSectionProps {
  onStartFree?: () => void;
  onWatchDemo?: () => void;
}

const FLOATING_BADGES = [
  {
    title: "Deep Research",
    subtitle: "Find anything",
    icon: FileSearch,
    position: "lg:top-5 lg:left-6",
    color: "text-sky-400 border-sky-500/30 bg-sky-500/10",
  },
  {
    title: "Build Apps",
    subtitle: "In seconds",
    icon: Code2,
    position: "lg:top-8 lg:right-6",
    color: "text-blue-400 border-blue-500/30 bg-blue-500/10",
  },
  {
    title: "Analyze Data",
    subtitle: "With AI",
    icon: Database,
    position: "lg:top-1/2 lg:-translate-y-1/2 lg:left-4",
    color: "text-cyan-400 border-cyan-500/30 bg-cyan-500/10",
  },
  {
    title: "Multimodal Input",
    subtitle: "Images & audio",
    icon: Layers,
    position: "lg:bottom-5 lg:left-10",
    color: "text-amber-400 border-amber-500/30 bg-amber-500/10",
  },
  {
    title: "Automate Tasks",
    subtitle: "With Agents",
    icon: Zap,
    position: "lg:bottom-8 lg:right-6",
    color: "text-orange-400 border-orange-500/30 bg-orange-500/10",
  },
];

export default function HeroSection({
  onStartFree,
  onWatchDemo,
}: HeroSectionProps) {
  return (
    <section
      id="product"
      className="relative overflow-hidden rounded-3xl border border-zinc-800/80 bg-gradient-to-br from-[#0d0a07] via-[#070b14] to-[#081224] px-5 py-10 sm:px-8 sm:py-12 lg:px-12 lg:py-14 shadow-2xl"
    >
      {/* Ambient Background Glows */}
      <div className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-amber-500/15 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -right-24 h-80 w-80 rounded-full bg-blue-600/20 blur-3xl" />

      <div className="relative z-10 grid grid-cols-1 items-center gap-10 lg:grid-cols-12">
        {/* Left Hero Column */}
        <div className="lg:col-span-6 space-y-5 text-left">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/25 bg-amber-500/10 px-3.5 py-1.5 text-xs font-medium text-amber-200">
            <Zap size={13} className="text-amber-400" />
            <span>The Next-Gen Agentic AI</span>
          </div>

          <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl leading-[1.06]">
            Your AI Agent.
            <br />
            For{" "}
            <span className="bg-gradient-to-r from-amber-300 via-amber-400 to-orange-500 bg-clip-text text-transparent">
              Anything.
            </span>
          </h1>

          <p className="max-w-lg text-sm sm:text-base text-zinc-300/90 leading-relaxed">
            Plan, research, create and execute — with NovaAI, your all-in-one
            agentic AI assistant.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-1">
            <button
              type="button"
              onClick={onStartFree}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 px-6 py-3 text-sm font-bold text-zinc-950 shadow-lg shadow-amber-500/25 transition hover:brightness-110"
            >
              <Rocket size={16} />
              <span>Start for Free</span>
              <ArrowRight size={15} />
            </button>

            <button
              type="button"
              onClick={onWatchDemo}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-zinc-700 bg-zinc-900/80 px-6 py-3 text-sm font-semibold text-zinc-200 transition hover:border-zinc-500 hover:bg-zinc-800"
            >
              <Play size={14} className="fill-current" />
              <span>Watch Demo</span>
            </button>
          </div>

          {/* Trusted Users Stack */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <div className="flex -space-x-2">
              {["R", "P", "A", "K", "S"].map((initial, idx) => (
                <div
                  key={idx}
                  className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-[#080b12] bg-gradient-to-br from-amber-400 to-blue-500 text-[11px] font-bold text-zinc-950"
                >
                  {initial}
                </div>
              ))}
            </div>
            <p className="text-xs text-zinc-400">
              Trusted by <span className="font-semibold text-white">5M+</span>{" "}
              users worldwide
            </p>
          </div>
        </div>

        {/* Right Visual Core + Floating Capability Badges */}
        <div className="lg:col-span-6 relative flex flex-col items-center justify-center lg:min-h-[380px]">
          {/* Central Glowing AI Core */}
          <div className="relative my-4 flex h-44 w-44 sm:h-52 sm:w-52 items-center justify-center">
            <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-blue-600/35 via-amber-400/25 to-orange-500/35 blur-2xl" />
            <div className="absolute inset-3 rounded-full border border-amber-400/25 animate-spin [animation-duration:18s]" />
            <div className="absolute inset-7 rounded-full border border-sky-400/25 animate-spin [animation-duration:12s] [animation-direction:reverse]" />

            <div className="relative z-10 flex h-28 w-28 sm:h-32 sm:w-32 flex-col items-center justify-center rounded-full border border-amber-300/40 bg-gradient-to-b from-slate-900 via-[#0a1326] to-amber-950/70 shadow-[0_0_50px_rgba(251,191,36,0.28)]">
              <Bot size={36} className="text-amber-300" />
              <span className="mt-1 inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-sky-300">
                <Sparkles size={10} /> Core Active
              </span>
            </div>
          </div>

          {/* Mobile Grid / Desktop Floating Pills */}
          <div className="mt-4 grid w-full grid-cols-2 gap-2.5 sm:grid-cols-3 lg:mt-0 lg:block">
            {FLOATING_BADGES.map((badge) => {
              const Icon = badge.icon;
              return (
                <div
                  key={badge.title}
                  className={`lg:absolute ${badge.position} flex items-center gap-2.5 rounded-xl border border-zinc-800/90 bg-zinc-950/85 px-3 py-2 backdrop-blur-md shadow-lg`}
                >
                  <div
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border ${badge.color}`}
                  >
                    <Icon size={15} />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-xs font-semibold text-white">
                      {badge.title}
                    </p>
                    <p className="truncate text-[10px] text-zinc-400">
                      {badge.subtitle}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
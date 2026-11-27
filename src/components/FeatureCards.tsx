"use client";

import React from "react";
import { Zap, Search, Code, Layers, Settings } from "lucide-react";

const FEATURES = [
  {
    title: "Agentic AI",
    desc: "Delegate complex tasks to AI agents.",
    icon: Zap,
    badgeStyle: "text-amber-400 border-amber-500/30 bg-amber-500/10",
    glowStyle: "hover:border-amber-400/40 hover:shadow-amber-500/10",
  },
  {
    title: "Deep Research",
    desc: "Get detailed insights from the web.",
    icon: Search,
    badgeStyle: "text-sky-400 border-sky-500/30 bg-sky-500/10",
    glowStyle: "hover:border-sky-400/40 hover:shadow-sky-500/10",
  },
  {
    title: "Build & Deploy",
    desc: "Create and launch apps effortlessly.",
    icon: Code,
    badgeStyle: "text-emerald-400 border-emerald-500/30 bg-emerald-500/10",
    glowStyle: "hover:border-emerald-400/40 hover:shadow-emerald-500/10",
  },
  {
    title: "Multimodal Input",
    desc: "Chat with text, voice, images & more.",
    icon: Layers,
    badgeStyle: "text-purple-400 border-purple-500/30 bg-purple-500/10",
    glowStyle: "hover:border-purple-400/40 hover:shadow-purple-500/10",
  },
  {
    title: "Smart Automation",
    desc: "Automate workflows with ease.",
    icon: Settings,
    badgeStyle: "text-blue-400 border-blue-500/30 bg-blue-500/10",
    glowStyle: "hover:border-blue-400/40 hover:shadow-blue-500/10",
  },
];

export default function FeaturesSection() {
  return (
    <section
      id="features"
      className="rounded-3xl border border-zinc-800/80 bg-gradient-to-b from-[#070b14] via-[#060911] to-[#05070d] px-5 py-10 sm:px-8 sm:py-12 shadow-xl"
    >
      {/* Section Heading */}
      <div className="mx-auto max-w-2xl text-center space-y-2.5">
        <p className="text-xs font-semibold uppercase tracking-widest text-amber-400">
          — Powerful Features —
        </p>
        <h2 className="text-2xl font-extrabold tracking-tight text-white sm:text-4xl">
          Everything You Need in One AI Platform
        </h2>
      </div>

      {/* Responsive 5-Card Grid */}
      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {FEATURES.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.title}
              className={`group rounded-2xl border border-zinc-800/90 bg-[#0a0f1c]/90 p-5 transition-all duration-200 hover:-translate-y-1 hover:shadow-xl ${item.glowStyle}`}
            >
              <div
                className={`mb-4 flex h-10 w-10 items-center justify-center rounded-xl border transition-transform group-hover:scale-105 ${item.badgeStyle}`}
              >
                <Icon size={19} />
              </div>

              <h3 className="text-sm sm:text-base font-bold text-white">
                {item.title}
              </h3>

              <p className="mt-1.5 text-xs leading-relaxed text-zinc-400">
                {item.desc}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
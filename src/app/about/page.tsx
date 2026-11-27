import React from "react";
import Link from "next/link";
import { Sparkles, ArrowLeft, ArrowRight, Layers, Workflow, ShieldCheck } from "lucide-react";

const PILLARS = [
  {
    title: "Practical Agent Execution",
    desc: "Bina kisi heavy overhead ke focused agent modes, templates, aur real task pipelines banane par focus.",
    icon: "agent",
  },
  {
    title: "Reliable Full-Stack Glue",
    desc: "Next.js App Router aur Node/MongoDB services ko clean token auth aur graceful fallbacks ke saath jodna.",
    icon: "stack",
  },
  {
    title: "Built for Builders & Teams",
    desc: "Solo creators se lekar functional team pods tak—har level par fast iteration aur clear controls.",
    icon: "team",
  },
];

export default function AboutPage() {
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
              href="/careers"
              className="rounded-xl border border-zinc-800 bg-zinc-900/80 px-4 py-2 text-xs font-semibold text-zinc-200 transition hover:border-zinc-600 hover:text-white"
            >
              Careers
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center gap-1.5 rounded-xl border border-amber-400/35 bg-amber-500/10 px-4 py-2 text-xs font-semibold text-amber-300 transition hover:bg-amber-500/20"
            >
              <span>Contact</span>
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
              <span>About NovaAI</span>
            </div>

            <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-5xl leading-[1.08]">
              Building Fast AI &{" "}
              <span className="bg-gradient-to-r from-amber-300 via-amber-400 to-orange-500 bg-clip-text text-transparent">
                Workflow Tooling
              </span>
            </h1>

            <p className="text-xs sm:text-base leading-relaxed text-zinc-300/90">
              NovaAI ek modular workspace hai jo agent sessions, repeatable
              workflows, enterprise pods, aur clear documentation ko ek jagah
              lata hai—taaki ideas jaldi working software mein badal sakein.
            </p>
          </div>
        </section>

        {/* Pillars */}
        <section className="grid grid-cols-1 gap-5 md:grid-cols-3">
          {PILLARS.map((p) => (
            <div
              key={p.title}
              className="rounded-2xl border border-zinc-800/90 bg-[#0a0f1c]/90 p-6 space-y-3"
            >
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-zinc-800 bg-zinc-950 text-amber-400">
                {p.icon === "agent" && <Layers size={16} />}
                {p.icon === "stack" && <Workflow size={16} />}
                {p.icon === "team" && <ShieldCheck size={16} className="text-sky-400" />}
              </span>
              <h2 className="text-lg font-bold text-white">{p.title}</h2>
              <p className="text-xs leading-relaxed text-zinc-400">{p.desc}</p>
            </div>
          ))}
        </section>
      </div>
    </div>
  );
}
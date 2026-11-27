import React from "react";
import Link from "next/link";
import { FileText, ArrowLeft } from "lucide-react";

const TERMS_SECTIONS = [
  {
    title: "1. Acceptance of Terms",
    body: "By accessing or using NovaAI's interface, agent tools, workflow automation, or documentation, you agree to comply with these Terms of Service and applicable laws.",
  },
  {
    title: "2. Acceptable Use & Platform Rules",
    body: "You are responsible for your prompts, inputs, workflows, and team actions. Do not use the service for unlawful acts, malware, unauthorized access, harassment, infringement of third-party rights, or attempts to disrupt service availability.",
  },
  {
    title: "3. AI Output & No Warranty",
    body: "AI-generated code, summaries, plans, and workflow outputs may contain inaccuracies or incomplete details. Always review and test outputs independently before deploying to production or relying on them for critical decisions. Services are provided on an 'as is' and 'as available' basis.",
  },
  {
    title: "4. Accounts, Changes & Termination",
    body: "Keep your session credentials secure. Features, models, or endpoints may change over time, and access may be suspended or terminated if terms or platform security rules are violated.",
  },
];

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#05070d] text-white">
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 md:px-8 space-y-8">
        <div className="flex items-center justify-between gap-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900/80 px-4 py-2 text-xs font-semibold text-zinc-200 transition hover:border-amber-400/50 hover:text-white"
          >
            <ArrowLeft size={14} />
            <span>Back to Home</span>
          </Link>
          <Link
            href="/privacy"
            className="text-xs font-semibold text-amber-300 hover:underline"
          >
            Privacy Policy →
          </Link>
        </div>

        <section className="rounded-3xl border border-zinc-800/90 bg-gradient-to-br from-[#0d0a07] via-[#070b14] to-[#081224] p-6 sm:p-10 space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-300">
            <FileText size={13} />
            <span>NovaAI Legal</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            Terms of Service
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400">
            Last updated: November 2026 • Rules governing access to and use of
            NovaAI.
          </p>
        </section>

        <div className="space-y-4">
          {TERMS_SECTIONS.map((sec) => (
            <article
              key={sec.title}
              className="rounded-2xl border border-zinc-800/90 bg-[#0a0f1c] p-5 sm:p-6 space-y-2"
            >
              <h2 className="text-base font-bold text-white">{sec.title}</h2>
              <p className="text-xs sm:text-sm leading-relaxed text-zinc-300">
                {sec.body}
              </p>
            </article>
          ))}
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-[#070b14] p-5 text-xs sm:text-sm text-zinc-300">
          Questions about these terms:{" "}
          <span className="font-semibold text-amber-300">
            kkartiksharma999@gmail.com
          </span>
        </div>
      </div>
    </div>
  );
}
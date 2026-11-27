import React from "react";
import Link from "next/link";
import { ShieldCheck, ArrowLeft } from "lucide-react";

const PRIVACY_SECTIONS = [
  {
    title: "1. Information We Collect",
    body: "When you use NovaAI, we may collect account or contact details you submit (such as name, email, company, and inquiry notes), workspace data (workflows, agent prompts, and team pod settings), and session tokens stored in browser localStorage (such as novaai_token and novaai_session).",
  },
  {
    title: "2. How We Use & Process Data",
    body: "We process information strictly for specific operational purposes: authenticating your sessions, persisting workflows or conversations in our backend services, responding to enterprise or contact requests, and sending requested notifications via email providers such as Resend.",
  },
  {
    title: "3. Third-Party Services & AI Processing",
    body: "Agent execution, model routing, database storage, and email alerts may interact with external infrastructure and AI endpoints. Avoid entering passwords, government IDs, financial secrets, or sensitive personal data inside prompts or forms.",
  },
  {
    title: "4. Security, Retention & Your Rights",
    body: "We apply reasonable technical safeguards for data in transit and at rest, retain records only while needed for service operation or legal compliance, and honor requests to review, correct, or erase personal data upon contacting us.",
  },
];

export default function PrivacyPage() {
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
            href="/terms"
            className="text-xs font-semibold text-amber-300 hover:underline"
          >
            Terms of Service →
          </Link>
        </div>

        <section className="rounded-3xl border border-zinc-800/90 bg-gradient-to-br from-[#0d0a07] via-[#070b14] to-[#081224] p-6 sm:p-10 space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-300">
            <ShieldCheck size={13} />
            <span>NovaAI Legal</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            Privacy Policy
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400">
            Last updated: November 2026 • Applicable across NovaAI web workspace,
            workflows, and APIs.
          </p>
        </section>

        <div className="space-y-4">
          {PRIVACY_SECTIONS.map((sec) => (
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
          Privacy questions or data deletion requests:{" "}
          <span className="font-semibold text-amber-300">
            kkartiksharma999@gmail.com
          </span>
        </div>
      </div>
    </div>
  );
}
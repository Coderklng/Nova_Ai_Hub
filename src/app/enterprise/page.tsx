"use client";

import React, { useState } from "react";
import Link from "next/link";

interface EnterprisePillar {
  badge: string;
  title: string;
  desc: string;
  points: string[];
}

const PILLARS: EnterprisePillar[] = [
  {
    badge: "Custom Workflows",
    title: "Tailored Autonomous Agents",
    desc: "Apni team ke real operational workflows, internal APIs aur domain rules ke hisaab se custom agents deploy karo.",
    points: [
      "Multi-step task orchestration",
      "Custom tool & webhook execution",
      "Role-based access & guardrails",
    ],
  },
  {
    badge: "Reliability & SLA",
    title: "Dedicated Support & Low Latency",
    desc: "Production workloads ke liye high-availability streaming pipeline, priority escalation aur dedicated engineering help.",
    points: [
      "99.9% uptime SLA target",
      "Priority SSE stream stability",
      "Dedicated onboarding & support",
    ],
  },
  {
    badge: "Governance & Scale",
    title: "Team Workspace & Controls",
    desc: "Multiple teams, usage limits aur audit visibility ko ek unified enterprise console se manage karo.",
    points: [
      "Workspace-level usage controls",
      "Environment-wise API routing",
      "Centralized prompt & agent templates",
    ],
  },
];

const TEAM_SIZES = ["10-50", "51-200", "201-500", "500+"];

export default function EnterprisePage() {
  const [fullName, setFullName] = useState("");
  const [workEmail, setWorkEmail] = useState("");
  const [company, setCompany] = useState("");
  const [teamSize, setTeamSize] = useState("10-50");
  const [useCase, setUseCase] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setErrorMsg("");

    if (!fullName.trim() || !workEmail.trim() || !company.trim()) {
      setErrorMsg("Full name, work email, aur company daal bhai.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/enterprise/inquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: fullName.trim(),
          workEmail: workEmail.trim(),
          company: company.trim(),
          teamSize,
          useCase: useCase.trim(),
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setErrorMsg(data?.error || "Inquiry send nahi ho payi.");
        setSubmitting(false);
        return;
      }

      setSubmitted(true);
    } catch {
      setErrorMsg("Network error—server check kar.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#05070d] text-white">
      <div className="mx-auto max-w-7xl space-y-10 px-4 py-8 sm:py-12 md:px-8">
        {/* Top Navigation Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900/80 px-4 py-2 text-xs font-semibold text-zinc-200 transition hover:border-amber-400/50 hover:text-white"
          >
            <span>←</span>
            <span>Back to Home</span>
          </Link>

          <div className="flex items-center gap-2.5">
            <Link
              href="/agents"
              className="inline-flex items-center gap-1.5 rounded-xl border border-amber-400/35 bg-amber-500/10 px-4 py-2 text-xs font-semibold text-amber-300 transition hover:bg-amber-500/20"
            >
              <span>Agents Hub</span>
              <span>→</span>
            </Link>
          </div>
        </div>

        {/* Hero Banner */}
        <section className="relative overflow-hidden rounded-3xl border border-zinc-800/80 bg-gradient-to-br from-[#0d0a07] via-[#070b14] to-[#081224] px-6 py-10 sm:px-10 sm:py-14 shadow-2xl">
          <div className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-amber-500/15 blur-3xl" />
          <div className="pointer-events-none absolute -left-24 -bottom-24 h-80 w-80 rounded-full bg-blue-600/20 blur-3xl" />

          <div className="relative z-10 grid grid-cols-1 items-center gap-8 lg:grid-cols-12">
            <div className="lg:col-span-8 space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-500/10 px-3.5 py-1 text-xs font-semibold text-amber-300">
                <span>✦</span>
                <span>NovaAI Enterprise</span>
              </div>

              <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-5xl leading-[1.08]">
                Autonomous AI Built for{" "}
                <span className="bg-gradient-to-r from-amber-300 via-amber-400 to-orange-500 bg-clip-text text-transparent">
                  Teams & Scale
                </span>
              </h1>

              <p className="max-w-2xl text-xs sm:text-base leading-relaxed text-zinc-300/90">
                Custom agent solutions, dedicated support, aur real-time SSE
                streaming pipelines—jo teri organization ke workflows ke saath
                seamlessly fit ho.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <a
                  href="#enterprise-form"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 px-6 py-3 text-xs sm:text-sm font-bold text-zinc-950 shadow-lg shadow-amber-500/25 transition hover:brightness-110"
                >
                  <span>Contact Sales</span>
                  <span>→</span>
                </a>
                <Link
                  href="/agents"
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-zinc-700 bg-zinc-900/90 px-6 py-3 text-xs sm:text-sm font-semibold text-zinc-200 transition hover:border-zinc-500 hover:text-white"
                >
                  <span>Explore Live Agents</span>
                </Link>
              </div>
            </div>

            {/* Enterprise Highlights Box */}
            <div className="lg:col-span-4 rounded-2xl border border-zinc-800/90 bg-[#050811]/90 p-5 sm:p-6 space-y-4">
              <p className="text-[11px] font-bold uppercase tracking-wider text-amber-400">
                Enterprise Standards
              </p>

              <div className="space-y-3 text-xs">
                <div className="rounded-xl border border-zinc-800/80 bg-zinc-950/80 p-3">
                  <p className="font-bold text-white">Custom Solutions</p>
                  <p className="mt-0.5 text-zinc-400">
                    Tailored agents, prompts & backend integrations
                  </p>
                </div>

                <div className="rounded-xl border border-zinc-800/80 bg-zinc-950/80 p-3">
                  <p className="font-bold text-white">Dedicated Support</p>
                  <p className="mt-0.5 text-zinc-400">
                    Direct engineering assistance & SLA-backed reliability
                  </p>
                </div>

                <div className="rounded-xl border border-zinc-800/80 bg-zinc-950/80 p-3">
                  <p className="font-bold text-emerald-400">Real-Time Streaming</p>
                  <p className="mt-0.5 text-zinc-400">
                    Low-latency SSE delivery for live agent execution
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 3 Core Pillars */}
        <section className="space-y-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-amber-400">
              — Why Enterprise —
            </p>
            <h2 className="text-2xl font-extrabold text-white sm:text-3xl">
              Designed for Mission-Critical Execution
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            {PILLARS.map((pillar) => (
              <div
                key={pillar.title}
                className="flex flex-col justify-between rounded-2xl border border-zinc-800/90 bg-[#0a0f1c]/90 p-6 transition hover:border-amber-400/40"
              >
                <div>
                  <span className="inline-block rounded-full border border-amber-400/25 bg-amber-500/10 px-3 py-0.5 text-[11px] font-bold text-amber-300">
                    {pillar.badge}
                  </span>
                  <h3 className="mt-3 text-lg font-bold text-white">
                    {pillar.title}
                  </h3>
                  <p className="mt-1.5 text-xs leading-relaxed text-zinc-400">
                    {pillar.desc}
                  </p>
                </div>

                <ul className="mt-5 space-y-2 border-t border-zinc-800/80 pt-4 text-xs text-zinc-200">
                  {pillar.points.map((pt) => (
                    <li key={pt} className="flex items-center gap-2">
                      <span className="font-bold text-amber-400">✓</span>
                      <span>{pt}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* Sales & Custom Solution Request Form */}
        <section
          id="enterprise-form"
          className="rounded-3xl border border-zinc-800/90 bg-[#070b14] p-6 sm:p-10 shadow-2xl"
        >
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
            <div className="lg:col-span-5 space-y-3">
              <p className="text-xs font-semibold uppercase tracking-widest text-amber-400">
                Talk to Our Team
              </p>
              <h2 className="text-2xl font-extrabold text-white sm:text-3xl">
                Request Custom Enterprise Setup
              </h2>
              <p className="text-xs sm:text-sm leading-relaxed text-zinc-400">
                Apne workflows, team size aur agent requirements share kar. Hum
                ek tailored architecture & deployment plan taiyar karenge.
              </p>
            </div>

            <div className="lg:col-span-7">
              {submitted ? (
                <div className="rounded-2xl border border-emerald-500/40 bg-emerald-500/10 p-6 space-y-3">
                  <p className="text-base font-bold text-emerald-300">
                    Request Received — Thank You, {fullName}!
                  </p>
                  <p className="text-xs sm:text-sm text-zinc-200">
                    Humne <span className="font-semibold text-white">{company}</span>{" "}
                    (Team size: <span className="font-semibold text-white">{teamSize}</span>)
                    ke liye inquiry note kar li hai. Details <span className="underline">{workEmail}</span> par bhej di jayengi.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setSubmitted(false);
                      setErrorMsg("");
                      setFullName("");
                      setWorkEmail("");
                      setCompany("");
                      setUseCase("");
                    }}
                    className="rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-2 text-xs font-semibold text-white hover:border-zinc-500"
                  >
                    Submit Another Request
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-1.5 block text-xs font-semibold text-zinc-300">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Kartik Sharma"
                        className="w-full rounded-xl border border-zinc-800 bg-[#050811] px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder-zinc-500 focus:border-amber-400/60 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="mb-1.5 block text-xs font-semibold text-zinc-300">
                        Work Email *
                      </label>
                      <input
                        type="email"
                        required
                        value={workEmail}
                        onChange={(e) => setWorkEmail(e.target.value)}
                        placeholder="name@company.com"
                        className="w-full rounded-xl border border-zinc-800 bg-[#050811] px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder-zinc-500 focus:border-amber-400/60 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-1.5 block text-xs font-semibold text-zinc-300">
                        Company / Organization *
                      </label>
                      <input
                        type="text"
                        required
                        value={company}
                        onChange={(e) => setCompany(e.target.value)}
                        placeholder="NovaAI Labs"
                        className="w-full rounded-xl border border-zinc-800 bg-[#050811] px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder-zinc-500 focus:border-amber-400/60 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="mb-1.5 block text-xs font-semibold text-zinc-300">
                        Team Size
                      </label>
                      <div className="grid grid-cols-4 gap-1.5">
                        {TEAM_SIZES.map((size) => (
                          <button
                            key={size}
                            type="button"
                            onClick={() => setTeamSize(size)}
                            className={`rounded-xl border py-2 text-xs font-semibold transition ${
                              teamSize === size
                                ? "border-amber-400 bg-amber-500/20 text-amber-300"
                                : "border-zinc-800 bg-[#050811] text-zinc-400 hover:border-zinc-700 hover:text-zinc-200"
                            }`}
                          >
                            {size}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-zinc-300">
                      Workflow & Custom Agent Requirements
                    </label>
                    <textarea
                      rows={3}
                      value={useCase}
                      onChange={(e) => setUseCase(e.target.value)}
                      placeholder="Batayein ki kaunse tasks ya agents aap automate karna chahte hain..."
                      className="w-full rounded-xl border border-zinc-800 bg-[#050811] p-3.5 text-xs sm:text-sm text-white placeholder-zinc-500 focus:border-amber-400/60 focus:outline-none"
                    />
                  </div>

                  {errorMsg && (
                    <p className="rounded-xl border border-rose-500/40 bg-rose-500/10 px-3.5 py-2 text-xs text-rose-300">
                      {errorMsg}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full sm:w-auto rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 px-6 py-3 text-xs sm:text-sm font-bold text-zinc-950 shadow-lg shadow-amber-500/20 transition hover:brightness-110 disabled:opacity-60"
                  >
                    {submitting
                      ? "Sending Inquiry..."
                      : "Submit Enterprise Inquiry →"}
                  </button>
                </form>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
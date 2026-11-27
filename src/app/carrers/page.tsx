"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Briefcase, ArrowLeft, MapPin, CheckCircle2 } from "lucide-react";

interface OpenRole {
  id: string;
  title: string;
  team: string;
  location: string;
  type: string;
  summary: string;
}

const OPEN_ROLES: OpenRole[] = [
  {
    id: "role-genai",
    title: "Junior Generative AI & LLM Engineer",
    team: "Agents & Inference",
    location: "Jaipur / Remote (India)",
    type: "Full-Time / Internship",
    summary:
      "Prompt pipelines, agent workflows, retrieval/RAG evaluation, aur local/hosted model integration par kaam.",
  },
  {
    id: "role-fullstack",
    title: "Full-Stack TypeScript & Node Engineer",
    team: "Platform & APIs",
    location: "Jaipur / Remote (India)",
    type: "Full-Time",
    summary:
      "Next.js App Router UI modules, Node/Express REST endpoints, MongoDB schemas, aur clean auth/error handling.",
  },
  {
    id: "role-ui",
    title: "Product UI & Design Systems Builder",
    team: "Workspace Experience",
    location: "Remote (India)",
    type: "Contract / Part-Time",
    summary:
      "Dark-mode responsive interfaces, workflow builders, aur smooth mobile/desktop interactions.",
  },
];

export default function CareersPage() {
  const [selectedRole, setSelectedRole] = useState<string>(OPEN_ROLES[0].id);
  const [applicantName, setApplicantName] = useState("");
  const [applicantEmail, setApplicantEmail] = useState("");
  const [portfolioUrl, setPortfolioUrl] = useState("");
  const [note, setNote] = useState("");
  const [applied, setApplied] = useState(false);

  const activeRoleObj =
    OPEN_ROLES.find((r) => r.id === selectedRole) ?? OPEN_ROLES[0];

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!applicantName.trim() || !applicantEmail.trim()) return;
    setApplied(true);
  };

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
              href="/about"
              className="rounded-xl border border-zinc-800 bg-zinc-900/80 px-4 py-2 text-xs font-semibold text-zinc-200 transition hover:border-zinc-600 hover:text-white"
            >
              About Us
            </Link>
            <Link
              href="/contact"
              className="rounded-xl border border-amber-400/35 bg-amber-500/10 px-4 py-2 text-xs font-semibold text-amber-300 transition hover:bg-amber-500/20"
            >
              Contact
            </Link>
          </div>
        </div>

        {/* Hero */}
        <section className="rounded-3xl border border-zinc-800/80 bg-gradient-to-br from-[#0d0a07] via-[#070b14] to-[#081224] px-6 py-10 sm:px-10 shadow-2xl space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-500/10 px-3.5 py-1 text-xs font-semibold text-amber-300">
            <Briefcase size={13} />
            <span>Careers at NovaAI</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-5xl">
            Build Practical AI{" "}
            <span className="bg-gradient-to-r from-amber-300 via-amber-400 to-orange-500 bg-clip-text text-transparent">
              With Ownership
            </span>
          </h1>
          <p className="max-w-2xl text-xs sm:text-base text-zinc-300/90">
            Hum un builders ko welcome karte hain jo real shipped projects,
            clean UI/API code, aur fast problem-solving par vishwas rakhte hain.
          </p>
        </section>

        {/* Roles + Quick Application */}
        <section className="grid grid-cols-1 gap-6 lg:grid-cols-12 items-start">
          <div className="space-y-4 lg:col-span-7">
            {OPEN_ROLES.map((role) => {
              const isSelected = role.id === selectedRole;
              return (
                <div
                  key={role.id}
                  onClick={() => {
                    setSelectedRole(role.id);
                    setApplied(false);
                  }}
                  className={`cursor-pointer rounded-2xl border p-5 transition ${
                    isSelected
                      ? "border-amber-400/70 bg-gradient-to-b from-[#171208] to-[#0a0f1c]"
                      : "border-zinc-800/90 bg-[#0a0f1c]/90 hover:border-zinc-700"
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                    <span className="rounded-full border border-amber-400/25 bg-amber-500/10 px-3 py-0.5 font-bold text-amber-300">
                      {role.team}
                    </span>
                    <span className="text-zinc-400">{role.type}</span>
                  </div>
                  <h2 className="mt-2.5 text-lg font-bold text-white">
                    {role.title}
                  </h2>
                  <p className="mt-1 flex items-center gap-1.5 text-xs text-zinc-400">
                    <MapPin size={12} className="text-sky-400" />
                    <span>{role.location}</span>
                  </p>
                  <p className="mt-2.5 text-xs leading-relaxed text-zinc-300">
                    {role.summary}
                  </p>
                </div>
              );
            })}
          </div>

          <div className="lg:col-span-5 rounded-3xl border border-zinc-800/90 bg-[#070b14] p-6 space-y-4 shadow-xl">
            <h2 className="text-lg font-extrabold text-white">
              Apply: {activeRoleObj.title}
            </h2>

            {applied ? (
              <div className="rounded-2xl border border-emerald-500/40 bg-emerald-500/10 p-5 space-y-2.5">
                <div className="flex items-center gap-2 text-sm font-bold text-emerald-300">
                  <CheckCircle2 size={16} />
                  <span>Application Noted</span>
                </div>
                <p className="text-xs text-zinc-200">
                  Thanks, <span className="font-semibold text-white">{applicantName}</span>!{" "}
                  <span className="font-semibold text-amber-300">{activeRoleObj.title}</span>{" "}
                  ke liye aapki details note kar li gayi hain.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setApplied(false);
                    setApplicantName("");
                    setApplicantEmail("");
                    setPortfolioUrl("");
                    setNote("");
                  }}
                  className="rounded-xl border border-zinc-700 bg-zinc-900 px-3.5 py-1.5 text-xs font-semibold text-white"
                >
                  Apply Another
                </button>
              </div>
            ) : (
              <form onSubmit={handleApply} className="space-y-3.5">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-zinc-300">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={applicantName}
                    onChange={(e) => setApplicantName(e.target.value)}
                    placeholder="Your name"
                    className="w-full rounded-xl border border-zinc-800 bg-[#050811] px-3.5 py-2 text-xs sm:text-sm text-white placeholder-zinc-500 focus:border-amber-400/60 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold text-zinc-300">
                    Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={applicantEmail}
                    onChange={(e) => setApplicantEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full rounded-xl border border-zinc-800 bg-[#050811] px-3.5 py-2 text-xs sm:text-sm text-white placeholder-zinc-500 focus:border-amber-400/60 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold text-zinc-300">
                    GitHub / Hugging Face / Portfolio URL
                  </label>
                  <input
                    type="url"
                    value={portfolioUrl}
                    onChange={(e) => setPortfolioUrl(e.target.value)}
                    placeholder="https://github.com/..."
                    className="w-full rounded-xl border border-zinc-800 bg-[#050811] px-3.5 py-2 text-xs sm:text-sm text-white placeholder-zinc-500 focus:border-amber-400/60 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold text-zinc-300">
                    What have you built recently?
                  </label>
                  <textarea
                    rows={3}
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Share 1-2 projects, models, or apps you built..."
                    className="w-full rounded-xl border border-zinc-800 bg-[#050811] p-3 text-xs sm:text-sm text-white placeholder-zinc-500 focus:border-amber-400/60 focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 px-4 py-2.5 text-xs sm:text-sm font-bold text-zinc-950 transition hover:brightness-110"
                >
                  Submit Application →
                </button>
              </form>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
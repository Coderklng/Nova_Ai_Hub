import React from "react";
import Link from "next/link";
import { GitCommit, ArrowLeft } from "lucide-react";

interface ReleaseEntry {
  version: string;
  date: string;
  tag: string;
  title: string;
  summary: string;
  changes: string[];
}

const RELEASES: ReleaseEntry[] = [
  {
    version: "v1.3.0",
    date: "November 2026",
    tag: "Workflows & Legal",
    title: "Workflow Builder + Full Footer & Legal Pages",
    summary:
      "Naye workflows create/save karne ka flow, footer navigation pages, aur Resend-backed inquiry routes jode gaye.",
    changes: [
      "Added Create Workflow step builder with POST/PUT sync to /api/workflows.",
      "Removed credentials: 'include' from workflow fetch calls for cleaner CORS handling.",
      "Added /features, /pricing, /changelog, /privacy, and /terms routes.",
    ],
  },
  {
    version: "v1.2.0",
    date: "October 2026",
    tag: "Enterprise & Agents",
    title: "Enterprise Pods, Role Matrix & Agent Templates",
    summary:
      "Multi-pod team roster, role permissions inspector, aur reusable agent templates inspect/use flow add kiya gaya.",
    changes: [
      "Added Core Engineering, Product & Ops, and Governance & QA pods.",
      "Added Admin, Builder, and Viewer role capability previews.",
      "Connected template selection to /api/agents and workspace launcher.",
    ],
  },
  {
    version: "v1.1.0",
    date: "September 2026",
    tag: "Docs & Community",
    title: "Three-Column Docs Reader & Community Hub",
    summary:
      "Searchable documentation viewer with copyable code blocks aur channel-filtered community discussion feed launch hua.",
    changes: [
      "Added search filter, category sidebar, and right table of contents in Docs.",
      "Added channel filtering, upvotes, and thread composer in Community.",
      "Configured dark-mode responsive layout across mobile and desktop.",
    ],
  },
];

export default function ChangelogPage() {
  return (
    <div className="min-h-screen bg-[#05070d] text-white">
      <div className="mx-auto max-w-5xl px-4 py-8 sm:py-12 md:px-8 space-y-10">
        {/* Top Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900/80 px-4 py-2 text-xs font-semibold text-zinc-200 transition hover:border-amber-400/50 hover:text-white"
          >
            <ArrowLeft size={14} />
            <span>Back to Home</span>
          </Link>

          <Link
            href="/features"
            className="rounded-xl border border-amber-400/35 bg-amber-500/10 px-4 py-2 text-xs font-semibold text-amber-300 transition hover:bg-amber-500/20"
          >
            Explore Features →
          </Link>
        </div>

        {/* Header */}
        <section className="rounded-3xl border border-zinc-800/80 bg-gradient-to-br from-[#0d0a07] via-[#070b14] to-[#081224] px-6 py-10 sm:px-10 shadow-2xl space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-500/10 px-3.5 py-1 text-xs font-semibold text-amber-300">
            <GitCommit size={13} />
            <span>Release Notes</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-5xl">
            NovaAI Changelog
          </h1>
          <p className="text-xs sm:text-base text-zinc-300/90 max-w-2xl">
            Recent platform updates, workflow improvements, aur UI refinements ka
            log.
          </p>
        </section>

        {/* Release Entries */}
        <section className="space-y-5">
          {RELEASES.map((rel) => (
            <article
              key={rel.version}
              className="rounded-2xl border border-zinc-800/90 bg-[#0a0f1c]/90 p-6 space-y-3"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2.5">
                  <span className="rounded-lg border border-amber-400/35 bg-amber-500/10 px-2.5 py-1 font-extrabold text-amber-300">
                    {rel.version}
                  </span>
                  <span className="rounded-full border border-sky-400/30 bg-sky-500/10 px-2.5 py-0.5 font-semibold text-sky-300">
                    {rel.tag}
                  </span>
                </div>
                <span className="text-zinc-400">{rel.date}</span>
              </div>

              <h2 className="text-lg sm:text-xl font-bold text-white">
                {rel.title}
              </h2>
              <p className="text-xs sm:text-sm leading-relaxed text-zinc-300">
                {rel.summary}
              </p>

              <ul className="space-y-1.5 border-t border-zinc-800/80 pt-3 text-xs text-zinc-300">
                {rel.changes.map((chg) => (
                  <li key={chg} className="flex items-start gap-2">
                    <span className="font-bold text-amber-400">•</span>
                    <span>{chg}</span>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </section>
      </div>
    </div>
  );
}
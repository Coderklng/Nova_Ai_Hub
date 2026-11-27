"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  BookOpen,
  Search,
  Copy,
  Check,
  Terminal,
  Cpu,
  Layers,
  Smartphone,
  Sparkles,
  Menu,
  X,
  ChevronRight,
} from "lucide-react";

interface DocSection {
  id: string;
  category: "Getting Started" | "Architecture" | "PWA & Runtime";
  title: string;
  badge?: string;
  summary: string;
  points: string[];
  codeTitle?: string;
  code?: string;
  note?: string;
}

const DOC_SECTIONS: DocSection[] = [
  {
    id: "overview",
    category: "Getting Started",
    title: "NovaAI Platform Overview",
    badge: "v1.3",
    summary:
      "NovaAI combines a dark-mode Next.js workspace, agent modes, workflow automation, enterprise pods, and documentation into one responsive app.",
    points: [
      "Built on Next.js App Router with React client components and Tailwind CSS.",
      "Connects to the backend via NEXT_PUBLIC_BACKEND_URL with Authorization: Bearer <token> headers.",
      "Provides clean local fallbacks so UI flows stay responsive even when an optional endpoint is offline.",
    ],
    codeTitle: "App Routes Structure",
    code: `src/app/
├── page.tsx
├── features/page.tsx
├── pricing/page.tsx
├── changelog/page.tsx
├── docs/page.tsx
├── blog/page.tsx
├── community/page.tsx
├── enterprise/page.tsx
├── enterprise/teams/page.tsx
├── privacy/page.tsx
└── terms/page.tsx`,
    note: "Keep fetch calls free of credentials: 'include' when using token-based cross-origin APIs.",
  },
  {
    id: "quickstart",
    category: "Getting Started",
    title: "Environment & Local Setup",
    summary:
      "Configure environment variables for backend API communication and Resend email alerts before running the dev server.",
    points: [
      "Set NEXT_PUBLIC_BACKEND_URL to your backend base URL (for example https://nova-backend-77e0.onrender.com).",
      "Set RESEND_API_KEY and ALERT_TO_EMAIL in .env.local for server-side inquiry notifications.",
      "Run npm run dev and verify routes in the browser without console or build errors.",
    ],
    codeTitle: ".env.local Example",
    code: `NEXT_PUBLIC_BACKEND_URL=https://nova-backend-77e0.onrender.com
RESEND_API_KEY=re_xxxxxxxxx
ALERT_TO_EMAIL=kkartiksharma999@gmail.com`,
  },
  {
    id: "agent-workflows",
    category: "Architecture",
    title: "Workflows, Agents & Conversations",
    summary:
      "Core backend resources are organized around /api/workflows, /api/agents, /api/conversations, /api/subscriptions, and /api/users.",
    points: [
      "Workflows support creating pipelines, toggling steps, and syncing with /api/workflows.",
      "Agent templates and presets inspect starter prompts and system instructions.",
      "Community threads and updates can sync with /api/conversations or local state.",
    ],
    codeTitle: "Bearer Token Header Pattern",
    code: `const headers: Record<string, string> = {
  "Content-Type": "application/json",
};
if (token) {
  headers.Authorization = \`Bearer \${token}\`;
}`,
  },
  {
    id: "pwa-setup",
    category: "PWA & Runtime",
    title: "PWA Manifest & Mobile Polish",
    summary:
      "Ensure manifest icon paths match real files in public/icons/ and test mobile navigation across small viewports.",
    points: [
      "Keep 192x192 and 512x512 PNG icons in public/icons/.",
      "Use the mobile drawer toggle on small screens to switch documentation sections.",
      "Hard refresh (Ctrl + Shift + R) after updating styles or manifest assets.",
    ],
    codeTitle: "Manifest Icon Entries",
    code: `{
  "icons": [
    { "src": "/icons/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icons/icon-512.png", "sizes": "512x512", "type": "image/png" }
  ]
}`,
    note: "Verify icon paths in DevTools -> Application -> Manifest so no 404 requests occur.",
  },
];

const CATEGORIES: Array<DocSection["category"]> = [
  "Getting Started",
  "Architecture",
  "PWA & Runtime",
];

function getCategoryIcon(category: DocSection["category"]) {
  switch (category) {
    case "Getting Started":
      return <Terminal size={14} className="text-amber-400" />;
    case "Architecture":
      return <Layers size={14} className="text-sky-400" />;
    case "PWA & Runtime":
      return <Smartphone size={14} className="text-amber-400" />;
  }
}

export default function DocsPage() {
  const [activeId, setActiveId] = useState<string>(DOC_SECTIONS[0].id);
  const [search, setSearch] = useState<string>("");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [mobileNavOpen, setMobileNavOpen] = useState<boolean>(false);

  const filteredSections = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return DOC_SECTIONS;
    return DOC_SECTIONS.filter(
      (sec) =>
        sec.title.toLowerCase().includes(q) ||
        sec.summary.toLowerCase().includes(q) ||
        sec.category.toLowerCase().includes(q) ||
        sec.points.some((p) => p.toLowerCase().includes(q)) ||
        (sec.code && sec.code.toLowerCase().includes(q))
    );
  }, [search]);

  const currentSection =
    filteredSections.find((s) => s.id === activeId) ??
    filteredSections[0] ??
    DOC_SECTIONS[0];

  const handleCopy = async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 1600);
    } catch {
      // Ignore clipboard error
    }
  };

  return (
    <div className="min-h-screen bg-[#05070d] text-zinc-100 [color-scheme:dark]">
      {/* Top Header */}
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-zinc-800/90 bg-[#05070d]/95 px-4 backdrop-blur sm:px-6">
        <div className="flex items-center gap-2.5">
          <Link
            href="/"
            aria-label="Back to Home"
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900 text-zinc-200 transition hover:border-amber-400/60 hover:text-amber-300"
          >
            <ArrowLeft size={15} />
          </Link>

          <button
            type="button"
            onClick={() => setMobileNavOpen((v) => !v)}
            aria-label="Toggle documentation menu"
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900 text-zinc-300 transition hover:border-sky-400/50 hover:text-white lg:hidden"
          >
            {mobileNavOpen ? <X size={15} /> : <Menu size={15} />}
          </button>

          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg border border-amber-400/35 bg-amber-400/10 text-amber-300">
              <BookOpen size={14} />
            </span>
            <span className="text-sm font-bold tracking-tight text-white">
              NovaAI Docs
            </span>
            <span className="hidden rounded-full border border-sky-400/30 bg-sky-500/10 px-2 py-0.5 text-[11px] font-semibold text-sky-300 sm:inline">
              Guide
            </span>
          </div>
        </div>

        <div className="relative w-44 sm:w-72">
          <Search
            size={14}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search docs..."
            className="h-8 w-full rounded-xl border border-zinc-800 bg-zinc-900 pl-8 pr-3 text-xs text-zinc-100 placeholder-zinc-500 focus:border-amber-400/60 focus:outline-none"
          />
        </div>
      </header>

      {mobileNavOpen && (
        <div
          onClick={() => setMobileNavOpen(false)}
          className="fixed inset-0 top-14 z-20 bg-black/70 lg:hidden"
        />
      )}

      <div className="mx-auto flex max-w-7xl">
        {/* Left Sidebar */}
        <aside
          className={`fixed top-14 bottom-0 left-0 z-30 w-64 shrink-0 overflow-y-auto border-r border-zinc-800/90 bg-[#05070d] p-4 transition-transform duration-200 lg:sticky lg:block lg:h-[calc(100vh-3.5rem)] lg:translate-x-0 ${
            mobileNavOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="space-y-6">
            {CATEGORIES.map((category) => {
              const items = filteredSections.filter(
                (item) => item.category === category
              );
              if (items.length === 0) return null;

              return (
                <div key={category} className="space-y-1.5">
                  <div className="flex items-center gap-2 px-2 text-[11px] font-bold uppercase tracking-wider text-zinc-500">
                    {getCategoryIcon(category)}
                    <span>{category}</span>
                  </div>

                  <nav className="space-y-1">
                    {items.map((item) => {
                      const isActive = item.id === currentSection.id;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => {
                            setActiveId(item.id);
                            setMobileNavOpen(false);
                          }}
                          className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-xs transition ${
                            isActive
                              ? "border border-amber-400/40 bg-gradient-to-r from-amber-500/15 to-sky-500/10 font-semibold text-amber-200"
                              : "border border-transparent text-zinc-400 hover:bg-zinc-900 hover:text-zinc-100"
                          }`}
                        >
                          <span className="truncate">{item.title}</span>
                          {isActive && (
                            <ChevronRight
                              size={13}
                              className="shrink-0 text-amber-400"
                            />
                          )}
                        </button>
                      );
                    })}
                  </nav>
                </div>
              );
            })}

            {filteredSections.length === 0 && (
              <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-3 text-xs text-zinc-400">
                No matching doc sections for “{search}”.
              </div>
            )}
          </div>
        </aside>

        {/* Center Reading Column */}
        <main className="min-w-0 flex-1 px-4 py-8 sm:px-8 lg:px-10">
          <div className="mx-auto max-w-3xl space-y-6">
            <div className="flex flex-wrap items-center gap-2 text-xs text-sky-300">
              <span className="rounded-full border border-sky-400/30 bg-sky-500/10 px-2.5 py-0.5 font-semibold">
                {currentSection.category}
              </span>
              {currentSection.badge && (
                <span className="rounded-full border border-amber-400/35 bg-amber-400/10 px-2.5 py-0.5 font-semibold text-amber-300">
                  {currentSection.badge}
                </span>
              )}
            </div>

            <div className="space-y-3 border-b border-zinc-800/90 pb-6">
              <h1 className="text-2xl font-extrabold tracking-tight text-white sm:text-4xl">
                {currentSection.title}
              </h1>
              <p className="text-sm leading-relaxed text-zinc-300 sm:text-base">
                {currentSection.summary}
              </p>
            </div>

            <section id="key-points" className="space-y-3">
              <h2 className="flex items-center gap-2 text-base font-bold text-amber-300">
                <Sparkles size={15} />
                <span>Key Details</span>
              </h2>
              <ul className="space-y-2.5 rounded-2xl border border-zinc-800/90 bg-[#0a0f1c] p-4 text-sm text-zinc-200">
                {currentSection.points.map((point, idx) => (
                  <li key={idx} className="flex items-start gap-2.5">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-400" />
                    <span className="leading-relaxed">{point}</span>
                  </li>
                ))}
              </ul>
            </section>

            {currentSection.code && (
              <section id="code-example" className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <h2 className="flex items-center gap-2 text-sm font-bold text-zinc-200">
                    <Cpu size={14} className="text-sky-400" />
                    <span>{currentSection.codeTitle ?? "Example"}</span>
                  </h2>
                  <button
                    type="button"
                    onClick={() =>
                      handleCopy(currentSection.code!, currentSection.id)
                    }
                    className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-900 px-2.5 py-1 text-[11px] font-semibold text-zinc-300 transition hover:border-amber-400/50 hover:text-amber-300"
                  >
                    {copiedKey === currentSection.id ? (
                      <>
                        <Check size={12} className="text-emerald-400" />
                        <span className="text-emerald-300">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy size={12} />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>

                <pre className="overflow-x-auto rounded-2xl border border-zinc-800 bg-[#0a0f1c] p-4 text-xs leading-relaxed text-amber-100">
                  <code>{currentSection.code}</code>
                </pre>
              </section>
            )}

            {currentSection.note && (
              <div
                id="practical-note"
                className="rounded-2xl border border-sky-400/30 bg-sky-500/10 p-4 text-xs leading-relaxed text-sky-100 sm:text-sm"
              >
                <span className="font-bold text-sky-300">Note: </span>
                {currentSection.note}
              </div>
            )}
          </div>
        </main>

        {/* Right TOC */}
        <aside className="hidden w-52 shrink-0 py-8 pr-6 xl:block">
          <div className="sticky top-20 space-y-2.5 border-l border-zinc-800/90 pl-4">
            <p className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">
              On This Page
            </p>
            <div className="space-y-1.5 text-xs text-zinc-400">
              <a
                href="#key-points"
                className="block transition hover:text-amber-300"
              >
                Key Details
              </a>
              {currentSection.code && (
                <a
                  href="#code-example"
                  className="block transition hover:text-amber-300"
                >
                  {currentSection.codeTitle ?? "Example"}
                </a>
              )}
              {currentSection.note && (
                <a
                  href="#practical-note"
                  className="block transition hover:text-amber-300"
                >
                  Note
                </a>
              )}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
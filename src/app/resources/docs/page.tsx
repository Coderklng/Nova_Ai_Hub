"use client";

import React, { useState, useMemo, useEffect } from "react";
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

interface DocsPageProps {
  onBackHome?: () => void;
}

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
    badge: "v1.0",
    summary:
      "NovaAI combines a dark-mode Next.js workspace, specialized agent modes, model routing, and installable PWA support into a single responsive interface.",
    points: [
      "Built on Next.js App Router with React client workspaces and Tailwind CSS styling.",
      "Supports multi-mode agent sessions (Researcher, App Builder, Planner, Debugger).",
      "Designed for fast local workflows, clear visual hierarchy, and keyboard-first navigation.",
    ],
    codeTitle: "Project Structure",
    code: `src/
├── app/
│   ├── layout.tsx
│   ├── globals.css
│   ├── docs/page.tsx
│   └── page.tsx
├── components/
│   └── AgentPage.tsx
└── public/
    └── icons/
        ├── icon-192.png
        └── icon-512.png`,
    note: "Keep layout containers cleanly bounded so scroll stays inside the reading column instead of leaking to the outer viewport.",
  },
  {
    id: "quickstart",
    category: "Getting Started",
    title: "Local Setup & Dev Server",
    summary:
      "Start the development server cleanly, verify Tailwind compilation, and confirm manifest icons load without 404 responses.",
    points: [
      "Install dependencies and run clean dev/build scripts without conflicting bundler flags.",
      "Ensure icon assets exist in public/icons/ matching your web app manifest paths.",
      "Use hard refresh (Ctrl + Shift + R) after changing styles or PWA configuration.",
    ],
    codeTitle: "Terminal Commands",
    code: `npm install
npm run dev`,
    note: "If CSS looks unstyled after config changes, clear .next and restart the dev server.",
  },
  {
    id: "agent-workspace",
    category: "Architecture",
    title: "Agent Workspace & Modes",
    summary:
      "The agent interface separates thread management, live conversation streaming, and prompt controls into distinct regions.",
    points: [
      "Left rail manages chat threads, new session creation, and quick exit back to the main view.",
      "Top bar shows the active mode, selected model, generation status, and quick back navigation.",
      "Bottom composer supports multi-line input, Enter-to-send, voice dictation, and stream stop controls.",
    ],
    codeTitle: "Mode & Model Selection Pattern",
    code: `const activeModel = selectedModel === "auto"
  ? "Smart routing"
  : selectedModel;`,
  },
  {
    id: "pwa-setup",
    category: "PWA & Runtime",
    title: "PWA Manifest & Icons",
    summary:
      "Installable PWA behavior depends on a valid manifest and accessible PNG icons in public/icons/.",
    points: [
      "Provide both 192x192 and 512x512 PNG icons in public/icons/.",
      "Inspect DevTools -> Application -> Manifest to verify zero icon or fetch errors.",
      "Test offline fallback and service worker updates carefully before production release.",
    ],
    codeTitle: "Manifest Icon Entries",
    code: `{
  "icons": [
    { "src": "/icons/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icons/icon-512.png", "sizes": "512x512", "type": "image/png" }
  ]
}`,
    note: "Always verify icon dimensions and paths match what your manifest declares.",
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

export default function DocsPage({ onBackHome }: DocsPageProps) {
  const [sections, setSections] = useState<DocSection[]>(DOC_SECTIONS);
  const [activeId, setActiveId] = useState<string>(DOC_SECTIONS[0].id);
  const [search, setSearch] = useState<string>("");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [mobileNavOpen, setMobileNavOpen] = useState<boolean>(false);

  useEffect(() => {
    let cancelled = false;

    async function fetchDocs() {
      try {
        const res = await fetch("/api/docs", { cache: "no-store" });
        if (!res.ok) return;
        const data = await res.json();
        if (
          !cancelled &&
          Array.isArray(data?.sections) &&
          data.sections.length > 0
        ) {
          setSections(data.sections);
        }
      } catch {
        // Keep DOC_SECTIONS fallback
      }
    }

    fetchDocs();
    return () => {
      cancelled = true;
    };
  }, []);

  const filteredSections = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return sections;
    return sections.filter(
      (sec) =>
        sec.title.toLowerCase().includes(q) ||
        sec.summary.toLowerCase().includes(q) ||
        sec.category.toLowerCase().includes(q) ||
        sec.points.some((p) => p.toLowerCase().includes(q)) ||
        (sec.code && sec.code.toLowerCase().includes(q))
    );
  }, [search, sections]);

  const currentSection =
    filteredSections.find((s) => s.id === activeId) ??
    filteredSections[0] ??
    sections[0] ??
    DOC_SECTIONS[0];

  const handleExit = () => {
    if (typeof onBackHome === "function") {
      onBackHome();
    } else if (typeof window !== "undefined") {
      window.history.back();
    }
  };

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
    <div className="min-h-screen bg-zinc-950 text-zinc-100 [color-scheme:dark]">
      {/* Top Documentation Header */}
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-zinc-800/90 bg-zinc-950/95 px-4 backdrop-blur sm:px-6">
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleExit}
            aria-label="Go back"
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900 text-zinc-200 transition hover:border-amber-400/60 hover:text-amber-300"
          >
            <ArrowLeft size={15} />
          </button>

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

        {/* Search Input */}
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

      {/* Mobile Sidebar Backdrop */}
      {mobileNavOpen && (
        <div
          onClick={() => setMobileNavOpen(false)}
          className="fixed inset-0 top-14 z-20 bg-black/70 lg:hidden"
        />
      )}

      {/* Three-Column Docs Shell: Left Sidebar | Main Content | Right TOC */}
      <div className="mx-auto flex max-w-7xl">
        {/* Left Navigation Sidebar */}
        <aside
          className={`fixed top-14 bottom-0 left-0 z-30 w-64 shrink-0 overflow-y-auto border-r border-zinc-800/90 bg-zinc-950 p-4 transition-transform duration-200 lg:sticky lg:block lg:h-[calc(100vh-3.5rem)] lg:translate-x-0 ${
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

            {/* Key Takeaways */}
            <section id="key-points" className="space-y-3">
              <h2 className="flex items-center gap-2 text-base font-bold text-amber-300">
                <Sparkles size={15} />
                <span>Key Details</span>
              </h2>
              <ul className="space-y-2.5 rounded-2xl border border-zinc-800/90 bg-zinc-900/60 p-4 text-sm text-zinc-200">
                {currentSection.points.map((point, idx) => (
                  <li key={idx} className="flex items-start gap-2.5">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-400" />
                    <span className="leading-relaxed">{point}</span>
                  </li>
                ))}
              </ul>
            </section>

            {/* Code Snippet Block */}
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

                <pre className="overflow-x-auto rounded-2xl border border-zinc-800 bg-zinc-900 p-4 text-xs leading-relaxed text-amber-100 [scrollbar-width:thin] [scrollbar-color:#27272a_transparent]">
                  <code>{currentSection.code}</code>
                </pre>
              </section>
            )}

            {/* Tip / Callout Box */}
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

        {/* Right Table of Contents */}
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
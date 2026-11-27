"use client";

import React, { useState, useMemo, useEffect, useCallback } from "react";
import {
  ArrowLeft,
  Search,
  Sparkles,
  Copy,
  Check,
  Play,
  Layers,
  Code2,
  FileSearch,
  ListChecks,
  Wrench,
  Bot,
} from "lucide-react";

export interface AgentTemplate {
  id: string;
  backendId?: string;
  name: string;
  category: "Coding & UI" | "Research & RAG" | "Planning & Ops" | "Debugging";
  badge: string;
  recommendedModel: string;
  description: string;
  starterPrompt: string;
  systemPrompt: string;
  tools: string[];
}

interface AgentTemplatesPageProps {
  onBackHome?: () => void;
  onUseTemplate?: (template: AgentTemplate) => void;
}

const BACKEND_BASE_URL = (
  process.env.NEXT_PUBLIC_BACKEND_URL || "https://nova-backend-77e0.onrender.com"
).replace(/\/+$/, "");

const AGENT_TEMPLATES: AgentTemplate[] = [
  {
    id: "nextjs-ui-architect",
    name: "Next.js Dark UI Architect",
    category: "Coding & UI",
    badge: "Popular",
    recommendedModel: "nova-pro-router",
    description:
      "Designs clean App Router components, responsive layouts, and zinc/amber/sky dark interfaces with strict TypeScript types.",
    starterPrompt:
      "Build a responsive dark-mode pricing card grid in Next.js and Tailwind with an annual/monthly toggle.",
    systemPrompt:
      "You are a senior frontend UI architect. Output clean, strongly typed React + Tailwind code with clear state handling and mobile-first layout.",
    tools: ["Component Layout", "Tailwind Tokens", "TypeScript Check"],
  },
  {
    id: "rag-synthesis-analyst",
    name: "RAG & Doc Synthesis Analyst",
    category: "Research & RAG",
    badge: "Structured",
    recommendedModel: "khushi-business-ai",
    description:
      "Breaks down technical specs, compares architectures, and summarizes trade-offs into crisp bullet points without fluff.",
    starterPrompt:
      "Compare vector search vs hybrid keyword + semantic retrieval for technical documentation in plain terms.",
    systemPrompt:
      "You are a technical research analyst. Structure answers clearly with assumptions, pros/cons, and practical recommendations.",
    tools: ["Trade-off Matrix", "Summary Pass", "Source Checklist"],
  },
  {
    id: "sprint-roadmap-planner",
    name: "Feature & Sprint Planner",
    category: "Planning & Ops",
    badge: "Fast Start",
    recommendedModel: "auto",
    description:
      "Turns rough feature ideas into step-by-step milestones, edge cases, and testable deliverables.",
    starterPrompt:
      "Break down adding session persistence and model switching into a practical 5-step build plan.",
    systemPrompt:
      "You are an execution planner. Convert ideas into ordered, low-risk steps with clear done criteria.",
    tools: ["Milestone Breakdown", "Risk Check", "Order of Operations"],
  },
  {
    id: "bug-triage-debugger",
    name: "Root-Cause Debugger",
    category: "Debugging",
    badge: "Diagnostic",
    recommendedModel: "king:3b",
    description:
      "Isolates hydration mismatches, stale state closures, build/config errors, and runtime edge cases methodically.",
    starterPrompt:
      "Help me debug why a Next.js client component loses state or triggers extra re-renders on navigation.",
    systemPrompt:
      "You are a methodical software debugger. Identify root causes first, explain why they happen, and give minimal targeted fixes.",
    tools: ["State Trace", "Config Check", "Minimal Patch"],
  },
  {
    id: "api-contract-designer",
    name: "REST & Streaming Endpoint Spec",
    category: "Coding & UI",
    badge: "Backend",
    recommendedModel: "nova-pro-router",
    description:
      "Drafts clean request/response schemas, error payloads, and streaming contracts for agent backends.",
    starterPrompt:
      "Design a clean JSON request/response contract for a chat agent endpoint supporting model selection and stop signals.",
    systemPrompt:
      "You are an API contract designer. Define clear input validation, response shapes, status codes, and error cases.",
    tools: ["Schema Draft", "Error Cases", "Stream Flow"],
  },
  {
    id: "qa-test-matrix",
    name: "Edge-Case QA Reviewer",
    category: "Debugging",
    badge: "Quality",
    recommendedModel: "auto",
    description:
      "Audits UI flows and state transitions for empty inputs, slow networks, mobile viewports, and keyboard shortcuts.",
    starterPrompt:
      "List critical UI and state edge cases to test on a chat page with voice mic, model dropdown, and thread switching.",
    systemPrompt:
      "You are a pragmatic QA engineer. Focus on high-impact user flows, failure modes, and quick verification steps.",
    tools: ["Flow Audit", "Viewport Check", "Failure Modes"],
  },
];

const CATEGORIES: Array<"All" | AgentTemplate["category"]> = [
  "All",
  "Coding & UI",
  "Research & RAG",
  "Planning & Ops",
  "Debugging",
];

function getStoredAuthToken(): string {
  if (typeof window === "undefined") return "";

  const candidateKeys = [
    "novaai_token",
    "novaai_session",
    "nova_token",
    "token",
    "accessToken",
    "access_token",
    "authToken",
    "jwt",
    "user",
  ];

  for (const key of candidateKeys) {
    const raw = window.localStorage.getItem(key);
    if (!raw) continue;

    try {
      const parsed = JSON.parse(raw);
      if (typeof parsed === "string" && parsed.trim()) return parsed.trim();
      if (parsed && typeof parsed === "object") {
        const nested =
          parsed.token ||
          parsed.accessToken ||
          parsed.access_token ||
          parsed.jwt ||
          parsed.data?.token ||
          parsed.data?.accessToken ||
          parsed.user?.token;
        if (typeof nested === "string" && nested.trim()) return nested.trim();
      }
    } catch {
      const cleaned = raw.replace(/^"+|"+$/g, "").trim();
      if (cleaned) return cleaned;
    }
  }

  return "";
}

function getHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  const token = process.env.NEXT_PUBLIC_AUTH_TOKEN || getStoredAuthToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
}

function normalizeCategory(raw?: string): AgentTemplate["category"] {
  if (
    raw === "Coding & UI" ||
    raw === "Research & RAG" ||
    raw === "Planning & Ops" ||
    raw === "Debugging"
  ) {
    return raw;
  }
  return "Coding & UI";
}

function mapBackendAgentToTemplate(item: any, idx: number): AgentTemplate {
  const id = String(item?._id || item?.id || `agent-${idx}`);
  return {
    id,
    backendId: item?._id || item?.id,
    name: item?.name || item?.title || `Custom Agent ${idx + 1}`,
    category: normalizeCategory(item?.category),
    badge: item?.badge || "Saved Agent",
    recommendedModel: item?.recommendedModel || item?.model || "auto",
    description:
      item?.description ||
      "Custom agent synced from NovaAI backend (/api/agents).",
    starterPrompt:
      item?.starterPrompt ||
      "Help me execute a focused task using this agent configuration.",
    systemPrompt:
      item?.systemPrompt ||
      "You are a helpful NovaAI specialized assistant.",
    tools: Array.isArray(item?.tools) && item.tools.length > 0
      ? item.tools
      : ["Agent Execution", "Context Routing"],
  };
}

function renderCategoryIcon(category: AgentTemplate["category"]) {
  switch (category) {
    case "Coding & UI":
      return <Code2 size={14} className="text-amber-400" />;
    case "Research & RAG":
      return <FileSearch size={14} className="text-sky-400" />;
    case "Planning & Ops":
      return <ListChecks size={14} className="text-amber-400" />;
    case "Debugging":
      return <Wrench size={14} className="text-sky-400" />;
  }
}

export default function AgentTemplatesPage({
  onBackHome,
  onUseTemplate,
}: AgentTemplatesPageProps) {
  const [templates, setTemplates] = useState<AgentTemplate[]>(AGENT_TEMPLATES);
  const [selectedCategory, setSelectedCategory] =
    useState<"All" | AgentTemplate["category"]>("All");
  const [search, setSearch] = useState<string>("");
  const [selectedId, setSelectedId] = useState<string>(AGENT_TEMPLATES[0].id);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [launchedId, setLaunchedId] = useState<string | null>(null);
  const [backendStatus, setBackendStatus] = useState<string>("Presets ready");

  const loadBackendAgents = useCallback(async () => {
    try {
      const res = await fetch(`${BACKEND_BASE_URL}/api/agents`, {
        method: "GET",
        headers: getHeaders(),
      });
      if (!res.ok) return;

      const json = await res.json().catch(() => ({}));
      const list = Array.isArray(json?.data)
        ? json.data
        : Array.isArray(json?.agents)
          ? json.agents
          : Array.isArray(json)
            ? json
            : [];

      if (list.length > 0) {
        const mapped = list.map(mapBackendAgentToTemplate);
        setTemplates((prev) => {
          const existingIds = new Set(prev.map((p) => p.name));
          const uniqueRemote = mapped.filter(
            (m: AgentTemplate) => !existingIds.has(m.name)
          );
          return [...uniqueRemote, ...prev];
        });
        setBackendStatus(`Synced (${list.length} backend agents)`);
      }
    } catch {
      // Keep local templates if backend is unreachable
    }
  }, []);

  useEffect(() => {
    loadBackendAgents();
  }, [loadBackendAgents]);

  const filteredTemplates = useMemo(() => {
    const q = search.trim().toLowerCase();
    return templates.filter((tpl) => {
      const matchesCat =
        selectedCategory === "All" || tpl.category === selectedCategory;
      const matchesQuery =
        !q ||
        tpl.name.toLowerCase().includes(q) ||
        tpl.description.toLowerCase().includes(q) ||
        tpl.starterPrompt.toLowerCase().includes(q) ||
        tpl.tools.some((t) => t.toLowerCase().includes(q));
      return matchesCat && matchesQuery;
    });
  }, [templates, selectedCategory, search]);

  const activeTemplate =
    filteredTemplates.find((t) => t.id === selectedId) ??
    filteredTemplates[0] ??
    templates[0];

  const handleExit = () => {
    if (typeof onBackHome === "function") {
      onBackHome();
    } else if (typeof window !== "undefined") {
      window.history.back();
    }
  };

  const handleCopyPrompt = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 1600);
    } catch {
      // Ignore clipboard error
    }
  };

  const handleUseTemplate = async (tpl: AgentTemplate) => {
    setLaunchedId(tpl.id);
    setTimeout(() => setLaunchedId(null), 1400);

    try {
      const res = await fetch(`${BACKEND_BASE_URL}/api/agents`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({
          name: tpl.name,
          category: tpl.category,
          badge: tpl.badge,
          model: tpl.recommendedModel,
          description: tpl.description,
          starterPrompt: tpl.starterPrompt,
          systemPrompt: tpl.systemPrompt,
          tools: tpl.tools,
        }),
      });
      if (res.ok) {
        setBackendStatus(`Agent active: ${tpl.name}`);
      }
    } catch {
      // Proceed to launch template locally even if POST isn't required
    }

    if (typeof onUseTemplate === "function") {
      onUseTemplate(tpl);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 [color-scheme:dark]">
      {/* Top Bar */}
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-3 border-b border-zinc-800/90 bg-zinc-950/95 px-4 backdrop-blur sm:px-6">
        <div className="flex items-center gap-2.5 min-w-0">
          <button
            type="button"
            onClick={handleExit}
            aria-label="Go back"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900 text-zinc-200 transition hover:border-amber-400/60 hover:text-amber-300"
          >
            <ArrowLeft size={15} />
          </button>

          <div className="flex items-center gap-2 min-w-0">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-amber-400/35 bg-amber-400/10 text-amber-300">
              <Layers size={14} />
            </span>
            <span className="truncate text-sm font-bold tracking-tight text-white">
              Agent Templates
            </span>
            <span className="hidden rounded-full border border-sky-400/30 bg-sky-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-sky-300 sm:inline">
              {templates.length} presets
            </span>
            <span className="hidden rounded-full border border-zinc-800 bg-zinc-900 px-2.5 py-0.5 text-[11px] font-medium text-zinc-400 md:inline">
              {backendStatus}
            </span>
          </div>
        </div>

        {/* Search */}
        <div className="relative w-44 sm:w-72">
          <Search
            size={14}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search templates..."
            className="h-8 w-full rounded-xl border border-zinc-800 bg-zinc-900 pl-8 pr-3 text-xs text-zinc-100 placeholder-zinc-500 focus:border-amber-400/60 focus:outline-none"
          />
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-7 sm:px-6">
        {/* Hero / Filter Strip */}
        <div className="mb-6 flex flex-col justify-between gap-4 border-b border-zinc-800/90 pb-5 lg:flex-row lg:items-end">
          <div className="space-y-1.5">
            <h1 className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
              Start from a{" "}
              <span className="bg-gradient-to-r from-amber-300 via-amber-400 to-sky-400 bg-clip-text text-transparent">
                ready-made agent
              </span>
            </h1>
            <p className="text-xs text-zinc-400 sm:text-sm">
              Kisi bhi template ka prompt aur role inspect kar, ya ek click mein
              agent workspace mein load kar.
            </p>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 [scrollbar-width:none]">
            {CATEGORIES.map((cat) => {
              const active = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                    active
                      ? "border border-amber-400/50 bg-amber-400/15 text-amber-300"
                      : "border border-zinc-800 bg-zinc-900/80 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200"
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* Main Grid: Left Template Cards | Right Inspector */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:col-span-7">
            {filteredTemplates.map((tpl) => {
              const isSelected = tpl.id === activeTemplate.id;
              return (
                <div
                  key={tpl.id}
                  onClick={() => setSelectedId(tpl.id)}
                  className={`flex cursor-pointer flex-col justify-between rounded-2xl border p-4 transition ${
                    isSelected
                      ? "border-amber-400/60 bg-gradient-to-b from-amber-500/10 to-zinc-900/95 shadow-lg shadow-amber-500/5"
                      : "border-zinc-800 bg-zinc-900/70 hover:border-zinc-700 hover:bg-zinc-900"
                  }`}
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-zinc-400">
                        {renderCategoryIcon(tpl.category)}
                        {tpl.category}
                      </span>
                      <span className="rounded-full border border-sky-400/30 bg-sky-500/10 px-2 py-0.5 text-[10px] font-semibold text-sky-300">
                        {tpl.badge}
                      </span>
                    </div>

                    <h2 className="text-sm font-bold text-white">{tpl.name}</h2>
                    <p className="text-xs leading-relaxed text-zinc-400 line-clamp-3">
                      {tpl.description}
                    </p>
                  </div>

                  <div className="mt-4 flex items-center justify-between border-t border-zinc-800/80 pt-3">
                    <span className="rounded-md border border-zinc-800 bg-zinc-950 px-2 py-0.5 text-[10px] font-medium text-amber-300">
                      {tpl.recommendedModel}
                    </span>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleUseTemplate(tpl);
                      }}
                      className="inline-flex items-center gap-1 rounded-lg bg-gradient-to-r from-amber-400 to-orange-500 px-2.5 py-1 text-[11px] font-bold text-zinc-950 transition hover:brightness-110"
                    >
                      <Play size={11} className="fill-current" />
                      <span>{launchedId === tpl.id ? "Loaded" : "Use"}</span>
                    </button>
                  </div>
                </div>
              );
            })}

            {filteredTemplates.length === 0 && (
              <div className="col-span-full rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 text-center text-xs text-zinc-400">
                Koi template match nahi hua. Filter ya search clear karke dekh.
              </div>
            )}
          </div>

          {/* Right Template Inspector */}
          <aside className="lg:col-span-5">
            <div className="sticky top-20 space-y-4 rounded-2xl border border-zinc-800 bg-zinc-900/85 p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-amber-400">
                    <Bot size={13} />
                    <span>Template Preview</span>
                  </div>
                  <h2 className="text-lg font-extrabold text-white">
                    {activeTemplate.name}
                  </h2>
                </div>
                <span className="shrink-0 rounded-md border border-sky-400/30 bg-sky-500/10 px-2 py-1 text-[11px] font-semibold text-sky-300">
                  {activeTemplate.recommendedModel}
                </span>
              </div>

              <p className="text-xs leading-relaxed text-zinc-300 sm:text-sm">
                {activeTemplate.description}
              </p>

              {/* Capabilities / Tools */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">
                  Focus Areas
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {activeTemplate.tools.map((tool) => (
                    <span
                      key={tool}
                      className="rounded-lg border border-zinc-800 bg-zinc-950 px-2.5 py-1 text-[11px] font-medium text-zinc-300"
                    >
                      {tool}
                    </span>
                  ))}
                </div>
              </div>

              {/* Starter Prompt */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-zinc-500">
                    <Sparkles size={12} className="text-amber-400" />
                    Starter Prompt
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      handleCopyPrompt(
                        activeTemplate.starterPrompt,
                        activeTemplate.id
                      )
                    }
                    className="inline-flex items-center gap-1 rounded-md border border-zinc-800 bg-zinc-950 px-2 py-0.5 text-[10px] font-semibold text-zinc-300 hover:border-amber-400/50 hover:text-amber-300"
                  >
                    {copiedId === activeTemplate.id ? (
                      <>
                        <Check size={11} className="text-emerald-400" />
                        <span className="text-emerald-300">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy size={11} />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
                <pre className="whitespace-pre-wrap rounded-xl border border-zinc-800 bg-zinc-950 p-3 text-xs leading-relaxed text-amber-100">
                  {activeTemplate.starterPrompt}
                </pre>
              </div>

              {/* System Behavior */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">
                  System Instructions
                </span>
                <pre className="whitespace-pre-wrap rounded-xl border border-zinc-800 bg-zinc-950/80 p-3 text-xs leading-relaxed text-zinc-300">
                  {activeTemplate.systemPrompt}
                </pre>
              </div>

              <button
                type="button"
                onClick={() => handleUseTemplate(activeTemplate)}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500 px-4 py-2.5 text-xs font-extrabold text-zinc-950 shadow-md shadow-amber-500/20 transition hover:brightness-110"
              >
                <Play size={14} className="fill-current" />
                <span>Use This Template</span>
              </button>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
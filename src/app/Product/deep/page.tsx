"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  Search,
  Sparkles,
  Globe,
  FileCode2,
  Layers,
  ArrowUpRight,
  Square,
  SlidersHorizontal,
  Clock,
  Copy,
  Check,
} from "lucide-react";

interface SearchScope {
  id: string;
  label: string;
  hint: string;
}

interface SourceCard {
  id: string;
  title: string;
  domain: string;
  url?: string;
  tag: string;
  snippet: string;
  readTime: string;
}

interface SearchRun {
  query: string;
  scopeLabel: string;
  steps: string[];
  answer: string;
  sources: SourceCard[];
}

interface ParsedSseResult {
  deltaText: string;
  finalContent?: string;
}

const SEARCH_SCOPES: SearchScope[] = [
  { id: "all", label: "Deep Web", hint: "Cross-source synthesis" },
  { id: "docs", label: "Docs & Specs", hint: "Official guides & patterns" },
  { id: "code", label: "Code & Systems", hint: "Implementation & architecture" },
  { id: "comparisons", label: "Benchmarks", hint: "Trade-offs & comparisons" },
];

const QUICK_QUERIES: string[] = [
  "Next.js App Router vs Pages Router streaming behavior",
  "How to design fault-tolerant multi-step AI agent loops",
  "Best practices for responsive dark UI design systems",
  "Client state architecture before wiring live APIs",
];

const BASE_URL = (
  process.env.NEXT_PUBLIC_AGENTIC_URL || "https://nova-agent-13bm.onrender.com"
).replace(/\/+$/, "");

const AGENT_API_KEY =
  process.env.NEXT_PUBLIC_NOVA_API_KEY || "sk_kartiksharma@2005";

function getAuthHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json, text/event-stream, text/plain, */*",
  };
  if (AGENT_API_KEY) {
    headers["X-API-Key"] = AGENT_API_KEY;
    headers["Authorization"] = `Bearer ${AGENT_API_KEY}`;
  }
  return headers;
}

function parseSseLine(rawLine: string, currentEvent: string): ParsedSseResult {
  let line = rawLine.trim();
  if (!line || line.startsWith(":")) return { deltaText: "" };

  let activeEvent = currentEvent.toLowerCase();

  while (/^event:\s*[a-zA-Z0-9_-]+/i.test(line)) {
    const match = line.match(/^event:\s*([a-zA-Z0-9_-]+)\s*(.*)$/i);
    if (!match) break;
    activeEvent = match[1].trim().toLowerCase();
    line = (match[2] || "").trim();
  }

  while (/^data:\s*/i.test(line)) {
    line = line.replace(/^data:\s*/i, "").trim();
  }

  if (!line || line === "[DONE]" || activeEvent === "close") {
    return { deltaText: "" };
  }

  const jsonStart = line.indexOf("{");
  const jsonEnd = line.lastIndexOf("}");
  if (jsonStart >= 0 && jsonEnd > jsonStart) {
    const jsonStr = line.slice(jsonStart, jsonEnd + 1);
    try {
      const parsed = JSON.parse(jsonStr);
      if (parsed?.status === "done") {
        return { deltaText: "" };
      }

      const textPiece =
        parsed?.token ??
        parsed?.delta ??
        parsed?.text ??
        parsed?.content ??
        parsed?.message ??
        parsed?.response ??
        "";

      if (typeof textPiece === "string" && textPiece.length > 0) {
        if (activeEvent === "done" || parsed?.status === "completed") {
          return {
            deltaText: "",
            finalContent: textPiece,
          };
        }
        return { deltaText: textPiece };
      }

      return { deltaText: "" };
    } catch {
      return { deltaText: "" };
    }
  }

  if (line.startsWith('"') && line.endsWith('"')) {
    try {
      const unquoted = JSON.parse(line);
      if (typeof unquoted === "string") {
        return { deltaText: unquoted };
      }
    } catch {
      return { deltaText: "" };
    }
  }

  if (
    /^(event:|data:)/i.test(line) ||
    line.startsWith("{") ||
    line.startsWith("}")
  ) {
    return { deltaText: "" };
  }

  return { deltaText: line };
}

const MARKDOWN_COMPONENTS: Components = {
  h1: ({ children }) => (
    <h1 className="mt-3 mb-2 text-lg font-extrabold tracking-tight text-white sm:text-xl">
      {children}
    </h1>
  ),
  h2: ({ children }) => (
    <h2 className="mt-3 mb-1.5 text-base font-bold tracking-tight text-amber-300 sm:text-lg">
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 className="mt-2.5 mb-1 text-sm font-bold text-sky-300">{children}</h3>
  ),
  p: ({ children }) => (
    <p className="my-1.5 text-xs leading-7 text-zinc-100 sm:text-[15px]">
      {children}
    </p>
  ),
  ul: ({ children }) => (
    <ul className="my-2 list-disc space-y-1.5 pl-5 text-xs leading-7 text-zinc-100 sm:text-[15px]">
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol className="my-2 list-decimal space-y-1.5 pl-5 text-xs leading-7 text-zinc-100 sm:text-[15px]">
      {children}
    </ol>
  ),
  strong: ({ children }) => (
    <strong className="font-bold text-white">{children}</strong>
  ),
  a: ({ href, children }) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="font-medium text-sky-400 underline decoration-sky-400/40 underline-offset-2 hover:text-sky-300"
    >
      {children}
    </a>
  ),
  code: ({ className, children }) => {
    const isBlock =
      Boolean(className) || String(children ?? "").includes("\n");
    if (isBlock) {
      return (
        <pre className="my-3 overflow-x-auto rounded-2xl border border-zinc-800 bg-[#0b0e17] p-3.5 text-xs text-zinc-100">
          <code className="font-mono">
            {String(children ?? "").replace(/\n$/, "")}
          </code>
        </pre>
      );
    }
    return (
      <code className="rounded-md border border-zinc-800 bg-zinc-900 px-1.5 py-0.5 font-mono text-[11px] text-amber-300 sm:text-xs">
        {children}
      </code>
    );
  },
};

function extractSourcesFromAnswer(
  answerText: string,
  scopeLabel: string,
  query: string
): SourceCard[] {
  const urlMatches = Array.from(
    new Set(answerText.match(/https?:\/\/[^\s)\]>"]+/gi) || [])
  ).slice(0, 5);

  if (urlMatches.length > 0) {
    return urlMatches.map((rawUrl, idx) => {
      let domain = "web-source";
      try {
        domain = new URL(rawUrl).hostname.replace(/^www\./, "");
      } catch {
        // Keep fallback domain
      }

      const lineContainingUrl =
        answerText
          .split(/\r?\n/)
          .find((ln) => ln.includes(rawUrl))
          ?.replace(rawUrl, "")
          .replace(/\[[^\]]*\]|\(|\)|\*|#|-/g, " ")
          .replace(/\s+/g, " ")
          .trim() || "";

      return {
        id: `src-${idx + 1}`,
        title:
          lineContainingUrl.slice(0, 72) ||
          `${domain} — ${query.slice(0, 36)}`,
        domain,
        url: rawUrl,
        tag: scopeLabel,
        snippet:
          lineContainingUrl ||
          `Referenced during ${scopeLabel} research for "${query}".`,
        readTime: `${3 + (idx % 4)} min read`,
      };
    });
  }

  return [
    {
      id: "src-1",
      title: `NovaAI ${scopeLabel} Synthesis`,
      domain: "nova-agent.internal",
      tag: scopeLabel,
      snippet:
        "Synthesized directly from NovaAI research pass without external link citations in this run.",
      readTime: "3 min read",
    },
  ];
}

export default function DeepSearchPage() {
  const [query, setQuery] = useState<string>("");
  const [scopeId, setScopeId] = useState<string>("all");
  const [searching, setSearching] = useState<boolean>(false);
  const [streamedAnswer, setStreamedAnswer] = useState<string>("");
  const [activeRun, setActiveRun] = useState<SearchRun | null>(null);
  const [recentQueries, setRecentQueries] = useState<string[]>(
    QUICK_QUERIES.slice(0, 3)
  );
  const [copiedAnswer, setCopiedAnswer] = useState<boolean>(false);

  const abortRef = useRef<AbortController | null>(null);
  const sessionIdRef = useRef<string>("deep-search-session");

  const currentScope =
    SEARCH_SCOPES.find((s) => s.id === scopeId) ?? SEARCH_SCOPES[0];

  useEffect(() => {
    sessionIdRef.current = `deep-search-${Date.now()}`;
    return () => {
      abortRef.current?.abort();
    };
  }, []);

  const stopSearch = () => {
    abortRef.current?.abort();
    abortRef.current = null;
    setSearching(false);
  };

  const handleCopyAnswer = async () => {
    if (!streamedAnswer) return;
    try {
      await navigator.clipboard.writeText(streamedAnswer);
      setCopiedAnswer(true);
      setTimeout(() => setCopiedAnswer(false), 1800);
    } catch {
      // Ignore clipboard failure
    }
  };

  const executeSearch = async (rawQuery?: string, overrideScope?: SearchScope) => {
    const cleanQuery = (rawQuery ?? query).trim();
    if (!cleanQuery || searching) return;

    const selectedScope = overrideScope ?? currentScope;
    if (!rawQuery) setQuery(cleanQuery);

    setSearching(true);
    setStreamedAnswer("");
    setCopiedAnswer(false);

    const initialRun: SearchRun = {
      query: cleanQuery,
      scopeLabel: selectedScope.label,
      steps: [
        `Scoped query under "${selectedScope.label}" (${selectedScope.hint})`,
        "Running NovaAI web & architecture research stream",
        "Extracting key findings and source links",
      ],
      answer: "",
      sources: [],
    };
    setActiveRun(initialRun);

    setRecentQueries((prev) => [
      cleanQuery,
      ...prev.filter((item) => item !== cleanQuery).slice(0, 4),
    ]);

    const controller = new AbortController();
    abortRef.current = controller;

    const scopedPrompt = [
      `[Deep Search Scope: ${selectedScope.label} — ${selectedScope.hint}]`,
      "Provide a structured, multi-step technical answer with clear headings/bullet points and include exact source URLs where available.",
      `Question: ${cleanQuery}`,
    ].join("\n");

    let accumulated = "";

    const processLine = (rawLine: string, currentEvent: string) => {
      const parsed = parseSseLine(rawLine, currentEvent);
      if (parsed.deltaText) {
        accumulated += parsed.deltaText;
      } else if (parsed.finalContent && !accumulated) {
        accumulated = parsed.finalContent;
      }
    };

    try {
      const res = await fetch(`${BASE_URL}/api/v1/agents/stream`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          prompt: scopedPrompt,
          session_id: sessionIdRef.current,
          mode: "agent",
        }),
        signal: controller.signal,
      });
      console.log(res);
      if (!res.ok) {
        const errText = await res.text().catch(() => "");
        throw new Error(
          `Stream error (${res.status}): ${errText || res.statusText}`
        );
      }

      if (res.body) {
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        let currentEvent = "message";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split(/\r?\n/);
          buffer = lines.pop() ?? "";

          for (const rawLine of lines) {
            const trimmed = rawLine.trim();
            if (!trimmed) {
              currentEvent = "message";
              continue;
            }
            if (trimmed.startsWith("event:")) {
              currentEvent = trimmed.slice(6).trim();
              continue;
            }
            processLine(trimmed, currentEvent);
          }

          if (accumulated) {
            const snapshot = accumulated;
            setStreamedAnswer(snapshot);
          }
        }

        if (buffer.trim()) {
          processLine(buffer.trim(), currentEvent);
          if (accumulated) {
            const snapshot = accumulated;
            setStreamedAnswer(snapshot);
          }
        }
      } else {
        const textBody = await res.text();
        let currentEvent = "message";
        for (const rawLine of textBody.split(/\r?\n/)) {
          const trimmed = rawLine.trim();
          if (!trimmed) {
            currentEvent = "message";
            continue;
          }
          if (trimmed.startsWith("event:")) {
            currentEvent = trimmed.slice(6).trim();
            continue;
          }
          processLine(trimmed, currentEvent);
        }
        setStreamedAnswer(accumulated);
      }

      const finalText =
        accumulated.trim() || "No response returned from NovaAI.";
      const extractedSources = extractSourcesFromAnswer(
        finalText,
        selectedScope.label,
        cleanQuery
      );

      setStreamedAnswer(finalText);
      setActiveRun((prev) =>
        prev
          ? {
              ...prev,
              answer: finalText,
              sources: extractedSources,
            }
          : null
      );
    } catch (err: unknown) {
      if ((err as { name?: string })?.name === "AbortError") {
        const stoppedText = accumulated.trim() || "_Search stopped._";
        setStreamedAnswer(stoppedText);
      } else {
        const msg = err instanceof Error ? err.message : "Deep search failed";
        setStreamedAnswer(`### Search Error\n\n\`${msg}\``);
      }
    } finally {
      abortRef.current = null;
      setSearching(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    executeSearch();
  };

  return (
    <div className="min-h-screen bg-[#05070d] text-white">
      <div className="mx-auto max-w-6xl px-4 py-7 sm:py-10 md:px-8 space-y-8">
        {/* Top Navigation Strip */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900/80 px-3.5 py-2 text-xs font-semibold text-zinc-200 transition hover:border-amber-400/50 hover:text-white"
          >
            <span>←</span>
            <span>Home</span>
          </Link>

          <div className="flex items-center gap-2">
            <Link
              href="/product"
              className="rounded-xl border border-zinc-800 bg-zinc-900/80 px-3.5 py-2 text-xs font-semibold text-zinc-300 transition hover:border-zinc-600 hover:text-white"
            >
              Product
            </Link>
            <Link
              href="/pricing"
              className="rounded-xl border border-amber-400/35 bg-amber-500/10 px-3.5 py-2 text-xs font-semibold text-amber-300 transition hover:bg-amber-500/20"
            >
              Pricing
            </Link>
          </div>
        </div>

        {/* Search Hero & Input Box */}
        <section className="relative overflow-hidden rounded-3xl border border-zinc-800/80 bg-gradient-to-br from-[#0d0a07] via-[#070b14] to-[#081224] p-6 sm:p-10 shadow-2xl">
          <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-amber-500/15 blur-3xl" />
          <div className="pointer-events-none absolute -left-24 -bottom-24 h-72 w-72 rounded-full bg-blue-600/15 blur-3xl" />

          <div className="relative z-10 mx-auto max-w-3xl space-y-5">
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-500/10 px-3.5 py-1 text-xs font-semibold text-amber-300">
              <Sparkles size={13} />
              <span>NovaAI Deep Search</span>
            </div>

            <div className="space-y-1.5">
              <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white">
                Multi-Step Answers with{" "}
                <span className="bg-gradient-to-r from-amber-300 via-amber-400 to-orange-500 bg-clip-text text-transparent">
                  Structured Sources
                </span>
              </h1>
              <p className="text-xs sm:text-sm text-zinc-400">
                Koi bhi technical topic ya question pooch—scope choose kar aur
                synthesized answer + source cards dekh.
              </p>
            </div>

            {/* Scope Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              <span className="inline-flex shrink-0 items-center gap-1 text-[11px] font-medium text-zinc-400 pr-1">
                <SlidersHorizontal size={12} className="text-amber-400" />
                <span>Scope:</span>
              </span>
              {SEARCH_SCOPES.map((sc) => {
                const active = sc.id === scopeId;
                return (
                  <button
                    key={sc.id}
                    type="button"
                    onClick={() => setScopeId(sc.id)}
                    className={`shrink-0 rounded-xl border px-3 py-1.5 text-xs font-semibold transition ${
                      active
                        ? "border-amber-400 bg-amber-500/20 text-amber-200"
                        : "border-zinc-800 bg-[#050811]/90 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200"
                    }`}
                  >
                    {sc.label}
                  </button>
                );
              })}
            </div>

            {/* Main Search Bar */}
            <form
              onSubmit={handleSubmit}
              className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 rounded-2xl border border-zinc-700/80 bg-[#050811]/95 p-2 shadow-xl focus-within:border-amber-400/60"
            >
              <div className="flex flex-1 items-center gap-2.5 px-2.5">
                <Search size={18} className="shrink-0 text-amber-400" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Ask a deep question, compare tools, or explore architecture..."
                  className="w-full bg-transparent py-2 text-xs sm:text-sm text-white placeholder-zinc-500 focus:outline-none"
                />
              </div>

              {searching ? (
                <button
                  type="button"
                  onClick={stopSearch}
                  className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-rose-500/40 bg-rose-500/20 px-4 py-2.5 text-xs sm:text-sm font-semibold text-rose-200 hover:bg-rose-500/30"
                >
                  <Square size={13} className="fill-current" />
                  <span>Stop</span>
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={!query.trim()}
                  className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 px-5 py-2.5 text-xs sm:text-sm font-bold text-zinc-950 shadow-lg shadow-amber-500/20 transition hover:brightness-110 disabled:opacity-40"
                >
                  <Search size={14} strokeWidth={2.4} />
                  <span>Search</span>
                </button>
              )}
            </form>

            {/* Quick Prompt Suggestions */}
            <div className="flex flex-wrap gap-2 pt-1">
              {QUICK_QUERIES.map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => executeSearch(q)}
                  className="rounded-full border border-zinc-800/90 bg-zinc-900/70 px-3 py-1 text-[11px] text-zinc-300 transition hover:border-amber-400/40 hover:text-amber-200"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Search Results Workspace */}
        {activeRun ? (
          <section className="grid grid-cols-1 gap-6 lg:grid-cols-12 items-start">
            {/* Left/Main: Synthesized Answer & Steps */}
            <div className="lg:col-span-8 space-y-4 rounded-3xl border border-zinc-800/90 bg-[#070b14] p-5 sm:p-7 shadow-xl">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-800/80 pb-3.5">
                <div className="min-w-0">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400">
                    {activeRun.scopeLabel}
                  </span>
                  <h2 className="truncate text-base sm:text-xl font-bold text-white">
                    {activeRun.query}
                  </h2>
                </div>
                <div className="flex items-center gap-2">
                  {streamedAnswer && !searching && (
                    <button
                      type="button"
                      onClick={handleCopyAnswer}
                      className="inline-flex items-center gap-1 rounded-full border border-zinc-800 bg-zinc-900 px-2.5 py-1 text-[11px] font-medium text-zinc-300 hover:border-amber-400/40 hover:text-amber-200"
                    >
                      {copiedAnswer ? (
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
                  )}
                  <span className="rounded-full border border-zinc-800 bg-zinc-900 px-2.5 py-1 text-[11px] text-zinc-400">
                    {searching
                      ? "Synthesizing..."
                      : `${activeRun.sources.length} sources`}
                  </span>
                </div>
              </div>

              {/* Research Steps */}
              <div className="rounded-2xl border border-zinc-800/80 bg-[#050811] p-3.5 space-y-1.5">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                  Search Pass
                </p>
                {activeRun.steps.map((step: string, i: number) => (
                  <p key={i} className="text-xs text-zinc-300">
                    <span className="text-amber-400 font-bold mr-1.5">✓</span>
                    {step}
                  </p>
                ))}
              </div>

              {/* Streamed Answer */}
              <div className="min-w-0">
                {streamedAnswer ? (
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={MARKDOWN_COMPONENTS}
                  >
                    {streamedAnswer}
                  </ReactMarkdown>
                ) : (
                  <span className="text-xs sm:text-sm text-zinc-400 animate-pulse">
                    Gathering context & searching sources...
                  </span>
                )}
              </div>
            </div>

            {/* Right: Sources & Recent Queries */}
            <aside className="lg:col-span-4 space-y-5">
              <div className="rounded-3xl border border-zinc-800/90 bg-[#070b14] p-5 space-y-3 shadow-xl">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-400">
                  <Globe size={14} />
                  <span>Sources & References</span>
                </div>

                <div className="space-y-3">
                  {(activeRun.sources.length > 0
                    ? activeRun.sources
                    : extractSourcesFromAnswer(
                        streamedAnswer,
                        activeRun.scopeLabel,
                        activeRun.query
                      )
                  ).map((src: SourceCard) => (
                    <div
                      key={src.id}
                      className="rounded-2xl border border-zinc-800/90 bg-[#0a0f1c] p-3.5 space-y-1.5 transition hover:border-zinc-700"
                    >
                      <div className="flex items-center justify-between gap-2 text-[11px] text-zinc-400">
                        <span className="truncate font-semibold text-amber-300/90">
                          {src.domain}
                        </span>
                        <span className="inline-flex shrink-0 items-center gap-1">
                          <Clock size={11} />
                          {src.readTime}
                        </span>
                      </div>
                      <h3 className="text-xs sm:text-sm font-bold text-white leading-snug">
                        {src.title}
                      </h3>
                      <p className="text-xs leading-relaxed text-zinc-400">
                        {src.snippet}
                      </p>
                      <div className="pt-1 flex items-center justify-between text-[11px] text-zinc-500">
                        <span>{src.tag}</span>
                        {src.url ? (
                          <a
                            href={src.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-0.5 text-amber-300 hover:underline"
                          >
                            <span>Open</span>
                            <ArrowUpRight size={12} />
                          </a>
                        ) : (
                          <span className="inline-flex items-center gap-0.5 text-zinc-400">
                            <span>NovaAI</span>
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Searches */}
              <div className="rounded-3xl border border-zinc-800/90 bg-[#070b14] p-5 space-y-2.5">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-zinc-300">
                  <Layers size={13} className="text-amber-400" />
                  <span>Recent Queries</span>
                </div>
                <div className="space-y-1.5">
                  {recentQueries.map((item: string, idx: number) => (
                    <button
                      key={`${item}-${idx}`}
                      type="button"
                      onClick={() => executeSearch(item)}
                      className="block w-full truncate rounded-xl border border-zinc-800/80 bg-[#0a0f1c] px-3 py-2 text-left text-xs text-zinc-300 hover:border-amber-400/40 hover:text-white"
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>
            </aside>
          </section>
        ) : (
          /* Default Discovery Cards When Idle */
          <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-zinc-800/90 bg-[#070b14] p-5 space-y-1.5">
              <FileCode2 size={18} className="text-amber-400" />
              <h3 className="text-sm font-bold text-white">Scoped Discovery</h3>
              <p className="text-xs text-zinc-400">
                Filter results across Deep Web, Docs & Specs, Code & Systems, ya Benchmarks.
              </p>
            </div>
            <div className="rounded-2xl border border-zinc-800/90 bg-[#070b14] p-5 space-y-1.5">
              <Sparkles size={18} className="text-amber-400" />
              <h3 className="text-sm font-bold text-white">Step-by-Step Synthesis</h3>
              <p className="text-xs text-zinc-400">
                See how the query is broken down and turned into structured takeaways.
              </p>
            </div>
            <div className="rounded-2xl border border-zinc-800/90 bg-[#070b14] p-5 space-y-1.5">
              <Globe size={18} className="text-amber-400" />
              <h3 className="text-sm font-bold text-white">Source Cards</h3>
              <p className="text-xs text-zinc-400">
                Scan key domains, reading time, and concise snippets side-by-side.
              </p>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
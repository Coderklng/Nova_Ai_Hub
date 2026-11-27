"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
  Terminal,
  KeyRound,
  Webhook,
  Cpu,
  Play,
  Square,
  Copy,
  Check,
  ArrowUpRight,
  Layers,
} from "lucide-react";

type SdkTabId = "ts" | "node" | "curl";

interface SdkSnippet {
  id: SdkTabId;
  label: string;
  fileName: string;
  code: string;
}

interface DevCapability {
  title: string;
  tag: string;
  desc: string;
  points: string[];
}

interface ParsedSseResult {
  deltaText: string;
  finalContent?: string;
}

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
      if (parsed?.status === "done") return { deltaText: "" };

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
          return { deltaText: "", finalContent: textPiece };
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
      if (typeof unquoted === "string") return { deltaText: unquoted };
    } catch {
      return { deltaText: "" };
    }
  }

  if (/^(event:|data:)/i.test(line) || line.startsWith("{") || line.startsWith("}")) {
    return { deltaText: "" };
  }

  return { deltaText: line };
}

const SDK_SNIPPETS: SdkSnippet[] = [
  {
    id: "ts",
    label: "Next.js / TS",
    fileName: "streamClient.ts",
    code: `export async function streamNovaAgent(
  prompt: string,
  sessionId: string,
  onToken: (chunk: string) => void
) {
  const res = await fetch(
    "https://nova-agent-13bm.onrender.com/api/v1/agents/stream",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": "YOUR_NOVA_API_KEY",
        Authorization: "Bearer YOUR_NOVA_API_KEY",
      },
      body: JSON.stringify({
        prompt,
        session_id: sessionId,
        mode: "agent",
      }),
    }
  );

  if (!res.ok || !res.body) throw new Error("Stream failed");

  const reader = res.body.getReader();
  const decoder = new TextDecoder();

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    onToken(decoder.decode(value, { stream: true }));
  }
}`,
  },
  {
    id: "node",
    label: "Node / Express",
    fileName: "server.ts",
    code: `import express, { Request, Response } from "express";

const app = express();
app.use(express.json());

app.post("/api/nova-proxy", async (req: Request, res: Response) => {
  const upstream = await fetch(
    "https://nova-agent-13bm.onrender.com/api/v1/agents/stream",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": process.env.NOVA_API_KEY || "",
        Authorization: \`Bearer \${process.env.NOVA_API_KEY || ""}\`,
      },
      body: JSON.stringify({
        prompt: String(req.body?.prompt ?? ""),
        session_id: String(req.body?.session_id ?? "node-session"),
        mode: "agent",
      }),
    }
  );

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  const text = await upstream.text();
  res.write(\`data: \${JSON.stringify({ content: text })}\\n\\n\`);
  res.write("data: [DONE]\\n\\n");
  res.end();
});

app.listen(5000);`,
  },
  {
    id: "curl",
    label: "cURL",
    fileName: "request.sh",
    code: `curl -N -X POST https://nova-agent-13bm.onrender.com/api/v1/agents/stream \\
  -H "X-API-Key: YOUR_NOVA_API_KEY" \\
  -H "Authorization: Bearer YOUR_NOVA_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "prompt": "Summarize event-driven agent pipelines",
    "session_id": "cli-session-1",
    "mode": "agent"
  }'`,
  },
];

const DEV_CAPABILITIES: DevCapability[] = [
  {
    title: "Real-Time SSE & Token Streaming",
    tag: "Streaming",
    desc: "Low-latency chunked delivery ke saath live agent steps aur responses render karo.",
    points: [
      "Standard SSE event framing",
      "Abort & disconnect friendly",
      "Predictable client state updates",
    ],
  },
  {
    title: "Modular Agent & Tool Hooks",
    tag: "Orchestration",
    desc: "Apne workflows, custom tools aur structured payloads ko clean endpoints se jodo.",
    points: [
      "Role-based agent routing",
      "Step & tool trace events",
      "Clean JSON request/response schema",
    ],
  },
  {
    title: "Developer Keys & Environments",
    tag: "DX & Config",
    desc: "Local dev, staging aur production ke liye clean environment separation aur key management.",
    points: [
      "Scoped API key workflow",
      "Localhost to cloud ready",
      "Clear error & status codes",
    ],
  },
];

const SIMULATED_ENDPOINTS = [
  "POST /api/v1/agents/stream",
  "POST /v1/agents/run",
  "POST /v1/search/deep",
];

export default function ForDevelopersPage() {
  const [activeTab, setActiveTab] = useState<SdkTabId>("ts");
  const [endpoint, setEndpoint] = useState<string>(SIMULATED_ENDPOINTS[0]);
  const [payloadNote, setPayloadNote] = useState<string>(
    '{"agent":"builder","prompt":"Build responsive dark UI"}'
  );
  const [simulating, setSimulating] = useState<boolean>(false);
  const [consoleOut, setConsoleOut] = useState<string>("");
  const [copied, setCopied] = useState<boolean>(false);

  const abortRef = useRef<AbortController | null>(null);
  const sessionRef = useRef<string>("dev-sandbox-session");

  const currentSnippet =
    SDK_SNIPPETS.find((s) => s.id === activeTab) ?? SDK_SNIPPETS[0];

  useEffect(() => {
    sessionRef.current = `dev-sandbox-${Date.now()}`;
    return () => {
      abortRef.current?.abort();
    };
  }, []);

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(currentSnippet.code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard fallback ignored
    }
  };

  const handleStopSim = () => {
    abortRef.current?.abort();
    abortRef.current = null;
    setSimulating(false);
  };

  const handleRunSim = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (simulating) return;

    const cleanBody = payloadNote.trim() || '{"prompt":"Build responsive dark UI"}';
    let parsedPrompt = cleanBody;
    try {
      const obj = JSON.parse(cleanBody);
      if (typeof obj?.prompt === "string" && obj.prompt.trim()) {
        parsedPrompt = obj.prompt.trim();
      } else if (typeof obj?.message === "string" && obj.message.trim()) {
        parsedPrompt = obj.message.trim();
      }
    } catch {
      // Raw string prompt fallback
    }

    const controller = new AbortController();
    abortRef.current = controller;
    setSimulating(true);
    setConsoleOut(
      `> ${endpoint} -> ${BASE_URL}/api/v1/agents/stream\n> Payload: ${cleanBody}\n\nStreaming...\n`
    );

    let streamText = "";

    try {
      const res = await fetch(`${BASE_URL}/api/v1/agents/stream`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          prompt: `[Selected Route: ${endpoint}]\n${parsedPrompt}`,
          session_id: sessionRef.current,
          mode: "agent",
        }),
        signal: controller.signal,
      });

      if (!res.ok) {
        const errBody = await res.text().catch(() => "");
        throw new Error(`HTTP ${res.status}: ${errBody || res.statusText}`);
      }

      const appendChunk = (line: string, currentEvent: string) => {
        const parsed = parseSseLine(line, currentEvent);
        if (parsed.deltaText) {
          streamText += parsed.deltaText;
        } else if (parsed.finalContent && !streamText) {
          streamText = parsed.finalContent;
        }
        setConsoleOut(
          `> ${endpoint} -> ${BASE_URL}/api/v1/agents/stream\n> Payload: ${cleanBody}\n\n${streamText}`
        );
      };

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
            appendChunk(trimmed, currentEvent);
          }
        }

        if (buffer.trim()) {
          appendChunk(buffer.trim(), currentEvent);
        }
      } else {
        const fullText = await res.text();
        let currentEvent = "message";
        for (const rawLine of fullText.split(/\r?\n/)) {
          const trimmed = rawLine.trim();
          if (!trimmed) {
            currentEvent = "message";
            continue;
          }
          if (trimmed.startsWith("event:")) {
            currentEvent = trimmed.slice(6).trim();
            continue;
          }
          appendChunk(trimmed, currentEvent);
        }
      }

      if (!streamText.trim()) {
        setConsoleOut(
          `> ${endpoint} -> ${BASE_URL}/api/v1/agents/stream\n> Payload: ${cleanBody}\n\n[Stream completed with empty payload]`
        );
      }
    } catch (err: unknown) {
      if ((err as { name?: string })?.name === "AbortError") {
        setConsoleOut((prev) => `${prev}\n\n[Stopped by user]`);
      } else {
        const msg = err instanceof Error ? err.message : "Stream error";
        setConsoleOut(
          `> ${endpoint} -> ${BASE_URL}/api/v1/agents/stream\n> Payload: ${cleanBody}\n\nError: ${msg}`
        );
      }
    } finally {
      abortRef.current = null;
      setSimulating(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#05070d] text-white">
      <div className="mx-auto max-w-7xl px-4 py-7 sm:py-10 md:px-8 space-y-10">
        {/* Top Nav Strip */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900/80 px-3.5 py-2 text-xs font-semibold text-zinc-200 transition hover:border-amber-400/50 hover:text-white"
          >
            <span>←</span>
            <span>Home</span>
          </Link>

          <div className="flex items-center gap-2">
          
          </div>
        </div>

        {/* Hero Banner */}
        <section className="relative overflow-hidden rounded-3xl border border-zinc-800/80 bg-gradient-to-br from-[#0d0a07] via-[#070b14] to-[#081224] p-6 sm:p-10 shadow-2xl">
          <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-amber-500/15 blur-3xl" />
          <div className="pointer-events-none absolute -left-24 -bottom-24 h-72 w-72 rounded-full bg-blue-600/15 blur-3xl" />

          <div className="relative z-10 grid grid-cols-1 gap-8 lg:grid-cols-12 items-center">
            <div className="lg:col-span-8 space-y-3">
              <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-500/10 px-3.5 py-1 text-xs font-semibold text-amber-300">
                <Terminal size={13} />
                <span>NovaAI For Developers</span>
              </div>

              <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
                Integrate Agents & Streaming{" "}
                <span className="bg-gradient-to-r from-amber-300 via-amber-400 to-orange-500 bg-clip-text text-transparent">
                  in Minutes
                </span>
              </h1>

              <p className="max-w-2xl text-xs sm:text-base leading-relaxed text-zinc-300/90">
                Clean REST/SSE patterns, modular agent hooks, aur copy-ready
                snippets—taaki tu UI aur workflows jaldi ship kar sake.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <a
                  href="#quickstart"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 px-5 py-2.5 text-xs sm:text-sm font-bold text-zinc-950 shadow-lg shadow-amber-500/20 hover:brightness-110"
                >
                  <span>View Quickstart</span>
                  <ArrowUpRight size={15} />
                </a>
                <Link
                  href="/product"
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-zinc-700 bg-zinc-900/90 px-5 py-2.5 text-xs sm:text-sm font-semibold text-zinc-200 hover:border-zinc-500 hover:text-white"
                >
                  <span>Explore Modules</span>
                </Link>
              </div>
            </div>

            {/* Quick Dev Specs */}
            <div className="lg:col-span-4 rounded-2xl border border-zinc-800/90 bg-[#050811]/90 p-5 space-y-3 text-xs">
              <p className="text-[11px] font-bold uppercase tracking-wider text-amber-400">
                Developer Spec
              </p>
              <div className="flex items-center justify-between border-b border-zinc-800/80 pb-2">
                <span className="inline-flex items-center gap-1.5 text-zinc-400">
                  <Webhook size={13} className="text-amber-400" />
                  <span>Protocol</span>
                </span>
                <span className="font-mono text-white">HTTP + SSE</span>
              </div>
              <div className="flex items-center justify-between border-b border-zinc-800/80 pb-2">
                <span className="inline-flex items-center gap-1.5 text-zinc-400">
                  <KeyRound size={13} className="text-amber-400" />
                  <span>Auth</span>
                </span>
                <span className="font-mono text-white">X-API-Key + Bearer</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 text-zinc-400">
                  <Cpu size={13} className="text-amber-400" />
                  <span>Format</span>
                </span>
                <span className="font-mono text-emerald-400">JSON Chunks</span>
              </div>
            </div>
          </div>
        </section>

        {/* Capabilities Grid */}
        <section className="grid grid-cols-1 gap-5 md:grid-cols-3">
          {DEV_CAPABILITIES.map((cap: DevCapability) => (
            <div
              key={cap.title}
              className="flex flex-col justify-between rounded-2xl border border-zinc-800/90 bg-[#0a0f1c]/90 p-6 transition hover:border-amber-400/40"
            >
              <div>
                <span className="inline-block rounded-full border border-amber-400/25 bg-amber-500/10 px-3 py-0.5 text-[11px] font-bold text-amber-300">
                  {cap.tag}
                </span>
                <h2 className="mt-3 text-lg font-bold text-white">
                  {cap.title}
                </h2>
                <p className="mt-1.5 text-xs leading-relaxed text-zinc-400">
                  {cap.desc}
                </p>
              </div>

              <ul className="mt-5 space-y-2 border-t border-zinc-800/80 pt-4 text-xs text-zinc-200">
                {cap.points.map((pt: string) => (
                  <li key={pt} className="flex items-center gap-2">
                    <span className="font-bold text-amber-400">✓</span>
                    <span>{pt}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </section>

        {/* Quickstart Snippets + Live Agent Sandbox */}
        <section
          id="quickstart"
          className="grid grid-cols-1 gap-6 lg:grid-cols-12 items-start"
        >
          {/* Left: Code Snippets */}
          <div className="lg:col-span-7 rounded-3xl border border-zinc-800/90 bg-[#070b14] overflow-hidden shadow-2xl">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-800/80 bg-[#0a0f1c] px-4 py-3">
              <div className="flex items-center gap-1.5">
                {SDK_SNIPPETS.map((tab: SdkSnippet) => {
                  const active = tab.id === activeTab;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setActiveTab(tab.id)}
                      className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
                        active
                          ? "bg-amber-400 text-zinc-950 font-bold"
                          : "bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800"
                      }`}
                    >
                      {tab.label}
                    </button>
                  );
                })}
              </div>

              <button
                type="button"
                onClick={handleCopyCode}
                className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-xs font-medium text-zinc-300 hover:border-zinc-700 hover:text-white"
              >
                {copied ? (
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

            <div className="border-b border-zinc-800/60 bg-[#050811] px-4 py-2 font-mono text-[11px] text-zinc-400">
              {currentSnippet.fileName}
            </div>

            <pre className="overflow-x-auto bg-[#050811] p-4 sm:p-5 font-mono text-xs leading-6 text-zinc-100">
              <code>{currentSnippet.code}</code>
            </pre>
          </div>

          {/* Right: Live Agent Stream Runner */}
          <div className="lg:col-span-5 rounded-3xl border border-zinc-800/90 bg-[#070b14] p-5 sm:p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-400">
              <Layers size={14} />
              <span>Live Agent Stream Runner</span>
            </div>

            <form onSubmit={handleRunSim} className="space-y-3">
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-zinc-300">
                  Endpoint Context
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {SIMULATED_ENDPOINTS.map((ep: string) => (
                    <button
                      key={ep}
                      type="button"
                      onClick={() => setEndpoint(ep)}
                      className={`rounded-xl border px-2.5 py-1.5 font-mono text-[11px] transition ${
                        endpoint === ep
                          ? "border-amber-400 bg-amber-500/20 text-amber-200"
                          : "border-zinc-800 bg-[#050811] text-zinc-400 hover:text-zinc-200"
                      }`}
                    >
                      {ep}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-zinc-300">
                  JSON Payload
                </label>
                <textarea
                  rows={3}
                  value={payloadNote}
                  onChange={(e) => setPayloadNote(e.target.value)}
                  className="w-full rounded-xl border border-zinc-800 bg-[#050811] p-3 font-mono text-xs text-white focus:border-amber-400/60 focus:outline-none"
                />
              </div>

              {simulating ? (
                <button
                  type="button"
                  onClick={handleStopSim}
                  className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl border border-rose-500/40 bg-rose-500/20 px-4 py-2.5 text-xs sm:text-sm font-semibold text-rose-200 hover:bg-rose-500/30"
                >
                  <Square size={13} className="fill-current" />
                  <span>Stop Stream</span>
                </button>
              ) : (
                <button
                  type="submit"
                  className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 px-4 py-2.5 text-xs sm:text-sm font-bold text-zinc-950 shadow-lg shadow-amber-500/20 hover:brightness-110"
                >
                  <Play size={13} className="fill-current" />
                  <span>Run Live Stream</span>
                </button>
              )}
            </form>

            <pre className="min-h-[150px] max-h-[240px] overflow-y-auto rounded-2xl border border-zinc-800 bg-[#050811] p-4 font-mono text-xs leading-relaxed text-zinc-200 whitespace-pre-wrap">
              {consoleOut ||
                "Payload daal kar 'Run Live Stream' dabaa—NovaAI backend se live response yahan stream hoga."}
            </pre>
          </div>
        </section>
      </div>
    </div>
  );
}
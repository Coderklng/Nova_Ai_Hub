"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import Link from "next/link";

type NavSection =
  | "App Builder"
  | "AI Studio"
  | "Agent Builder"
  | "Flow Builder"
  | "Model Hub"
  | "MCP Tools"
  | "Database"
  | "Analytics"
  | "Deployments"
  | "Settings";

type DeviceMode = "Desktop" | "Tablet" | "Mobile";
type ConsoleTab = "Console" | "Build Output" | "Logs" | "Preview Output";
type RightTab = "Components" | "Properties";

interface ToolItem {
  id: string;
  title: string;
  desc: string;
  badge: string;
  prompt: string;
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

const SIDEBAR_ITEMS: NavSection[] = [
  "App Builder",
  "AI Studio",
  "Agent Builder",
  "Flow Builder",
  "Model Hub",
  "MCP Tools",
  "Database",
  "Analytics",
  "Deployments",
  "Settings",
];

const TOOLS_GRID: ToolItem[] = [
  {
    id: "chatbot",
    title: "AI Chatbot",
    desc: "Build intelligent chat assistant",
    badge: "Chat",
    prompt: "Add an AI business chat assistant section with quick prompts and streaming reply state.",
  },
  {
    id: "image-gen",
    title: "Image Gen",
    desc: "Generate stunning images",
    badge: "Media",
    prompt: "Add a visual showcase banner and prompt-driven preview card.",
  },
  {
    id: "code-builder",
    title: "Code Builder",
    desc: "Create & edit code with AI",
    badge: "Code",
    prompt: "Generate clean, modular React/TypeScript UI code for this app.",
  },
  {
    id: "database",
    title: "Database",
    desc: "Manage your data",
    badge: "DB",
    prompt: "Add structured local state and data cards for storing insights and records.",
  },
  {
    id: "api-connect",
    title: "API Connect",
    desc: "Connect external APIs",
    badge: "API",
    prompt: "Add an API request handler helper with loading and error states.",
  },
  {
    id: "analytics",
    title: "Analytics",
    desc: "Track usage & growth",
    badge: "Stats",
    prompt: "Add KPI metric cards for revenue growth, local tips, and active users.",
  },
  {
    id: "deploy",
    title: "Deploy",
    desc: "Publish your app",
    badge: "Ship",
    prompt: "Optimize the component for production build and clean responsive layout.",
  },
  {
    id: "agent-builder",
    title: "Agent Builder",
    desc: "Create AI agents",
    badge: "Agent",
    prompt: "Create a domain-specific advisor flow with actionable recommendations.",
  },
  {
    id: "workflow",
    title: "Workflow",
    desc: "Automate workflows",
    badge: "Flow",
    prompt: "Add step-by-step automated action cards for daily operations.",
  },
];

const BASIC_COMPONENTS = ["Text", "Card", "Button", "Container", "Image", "Icon", "Input", "Divider"];
const ADVANCED_COMPONENTS = ["AI Chat", "Video", "Chart", "Carousel", "Map", "Form", "Data Table", "Tabs"];
const LAYOUT_COMPONENTS = ["Section", "Grid", "Flex", "Spacer"];

const DEFAULT_PREVIEW_HTML = `<div style="font-family:system-ui,-apple-system,sans-serif;background:linear-gradient(180deg,#120e29 0%,#0b0d1b 55%,#090b16 100%);color:#f8fafc;min-height:100%;padding:16px;">
  <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px;">
    <div style="display:flex;align-items:center;gap:9px;">
      <div style="width:30px;height:30px;border-radius:9px;background:linear-gradient(135deg,#7c3aed,#4f46e5);display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:800;">N</div>
      <div>
        <div style="font-size:14px;font-weight:700;line-height:1.15;">Nova AI</div>
        <div style="font-size:10px;color:#94a3b8;">Your AI-Powered Companion</div>
      </div>
    </div>
    <div style="font-size:13px;color:#cbd5e1;padding:5px 8px;border-radius:7px;background:rgba(255,255,255,0.06);">☰</div>
  </div>

  <div style="border-radius:18px;padding:18px;background:radial-gradient(circle at 80% 25%,rgba(236,72,153,0.35),transparent 55%),linear-gradient(135deg,#2e1065,#1e1b4b);border:1px solid rgba(167,139,250,0.3);margin-bottom:14px;">
    <div style="font-size:21px;font-weight:800;line-height:1.2;color:#fff;">Jaipur<br/>Business Advisor</div>
    <div style="font-size:12px;color:#ddd6fe;margin-top:7px;">Get AI insights for your business</div>
    <button onclick="document.getElementById('advisor-tip').style.display='block'" style="margin-top:14px;background:linear-gradient(90deg,#7c3aed,#6366f1);color:#fff;border:none;border-radius:11px;padding:9px 16px;font-size:12px;font-weight:700;cursor:pointer;">Start Chat →</button>
    <div id="advisor-tip" style="display:none;margin-top:11px;padding:9px 11px;border-radius:10px;background:rgba(15,23,42,0.78);border:1px solid rgba(167,139,250,0.35);font-size:11px;color:#e9d5ff;">
      Tip: Peak footfall in local markets rises on evenings & weekends—highlight combo offers early.
    </div>
  </div>

  <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:7px;margin-bottom:16px;text-align:center;">
    <div style="background:#14182c;border:1px solid #242a48;border-radius:12px;padding:10px 5px;">
      <div style="font-size:14px;color:#818cf8;font-weight:700;">▮▮</div>
      <div style="font-size:10px;color:#e2e8f0;margin-top:5px;font-weight:600;line-height:1.25;">Business<br/>Insights</div>
    </div>
    <div style="background:#14182c;border:1px solid #242a48;border-radius:12px;padding:10px 5px;">
      <div style="font-size:14px;color:#facc15;font-weight:700;">✦</div>
      <div style="font-size:10px;color:#e2e8f0;margin-top:5px;font-weight:600;line-height:1.25;">Local<br/>Tips</div>
    </div>
    <div style="background:#14182c;border:1px solid #242a48;border-radius:12px;padding:10px 5px;">
      <div style="font-size:14px;color:#34d399;font-weight:700;">₹</div>
      <div style="font-size:10px;color:#e2e8f0;margin-top:5px;font-weight:600;line-height:1.25;">Revenue<br/>Growth</div>
    </div>
    <div style="background:#14182c;border:1px solid #242a48;border-radius:12px;padding:10px 5px;">
      <div style="font-size:14px;color:#f472b6;font-weight:700;">◎</div>
      <div style="font-size:10px;color:#e2e8f0;margin-top:5px;font-weight:600;line-height:1.25;">Jaipur<br/>Guide</div>
    </div>
  </div>

  <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:9px;">
    <span style="font-size:12px;font-weight:700;color:#f8fafc;">Popular Features</span>
    <span style="font-size:11px;color:#a78bfa;">See All →</span>
  </div>

  <div style="background:#14182c;border:1px solid #262d4d;border-radius:14px;padding:12px;display:flex;align-items:center;justify-content:space-between;gap:10px;">
    <div style="display:flex;align-items:center;gap:10px;">
      <div style="width:32px;height:32px;border-radius:10px;background:#312e81;color:#c4b5fd;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;">AI</div>
      <div>
        <div style="font-size:12px;font-weight:700;color:#fff;">AI Business Assistant</div>
        <div style="font-size:10px;color:#94a3b8;margin-top:2px;">Ask questions about business, marketing and growth...</div>
      </div>
    </div>
    <span style="color:#a78bfa;font-size:13px;">→</span>
  </div>
</div>`;

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

function extractHtmlOrCode(raw: string): string {
  const cleaned = raw.replace(/`\[model:[^\]]+\]`/gi, "").trim();
  const fenced = Array.from(
    cleaned.matchAll(/```(?:[a-zA-Z0-9_-]+)?\s*\n([\s\S]*?)```/g)
  );
  if (fenced.length > 0) {
    return fenced[fenced.length - 1][1].trim();
  }
  const openIdx = cleaned.search(/```(?:[a-zA-Z0-9_-]+)?\s*\n/);
  if (openIdx >= 0) {
    return cleaned.slice(openIdx).replace(/^```[^\n]*\n/, "").replace(/```[\s\S]*$/, "").trim();
  }
  return cleaned;
}

export default function NovaAppBuilderPlaygroundPage() {
  const [activeNav, setActiveNav] = useState<NavSection>("App Builder");
  const [vibeMode, setVibeMode] = useState<boolean>(true);
  const [prompt, setPrompt] = useState<string>(
    "Create a Jaipur Business Advisor app with AI chatbot, show local business tips, and revenue insights..."
  );
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [componentSearch, setComponentSearch] = useState<string>("");
  const [device, setDevice] = useState<DeviceMode>("Mobile");
  const [consoleTab, setConsoleTab] = useState<ConsoleTab>("Console");
  const [rightTab, setRightTab] = useState<RightTab>("Components");
  const [previewHtml, setPreviewHtml] = useState<string>(DEFAULT_PREVIEW_HTML);
  const [showCodeView, setShowCodeView] = useState<boolean>(false);
  const [running, setRunning] = useState<boolean>(false);
  const [consoleLines, setConsoleLines] = useState<string[]>([
    "[✓] App generated successfully in 12.4s",
    "[✓] Build completed with no errors",
    "[✓] Ready to deploy 🚀",
  ]);
  const [selectedElement, setSelectedElement] = useState<string>("Jaipur Business Advisor");
  const [accentHex, setAccentHex] = useState<string>("#7c3aed");

  const abortRef = useRef<AbortController | null>(null);
  const sessionRef = useRef<string>("nova-playground-session");

  useEffect(() => {
    sessionRef.current = `nova-playground-${Date.now()}`;
    return () => {
      abortRef.current?.abort();
    };
  }, []);

  const filteredBasic = useMemo(
    () =>
      BASIC_COMPONENTS.filter((c) =>
        c.toLowerCase().includes(componentSearch.trim().toLowerCase())
      ),
    [componentSearch]
  );

  const filteredAdvanced = useMemo(
    () =>
      ADVANCED_COMPONENTS.filter((c) =>
        c.toLowerCase().includes(componentSearch.trim().toLowerCase())
      ),
    [componentSearch]
  );

  const filteredLayout = useMemo(
    () =>
      LAYOUT_COMPONENTS.filter((c) =>
        c.toLowerCase().includes(componentSearch.trim().toLowerCase())
      ),
    [componentSearch]
  );

  const appendLog = (line: string) => {
    setConsoleLines((prev) => [...prev.slice(-30), line]);
  };

  const handleStopStream = () => {
    abortRef.current?.abort();
    abortRef.current = null;
    setRunning(false);
    appendLog("[!] Stream stopped by user");
  };

  const handleGenerate = async (customPrompt?: string) => {
    if (running) return;
    const textToSend = (customPrompt ?? prompt).trim();
    if (!textToSend) return;

    const controller = new AbortController();
    abortRef.current = controller;
    setRunning(true);
    setConsoleTab("Build Output");
    appendLog(`[>] Streaming request to NovaAI backend: "${textToSend.slice(0, 72)}"`);

    const agentPrompt = [
      `Active Section: ${activeNav}`,
      `Vibe Mode: ${vibeMode ? "ON (modern dark violet/amber UI)" : "Standard"}`,
      `User Request: ${textToSend}`,
      "Return clean HTML/CSS snippet inside a single ```html code block for a live sandbox preview.",
    ].join("\n");

    let accumulated = "";

    try {
      const res = await fetch(`${BASE_URL}/api/v1/agents/stream`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          prompt: agentPrompt,
          session_id: sessionRef.current,
          mode: "agent",
        }),
        signal: controller.signal,
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
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

          for (const raw of lines) {
            const trimmed = raw.trim();
            if (!trimmed) {
              currentEvent = "message";
              continue;
            }
            if (trimmed.startsWith("event:")) {
              currentEvent = trimmed.slice(6).trim();
              continue;
            }
            const parsed = parseSseLine(trimmed, currentEvent);
            if (parsed.deltaText) accumulated += parsed.deltaText;
            else if (parsed.finalContent && !accumulated) accumulated = parsed.finalContent;
          }
        }

        if (buffer.trim()) {
          const parsed = parseSseLine(buffer.trim(), currentEvent);
          if (parsed.deltaText) accumulated += parsed.deltaText;
          else if (parsed.finalContent && !accumulated) accumulated = parsed.finalContent;
        }
      } else {
        const rawText = await res.text();
        for (const ln of rawText.split(/\r?\n/)) {
          const parsed = parseSseLine(ln, "message");
          if (parsed.deltaText) accumulated += parsed.deltaText;
          else if (parsed.finalContent && !accumulated) accumulated = parsed.finalContent;
        }
      }

      const extracted = extractHtmlOrCode(accumulated);
      if (extracted) {
        if (/<[a-z][\s\S]*>/i.test(extracted)) {
          setPreviewHtml(extracted);
          appendLog("[✓] Live preview updated from NovaAI stream");
        } else {
          appendLog(`[i] NovaAI reply: ${extracted.slice(0, 180)}`);
        }
      } else {
        appendLog("[i] Stream finished with no code block");
      }
    } catch (err: unknown) {
      if ((err as { name?: string })?.name === "AbortError") {
        appendLog("[!] Generation aborted");
      } else {
        const msg = err instanceof Error ? err.message : "Backend error";
        appendLog(`[x] Backend stream notice (${msg}) — local preview active`);
      }
    } finally {
      abortRef.current = null;
      setRunning(false);
    }
  };

  const handleInsertComponent = (compName: string) => {
    setSelectedElement(compName);
    const snippet = `<div style="margin-top:10px;padding:10px;border-radius:12px;background:#161b33;border:1px solid ${accentHex}66;display:flex;justify-content:space-between;align-items:center;">
      <div>
        <div style="font-size:12px;font-weight:700;color:#fff;">${compName} Block</div>
        <div style="font-size:10px;color:#94a3b8;">Added via NovaAI Inspector</div>
      </div>
      <span style="font-size:10px;padding:3px 8px;border-radius:999px;background:${accentHex}29;color:#e9d5ff;">Active</span>
    </div>`;
    setPreviewHtml((prev) => `${prev}${snippet}`);
    appendLog(`[+] Inserted component: ${compName}`);
  };

  const frameWidthClass =
    device === "Mobile"
      ? "w-[348px] rounded-[36px] border-[5px] border-slate-700/90"
      : device === "Tablet"
      ? "w-[470px] rounded-[26px] border-[4px] border-slate-700/90"
      : "w-full max-w-[580px] rounded-[20px] border-[3px] border-slate-700/90";

  return (
    <div className="min-h-screen bg-[#070712] text-slate-100 flex flex-col">
      {/* Top Header */}
      <header className="h-12 border-b border-white/10 bg-[#0c0d1d]/95 px-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-5 min-w-0">
          <Link className="flex items-center gap-2 shrink-0" href="/">
            <span className="h-7 w-7 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-xs font-black text-white">
              ★
            </span>
            <div className="leading-tight">
              <div className="text-sm font-bold text-white">Nova AI</div>
              <div className="text-[10px] text-slate-400 hidden sm:block">Build. Create. Innovate.</div>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-1 text-xs">
            <button
              type="button"
              onClick={() => setShowCodeView(false)}
              className={`px-3 py-1.5 rounded-lg font-medium transition ${
                !showCodeView
                  ? "bg-violet-600 text-white shadow-sm shadow-violet-600/40"
                  : "text-slate-300 hover:bg-white/5"
              }`}
            >
              ▸ Playground
            </button>
            <button
              type="button"
              onClick={() => {
                setPreviewHtml(DEFAULT_PREVIEW_HTML);
                setShowCodeView(false);
                appendLog("[✓] Loaded Jaipur Business Advisor starter template");
              }}
              className="px-3 py-1.5 rounded-lg text-slate-300 hover:bg-white/5 transition"
            >
              Templates
            </button>
            <button
              type="button"
              onClick={() => setShowCodeView((v) => !v)}
              className={`px-3 py-1.5 rounded-lg transition ${
                showCodeView ? "bg-white/10 text-violet-300" : "text-slate-300 hover:bg-white/5"
              }`}
            >
              {showCodeView ? "Visual Preview" : "Code"}
            </button>
            <button
              type="button"
              onClick={() => handleGenerate("Generate deployment checklist and environment notes.")}
              className="px-3 py-1.5 rounded-lg text-slate-300 hover:bg-white/5 transition"
            >
              Deploy
            </button>
          </nav>
        </div>

        <div className="flex items-center gap-2.5">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search anything... Ctrl + K"
            className="hidden sm:block w-48 lg:w-56 rounded-lg border border-white/10 bg-[#13152b] px-3 py-1 text-xs text-slate-200 placeholder-slate-500 focus:border-violet-500/60 focus:outline-none"
          />
          <span className="relative h-7 w-7 rounded-full border border-white/10 bg-[#13152b] flex items-center justify-center text-xs text-slate-300">
            🔔
            <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-rose-500 text-[9px] font-bold text-white flex items-center justify-center">
              3
            </span>
          </span>
          <span className="h-7 w-7 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-600 text-xs font-bold text-white flex items-center justify-center">
            K
          </span>
        </div>
      </header>

      {/* Main 4-Column Workspace */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 min-h-[calc(100vh-3rem)]">
        {/* Left Navigation Sidebar */}
        <aside className="lg:col-span-2 border-b lg:border-b-0 lg:border-r border-white/10 bg-[#0b0c1b] p-2.5 flex flex-col justify-between gap-3">
          <div className="flex lg:flex-col gap-1 overflow-x-auto lg:overflow-visible">
            {SIDEBAR_ITEMS.map((item) => {
              const active = activeNav === item;
              return (
                <button
                  key={item}
                  type="button"
                  onClick={() => {
                    setActiveNav(item);
                    appendLog(`[i] Switched workspace view: ${item}`);
                  }}
                  className={`shrink-0 flex items-center gap-2 rounded-lg px-2.5 py-2 text-xs font-medium text-left transition ${
                    active
                      ? "bg-gradient-to-r from-violet-600/90 to-indigo-600/80 text-white shadow-sm"
                      : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
                  }`}
                >
                  <span className="text-[11px]">•</span>
                  <span className="truncate">{item}</span>
                </button>
              );
            })}
          </div>

          <div className="hidden lg:flex flex-col gap-2.5">
            <div className="rounded-xl border border-violet-500/30 bg-gradient-to-b from-violet-950/60 to-[#111329] p-3">
              <div className="text-xs font-bold text-white flex items-center gap-1.5">
                <span className="text-amber-300">♛</span>
                <span>Upgrade to Pro</span>
              </div>
              <p className="mt-1 text-[11px] leading-snug text-slate-400">
                Unlock premium models, more credits & advanced tools.
              </p>
              <button
                type="button"
                onClick={() => appendLog("[i] Pro workspace active on local session")}
                className="mt-2.5 w-full rounded-lg bg-gradient-to-r from-violet-600 to-purple-600 py-1.5 text-xs font-semibold text-white hover:brightness-110 transition"
              >
                Go Pro →
              </button>
            </div>

            <div className="rounded-xl border border-white/10 bg-[#101225] px-3 py-2 text-[11px]">
              <div className="flex items-center gap-1.5 font-medium text-slate-200">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                <span>Nova AI v2.0</span>
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">All systems online</div>
            </div>
          </div>
        </aside>

        {/* Center-Left Builder Panel */}
        <section className="lg:col-span-4 border-b lg:border-b-0 lg:border-r border-white/10 bg-[#0d0f22] p-3.5 space-y-3.5">
          <div className="rounded-2xl border border-white/10 bg-[#12152e] p-3.5 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="h-7 w-7 rounded-lg bg-violet-600/25 border border-violet-400/30 flex items-center justify-center text-xs text-violet-300">
                  ✦
                </span>
                <div>
                  <h1 className="text-sm font-bold text-white">Create Your AI App</h1>
                  <p className="text-[11px] text-slate-400">
                    Describe what you want to build or use our tools below.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setVibeMode((v) => !v)}
                className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-semibold border transition ${
                  vibeMode
                    ? "bg-amber-500/20 border-amber-400/40 text-amber-200"
                    : "bg-slate-800 border-slate-700 text-slate-400"
                }`}
              >
                ☀ Vibe Mode
              </button>
            </div>

            <div className="relative rounded-xl border border-violet-500/35 bg-[#0c0e20] p-2.5">
              <textarea
                rows={3}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe what you want to build..."
                className="w-full resize-none bg-transparent text-xs text-slate-100 placeholder-slate-500 focus:outline-none pr-10"
              />
              {running ? (
                <button
                  type="button"
                  onClick={handleStopStream}
                  className="absolute bottom-2.5 right-2.5 h-8 w-8 rounded-lg bg-rose-600 text-xs font-bold text-white flex items-center justify-center hover:bg-rose-500"
                  title="Stop"
                >
                  ■
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => handleGenerate()}
                  className="absolute bottom-2.5 right-2.5 h-8 w-8 rounded-lg bg-violet-600 text-xs font-bold text-white flex items-center justify-center hover:bg-violet-500"
                  title="Generate"
                >
                  ➤
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-[11px]">
              <button
                type="button"
                onClick={() => handleGenerate()}
                className="rounded-lg bg-violet-600/20 border border-violet-500/35 py-1.5 px-2 font-medium text-violet-200 hover:bg-violet-600/30 transition"
              >
                ✦ Generate
              </button>
              <button
                type="button"
                onClick={() => handleGenerate("Enhance visual hierarchy, gradients, and card spacing.")}
                className="rounded-lg bg-fuchsia-600/15 border border-fuchsia-500/30 py-1.5 px-2 font-medium text-fuchsia-200 hover:bg-fuchsia-600/25 transition"
              >
                ✎ Design
              </button>
              <button
                type="button"
                onClick={() => setShowCodeView((v) => !v)}
                className="rounded-lg bg-cyan-600/15 border border-cyan-500/30 py-1.5 px-2 font-medium text-cyan-200 hover:bg-cyan-600/25 transition"
              >
                {"</>"} Code
              </button>
              <button
                type="button"
                onClick={() => handleGenerate("Build full interactive app layout with clean state.")}
                className="rounded-lg bg-emerald-600/15 border border-emerald-500/30 py-1.5 px-2 font-medium text-emerald-200 hover:bg-emerald-600/25 transition"
              >
                ⚙ Build App
              </button>
            </div>
          </div>

          {/* All Tools Grid */}
          <div className="space-y-2">
            <div className="flex items-center justify-between px-0.5">
              <span className="text-xs font-bold text-slate-200">All Tools</span>
              <button
                type="button"
                onClick={() => setShowCodeView((v) => !v)}
                className="text-[11px] font-medium text-violet-400 hover:text-violet-300"
              >
                {showCodeView ? "Show Preview →" : "View All →"}
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {TOOLS_GRID.map((tool) => (
                <button
                  key={tool.id}
                  type="button"
                  onClick={() => {
                    setPrompt(tool.prompt);
                    handleGenerate(tool.prompt);
                  }}
                  className="text-left rounded-xl border border-white/10 bg-[#12152e] p-2.5 hover:border-violet-400/50 hover:bg-[#171b3a] transition"
                >
                  <div className="h-7 w-7 rounded-lg bg-violet-500/15 border border-violet-400/25 flex items-center justify-center text-[10px] font-bold text-violet-300 mb-2">
                    {tool.badge}
                  </div>
                  <div className="text-[11px] font-bold text-white leading-tight">
                    {tool.title}
                  </div>
                  <div className="text-[10px] text-slate-400 leading-snug mt-0.5 line-clamp-2">
                    {tool.desc}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Center Live Device Preview + Console */}
        <section className="lg:col-span-4 border-b lg:border-b-0 lg:border-r border-white/10 bg-[#090a18] flex flex-col justify-between">
          {/* Device Bar */}
          <div className="px-3 py-2 border-b border-white/10 flex items-center justify-between gap-2 bg-[#0d0f22]">
            <div className="flex items-center gap-1 rounded-lg bg-[#151833] p-0.5 border border-white/10 text-[11px]">
              {(["Desktop", "Tablet", "Mobile"] as DeviceMode[]).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setDevice(mode)}
                  className={`px-2 py-1 rounded-md transition ${
                    device === mode
                      ? "bg-violet-600 text-white font-semibold"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 text-[11px] text-slate-400">
              <span>100%</span>
              <button
                type="button"
                onClick={() => setShowCodeView((v) => !v)}
                className="rounded border border-white/10 bg-[#151833] px-1.5 py-0.5 text-slate-200 hover:border-violet-400/40"
                title="Toggle Source / Preview"
              >
                ⤢
              </button>
            </div>
          </div>

          {/* Live Stage */}
          <div className="flex-1 p-4 flex items-center justify-center bg-[radial-gradient(circle_at_center,rgba(124,58,237,0.16),transparent_68%)] min-h-[470px]">
            {showCodeView ? (
              <textarea
                value={previewHtml}
                onChange={(e) => setPreviewHtml(e.target.value)}
                spellCheck={false}
                className="h-[460px] w-full rounded-xl border border-white/10 bg-[#060711] p-3 font-mono text-[11px] leading-5 text-emerald-200 focus:outline-none"
              />
            ) : (
              <div className={`${frameWidthClass} overflow-hidden bg-[#090b16] shadow-2xl shadow-violet-950/50 transition-all`}>
                <iframe
                  title="NovaAI Live Device Preview"
                  sandbox="allow-scripts"
                  srcDoc={previewHtml}
                  className="h-[460px] w-full bg-[#090b16]"
                />
              </div>
            )}
          </div>

          {/* Bottom Console Drawer */}
          <div className="border-t border-white/10 bg-[#0b0d1e]">
            <div className="flex items-center gap-3 px-3 pt-1.5 border-b border-white/10 text-[11px]">
              {(["Console", "Build Output", "Logs", "Preview Output"] as ConsoleTab[]).map(
                (tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setConsoleTab(tab)}
                    className={`pb-1.5 border-b-2 transition ${
                      consoleTab === tab
                        ? "border-violet-500 text-white font-semibold"
                        : "border-transparent text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    {tab}
                  </button>
                )
              )}
            </div>

            <div className="h-24 overflow-y-auto px-3 py-2 font-mono text-[11px] leading-relaxed space-y-0.5">
              {consoleLines.map((line, idx) => (
                <div
                  key={`${idx}-${line.slice(0, 12)}`}
                  className={
                    line.startsWith("[x]")
                      ? "text-rose-400"
                      : line.startsWith("[>]")
                      ? "text-amber-300"
                      : "text-emerald-400"
                  }
                >
                  {line}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Right Components & Properties Panel */}
        <aside className="lg:col-span-2 bg-[#0c0e20] p-3 flex flex-col justify-between gap-3">
          <div className="space-y-3">
            <div className="grid grid-cols-2 rounded-lg bg-[#141730] p-0.5 border border-white/10 text-[11px]">
              <button
                type="button"
                onClick={() => setRightTab("Components")}
                className={`py-1 rounded-md font-medium transition ${
                  rightTab === "Components"
                    ? "bg-violet-600 text-white"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Components
              </button>
              <button
                type="button"
                onClick={() => setRightTab("Properties")}
                className={`py-1 rounded-md font-medium transition ${
                  rightTab === "Properties"
                    ? "bg-violet-600 text-white"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Properties
              </button>
            </div>

            {rightTab === "Components" ? (
              <div className="space-y-3">
                <input
                  type="text"
                  value={componentSearch}
                  onChange={(e) => setComponentSearch(e.target.value)}
                  placeholder="Search components..."
                  className="w-full rounded-lg border border-white/10 bg-[#12152d] px-2.5 py-1.5 text-[11px] text-slate-200 placeholder-slate-500 focus:border-violet-500/50 focus:outline-none"
                />

                <div className="space-y-1.5">
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                    Basic Components
                  </div>
                  <div className="grid grid-cols-2 gap-1.5">
                    {filteredBasic.map((comp) => (
                      <button
                        key={comp}
                        type="button"
                        onClick={() => handleInsertComponent(comp)}
                        className="rounded-lg border border-white/10 bg-[#13162f] px-2 py-1.5 text-[11px] text-slate-200 hover:border-violet-400/50 text-left truncate"
                      >
                        {comp}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                    Advanced Components
                  </div>
                  <div className="grid grid-cols-2 gap-1.5">
                    {filteredAdvanced.map((comp) => (
                      <button
                        key={comp}
                        type="button"
                        onClick={() => handleInsertComponent(comp)}
                        className="rounded-lg border border-white/10 bg-[#13162f] px-2 py-1.5 text-[11px] text-slate-200 hover:border-violet-400/50 text-left truncate"
                      >
                        {comp}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                    Layout
                  </div>
                  <div className="grid grid-cols-2 gap-1.5">
                    {filteredLayout.map((comp) => (
                      <button
                        key={comp}
                        type="button"
                        onClick={() => handleInsertComponent(comp)}
                        className="rounded-lg border border-white/10 bg-[#13162f] px-2 py-1.5 text-[11px] text-slate-200 hover:border-violet-400/50 text-left truncate"
                      >
                        {comp}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-2.5 text-[11px]">
                <div>
                  <label className="block text-slate-400 mb-1">Selected Block</label>
                  <input
                    type="text"
                    value={selectedElement}
                    onChange={(e) => setSelectedElement(e.target.value)}
                    className="w-full rounded-lg border border-white/10 bg-[#12152d] px-2.5 py-1.5 text-slate-100 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Accent Color</label>
                  <input
                    type="color"
                    value={accentHex}
                    onChange={(e) => setAccentHex(e.target.value)}
                    className="h-8 w-full rounded-lg border border-white/10 bg-[#12152d] p-1 cursor-pointer"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-1.5 pt-2 border-t border-white/10">
            <button
              type="button"
              onClick={() => appendLog(`[✓] Saved project "${selectedElement}"`)}
              className="rounded-lg border border-white/15 bg-[#151833] py-2 text-[11px] font-semibold text-slate-200 hover:bg-white/10 transition"
            >
              Save Project
            </button>
            <button
              type="button"
              onClick={() => handleGenerate("Prepare production deploy summary for this app.")}
              className="rounded-lg bg-gradient-to-r from-violet-600 to-purple-600 py-2 text-[11px] font-semibold text-white hover:brightness-110 transition"
            >
              Deploy App
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}
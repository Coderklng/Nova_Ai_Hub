"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import Link from "next/link";

type StudioNav =
  | "Studio Home"
  | "Text Tools"
  | "Image Tools"
  | "Audio Tools"
  | "Video Tools"
  | "Document Tools"
  | "Code & Data"
  | "Creative Suite"
  | "Advanced Tools"
  | "History";

type ModalityTab = "Text" | "Image" | "Audio" | "Video" | "More";
type StageTab = "Preview" | "Compare" | "History";
type OutputCategory = "Image" | "Video" | "Audio" | "Others";

interface CreationItem {
  id: string;
  title: string;
  modality: ModalityTab;
  model: string;
  timeAgo: string;
  prompt: string;
  assetEndpoint: string | null;
  imageUrl: string;
  fallbackUrl: string;
  textOutput: string;
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

const STUDIO_NAV_ITEMS: StudioNav[] = [
  "Studio Home",
  "Text Tools",
  "Image Tools",
  "Audio Tools",
  "Video Tools",
  "Document Tools",
  "Code & Data",
  "Creative Suite",
  "Advanced Tools",
  "History",
];

const MODEL_OPTIONS = [
  { id: "flux-1-schnell", label: "Flux.1 Schnell", sub: "High Quality Image Generation" },
  { id: "nova-omni-v2", label: "Nova Omni v2.0", sub: "Multi-Modal Text, Code & Vision Agent" },
  { id: "cogvideo-studio", label: "CogVideo Studio", sub: "Cinematic Motion & Scene Synthesis" },
  { id: "nova-voice-pro", label: "Nova Voice Pro", sub: "Expressive Speech & Audio Studio" },
];

const SAMPLE_PROMPTS = [
  "Create a cinematic futuristic city with flying cars, cyberpunk vibes and neon lights, 4K quality.",
  "Design a Jaipur heritage night market scene with warm lanterns, architecture, and lively street detail.",
  "Write a crisp product launch brief and tagline set for an offline local AI studio.",
  "Generate a storyboard sequence for a 15-second AI coding playground promo reel.",
];

function makeCyberpunkSvgDataUrl(accentA = "#7c3aed", accentB = "#ec4899"): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 960 600">
    <defs>
      <linearGradient id="sky" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#140c2e"/>
        <stop offset="50%" stop-color="#2b1259"/>
        <stop offset="100%" stop-color="#0b132b"/>
      </linearGradient>
      <radialGradient id="moon" cx="42%" cy="28%" r="26%">
        <stop offset="0%" stop-color="#e9d5ff" stop-opacity="0.95"/>
        <stop offset="65%" stop-color="${accentA}" stop-opacity="0.45"/>
        <stop offset="100%" stop-color="#140c2e" stop-opacity="0"/>
      </radialGradient>
      <linearGradient id="neon" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="${accentB}"/>
        <stop offset="100%" stop-color="${accentA}"/>
      </linearGradient>
    </defs>
    <rect width="960" height="600" fill="url(#sky)"/>
    <circle cx="400" cy="165" r="185" fill="url(#moon)"/>
    <circle cx="400" cy="165" r="68" fill="#f3e8ff" opacity="0.85"/>
    <rect x="70" y="210" width="95" height="270" rx="6" fill="#0d1326" stroke="#3b2f63" stroke-width="1.5"/>
    <rect x="180" y="150" width="110" height="330" rx="6" fill="#101830" stroke="#6d28d9" stroke-width="1.5"/>
    <rect x="565" y="120" width="125" height="360" rx="6" fill="#11182f" stroke="#7c3aed" stroke-width="1.5"/>
    <rect x="705" y="185" width="105" height="295" rx="6" fill="#0e1428" stroke="#db2777" stroke-width="1.5"/>
    <rect x="595" y="215" width="68" height="44" rx="8" fill="#1e1b4b" stroke="#c084fc" stroke-width="2"/>
    <text x="629" y="242" text-anchor="middle" fill="#f5d0fe" font-family="system-ui,sans-serif" font-size="14" font-weight="800">Nova AI</text>
    <ellipse cx="265" cy="195" rx="34" ry="9" fill="#1e1b4b" stroke="#f472b6" stroke-width="2"/>
    <ellipse cx="755" cy="145" rx="38" ry="10" fill="#1e1b4b" stroke="#38bdf8" stroke-width="2"/>
    <path d="M0 475 Q480 445 960 475 L960 600 L0 600 Z" fill="#090c18"/>
    <ellipse cx="485" cy="492" rx="360" ry="26" fill="url(#neon)" opacity="0.28"/>
    <circle cx="485" cy="390" r="34" fill="#18182b" stroke="#a855f7" stroke-width="2"/>
    <path d="M442 520 Q485 415 528 520 Z" fill="#0f1021" stroke="#c084fc" stroke-width="2"/>
    <text x="485" y="476" text-anchor="middle" fill="#e879f9" font-family="system-ui,sans-serif" font-size="22" font-weight="800">夢</text>
  </svg>`;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

const INITIAL_CREATIONS: CreationItem[] = [
  {
    id: "futuristic-city",
    title: "Futuristic City",
    modality: "Image",
    model: "Flux.1 Schnell",
    timeAgo: "2 min ago",
    prompt: "Create a cinematic futuristic city with flying cars, cyberpunk vibes and neon lights, 4K quality.",
    assetEndpoint: null,
    imageUrl: makeCyberpunkSvgDataUrl("#7c3aed", "#ec4899"),
    fallbackUrl: makeCyberpunkSvgDataUrl("#7c3aed", "#ec4899"),
    textOutput: "Rendered cyberpunk skyline with aerial transit lanes, neon reflections, and 4K lighting balance.",
  },
  {
    id: "neon-harbor",
    title: "Neon Harbor",
    modality: "Image",
    model: "Flux.1 Schnell",
    timeAgo: "9 min ago",
    prompt: "Cyberpunk harbor at twilight with glowing reflections and towering spires.",
    assetEndpoint: null,
    imageUrl: makeCyberpunkSvgDataUrl("#4f46e5", "#06b6d4"),
    fallbackUrl: makeCyberpunkSvgDataUrl("#4f46e5", "#06b6d4"),
    textOutput: "Twilight harbor composition with layered depth and crisp horizon glow.",
  },
  {
    id: "sunset-ridge",
    title: "Amber Ridge",
    modality: "Image",
    model: "Nova Omni v2.0",
    timeAgo: "18 min ago",
    prompt: "Warm golden-violet horizon with dramatic clouds and clean contrast.",
    assetEndpoint: null,
    imageUrl: makeCyberpunkSvgDataUrl("#d97706", "#ec4899"),
    fallbackUrl: makeCyberpunkSvgDataUrl("#d97706", "#ec4899"),
    textOutput: "Warm dusk palette with high-contrast foreground silhouette.",
  },
  {
    id: "alpine-peak",
    title: "Frost Peaks",
    modality: "Image",
    model: "CogVideo Studio",
    timeAgo: "34 min ago",
    prompt: "High-altitude peaks under clear violet-blue twilight sky.",
    assetEndpoint: null,
    imageUrl: makeCyberpunkSvgDataUrl("#2563eb", "#a855f7"),
    fallbackUrl: makeCyberpunkSvgDataUrl("#2563eb", "#a855f7"),
    textOutput: "Crisp alpine ridgeline with clean atmospheric perspective.",
  },
  {
    id: "sky-citadel",
    title: "Sky Citadel",
    modality: "Image",
    model: "Flux.1 Schnell",
    timeAgo: "1 hr ago",
    prompt: "Futuristic tower cluster with glowing light beams at night.",
    assetEndpoint: null,
    imageUrl: makeCyberpunkSvgDataUrl("#9333ea", "#f43f5e"),
    fallbackUrl: makeCyberpunkSvgDataUrl("#9333ea", "#f43f5e"),
    textOutput: "Vertical architectural framing with focused neon highlights.",
  },
];

function getAuthHeaders(includeJson = true): Record<string, string> {
  const headers: Record<string, string> = {
    Accept: "application/json, text/event-stream, text/plain, */*",
  };
  if (includeJson) {
    headers["Content-Type"] = "application/json";
  }
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

function cleanAgentText(raw: string): string {
  return raw
    .replace(/`\[model:[^\]]+\]`/gi, "")
    .replace(/```(?:[a-zA-Z0-9_-]+)?\s*\n([\s\S]*?)```/g, "$1")
    .trim();
}

function resolveAssetEndpoint(rawText: string, baseUrl: string): string | null {
  const downloadMatch = rawText.match(
    /\/api\/v1\/agents\/download\/([a-zA-Z0-9._-]+)/i
  );
  if (downloadMatch?.[1] && downloadMatch[1].toLowerCase() !== "latest") {
    return `${baseUrl}/api/v1/agents/download/${downloadMatch[1]}`;
  }

  const assetFileMatch = rawText.match(
    /(?:generated_assets\/|\/generated_assets\/)([a-zA-Z0-9._-]+\.(?:webp|png|jpg|jpeg|gif|mp4|mp3|wav))/i
  );
  if (assetFileMatch?.[1]) {
    return `${baseUrl}/api/v1/agents/download/${assetFileMatch[1]}`;
  }

  if (/\/api\/v1\/agents\/download\/latest/i.test(rawText)) {
    return `${baseUrl}/api/v1/agents/download/latest?t=${Date.now()}`;
  }

  return null;
}

async function fetchAuthenticatedAssetBlob(
  endpoint: string
): Promise<{ blobUrl: string; blob: Blob; ext: string } | null> {
  try {
    const res = await fetch(endpoint, {
      method: "GET",
      headers: getAuthHeaders(false),
    });
    if (!res.ok) return null;
    const blob = await res.blob();
    if (!blob || blob.size === 0) return null;
    if (blob.type.includes("application/json")) return null;

    const blobUrl = URL.createObjectURL(blob);
    const ext = blob.type.includes("webp")
      ? "webp"
      : blob.type.includes("png")
      ? "png"
      : blob.type.includes("jpeg") || blob.type.includes("jpg")
      ? "jpg"
      : "bin";

    return { blobUrl, blob, ext };
  } catch {
    return null;
  }
}

export default function NovaMultiModalStudioPage() {
  const [activeNav, setActiveNav] = useState<StudioNav>("Studio Home");
  const [modality, setModality] = useState<ModalityTab>("Text");
  const [stageTab, setStageTab] = useState<StageTab>("Preview");
  const [outputCat, setOutputCat] = useState<OutputCategory>("Image");
  const [prompt, setPrompt] = useState<string>(SAMPLE_PROMPTS[0]);
  const [selectedModel, setSelectedModel] = useState<string>(MODEL_OPTIONS[0].id);
  const [steps, setSteps] = useState<number>(30);
  const [guidanceScale, setGuidanceScale] = useState<number>(7.5);
  const [resolution, setResolution] = useState<string>("1024 x 1024");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [creations, setCreations] = useState<CreationItem[]>(INITIAL_CREATIONS);
  const [activeId, setActiveId] = useState<string>(INITIAL_CREATIONS[0].id);
  const [running, setRunning] = useState<boolean>(false);
  const [statusMsg, setStatusMsg] = useState<string>("Ready");
  const [copiedNotice, setCopiedNotice] = useState<string>("");

  const abortRef = useRef<AbortController | null>(null);
  const sessionRef = useRef<string>("nova-studio-session");
  const blobUrlsRef = useRef<string[]>([]);

  useEffect(() => {
    sessionRef.current = `nova-studio-${Date.now()}`;
    return () => {
      abortRef.current?.abort();
      for (const u of blobUrlsRef.current) {
        URL.revokeObjectURL(u);
      }
    };
  }, []);

  const activeCreation = useMemo(
    () => creations.find((item) => item.id === activeId) ?? creations[0],
    [creations, activeId]
  );

  const currentModelMeta = useMemo(
    () => MODEL_OPTIONS.find((m) => m.id === selectedModel) ?? MODEL_OPTIONS[0],
    [selectedModel]
  );

  const notify = (msg: string) => {
    setCopiedNotice(msg);
    window.setTimeout(() => {
      setCopiedNotice((prev) => (prev === msg ? "" : prev));
    }, 1800);
  };

  const streamFromNovaAgent = async (agentPrompt: string): Promise<string> => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setRunning(true);
    setStatusMsg("Streaming...");

    let accumulated = "";

    try {
      const res = await fetch(`${BASE_URL}/api/v1/agents/stream`, {
        method: "POST",
        headers: getAuthHeaders(true),
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
        const fullText = await res.text();
        for (const ln of fullText.split(/\r?\n/)) {
          const parsed = parseSseLine(ln, "message");
          if (parsed.deltaText) accumulated += parsed.deltaText;
          else if (parsed.finalContent && !accumulated) accumulated = parsed.finalContent;
        }
      }

      setStatusMsg("Completed");
      return cleanAgentText(accumulated);
    } catch (err: unknown) {
      if ((err as { name?: string })?.name === "AbortError") {
        setStatusMsg("Stopped");
        return "";
      }
      const msg = err instanceof Error ? err.message : "Stream error";
      setStatusMsg(`Notice: ${msg}`);
      return "";
    } finally {
      abortRef.current = null;
      setRunning(false);
    }
  };

  const handleEnhancePrompt = async () => {
    if (running) return;
    const base = prompt.trim() || SAMPLE_PROMPTS[0];
    const reply = await streamFromNovaAgent(
      `Enhance this ${modality} prompt for ${currentModelMeta.label} (${resolution}, steps ${steps}, guidance ${guidanceScale}). Keep it vivid and concise. Return only the improved prompt:\n${base}`
    );
    if (reply) {
      setPrompt(reply.slice(0, 950));
      notify("Prompt enhanced");
    }
  };

  const handleRandomPrompt = () => {
    const idx = Math.floor(Math.random() * SAMPLE_PROMPTS.length);
    setPrompt(SAMPLE_PROMPTS[idx]);
    notify("Random prompt loaded");
  };

  const handleGenerate = async (overridePrompt?: string, extraInstruction?: string) => {
    if (running) return;
    const finalPrompt = (overridePrompt ?? prompt).trim() || SAMPLE_PROMPTS[0];
    const reply = await streamFromNovaAgent(
      [
        `Studio Section: ${activeNav}`,
        `Modality: ${modality}`,
        `Model: ${currentModelMeta.label}`,
        `Resolution: ${resolution} | Steps: ${steps} | Guidance: ${guidanceScale}`,
        extraInstruction ? `Action: ${extraInstruction}` : "",
        `Prompt: ${finalPrompt}`,
        "Provide a clear, helpful multi-modal creative response and actionable output summary.",
      ]
        .filter(Boolean)
        .join("\n")
    );

    const palettePairs: Array<[string, string]> = [
      ["#7c3aed", "#ec4899"],
      ["#6366f1", "#22d3ee"],
      ["#9333ea", "#f59e0b"],
      ["#2563eb", "#d946ef"],
    ];
    const pair = palettePairs[creations.length % palettePairs.length];
    const fallbackSvg = makeCyberpunkSvgDataUrl(pair[0], pair[1]);

    const endpoint =
      resolveAssetEndpoint(reply, BASE_URL) ||
      `${BASE_URL}/api/v1/agents/download/latest?t=${Date.now()}`;

    const fetched = await fetchAuthenticatedAssetBlob(endpoint);
    let finalImageUrl = fallbackSvg;
    if (fetched) {
      blobUrlsRef.current.push(fetched.blobUrl);
      finalImageUrl = fetched.blobUrl;
    }

    const shortTitle =
      finalPrompt
        .replace(/[^a-zA-Z0-9\s]/g, "")
        .trim()
        .split(/\s+/)
        .slice(0, 3)
        .join(" ") || "Nova Creation";

    const newItem: CreationItem = {
      id: `creation-${Date.now()}`,
      title: shortTitle,
      modality,
      model: currentModelMeta.label,
      timeAgo: "Just now",
      prompt: finalPrompt,
      assetEndpoint: endpoint,
      imageUrl: finalImageUrl,
      fallbackUrl: fallbackSvg,
      textOutput:
        reply ||
        `Generated ${modality} concept using ${currentModelMeta.label} at ${resolution}.`,
    };

    setCreations((prev) => [newItem, ...prev]);
    setActiveId(newItem.id);
  };

  const handleDownloadActive = async () => {
    const safeSlug = activeCreation.title.toLowerCase().replace(/\s+/g, "-") || "nova-asset";

    if (activeCreation.assetEndpoint) {
      const fetched = await fetchAuthenticatedAssetBlob(activeCreation.assetEndpoint);
      if (fetched) {
        const tempUrl = URL.createObjectURL(fetched.blob);
        const link = document.createElement("a");
        link.href = tempUrl;
        link.download = `${safeSlug}.${fetched.ext}`;
        link.click();
        window.setTimeout(() => URL.revokeObjectURL(tempUrl), 2000);
        notify("Asset downloaded");
        return;
      }
    }

    const link = document.createElement("a");
    link.href = activeCreation.imageUrl || activeCreation.fallbackUrl;
    link.download = `${safeSlug}.svg`;
    link.click();
    notify("Downloaded");
  };

  return (
    <div className="min-h-screen bg-[#070713] text-slate-100 flex flex-col">
      {/* Top Navbar */}
      <header className="h-12 border-b border-white/10 bg-[#0b0c1d]/95 px-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-5 min-w-0">
          <Link className="flex items-center gap-2 shrink-0" href="/">
            <span className="h-7 w-7 rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-600 flex items-center justify-center text-xs font-black text-white">
              ★
            </span>
            <div className="leading-tight">
              <div className="text-sm font-bold text-white">Nova AI</div>
              <div className="text-[10px] text-slate-400 hidden sm:block">Build. Create. Innovate.</div>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-1 text-xs">
            <Link
              href="/Product/code"
              className="px-3 py-1.5 rounded-lg text-slate-300 hover:bg-white/5 transition"
            >
              ▸ Playground
            </Link>
            <button
              type="button"
              onClick={() => setStageTab("Preview")}
              className="px-3 py-1.5 rounded-lg bg-violet-600 text-white font-semibold shadow-sm shadow-violet-600/40"
            >
              ✦ Multi Modal Studio
            </button>
            <button
              type="button"
              onClick={() => handleGenerate(prompt, "Build an autonomous agent workflow.")}
              className="px-3 py-1.5 rounded-lg text-slate-300 hover:bg-white/5 transition"
            >
              Agent Builder
            </button>
            <button
              type="button"
              onClick={() => setActiveNav("Code & Data")}
              className="px-3 py-1.5 rounded-lg text-slate-300 hover:bg-white/5 transition"
            >
              Model Hub
            </button>
            <button
              type="button"
              onClick={() => handleGenerate(prompt, "Prepare deployment package.")}
              className="px-3 py-1.5 rounded-lg text-slate-300 hover:bg-white/5 transition"
            >
              Deploy
            </button>
          </nav>
        </div>

        <div className="flex items-center gap-2.5">
          {copiedNotice && (
            <span className="rounded-md bg-violet-500/20 border border-violet-400/30 px-2 py-0.5 text-[11px] text-violet-200">
              {copiedNotice}
            </span>
          )}
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search anything... Ctrl + K"
            className="hidden sm:block w-48 lg:w-56 rounded-lg border border-white/10 bg-[#13152c] px-3 py-1 text-xs text-slate-200 placeholder-slate-500 focus:border-violet-500/60 focus:outline-none"
          />
          <span className="relative h-7 w-7 rounded-full border border-white/10 bg-[#13152c] flex items-center justify-center text-xs text-slate-300">
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

      {/* Body Grid */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 min-h-[calc(100vh-3rem)]">
        {/* Left Studio Sidebar */}
        <aside className="lg:col-span-2 border-b lg:border-b-0 lg:border-r border-white/10 bg-[#0b0c1c] p-2.5 flex flex-col justify-between gap-3">
          <div className="space-y-2.5">
            <div className="rounded-xl border border-violet-500/25 bg-gradient-to-br from-violet-950/60 to-[#11142d] p-2.5">
              <div className="text-xs font-bold text-white flex items-center gap-1.5">
                <span className="text-violet-300">✦</span>
                <span>Multi Modal Studio</span>
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">
                Text · Image · Audio · Video · All in One AI Studio
              </div>
            </div>

            <div className="flex lg:flex-col gap-1 overflow-x-auto lg:overflow-visible">
              {STUDIO_NAV_ITEMS.map((item) => {
                const active = activeNav === item;
                return (
                  <button
                    key={item}
                    type="button"
                    onClick={() => {
                      setActiveNav(item);
                      if (item === "History") setStageTab("History");
                    }}
                    className={`shrink-0 flex items-center gap-2 rounded-lg px-2.5 py-2 text-xs font-medium text-left transition ${
                      active
                        ? "bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-sm"
                        : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
                    }`}
                  >
                    <span className="text-[11px]">•</span>
                    <span className="truncate">{item}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="hidden lg:flex flex-col gap-2.5">
            <div className="rounded-xl border border-violet-500/30 bg-gradient-to-b from-violet-950/60 to-[#111329] p-3">
              <div className="text-xs font-bold text-white flex items-center gap-1.5">
                <span className="text-amber-300">♛</span>
                <span>Go Pro</span>
              </div>
              <p className="mt-1 text-[11px] leading-snug text-slate-400">
                Unlock the full power of Multi Modal AI
              </p>
              <button
                type="button"
                onClick={() => notify("Pro Studio active")}
                className="mt-2.5 w-full rounded-lg bg-gradient-to-r from-violet-600 to-purple-600 py-1.5 text-xs font-semibold text-white hover:brightness-110 transition"
              >
                Upgrade Now →
              </button>
            </div>

            <div className="rounded-xl border border-emerald-500/20 bg-[#0d1520] px-3 py-2 text-[11px] text-emerald-300 flex items-center justify-between">
              <span className="flex items-center gap-1.5 font-medium">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                <span>All Systems Online</span>
              </span>
              <span className="font-mono text-[10px] text-slate-400">{statusMsg}</span>
            </div>
          </div>
        </aside>

        {/* Main Studio Content */}
        <main className="lg:col-span-10 p-3.5 space-y-3.5 bg-[#080917]">
          {/* Hero Banner */}
          <section className="rounded-2xl border border-violet-500/25 bg-[radial-gradient(circle_at_20%_30%,rgba(139,92,246,0.28),transparent_50%),radial-gradient(circle_at_75%_40%,rgba(236,72,153,0.18),transparent_55%),linear-gradient(120deg,#0f1128,#14102e)] p-4 flex flex-col xl:flex-row xl:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 shrink-0 rounded-2xl border border-violet-400/35 bg-gradient-to-br from-violet-600/35 to-fuchsia-600/25 flex items-center justify-center text-2xl font-black text-white shadow-lg shadow-violet-950/60">
                ❖
              </div>
              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                    Multi Modal Studio
                  </h1>
                  <span className="rounded-full bg-violet-600/35 border border-violet-400/35 px-2.5 py-0.5 text-[10px] font-semibold text-violet-200">
                    v2.0 AI
                  </span>
                </div>
                <p className="text-xs text-slate-300">
                  Create, Edit and Transform with the Power of AI — Text, Image, Audio, Video and More!
                </p>
                <div className="flex flex-wrap items-center gap-1.5 pt-0.5 text-[11px]">
                  {(["Text", "Image", "Audio", "Video"] as ModalityTab[]).map((tab) => (
                    <button
                      key={tab}
                      type="button"
                      onClick={() => setModality(tab)}
                      className={`rounded-lg border px-2.5 py-0.5 transition ${
                        modality === tab
                          ? "border-violet-400/60 bg-violet-600/30 text-white font-semibold"
                          : "border-white/10 bg-white/5 text-slate-300 hover:bg-white/10"
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => handleGenerate(prompt, "Draft a structured document.")}
                    className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-0.5 text-slate-300 hover:bg-white/10 transition"
                  >
                    Document
                  </button>
                  <button
                    type="button"
                    onClick={() => handleGenerate(prompt, "Generate clean code implementation.")}
                    className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-0.5 text-slate-300 hover:bg-white/10 transition"
                  >
                    Code
                  </button>
                </div>
              </div>
            </div>

            <div className="shrink-0 rounded-xl border border-violet-400/25 bg-[#12142c]/90 px-4 py-3 flex sm:flex-col items-center sm:items-end justify-between gap-2">
              <div className="text-xs text-slate-200 font-semibold text-left sm:text-right">
                ⚡ Turn Ideas into Reality <span className="text-slate-400 font-normal">with AI Magic</span>
              </div>
              <button
                type="button"
                onClick={() => handleGenerate()}
                className="rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 px-4 py-1.5 text-xs font-bold text-white shadow-md shadow-violet-900/50 hover:brightness-110 transition"
              >
                Try Now →
              </button>
            </div>
          </section>

          {/* 3-Column Studio Workspace */}
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-3.5 items-start">
            {/* Left Prompt & Model Controls */}
            <section className="xl:col-span-4 rounded-2xl border border-white/10 bg-[#0d0f22] p-3.5 space-y-3">
              <div className="flex items-center gap-1 overflow-x-auto pb-1 border-b border-white/10 text-[11px]">
                {(["Text", "Image", "Audio", "Video", "More"] as ModalityTab[]).map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setModality(tab)}
                    className={`shrink-0 rounded-lg px-2.5 py-1 font-medium transition ${
                      modality === tab
                        ? "bg-violet-600 text-white font-semibold"
                        : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-violet-200">✦ Your Prompt</span>
                <button
                  type="button"
                  onClick={() => handleEnhancePrompt()}
                  className="rounded-md border border-amber-400/35 bg-amber-500/15 px-2 py-0.5 text-[11px] font-medium text-amber-200 hover:bg-amber-500/25"
                >
                  💡 Tips
                </button>
              </div>

              <textarea
                rows={4}
                maxLength={1000}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={(e) => {
                  if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
                    e.preventDefault();
                    handleGenerate();
                  }
                }}
                placeholder="Describe what you want to create..."
                className="w-full resize-none rounded-xl border border-violet-500/30 bg-[#0a0c1c] p-3 text-xs leading-relaxed text-slate-100 placeholder-slate-500 focus:border-violet-400 focus:outline-none"
              />

              <div className="flex flex-wrap items-center justify-between gap-2 text-[11px]">
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={handleEnhancePrompt}
                    disabled={running}
                    className="rounded-lg border border-white/10 bg-[#151833] px-2.5 py-1 text-slate-200 hover:border-violet-400/40 disabled:opacity-50"
                  >
                    Enhance Prompt ✨
                  </button>
                  <button
                    type="button"
                    onClick={handleRandomPrompt}
                    className="rounded-lg border border-white/10 bg-[#151833] px-2.5 py-1 text-slate-200 hover:border-violet-400/40"
                  >
                    Random Prompt 🎲
                  </button>
                </div>
                <span className="font-mono text-[10px] text-slate-400">
                  {prompt.length}/1000
                </span>
              </div>

              {/* Model Selector */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-semibold text-slate-200">Choose Model</span>
                  <span className="rounded bg-amber-500/20 border border-amber-400/30 px-1.5 py-0.5 text-[10px] font-semibold text-amber-200">
                    Recommended
                  </span>
                </div>
                <select
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-[#12152e] px-3 py-2 text-xs font-medium text-white focus:border-violet-500/50 focus:outline-none"
                >
                  {MODEL_OPTIONS.map((m) => (
                    <option key={m.id} value={m.id} className="bg-[#12152e] text-white">
                      {m.label} — {m.sub}
                    </option>
                  ))}
                </select>
              </div>

              {/* Settings Sliders */}
              <div className="rounded-xl border border-white/10 bg-[#101329] p-3 space-y-2.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-200">⚙ Settings</span>
                  <span className="text-[11px] text-violet-300">⚙ Advanced</span>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] text-slate-400">
                    <span>Steps</span>
                    <span className="font-mono text-white font-semibold">{steps}</span>
                  </div>
                  <input
                    type="range"
                    min={10}
                    max={60}
                    value={steps}
                    onChange={(e) => setSteps(Number(e.target.value))}
                    className="w-full accent-violet-500"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] text-slate-400">
                    <span>Guidance Scale</span>
                    <span className="font-mono text-white font-semibold">{guidanceScale}</span>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={15}
                    step={0.5}
                    value={guidanceScale}
                    onChange={(e) => setGuidanceScale(Number(e.target.value))}
                    className="w-full accent-violet-500"
                  />
                </div>

                <div className="flex items-center justify-between gap-2 pt-0.5">
                  <span className="text-[11px] text-slate-400">Resolution</span>
                  <select
                    value={resolution}
                    onChange={(e) => setResolution(e.target.value)}
                    className="rounded-lg border border-white/10 bg-[#171b38] px-2.5 py-1 text-[11px] font-medium text-white focus:outline-none"
                  >
                    <option value="1024 x 1024">1024 x 1024</option>
                    <option value="1280 x 720">1280 x 720</option>
                    <option value="1920 x 1080">1920 x 1080</option>
                  </select>
                </div>
              </div>

              {/* Generate CTA */}
              {running ? (
                <button
                  type="button"
                  onClick={() => {
                    abortRef.current?.abort();
                    setRunning(false);
                  }}
                  className="w-full rounded-xl bg-rose-600 py-2.5 text-xs font-bold text-white hover:bg-rose-500 transition"
                >
                  ■ Stop Streaming
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => handleGenerate()}
                  className="w-full rounded-xl bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 py-2.5 text-xs font-bold text-white shadow-lg shadow-violet-950/60 hover:brightness-110 transition flex items-center justify-center gap-2"
                >
                  <span>✦ Generate →</span>
                  <span className="rounded bg-white/15 px-1.5 py-0.5 font-mono text-[10px]">
                    Ctrl + Enter
                  </span>
                </button>
              )}
            </section>

            {/* Center Preview / Compare / History Stage */}
            <section className="xl:col-span-5 rounded-2xl border border-white/10 bg-[#0d0f22] p-3 space-y-2.5">
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-1 rounded-lg bg-[#141731] p-0.5 border border-white/10">
                  {(["Preview", "Compare", "History"] as StageTab[]).map((tab) => (
                    <button
                      key={tab}
                      type="button"
                      onClick={() => setStageTab(tab)}
                      className={`rounded-md px-2.5 py-1 text-[11px] font-medium transition ${
                        stageTab === tab
                          ? "bg-violet-600 text-white font-semibold"
                          : "text-slate-400 hover:text-white"
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-1.5 text-[11px]">
                  <button
                    type="button"
                    onClick={handleDownloadActive}
                    className="rounded-lg border border-white/10 bg-[#141731] px-2.5 py-1 text-slate-200 hover:border-violet-400/40"
                  >
                    ⬇ Download
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard?.writeText(activeCreation.textOutput).catch(() => {});
                      notify("Copied output");
                    }}
                    className="rounded-lg border border-white/10 bg-[#141731] px-2.5 py-1 text-slate-200 hover:border-violet-400/40"
                  >
                    ↗ Share
                  </button>
                </div>
              </div>

              {stageTab === "Preview" && (
                <div className="overflow-hidden rounded-xl border border-white/10 bg-[#080a16]">
                  <img
                    src={activeCreation.imageUrl}
                    alt={activeCreation.title}
                    onError={(e) => {
                      if (e.currentTarget.src !== activeCreation.fallbackUrl) {
                        e.currentTarget.src = activeCreation.fallbackUrl;
                      }
                    }}
                    className="h-[320px] w-full object-cover"
                  />
                  <div className="border-t border-white/10 bg-[#0b0e1f] px-3 py-2 text-[11px] text-slate-300 leading-relaxed max-h-28 overflow-y-auto whitespace-pre-wrap">
                    <span className="font-semibold text-violet-300 mr-1.5">
                      [{activeCreation.model}]
                    </span>
                    <span>{activeCreation.textOutput}</span>
                  </div>
                </div>
              )}

              {stageTab === "Compare" && (
                <div className="grid grid-cols-2 gap-2 rounded-xl border border-white/10 bg-[#080a16] p-2.5">
                  <div className="space-y-1">
                    <div className="text-[10px] font-semibold text-slate-400">Latest</div>
                    <img
                      src={activeCreation.imageUrl}
                      alt={activeCreation.title}
                      onError={(e) => {
                        if (e.currentTarget.src !== activeCreation.fallbackUrl) {
                          e.currentTarget.src = activeCreation.fallbackUrl;
                        }
                      }}
                      className="h-[250px] w-full rounded-lg object-cover"
                    />
                  </div>
                  <div className="space-y-1">
                    <div className="text-[10px] font-semibold text-slate-400">Previous</div>
                    <img
                      src={(creations[1] ?? activeCreation).imageUrl}
                      alt={(creations[1] ?? activeCreation).title}
                      onError={(e) => {
                        const fb = (creations[1] ?? activeCreation).fallbackUrl;
                        if (e.currentTarget.src !== fb) {
                          e.currentTarget.src = fb;
                        }
                      }}
                      className="h-[250px] w-full rounded-lg object-cover"
                    />
                  </div>
                </div>
              )}

              {stageTab === "History" && (
                <div className="h-[355px] overflow-y-auto rounded-xl border border-white/10 bg-[#080a16] p-3 space-y-2 text-xs">
                  {creations.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        setActiveId(item.id);
                        setStageTab("Preview");
                      }}
                      className="w-full text-left rounded-xl border border-white/10 bg-[#11142b] p-2.5 hover:border-violet-400/50 transition"
                    >
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-bold text-white">{item.title}</span>
                        <span className="text-slate-400">{item.timeAgo}</span>
                      </div>
                      <p className="mt-1 text-[11px] text-slate-400 line-clamp-2">{item.prompt}</p>
                    </button>
                  ))}
                </div>
              )}

              {/* Bottom Filmstrip */}
              <div className="flex items-center gap-2 overflow-x-auto pt-1">
                {creations.slice(0, 6).map((item) => {
                  const selected = item.id === activeCreation.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        setActiveId(item.id);
                        setStageTab("Preview");
                      }}
                      className={`h-12 w-16 shrink-0 overflow-hidden rounded-lg border-2 transition ${
                        selected
                          ? "border-violet-500 scale-[1.02]"
                          : "border-white/10 opacity-75 hover:opacity-100"
                      }`}
                    >
                      <img
                        src={item.imageUrl}
                        alt={item.title}
                        onError={(e) => {
                          if (e.currentTarget.src !== item.fallbackUrl) {
                            e.currentTarget.src = item.fallbackUrl;
                          }
                        }}
                        className="h-full w-full object-cover"
                      />
                    </button>
                  );
                })}
              </div>
            </section>

            {/* Right Output Options & Tools */}
            <aside className="xl:col-span-3 rounded-2xl border border-white/10 bg-[#0d0f22] p-3.5 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-bold text-white">Output Options</span>
                <button
                  type="button"
                  onClick={handleDownloadActive}
                  className="rounded-lg bg-gradient-to-r from-violet-600 to-purple-600 px-2.5 py-1 text-[11px] font-semibold text-white hover:brightness-110"
                >
                  ⬇ Export All
                </button>
              </div>

              <div className="grid grid-cols-4 gap-1 rounded-lg bg-[#141731] p-0.5 border border-white/10 text-[11px]">
                {(["Image", "Video", "Audio", "Others"] as OutputCategory[]).map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setOutputCat(cat)}
                    className={`rounded-md py-1 font-medium transition ${
                      outputCat === cat
                        ? "bg-violet-600 text-white font-semibold"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <button
                  type="button"
                  onClick={handleDownloadActive}
                  className="rounded-xl border border-white/10 bg-[#13162f] p-3 text-center hover:border-violet-400/50 transition"
                >
                  <div className="text-sm font-bold text-white">⬇ Download</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">WEBP / SVG</div>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard?.writeText(activeCreation.textOutput).catch(() => {});
                    notify("Copied");
                  }}
                  className="rounded-xl border border-white/10 bg-[#13162f] p-3 text-center hover:border-violet-400/50 transition"
                >
                  <div className="text-sm font-bold text-white">❐ Copy Output</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Text & Prompt</div>
                </button>
                <button
                  type="button"
                  onClick={() => handleGenerate(prompt, "Upscale details to 4K resolution.")}
                  className="rounded-xl border border-white/10 bg-[#13162f] p-3 text-center hover:border-violet-400/50 transition"
                >
                  <div className="text-sm font-bold text-white">⤢ Upscale (4K)</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Detail Boost</div>
                </button>
                <button
                  type="button"
                  onClick={() => handleGenerate(prompt, "Isolate main subject and clean background.")}
                  className="rounded-xl border border-white/10 bg-[#13162f] p-3 text-center hover:border-violet-400/50 transition"
                >
                  <div className="text-sm font-bold text-white">✂ Remove BG</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Clean Cutout</div>
                </button>
              </div>

              {/* Try More Tools */}
              <div className="space-y-2 pt-1">
                <div className="text-xs font-bold text-slate-200">✦ Try More Tools</div>
                <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                  {[
                    { label: "Text to Speech", task: "Write a voiceover script." },
                    { label: "Image to Video", task: "Create a motion shot list from this scene." },
                    { label: "Audio to Text", task: "Summarize key points cleanly." },
                    { label: "Text to Image", task: "Craft a crisp visual prompt." },
                    { label: "Video to GIF", task: "Design a short looping hook." },
                    { label: "AI Editor", task: "Refine and polish the current draft." },
                  ].map((tool) => (
                    <button
                      key={tool.label}
                      type="button"
                      onClick={() => handleGenerate(prompt, tool.task)}
                      className="rounded-lg border border-white/10 bg-[#12152e] px-2.5 py-2 text-left text-slate-200 hover:border-violet-400/45 transition truncate"
                    >
                      {tool.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Recent Creations */}
              <div className="space-y-1.5 pt-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-200">Recent Creations</span>
                  <button
                    type="button"
                    onClick={() => setStageTab("History")}
                    className="text-[11px] text-violet-400 hover:text-violet-300"
                  >
                    View All →
                  </button>
                </div>

                {creations.slice(0, 2).map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setActiveId(item.id);
                      setStageTab("Preview");
                    }}
                    className="w-full flex items-center justify-between gap-2 rounded-xl border border-white/10 bg-[#12152e] p-2 text-left hover:border-violet-400/40 transition"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <img
                        src={item.imageUrl}
                        alt={item.title}
                        onError={(e) => {
                          if (e.currentTarget.src !== item.fallbackUrl) {
                            e.currentTarget.src = item.fallbackUrl;
                          }
                        }}
                        className="h-9 w-9 shrink-0 rounded-lg object-cover"
                      />
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-white truncate">{item.title}</div>
                        <div className="text-[10px] text-slate-400">{item.timeAgo}</div>
                      </div>
                    </div>
                    <span className="text-xs text-slate-400">•••</span>
                  </button>
                ))}
              </div>
            </aside>
          </div>
        </main>
      </div>
    </div>
  );
}
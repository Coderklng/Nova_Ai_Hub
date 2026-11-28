"use client";

import React, { useState, useRef, useEffect } from "react";
import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  Plus,
  ArrowUp,
  Square,
  ChevronDown,
  ChevronRight,
  Cpu,
  PanelLeft,
  ArrowLeft,
  Trash2,
  Sparkles,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Copy,
  Check,
  X,
  Download,
  Maximize2,
  Image as ImageIcon,
  Video as VideoIcon,
} from "lucide-react";

type BackendMode = "chat" | "agent";

interface AgentMode {
  id: string;
  apiMode: BackendMode;
  label: string;
  role: string;
  prompt: string;
}

interface MediaAttachment {
  src: string;
  filename?: string;
  kind?: string;
  caption?: string;
  mediaType: "image" | "video";
}

interface MessageItem {
  id: string;
  sender: "user" | "agent";
  text: string;
  modeName?: string;
  modelName?: string;
  trace?: string[];
  image?: MediaAttachment;
  video?: MediaAttachment;
}

interface SessionItem {
  id: string;
  title: string;
  modeId: string;
  messages: MessageItem[];
}

interface AgentPageProps {
  onBackHome?: () => void;
}

interface SpeechRecognitionAlternativeLike {
  transcript: string;
}

interface SpeechRecognitionResultLike {
  0: SpeechRecognitionAlternativeLike;
}

interface SpeechRecognitionEventLike {
  results: ArrayLike<SpeechRecognitionResultLike>;
}

interface SpeechRecognitionLike {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
}

type SpeechRecognitionConstructor = new () => SpeechRecognitionLike;

const ACTIVE_MODEL = "NovaAI";
const BASE_URL = (
  process.env.NEXT_PUBLIC_AGENTIC_URL || "https://nova-agent-13bm.onrender.com"
).replace(/\/+$/, "");
const AGENT_API_KEY =
  process.env.NEXT_PUBLIC_NOVA_API_KEY || "sk_kartiksharma@2005";

const VIDEO_EXT_REGEX = /\.(mp4|webm|mov|mkv|avi|m4v)(\?.*)?$/i;
const IMAGE_EXT_REGEX = /\.(png|jpg|jpeg|webp|gif|svg)(\?.*)?$/i;
const DOWNLOAD_TOKEN_REGEX =
  /(\/api\/v1\/agents\/download\/[^\s`"'()<>]+|https?:\/\/[^\s`"'()<>]+\/api\/v1\/agents\/download\/[^\s`"'()<>]+|[\w./-]+\.(?:pptx|ppt|pdf|docx|doc|xlsx|xls|csv|zip|tar|gz|txt|json|mp4|webm|mov|mp3|wav))/gi;

function normalizeBackendMode(mode: string): BackendMode {
  return mode === "chat" ? "chat" : "agent";
}

function resolveHrefWithBase(href?: string): string | undefined {
  if (!href) return href;
  const trimmed = href.trim();
  if (
    !trimmed ||
    /^(https?:\/\/|mailto:|tel:|blob:|data:|#)/i.test(trimmed)
  ) {
    return trimmed;
  }
  return `${BASE_URL}${trimmed.startsWith("/") ? "" : "/"}${trimmed}`;
}

function getAuthHeaders(includeJsonContentType = true): Record<string, string> {
  const headers: Record<string, string> = {
    Accept:
      "application/json, text/event-stream, text/plain, image/*, video/*, */*",
  };
  if (includeJsonContentType) {
    headers["Content-Type"] = "application/json";
  }
  if (AGENT_API_KEY) {
    headers["X-API-Key"] = AGENT_API_KEY;
    headers["Authorization"] = `Bearer ${AGENT_API_KEY}`;
  }
  return headers;
}

async function triggerAuthenticatedDownload(
  rawUrl: string,
  suggestedName?: string
): Promise<void> {
  const resolvedUrl = resolveHrefWithBase(rawUrl);
  if (!resolvedUrl) return;

  const fallbackName =
    suggestedName ||
    resolvedUrl.split("/").pop()?.split("?")[0] ||
    "download-file";

  if (
    resolvedUrl.startsWith("blob:") ||
    resolvedUrl.startsWith("data:") ||
    (!resolvedUrl.includes("/api/v1/agents/download/") &&
      !resolvedUrl.startsWith(BASE_URL))
  ) {
    const link = document.createElement("a");
    link.href = resolvedUrl;
    link.download = fallbackName;
    link.rel = "noopener noreferrer";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    return;
  }

  const res = await fetch(resolvedUrl, {
    method: "GET",
    headers: getAuthHeaders(false),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => "");
    throw new Error(errText || `Download failed (${res.status})`);
  }

  const disposition = res.headers.get("content-disposition") || "";
  const headerNameMatch = disposition.match(/filename\*?=(?:UTF-8'')?["']?([^"';]+)["']?/i);
  const finalFilename = headerNameMatch?.[1]
    ? decodeURIComponent(headerNameMatch[1])
    : fallbackName;

  const blob = await res.blob();
  const blobUrl = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = blobUrl;
  link.download = finalFilename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(blobUrl), 2000);
}

function renderTextWithDownloadLinks(nodes: React.ReactNode): React.ReactNode {
  return React.Children.map(nodes, (node) => {
    if (typeof node === "string") {
      const parts = node.split(DOWNLOAD_TOKEN_REGEX);
      if (parts.length === 1) return node;

      return parts.map((part, idx) => {
        if (!part) return null;
        const isMatch =
          /^\/api\/v1\/agents\/download\//i.test(part) ||
          /^https?:\/\/.+\/api\/v1\/agents\/download\//i.test(part) ||
          /^[\w./-]+\.(?:pptx|ppt|pdf|docx|doc|xlsx|xls|csv|zip|tar|gz|txt|json|mp4|webm|mov|mp3|wav)$/i.test(
            part
          );

        if (!isMatch) return part;

        const cleanToken = part.replace(/[.,;:!?]+$/, "");
        const trailingPunct = part.slice(cleanToken.length);
        const fullUrl = resolveHrefWithBase(cleanToken);
        const fileLabel =
          cleanToken.split("/").pop()?.split("?")[0] || cleanToken;

        return (
          <React.Fragment key={idx}>
            <a
              href={fullUrl}
              target="_blank"
              rel="noopener noreferrer"
              download={fileLabel}
              onClick={(e) => {
                if (fullUrl) {
                  e.preventDefault();
                  void triggerAuthenticatedDownload(fullUrl, fileLabel);
                }
              }}
              className="inline-flex items-center gap-1 font-semibold text-sky-400 underline decoration-sky-400/50 underline-offset-2 hover:text-sky-300"
            >
              <span>Download {fileLabel}</span>
            </a>
            {trailingPunct}
          </React.Fragment>
        );
      });
    }

    if (React.isValidElement<{ children?: React.ReactNode }>(node)) {
      if (node.type === "a" || node.type === "code" || node.type === "pre") {
        return node;
      }
      if (node.props?.children) {
        return React.cloneElement(node, {
          children: renderTextWithDownloadLinks(node.props.children),
        });
      }
    }

    return node;
  });
}

function cleanTextForSpeech(raw: string): string {
  return raw
    .replace(/\[model:[^\]]+\]/gi, "")
    .replace(/```[\s\S]*?```/g, " Code snippet generated. ")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/[#>*_~|-]+/g, " ")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/\s+/g, " ")
    .trim();
}

function pickFemaleVoice(
  voices: SpeechSynthesisVoice[]
): SpeechSynthesisVoice | null {
  if (!voices.length) return null;

  const femaleNameRegex =
    /(female|woman|girl|zira|hazel|samantha|victoria|karen|moira|tessa|fiona|veena|lekha|priya|aditi|neerja|heera|swara|aria|jenny|sonia|natasha|google uk english female|microsoft zira|microsoft heera|microsoft neerja)/i;

  const indianFemale = voices.find(
    (v) => /hi-IN|en-IN/i.test(v.lang) && femaleNameRegex.test(v.name)
  );
  if (indianFemale) return indianFemale;

  const anyFemale = voices.find((v) => femaleNameRegex.test(v.name));
  if (anyFemale) return anyFemale;

  const indianVoice = voices.find((v) => /hi-IN|en-IN/i.test(v.lang));
  if (indianVoice) return indianVoice;

  return voices.find((v) => /en-US|en-GB/i.test(v.lang)) || voices[0];
}

function CodeBlackboard({
  language,
  codeText,
}: {
  language: string;
  codeText: string;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(codeText);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = codeText;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    }
  };

  return (
    <div className="my-3 overflow-hidden rounded-2xl border border-zinc-800 bg-[#0b0e17] shadow-xl">
      <div className="flex items-center justify-between border-b border-zinc-800/90 bg-zinc-900/90 px-3.5 py-2">
        <span className="font-mono text-[11px] font-semibold uppercase tracking-wider text-amber-300">
          {language || "code"}
        </span>
        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-700/80 bg-zinc-800/90 px-2.5 py-1 text-[11px] font-semibold text-zinc-200 transition hover:border-amber-400/50 hover:text-amber-300 active:scale-95"
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
      <pre className="max-w-full overflow-x-auto p-3.5 text-xs leading-relaxed text-zinc-100 [scrollbar-width:thin] [scrollbar-color:#3f3f46_transparent]">
        <code className="font-mono text-xs text-zinc-100">{codeText}</code>
      </pre>
    </div>
  );
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
      {renderTextWithDownloadLinks(children)}
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
  li: ({ children }) => (
    <li className="pl-0.5">{renderTextWithDownloadLinks(children)}</li>
  ),
  strong: ({ children }) => (
    <strong className="font-bold text-white">{children}</strong>
  ),
  a: ({ href, children }) => {
    const resolvedHref = resolveHrefWithBase(href);
    const isDownloadLink = Boolean(
      resolvedHref && resolvedHref.includes("/api/v1/agents/download/")
    );
    const fileLabel = resolvedHref?.split("/").pop()?.split("?")[0];

    return (
      <a
        href={resolvedHref}
        target="_blank"
        rel="noopener noreferrer"
        download={isDownloadLink ? "" : undefined}
        onClick={(e) => {
          if (isDownloadLink && resolvedHref) {
            e.preventDefault();
            void triggerAuthenticatedDownload(resolvedHref, fileLabel);
          }
        }}
        className="font-medium text-sky-400 underline decoration-sky-400/40 underline-offset-2 hover:text-sky-300"
      >
        {children}
      </a>
    );
  },
  blockquote: ({ children }) => (
    <blockquote className="my-2.5 rounded-r-xl border-l-2 border-amber-400 bg-zinc-900/70 px-3.5 py-2 text-xs text-zinc-300 sm:text-sm">
      {renderTextWithDownloadLinks(children)}
    </blockquote>
  ),
  pre: ({ children }) => <>{children}</>,
  code: ({ className, children }) => {
    const rawCode = String(children ?? "").replace(/\n$/, "");
    const match = /language-([\w-]+)/.exec(className || "");
    const isBlock = Boolean(match) || rawCode.includes("\n");

    if (isBlock) {
      return (
        <CodeBlackboard language={match?.[1] || "code"} codeText={rawCode} />
      );
    }

    if (
      /^\/api\/v1\/agents\/download\//i.test(rawCode) ||
      /^https?:\/\/.+\/api\/v1\/agents\/download\//i.test(rawCode)
    ) {
      const fullUrl = resolveHrefWithBase(rawCode);
      const fileLabel = rawCode.split("/").pop()?.split("?")[0] || rawCode;
      return (
        <a
          href={fullUrl}
          target="_blank"
          rel="noopener noreferrer"
          download={fileLabel}
          onClick={(e) => {
            if (fullUrl) {
              e.preventDefault();
              void triggerAuthenticatedDownload(fullUrl, fileLabel);
            }
          }}
          className="inline-flex items-center gap-1 rounded-md border border-sky-500/40 bg-sky-500/10 px-2 py-0.5 font-mono text-[11px] font-semibold text-sky-300 underline underline-offset-2 hover:bg-sky-500/20 sm:text-xs"
        >
          <span>Download {fileLabel}</span>
        </a>
      );
    }

    return (
      <code className="rounded-md border border-zinc-800 bg-zinc-900 px-1.5 py-0.5 font-mono text-[11px] text-amber-300 sm:text-xs">
        {children}
      </code>
    );
  },
  table: ({ children }) => (
    <div className="my-3 overflow-x-auto rounded-xl border border-zinc-800">
      <table className="w-full border-collapse text-left text-xs text-zinc-200">
        {children}
      </table>
    </div>
  ),
  thead: ({ children }) => (
    <thead className="border-b border-zinc-800 bg-zinc-900 text-amber-300">
      {children}
    </thead>
  ),
  th: ({ children }) => (
    <th className="px-3 py-2 font-semibold">{children}</th>
  ),
  td: ({ children }) => (
    <td className="border-t border-zinc-800/80 px-3 py-2">
      {renderTextWithDownloadLinks(children)}
    </td>
  ),
};

const AGENT_MODES: AgentMode[] = [
  {
    id: "research",
    apiMode: "agent",
    label: "Researcher",
    role: "Deep synthesis & trade-offs",
    prompt: "Compare multi-agent graphs vs single-agent tool loops cleanly.",
  },
  {
    id: "agent",
    apiMode: "agent",
    label: "App Builder",
    role: "UI architecture & components",
    prompt: "How should I structure a clean chat layout in Next.js?",
  },
  {
    id: "planner",
    apiMode: "agent",
    label: "Planner",
    role: "Execution steps & milestones",
    prompt: "Give me a crisp 4-step plan to polish the client UI before backend.",
  },
  {
    id: "chat",
    apiMode: "chat",
    label: "Chat",
    role: "Fast direct conversation",
    prompt: "What causes TypeScript or render bugs in client chat UIs?",
  },
];

const INITIAL_SESSIONS: SessionItem[] = [
  {
    id: "sess-1",
    title: "NovaAI Workspace",
    modeId: "agent",
    messages: [],
  },
];

function buildDownloadUrl(filename?: string, kind?: string): string {
  if (filename && filename.trim()) {
    const cleanName = filename.trim().replace(/^\/+/, "");
    const url = new URL(
      `${BASE_URL}/api/v1/agents/download/${encodeURIComponent(cleanName)}`
    );
    if (kind) url.searchParams.set("kind", kind);
    return url.toString();
  }
  const url = new URL(`${BASE_URL}/api/v1/agents/download/latest`);
  if (kind) url.searchParams.set("kind", kind);
  return url.toString();
}

function detectMediaType(
  candidate: string,
  kind?: string,
  contentType?: string
): "image" | "video" {
  if (
    kind?.toLowerCase().includes("video") ||
    contentType?.startsWith("video/") ||
    VIDEO_EXT_REGEX.test(candidate)
  ) {
    return "video";
  }
  return "image";
}

async function resolveAssetMedia(
  candidate: string,
  kind = "image"
): Promise<MediaAttachment | null> {
  const trimmed = candidate.trim();
  if (!trimmed) return null;

  const inferredType = detectMediaType(trimmed, kind);

  if (
    trimmed.startsWith("data:image/") ||
    trimmed.startsWith("data:video/") ||
    trimmed.startsWith("blob:") ||
    (/^https?:\/\//i.test(trimmed) &&
      (IMAGE_EXT_REGEX.test(trimmed) || VIDEO_EXT_REGEX.test(trimmed)))
  ) {
    const fallbackName =
      inferredType === "video" ? "generated-video.mp4" : "generated-image.png";
    return {
      src: trimmed,
      filename: trimmed.split("/").pop()?.split("?")[0] || fallbackName,
      kind,
      caption:
        inferredType === "video" ? "Generated Video" : "Generated Image",
      mediaType: inferredType,
    };
  }

  let downloadEndpoint = buildDownloadUrl(undefined, kind);
  let resolvedFilename =
    inferredType === "video" ? "latest-asset.mp4" : "latest-asset.png";

  if (trimmed === "latest" || trimmed === "/api/v1/agents/download/latest") {
    downloadEndpoint = buildDownloadUrl(undefined, kind);
  } else if (trimmed.includes("/api/v1/agents/download/")) {
    downloadEndpoint = trimmed.startsWith("http")
      ? trimmed
      : `${BASE_URL}${trimmed.startsWith("/") ? "" : "/"}${trimmed}`;
    resolvedFilename =
      downloadEndpoint.split("/").pop()?.split("?")[0] || resolvedFilename;
  } else if (!trimmed.includes(" ") && trimmed.length < 180) {
    resolvedFilename = trimmed.replace(/^\/+/, "");
    downloadEndpoint = buildDownloadUrl(resolvedFilename, kind);
  } else {
    return null;
  }

  const res = await fetch(downloadEndpoint, {
    method: "GET",
    headers: getAuthHeaders(false),
  });
  if (!res.ok) return null;

  const contentType = res.headers.get("content-type") || "";
  const finalMediaType = detectMediaType(resolvedFilename, kind, contentType);

  if (
    contentType.startsWith("image/") ||
    contentType.startsWith("video/") ||
    contentType === "application/octet-stream"
  ) {
    const blob = await res.blob();
    const objectUrl = URL.createObjectURL(blob);
    return {
      src: objectUrl,
      filename: resolvedFilename,
      kind,
      caption: resolvedFilename,
      mediaType: finalMediaType,
    };
  }

  if (contentType.includes("application/json")) {
    const data = await res.json();
    const urlFromJson =
      data?.url ||
      data?.video_url ||
      data?.image_url ||
      data?.download_url ||
      data?.file_url;

    if (typeof urlFromJson === "string" && urlFromJson) {
      const fullUrl = urlFromJson.startsWith("http")
        ? urlFromJson
        : `${BASE_URL}${urlFromJson.startsWith("/") ? "" : "/"}${urlFromJson}`;
      const jsonType = detectMediaType(
        data?.filename || fullUrl,
        data?.kind || kind
      );
      return {
        src: fullUrl,
        filename: data?.filename || resolvedFilename,
        kind: data?.kind || kind,
        caption:
          data?.filename ||
          (jsonType === "video" ? "Generated Video" : "Generated Image"),
        mediaType: jsonType,
      };
    }

    if (typeof data?.base64 === "string" && data.base64) {
      const prefix =
        finalMediaType === "video"
          ? "data:video/mp4;base64,"
          : "data:image/png;base64,";
      return {
        src: data.base64.startsWith("data:")
          ? data.base64
          : `${prefix}${data.base64}`,
        filename: data?.filename || resolvedFilename,
        kind: data?.kind || kind,
        caption:
          data?.filename ||
          (finalMediaType === "video"
            ? "Generated Video"
            : "Generated Image"),
        mediaType: finalMediaType,
      };
    }
  }

  return null;
}

interface ParsedSseResult {
  deltaText: string;
  finalContent?: string;
  assetRef?: string;
  kind?: string;
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
      const assetRef =
        parsed?.filename ||
        parsed?.file_name ||
        parsed?.video_url ||
        parsed?.image_url ||
        parsed?.url ||
        parsed?.download_latest;
      const kind = typeof parsed?.kind === "string" ? parsed.kind : undefined;

      if (parsed?.status === "done") {
        return {
          deltaText: "",
          assetRef: typeof assetRef === "string" ? assetRef : undefined,
          kind,
        };
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
            assetRef: typeof assetRef === "string" ? assetRef : undefined,
            kind,
          };
        }
        return {
          deltaText: textPiece,
          assetRef: typeof assetRef === "string" ? assetRef : undefined,
          kind,
        };
      }

      return {
        deltaText: "",
        assetRef: typeof assetRef === "string" ? assetRef : undefined,
        kind,
      };
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

export default function AgentPage({ onBackHome }: AgentPageProps) {
  const [sessions, setSessions] = useState<SessionItem[]>(INITIAL_SESSIONS);
  const [activeId, setActiveId] = useState<string>("sess-1");
  const [modeId, setModeId] = useState<string>("agent");
  const [input, setInput] = useState<string>("");
  const [running, setRunning] = useState<boolean>(false);
  const [listening, setListening] = useState<boolean>(false);
  const [voiceEnabled, setVoiceEnabled] = useState<boolean>(true);
  const [speaking, setSpeaking] = useState<boolean>(false);
  const [micNote, setMicNote] = useState<string>("");
  const [drawerOpen, setDrawerOpen] = useState<boolean>(false);
  const [openTraces, setOpenTraces] = useState<Record<string, boolean>>({});
  const [previewMedia, setPreviewMedia] = useState<MediaAttachment | null>(
    null
  );

  const abortRef = useRef<AbortController | null>(null);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const currentSession =
    sessions.find((s) => s.id === activeId) ?? sessions[0];
  const currentMode =
    AGENT_MODES.find((m) => m.id === modeId) ?? AGENT_MODES[0];

  const stopSpeech = () => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setSpeaking(false);
  };

  const speakOnListenClick = (rawText: string) => {
    if (
      !voiceEnabled ||
      typeof window === "undefined" ||
      !("speechSynthesis" in window)
    ) {
      return;
    }
    const clean = cleanTextForSpeech(rawText);
    if (!clean) return;

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(clean);
    const voices = window.speechSynthesis.getVoices();
    const selectedVoice = pickFemaleVoice(voices);
    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }
    utterance.rate = 1.02;
    utterance.pitch = 1.12;

    utterance.onstart = () => setSpeaking(true);
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  const handleExitChat = () => {
    stopSpeech();
    if (typeof onBackHome === "function") {
      onBackHome();
    } else if (typeof window !== "undefined") {
      window.history.back();
    }
  };

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [currentSession?.messages, running]);

  useEffect(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.getVoices();
    }
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (previewMedia) {
          setPreviewMedia(null);
        } else if (drawerOpen) {
          setDrawerOpen(false);
        } else {
          handleExitChat();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  });

  useEffect(() => {
    return () => {
      abortRef.current?.abort();
      stopSpeech();
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {
          // Ignore cleanup error
        }
      }
    };
  }, []);

  const syncTextareaHeight = () => {
    if (!textareaRef.current) return;
    textareaRef.current.style.height = "auto";
    textareaRef.current.style.height = `${Math.min(
      textareaRef.current.scrollHeight,
      144
    )}px`;
  };

  const resetTextareaHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const toggleMic = () => {
    stopSpeech();
    if (listening) {
      try {
        recognitionRef.current?.stop();
      } catch {
        // Ignore stop error
      }
      setListening(false);
      return;
    }

    const win = window as unknown as {
      SpeechRecognition?: SpeechRecognitionConstructor;
      webkitSpeechRecognition?: SpeechRecognitionConstructor;
    };
    const SpeechRec = win.SpeechRecognition || win.webkitSpeechRecognition;

    if (!SpeechRec) {
      setMicNote("Is browser mein speech recognition available nahi hai.");
      return;
    }

    try {
      setMicNote("");
      const recognition = new SpeechRec();
      recognition.lang = "en-IN";
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onresult = (event: SpeechRecognitionEventLike) => {
        const spoken = event.results?.[0]?.[0]?.transcript?.trim();
        if (spoken) {
          setInput((prev) => (prev ? `${prev} ${spoken}` : spoken));
          setTimeout(syncTextareaHeight, 0);
        }
      };

      recognition.onerror = () => {
        setMicNote("Mic permission check kar ya dobara try kar.");
        setListening(false);
      };

      recognition.onend = () => {
        setListening(false);
      };

      recognitionRef.current = recognition;
      setListening(true);
      recognition.start();
    } catch {
      setMicNote("Mic start nahi ho paya.");
      setListening(false);
    }
  };

  const toggleTrace = (id: string) => {
    setOpenTraces((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const createSession = () => {
    if (running) return;
    stopSpeech();
    const id = `sess-${Date.now()}`;
    const fresh: SessionItem = {
      id,
      title: "New thread",
      modeId,
      messages: [],
    };
    setSessions((prev) => [fresh, ...prev]);
    setActiveId(id);
    setDrawerOpen(false);
  };

  const removeSession = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (running || sessions.length <= 1) return;
    stopSpeech();
    const next = sessions.filter((s) => s.id !== id);
    setSessions(next);
    if (activeId === id) {
      setActiveId(next[0].id);
    }
  };

  const stopGeneration = () => {
    abortRef.current?.abort();
    abortRef.current = null;
    stopSpeech();
    setRunning(false);
  };

  const updateAgentMessage = (
    targetSessionId: string,
    agentMsgId: string,
    updater: (msg: MessageItem) => MessageItem
  ) => {
    setSessions((prev) =>
      prev.map((s) => {
        if (s.id !== targetSessionId) return s;
        return {
          ...s,
          messages: s.messages.map((m) => (m.id === agentMsgId ? updater(m) : m)),
        };
      })
    );
  };

  const runPrompt = async (rawText?: string, overrideMode?: AgentMode) => {
    const text = (rawText ?? input).trim();
    if (!text || running) return;

    stopSpeech();

    if (listening) {
      try {
        recognitionRef.current?.stop();
      } catch {
        // Ignore stop error
      }
      setListening(false);
    }

    setMicNote("");

    const targetSessionId = currentSession.id;
    const userMsgId = `u-${Date.now()}`;
    const agentMsgId = `a-${Date.now() + 1}`;
    const selectedMode = overrideMode ?? currentMode;
    const backendMode = normalizeBackendMode(
      selectedMode.apiMode ?? selectedMode.id
    );

    if (!rawText) {
      setInput("");
      resetTextareaHeight();
    }
    setRunning(true);

    setSessions((prev) =>
      prev.map((s) => {
        if (s.id !== targetSessionId) return s;
        const nextTitle =
          s.title === "New thread" || s.title === "NovaAI Workspace"
            ? text.slice(0, 34)
            : s.title;
        return {
          ...s,
          title: nextTitle,
          messages: [
            ...s.messages,
            { id: userMsgId, sender: "user", text },
            {
              id: agentMsgId,
              sender: "agent",
              modeName: selectedMode.label,
              modelName: ACTIVE_MODEL,
              trace: [
                `Endpoint: POST /api/v1/agents/stream (${selectedMode.label} -> mode="${backendMode}")`,
                `Session: ${targetSessionId}`,
              ],
              text: "",
            },
          ],
        };
      })
    );

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const response = await fetch(`${BASE_URL}/api/v1/agents/stream`, {
        method: "POST",
        headers: getAuthHeaders(true),
        body: JSON.stringify({
          prompt: text,
          session_id: targetSessionId,
          mode: backendMode,
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        const errBody = await response.text().catch(() => "");
        throw new Error(
          `Stream failed (${response.status}): ${errBody || response.statusText}`
        );
      }

      let accumulated = "";
      let detectedAsset: string | undefined;
      let detectedKind: string | undefined;

      const processLine = (rawLine: string, currentEvent: string) => {
        const parsed = parseSseLine(rawLine, currentEvent);
        if (parsed.assetRef) detectedAsset = parsed.assetRef;
        if (parsed.kind) detectedKind = parsed.kind;

        if (parsed.deltaText) {
          accumulated += parsed.deltaText;
        } else if (parsed.finalContent && !accumulated) {
          accumulated = parsed.finalContent;
        }
      };

      if (response.body) {
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let sseBuffer = "";
        let currentEvent = "message";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          sseBuffer += decoder.decode(value, { stream: true });
          const lines = sseBuffer.split(/\r?\n/);
          sseBuffer = lines.pop() ?? "";

          for (const line of lines) {
            const trimmed = line.trim();
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
            updateAgentMessage(targetSessionId, agentMsgId, (m) => ({
              ...m,
              text: snapshot,
            }));
          }
        }

        if (sseBuffer.trim()) {
          processLine(sseBuffer.trim(), currentEvent);
          if (accumulated) {
            const snapshot = accumulated;
            updateAgentMessage(targetSessionId, agentMsgId, (m) => ({
              ...m,
              text: snapshot,
            }));
          }
        }
      } else {
        const fullBody = await response.text();
        let currentEvent = "message";
        for (const line of fullBody.split(/\r?\n/)) {
          const trimmed = line.trim();
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
        updateAgentMessage(targetSessionId, agentMsgId, (m) => ({
          ...m,
          text: accumulated,
        }));
      }

      const fileMatch =
        detectedAsset ||
        accumulated.match(
          /(?:\/api\/v1\/agents\/download\/[^\s"')`]+|[\w.-]+\.(?:png|jpg|jpeg|webp|gif|mp4|webm|mov|mkv))/i
        )?.[0];

      const asksForVideo = /\b(video|clip|reel|animation|animate|mp4|movie)\b/i.test(
        text
      );
      const asksForImage = /\b(image|photo|picture|img|poster|banner|logo|draw)\b/i.test(
        text
      );

      if (fileMatch || asksForVideo || asksForImage) {
        const defaultKind =
          detectedKind || (asksForVideo ? "video" : "image");
        const mediaAsset = await resolveAssetMedia(
          fileMatch || "latest",
          defaultKind
        );
        if (mediaAsset) {
          updateAgentMessage(targetSessionId, agentMsgId, (m) => ({
            ...m,
            ...(mediaAsset.mediaType === "video"
              ? { video: mediaAsset }
              : { image: mediaAsset }),
          }));
        }
      }
    } catch (err: unknown) {
      if ((err as { name?: string })?.name === "AbortError") {
        updateAgentMessage(targetSessionId, agentMsgId, (m) => ({
          ...m,
          text: m.text || "_Generation stopped._",
        }));
      } else {
        const message =
          err instanceof Error ? err.message : "Unknown stream error";
        updateAgentMessage(targetSessionId, agentMsgId, (m) => ({
          ...m,
          text: `### Stream Error\n\n\`${message}\``,
        }));
      }
    } finally {
      abortRef.current = null;
      setRunning(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    runPrompt();
  };

  const handleDownloadMedia = (media: MediaAttachment) => {
    const fallbackName =
      media.filename ||
      (media.mediaType === "video" ? "nova-video.mp4" : "nova-image.png");
    void triggerAuthenticatedDownload(media.src, fallbackName);
  };

  const messages: MessageItem[] = currentSession?.messages ?? [];

  return (
    <div className="relative flex h-dvh w-full overflow-hidden bg-[#05070d] text-zinc-100 [color-scheme:dark]">
      {previewMedia && (
        <div
          onClick={() => setPreviewMedia(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative flex max-h-[90dvh] max-w-4xl flex-col overflow-hidden rounded-3xl border border-zinc-700/90 bg-zinc-950 shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-zinc-800 px-4 py-3">
              <span className="truncate text-xs font-semibold text-zinc-200">
                {previewMedia.filename ||
                  (previewMedia.mediaType === "video"
                    ? "Generated Video"
                    : "Generated Image")}
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleDownloadMedia(previewMedia)}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-amber-400/40 bg-amber-500/15 px-3 py-1.5 text-xs font-semibold text-amber-300 hover:bg-amber-500/25"
                >
                  <Download size={13} />
                  <span>Download</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewMedia(null)}
                  aria-label="Close preview"
                  className="flex h-8 w-8 items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900 text-zinc-300 hover:text-white"
                >
                  <X size={15} />
                </button>
              </div>
            </div>
            <div className="flex max-h-[78dvh] items-center justify-center overflow-auto bg-[#090b12] p-4">
              {previewMedia.mediaType === "video" ? (
                <video
                  src={previewMedia.src}
                  controls
                  autoPlay
                  playsInline
                  className="max-h-[72dvh] w-auto rounded-2xl object-contain"
                />
              ) : (
                <img
                  src={previewMedia.src}
                  alt={previewMedia.caption || "Generated agent image"}
                  className="max-h-[72dvh] w-auto rounded-2xl object-contain"
                />
              )}
            </div>
          </div>
        </div>
      )}

      {drawerOpen && (
        <div
          onClick={() => setDrawerOpen(false)}
          className="fixed inset-0 z-30 bg-black/75 backdrop-blur-xs lg:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-72 max-w-[82vw] shrink-0 flex-col overflow-hidden border-r border-zinc-800/90 bg-zinc-950 transition-transform duration-200 ease-out lg:static lg:w-64 lg:translate-x-0 ${
          drawerOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center gap-2 border-b border-zinc-800/90 p-3">
          <button
            type="button"
            onClick={createSession}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500 px-3 py-2.5 text-xs font-bold text-zinc-950 shadow-md shadow-amber-500/20 transition hover:brightness-110 active:scale-[0.98]"
          >
            <Plus size={15} strokeWidth={2.5} />
            <span>New Chat</span>
          </button>

          <button
            type="button"
            onClick={() => setDrawerOpen(false)}
            aria-label="Close sidebar"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-white lg:hidden"
          >
            <X size={15} />
          </button>
        </div>

        <div className="flex-1 space-y-1 overflow-y-auto overflow-x-hidden p-2.5 [scrollbar-width:thin] [scrollbar-color:#27272a_transparent]">
          <p className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-zinc-500">
            Recent Threads
          </p>
          {sessions.map((s) => {
            const active = s.id === currentSession.id;
            return (
              <div
                key={s.id}
                onClick={() => {
                  stopSpeech();
                  setActiveId(s.id);
                  setDrawerOpen(false);
                }}
                className={`group flex cursor-pointer items-center justify-between rounded-xl px-3 py-2.5 text-xs transition ${
                  active
                    ? "border border-amber-400/40 bg-gradient-to-r from-amber-500/15 to-sky-500/10 font-semibold text-amber-200"
                    : "border border-transparent text-zinc-400 hover:bg-zinc-900 hover:text-zinc-100"
                }`}
              >
                <span className="truncate pr-2">{s.title}</span>
                {sessions.length > 1 && (
                  <button
                    type="button"
                    onClick={(e) => removeSession(e, s.id)}
                    aria-label="Delete thread"
                    className="text-zinc-500 opacity-70 transition hover:text-rose-400 sm:opacity-0 sm:group-hover:opacity-100"
                  >
                    <Trash2 size={13} />
                  </button>
                )}
              </div>
            );
          })}
        </div>

        <div className="border-t border-zinc-800/90 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
          <button
            type="button"
            onClick={handleExitChat}
            className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2.5 text-xs font-semibold text-zinc-200 transition hover:border-amber-400/50 hover:text-amber-300 active:scale-[0.98]"
          >
            <ArrowLeft size={14} />
            <span>Back to Home</span>
          </button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden bg-[#05070d]">
        <header className="flex h-14 shrink-0 items-center justify-between border-b border-zinc-800/80 bg-[#05070d]/90 px-3 backdrop-blur-md sm:px-5">
          <div className="flex min-w-0 items-center gap-2">
            <button
              type="button"
              onClick={() => setDrawerOpen((v) => !v)}
              aria-label="Open menu"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900/90 text-zinc-200 transition hover:border-amber-400/50 active:scale-95 lg:hidden"
            >
              <PanelLeft size={16} />
            </button>

            <button
              type="button"
              onClick={handleExitChat}
              aria-label="Exit agent chat"
              title="Back"
              className="hidden h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900/90 text-zinc-200 transition hover:border-amber-400/60 hover:text-amber-300 active:scale-95 sm:flex"
            >
              <ArrowLeft size={15} />
            </button>

            <div className="flex min-w-0 items-center gap-2 pl-0.5">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-amber-400/30 bg-amber-500/15 text-amber-400">
                <Sparkles size={14} />
              </span>
              <span className="truncate text-sm font-bold text-white">
                {ACTIVE_MODEL}
              </span>
              <span className="hidden rounded-full border border-sky-400/30 bg-sky-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-sky-300 sm:inline">
                {currentMode.label}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-[11px] font-medium text-zinc-400">
            <button
              type="button"
              onClick={() => {
                if (voiceEnabled) stopSpeech();
                setVoiceEnabled((v) => !v);
              }}
              aria-label={
                voiceEnabled ? "Mute NovaAI voice" : "Unmute NovaAI voice"
              }
              className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold transition ${
                voiceEnabled
                  ? "border-amber-400/40 bg-amber-400/15 text-amber-300"
                  : "border-zinc-800 bg-zinc-900 text-zinc-400"
              }`}
            >
              {voiceEnabled ? <Volume2 size={13} /> : <VolumeX size={13} />}
              <span>
                {speaking
                  ? "Speaking..."
                  : voiceEnabled
                  ? "Voice Ready"
                  : "Muted"}
              </span>
            </button>

            <button
              type="button"
              onClick={createSession}
              aria-label="Quick new chat"
              className="flex h-8 w-8 items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900/80 text-zinc-300 hover:border-amber-400/50 hover:text-amber-300 lg:hidden"
            >
              <Plus size={15} />
            </button>
            <span className="hidden sm:inline">
              {running ? (
                <span className="text-amber-300">Generating...</span>
              ) : (
                "Ready"
              )}
            </span>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto overflow-x-hidden px-3.5 py-6 sm:px-6 [scrollbar-width:thin] [scrollbar-color:#27272a_transparent]">
          <div className="mx-auto max-w-3xl">
            {messages.length === 0 ? (
              <div className="space-y-6 py-4 sm:py-10">
                <div className="space-y-2 text-center sm:text-left">
                  <p className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/30 bg-amber-500/10 px-3 py-1 text-[11px] font-semibold text-amber-300">
                    <Sparkles size={12} />
                    <span>{ACTIVE_MODEL} Workspace</span>
                  </p>
                  <h1 className="text-2xl font-extrabold tracking-tight text-white sm:text-4xl">
                    What are we building{" "}
                    <span className="bg-gradient-to-r from-amber-300 via-amber-400 to-sky-400 bg-clip-text text-transparent">
                      today?
                    </span>
                  </h1>
                  <p className="text-xs text-zinc-400 sm:text-sm">
                    Koi mode chuno ya neeche diye starter prompts tap karke test
                    karo.
                  </p>
                </div>

                <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] sm:hidden">
                  {AGENT_MODES.map((m) => {
                    const active = modeId === m.id;
                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setModeId(m.id)}
                        className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
                          active
                            ? "bg-amber-400 text-zinc-950"
                            : "border border-zinc-800 bg-zinc-900/80 text-zinc-300"
                        }`}
                      >
                        {m.label}
                      </button>
                    );
                  })}
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-3.5">
                  {AGENT_MODES.map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => {
                        setModeId(m.id);
                        runPrompt(m.prompt, m);
                      }}
                      className="group flex flex-col justify-between rounded-2xl border border-zinc-800/90 bg-zinc-900/70 p-4 text-left transition hover:border-amber-400/60 hover:bg-zinc-900 active:scale-[0.99]"
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-amber-400">
                            {m.label}
                          </span>
                          <span className="text-[11px] font-semibold text-sky-400 transition group-hover:translate-x-0.5">
                            Try →
                          </span>
                        </div>
                        <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-zinc-100 sm:text-sm">
                          {m.prompt}
                        </p>
                      </div>
                      <span className="mt-3 text-[11px] text-zinc-400">
                        {m.role}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {messages.map((msg: MessageItem) => {
                  if (msg.sender === "user") {
                    return (
                      <div key={msg.id} className="flex justify-end">
                        <div className="max-w-[88%] rounded-3xl rounded-br-md border border-zinc-700/80 bg-zinc-800/90 px-4 py-3 text-xs leading-relaxed text-white whitespace-pre-wrap shadow-sm sm:max-w-[75%] sm:text-sm">
                          {msg.text}
                        </div>
                      </div>
                    );
                  }

                  const traceList: string[] = msg.trace ?? [];
                  const isTraceOpen = Boolean(openTraces[msg.id]);

                  return (
                    <div key={msg.id} className="space-y-3">
                      <div className="flex flex-wrap items-center gap-2 text-xs font-bold text-amber-300">
                        <span className="flex h-7 w-7 items-center justify-center rounded-full border border-amber-400/40 bg-amber-500/15 text-amber-400">
                          <Cpu size={14} />
                        </span>
                        <span>{msg.modeName ?? currentMode.label}</span>
                        <span className="rounded-full border border-zinc-800 bg-zinc-900 px-2.5 py-0.5 text-[10px] font-semibold text-sky-300">
                          {msg.modelName ?? ACTIVE_MODEL}
                        </span>
                        {msg.text && (
                          <button
                            type="button"
                            onClick={() => speakOnListenClick(msg.text)}
                            aria-label="Listen to reply"
                            className="inline-flex items-center gap-1 rounded-full border border-zinc-800 bg-zinc-900 px-2.5 py-0.5 text-[10px] font-medium text-zinc-300 hover:border-amber-400/50 hover:text-amber-300"
                          >
                            <Volume2 size={11} />
                            <span>Listen</span>
                          </button>
                        )}
                      </div>

                      {traceList.length > 0 && (
                        <div className="rounded-2xl border border-zinc-800/90 bg-zinc-900/75 sm:ml-9">
                          <button
                            type="button"
                            onClick={() => toggleTrace(msg.id)}
                            className="flex w-full items-center justify-between px-3.5 py-2 text-[11px] font-medium text-zinc-300 hover:text-white"
                          >
                            <span>Reasoning Steps ({traceList.length})</span>
                            {isTraceOpen ? (
                              <ChevronDown
                                size={14}
                                className="text-amber-400"
                              />
                            ) : (
                              <ChevronRight
                                size={14}
                                className="text-zinc-400"
                              />
                            )}
                          </button>
                          {isTraceOpen && (
                            <div className="space-y-1 border-t border-zinc-800 px-3.5 py-2.5 text-[11px] text-zinc-400">
                              {traceList.map((step: string, i: number) => (
                                <p key={i}>• {step}</p>
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                      <div className="min-w-0 space-y-3 sm:pl-9">
                        {msg.text ? (
                          <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            components={MARKDOWN_COMPONENTS}
                          >
                            {msg.text}
                          </ReactMarkdown>
                        ) : (
                          <span className="animate-pulse text-xs text-amber-300/80 sm:text-sm">
                            Thinking...
                          </span>
                        )}

                        {msg.image && (
                          <div className="max-w-md overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/90 shadow-xl">
                            <div className="flex items-center justify-between border-b border-zinc-800/80 px-3.5 py-2 text-[11px] text-zinc-300">
                              <span className="flex items-center gap-1.5 truncate font-medium">
                                <ImageIcon
                                  size={13}
                                  className="shrink-0 text-amber-400"
                                />
                                <span className="truncate">
                                  {msg.image.filename || "Generated Image"}
                                </span>
                              </span>
                              <div className="flex shrink-0 items-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => setPreviewMedia(msg.image!)}
                                  aria-label="Expand image"
                                  className="rounded-lg border border-zinc-700/80 bg-zinc-800/80 p-1.5 text-zinc-300 hover:border-amber-400/50 hover:text-amber-300"
                                >
                                  <Maximize2 size={12} />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDownloadMedia(msg.image!)}
                                  aria-label="Download image"
                                  className="rounded-lg border border-zinc-700/80 bg-zinc-800/80 p-1.5 text-zinc-300 hover:border-amber-400/50 hover:text-amber-300"
                                >
                                  <Download size={12} />
                                </button>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => setPreviewMedia(msg.image!)}
                              className="block w-full bg-[#090b12] p-2 text-left"
                            >
                              <img
                                src={msg.image.src}
                                alt={msg.image.caption || "Generated image"}
                                className="max-h-96 w-full rounded-xl object-contain"
                              />
                            </button>
                          </div>
                        )}

                        {msg.video && (
                          <div className="max-w-md overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/90 shadow-xl">
                            <div className="flex items-center justify-between border-b border-zinc-800/80 px-3.5 py-2 text-[11px] text-zinc-300">
                              <span className="flex items-center gap-1.5 truncate font-medium">
                                <VideoIcon
                                  size={13}
                                  className="shrink-0 text-amber-400"
                                />
                                <span className="truncate">
                                  {msg.video.filename || "Generated Video"}
                                </span>
                              </span>
                              <div className="flex shrink-0 items-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => setPreviewMedia(msg.video!)}
                                  aria-label="Expand video"
                                  className="rounded-lg border border-zinc-700/80 bg-zinc-800/80 p-1.5 text-zinc-300 hover:border-amber-400/50 hover:text-amber-300"
                                >
                                  <Maximize2 size={12} />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDownloadMedia(msg.video!)}
                                  aria-label="Download video"
                                  className="rounded-lg border border-zinc-700/80 bg-zinc-800/80 p-1.5 text-zinc-300 hover:border-amber-400/50 hover:text-amber-300"
                                >
                                  <Download size={12} />
                                </button>
                              </div>
                            </div>
                            <div className="bg-[#090b12] p-2">
                              <video
                                src={msg.video.src}
                                controls
                                playsInline
                                preload="metadata"
                                className="max-h-96 w-full rounded-xl object-contain"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
                <div ref={bottomRef} />
              </div>
            )}
          </div>
        </div>

        <div className="shrink-0 bg-gradient-to-t from-[#05070d] via-[#05070d] to-transparent px-3 pt-2 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:px-6 sm:pb-5">
          <form
            onSubmit={handleFormSubmit}
            className="mx-auto max-w-3xl rounded-3xl border border-zinc-800 bg-zinc-900/95 px-3.5 py-2.5 shadow-2xl transition focus-within:border-amber-400/60 sm:px-4 sm:py-3"
          >
            <textarea
              ref={textareaRef}
              rows={1}
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                syncTextareaHeight();
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  runPrompt();
                }
              }}
              placeholder={
                listening
                  ? "Listening... bol bhai"
                  : `Message ${ACTIVE_MODEL} (${currentMode.label})...`
              }
              className="max-h-36 w-full resize-none bg-transparent px-1 py-1 text-sm leading-relaxed text-zinc-100 placeholder-zinc-500 focus:outline-none [scrollbar-width:none]"
            />

            {micNote && (
              <p className="mt-1 px-1 text-[11px] text-amber-300">{micNote}</p>
            )}

            <div className="mt-2 flex items-center justify-between gap-2 pt-0.5">
              <div className="flex min-w-0 items-center gap-1.5 overflow-x-auto [scrollbar-width:none]">
                <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-sky-400/35 bg-sky-500/10 px-3 py-1.5 text-[11px] font-semibold text-sky-300">
                  <Sparkles size={12} />
                  <span>{ACTIVE_MODEL}</span>
                </span>

                <div className="hidden items-center gap-1 sm:flex">
                  {AGENT_MODES.map((m) => {
                    const isActive = modeId === m.id;
                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setModeId(m.id)}
                        className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold transition ${
                          isActive
                            ? "border border-amber-400/40 bg-amber-400/15 text-amber-300"
                            : "border border-transparent text-zinc-400 hover:bg-zinc-800/80 hover:text-zinc-200"
                        }`}
                      >
                        {m.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-2">
                <button
                  type="button"
                  onClick={toggleMic}
                  aria-label={
                    listening ? "Stop voice input" : "Start voice input"
                  }
                  className={`flex h-9 w-9 items-center justify-center rounded-full border transition active:scale-95 ${
                    listening
                      ? "animate-pulse border-amber-400 bg-amber-400/20 text-amber-300"
                      : "border-zinc-700/90 bg-zinc-800/90 text-zinc-300 hover:border-amber-400/50 hover:text-amber-300"
                  }`}
                >
                  {listening ? <MicOff size={15} /> : <Mic size={15} />}
                </button>

                {running ? (
                  <button
                    type="button"
                    onClick={stopGeneration}
                    aria-label="Stop generating"
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-rose-500/40 bg-rose-500/20 text-rose-300 transition hover:bg-rose-500/30 active:scale-95"
                  >
                    <Square size={13} className="fill-current" />
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={!input.trim()}
                    aria-label="Send message"
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-r from-amber-400 to-orange-500 text-zinc-950 shadow-md shadow-amber-500/25 transition hover:brightness-110 active:scale-95 disabled:bg-zinc-800 disabled:from-zinc-800 disabled:to-zinc-800 disabled:text-zinc-500 disabled:shadow-none"
                  >
                    <ArrowUp size={17} strokeWidth={2.5} />
                  </button>
                )}
              </div>
            </div>
          </form>

          <p className="mt-2 text-center text-[11px] text-zinc-500">
            Nova is an AI and can make mistakes.
          </p>
        </div>
      </div>
    </div>
  );
}

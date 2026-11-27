"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Sparkles,
  Activity,
  Bot,
  Search,
  Code2,
  Layers,
  Workflow,
  ArrowUpRight,
  Zap,
  RotateCcw,
  Clock,
} from "lucide-react";

interface ToolShortcut {
  id: string;
  name: string;
  href: string;
  badge: string;
  desc: string;
  icon: "bot" | "search" | "code" | "studio" | "workflow";
}

interface ActivityEntry {
  id: string;
  module: string;
  summary: string;
  requestsUsed: number;
  timeLabel: string;
}

const BACKEND_URL = (
  process.env.NEXT_PUBLIC_BACKEND_URL || "https://nova-backend-77e0.onrender.com"
).replace(/\/+$/, "");

const TOOL_SHORTCUTS: ToolShortcut[] = [
  {
    id: "agents",
    name: "Autonomous Agents",
    href: "/Product/agent",
    badge: "Agentic",
    desc: "Multi-step reasoning, mode switching aur live step trace ke saath tasks run karo.",
    icon: "bot",
  },
  {
    id: "search",
    name: "Deep Search Engine",
    href: "/Product/deep",
    badge: "Research",
    desc: "Scoped search passes, synthesized answers aur structured source cards dekho.",
    icon: "search",
  },
  {
    id: "builder",
    name: "App & Code Builder",
    href: "/Product/code",
    badge: "Code",
    desc: "Starter templates edit karo, component preview dekho, aur build checks chalao.",
    icon: "code",
  },
  {
    id: "studio",
    name: "Multimodal Studio",
    href: "/Product/multimodel",
    badge: "Creative",
    desc: "Text, visual prompts, voice scripts aur schemas ko style & temperature ke saath banao.",
    icon: "studio",
  },
  {
    id: "workflows",
    name: "Workflow Automation",
    href: "/solutions/workflows",
    badge: "Pipelines",
    desc: "Automated step nodes toggle karo aur repeatable execution pipelines chalao.",
    icon: "workflow",
  },
];

function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;

  const directToken =
    window.localStorage.getItem("novaai_token") ||
    window.localStorage.getItem("token") ||
    window.localStorage.getItem("accessToken");

  if (directToken) return directToken;

  try {
    const rawSession = window.localStorage.getItem("novaai_session");
    if (rawSession) {
      const parsed = JSON.parse(rawSession);
      return parsed?.token || parsed?.accessToken || null;
    }
  } catch {
    // Ignore malformed session JSON
  }

  return null;
}

export default function UserDashboardPage() {
  const [requestsUsed, setRequestsUsed] = useState<number>(0);
  const [dailyLimit, setDailyLimit] = useState<number>(20);
  const [selectedToolId, setSelectedToolId] = useState<string>("agents");
  const [activity, setActivity] = useState<ActivityEntry[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [statusBanner, setStatusBanner] = useState<string>(
    "Workspace ready — 0 requests used. Koi bhi tool select karke live /api/chat test chalao."
  );

  const activeTool =
    TOOL_SHORTCUTS.find((t) => t.id === selectedToolId) ?? TOOL_SHORTCUTS[0];

  const usagePercent = Math.max(
    0,
    Math.min(100, Math.round((requestsUsed / dailyLimit) * 100))
  );

  const handleProceedRequest = async (tool: ToolShortcut) => {
    if (isLoading) return;

    setSelectedToolId(tool.id);
    setIsLoading(true);
    setStatusBanner(
      `${tool.name} ke liye /api/chat par request bhej raha hoon...`
    );

    try {
      const token = getAuthToken();

      const res = await fetch(`${BACKEND_URL}/api/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          workspaceId: tool.id,
          message: `Run check from dashboard for ${tool.name}`,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        if (typeof data?.dailyLimit === "number") {
          setDailyLimit(data.dailyLimit);
          setRequestsUsed(data.dailyLimit);
        }
        setStatusBanner(
          data?.message ||
            data?.error ||
            `Request block hui (Status: ${res.status}).`
        );
        return;
      }

      const nextCount =
        typeof data?.requestsUsed === "number"
          ? data.requestsUsed
          : requestsUsed + 1;
      if (typeof data?.dailyLimit === "number") {
        setDailyLimit(data.dailyLimit);
      }
      setRequestsUsed(nextCount);

      const newEntry: ActivityEntry = {
        id: `act-${Date.now()}`,
        module: tool.name,
        summary:
          data?.reply ||
          data?.message ||
          `Completed 1 request in ${tool.name}`,
        requestsUsed: 1,
        timeLabel: "Just now",
      };

      setActivity((prev) => [newEntry, ...prev.slice(0, 9)]);
      setStatusBanner(
        `${tool.name} request complete (+1 used). Total session requests: ${nextCount}/${dailyLimit}.`
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Network error";
      setStatusBanner(`Backend se connect nahi ho paya: ${msg}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetCounter = () => {
    setRequestsUsed(0);
    setActivity([]);
    setStatusBanner(
      "Local dashboard counter aur activity feed 0 par reset ho gayi."
    );
  };

  const renderToolIcon = (icon: ToolShortcut["icon"]) => {
    switch (icon) {
      case "bot":
        return <Bot size={17} className="text-amber-400" />;
      case "search":
        return <Search size={17} className="text-amber-400" />;
      case "code":
        return <Code2 size={17} className="text-amber-400" />;
      case "studio":
        return <Layers size={17} className="text-amber-400" />;
      default:
        return <Workflow size={17} className="text-amber-400" />;
    }
  };

  return (
    <div className="min-h-screen bg-[#05070d] text-white">
      <div className="mx-auto max-w-7xl px-4 py-7 sm:py-10 md:px-8 space-y-8">
        {/* Top Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900/80 px-3.5 py-2 text-xs font-semibold text-zinc-200 transition hover:border-amber-400/50 hover:text-white"
          >
            <span>←</span>
            <span>Home</span>
          </Link>

          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/product"
              className="rounded-xl border border-zinc-800 bg-zinc-900/80 px-3.5 py-2 text-xs font-semibold text-zinc-300 transition hover:border-zinc-600 hover:text-white"
            >
              Product Hub
            </Link>
            <Link
              href="/pricing"
              className="rounded-xl border border-amber-400/35 bg-amber-500/10 px-3.5 py-2 text-xs font-semibold text-amber-300 transition hover:bg-amber-500/20"
            >
              Upgrade Plan
            </Link>
          </div>
        </div>

        {/* Welcome + Live Session Usage Card */}
        <section className="relative overflow-hidden rounded-3xl border border-zinc-800/80 bg-gradient-to-br from-[#0d0a07] via-[#070b14] to-[#081224] p-6 sm:p-10 shadow-2xl">
          <div className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-amber-500/15 blur-3xl" />
          <div className="pointer-events-none absolute -left-24 -bottom-24 h-80 w-80 rounded-full bg-blue-600/15 blur-3xl" />

          <div className="relative z-10 grid grid-cols-1 gap-8 lg:grid-cols-12 items-center">
            <div className="lg:col-span-7 space-y-3">
              <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-500/10 px-3.5 py-1 text-xs font-semibold text-amber-300">
                <Sparkles size={13} />
                <span>NovaAI Control Panel</span>
              </div>

              <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white">
                Welcome Back,{" "}
                <span className="bg-gradient-to-r from-amber-300 via-amber-400 to-orange-500 bg-clip-text text-transparent">
                  Kartik
                </span>
              </h1>

              <p className="max-w-xl text-xs sm:text-sm leading-relaxed text-zinc-300/90">
                Yahan se apne saare AI workspaces launch kar, 24-hour session
                usage track kar, aur har request ka live status dekh.
              </p>

              <div className="flex flex-wrap items-center gap-2.5 pt-2">
                <Link
                  href={activeTool.href}
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 px-5 py-2.5 text-xs sm:text-sm font-bold text-zinc-950 shadow-lg shadow-amber-500/20 transition hover:brightness-110"
                >
                  <span>Open {activeTool.name}</span>
                  <ArrowUpRight size={15} />
                </Link>

                <button
                  type="button"
                  disabled={isLoading}
                  onClick={() => handleProceedRequest(activeTool)}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-700 bg-zinc-900/90 px-4 py-2.5 text-xs sm:text-sm font-semibold text-zinc-200 transition hover:border-amber-400/50 hover:text-white disabled:opacity-50"
                >
                  <Zap size={14} className="text-amber-400" />
                  <span>
                    {isLoading ? "Running..." : "Test Request (+1 req)"}
                  </span>
                </button>
              </div>
            </div>

            {/* Live Request Usage Box (Starts at 0) */}
            <div className="lg:col-span-5 rounded-2xl border border-amber-400/30 bg-[#050811]/95 p-5 sm:p-6 space-y-4 shadow-xl">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-400">
                  <Activity size={15} />
                  <span>Session Requests Used</span>
                </span>
                <span className="rounded-full bg-amber-500/15 px-2.5 py-0.5 text-[11px] font-semibold text-amber-200">
                  24h Free Window
                </span>
              </div>

              <div className="flex items-baseline justify-between gap-2">
                <span className="text-3xl sm:text-4xl font-extrabold text-white">
                  {requestsUsed.toLocaleString()}
                </span>
                <span className="text-xs text-zinc-400">
                  / {dailyLimit.toLocaleString()} requests
                </span>
              </div>

              {/* Progress Bar */}
              <div className="h-2.5 w-full overflow-hidden rounded-full bg-zinc-800">
                <div
                  style={{ width: `${usagePercent}%` }}
                  className="h-full rounded-full bg-gradient-to-r from-amber-400 to-orange-500 transition-all duration-300"
                />
              </div>

              <div className="flex items-center justify-between text-xs text-zinc-400">
                <span>
                  {usagePercent}% session quota used (
                  {Math.max(0, dailyLimit - requestsUsed)} left)
                </span>
                <button
                  type="button"
                  onClick={handleResetCounter}
                  className="inline-flex items-center gap-1 text-zinc-300 hover:text-amber-300"
                >
                  <RotateCcw size={12} />
                  <span>Reset UI</span>
                </button>
              </div>
            </div>
          </div>

          <p className="relative z-10 mt-5 rounded-xl border border-zinc-800/80 bg-[#050811]/80 px-4 py-2.5 text-xs text-zinc-300">
            {statusBanner}
          </p>
        </section>

        {/* Quick Launch Tools Grid */}
        <section className="space-y-4">
          <div className="flex flex-wrap items-end justify-between gap-2">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-amber-400">
                — Quick Launch —
              </p>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
                Your AI Workspaces
              </h2>
            </div>
            <span className="text-xs text-zinc-400">
              Click a card to select active tool or send 1 live request
            </span>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {TOOL_SHORTCUTS.map((tool: ToolShortcut) => {
              const isSelected = tool.id === selectedToolId;
              return (
                <div
                  key={tool.id}
                  onClick={() => setSelectedToolId(tool.id)}
                  className={`flex cursor-pointer flex-col justify-between rounded-2xl border p-5 transition ${
                    isSelected
                      ? "border-amber-400/70 bg-gradient-to-b from-[#171208] to-[#0a0f1c] shadow-lg shadow-amber-500/10"
                      : "border-zinc-800/90 bg-[#0a0f1c]/90 hover:border-zinc-700"
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-zinc-800 bg-[#050811]">
                        {renderToolIcon(tool.icon)}
                      </span>
                      <span className="rounded-full border border-amber-400/25 bg-amber-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-amber-300">
                        1 req / run
                      </span>
                    </div>

                    <h3 className="mt-3.5 text-base font-bold text-white">
                      {tool.name}
                    </h3>
                    <p className="mt-1 text-xs leading-relaxed text-zinc-400">
                      {tool.desc}
                    </p>
                  </div>

                  <div className="mt-5 flex items-center justify-between border-t border-zinc-800/80 pt-3.5">
                    <button
                      type="button"
                      disabled={isLoading}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleProceedRequest(tool);
                      }}
                      className="text-xs font-semibold text-zinc-300 hover:text-amber-300 disabled:opacity-50"
                    >
                      Run 1 Request
                    </button>

                    <Link
                      href={tool.href}
                      onClick={(e) => e.stopPropagation()}
                      className="inline-flex items-center gap-1 rounded-xl bg-amber-400 px-3.5 py-1.5 text-xs font-bold text-zinc-950 transition hover:bg-amber-300"
                    >
                      <span>Launch</span>
                      <ArrowUpRight size={13} />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Recent Activity Feed */}
        <section className="rounded-3xl border border-zinc-800/90 bg-[#070b14] p-5 sm:p-7 space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-amber-400">
                Recent Runs
              </p>
              <h2 className="text-lg sm:text-xl font-bold text-white">
                Activity & Request Log
              </h2>
            </div>
            <span className="text-xs text-zinc-400">
              {activity.length} recent entries
            </span>
          </div>

          {activity.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-zinc-800 bg-[#0a0f1c]/60 px-4 py-8 text-center text-xs text-zinc-400">
              Abhi tak koi request proceed nahi hui hai (0 used). Upar se kisi
              bhi workspace par “Run 1 Request” click karke test
              kar.
            </div>
          ) : (
            <div className="space-y-2.5">
              {activity.map((item: ActivityEntry) => (
                <div
                  key={item.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 rounded-2xl border border-zinc-800/90 bg-[#0a0f1c] px-4 py-3"
                >
                  <div className="min-w-0">
                    <p className="text-xs sm:text-sm font-bold text-white">
                      {item.module}
                    </p>
                    <p className="truncate text-xs text-zinc-400">
                      {item.summary}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-auto text-xs shrink-0">
                    <span className="rounded-lg bg-amber-500/10 border border-amber-400/25 px-2.5 py-1 font-mono text-amber-300">
                      +{item.requestsUsed} req
                    </span>
                    <span className="inline-flex items-center gap-1 text-zinc-500">
                      <Clock size={12} />
                      {item.timeLabel}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
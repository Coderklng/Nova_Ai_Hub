"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Sparkles,
  Check,
  ArrowRight,
  Send,
  Bot,
  User,
  RotateCcw,
  Terminal,
  FolderOpen,
  Settings,
  MessageSquare,
} from "lucide-react";

const CAPABILITIES = [
  "Web Search & Research",
  "Code Generation",
  "File Creation & Editing",
  "Real-Time Tool Use",
];

const SIDEBAR_TABS = [
  { label: "Chat", icon: MessageSquare },
  { label: "Agents", icon: Bot },
  { label: "Tools", icon: Terminal },
  { label: "Files", icon: FolderOpen },
  { label: "Settings", icon: Settings },
];

export default function ProductDemoSection() {
  const [prompt, setPrompt] = useState("Build a website for my AI startup");
  const [activeTab, setActiveTab] = useState("Chat");
  const [messages, setMessages] = useState<{ role: "user" | "assistant"; content: string }[]>([
    {
      role: "assistant",
      content: "Creating your website... Ready to plan, code, and stream live responses.",
    },
  ]);
  const [isStreaming, setIsStreaming] = useState(false);
  const streamEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    streamEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const appendToken = (token: string) => {
    setMessages((prev) => {
      if (prev.length === 0) return prev;
      const copy = [...prev];
      const lastIndex = copy.length - 1;
      copy[lastIndex] = {
        ...copy[lastIndex],
        content: (copy[lastIndex].content || "") + token,
      };
      return copy;
    });
  };

  const handleRunDemo = async (customPrompt?: string) => {
    const text = (typeof customPrompt === "string" ? customPrompt : prompt).trim();
    if (!text || isStreaming) return;

    setMessages((prev) => [
      ...prev,
      { role: "user", content: text },
      { role: "assistant", content: "" },
    ]);
    setIsStreaming(true);

    try {
      const res = await fetch("http://localhost:5000/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });

      if (!res.ok || !res.body) {
        throw new Error("Server response not ok");
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const parts = buffer.split("\n\n");
        buffer = parts.pop() || "";

        for (const part of parts) {
          const clean = part.trim();
          if (!clean.startsWith("data: ")) continue;
          const raw = clean.slice(6).trim();
          if (!raw || raw === "[DONE]") continue;

          try {
            const parsed = JSON.parse(raw);
            if (parsed.token) {
              appendToken(parsed.token);
            }
          } catch {
            // Adhoora chunk skip karke agla wait karega
          }
        }
      }
    } catch {
      setMessages((prev) => {
        if (prev.length === 0) return prev;
        const copy = [...prev];
        copy[copy.length - 1] = {
          role: "assistant",
          content:
            "Server (localhost:5000) se connect nahi ho paya. Node server chalakar dubara try kar.",
        };
        return copy;
      });
    } finally {
      setIsStreaming(false);
    }
  };

  const handleReset = () => {
    if (isStreaming) return;
    setMessages([
      {
        role: "assistant",
        content: "Creating your website... Ready for your next agent prompt.",
      },
    ]);
  };

  return (
    <section
      id="demo"
      className="relative overflow-hidden rounded-3xl border border-zinc-800/80 bg-gradient-to-br from-[#0d0a07] via-[#070b14] to-[#081224] px-5 py-10 sm:px-8 sm:py-12 shadow-2xl"
    >
      <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-12">
        {/* Left Info & CTA Column */}
        <div className="lg:col-span-5 space-y-5">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-500/10 px-3.5 py-1 text-xs font-semibold text-amber-300">
            <Sparkles size={13} />
            <span>Live Demo</span>
          </div>

          <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            Meet Your AI Agent
          </h2>

          <p className="text-sm leading-relaxed text-zinc-300/90">
            Ask anything, get tasks done — from research to code, all in one
            place.
          </p>

          <ul className="space-y-2.5 pt-1">
            {CAPABILITIES.map((cap) => (
              <li
                key={cap}
                className="flex items-center gap-2.5 text-sm font-medium text-zinc-200"
              >
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-amber-500/15 text-amber-400 border border-amber-400/30">
                  <Check size={13} />
                </span>
                <span>{cap}</span>
              </li>
            ))}
          </ul>

          <div className="pt-2">
            <button
              type="button"
              onClick={() => handleRunDemo(prompt)}
              disabled={isStreaming}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 px-5 py-3 text-sm font-bold text-zinc-950 shadow-lg shadow-amber-500/20 transition hover:brightness-110 disabled:opacity-50"
            >
              <span>Try It Now</span>
              <ArrowRight size={15} />
            </button>
          </div>
        </div>

        {/* Right Interactive Workspace Window */}
        <div className="lg:col-span-7 rounded-2xl border border-zinc-800 bg-[#050811]/95 shadow-2xl overflow-hidden">
          {/* Top Window Bar */}
          <div className="flex items-center justify-between border-b border-zinc-800/90 bg-zinc-950/90 px-4 py-2.5">
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-md bg-amber-500/20 text-amber-400">
                <Sparkles size={13} />
              </div>
              <span className="text-xs font-bold text-white">
                Nova<span className="text-amber-400">AI</span> Workspace
              </span>
            </div>

            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center gap-1 rounded-md border border-zinc-800 bg-zinc-900 px-2.5 py-1 text-[11px] text-zinc-300 hover:text-white"
            >
              <RotateCcw size={12} />
              <span>Reset</span>
            </button>
          </div>

          {/* Inner Sidebar + Stream Panel */}
          <div className="grid grid-cols-1 sm:grid-cols-12 min-h-[300px]">
            {/* Mini Workspace Sidebar */}
            <div className="hidden sm:flex sm:col-span-3 flex-col justify-between border-r border-zinc-800/80 bg-zinc-950/60 p-2.5">
              <div className="space-y-1">
                {SIDEBAR_TABS.map((tab) => {
                  const Icon = tab.icon;
                  const active = activeTab === tab.label;
                  return (
                    <button
                      key={tab.label}
                      type="button"
                      onClick={() => setActiveTab(tab.label)}
                      className={
                        active
                          ? "flex w-full items-center gap-2 rounded-lg bg-amber-500/15 px-2.5 py-2 text-xs font-semibold text-amber-300 border border-amber-400/25"
                          : "flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-xs text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200"
                      }
                    >
                      <Icon size={13} />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>

              <div className="rounded-lg border border-zinc-800 bg-zinc-900/70 p-2 text-[10px] text-zinc-400">
                Tab: <span className="text-zinc-200 font-medium">{activeTab}</span>
              </div>
            </div>

            {/* Stream Output & Prompt Input */}
            <div className="sm:col-span-9 flex flex-col justify-between p-3.5 sm:p-4">
              <div className="max-h-52 overflow-y-auto space-y-2.5 pr-1">
                {messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={
                      msg.role === "user"
                        ? "flex items-start justify-end gap-2"
                        : "flex items-start justify-start gap-2"
                    }
                  >
                    {msg.role === "assistant" && (
                      <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-amber-500/15 text-amber-400">
                        <Bot size={13} />
                      </div>
                    )}

                    <div
                      className={
                        msg.role === "user"
                          ? "max-w-[85%] rounded-xl border border-amber-400/30 bg-amber-500/20 px-3 py-2 text-xs font-medium text-amber-100 whitespace-pre-wrap"
                          : "max-w-[85%] rounded-xl border border-zinc-800 bg-zinc-900/90 px-3 py-2 text-xs leading-relaxed text-zinc-200 whitespace-pre-wrap"
                      }
                    >
                      {msg.content || (isStreaming ? "Streaming response..." : "")}
                    </div>

                    {msg.role === "user" && (
                      <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-zinc-800 text-zinc-200">
                        <User size={13} />
                      </div>
                    )}
                  </div>
                ))}
                <div ref={streamEndRef} />
              </div>

              {/* Prompt Input Inside Demo Window */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleRunDemo(prompt);
                }}
                className="mt-3 flex items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-950 p-1.5"
              >
                <input
                  type="text"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Ask your AI agent..."
                  className="flex-1 bg-transparent px-2.5 py-1 text-xs text-white placeholder-zinc-500 focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={isStreaming || !prompt.trim()}
                  className="inline-flex items-center gap-1 rounded-lg bg-gradient-to-r from-amber-400 to-orange-500 px-3 py-1.5 text-xs font-bold text-zinc-950 hover:brightness-110 disabled:opacity-50"
                >
                  <Send size={12} />
                  <span>{isStreaming ? "Running" : "Run"}</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
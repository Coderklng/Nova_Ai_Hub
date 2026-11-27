"use client";

import React, { useState } from "react";
import { Sparkles, Layers, Cpu, ArrowUpRight, Search } from "lucide-react";

type ModelItem = {
  id: string;
  name: string;
  task: string;
  size: string;
  updated: string;
  likes: number;
  summary: string;
  howBuilt: string[];
  hfUrl: string;
};

const MODELS: ModelItem[] = [
  {
    id: "kundli-v2",
    name: "UX4567/Kartik-Kundli-AI-3B-v2.0",
    task: "Text Generation",
    size: "3B",
    updated: "Oct 17",
    likes: 520,
    summary: "Vedic astrology & kundli guidance model tuned for structured chart explanations.",
    howBuilt: [
      "3B parameter base model pe domain-specific astrology Q&A/chart dataset prepare kiya.",
      "QLoRA / LoRA adapters ke saath SFT fine-tuning karke response tone aur accuracy refine ki.",
      "Inference fast aur lightweight rakhne ke liye quantized weights export karke HF pe publish kiya."
    ],
    hfUrl: "https://huggingface.co/UX4567/Kartik-Kundli-AI-3B-v2.0"
  },
  {
    id: "khushi-biz-4bit",
    name: "UX4567/Khushi-Business-AI-4bit",
    task: "Text Generation",
    size: "7B",
    updated: "Oct 17",
    likes: 265,
    summary: "7B business advisory model quantized to 4-bit for practical strategy & Hinglish workflows.",
    howBuilt: [
      "7B model ko business planning, marketing, aur operations prompts pe fine-tune kiya.",
      "4-bit quantization (BitsAndBytes / GGUF workflow) apply karke VRAM/memory footprint kam kiya.",
      "Practical business replies ke liye prompt formatting aur system instructions test karke release kiya."
    ],
    hfUrl: "https://huggingface.co/UX4567/Khushi-Business-AI-4bit"
  },
  {
    id: "crazy-video-v3",
    name: "UX4567/crazy-video-v3.0-2005-full",
    task: "Video / Diffusion Pipeline",
    size: "2B",
    updated: "Oct 6",
    likes: 10,
    summary: "2B video generation workflow iteration focused on creative visual sequences.",
    howBuilt: [
      "Earlier v3 iterations se motion consistency aur prompt adherence ke observations collect kiye.",
      "2B configuration ko creative prompts pe tune aur test karke full release pack kiya."
    ],
    hfUrl: "https://huggingface.co/UX4567/crazy-video-v3.0-2005-full"
  },
  {
    id: "kundli-v3",
    name: "UX4567/Kartik-Kundli-AI-3B-v3.0",
    task: "Text Generation",
    size: "3B",
    updated: "Sep 28",
    likes: 172,
    summary: "Next iteration of the 3B Kundli AI model with improved structure and clarity.",
    howBuilt: [
      "v2.0 ke feedback aur edge cases ke basis pe training examples expand kiye.",
      "Doobara fine-tuning aur evaluation karke v3.0 weights Hugging Face pe update kiye."
    ],
    hfUrl: "https://huggingface.co/UX4567/Kartik-Kundli-AI-3B-v3.0"
  },
  {
    id: "sd-v1-3",
    name: "UX4567/Stable-Diffusion-v1-3.0",
    task: "Text-to-Image",
    size: "0.9B",
    updated: "Sep 27",
    likes: 52,
    summary: "Compact 0.9B text-to-image model tuned for crisp visual generation.",
    howBuilt: [
      "Image-prompt pairs curate karke visual style aur composition ko target kiya.",
      "Diffusion fine-tuning aur sample grid testing ke baad v1-3.0 publish kiya."
    ],
    hfUrl: "https://huggingface.co/UX4567/Stable-Diffusion-v1-3.0"
  },
  {
    id: "mahakal-fusion-v3",
    name: "UX4567/Mahakal-AI-Fusion-v3.0",
    task: "Text Generation",
    size: "3B",
    updated: "Sep 14",
    likes: 11,
    summary: "3B fusion model blending conversational depth with thematic responses.",
    howBuilt: [
      "Multi-style / merged weight approach se 3B model ko expressive responses ke liye train kiya.",
      "Prompt testing ke baad v3.0 checkpoint upload kiya."
    ],
    hfUrl: "https://huggingface.co/UX4567/Mahakal-AI-Fusion-v3.0"
  },
  {
    id: "king-ai-chat-v3",
    name: "UX4567/King-AI-Chat-v3.0",
    task: "Text Generation",
    size: "3B",
    updated: "Sep 10",
    likes: 14,
    summary: "3B conversational chat model refined through iterative prompt/response tuning.",
    howBuilt: [
      "Chat-style multi-turn examples pe instruction tuning ki.",
      "Response flow aur tone check karke v3.0 release kiya."
    ],
    hfUrl: "https://huggingface.co/UX4567/King-AI-Chat-v3.0"
  },
  {
    id: "kartik-ai-chat-v2",
    name: "UX4567/Kartik-Ai-Chat-v2.0",
    task: "Text Generation",
    size: "3B",
    updated: "Sep 4",
    likes: 10,
    summary: "3B assistant chat model built for general everyday queries.",
    howBuilt: [
      "General assistant instructions aur conversational pairs ke saath fine-tune kiya.",
      "v2.0 checkpoint Hugging Face pe host kiya."
    ],
    hfUrl: "https://huggingface.co/UX4567/Kartik-Ai-Chat-v2.0"
  },
  {
    id: "qwen-3b-instruct",
    name: "UX4567/Kartik-Qwen-3B-Instruct",
    task: "Text Generation",
    size: "3B",
    updated: "Sep 2",
    likes: 67,
    summary: "3B Qwen-based instruction model tuned to follow task prompts cleanly.",
    howBuilt: [
      "Qwen 3B base architecture pe instruction-following dataset ke saath SFT kiya.",
      "Task adherence aur formatting test karke publish kiya."
    ],
    hfUrl: "https://huggingface.co/UX4567/Kartik-Qwen-3B-Instruct"
  },
  {
    id: "speak-english-v1",
    name: "UX4567/Speak-English-AI-3B-v1.0",
    task: "Translation / Language",
    size: "0.6B",
    updated: "Sep 1",
    likes: 14,
    summary: "Lightweight 0.6B model focused on English speaking & translation support.",
    howBuilt: [
      "Everyday conversational & translation pairs pe compact 0.6B model fine-tune kiya.",
      "Fast local/edge response ke liye lightweight version publish kiya."
    ],
    hfUrl: "https://huggingface.co/UX4567/Speak-English-AI-3B-v1.0"
  }
];

export default function HuggingFaceModelsPage() {
  const [query, setQuery] = useState("");
  const [selectedTask, setSelectedTask] = useState("All");

  const tasks = ["All", ...Array.from(new Set(MODELS.map((m) => m.task)))];

  const filtered = MODELS.filter((m) => {
    const matchesTask = selectedTask === "All" || m.task === selectedTask;
    const q = query.trim().toLowerCase();
    const matchesQuery =
      !q ||
      m.name.toLowerCase().includes(q) ||
      m.summary.toLowerCase().includes(q) ||
      m.task.toLowerCase().includes(q);
    return matchesTask && matchesQuery;
  });

  return (
    <div className="min-h-screen bg-[#05070d] text-white px-4 py-8 sm:px-8">
      <div className="mx-auto max-w-6xl space-y-8">
        {/* Hero Header */}
        <section className="relative overflow-hidden rounded-3xl border border-zinc-800/90 bg-gradient-to-br from-[#0d0a07] via-[#070b14] to-[#081224] p-6 sm:p-9">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-500/10 px-3.5 py-1 text-xs font-semibold text-amber-300">
            <Sparkles size={13} />
            <span>UX4567 • Hugging Face Model Lab</span>
          </div>

          <h1 className="mt-4 text-3xl sm:text-4xl font-extrabold tracking-tight">
            Open-Source Models &{" "}
            <span className="bg-gradient-to-r from-amber-300 via-amber-400 to-orange-500 bg-clip-text text-transparent">
              How They Were Built
            </span>
          </h1>

          <p className="mt-2 max-w-2xl text-xs sm:text-sm text-zinc-300 leading-relaxed">
            Kartik Sharma (UX4567) ke Hugging Face models ka showcase—har model
            ke peeche ki fine-tuning, quantization, aur iteration process ke
            saath.
          </p>

          <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="rounded-2xl border border-zinc-800 bg-[#050811]/90 p-3.5">
              <div className="text-zinc-400">HF Account</div>
              <div className="mt-1 font-bold text-amber-300">UX4567</div>
            </div>
            <div className="rounded-2xl border border-zinc-800 bg-[#050811]/90 p-3.5">
              <div className="text-zinc-400">Total HF Models</div>
              <div className="mt-1 font-bold text-white">21 (10 Listed Here)</div>
            </div>
            <div className="rounded-2xl border border-zinc-800 bg-[#050811]/90 p-3.5">
              <div className="text-zinc-400">Community Downloads</div>
              <div className="mt-1 font-bold text-white">6.4k+</div>
            </div>
            <div className="rounded-2xl border border-zinc-800 bg-[#050811]/90 p-3.5">
              <div className="text-zinc-400">Core Methods</div>
              <div className="mt-1 font-bold text-white">QLoRA • SFT • Quant</div>
            </div>
          </div>
        </section>

        {/* Search & Filter */}
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          <div className="relative flex-1">
            <Search
              size={15}
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500"
            />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search model by name, task, or use case..."
              className="w-full rounded-xl border border-zinc-800 bg-[#070b14] pl-10 pr-4 py-2.5 text-xs sm:text-sm text-white placeholder-zinc-500 focus:border-amber-400/60 focus:outline-none"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {tasks.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setSelectedTask(t)}
                className={`rounded-xl border px-3 py-2 text-xs font-semibold transition ${
                  selectedTask === t
                    ? "border-amber-400 bg-amber-500/20 text-amber-200"
                    : "border-zinc-800 bg-[#070b14] text-zinc-400 hover:text-white"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Models Grid */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filtered.map((model) => (
            <article
              key={model.id}
              className="rounded-2xl border border-zinc-800/90 bg-[#070b14] p-5 sm:p-6 flex flex-col justify-between space-y-4 hover:border-amber-400/40 transition"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="inline-flex items-center gap-1 rounded-md border border-zinc-800 bg-[#050811] px-2.5 py-0.5 text-[11px] font-semibold text-amber-300">
                      <Cpu size={12} />
                      {model.task} • {model.size}
                    </span>
                    <h2 className="mt-2 text-base sm:text-lg font-bold text-white break-all">
                      {model.name}
                    </h2>
                  </div>

                  <a
                    href={model.hfUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="shrink-0 inline-flex items-center gap-1 rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-xs font-semibold text-zinc-200 hover:border-amber-400/50 hover:text-amber-300"
                  >
                    <span>HF</span>
                    <ArrowUpRight size={14} />
                  </a>
                </div>

                <p className="text-xs sm:text-sm text-zinc-300">{model.summary}</p>

                <div className="rounded-xl border border-zinc-800/80 bg-[#050811] p-3.5 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-300">
                    <Layers size={13} />
                    <span>Kaise Banaya Gaya</span>
                  </div>
                  <ul className="list-disc pl-4 space-y-1 text-xs text-zinc-300">
                    {model.howBuilt.map((step, idx) => (
                      <li key={idx}>{step}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-zinc-800/80 pt-3 text-[11px] text-zinc-400">
                <span>Updated: {model.updated}</span>
                <span>♥ {model.likes}</span>
              </div>
            </article>
          ))}
        </section>
      </div>
    </div>
  );
}
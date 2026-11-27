"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  BookOpen,
  Search,
  ArrowLeft,
  Clock,
  Sparkles,
  ChevronRight,
} from "lucide-react";

interface BlogArticle {
  id: string;
  category: "Engineering" | "Workflows" | "Product";
  title: string;
  excerpt: string;
  readTime: string;
  date: string;
  author: string;
  content: string[];
}

const BLOG_ARTICLES: BlogArticle[] = [
  {
    id: "workflows-without-cors-pain",
    category: "Engineering",
    title: "Fixing CORS & Auth Headers Across Next.js and Node/Mongo APIs",
    excerpt:
      "Bearer token propagation via Authorization header aur clean fetch options se cross-origin requests ko kaise smooth rakhein.",
    readTime: "4 min read",
    date: "Nov 2026",
    author: "Kartik Sharma",
    content: [
      "Jab frontend aur backend alag origins par run karte hain, toh unauthenticated preflight ya cookie mismatches aasani se request block kar dete hain.",
      "localStorage mein stored JWT token ko Authorization: Bearer <token> header mein bhejne aur unnecessary credentials flags hataane se API calls predictable rehti hain.",
      "Saath hi, backend down hone par UI mein local state fallback rakhne se user ka kaam beech mein nahi rukta.",
    ],
  },
  {
    id: "repeatable-agent-pipelines",
    category: "Workflows",
    title: "Turning Ad-Hoc Prompts Into Repeatable Workflow Steps",
    excerpt:
      "Har baar naya prompt likhne ke bajay structured steps, toggles, aur input payloads ke saath pipeline kaise banayein.",
    readTime: "5 min read",
    date: "Nov 2026",
    author: "Kartik Sharma",
    content: [
      "Real operational kaam—jaise lead triage ya release notes—tabhi fast hota hai jab steps clear aur toggleable hon.",
      "Har step ko chhote action aur expected timing ke saath define karne se debugging aur execution tracking dono aasaan ho jaate hain.",
    ],
  },
  {
    id: "multi-pod-workspaces",
    category: "Product",
    title: "Structuring Team Pods With Clear Roles & Guardrails",
    excerpt:
      "Engineering, Product, aur QA teams ko Admin, Builder, aur Viewer roles ke saath kaise organize karein.",
    readTime: "3 min read",
    date: "Oct 2026",
    author: "Kartik Sharma",
    content: [
      "Jab multiple teams ek hi workspace use karti hain, toh role clarity aur pod focus se accidental changes kam hote hain.",
      "Builders workflows aur templates par kaam karte hain, Viewers approved runs inspect karte hain, aur Admins workspace controls sambhalte hain.",
    ],
  },
];

const CATEGORIES: Array<"All" | BlogArticle["category"]> = [
  "All",
  "Engineering",
  "Workflows",
  "Product",
];

export default function BlogPage() {
  const [selectedCategory, setSelectedCategory] =
    useState<"All" | BlogArticle["category"]>("All");
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string>(BLOG_ARTICLES[0].id);

  const filteredPosts = useMemo(() => {
    const q = search.trim().toLowerCase();
    return BLOG_ARTICLES.filter((post) => {
      const matchesCat =
        selectedCategory === "All" || post.category === selectedCategory;
      const matchesQuery =
        !q ||
        post.title.toLowerCase().includes(q) ||
        post.excerpt.toLowerCase().includes(q) ||
        post.content.some((p) => p.toLowerCase().includes(q));
      return matchesCat && matchesQuery;
    });
  }, [selectedCategory, search]);

  const activePost =
    filteredPosts.find((p) => p.id === selectedId) ??
    filteredPosts[0] ??
    BLOG_ARTICLES[0];

  return (
    <div className="min-h-screen bg-[#05070d] text-white">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:py-12 md:px-8 space-y-8">
        {/* Top Nav */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900/80 px-4 py-2 text-xs font-semibold text-zinc-200 transition hover:border-amber-400/50 hover:text-white"
          >
            <ArrowLeft size={14} />
            <span>Back to Home</span>
          </Link>

          <div className="flex items-center gap-2.5">
            <Link
              href="/docs"
              className="rounded-xl border border-zinc-800 bg-zinc-900/80 px-4 py-2 text-xs font-semibold text-zinc-200 transition hover:border-zinc-600 hover:text-white"
            >
              Docs
            </Link>
            <Link
              href="/community"
              className="rounded-xl border border-amber-400/35 bg-amber-500/10 px-4 py-2 text-xs font-semibold text-amber-300 transition hover:bg-amber-500/20"
            >
              Community
            </Link>
          </div>
        </div>

        {/* Hero + Search */}
        <section className="rounded-3xl border border-zinc-800/80 bg-gradient-to-br from-[#0d0a07] via-[#070b14] to-[#081224] px-6 py-10 sm:px-10 shadow-2xl space-y-5">
          <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-500/10 px-3.5 py-1 text-xs font-semibold text-amber-300">
                <Sparkles size={13} />
                <span>NovaAI Journal</span>
              </div>
              <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-5xl">
                Engineering &{" "}
                <span className="bg-gradient-to-r from-amber-300 via-amber-400 to-orange-500 bg-clip-text text-transparent">
                  Builder Notes
                </span>
              </h1>
              <p className="text-xs sm:text-base text-zinc-300/90">
                Architecture notes, workflow patterns, aur practical build guides.
              </p>
            </div>

            <div className="relative w-full sm:w-72">
              <Search
                size={14}
                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500"
              />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search articles..."
                className="h-10 w-full rounded-xl border border-zinc-800 bg-[#050811] pl-9 pr-3 text-xs sm:text-sm text-white placeholder-zinc-500 focus:border-amber-400/60 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => {
              const active = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`rounded-full px-3.5 py-1.5 text-xs font-bold transition ${
                    active
                      ? "bg-gradient-to-r from-amber-400 to-orange-500 text-zinc-950"
                      : "border border-zinc-800 bg-[#050811] text-zinc-400 hover:border-zinc-700 hover:text-white"
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </section>

        {/* Articles List + Reader */}
        <section className="grid grid-cols-1 gap-6 lg:grid-cols-12 items-start">
          <div className="space-y-4 lg:col-span-5">
            {filteredPosts.map((post) => {
              const isSelected = post.id === activePost.id;
              return (
                <button
                  key={post.id}
                  type="button"
                  onClick={() => setSelectedId(post.id)}
                  className={`w-full rounded-2xl border p-5 text-left transition ${
                    isSelected
                      ? "border-amber-400/70 bg-gradient-to-b from-[#171208] to-[#0a0f1c] shadow-lg shadow-amber-500/10"
                      : "border-zinc-800/90 bg-[#0a0f1c]/90 hover:border-zinc-700"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 text-[11px]">
                    <span className="rounded-full border border-amber-400/25 bg-amber-500/10 px-2.5 py-0.5 font-bold text-amber-300">
                      {post.category}
                    </span>
                    <span className="inline-flex items-center gap-1 text-zinc-400">
                      <Clock size={11} />
                      {post.readTime}
                    </span>
                  </div>
                  <h2 className="mt-3 text-base font-bold text-white">
                    {post.title}
                  </h2>
                  <p className="mt-1.5 text-xs leading-relaxed text-zinc-400">
                    {post.excerpt}
                  </p>
                  <div className="mt-3 flex items-center justify-between text-[11px] text-zinc-500">
                    <span>
                      {post.author} • {post.date}
                    </span>
                    <span className="inline-flex items-center gap-0.5 font-semibold text-amber-300">
                      Read <ChevronRight size={12} />
                    </span>
                  </div>
                </button>
              );
            })}

            {filteredPosts.length === 0 && (
              <div className="rounded-2xl border border-zinc-800 bg-[#0a0f1c] p-6 text-xs text-zinc-400">
                Koi article match nahi hua.
              </div>
            )}
          </div>

          <article className="lg:col-span-7 rounded-3xl border border-zinc-800/90 bg-[#070b14] p-6 sm:p-8 space-y-5 shadow-xl">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-sky-400/30 bg-sky-500/10 px-3 py-0.5 font-semibold text-sky-300">
                <BookOpen size={12} />
                {activePost.category}
              </span>
              <span className="text-zinc-400">{activePost.date}</span>
              <span className="text-zinc-500">•</span>
              <span className="text-zinc-400">{activePost.readTime}</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight">
              {activePost.title}
            </h2>

            <p className="text-xs sm:text-sm font-medium text-amber-200/90 border-l-2 border-amber-400 pl-3.5">
              {activePost.excerpt}
            </p>

            <div className="space-y-4 border-t border-zinc-800/80 pt-5 text-xs sm:text-sm leading-relaxed text-zinc-300">
              {activePost.content.map((para, idx) => (
                <p key={idx}>{para}</p>
              ))}
            </div>
          </article>
        </section>
      </div>
    </div>
  );
}
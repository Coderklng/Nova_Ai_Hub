"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Users,
  MessageSquare,
  Hash,
  ExternalLink,
  Copy,
  Check,
  Send,
  Sparkles,
  Flame,
  Pin,
  Search,
} from "lucide-react";

interface CommunityPost {
  id: string;
  channel: string;
  author: string;
  roleTag: string;
  timeAgo: string;
  title: string;
  body: string;
  replies: number;
  upvotes: number;
  pinned?: boolean;
}

const BACKEND_URL = (
  process.env.NEXT_PUBLIC_BACKEND_URL || "https://nova-backend-77e0.onrender.com"
).replace(/\/+$/, "");

const DISCORD_INVITE_URL = "https://discord.com";

const CHANNELS = [
  {
    id: "all",
    name: "All Channels",
    description: "Everything happening across the community",
  },
  {
    id: "general",
    name: "general",
    description: "Daily builds, wins, and quick questions",
  },
  {
    id: "workflows-and-agents",
    name: "workflows-and-agents",
    description: "Pipelines, prompts, and agent setups",
  },
  {
    id: "ui-and-nextjs",
    name: "ui-and-nextjs",
    description: "App Router layouts, Tailwind, and polish",
  },
  {
    id: "bug-fixes",
    name: "bug-fixes",
    description: "CORS, auth headers, and runtime fixes",
  },
];

const INITIAL_POSTS: CommunityPost[] = [
  {
    id: "post-1",
    channel: "ui-and-nextjs",
    author: "Kartik",
    roleTag: "Builder",
    timeAgo: "2h ago",
    title: "Keeping NovaAI routes clean with consistent dark UI & local fallbacks",
    body: "All major modules—Workflows, Enterprise Teams, Docs, and Community—stay responsive even when an optional endpoint is offline.",
    replies: 12,
    upvotes: 34,
    pinned: true,
  },
  {
    id: "post-2",
    channel: "bug-fixes",
    author: "Rohan",
    roleTag: "Contributor",
    timeAgo: "5h ago",
    title: "Using Authorization: Bearer <token> without credentials: 'include'",
    body: "Passing the token from localStorage in the Authorization header avoids unnecessary cookie/CORS friction on cross-origin APIs.",
    replies: 8,
    upvotes: 25,
  },
  {
    id: "post-3",
    channel: "workflows-and-agents",
    author: "Ananya",
    roleTag: "AI Tinkerer",
    timeAgo: "1d ago",
    title: "Structuring multi-step workflows with toggleable pipeline steps",
    body: "Breaking a workflow into small steps with clear inputs and logs makes testing and iteration much easier.",
    replies: 15,
    upvotes: 41,
  },
];

function getStoredAuthToken(): string {
  if (typeof window === "undefined") return "";
  const keys = ["novaai_token", "novaai_session", "nova_token", "token", "accessToken", "jwt"];
  for (const key of keys) {
    const raw = window.localStorage.getItem(key);
    if (!raw) continue;
    try {
      const parsed = JSON.parse(raw);
      if (typeof parsed === "string" && parsed.trim()) return parsed.trim();
      if (parsed?.token) return String(parsed.token).trim();
    } catch {
      const cleaned = raw.replace(/^"+|"+$/g, "").trim();
      if (cleaned) return cleaned;
    }
  }
  return "";
}

export default function CommunityPage() {
  const [selectedChannel, setSelectedChannel] = useState<string>("all");
  const [search, setSearch] = useState<string>("");
  const [posts, setPosts] = useState<CommunityPost[]>(INITIAL_POSTS);
  const [likedIds, setLikedIds] = useState<Record<string, boolean>>({});
  const [copiedInvite, setCopiedInvite] = useState<boolean>(false);

  const [newTitle, setNewTitle] = useState<string>("");
  const [newChannel, setNewChannel] = useState<string>("general");
  const [newBody, setNewBody] = useState<string>("");

  const handleCopyInvite = async () => {
    try {
      await navigator.clipboard.writeText(DISCORD_INVITE_URL);
      setCopiedInvite(true);
      setTimeout(() => setCopiedInvite(false), 1600);
    } catch {
      // Ignore clipboard error
    }
  };

  const toggleUpvote = (id: string) => {
    const alreadyLiked = Boolean(likedIds[id]);
    setLikedIds((prev) => ({ ...prev, [id]: !alreadyLiked }));
    setPosts((prev) =>
      prev.map((p) =>
        p.id === id
          ? { ...p, upvotes: alreadyLiked ? p.upvotes - 1 : p.upvotes + 1 }
          : p
      )
    );
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    const title = newTitle.trim();
    const body = newBody.trim();
    if (!title || !body) return;

    const created: CommunityPost = {
      id: `post-${Date.now()}`,
      channel: newChannel,
      author: "Kartik",
      roleTag: "Builder",
      timeAgo: "Just now",
      title,
      body,
      replies: 0,
      upvotes: 1,
    };

    setPosts((prev) => [created, ...prev]);
    setLikedIds((prev) => ({ ...prev, [created.id]: true }));
    setNewTitle("");
    setNewBody("");

    if (selectedChannel !== "all" && selectedChannel !== newChannel) {
      setSelectedChannel(newChannel);
    }

    const token = getStoredAuthToken();
    try {
      await fetch(`${BACKEND_URL}/api/conversations`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          type: "community_thread",
          channel: newChannel,
          title,
          body,
        }),
      });
    } catch {
      // Local post already added
    }
  };

  const visiblePosts = useMemo(() => {
    const q = search.trim().toLowerCase();
    return posts.filter((post) => {
      const matchesChannel =
        selectedChannel === "all" || post.channel === selectedChannel;
      const matchesQuery =
        !q ||
        post.title.toLowerCase().includes(q) ||
        post.body.toLowerCase().includes(q) ||
        post.author.toLowerCase().includes(q) ||
        post.channel.toLowerCase().includes(q);
      return matchesChannel && matchesQuery;
    });
  }, [posts, selectedChannel, search]);

  return (
    <div className="min-h-screen bg-[#05070d] text-zinc-100 [color-scheme:dark]">
      {/* Top Bar */}
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-3 border-b border-zinc-800/90 bg-[#05070d]/95 px-4 backdrop-blur sm:px-6">
        <div className="flex items-center gap-2.5 min-w-0">
          <Link
            href="/"
            aria-label="Back to Home"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900 text-zinc-200 transition hover:border-amber-400/60 hover:text-amber-300"
          >
            <ArrowLeft size={15} />
          </Link>

          <div className="flex items-center gap-2 min-w-0">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-amber-400/35 bg-amber-400/10 text-amber-300">
              <Users size={14} />
            </span>
            <span className="truncate text-sm font-bold tracking-tight text-white">
              Community & Discord
            </span>
            <span className="hidden rounded-full border border-sky-400/30 bg-sky-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-sky-300 sm:inline">
              Live Hub
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative hidden w-56 md:block">
            <Search
              size={14}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search discussions..."
              className="h-8 w-full rounded-xl border border-zinc-800 bg-zinc-900 pl-8 pr-3 text-xs text-zinc-100 placeholder-zinc-500 focus:border-amber-400/60 focus:outline-none"
            />
          </div>

          <a
            href={DISCORD_INVITE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500 px-3 py-1.5 text-xs font-extrabold text-zinc-950 shadow-md shadow-amber-500/20 transition hover:brightness-110"
          >
            <span>Join Discord</span>
            <ExternalLink size={13} />
          </a>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-7 sm:px-6">
        {/* Banner */}
        <section className="mb-7 rounded-2xl border border-zinc-800 bg-gradient-to-r from-[#0d0a07] via-[#0a0f1c] to-[#081224] p-5 sm:p-6">
          <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/35 bg-amber-400/10 px-3 py-0.5 text-[11px] font-bold text-amber-300">
                <Sparkles size={12} />
                <span>NovaAI Builders Hub</span>
              </div>
              <h1 className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
                Build, debug, and ship{" "}
                <span className="bg-gradient-to-r from-amber-300 via-amber-400 to-sky-400 bg-clip-text text-transparent">
                  together
                </span>
              </h1>
              <p className="max-w-2xl text-xs leading-relaxed text-zinc-400 sm:text-sm">
                Share workflows, UI updates, aur troubleshooting tips with other
                builders.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 shrink-0">
              <button
                type="button"
                onClick={handleCopyInvite}
                className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-700 bg-zinc-950 px-3.5 py-2 text-xs font-semibold text-zinc-200 transition hover:border-sky-400/50 hover:text-sky-300"
              >
                {copiedInvite ? (
                  <>
                    <Check size={14} className="text-emerald-400" />
                    <span className="text-emerald-300">Invite Copied</span>
                  </>
                ) : (
                  <>
                    <Copy size={14} />
                    <span>Copy Invite Link</span>
                  </>
                )}
              </button>

              <a
                href={DISCORD_INVITE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 px-4 py-2 text-xs font-extrabold text-zinc-950 transition hover:brightness-110"
              >
                <span>Open Discord</span>
                <ExternalLink size={14} />
              </a>
            </div>
          </div>
        </section>

        {/* 3-Column Layout */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Channels */}
          <aside className="space-y-2 lg:col-span-3">
            <p className="px-2 text-[11px] font-bold uppercase tracking-wider text-zinc-500">
              Channels
            </p>
            <div className="flex gap-1.5 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible">
              {CHANNELS.map((ch) => {
                const active = selectedChannel === ch.id;
                return (
                  <button
                    key={ch.id}
                    type="button"
                    onClick={() => setSelectedChannel(ch.id)}
                    className={`flex shrink-0 flex-col rounded-xl border px-3 py-2 text-left transition lg:shrink ${
                      active
                        ? "border-amber-400/50 bg-gradient-to-r from-amber-500/15 to-sky-500/10 text-amber-200"
                        : "border-zinc-800/80 bg-[#0a0f1c] text-zinc-400 hover:border-zinc-700 hover:text-zinc-100"
                    }`}
                  >
                    <span className="flex items-center gap-1.5 text-xs font-bold">
                      <Hash size={13} className="text-amber-400" />
                      <span>{ch.name}</span>
                    </span>
                    <span className="mt-0.5 hidden text-[11px] text-zinc-400 lg:block">
                      {ch.description}
                    </span>
                  </button>
                );
              })}
            </div>
          </aside>

          {/* Feed */}
          <main className="space-y-4 lg:col-span-6">
            <div className="md:hidden">
              <div className="relative">
                <Search
                  size={14}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500"
                />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search discussions..."
                  className="h-9 w-full rounded-xl border border-zinc-800 bg-[#0a0f1c] pl-8 pr-3 text-xs text-zinc-100 placeholder-zinc-500 focus:border-amber-400/60 focus:outline-none"
                />
              </div>
            </div>

            {visiblePosts.map((post) => {
              const liked = Boolean(likedIds[post.id]);
              return (
                <article
                  key={post.id}
                  className="space-y-3 rounded-2xl border border-zinc-800 bg-[#0a0f1c] p-4 transition hover:border-zinc-700"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 text-[11px]">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1 rounded-md border border-sky-400/30 bg-sky-500/10 px-2 py-0.5 font-semibold text-sky-300">
                        <Hash size={11} />
                        {post.channel}
                      </span>
                      <span className="font-semibold text-zinc-200">
                        {post.author}
                      </span>
                      <span className="rounded-full border border-zinc-800 bg-zinc-950 px-2 py-0.5 text-[10px] text-amber-300">
                        {post.roleTag}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-zinc-500">
                      {post.pinned && (
                        <span className="inline-flex items-center gap-1 text-amber-400">
                          <Pin size={11} />
                          Pinned
                        </span>
                      )}
                      <span>{post.timeAgo}</span>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <h2 className="text-sm font-bold text-white sm:text-base">
                      {post.title}
                    </h2>
                    <p className="text-xs leading-relaxed text-zinc-300 sm:text-sm">
                      {post.body}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 border-t border-zinc-800/80 pt-2.5 text-xs">
                    <button
                      type="button"
                      onClick={() => toggleUpvote(post.id)}
                      className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 font-semibold transition ${
                        liked
                          ? "border-amber-400/50 bg-amber-400/15 text-amber-300"
                          : "border-zinc-800 bg-zinc-950 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200"
                      }`}
                    >
                      <Flame size={13} />
                      <span>{post.upvotes}</span>
                    </button>

                    <span className="inline-flex items-center gap-1.5 text-zinc-400">
                      <MessageSquare size={13} className="text-sky-400" />
                      <span>{post.replies} replies</span>
                    </span>
                  </div>
                </article>
              );
            })}

            {visiblePosts.length === 0 && (
              <div className="rounded-2xl border border-zinc-800 bg-[#0a0f1c] p-6 text-center text-xs text-zinc-400">
                Is channel ya search filter mein koi post nahi mili.
              </div>
            )}
          </main>

          {/* Composer & Rules */}
          <aside className="space-y-5 lg:col-span-3">
            <form
              onSubmit={handleCreatePost}
              className="space-y-3 rounded-2xl border border-zinc-800 bg-[#0a0f1c] p-4"
            >
              <h2 className="text-xs font-extrabold uppercase tracking-wider text-amber-300">
                Start a Thread
              </h2>

              <select
                value={newChannel}
                onChange={(e) => setNewChannel(e.target.value)}
                aria-label="Select channel"
                className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs text-zinc-200 focus:border-amber-400/60 focus:outline-none"
              >
                {CHANNELS.filter((c) => c.id !== "all").map((c) => (
                  <option key={c.id} value={c.id}>
                    #{c.name}
                  </option>
                ))}
              </select>

              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Thread title..."
                className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs text-zinc-100 placeholder-zinc-500 focus:border-amber-400/60 focus:outline-none"
              />

              <textarea
                rows={3}
                value={newBody}
                onChange={(e) => setNewBody(e.target.value)}
                placeholder="Share what you're working on or ask a question..."
                className="w-full resize-none rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs text-zinc-100 placeholder-zinc-500 focus:border-amber-400/60 focus:outline-none"
              />

              <button
                type="submit"
                disabled={!newTitle.trim() || !newBody.trim()}
                className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 px-3 py-2 text-xs font-extrabold text-zinc-950 transition hover:brightness-110 disabled:bg-zinc-800 disabled:from-zinc-800 disabled:to-zinc-800 disabled:text-zinc-500"
              >
                <Send size={13} />
                <span>Post Thread</span>
              </button>
            </form>

            <div className="space-y-2.5 rounded-2xl border border-zinc-800 bg-[#0a0f1c] p-4 text-xs">
              <h3 className="font-bold text-white">Community Guidelines</h3>
              <ul className="space-y-1.5 text-zinc-400">
                <li>• Keep questions clear—include stack, error, and goal.</li>
                <li>• Share working fixes and templates in the right channel.</li>
                <li>• Keep discussions helpful and on-topic.</li>
              </ul>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
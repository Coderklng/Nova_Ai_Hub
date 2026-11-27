"use client";

import React, { useState, useMemo, useEffect, useCallback } from "react";
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

export interface CommunityPost {
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

interface CommunityDiscordPageProps {
  onBackHome?: () => void;
  discordInviteUrl?: string;
}

const BACKEND_URL = (
  process.env.NEXT_PUBLIC_BACKEND_URL || "https://nova-backend-77e0.onrender.com"
).replace(/\/+$/, "");

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
    id: "models-and-weights",
    name: "models-and-weights",
    description: "Fine-tunes, quantization, and inference notes",
  },
  {
    id: "ui-and-nextjs",
    name: "ui-and-nextjs",
    description: "App Router layouts, Tailwind v4, and PWA polish",
  },
  {
    id: "bug-fixes",
    name: "bug-fixes",
    description: "Config clashes, hydration issues, and fixes",
  },
];

const INITIAL_POSTS: CommunityPost[] = [
  {
    id: "post-1",
    channel: "ui-and-nextjs",
    author: "Kartik",
    roleTag: "Builder",
    timeAgo: "2h ago",
    title: "Keeping NovaAI workspace clean with exit navigation & single-column scroll",
    body: "Added a crisp back arrow in the chat top bar and sidebar footer, plus bounded scroll inside the message stream so the outer shell stays locked.",
    replies: 14,
    upvotes: 38,
    pinned: true,
  },
  {
    id: "post-2",
    channel: "bug-fixes",
    author: "Rohan",
    roleTag: "Contributor",
    timeAgo: "5h ago",
    title: "Quick tip when manifest icons throw 404 on localhost",
    body: "Check that public/icons/icon-192.png and public/icons/icon-512.png actually exist and do a hard refresh in DevTools -> Application -> Manifest.",
    replies: 9,
    upvotes: 27,
  },
  {
    id: "post-3",
    channel: "models-and-weights",
    author: "Ananya",
    roleTag: "AI Tinkerer",
    timeAgo: "1d ago",
    title: "Comparing fast routing vs dedicated local/hub models in agent mode",
    body: "Switching between auto routing and specific task models per mode keeps quick UI prompts snappy while reserving heavier models for deeper synthesis.",
    replies: 19,
    upvotes: 52,
  },
  {
    id: "post-4",
    channel: "general",
    author: "Devansh",
    roleTag: "Member",
    timeAgo: "2d ago",
    title: "What are you shipping this week with NovaAI?",
    body: "Drop your current UI screen, agent template, or workflow idea below—feedback and pairing happen daily in Discord.",
    replies: 23,
    upvotes: 44,
  },
];

function getStoredAuthToken(): string {
  if (typeof window === "undefined") return "";

  const candidateKeys = [
    "novaai_token",
    "novaai_session",
    "nova_token",
    "token",
    "accessToken",
    "jwt",
    "user",
  ];

  for (const key of candidateKeys) {
    const raw = window.localStorage.getItem(key);
    if (!raw) continue;

    try {
      const parsed = JSON.parse(raw);
      if (typeof parsed === "string" && parsed.trim()) return parsed.trim();
      if (parsed && typeof parsed === "object") {
        const nested =
          parsed.token ||
          parsed.accessToken ||
          parsed.jwt ||
          parsed.data?.token ||
          parsed.data?.accessToken ||
          parsed.user?.token;
        if (typeof nested === "string" && nested.trim()) return nested.trim();
      }
    } catch {
      const cleaned = raw.replace(/^"+|"+$/g, "").trim();
      if (cleaned) return cleaned;
    }
  }

  return "";
}

function getAuthHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  const token = getStoredAuthToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
}

export default function CommunityDiscordPage({
  onBackHome,
  discordInviteUrl = "https://discord.com",
}: CommunityDiscordPageProps) {
  const [selectedChannel, setSelectedChannel] = useState<string>("all");
  const [search, setSearch] = useState<string>("");
  const [posts, setPosts] = useState<CommunityPost[]>(INITIAL_POSTS);
  const [likedIds, setLikedIds] = useState<Record<string, boolean>>({});
  const [copiedInvite, setCopiedInvite] = useState<boolean>(false);
  const [syncBadge, setSyncBadge] = useState<string>("Live Hub");

  const [newTitle, setNewTitle] = useState<string>("");
  const [newChannel, setNewChannel] = useState<string>("general");
  const [newBody, setNewBody] = useState<string>("");

  const loadCommunityThreads = useCallback(async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/conversations`, {
        method: "GET",
        headers: getAuthHeaders(),
      });
      if (!res.ok) return;

      const json = await res.json().catch(() => ({}));
      const list = Array.isArray(json?.data)
        ? json.data
        : Array.isArray(json?.conversations)
          ? json.conversations
          : [];

      const communityItems = list.filter(
        (item: any) =>
          item?.type === "community_thread" || item?.channel || item?.title
      );

      if (communityItems.length > 0) {
        const mapped: CommunityPost[] = communityItems.map(
          (item: any, idx: number) => ({
            id: String(item?._id || item?.id || `remote-post-${idx}`),
            channel: String(item?.channel || "general"),
            author: String(item?.author || "Kartik"),
            roleTag: String(item?.roleTag || "Builder"),
            timeAgo: "Synced",
            title: String(item?.title || "Community Thread"),
            body: String(item?.body || item?.summary || ""),
            replies: Number(item?.replies || 0),
            upvotes: Number(item?.upvotes || 1),
          })
        );

        setPosts((prev) => {
          const seen = new Set(prev.map((p) => p.title));
          const unique = mapped.filter((m) => !seen.has(m.title));
          return [...unique, ...prev];
        });
        setSyncBadge("Synced");
      }
    } catch {
      // Keep INITIAL_POSTS if backend route isn't populated
    }
  }, []);

  useEffect(() => {
    loadCommunityThreads();
  }, [loadCommunityThreads]);

  const handleExit = () => {
    if (typeof onBackHome === "function") {
      onBackHome();
    } else if (typeof window !== "undefined") {
      window.history.back();
    }
  };

  const handleCopyInvite = async () => {
    try {
      await navigator.clipboard.writeText(discordInviteUrl);
      setCopiedInvite(true);
      setTimeout(() => setCopiedInvite(false), 1600);
    } catch {
      // Ignore clipboard error
    }
  };

  const toggleUpvote = async (id: string) => {
    const alreadyLiked = Boolean(likedIds[id]);
    const nextUpvotes = (() => {
      const target = posts.find((p) => p.id === id);
      if (!target) return 1;
      return alreadyLiked ? target.upvotes - 1 : target.upvotes + 1;
    })();

    setLikedIds((prev) => ({ ...prev, [id]: !alreadyLiked }));
    setPosts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, upvotes: nextUpvotes } : p))
    );

    try {
      await fetch(`${BACKEND_URL}/api/conversations/${id}`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify({ upvotes: nextUpvotes }),
      });
    } catch {
      // Optimistic UI state already updated
    }
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

    try {
      const res = await fetch(`${BACKEND_URL}/api/conversations`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          type: "community_thread",
          channel: newChannel,
          author: "Kartik",
          roleTag: "Builder",
          title,
          body,
          upvotes: 1,
        }),
      });
      if (res.ok) {
        const data = await res.json().catch(() => ({}));
        const savedId = data?.data?._id || data?.data?.id;
        if (savedId) {
          setPosts((prev) =>
            prev.map((p) =>
              p.id === created.id ? { ...p, id: String(savedId) } : p
            )
          );
        }
        setSyncBadge("Saved to DB");
      }
    } catch {
      setSyncBadge("Posted locally");
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
    <div className="min-h-screen bg-zinc-950 text-zinc-100 [color-scheme:dark]">
      {/* Top Bar */}
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-3 border-b border-zinc-800/90 bg-zinc-950/95 px-4 backdrop-blur sm:px-6">
        <div className="flex items-center gap-2.5 min-w-0">
          <button
            type="button"
            onClick={handleExit}
            aria-label="Go back"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900 text-zinc-200 transition hover:border-amber-400/60 hover:text-amber-300"
          >
            <ArrowLeft size={15} />
          </button>

          <div className="flex items-center gap-2 min-w-0">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-amber-400/35 bg-amber-400/10 text-amber-300">
              <Users size={14} />
            </span>
            <span className="truncate text-sm font-bold tracking-tight text-white">
              Community & Discord
            </span>
            <span className="hidden rounded-full border border-sky-400/30 bg-sky-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-sky-300 sm:inline">
              {syncBadge}
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
            href={discordInviteUrl}
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
        {/* Discord Banner Card */}
        <section className="mb-7 rounded-2xl border border-zinc-800 bg-gradient-to-r from-zinc-900 via-zinc-900/95 to-sky-950/30 p-5 sm:p-6">
          <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/35 bg-amber-400/10 px-3 py-0.5 text-[11px] font-bold text-amber-300">
                <Sparkles size={12} />
                <span>NovaAI Builders Server</span>
              </div>
              <h1 className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
                Build, debug, and ship{" "}
                <span className="bg-gradient-to-r from-amber-300 via-amber-400 to-sky-400 bg-clip-text text-transparent">
                  together
                </span>
              </h1>
              <p className="max-w-2xl text-xs leading-relaxed text-zinc-400 sm:text-sm">
                Share agent workflows, UI screens, model experiments, and quick
                fixes with fellow builders—both here on the board and in the
                Discord server.
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
                href={discordInviteUrl}
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

        {/* Main 3-Column Layout: Channels | Discussion Feed | New Post & Server Info */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Left Channels Rail */}
          <aside className="space-y-2 lg:col-span-3">
            <p className="px-2 text-[11px] font-bold uppercase tracking-wider text-zinc-500">
              Channels
            </p>
            <div className="flex gap-1.5 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible [scrollbar-width:none]">
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
                        : "border-zinc-800/80 bg-zinc-900/60 text-zinc-400 hover:border-zinc-700 hover:bg-zinc-900 hover:text-zinc-100"
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

          {/* Center Threads Feed */}
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
                  className="h-9 w-full rounded-xl border border-zinc-800 bg-zinc-900 pl-8 pr-3 text-xs text-zinc-100 placeholder-zinc-500 focus:border-amber-400/60 focus:outline-none"
                />
              </div>
            </div>

            {visiblePosts.map((post) => {
              const liked = Boolean(likedIds[post.id]);
              return (
                <article
                  key={post.id}
                  className="space-y-3 rounded-2xl border border-zinc-800 bg-zinc-900/75 p-4 transition hover:border-zinc-700"
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
              <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 text-center text-xs text-zinc-400">
                Is channel ya search filter mein koi post nahi mili.
              </div>
            )}
          </main>

          {/* Right Composer & Server Highlights */}
          <aside className="space-y-5 lg:col-span-3">
            <form
              onSubmit={handleCreatePost}
              className="space-y-3 rounded-2xl border border-zinc-800 bg-zinc-900/85 p-4"
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

            <div className="space-y-2.5 rounded-2xl border border-zinc-800 bg-zinc-900/70 p-4 text-xs">
              <h3 className="font-bold text-white">Discord Rules</h3>
              <ul className="space-y-1.5 text-zinc-400">
                <li>• Keep questions specific—include stack, error, and goal.</li>
                <li>• Share working fixes and templates in the right channel.</li>
                <li>• Stay helpful, respectful, and spam-free.</li>
              </ul>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
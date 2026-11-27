"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Users,
  ShieldCheck,
  UserPlus,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  Trash2,
} from "lucide-react";

type TeamRole = "Admin" | "Builder" | "Viewer";

interface TeamMember {
  id: string;
  name: string;
  email: string;
  pod: string;
  role: TeamRole;
}

interface TeamPod {
  id: string;
  name: string;
  focus: string;
  activeAgents: number;
  summary: string;
}

const BACKEND_URL = (
  process.env.NEXT_PUBLIC_BACKEND_URL || "https://nova-backend-77e0.onrender.com"
).replace(/\/+$/, "");

const TEAM_PODS: TeamPod[] = [
  {
    id: "pod-eng",
    name: "Core Engineering Pod",
    focus: "Code, Workflows & Reliability",
    activeAgents: 6,
    summary:
      "Shared prompts, code reviews, aur automated release pipelines ke liye dedicated workspace.",
  },
  {
    id: "pod-growth",
    name: "Product & Ops Pod",
    focus: "Research, Triage & Briefs",
    activeAgents: 4,
    summary:
      "Client inquiries, competitive research, aur daily execution digests ko standardize karta hai.",
  },
  {
    id: "pod-security",
    name: "Governance & QA Pod",
    focus: "Access Controls & Review Rules",
    activeAgents: 3,
    summary:
      "Role access, prompt standards, aur team rollout checks ko centralized rakhta hai.",
  },
];

const INITIAL_MEMBERS: TeamMember[] = [
  {
    id: "m-1",
    name: "Rohan Verma",
    email: "rohan@novaai.dev",
    pod: "Core Engineering Pod",
    role: "Admin",
  },
  {
    id: "m-2",
    name: "Ananya Nair",
    email: "ananya@novaai.dev",
    pod: "Product & Ops Pod",
    role: "Builder",
  },
  {
    id: "m-3",
    name: "Devansh Joshi",
    email: "devansh@novaai.dev",
    pod: "Governance & QA Pod",
    role: "Viewer",
  },
];

const ROLE_PERKS: Record<TeamRole, string[]> = {
  Admin: [
    "Manage team members, roles & pod settings",
    "Configure shared agent templates & guardrails",
    "Access workspace-wide usage overview",
  ],
  Builder: [
    "Create & run autonomous agent sessions",
    "Edit workflows, prompts & studio presets",
    "Share outputs across team pods",
  ],
  Viewer: [
    "Browse shared threads, reports & runs",
    "Run approved quick prompts & searches",
    "Read-only access to team templates",
  ],
};

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

export default function EnterpriseTeamsPage() {
  const [selectedPodId, setSelectedPodId] = useState<string>(TEAM_PODS[0].id);
  const [members, setMembers] = useState<TeamMember[]>(INITIAL_MEMBERS);
  const [inviteName, setInviteName] = useState<string>("");
  const [inviteEmail, setInviteEmail] = useState<string>("");
  const [inviteRole, setInviteRole] = useState<TeamRole>("Builder");
  const [selectedRoleInfo, setSelectedRoleInfo] = useState<TeamRole>("Admin");
  const [notice, setNotice] = useState<string>("");
  const [syncState, setSyncState] = useState<string>("Ready");

  const activePod =
    TEAM_PODS.find((p) => p.id === selectedPodId) ?? TEAM_PODS[0];

  const loadMembersFromBackend = useCallback(async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/team-members`, {
        method: "GET",
        headers: getAuthHeaders(),
      });
      if (!res.ok) return;

      const json = await res.json().catch(() => ({}));
      const list = Array.isArray(json?.data)
        ? json.data
        : Array.isArray(json)
          ? json
          : [];

      if (list.length > 0) {
        const mapped: TeamMember[] = list.map((item: any, idx: number) => ({
          id: String(item._id || item.id || `mem-${idx}`),
          name: item.name || "Team Member",
          email: item.email || "",
          pod: item.pod || TEAM_PODS[0].name,
          role: (["Admin", "Builder", "Viewer"].includes(item.role)
            ? item.role
            : "Builder") as TeamRole,
        }));
        setMembers(mapped);
        setSyncState("Synced with backend");
      }
    } catch {
      // Fallback to initial roster if custom endpoint is not mounted yet
    }
  }, []);

  useEffect(() => {
    loadMembersFromBackend();
  }, [loadMembersFromBackend]);

  const syncTeamAction = async (
    action: "add" | "role" | "remove",
    payload: Record<string, unknown>
  ) => {
    try {
      const backendRes = await fetch(
        action === "add"
          ? `${BACKEND_URL}/api/team-members`
          : action === "role"
            ? `${BACKEND_URL}/api/team-members/${payload.id}`
            : `${BACKEND_URL}/api/team-members/${payload.id}`,
        {
          method: action === "add" ? "POST" : action === "role" ? "PUT" : "DELETE",
          headers: getAuthHeaders(),
          body: action === "remove" ? undefined : JSON.stringify(payload),
        }
      );

      if (backendRes.ok) {
        const data = await backendRes.json().catch(() => ({}));
        const savedId = data?.data?._id || data?.data?.id;
        if (action === "add" && savedId && payload.tempId) {
          setMembers((prev) =>
            prev.map((m) =>
              m.id === payload.tempId ? { ...m, id: String(savedId) } : m
            )
          );
        }
        setSyncState("Synced with backend");
        return;
      }
    } catch {
      // Move to local/Next route fallback
    }

    if (action === "add") {
      try {
        await fetch("/api/enterprise/team", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action, ...payload }),
        });
        setSyncState("Saved via app route");
      } catch {
        setSyncState("Saved locally");
      }
    } else {
      setSyncState("Updated locally");
    }
  };

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = inviteName.trim();
    const cleanEmail = inviteEmail.trim();
    if (!cleanName || !cleanEmail) return;

    const tempId = `mem-${Date.now()}`;
    const newMember: TeamMember = {
      id: tempId,
      name: cleanName,
      email: cleanEmail,
      pod: activePod.name,
      role: inviteRole,
    };

    setMembers((prev) => [newMember, ...prev]);
    setInviteName("");
    setInviteEmail("");
    setNotice(`${cleanName} (${inviteRole}) added to ${activePod.name}.`);

    await syncTeamAction("add", {
      tempId,
      name: cleanName,
      email: cleanEmail,
      pod: activePod.name,
      role: inviteRole,
    });
  };

  const handleRoleChange = async (id: string, nextRole: TeamRole) => {
    setMembers((prev) =>
      prev.map((m) => (m.id === id ? { ...m, role: nextRole } : m))
    );
    await syncTeamAction("role", { id, role: nextRole });
  };

  const handleRemoveMember = async (id: string) => {
    if (members.length <= 1) return;
    setMembers((prev) => prev.filter((m) => m.id !== id));
    await syncTeamAction("remove", { id });
  };

  return (
    <div className="min-h-screen bg-[#05070d] text-white">
      <div className="mx-auto max-w-7xl px-4 py-7 sm:py-10 md:px-8 space-y-10">
        {/* Top Nav Strip */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link
            href="/enterprise"
            className="inline-flex items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900/80 px-3.5 py-2 text-xs font-semibold text-zinc-200 transition hover:border-amber-400/50 hover:text-white"
          >
            <span>←</span>
            <span>Enterprise Overview</span>
          </Link>

          <div className="flex items-center gap-2">
            <span className="rounded-xl border border-zinc-800 bg-[#070b14] px-3 py-2 text-[11px] font-semibold text-zinc-300">
              {syncState}
            </span>
           
            <Link
              href="/enterprise#enterprise-form"
              className="inline-flex items-center gap-1 rounded-xl border border-amber-400/35 bg-amber-500/10 px-3.5 py-2 text-xs font-semibold text-amber-300 transition hover:bg-amber-500/20"
            >
              <span>Talk to Sales</span>
              <ArrowRight size={13} />
            </Link>
          </div>
        </div>

        {/* Hero Section */}
        <section className="relative overflow-hidden rounded-3xl border border-zinc-800/80 bg-gradient-to-br from-[#0d0a07] via-[#070b14] to-[#081224] p-6 sm:p-10 md:p-12 shadow-2xl">
          <div className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-amber-500/15 blur-3xl" />
          <div className="pointer-events-none absolute -left-24 -bottom-24 h-80 w-80 rounded-full bg-blue-600/15 blur-3xl" />

          <div className="relative z-10 grid grid-cols-1 gap-8 lg:grid-cols-12 items-center">
            <div className="lg:col-span-8 space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-500/10 px-3.5 py-1 text-xs font-semibold text-amber-300">
                <Users size={13} />
                <span>NovaAI Enterprise Teams</span>
              </div>

              <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-[1.08]">
                Shared Workspaces for{" "}
                <span className="bg-gradient-to-r from-amber-300 via-amber-400 to-orange-500 bg-clip-text text-transparent">
                  Multi-Team Execution
                </span>
              </h1>

              <p className="max-w-2xl text-xs sm:text-base leading-relaxed text-zinc-300/90">
                Alag-alag pods, role permissions, aur shared agent workflows ko
                ek jagah organize karo—taaki har team bina friction ke kaam
                kar sake.
              </p>
            </div>

            <div className="lg:col-span-4 rounded-2xl border border-zinc-800/90 bg-[#050811]/90 p-5 sm:p-6 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400">
                  Active Pod Focus
                </span>
                <Sparkles size={14} className="text-amber-400" />
              </div>
              <p className="text-lg font-extrabold text-white">
                {activePod.name}
              </p>
              <p className="text-xs text-amber-200/90 font-semibold">
                {activePod.focus} • {activePod.activeAgents} active agents
              </p>
              <p className="text-xs leading-relaxed text-zinc-400">
                {activePod.summary}
              </p>
            </div>
          </div>
        </section>

        {/* Team Pods Grid */}
        <section className="space-y-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-amber-400">
              — Team Pods —
            </p>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              Organize Work by Functional Pod
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            {TEAM_PODS.map((pod: TeamPod) => {
              const active = pod.id === selectedPodId;
              return (
                <button
                  key={pod.id}
                  type="button"
                  onClick={() => setSelectedPodId(pod.id)}
                  className={`flex flex-col justify-between rounded-2xl border p-6 text-left transition ${
                    active
                      ? "border-amber-400/70 bg-gradient-to-b from-[#171208] to-[#0a0f1c] shadow-lg shadow-amber-500/10"
                      : "border-zinc-800/90 bg-[#0a0f1c]/90 hover:border-zinc-700"
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="rounded-full border border-amber-400/25 bg-amber-500/10 px-3 py-0.5 text-[11px] font-bold text-amber-300">
                        {pod.activeAgents} Agents
                      </span>
                      <span className="text-[11px] text-zinc-400">
                        {active ? "Selected" : "Select"}
                      </span>
                    </div>
                    <h3 className="mt-3 text-lg font-bold text-white">
                      {pod.name}
                    </h3>
                    <p className="mt-1 text-xs font-semibold text-zinc-300">
                      {pod.focus}
                    </p>
                    <p className="mt-2 text-xs leading-relaxed text-zinc-400">
                      {pod.summary}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* Roster + Role Permissions */}
        <section className="grid grid-cols-1 gap-6 lg:grid-cols-12 items-start">
          {/* Left: Invite & Members Roster */}
          <div className="lg:col-span-7 rounded-3xl border border-zinc-800/90 bg-[#070b14] p-5 sm:p-6 space-y-5 shadow-xl">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-400">
              <UserPlus size={14} />
              <span>Team Roster & Quick Invite</span>
            </div>

            <form
              onSubmit={handleAddMember}
              className="grid grid-cols-1 gap-3 sm:grid-cols-12"
            >
              <input
                type="text"
                required
                value={inviteName}
                onChange={(e) => setInviteName(e.target.value)}
                placeholder="Member name"
                className="sm:col-span-4 rounded-xl border border-zinc-800 bg-[#050811] px-3 py-2 text-xs sm:text-sm text-white placeholder-zinc-500 focus:border-amber-400/60 focus:outline-none"
              />
              <input
                type="email"
                required
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="work@company.com"
                className="sm:col-span-4 rounded-xl border border-zinc-800 bg-[#050811] px-3 py-2 text-xs sm:text-sm text-white placeholder-zinc-500 focus:border-amber-400/60 focus:outline-none"
              />
              <select
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value as TeamRole)}
                className="sm:col-span-2 rounded-xl border border-zinc-800 bg-[#050811] px-2.5 py-2 text-xs font-semibold text-zinc-200 focus:border-amber-400/60 focus:outline-none"
              >
                <option value="Admin">Admin</option>
                <option value="Builder">Builder</option>
                <option value="Viewer">Viewer</option>
              </select>
              <button
                type="submit"
                className="sm:col-span-2 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 px-3 py-2 text-xs font-bold text-zinc-950 hover:brightness-110"
              >
                Add
              </button>
            </form>

            {notice && (
              <p className="rounded-xl border border-emerald-500/35 bg-emerald-500/10 px-3.5 py-2 text-xs text-emerald-300">
                {notice}
              </p>
            )}

            <div className="space-y-2.5">
              {members.map((member: TeamMember) => (
                <div
                  key={member.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-zinc-800/90 bg-[#0a0f1c] p-3.5"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-white">
                      {member.name}
                    </p>
                    <p className="truncate text-xs text-zinc-400">
                      {member.email} •{" "}
                      <span className="text-zinc-300">{member.pod}</span>
                    </p>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    <select
                      value={member.role}
                      onChange={(e) =>
                        handleRoleChange(member.id, e.target.value as TeamRole)
                      }
                      className="rounded-lg border border-zinc-700 bg-[#050811] px-2.5 py-1 text-xs font-semibold text-amber-300 focus:outline-none"
                    >
                      <option value="Admin">Admin</option>
                      <option value="Builder">Builder</option>
                      <option value="Viewer">Viewer</option>
                    </select>

                    {members.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveMember(member.id)}
                        aria-label="Remove member"
                        className="rounded-lg border border-zinc-800 bg-zinc-900 p-1.5 text-zinc-400 hover:text-rose-400"
                      >
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Role Permissions Matrix */}
          <div className="lg:col-span-5 rounded-3xl border border-zinc-800/90 bg-[#070b14] p-5 sm:p-6 space-y-4 shadow-xl">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-400">
              <ShieldCheck size={14} />
              <span>Role Access & Permissions</span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {(["Admin", "Builder", "Viewer"] as TeamRole[]).map(
                (role: TeamRole) => (
                  <button
                    key={role}
                    type="button"
                    onClick={() => setSelectedRoleInfo(role)}
                    className={`rounded-xl border py-2 text-xs font-bold transition ${
                      selectedRoleInfo === role
                        ? "border-amber-400 bg-amber-500/20 text-amber-200"
                        : "border-zinc-800 bg-[#050811] text-zinc-400 hover:text-zinc-200"
                    }`}
                  >
                    {role}
                  </button>
                )
              )}
            </div>

            <div className="rounded-2xl border border-zinc-800 bg-[#0a0f1c] p-4 space-y-3">
              <p className="text-sm font-bold text-white">
                {selectedRoleInfo} Capabilities
              </p>
              <ul className="space-y-2 text-xs text-zinc-200">
                {ROLE_PERKS[selectedRoleInfo].map((perk: string) => (
                  <li key={perk} className="flex items-start gap-2">
                    <CheckCircle2
                      size={14}
                      className="mt-0.5 shrink-0 text-amber-400"
                    />
                    <span>{perk}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
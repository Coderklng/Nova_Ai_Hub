"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Workflow,
  Play,
  Square,
  CheckCircle2,
  CircleDashed,
  Clock,
  Sparkles,
  RotateCcw,
  Save,
  Plus,
  Trash2,
} from "lucide-react";

interface WorkflowNodeStep {
  id: string;
  title: string;
  action: string;
  durationLabel: string;
  enabled: boolean;
}

interface WorkflowTemplate {
  id: string;
  backendId?: string;
  name: string;
  badge: string;
  desc: string;
  defaultInput: string;
  nodes: WorkflowNodeStep[];
}

interface BackendAction {
  stepNumber: number;
  actionType: string;
  config?: {
    title?: string;
    action?: string;
    durationLabel?: string;
    enabled?: boolean;
  };
}

interface BackendWorkflowDoc {
  _id?: string;
  id?: string;
  title?: string;
  isEnabled?: boolean;
  trigger?: {
    eventType?: string;
    conditions?: {
      badge?: string;
      desc?: string;
      defaultInput?: string;
    };
  };
  actions?: BackendAction[];
}

const NODE_BASE_URL = (
  process.env.NEXT_PUBLIC_BACKEND_URL || "https://nova-backend-77e0.onrender.com"
).replace(/\/+$/, "");

const INITIAL_WORKFLOWS: WorkflowTemplate[] = [
  {
    id: "lead-triage",
    name: "Lead & Client Triage",
    badge: "Client Ops",
    desc: "Incoming inquiries ko categorize karo, priority score nikaalo, aur clean response draft taiyar karo.",
    defaultInput:
      "Need a responsive Next.js landing page + agent workspace within 10 days.",
    nodes: [
      {
        id: "n-1",
        title: "Parse Request Intent",
        action: "Extract scope, timeline, and required deliverables",
        durationLabel: "~0.4s",
        enabled: true,
      },
      {
        id: "n-2",
        title: "Check Scope & Effort",
        action: "Flag timeline constraints and key UI modules",
        durationLabel: "~0.5s",
        enabled: true,
      },
      {
        id: "n-3",
        title: "Draft Action Summary",
        action: "Generate crisp reply checklist and next steps",
        durationLabel: "~0.6s",
        enabled: true,
      },
    ],
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
    "access_token",
    "authToken",
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
          parsed.access_token ||
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

function getHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  const token = process.env.NEXT_PUBLIC_AUTH_TOKEN || getStoredAuthToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
}

function mapBackendToUi(doc: BackendWorkflowDoc, index: number): WorkflowTemplate {
  const docId = String(doc._id || doc.id || `wf-${index}`);
  const cond = doc.trigger?.conditions || {};
  const mappedNodes: WorkflowNodeStep[] =
    Array.isArray(doc.actions) && doc.actions.length > 0
      ? doc.actions.map((act, idx) => ({
          id: `${docId}-step-${act.stepNumber ?? idx + 1}`,
          title: act.config?.title || act.actionType || `Step ${idx + 1}`,
          action: act.config?.action || "Execute workflow action",
          durationLabel: act.config?.durationLabel || "~0.4s",
          enabled:
            typeof act.config?.enabled === "boolean"
              ? act.config.enabled
              : doc.isEnabled !== false,
        }))
      : [
          {
            id: `${docId}-step-1`,
            title: "Execute Step",
            action: "Run workflow action",
            durationLabel: "~0.4s",
            enabled: true,
          },
        ];

  return {
    id: docId,
    backendId: doc._id || doc.id,
    name: doc.title || `Workflow ${index + 1}`,
    badge: cond.badge || doc.trigger?.eventType || "Custom Flow",
    desc: cond.desc || "Saved workflow synced from MongoDB + Redis backend.",
    defaultInput: cond.defaultInput || "Run workflow with current configuration.",
    nodes: mappedNodes,
  };
}

function mapUiToBackendPayload(wf: WorkflowTemplate, triggerInput: string) {
  return {
    title: wf.name,
    isEnabled: wf.nodes.some((n) => n.enabled),
    trigger: {
      eventType: "manual",
      conditions: {
        badge: wf.badge,
        desc: wf.desc,
        defaultInput: triggerInput.trim() || wf.defaultInput,
      },
    },
    actions: wf.nodes.map((node, idx) => ({
      stepNumber: idx + 1,
      actionType: node.title.toLowerCase().replace(/[^a-z0-9]+/g, "_") || `step_${idx + 1}`,
      config: {
        title: node.title,
        action: node.action,
        durationLabel: node.durationLabel,
        enabled: node.enabled,
      },
    })),
  };
}

export default function WorkflowAutomationPage() {
  const [workflows, setWorkflows] =
    useState<WorkflowTemplate[]>(INITIAL_WORKFLOWS);
  const [selectedId, setSelectedId] = useState<string>(INITIAL_WORKFLOWS[0].id);
  const [triggerInput, setTriggerInput] = useState<string>(
    INITIAL_WORKFLOWS[0].defaultInput
  );
  const [running, setRunning] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [syncStatus, setSyncStatus] = useState<string>("Ready to create");
  const [activeStepIndex, setActiveStepIndex] = useState<number>(-1);
  const [completedIds, setCompletedIds] = useState<string[]>([]);
  const [runReport, setRunReport] = useState<string>("");

  // Create New Workflow state
  const [showCreateForm, setShowCreateForm] = useState<boolean>(true);
  const [newTitle, setNewTitle] = useState<string>("");
  const [newBadge, setNewBadge] = useState<string>("Automation");
  const [newDesc, setNewDesc] = useState<string>("");
  const [newInput, setNewInput] = useState<string>("");
  const [stepDrafts, setStepDrafts] = useState<
    Array<{ title: string; action: string; durationLabel: string }>
  >([
    {
      title: "Validate Input",
      action: "Check payload fields and extract intent",
      durationLabel: "~0.4s",
    },
    {
      title: "Execute Task",
      action: "Process workflow action and prepare output",
      durationLabel: "~0.5s",
    },
  ]);

  const timerRef = useRef<number | null>(null);

  const currentWorkflow =
    workflows.find((w) => w.id === selectedId) ?? workflows[0];

  const loadMyWorkflows = useCallback(async () => {
    try {
      const res = await fetch(`${NODE_BASE_URL}/api/workflows`, {
        method: "GET",
        headers: getHeaders(),
      });
      if (!res.ok) return;

      const json = await res.json();
      const list = Array.isArray(json?.data) ? json.data : [];
      if (list.length > 0) {
        const converted = list.map((item: BackendWorkflowDoc, idx: number) =>
          mapBackendToUi(item, idx)
        );
        setWorkflows(converted);
        setSelectedId(converted[0].id);
        setTriggerInput(converted[0].defaultInput);
        setShowCreateForm(false);
        setSyncStatus(`Synced (${list.length} saved)`);
      } else {
        setSyncStatus("0 DB workflows — create below");
        setShowCreateForm(true);
      }
    } catch {
      // Backend unreachable hone par local create/run active rahega
    }
  }, []);

  useEffect(() => {
    loadMyWorkflows();
    return () => {
      if (timerRef.current !== null) {
        window.clearInterval(timerRef.current);
      }
    };
  }, [loadMyWorkflows]);

  const clearTimer = () => {
    if (timerRef.current !== null) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const handleSelectWorkflow = (wf: WorkflowTemplate) => {
    if (running) return;
    setSelectedId(wf.id);
    setTriggerInput(wf.defaultInput);
    setActiveStepIndex(-1);
    setCompletedIds([]);
    setRunReport("");
  };

  const syncWorkflowToBackend = async (
    wf: WorkflowTemplate,
    inputOverride?: string
  ) => {
    const payload = mapUiToBackendPayload(wf, inputOverride ?? triggerInput);
    const targetUrl = wf.backendId
      ? `${NODE_BASE_URL}/api/workflows/${wf.backendId}`
      : `${NODE_BASE_URL}/api/workflows`;
    const method = wf.backendId ? "PUT" : "POST";

    const res = await fetch(targetUrl, {
      method,
      headers: getHeaders(),
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData?.message || `HTTP ${res.status}`);
    }

    const data = await res.json();
    const savedDoc: BackendWorkflowDoc | undefined = data?.data;
    const savedId = savedDoc?._id || savedDoc?.id || wf.backendId;

    if (savedId) {
      setWorkflows((prev) =>
        prev.map((item) =>
          item.id === wf.id
            ? { ...item, id: savedId, backendId: savedId }
            : item
        )
      );
      setSelectedId(savedId);
    }
    return savedId;
  };

  const handleCreateWorkflow = async (e: React.FormEvent) => {
    e.preventDefault();
    if (saving || running) return;

    const cleanTitle = newTitle.trim();
    if (!cleanTitle) {
      setRunReport("[!] Pehle workflow ka naam (title) daal.");
      return;
    }

    const validSteps = stepDrafts
      .map((s, idx) => ({
        id: `new-step-${Date.now()}-${idx}`,
        title: s.title.trim() || `Step ${idx + 1}`,
        action: s.action.trim() || "Execute workflow step",
        durationLabel: s.durationLabel.trim() || "~0.4s",
        enabled: true,
      }))
      .filter((s) => s.title.length > 0);

    const draftWorkflow: WorkflowTemplate = {
      id: `local-${Date.now()}`,
      name: cleanTitle,
      badge: newBadge.trim() || "Custom Flow",
      desc:
        newDesc.trim() ||
        "Custom workflow created from NovaAI Workflow Automator.",
      defaultInput:
        newInput.trim() || "Run custom workflow with sample payload.",
      nodes:
        validSteps.length > 0
          ? validSteps
          : [
              {
                id: `step-${Date.now()}`,
                title: "Run Action",
                action: "Execute workflow",
                durationLabel: "~0.4s",
                enabled: true,
              },
            ],
    };

    setSaving(true);
    setSyncStatus("Creating workflow...");

    try {
      const payload = mapUiToBackendPayload(
        draftWorkflow,
        draftWorkflow.defaultInput
      );
      const res = await fetch(`${NODE_BASE_URL}/api/workflows`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData?.message || `HTTP ${res.status}`);
      }

      const json = await res.json();
      const createdItem: WorkflowTemplate = json?.data
        ? mapBackendToUi(json.data, workflows.length)
        : draftWorkflow;

      setWorkflows((prev) => [createdItem, ...prev]);
      setSelectedId(createdItem.id);
      setTriggerInput(createdItem.defaultInput);
      setActiveStepIndex(-1);
      setCompletedIds([]);
      setShowCreateForm(false);
      setNewTitle("");
      setNewDesc("");
      setNewInput("");
      setSyncStatus("Created & saved in DB");
      setRunReport(
        `[✓] Created workflow "${createdItem.name}" (${createdItem.nodes.length} steps). Ab "Run Workflow" daba kar test kar sakte ho.`
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Create failed";
      setWorkflows((prev) => [draftWorkflow, ...prev]);
      setSelectedId(draftWorkflow.id);
      setTriggerInput(draftWorkflow.defaultInput);
      setShowCreateForm(false);
      setSyncStatus(`Local added (${msg})`);
      setRunReport(
        `[!] Backend save notice: ${msg}\nWorkflow "${draftWorkflow.name}" list mein add ho gaya hai—token/server check karke "Save Flow" daba sakte ho.`
      );
    } finally {
      setSaving(false);
    }
  };

  const handleSaveCurrentWorkflow = async () => {
    if (saving || running || !currentWorkflow) return;
    setSaving(true);
    setSyncStatus("Saving...");
    try {
      await syncWorkflowToBackend(currentWorkflow, triggerInput);
      setSyncStatus("Saved to MongoDB");
      setRunReport((prev) =>
        `${prev ? `${prev}\n` : ""}[✓] Workflow "${currentWorkflow.name}" backend par save ho gaya.`
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Save failed";
      setSyncStatus(`Error: ${msg}`);
      setRunReport((prev) =>
        `${prev ? `${prev}\n` : ""}[!] Save notice: ${msg}`
      );
    } finally {
      setSaving(false);
    }
  };

  const handleToggleNode = async (nodeId: string) => {
    if (running || !currentWorkflow) return;
    const updatedWf: WorkflowTemplate = {
      ...currentWorkflow,
      nodes: currentWorkflow.nodes.map((n) =>
        n.id === nodeId ? { ...n, enabled: !n.enabled } : n
      ),
    };

    setWorkflows((prev) =>
      prev.map((wf) => (wf.id === currentWorkflow.id ? updatedWf : wf))
    );

    if (updatedWf.backendId) {
      try {
        await syncWorkflowToBackend(updatedWf, triggerInput);
        setSyncStatus("Updated step");
      } catch {
        setSyncStatus("Local toggle updated");
      }
    }
  };

  const handleResetRun = () => {
    if (running) return;
    setActiveStepIndex(-1);
    setCompletedIds([]);
    setRunReport("");
  };

  const handleStopWorkflow = () => {
    clearTimer();
    setRunning(false);
    setActiveStepIndex(-1);
    setRunReport((prev) =>
      prev
        ? `${prev}\n\n[Workflow run stopped manually]`
        : "[Workflow run stopped manually]"
    );
  };

  const handleRunWorkflow = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (running || !currentWorkflow) return;

    const enabledNodes = currentWorkflow.nodes.filter((n) => n.enabled);
    if (enabledNodes.length === 0) {
      setRunReport("Kam se kam ek workflow step enable kar tabhi run hoga.");
      return;
    }

    const inputText = triggerInput.trim() || currentWorkflow.defaultInput;
    clearTimer();
    setRunning(true);
    setCompletedIds([]);
    setActiveStepIndex(0);
    setRunReport(
      `Running "${currentWorkflow.name}"...\nInput: "${inputText}"\n`
    );

    let stepIdx = 0;

    timerRef.current = window.setInterval(() => {
      const currentNode = enabledNodes[stepIdx];
      if (!currentNode) {
        clearTimer();
        setRunning(false);
        setActiveStepIndex(-1);
        return;
      }

      setActiveStepIndex(stepIdx);
      setCompletedIds((prev) => [...prev, currentNode.id]);
      setRunReport(
        (prev) =>
          `${prev}\n✓ [${currentNode.title}] — ${currentNode.action} (${currentNode.durationLabel})`
      );

      stepIdx += 1;

      if (stepIdx >= enabledNodes.length) {
        clearTimer();
        setRunning(false);
        setActiveStepIndex(-1);
        setRunReport(
          (prev) =>
            `${prev}\n\nWorkflow complete: ${enabledNodes.length} active steps executed cleanly.`
        );
      }
    }, 550);
  };

  return (
    <div className="min-h-screen bg-[#05070d] text-white">
      <div className="mx-auto max-w-7xl px-4 py-7 sm:py-10 md:px-8 space-y-8">
        {/* Top Navigation Strip */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900/80 px-3.5 py-2 text-xs font-semibold text-zinc-200 transition hover:border-amber-400/50 hover:text-white"
          >
            <span>←</span>
            <span>Home</span>
          </Link>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowCreateForm((prev) => !prev)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 px-3.5 py-2 text-xs font-bold text-zinc-950 transition hover:brightness-110"
            >
              <Plus size={14} />
              <span>{showCreateForm ? "Close Builder" : "New Workflow"}</span>
            </button>
            <Link
              href="/enterprise"
              className="rounded-xl border border-amber-400/35 bg-amber-500/10 px-3.5 py-2 text-xs font-semibold text-amber-300 transition hover:bg-amber-500/20"
            >
              Enterprise
            </Link>
          </div>
        </div>

        {/* Hero Header */}
        <section className="relative overflow-hidden rounded-3xl border border-zinc-800/80 bg-gradient-to-br from-[#0d0a07] via-[#070b14] to-[#081224] p-6 sm:p-10 shadow-2xl">
          <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-amber-500/15 blur-3xl" />
          <div className="pointer-events-none absolute -left-24 -bottom-24 h-72 w-72 rounded-full bg-blue-600/15 blur-3xl" />

          <div className="relative z-10 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl space-y-2">
              <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-500/10 px-3.5 py-1 text-xs font-semibold text-amber-300">
                <Workflow size={13} />
                <span>NovaAI Workflow Automation</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white">
                Create & Run{" "}
                <span className="bg-gradient-to-r from-amber-300 via-amber-400 to-orange-500 bg-clip-text text-transparent">
                  Repeatable Pipelines
                </span>
              </h1>
              <p className="text-xs sm:text-sm text-zinc-300/90">
                Naya workflow create karke DB mein save kar, list mein select
                kar, steps toggle kar, aur live run dekh.
              </p>
            </div>

            <div className="inline-flex items-center gap-2 self-start lg:self-auto rounded-2xl border border-zinc-800 bg-[#050811]/90 px-4 py-2.5 text-xs">
              <span
                className={`h-2 w-2 rounded-full ${
                  running ? "bg-amber-400 animate-ping" : "bg-emerald-400"
                }`}
              />
              <span className="text-zinc-200">
                {running ? "Pipeline Running" : syncStatus}
              </span>
            </div>
          </div>
        </section>

        {/* Create New Workflow Box */}
        {showCreateForm && (
          <section className="rounded-3xl border border-amber-400/35 bg-[#070b14] p-5 sm:p-7 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between gap-2">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-amber-400">
                  Create Workflow
                </p>
                <h2 className="text-lg sm:text-xl font-extrabold text-white">
                  Naya Workflow Bana Kar Backend Mein Save Kar
                </h2>
              </div>
            </div>

            <form onSubmit={handleCreateWorkflow} className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-zinc-300">
                    Workflow Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="e.g., Client Proposal Generator"
                    className="w-full rounded-xl border border-zinc-800 bg-[#050811] px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder-zinc-500 focus:border-amber-400/60 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-zinc-300">
                    Category / Tag
                  </label>
                  <input
                    type="text"
                    value={newBadge}
                    onChange={(e) => setNewBadge(e.target.value)}
                    placeholder="Client Ops / Dev / Growth"
                    className="w-full rounded-xl border border-zinc-800 bg-[#050811] px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder-zinc-500 focus:border-amber-400/60 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-zinc-300">
                    Short Description
                  </label>
                  <input
                    type="text"
                    value={newDesc}
                    onChange={(e) => setNewDesc(e.target.value)}
                    placeholder="Yeh workflow kya kaam karega?"
                    className="w-full rounded-xl border border-zinc-800 bg-[#050811] px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder-zinc-500 focus:border-amber-400/60 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-zinc-300">
                    Default Sample Trigger Input
                  </label>
                  <input
                    type="text"
                    value={newInput}
                    onChange={(e) => setNewInput(e.target.value)}
                    placeholder="Sample trigger input..."
                    className="w-full rounded-xl border border-zinc-800 bg-[#050811] px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder-zinc-500 focus:border-amber-400/60 focus:outline-none"
                  />
                </div>
              </div>

              {/* Steps Builder */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-zinc-300">
                    Workflow Steps ({stepDrafts.length})
                  </label>
                  <button
                    type="button"
                    onClick={() =>
                      setStepDrafts((prev) => [
                        ...prev,
                        {
                          title: `Step ${prev.length + 1}`,
                          action: "Perform automated action",
                          durationLabel: "~0.5s",
                        },
                      ])
                    }
                    className="inline-flex items-center gap-1 rounded-lg border border-zinc-700 bg-zinc-900 px-2.5 py-1 text-xs font-semibold text-amber-300 hover:border-amber-400/50"
                  >
                    <Plus size={12} />
                    <span>Add Step</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {stepDrafts.map((st, index) => (
                    <div
                      key={index}
                      className="grid grid-cols-1 gap-2 sm:grid-cols-12 items-center rounded-2xl border border-zinc-800 bg-[#050811] p-3"
                    >
                      <input
                        type="text"
                        value={st.title}
                        onChange={(e) => {
                          const val = e.target.value;
                          setStepDrafts((prev) =>
                            prev.map((item, i) =>
                              i === index ? { ...item, title: val } : item
                            )
                          );
                        }}
                        placeholder="Step title"
                        className="sm:col-span-3 rounded-lg border border-zinc-800 bg-[#0a0f1c] px-2.5 py-1.5 text-xs text-white focus:border-amber-400/60 focus:outline-none"
                      />
                      <input
                        type="text"
                        value={st.action}
                        onChange={(e) => {
                          const val = e.target.value;
                          setStepDrafts((prev) =>
                            prev.map((item, i) =>
                              i === index ? { ...item, action: val } : item
                            )
                          );
                        }}
                        placeholder="What this step does"
                        className="sm:col-span-6 rounded-lg border border-zinc-800 bg-[#0a0f1c] px-2.5 py-1.5 text-xs text-white focus:border-amber-400/60 focus:outline-none"
                      />
                      <input
                        type="text"
                        value={st.durationLabel}
                        onChange={(e) => {
                          const val = e.target.value;
                          setStepDrafts((prev) =>
                            prev.map((item, i) =>
                              i === index
                                ? { ...item, durationLabel: val }
                                : item
                            )
                          );
                        }}
                        placeholder="~0.4s"
                        className="sm:col-span-2 rounded-lg border border-zinc-800 bg-[#0a0f1c] px-2.5 py-1.5 text-xs text-white focus:border-amber-400/60 focus:outline-none"
                      />
                      <div className="sm:col-span-1 flex justify-end">
                        <button
                          type="button"
                          disabled={stepDrafts.length <= 1}
                          onClick={() =>
                            setStepDrafts((prev) =>
                              prev.filter((_, i) => i !== index)
                            )
                          }
                          aria-label="Remove step"
                          className="rounded-lg border border-zinc-800 bg-zinc-900 p-1.5 text-zinc-400 hover:text-rose-400 disabled:opacity-30"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 px-5 py-2.5 text-xs sm:text-sm font-bold text-zinc-950 shadow-lg shadow-amber-500/20 hover:brightness-110 disabled:opacity-60"
              >
                <Save size={14} />
                <span>
                  {saving ? "Creating..." : "Create & Save Workflow"}
                </span>
              </button>
            </form>
          </section>
        )}

        {/* Workflow Selector Cards */}
        <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {workflows.map((wf: WorkflowTemplate) => {
            const active = wf.id === selectedId;
            return (
              <button
                key={wf.id}
                type="button"
                onClick={() => handleSelectWorkflow(wf)}
                className={`flex flex-col justify-between rounded-2xl border p-5 text-left transition ${
                  active
                    ? "border-amber-400/70 bg-gradient-to-b from-[#171208] to-[#0a0f1c] shadow-lg shadow-amber-500/10"
                    : "border-zinc-800/90 bg-[#0a0f1c]/90 hover:border-zinc-700"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="rounded-full border border-amber-400/25 bg-amber-500/10 px-3 py-0.5 text-[11px] font-bold text-amber-300">
                      {wf.badge}
                    </span>
                    <span className="text-[11px] text-zinc-400">
                      {wf.nodes.filter((n) => n.enabled).length}/{wf.nodes.length}{" "}
                      steps
                    </span>
                  </div>
                  <h2 className="mt-3 text-base sm:text-lg font-bold text-white">
                    {wf.name}
                  </h2>
                  <p className="mt-1.5 text-xs leading-relaxed text-zinc-400">
                    {wf.desc}
                  </p>
                </div>
              </button>
            );
          })}
        </section>

        {/* Pipeline Builder + Execution Console */}
        {currentWorkflow && (
          <section className="grid grid-cols-1 gap-6 lg:grid-cols-12 items-start">
            {/* Left: Step Nodes */}
            <div className="lg:col-span-6 rounded-3xl border border-zinc-800/90 bg-[#070b14] p-5 sm:p-6 space-y-4 shadow-xl">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-amber-400">
                    Pipeline Steps
                  </p>
                  <h3 className="text-lg font-bold text-white">
                    {currentWorkflow.name}
                  </h3>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleSaveCurrentWorkflow}
                    disabled={saving || running}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-amber-400/35 bg-amber-500/10 px-3 py-1.5 text-xs font-semibold text-amber-300 hover:bg-amber-500/20 disabled:opacity-50"
                  >
                    <Save size={12} />
                    <span>{saving ? "Saving..." : "Save Flow"}</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleResetRun}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-xs font-medium text-zinc-300 hover:border-zinc-700 hover:text-white"
                  >
                    <RotateCcw size={12} />
                    <span>Clear</span>
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                {currentWorkflow.nodes.map(
                  (node: WorkflowNodeStep, idx: number) => {
                    const isDone = completedIds.includes(node.id);
                    const isCurrent = running && activeStepIndex === idx;

                    return (
                      <div
                        key={node.id}
                        className={`rounded-2xl border p-4 transition ${
                          !node.enabled
                            ? "border-zinc-800/50 bg-[#050811]/50 opacity-55"
                            : isCurrent
                              ? "border-amber-400 bg-[#171208]/80"
                              : isDone
                                ? "border-emerald-500/40 bg-[#071310]"
                                : "border-zinc-800/90 bg-[#0a0f1c]"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-3 min-w-0">
                            <div className="mt-0.5 shrink-0">
                              {isDone ? (
                                <CheckCircle2
                                  size={17}
                                  className="text-emerald-400"
                                />
                              ) : isCurrent ? (
                                <CircleDashed
                                  size={17}
                                  className="text-amber-400 animate-spin"
                                />
                              ) : (
                                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-zinc-800 text-[11px] font-bold text-zinc-300">
                                  {idx + 1}
                                </span>
                              )}
                            </div>

                            <div className="min-w-0">
                              <div className="flex flex-wrap items-center gap-2">
                                <h4 className="text-sm font-bold text-white">
                                  {node.title}
                                </h4>
                                <span className="inline-flex items-center gap-1 text-[11px] text-zinc-400">
                                  <Clock size={11} />
                                  {node.durationLabel}
                                </span>
                              </div>
                              <p className="mt-1 text-xs text-zinc-400">
                                {node.action}
                              </p>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleToggleNode(node.id)}
                            disabled={running}
                            className={`shrink-0 rounded-lg border px-2.5 py-1 text-[11px] font-semibold transition ${
                              node.enabled
                                ? "border-amber-400/35 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20"
                                : "border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-zinc-200"
                            }`}
                          >
                            {node.enabled ? "Active" : "Off"}
                          </button>
                        </div>
                      </div>
                    );
                  }
                )}
              </div>
            </div>

            {/* Right: Trigger Input & Live Run Log */}
            <div className="lg:col-span-6 rounded-3xl border border-zinc-800/90 bg-[#070b14] p-5 sm:p-6 space-y-4 shadow-xl">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-400">
                <Sparkles size={14} />
                <span>Trigger & Execution Log</span>
              </div>

              <form onSubmit={handleRunWorkflow} className="space-y-3">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-zinc-300">
                    Workflow Input Payload
                  </label>
                  <textarea
                    rows={3}
                    value={triggerInput}
                    onChange={(e) => setTriggerInput(e.target.value)}
                    placeholder="Enter sample input to run this workflow..."
                    className="w-full rounded-2xl border border-zinc-800 bg-[#050811] p-3.5 text-xs sm:text-sm text-white placeholder-zinc-500 focus:border-amber-400/60 focus:outline-none"
                  />
                </div>

                <div className="flex items-center gap-2.5">
                  {running ? (
                    <button
                      type="button"
                      onClick={handleStopWorkflow}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl border border-rose-500/40 bg-rose-500/20 px-4 py-2.5 text-xs sm:text-sm font-semibold text-rose-200 hover:bg-rose-500/30"
                    >
                      <Square size={13} className="fill-current" />
                      <span>Stop Workflow</span>
                    </button>
                  ) : (
                    <button
                      type="submit"
                      className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 px-4 py-2.5 text-xs sm:text-sm font-bold text-zinc-950 shadow-lg shadow-amber-500/20 hover:brightness-110"
                    >
                      <Play size={13} className="fill-current" />
                      <span>Run Workflow</span>
                    </button>
                  )}
                </div>
              </form>

              <pre className="min-h-[220px] max-h-[340px] overflow-y-auto rounded-2xl border border-zinc-800 bg-[#050811] p-4 font-mono text-xs leading-relaxed text-zinc-200 whitespace-pre-wrap">
                {runReport ||
                  "Pehle upar se naya workflow create karke save kar, phir select karke 'Run Workflow' dabaa."}
              </pre>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
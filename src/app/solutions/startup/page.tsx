"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Rocket,
  Zap,
  Layers,
  Users,
  CheckCircle2,
  ArrowRight,
  Sparkles,
} from "lucide-react";

interface StartupTrack {
  id: string;
  stage: string;
  tagline: string;
  desc: string;
  highlights: string[];
}

interface AdvantageItem {
  title: string;
  desc: string;
  icon: "zap" | "layers" | "users";
}

const STARTUP_TRACKS: StartupTrack[] = [
  {
    id: "mvp",
    stage: "0 → 1 MVP",
    tagline: "Ship Fast Without Heavy Overhead",
    desc: "Apne core product hypothesis ko validate karne ke liye lean agent flows, rapid UI prototypes aur clean client-first architecture.",
    highlights: [
      "Fast prototype-to-product iteration",
      "Lean tooling without bloat",
      "Clear module boundaries from day one",
    ],
  },
  {
    id: "traction",
    stage: "Early Traction",
    tagline: "Automate Repetitive User & Ops Loops",
    desc: "Small team ke saath zyada output nikaalo—support triage, research synthesis aur internal workflows ko agents se streamline karo.",
    highlights: [
      "Multi-step task automation",
      "Consistent response & action traces",
      "Easy handoff from mock to live APIs",
    ],
  },
  {
    id: "scale",
    stage: "Growth & Scale",
    tagline: "Reliable Streams as Usage Rises",
    desc: "Jab users aur concurrent requests badhein, tab predictable state handling, clean fallbacks aur structured workspaces kaam aate hain.",
    highlights: [
      "Responsive mobile-first workspaces",
      "Abort & error-safe stream flows",
      "Modular architecture ready for teams",
    ],
  },
];

const ADVANTAGES: AdvantageItem[] = [
  {
    title: "Lean Speed for Small Teams",
    desc: "Har workflow ke liye badi engineering team ki zaroorat nahi—focused modules aur clear prompts se kaam tezi se aage badhta hai.",
    icon: "zap",
  },
  {
    title: "Built to Evolve Cleanly",
    desc: "Aaj client prototype ya mock stream chala rahe ho, kal live endpoints jodne mein pura layout todna nahi padega.",
    icon: "layers",
  },
  {
    title: "Founder-Friendly Clarity",
    desc: "No confusing jargon or cluttered dashboards—sirf kaam ki cheezein, sharp actions, aur clear next steps.",
    icon: "users",
  },
];

export default function StartupPage() {
  const [selectedTrackId, setSelectedTrackId] = useState<string>("mvp");
  const [founderName, setFounderName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [startupName, setStartupName] = useState<string>("");
  const [teamCount, setTeamCount] = useState<string>("2-10");
  const [goalNote, setGoalNote] = useState<string>("");
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string>("");
  const [submitted, setSubmitted] = useState<boolean>(false);

  const currentTrack =
    STARTUP_TRACKS.find((t) => t.id === selectedTrackId) ?? STARTUP_TRACKS[0];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!founderName.trim() || !email.trim() || !startupName.trim() || submitting) {
      return;
    }

    setSubmitting(true);
    setSubmitError("");

    try {
      const res = await fetch("/api/startup-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          founderName: founderName.trim(),
          email: email.trim(),
          startupName: startupName.trim(),
          teamCount,
          stage: currentTrack.stage,
          goalNote: goalNote.trim(),
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || `HTTP ${res.status}`);
      }

      setSubmitted(true);
    } catch (err: unknown) {
      setSubmitError(
        err instanceof Error ? err.message : "Could not submit request."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const renderIcon = (icon: AdvantageItem["icon"]) => {
    if (icon === "zap") return <Zap size={17} className="text-amber-400" />;
    if (icon === "layers")
      return <Layers size={17} className="text-amber-400" />;
    return <Users size={17} className="text-amber-400" />;
  };

  return (
    <div className="min-h-screen bg-[#05070d] text-white">
      <div className="mx-auto max-w-7xl px-4 py-7 sm:py-10 md:px-8 space-y-10">
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
            <Link
              href="/enterprise"
              className="rounded-xl border border-amber-400/35 bg-amber-500/10 px-3.5 py-2 text-xs font-semibold text-amber-300 transition hover:bg-amber-500/20"
            >
              Enterprise
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
                <Rocket size={13} />
                <span>NovaAI For Startups</span>
              </div>

              <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-[1.08]">
                Move Fast From Idea to{" "}
                <span className="bg-gradient-to-r from-amber-300 via-amber-400 to-orange-500 bg-clip-text text-transparent">
                  Real Momentum
                </span>
              </h1>

              <p className="max-w-2xl text-xs sm:text-base leading-relaxed text-zinc-300/90">
                Early-stage startups ke liye built—jahan har hour aur har rupee
                matter karta hai. Agents, search, aur code workflows ko ek saath
                jod kar apni team ki speed badha.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <a
                  href="#startup-apply"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 px-6 py-3 text-xs sm:text-sm font-bold text-zinc-950 shadow-lg shadow-amber-500/20 transition hover:brightness-110"
                >
                  <span>Apply for Startup Track</span>
                  <ArrowRight size={15} />
                </a>
                <Link
                  href="/product"
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-zinc-700 bg-zinc-900/90 px-6 py-3 text-xs sm:text-sm font-semibold text-zinc-200 transition hover:border-zinc-500 hover:text-white"
                >
                  <span>See Product Suite</span>
                </Link>
              </div>
            </div>

            {/* Selected Stage Snapshot */}
            <div className="lg:col-span-4 rounded-2xl border border-zinc-800/90 bg-[#050811]/90 p-5 sm:p-6 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400">
                  Selected Stage
                </span>
                <Sparkles size={14} className="text-amber-400" />
              </div>

              <h2 className="text-xl font-extrabold text-white">
                {currentTrack.stage}
              </h2>
              <p className="text-xs font-semibold text-amber-200/90">
                {currentTrack.tagline}
              </p>
              <p className="text-xs leading-relaxed text-zinc-400">
                {currentTrack.desc}
              </p>

              <ul className="space-y-1.5 border-t border-zinc-800/80 pt-3 text-xs text-zinc-200">
                {currentTrack.highlights.map((item: string) => (
                  <li key={item} className="flex items-center gap-2">
                    <CheckCircle2
                      size={13}
                      className="shrink-0 text-amber-400"
                    />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* Stage Selector Cards */}
        <section className="space-y-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-amber-400">
              — Growth Stages —
            </p>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              Pick Your Current Startup Stage
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            {STARTUP_TRACKS.map((track: StartupTrack) => {
              const active = track.id === selectedTrackId;
              return (
                <button
                  key={track.id}
                  type="button"
                  onClick={() => setSelectedTrackId(track.id)}
                  className={`flex flex-col justify-between rounded-2xl border p-6 text-left transition ${
                    active
                      ? "border-amber-400/70 bg-gradient-to-b from-[#171208] to-[#0a0f1c] shadow-lg shadow-amber-500/10"
                      : "border-zinc-800/90 bg-[#0a0f1c]/90 hover:border-zinc-700"
                  }`}
                >
                  <div>
                    <span className="inline-block rounded-full border border-amber-400/25 bg-amber-500/10 px-3 py-0.5 text-[11px] font-bold text-amber-300">
                      {track.stage}
                    </span>
                    <h3 className="mt-3 text-lg font-bold text-white">
                      {track.tagline}
                    </h3>
                    <p className="mt-1.5 text-xs leading-relaxed text-zinc-400">
                      {track.desc}
                    </p>
                  </div>

                  <ul className="mt-5 space-y-2 border-t border-zinc-800/80 pt-4 text-xs text-zinc-200">
                    {track.highlights.map((hl: string) => (
                      <li key={hl} className="flex items-center gap-2">
                        <span className="font-bold text-amber-400">✓</span>
                        <span>{hl}</span>
                      </li>
                    ))}
                  </ul>
                </button>
              );
            })}
          </div>
        </section>

        {/* Why Founders Choose NovaAI */}
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {ADVANTAGES.map((adv: AdvantageItem) => (
            <div
              key={adv.title}
              className="rounded-2xl border border-zinc-800/90 bg-[#070b14] p-5 space-y-2"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-zinc-800 bg-[#0a0f1c]">
                {renderIcon(adv.icon)}
              </div>
              <h3 className="text-sm sm:text-base font-bold text-white">
                {adv.title}
              </h3>
              <p className="text-xs leading-relaxed text-zinc-400">
                {adv.desc}
              </p>
            </div>
          ))}
        </section>

        {/* Startup Intake Form */}
        <section
          id="startup-apply"
          className="rounded-3xl border border-zinc-800/90 bg-[#070b14] p-6 sm:p-10 shadow-2xl"
        >
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
            <div className="lg:col-span-5 space-y-3">
              <p className="text-xs font-semibold uppercase tracking-widest text-amber-400">
                Founder Onboarding
              </p>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
                Start With {currentTrack.stage}
              </h2>
              <p className="text-xs sm:text-sm leading-relaxed text-zinc-400">
                Apne startup ka naam aur goal share kar—hum tere current stage
                ke hisaab se setup outline taiyar kar denge.
              </p>
            </div>

            <div className="lg:col-span-7">
              {submitted ? (
                <div className="rounded-2xl border border-emerald-500/40 bg-emerald-500/10 p-6 space-y-3">
                  <p className="text-base font-bold text-emerald-300">
                    Application Logged — Let’s Build, {founderName}!
                  </p>
                  <p className="text-xs sm:text-sm text-zinc-200">
                    <span className="font-semibold text-white">
                      {startupName}
                    </span>{" "}
                    ({currentTrack.stage}, Team: {teamCount}) ke liye details
                    note ho gayi hain. Follow-up{" "}
                    <span className="underline">{email}</span> par bhej diya
                    jayega.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setSubmitted(false);
                      setSubmitError("");
                      setFounderName("");
                      setEmail("");
                      setStartupName("");
                      setGoalNote("");
                    }}
                    className="rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-2 text-xs font-semibold text-white hover:border-zinc-500"
                  >
                    Submit Another Startup
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-1.5 block text-xs font-semibold text-zinc-300">
                        Founder Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={founderName}
                        onChange={(e) => setFounderName(e.target.value)}
                        placeholder="Aarav Mehta"
                        className="w-full rounded-xl border border-zinc-800 bg-[#050811] px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder-zinc-500 focus:border-amber-400/60 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="mb-1.5 block text-xs font-semibold text-zinc-300">
                        Work Email *
                      </label>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="founder@startup.io"
                        className="w-full rounded-xl border border-zinc-800 bg-[#050811] px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder-zinc-500 focus:border-amber-400/60 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-1.5 block text-xs font-semibold text-zinc-300">
                        Startup Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={startupName}
                        onChange={(e) => setStartupName(e.target.value)}
                        placeholder="Nova Sprint Labs"
                        className="w-full rounded-xl border border-zinc-800 bg-[#050811] px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder-zinc-500 focus:border-amber-400/60 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="mb-1.5 block text-xs font-semibold text-zinc-300">
                        Team Size
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {["1-2", "2-10", "11-25"].map((sz: string) => (
                          <button
                            key={sz}
                            type="button"
                            onClick={() => setTeamCount(sz)}
                            className={`rounded-xl border py-2 text-xs font-semibold transition ${
                              teamCount === sz
                                ? "border-amber-400 bg-amber-500/20 text-amber-200"
                                : "border-zinc-800 bg-[#050811] text-zinc-400 hover:border-zinc-700 hover:text-zinc-200"
                            }`}
                          >
                            {sz}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-zinc-300">
                      What Are You Building Right Now?
                    </label>
                    <textarea
                      rows={3}
                      value={goalNote}
                      onChange={(e) => setGoalNote(e.target.value)}
                      placeholder="Apna product, target users, ya next milestone likh..."
                      className="w-full rounded-xl border border-zinc-800 bg-[#050811] p-3.5 text-xs sm:text-sm text-white placeholder-zinc-500 focus:border-amber-400/60 focus:outline-none"
                    />
                  </div>

                  {submitError && (
                    <p className="text-xs text-rose-400">{submitError}</p>
                  )}

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full sm:w-auto rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 px-6 py-3 text-xs sm:text-sm font-bold text-zinc-950 shadow-lg shadow-amber-500/20 transition hover:brightness-110 disabled:opacity-60"
                  >
                    {submitting ? "Submitting..." : "Submit Startup Request →"}
                  </button>
                </form>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
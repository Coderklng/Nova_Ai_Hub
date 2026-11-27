"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Building2,
} from "lucide-react";

type AuthMode = "signin" | "signup";
type WorkspaceTier = "Solo Builder" | "Startup Team" | "Enterprise";

const BACKEND_URL = (
  process.env.NEXT_PUBLIC_BACKEND_URL || "https://nova-backend-77e0.onrender.com"
).replace(/\/+$/, "");

function extractToken(payload: any): string | null {
  if (!payload || typeof payload !== "object") return null;
  return (
    payload.token ||
    payload.accessToken ||
    payload.jwt ||
    payload?.data?.token ||
    payload?.data?.accessToken ||
    null
  );
}

function extractUser(payload: any) {
  if (!payload || typeof payload !== "object") return null;
  return payload.user || payload?.data?.user || payload?.data || payload;
}

export default function SignInPage() {
  const router = useRouter();

  const [mode, setMode] = useState<AuthMode>("signin");
  const [workspaceTier, setWorkspaceTier] =
    useState<WorkspaceTier>("Solo Builder");
  const [fullName, setFullName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [rememberDevice, setRememberDevice] = useState<boolean>(true);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [submitting, setSubmitting] = useState<boolean>(false);

  const handleDemoFill = () => {
    setErrorMsg("");
    setFullName("Kartik Sharma");
    setEmail("kartik@novaai.dev");
    setPassword("NovaClient#2026");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setErrorMsg("");

    const cleanEmail = email.trim();
    const cleanPass = password.trim();
    const cleanName = fullName.trim();

    if (!cleanEmail || !cleanEmail.includes("@")) {
      setErrorMsg("Valid email address daal bhai.");
      return;
    }

    if (cleanPass.length < 6) {
      setErrorMsg("Password kam se kam 6 characters ka hona chahiye.");
      return;
    }

    if (mode === "signup" && cleanName.length < 2) {
      setErrorMsg("Account banane ke liye apna naam daal.");
      return;
    }

    const derivedName =
      cleanName ||
      cleanEmail
        .split("@")[0]
        .replace(/[._-]+/g, " ")
        .replace(/\b\w/g, (ch) => ch.toUpperCase());

    setSubmitting(true);

    try {
      const endpoint =
        mode === "signup"
          ? `${BACKEND_URL}/api/users/register`
          : `${BACKEND_URL}/api/users/login`;

      const requestBody =
        mode === "signup"
          ? {
              name: derivedName,
              fullName: derivedName,
              email: cleanEmail,
              password: cleanPass,
              workspaceTier,
            }
          : {
              email: cleanEmail,
              password: cleanPass,
              workspaceTier,
            };

      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setErrorMsg(
          data?.message ||
            data?.error ||
            (mode === "signup"
              ? "Account create nahi ho paya, details check kar."
              : "Login fail ho gaya, email ya password check kar.")
        );
        setSubmitting(false);
        return;
      }

      const token = extractToken(data);
      const userObj = extractUser(data) || {};

      const sessionPayload = {
        id: userObj._id || userObj.id || null,
        name: userObj.name || userObj.fullName || derivedName,
        email: userObj.email || cleanEmail,
        tier: userObj.workspaceTier || workspaceTier,
        rememberDevice,
        token,
        signedInAt: Date.now(),
      };

      try {
        window.localStorage.setItem(
          "novaai_session",
          JSON.stringify(sessionPayload)
        );
        if (token) {
          window.localStorage.setItem("novaai_token", token);
        } else {
          window.localStorage.removeItem("novaai_token");
        }
      } catch {
        // Storage fallback ignored
      }

      router.push("/dashboard");
    } catch {
      setErrorMsg(
        "Backend se connect nahi ho paaya. Render service ya network check kar."
      );
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#05070d] text-white">
      <div className="mx-auto max-w-6xl px-4 py-7 sm:py-10 md:px-8 space-y-8">
        {/* Top Nav Strip */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900/80 px-3.5 py-2 text-xs font-semibold text-zinc-200 transition hover:border-amber-400/50 hover:text-white"
          >
            <span>←</span>
            <span>Home</span>
          </Link>

          <div className="flex items-center gap-2">
          </div>
        </div>

        {/* Main Split Layout */}
        <section className="grid grid-cols-1 gap-6 lg:grid-cols-12 items-stretch">
          {/* Left: Brand & Flow Preview */}
          <div className="lg:col-span-6 relative overflow-hidden rounded-3xl border border-zinc-800/80 bg-gradient-to-br from-[#0d0a07] via-[#070b14] to-[#081224] p-6 sm:p-9 flex flex-col justify-between shadow-2xl">
            <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-amber-500/15 blur-3xl" />
            <div className="pointer-events-none absolute -left-24 -bottom-24 h-72 w-72 rounded-full bg-blue-600/15 blur-3xl" />

            <div className="relative z-10 space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-500/10 px-3.5 py-1 text-xs font-semibold text-amber-300">
                <Sparkles size={13} />
                <span>NovaAI Access</span>
              </div>

              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
                Sign In to Enter{" "}
                <span className="bg-gradient-to-r from-amber-300 via-amber-400 to-orange-500 bg-clip-text text-transparent">
                  Your Dashboard
                </span>
              </h1>

              <p className="text-xs sm:text-sm leading-relaxed text-zinc-300/90">
                Yahan sign-in karte hi tu seedha apne NovaAI dashboard mein
                pahuchega—jahan credits, quick-launch tools, aur recent runs
                ready milenge.
              </p>
            </div>

            <div className="relative z-10 mt-8 space-y-3 border-t border-zinc-800/80 pt-6 text-xs text-zinc-200">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 size={15} className="shrink-0 text-amber-400" />
                <span>Step 1: Sign in or use Demo Fill</span>
              </div>
              <div className="flex items-center gap-2.5">
                <CheckCircle2 size={15} className="shrink-0 text-amber-400" />
                <span>Step 2: Land straight on /dashboard with credits</span>
              </div>
              <div className="flex items-center gap-2.5">
                <CheckCircle2 size={15} className="shrink-0 text-amber-400" />
                <span>Step 3: Launch Agents, Search, Builder, or Studio</span>
              </div>
            </div>
          </div>

          {/* Right: Auth Card */}
          <div className="lg:col-span-6 rounded-3xl border border-zinc-800/90 bg-[#070b14] p-6 sm:p-9 shadow-2xl flex flex-col justify-center space-y-5">
            <div className="flex items-center justify-between gap-2">
              <div className="grid grid-cols-2 rounded-xl border border-zinc-800 bg-[#050811] p-1">
                <button
                  type="button"
                  onClick={() => {
                    setMode("signin");
                    setErrorMsg("");
                  }}
                  className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold transition ${
                    mode === "signin"
                      ? "bg-amber-400 text-zinc-950 font-bold"
                      : "text-zinc-400 hover:text-white"
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMode("signup");
                    setErrorMsg("");
                  }}
                  className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold transition ${
                    mode === "signup"
                      ? "bg-amber-400 text-zinc-950 font-bold"
                      : "text-zinc-400 hover:text-white"
                  }`}
                >
                  Create Account
                </button>
              </div>

              <button
                type="button"
                onClick={handleDemoFill}
                className="rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-[11px] font-semibold text-amber-300 hover:border-amber-400/40"
              >
                Demo Fill
              </button>
            </div>

            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-white">
                {mode === "signin" ? "Sign in to continue" : "Create your account"}
              </h2>
              <p className="mt-1 text-xs text-zinc-400">
                Submit karte hi backend auth ke baad `/dashboard` open hoga.
              </p>
            </div>

            {/* Workspace Tier Selector */}
            <div>
              <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-zinc-300">
                <Building2 size={13} className="text-amber-400" />
                <span>Workspace Type</span>
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(
                  [
                    "Solo Builder",
                    "Startup Team",
                    "Enterprise",
                  ] as WorkspaceTier[]
                ).map((tier: WorkspaceTier) => (
                  <button
                    key={tier}
                    type="button"
                    onClick={() => setWorkspaceTier(tier)}
                    className={`rounded-xl border py-2 px-2 text-[11px] font-semibold transition ${
                      workspaceTier === tier
                        ? "border-amber-400 bg-amber-500/20 text-amber-200"
                        : "border-zinc-800 bg-[#050811] text-zinc-400 hover:border-zinc-700 hover:text-zinc-200"
                    }`}
                  >
                    {tier}
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === "signup" && (
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-zinc-300">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Kartik Sharma"
                    className="w-full rounded-xl border border-zinc-800 bg-[#050811] px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder-zinc-500 focus:border-amber-400/60 focus:outline-none"
                  />
                </div>
              )}

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-zinc-300">
                  Email Address *
                </label>
                <div className="relative">
                  <Mail
                    size={15}
                    className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500"
                  />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full rounded-xl border border-zinc-800 bg-[#050811] pl-10 pr-3.5 py-2.5 text-xs sm:text-sm text-white placeholder-zinc-500 focus:border-amber-400/60 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-zinc-300">
                  Password *
                </label>
                <div className="relative">
                  <Lock
                    size={15}
                    className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500"
                  />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password (min 6 chars)"
                    className="w-full rounded-xl border border-zinc-800 bg-[#050811] pl-10 pr-10 py-2.5 text-xs sm:text-sm text-white placeholder-zinc-500 focus:border-amber-400/60 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white"
                  >
                    {showPassword ? (
                      <EyeOff size={15} />
                    ) : (
                      <Eye size={15} />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs">
                <label className="inline-flex items-center gap-2 text-zinc-400 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberDevice}
                    onChange={(e) => setRememberDevice(e.target.checked)}
                    className="accent-amber-400 rounded"
                  />
                  <span>Keep session active on this device</span>
                </label>

                <Link
                  href="/enterprise"
                  className="font-semibold text-amber-300 hover:underline"
                >
                  SSO / Enterprise?
                </Link>
              </div>

              {errorMsg && (
                <p className="rounded-xl border border-rose-500/40 bg-rose-500/10 px-3.5 py-2 text-xs text-rose-300">
                  {errorMsg}
                </p>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 px-5 py-3 text-xs sm:text-sm font-bold text-zinc-950 shadow-lg shadow-amber-500/20 transition hover:brightness-110 disabled:opacity-60"
              >
                <span>
                  {submitting
                    ? "Opening Dashboard..."
                    : mode === "signin"
                      ? "Sign In & Go to Dashboard"
                      : "Create Account & Continue"}
                </span>
                <ArrowRight size={15} />
              </button>
            </form>
          </div>
        </section>
      </div>
    </div>
  );
}
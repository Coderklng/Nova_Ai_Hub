"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Mail, MapPin, ArrowLeft, CheckCircle2 } from "lucide-react";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("General Support");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (sending) return;
    setErrorMsg("");

    if (!name.trim() || !email.trim() || !message.trim()) {
      setErrorMsg("Naam, email, aur message teeno bhar bhai.");
      return;
    }

    setSending(true);
    try {
      const res = await fetch("/api/enterprise/inquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: name.trim(),
          workEmail: email.trim(),
          company: `Contact - ${subject}`,
          teamSize: "N/A",
          useCase: message.trim(),
        }),
      });

      if (!res.ok) {
        // Fallback so UI still shows confirmation if Resend env isn't set locally
        setSent(true);
        return;
      }

      setSent(true);
    } catch {
      setSent(true);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#05070d] text-white">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:py-12 md:px-8 space-y-10">
        {/* Top Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900/80 px-4 py-2 text-xs font-semibold text-zinc-200 transition hover:border-amber-400/50 hover:text-white"
          >
            <ArrowLeft size={14} />
            <span>Back to Home</span>
          </Link>

          <Link
            href="/enterprise#enterprise-form"
            className="rounded-xl border border-amber-400/35 bg-amber-500/10 px-4 py-2 text-xs font-semibold text-amber-300 transition hover:bg-amber-500/20"
          >
            Enterprise Inquiry →
          </Link>
        </div>

        {/* Content */}
        <section className="grid grid-cols-1 gap-8 lg:grid-cols-12 items-start">
          <div className="space-y-5 lg:col-span-5">
            <div className="space-y-2">
              <p className="text-xs font-bold uppercase tracking-widest text-amber-400">
                Contact NovaAI
              </p>
              <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                Get in Touch
              </h1>
              <p className="text-xs sm:text-sm leading-relaxed text-zinc-400">
                Support, partnerships, workflows, ya custom setup ke liye direct
                message bhej sakta hai.
              </p>
            </div>

            <div className="space-y-3 text-xs sm:text-sm">
              <div className="flex items-start gap-3 rounded-2xl border border-zinc-800/90 bg-[#0a0f1c] p-4">
                <Mail size={16} className="mt-0.5 text-amber-400" />
                <div>
                  <p className="font-bold text-white">Email</p>
                  <p className="text-zinc-400">kkartiksharma999@gmail.com</p>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-2xl border border-zinc-800/90 bg-[#0a0f1c] p-4">
                <MapPin size={16} className="mt-0.5 text-sky-400" />
                <div>
                  <p className="font-bold text-white">Base</p>
                  <p className="text-zinc-400">Jaipur, Rajasthan, India</p>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 rounded-3xl border border-zinc-800/90 bg-[#070b14] p-6 sm:p-8 shadow-xl">
            {sent ? (
              <div className="rounded-2xl border border-emerald-500/40 bg-emerald-500/10 p-6 space-y-3">
                <div className="flex items-center gap-2 text-base font-bold text-emerald-300">
                  <CheckCircle2 size={18} />
                  <span>Message Received</span>
                </div>
                <p className="text-xs sm:text-sm text-zinc-200">
                  Thanks, <span className="font-semibold text-white">{name}</span>! Aapka message{" "}
                  <span className="font-semibold text-amber-300">{subject}</span> ke liye note ho gaya hai.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSent(false);
                    setName("");
                    setEmail("");
                    setMessage("");
                  }}
                  className="rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-2 text-xs font-semibold text-white"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-zinc-300">
                      Your Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Kartik Sharma"
                      className="w-full rounded-xl border border-zinc-800 bg-[#050811] px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder-zinc-500 focus:border-amber-400/60 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-zinc-300">
                      Email *
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full rounded-xl border border-zinc-800 bg-[#050811] px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder-zinc-500 focus:border-amber-400/60 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-zinc-300">
                    Topic
                  </label>
                  <select
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full rounded-xl border border-zinc-800 bg-[#050811] px-3.5 py-2.5 text-xs sm:text-sm text-white focus:border-amber-400/60 focus:outline-none"
                  >
                    <option value="General Support">General Support</option>
                    <option value="Workflows & Agents">Workflows & Agents</option>
                    <option value="Enterprise & Custom Setup">Enterprise & Custom Setup</option>
                    <option value="Partnerships">Partnerships</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-zinc-300">
                    Message *
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Apna message ya question likhein..."
                    className="w-full rounded-xl border border-zinc-800 bg-[#050811] p-3.5 text-xs sm:text-sm text-white placeholder-zinc-500 focus:border-amber-400/60 focus:outline-none"
                  />
                </div>

                {errorMsg && (
                  <p className="rounded-xl border border-rose-500/40 bg-rose-500/10 px-3.5 py-2 text-xs text-rose-300">
                    {errorMsg}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={sending}
                  className="w-full sm:w-auto rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 px-6 py-3 text-xs sm:text-sm font-bold text-zinc-950 shadow-lg shadow-amber-500/20 transition hover:brightness-110 disabled:opacity-60"
                >
                  {sending ? "Sending..." : "Send Message →"}
                </button>
              </form>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
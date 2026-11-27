"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";

export default function Footer() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSubscribed(true);
    setEmail("");
  };

  return (
    <footer className="border-t border-zinc-800/90 bg-[#05070d] text-zinc-300">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 md:px-8">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-12">
          {/* Brand Column */}
          <div className="space-y-4 lg:col-span-3">
            <div className="flex items-center gap-2">
              <span className="text-amber-400">✦</span>
              <span className="text-lg font-extrabold tracking-tight text-white">
                NovaAI
              </span>
            </div>
            <p className="text-xs leading-relaxed text-zinc-400">
              Build. Automate. Innovate.
            </p>
            <div className="flex flex-wrap gap-3 text-xs font-semibold text-zinc-400">
              <a
                href="https://x.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-amber-300"
              >
                𝕏
              </a>
              <a
                href="https://github.com/Coderking"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-amber-300"
              >
                GitHub
              </a>
              <a
                href="https://www.youtube.com/@OpenSourceAILLM"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-amber-300"
              >
                YouTube
              </a>
              <Link href="/community" className="hover:text-amber-300">
                Discord
              </Link>
            </div>
          </div>

          {/* Product */}
          <div className="space-y-2.5 lg:col-span-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white">
              Product
            </h3>
            <ul className="space-y-2 text-xs text-zinc-400">
              <li>
                <Link href="/features" className="hover:text-amber-300">
                  Features
                </Link>
              </li>
              <li>
                <Link href="/models" className="hover:text-amber-300">
                  Models
                </Link>
              </li>
              <li>
                <Link href="/changelog" className="hover:text-amber-300">
                  Changelog
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div className="space-y-2.5 lg:col-span-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white">
              Resources
            </h3>
            <ul className="space-y-2 text-xs text-zinc-400">
              <li>
                <Link href="/docs" className="hover:text-amber-300">
                  Docs
                </Link>
              </li>
              <li>
                <Link href="/blog" className="hover:text-amber-300">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/community" className="hover:text-amber-300">
                  Community
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div className="space-y-2.5 lg:col-span-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white">
              Company
            </h3>
            <ul className="space-y-2 text-xs text-zinc-400">
              <li>
                <Link href="/about" className="hover:text-amber-300">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/careers" className="hover:text-amber-300">
                  Careers
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-amber-300">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Stay Updated */}
          <div className="space-y-2.5 lg:col-span-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white">
              Stay Updated
            </h3>
            <p className="text-xs text-zinc-400">
              Get the latest updates and news.
            </p>
            <form onSubmit={handleSubscribe} className="flex items-center gap-2">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="h-9 flex-1 rounded-xl border border-zinc-800 bg-zinc-950 px-3 text-xs text-white placeholder-zinc-500 focus:border-amber-400/60 focus:outline-none"
              />
              <button
                type="submit"
                aria-label="Subscribe"
                className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 text-zinc-950 hover:brightness-110"
              >
                {subscribed ? <Check size={14} /> : <ArrowRight size={14} />}
              </button>
            </form>
            {subscribed && (
              <p className="text-[11px] text-emerald-400">
                Subscribed to NovaAI updates.
              </p>
            )}
          </div>
        </div>

        {/* Bottom Legal Bar */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-zinc-800/80 pt-6 text-xs text-zinc-500">
          <p>© 2026 NovaAI. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Link href="/privacy" className="hover:text-zinc-300">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-zinc-300">
              Terms
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
"use client";

import React from "react";

interface Testimonial {
  quote: string;
  name: string;
  role: string;
  initials: string;
  accent: string;
}

const TESTIMONIALS: Testimonial[] = [
  {
    quote: "NovaAI is insanely powerful! It saves me hours every week.",
    name: "Rahul Sharma",
    role: "Developer",
    initials: "RS",
    accent: "from-amber-400 to-orange-500",
  },
  {
    quote: "The best AI agent platform I've ever used. Highly recommended!",
    name: "Priya Verma",
    role: "Creator",
    initials: "PV",
    accent: "from-sky-400 to-blue-600",
  },
  {
    quote: "Simple, fast and super useful. A must-have for everyone!",
    name: "Aman Gupta",
    role: "Entrepreneur",
    initials: "AG",
    accent: "from-emerald-400 to-teal-600",
  },
];

export default function TestimonialsSection() {
  return (
    <section
      id="testimonials"
      className="rounded-3xl border border-zinc-800/80 bg-gradient-to-b from-[#070b14] via-[#060911] to-[#05070d] px-5 py-10 sm:px-8 sm:py-12 shadow-xl"
    >
      {/* Section Heading */}
      <div className="mx-auto max-w-2xl text-center space-y-2">
        <p className="text-xs font-semibold uppercase tracking-widest text-amber-400">
          — Trusted by Millions —
        </p>
        <h2 className="text-2xl font-extrabold tracking-tight text-white sm:text-4xl">
          What Our Users Say
        </h2>
      </div>

      {/* Responsive 3-Card Grid */}
      <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3">
        {TESTIMONIALS.map((item) => (
          <div
            key={item.name}
            className="flex flex-col justify-between rounded-2xl border border-zinc-800/90 bg-[#0a0f1c]/90 p-5 transition hover:border-amber-400/35 hover:-translate-y-0.5"
          >
            <p className="text-sm leading-relaxed text-zinc-200">
              “{item.quote}”
            </p>

            <div className="mt-5 flex items-center gap-3 border-t border-zinc-800/70 pt-4">
              <div
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${item.accent} text-xs font-bold text-zinc-950`}
              >
                {item.initials}
              </div>
              <div>
                <p className="text-xs font-bold text-white">— {item.name}</p>
                <p className="text-[11px] text-zinc-400">{item.role}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
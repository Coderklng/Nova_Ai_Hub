"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Header from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import FeaturesSection from "@/components/FeatureCards";
import ProductDemoSection from "@/components/PromptSection";
import TestimonialsSection from "@/components/TestimonialsSection";
import Footer from "@/components/BrandFooter";
import BottomNav from "@/components/BottomNav";
import "./globals.css";

const WEBSITE_EASE = [0.22, 1, 0.36, 1] as const;

const WHATSAPP_URL =
  "https://wa.me/917297821782?text=" +
  encodeURIComponent("Hi NovaAI, I want to connect regarding your AI agent!");

export function LeftScrollCard({
  children,
  className = "",
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -36 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: false, amount: "some" }}
      transition={{
        duration: 0.85,
        delay,
        ease: WEBSITE_EASE,
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export default function HomePage() {
  const router = useRouter();
  const [darkMode, setDarkMode] = useState(true);
  const [scrollPercent, setScrollPercent] = useState(0);

  useEffect(() => {
    const updateScroll = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const docHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      if (docHeight <= 0) {
        setScrollPercent(0);
        return;
      }
      const pct = Math.min(100, Math.max(0, (scrollTop / docHeight) * 100));
      setScrollPercent(pct);
    };

    updateScroll();
    window.addEventListener("scroll", updateScroll, { passive: true });
    window.addEventListener("resize", updateScroll);
    return () => {
      window.removeEventListener("scroll", updateScroll);
      window.removeEventListener("resize", updateScroll);
    };
  }, []);

  const scrollToDemo = () => {
    const demoSection = document.getElementById("demo");
    if (demoSection) {
      demoSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <>
      <div
        className={
          darkMode
            ? "min-h-screen overflow-x-hidden bg-[#05070d] text-white transition-colors duration-500 pb-20 md:pb-0"
            : "min-h-screen overflow-x-hidden bg-zinc-100 text-zinc-900 transition-colors duration-500 pb-20 md:pb-0"
        }
      >
        {/* Sleek Top Linear Scroll Progress Bar */}
        <div
          aria-hidden="true"
          className="pointer-events-none fixed top-0 left-0 right-0 z-[999] h-0.5 bg-transparent"
        >
          <div
            style={{ width: `${scrollPercent}%` }}
            className="h-full bg-gradient-to-r from-amber-400 via-amber-500 to-sky-400 transition-[width] duration-200 ease-out"
          />
        </div>

        <Header
          darkMode={darkMode}
          onToggleTheme={() => setDarkMode((prev) => !prev)}
          onSignInClick={() => router.push("/sign-in")}
          onGetStartedClick={() => router.push("/sign-in")}
        />

        <main className="mx-auto max-w-7xl space-y-12 px-4 py-8 md:px-8">
          <motion.div
            initial={{ opacity: 0, x: -28 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: false, amount: "some" }}
            transition={{ duration: 0.8, ease: WEBSITE_EASE }}
          >
            <HeroSection onStartFree={scrollToDemo} onWatchDemo={scrollToDemo} />
          </motion.div>

          <LeftScrollCard delay={0.05}>
            <div id="features">
              <FeaturesSection />
            </div>
          </LeftScrollCard>

          <LeftScrollCard delay={0.08}>
            <ProductDemoSection />
          </LeftScrollCard>

          <LeftScrollCard delay={0.1}>
            <TestimonialsSection />
          </LeftScrollCard>
        </main>

        <Footer />

        <BottomNav
          darkMode={darkMode}
          onDemoClick={scrollToDemo}
          onSignInClick={() => router.push("/sign-in")}
        />
      </div>

      {/* Fixed Green Round WhatsApp Button (+917297821782) */}
      <a
        href={WHATSAPP_URL}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat on WhatsApp"
        title="Chat on WhatsApp"
        style={{ backgroundColor: "#25D366", color: "#ffffff" }}
        className="fixed bottom-24 right-4 md:bottom-8 md:right-8 z-[9999] flex h-14 w-14 items-center justify-center rounded-full shadow-2xl transition-transform hover:scale-110 active:scale-95"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          aria-hidden="true"
          className="h-7 w-7"
        >
          <path d="M20.52 3.48A11.82 11.82 0 0 0 12.04 0C5.46 0 .11 5.35.11 11.93c0 2.1.55 4.15 1.6 5.96L0 24l6.28-1.65a11.88 11.88 0 0 0 5.76 1.47h.01c6.58 0 11.93-5.35 11.93-11.93 0-3.19-1.24-6.19-3.46-8.41Zm-8.47 18.38h-.01a9.88 9.88 0 0 1-5.04-1.38l-.36-.21-3.73.98 1-3.64-.24-.37a9.86 9.86 0 0 1-1.51-5.31c0-5.46 4.44-9.9 9.91-9.9 2.64 0 5.13 1.03 7 2.9a9.84 9.84 0 0 1 2.9 7c0 5.46-4.45 9.9-9.91 9.9Zm5.43-7.42c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.95 1.17-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.49-1.77-1.66-2.07-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.07-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.8.37-.27.3-1.05 1.02-1.05 2.49s1.07 2.89 1.22 3.09c.15.2 2.11 3.22 5.11 4.52.71.31 1.27.49 1.71.63.72.23 1.37.2 1.89.12.58-.09 1.76-.72 2.01-1.41.25-.7.25-1.29.17-1.41-.07-.12-.27-.2-.57-.35Z" />
        </svg>
      </a>
    </>
  );
}
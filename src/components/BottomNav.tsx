"use client";

import React from "react";
import { usePathname, useRouter } from "next/navigation";
import { Home, Sparkles, Bot, MessageSquare, User } from "lucide-react";

interface BottomNavProps {
  darkMode: boolean;
  onDemoClick?: () => void;
  onSignInClick?: () => void;
}

export default function BottomNav({
  darkMode,
  onDemoClick,
  onSignInClick,
}: BottomNavProps) {
  const pathname = usePathname();
  const router = useRouter();

  const navItems = [
    {
      name: "Home",
      icon: Home,
      active: pathname === "/",
      onClick: () => {
        if (pathname === "/") {
          window.scrollTo({ top: 0, behavior: "smooth" });
        } else {
          router.push("/");
        }
      },
    },
    {
      name: "Features",
      icon: Sparkles,
      active: false,
      onClick: () => {
        const el = document.getElementById("features");
        if (el) el.scrollIntoView({ behavior: "smooth" });
        else if (onDemoClick) onDemoClick();
      },
    },
    {
      name: "NovaAI",
      icon: Bot,
      isCenter: true,
      active: pathname === "/chat",
      onClick: () => {
        if (onDemoClick) onDemoClick();
        else router.push("/chat");
      },
    },
    {
      name: "Demo",
      icon: MessageSquare,
      active: false,
      onClick: () => {
        if (onDemoClick) onDemoClick();
      },
    },
    {
      name: "Account",
      icon: User,
      active: pathname === "/sign-in",
      onClick: () => {
        if (onSignInClick) onSignInClick();
        else router.push("/sign-in");
      },
    },
  ];

  return (
    <nav
      aria-label="Mobile Bottom Navigation"
      className={`fixed bottom-0 left-0 right-0 z-50 md:hidden border-t backdrop-blur-md transition-colors duration-300 ${
        darkMode
          ? "border-zinc-800/80 bg-[#05070d]/95 text-zinc-400"
          : "border-zinc-200 bg-white/95 text-zinc-600"
      }`}
    >
      <div className="flex h-16 items-center justify-around px-2">
        {navItems.map((item) => {
          const Icon = item.icon;

          if (item.isCenter) {
            return (
              <button
                key={item.name}
                type="button"
                onClick={item.onClick}
                aria-label={item.name}
                className={`-mt-6 flex h-14 w-14 items-center justify-center rounded-full bg-amber-500 text-zinc-950 shadow-lg shadow-amber-500/30 border-4 transition-transform active:scale-95 ${
                  darkMode ? "border-[#05070d]" : "border-zinc-100"
                }`}
              >
                <Icon className="h-6 w-6 stroke-[2.3]" />
              </button>
            );
          }

          return (
            <button
              key={item.name}
              type="button"
              onClick={item.onClick}
              className={`flex flex-col items-center justify-center gap-1 px-3 py-1.5 text-[11px] font-medium transition-colors active:scale-95 ${
                item.active
                  ? "text-amber-500"
                  : darkMode
                  ? "text-zinc-400 hover:text-zinc-100"
                  : "text-zinc-500 hover:text-zinc-900"
              }`}
            >
              <Icon
                className={`h-5 w-5 ${
                  item.active ? "stroke-[2.2]" : "stroke-[1.8]"
                }`}
              />
              <span>{item.name}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
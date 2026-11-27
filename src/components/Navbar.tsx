"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Search,
  Sun,
  Moon,
  ArrowRight,
  Command,
  Menu,
  X,
  ChevronDown,
  Bot,
  Cpu,
  Layers,
  Zap,
  Code2,
  FileSearch,
  BookOpen,
  Terminal,
  Users,
  Rocket,
  Building2,
} from "lucide-react";

interface HeaderProps {
  darkMode?: boolean;
  onToggleTheme?: () => void;
  onSignInClick?: () => void;
  onGetStartedClick?: () => void;
  logoSrc?: string;
}

interface DropdownItem {
  title: string;
  desc: string;
  href: string;
  icon: React.ElementType;
  badge?: string;
}

interface NavItem {
  label: string;
  href: string;
  items?: DropdownItem[];
}

const NAV_ITEMS: NavItem[] = [
  {
    label: "Product",
    href: "#product",
    items: [
      {
        title: "Autonomous Agents",
        desc: "Multi-step task execution & planning",
        href: "/Product/agent",
        icon: Bot,
        badge: "New",
      },
      {
        title: "Deep Research Engine",
        desc: "Real-time web synthesis & citations",
        href: "/Product/deep",
        icon: FileSearch,
      },
      {
        title: "App & Code Builder",
        desc: "Generate & deploy full-stack apps fast",
        href: "/Product/code",
        icon: Code2,
      },
      {
        title: "Multimodal Studio",
        desc: "Work with text, images, audio & files",
        href: "/Product/multimodel",
        icon: Layers,
      },
    ],
  },
  {
    label: "Solutions",
    href: "#solutions",
    items: [
      {
        title: "For Developers",
        desc: "APIs, SDKs & automated code workflows",
        href: "/solutions/developer",
        icon: Terminal,
      },
      {
        title: "For Startups",
        desc: "Ship MVPs, pitch decks & GTM plans",
        href: "/solutions/startup",
        icon: Rocket,
      },
      {
        title: "Workflow Automation",
        desc: "Connect 50+ tools without manual work",
        href: "/solutions/workflows",
        icon: Zap,
      },
      {
        title: "Enterprise Teams",
        desc: "Custom deployments & dedicated security",
        href: "/solutions/teams",
        icon: Building2,
      },
    ],
  },
  {
    label: "Resources",
    href: "#resources",
    items: [
      {
        title: "Documentation",
        desc: "Quickstart guides, API refs & examples",
        href: "/resources/docs",
        icon: BookOpen,
      },
      {
        title: "Agent Templates",
        desc: "Ready-to-use workflows for daily tasks",
        href: "/resources/template",
        icon: Cpu,
      },
      {
        title: "Community & Discord",
        desc: "Join builders, creators & AI engineers",
        href: "/resources/community",
        icon: Users,
      },
    ],
  },{label : "Models",href: "/models"},
  { label: "Enterprise", href: "/enterprise" },
];

export default function Header({
  darkMode = true,
  onToggleTheme,
  onSignInClick,
  onGetStartedClick,
  logoSrc = "/icon.svg",
}: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [mobileExpanded, setMobileExpanded] = useState<string | null>(null);
  const navRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(event.target as Node)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-800/80 bg-[#05070d]/90 backdrop-blur-md">
      <div
        ref={navRef}
        className="mx-auto flex max-w-7xl items-center justify-between gap-2 px-4 py-3 md:px-8"
      >
        {/* Brand Logo */}
        <a href="/" className="flex shrink-0 items-center gap-2 group">
          <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center overflow-hidden rounded-xl border border-amber-400/30 bg-zinc-900 shadow-lg shadow-amber-500/20 transition-transform group-hover:scale-105">
            <img
              src={logoSrc}
              alt="NovaAI Logo"
              className="h-full w-full object-cover"
            />
          </div>
          <span className="text-lg sm:text-xl font-bold tracking-tight text-white">
            Nova<span className="text-amber-400">AI</span>
          </span>
        </a>

        {/* Desktop Navigation with Rich Dropdowns */}
        <nav className="hidden lg:flex items-center gap-1 text-sm font-medium text-zinc-300">
          {NAV_ITEMS.map((item) => {
            const isOpen = openDropdown === item.label;
            const hasItems = Boolean(item.items && item.items.length > 0);

            return (
              <div
                key={item.label}
                className="relative"
                onMouseEnter={() => hasItems && setOpenDropdown(item.label)}
                onMouseLeave={() => hasItems && setOpenDropdown(null)}
              >
                {hasItems ? (
                  <button
                    type="button"
                    onClick={() =>
                      setOpenDropdown(isOpen ? null : item.label)
                    }
                    className={`flex items-center gap-1.5 rounded-lg px-3.5 py-2 transition-colors ${
                      isOpen
                        ? "bg-zinc-900 text-amber-400"
                        : "text-zinc-300 hover:bg-zinc-900/60 hover:text-white"
                    }`}
                  >
                    <span>{item.label}</span>
                    <ChevronDown
                      size={14}
                      className={`transition-transform duration-200 ${
                        isOpen ? "rotate-180 text-amber-400" : "text-zinc-400"
                      }`}
                    />
                  </button>
                ) : (
                  <a
                    href={item.href}
                    className="flex items-center rounded-lg px-3.5 py-2 text-zinc-300 transition-colors hover:bg-zinc-900/60 hover:text-amber-400"
                  >
                    {item.label}
                  </a>
                )}

                {/* Dropdown Box */}
                {hasItems && isOpen && (
                  <div className="absolute left-0 top-full pt-2 w-80 z-50">
                    <div className="rounded-2xl border border-zinc-800 bg-[#090d16]/95 p-2 shadow-2xl shadow-black/70 backdrop-blur-xl">
                      <div className="space-y-1">
                        {item.items!.map((sub) => {
                          const Icon = sub.icon;
                          return (
                            <a
                              key={sub.title}
                              href={sub.href}
                              onClick={() => setOpenDropdown(null)}
                              className="group/item flex items-start gap-3 rounded-xl p-2.5 transition hover:bg-zinc-900/90"
                            >
                              <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-amber-500/20 bg-amber-500/10 text-amber-400 transition group-hover/item:border-amber-400/50 group-hover/item:bg-amber-400 group-hover/item:text-zinc-950">
                                <Icon size={17} />
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-semibold text-white group-hover/item:text-amber-300 transition">
                                    {sub.title}
                                  </span>
                                  {sub.badge && (
                                    <span className="rounded-full bg-amber-500/20 px-1.5 py-0.5 text-[10px] font-semibold text-amber-300 border border-amber-400/30">
                                      {sub.badge}
                                    </span>
                                  )}
                                </div>
                                <p className="mt-0.5 text-[11px] leading-snug text-zinc-400">
                                  {sub.desc}
                                </p>
                              </div>
                            </a>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Right Action Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2">
         
          <button
            type="button"
            onClick={onToggleTheme}
            aria-label="Toggle Theme"
            className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900/90 text-amber-300 transition hover:border-zinc-700 hover:bg-zinc-800"
          >
            {darkMode ? <Sun size={15} /> : <Moon size={15} />}
          </button>

          <button
            type="button"
            aria-label="Command Palette"
            className="hidden xl:flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900/90 text-zinc-300 transition hover:border-zinc-700 hover:text-white"
          >
            <Command size={14} />
          </button>

          <button
            type="button"
            onClick={onGetStartedClick}
            className="inline-flex items-center gap-1 rounded-lg bg-gradient-to-r from-amber-400 to-orange-500 px-3 py-1.5 sm:px-4 sm:py-2 text-xs font-bold text-zinc-950 shadow-lg shadow-amber-500/20 transition hover:brightness-110 whitespace-nowrap"
          >
            <span>Get Started</span>
            <ArrowRight size={13} />
          </button>

          {/* Mobile Hamburger Toggle */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-label="Toggle Menu"
            className="flex lg:hidden h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900 text-zinc-200 hover:border-zinc-700 hover:text-white"
          >
            {mobileMenuOpen ? <X size={17} /> : <Menu size={17} />}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown Drawer with Accordion */}
      {mobileMenuOpen && (
        <div className="border-t border-zinc-800/90 bg-[#070a12] px-4 py-4 lg:hidden">
          <nav className="flex flex-col space-y-1.5">
            {NAV_ITEMS.map((item) => {
              const hasItems = Boolean(item.items && item.items.length > 0);
              const isExpanded = mobileExpanded === item.label;

              return (
                <div key={item.label} className="rounded-xl overflow-hidden">
                  {hasItems ? (
                    <>
                      <button
                        type="button"
                        onClick={() =>
                          setMobileExpanded(isExpanded ? null : item.label)
                        }
                        className="flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium text-zinc-200 hover:bg-zinc-900 hover:text-amber-400"
                      >
                        <span>{item.label}</span>
                        <ChevronDown
                          size={15}
                          className={`transition-transform duration-200 ${
                            isExpanded
                              ? "rotate-180 text-amber-400"
                              : "text-zinc-400"
                          }`}
                        />
                      </button>

                      {isExpanded && (
                        <div className="mt-1 space-y-1 rounded-xl border border-zinc-800/80 bg-zinc-900/50 p-2">
                          {item.items!.map((sub) => {
                            const Icon = sub.icon;
                            return (
                              <a
                                key={sub.title}
                                href={sub.href}
                                onClick={() => setMobileMenuOpen(false)}
                                className="flex items-start gap-2.5 rounded-lg p-2 hover:bg-zinc-900"
                              >
                                <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-amber-500/15 text-amber-400">
                                  <Icon size={14} />
                                </div>
                                <div>
                                  <p className="text-xs font-semibold text-white">
                                    {sub.title}
                                  </p>
                                  <p className="text-[11px] text-zinc-400">
                                    {sub.desc}
                                  </p>
                                </div>
                              </a>
                            );
                          })}
                        </div>
                      )}
                    </>
                  ) : (
                    <a
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className="block rounded-lg px-3 py-2.5 text-sm font-medium text-zinc-200 hover:bg-zinc-900 hover:text-amber-400"
                    >
                      {item.label}
                    </a>
                  )}
                </div>
              );
            })}
          </nav>

          <div className="mt-4 flex items-center gap-2 border-t border-zinc-800 pt-4">
            {onSignInClick && (
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  onSignInClick();
                }}
                className="flex-1 rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-xs font-semibold text-zinc-200 hover:border-zinc-600"
              >
                Sign In
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                onGetStartedClick?.();
              }}
              className="flex-1 rounded-lg bg-gradient-to-r from-amber-400 to-orange-500 px-3 py-2 text-xs font-bold text-zinc-950"
            >
              Get Started
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
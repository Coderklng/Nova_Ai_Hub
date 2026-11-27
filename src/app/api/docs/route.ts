import { NextResponse } from "next/server";

export interface DocSectionItem {
  id: string;
  category: "Getting Started" | "Architecture" | "PWA & Runtime";
  title: string;
  badge?: string;
  summary: string;
  points: string[];
  codeTitle?: string;
  code?: string;
  note?: string;
}

const DEFAULT_DOC_SECTIONS: DocSectionItem[] = [
  {
    id: "overview",
    category: "Getting Started",
    title: "NovaAI Platform Overview",
    badge: "v1.0",
    summary:
      "NovaAI combines a dark-mode Next.js workspace, specialized agent modes, model routing, and installable PWA support into a single responsive interface.",
    points: [
      "Built on Next.js App Router with React client workspaces and Tailwind CSS styling.",
      "Supports multi-mode agent sessions (Researcher, App Builder, Planner, Debugger).",
      "Designed for fast local workflows, clear visual hierarchy, and keyboard-first navigation.",
    ],
    codeTitle: "Project Structure",
    code: `src/
├── app/
│   ├── layout.tsx
│   ├── globals.css
│   ├── docs/page.tsx
│   └── page.tsx
├── components/
│   └── AgentPage.tsx
└── public/
    └── icons/
        ├── icon-192.png
        └── icon-512.png`,
    note: "Keep layout containers cleanly bounded so scroll stays inside the reading column instead of leaking to the outer viewport.",
  },
  {
    id: "quickstart",
    category: "Getting Started",
    title: "Local Setup & Dev Server",
    summary:
      "Start the development server cleanly, verify Tailwind compilation, and confirm manifest icons load without 404 responses.",
    points: [
      "Install dependencies and run clean dev/build scripts without conflicting bundler flags.",
      "Ensure icon assets exist in public/icons/ matching your web app manifest paths.",
      "Use hard refresh (Ctrl + Shift + R) after changing styles or PWA configuration.",
    ],
    codeTitle: "Terminal Commands",
    code: `npm install
npm run dev`,
    note: "If CSS looks unstyled after config changes, clear .next and restart the dev server.",
  },
  {
    id: "agent-workspace",
    category: "Architecture",
    title: "Agent Workspace & Modes",
    summary:
      "The agent interface separates thread management, live conversation streaming, and prompt controls into distinct regions.",
    points: [
      "Left rail manages chat threads, new session creation, and quick exit back to the main view.",
      "Top bar shows the active mode, selected model, generation status, and quick back navigation.",
      "Bottom composer supports multi-line input, Enter-to-send, voice dictation, and stream stop controls.",
    ],
    codeTitle: "Mode & Model Selection Pattern",
    code: `const activeModel = selectedModel === "auto"
  ? "Smart routing"
  : selectedModel;`,
  },
  {
    id: "pwa-setup",
    category: "PWA & Runtime",
    title: "PWA Manifest & Icons",
    summary:
      "Installable PWA behavior depends on a valid manifest and accessible PNG icons in public/icons/.",
    points: [
      "Provide both 192x192 and 512x512 PNG icons in public/icons/.",
      "Inspect DevTools -> Application -> Manifest to verify zero icon or fetch errors.",
      "Test offline fallback and service worker updates carefully before production release.",
    ],
    codeTitle: "Manifest Icon Entries",
    code: `{
  "icons": [
    { "src": "/icons/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icons/icon-512.png", "sizes": "512x512", "type": "image/png" }
  ]
}`,
    note: "Always verify icon dimensions and paths match what your manifest declares.",
  },
];

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") || "").trim().toLowerCase();

  const sections = q
    ? DEFAULT_DOC_SECTIONS.filter(
        (sec) =>
          sec.title.toLowerCase().includes(q) ||
          sec.summary.toLowerCase().includes(q) ||
          sec.category.toLowerCase().includes(q) ||
          sec.points.some((p) => p.toLowerCase().includes(q)) ||
          (sec.code && sec.code.toLowerCase().includes(q))
      )
    : DEFAULT_DOC_SECTIONS;

  return NextResponse.json({
    ok: true,
    updatedAt: "2026-11-26",
    sections,
  });
}
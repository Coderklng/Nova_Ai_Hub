import Link from "next/link";

export default function OfflinePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-zinc-950 px-4 text-center text-zinc-100">
      <div className="max-w-md space-y-4 rounded-2xl border border-zinc-800 bg-zinc-900/90 p-6">
        <p className="text-xs font-bold uppercase tracking-wider text-amber-400">
          Offline Mode
        </p>
        <h1 className="text-2xl font-extrabold text-white">
          Internet connection nahi mil raha
        </h1>
        <p className="text-sm text-zinc-400">
          Net wapas aate hi NovaAI workspace normal chalne lagega.
        </p>
        <Link
          href="/dashboard"
          className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 px-4 py-2 text-xs font-bold text-zinc-950"
        >
          Dashboard kholo
        </Link>
      </div>
    </main>
  );
}
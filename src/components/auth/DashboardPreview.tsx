// Decorative, non-interactive stand-in for the Performance dashboard, shown
// blurred behind the onboarding modal to signal "your analytics live here".
// Pure static markup — no data, no hooks.

function Tile({ tone }: { tone: "up" | "down" | "neutral" }) {
  const valueTone =
    tone === "up"
      ? "bg-emerald-500/70"
      : tone === "down"
        ? "bg-rose-500/70"
        : "bg-zinc-300 dark:bg-zinc-700";
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <div className="h-3 w-16 rounded bg-zinc-200 dark:bg-zinc-800" />
      <div className={`mt-3 h-6 w-24 rounded ${valueTone}`} />
      <div className="mt-3 flex items-end gap-1">
        {[5, 8, 6, 10, 7, 12, 9].map((h, i) => (
          <span key={i} className="w-2 rounded-sm bg-zinc-100 dark:bg-zinc-800/70" style={{ height: h * 3 }} />
        ))}
      </div>
    </div>
  );
}

function AreaChart() {
  return (
    <svg viewBox="0 0 600 200" className="mt-4 h-40 w-full" preserveAspectRatio="none" aria-hidden="true">
      <defs>
        <linearGradient id="dpg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgb(16 185 129)" stopOpacity="0.35" />
          <stop offset="100%" stopColor="rgb(16 185 129)" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path
        d="M0 160 L60 150 L120 158 L180 120 L240 132 L300 96 L360 104 L420 70 L480 82 L540 44 L600 30 L600 200 L0 200 Z"
        fill="url(#dpg)"
      />
      <path
        d="M0 160 L60 150 L120 158 L180 120 L240 132 L300 96 L360 104 L420 70 L480 82 L540 44 L600 30"
        fill="none"
        stroke="rgb(16 185 129)"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function BarList() {
  return (
    <div className="space-y-3">
      {[80, 62, 48, 35, 22].map((w, i) => (
        <div key={i} className="flex items-center gap-3">
          <div className="h-3 w-16 rounded bg-zinc-200 dark:bg-zinc-800" />
          <div className="h-3 flex-1 rounded bg-zinc-100 dark:bg-zinc-800/60">
            <div className="h-3 rounded bg-blue-500/50" style={{ width: `${w}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <div className="mb-2 h-4 w-32 rounded bg-zinc-200 dark:bg-zinc-800" />
      {children}
    </div>
  );
}

export default function DashboardPreview() {
  return (
    <div className="mx-auto w-full max-w-[1400px] px-4 py-8">
      <div className="flex items-center justify-between">
        <div className="h-9 w-36 rounded bg-zinc-200 dark:bg-zinc-800" />
        <div className="h-9 w-48 rounded-full bg-zinc-200 dark:bg-zinc-800" />
      </div>

      <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Tile tone="up" />
        <Tile tone="down" />
        <Tile tone="up" />
        <Tile tone="neutral" />
      </div>

      <div className="mt-4">
        <Card>
          <AreaChart />
        </Card>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <BarList />
        </Card>
        <Card>
          <BarList />
        </Card>
      </div>
    </div>
  );
}

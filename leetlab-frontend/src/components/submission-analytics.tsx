import * as React from "react";

interface SubmissionAnalyticsProps {
  submissions: any[];
  tagStats: Record<string, { easy: number; medium: number; hard: number; total: number }>;
  stats: {
    totalSolved?: number;
    totalSubmissions?: number;
    acceptedSubmissions?: number;
    acceptanceRate?: string;
  };
}

/** Lightweight bar-chart and language breakdown analytics */
export function SubmissionAnalytics({ submissions, tagStats, stats }: SubmissionAnalyticsProps) {
  const [view, setView] = React.useState<"languages" | "weekday" | "hourly">("languages");

  // Language breakdown
  const langMap: Record<string, number> = {};
  submissions.forEach(s => {
    if (s.language) langMap[s.language] = (langMap[s.language] || 0) + 1;
  });
  const langEntries = Object.entries(langMap).sort((a, b) => b[1] - a[1]);
  const maxLang = Math.max(...langEntries.map(e => e[1]), 1);

  // Weekday activity
  const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const wdMap: number[] = [0, 0, 0, 0, 0, 0, 0];
  submissions.forEach(s => {
    if (s.createdAt) {
      const wd = new Date(s.createdAt).getDay();
      wdMap[wd]++;
    }
  });
  const maxWd = Math.max(...wdMap, 1);

  // Hourly activity (0-23)
  const hourMap: number[] = Array(24).fill(0);
  submissions.forEach(s => {
    if (s.createdAt) {
      const h = new Date(s.createdAt).getHours();
      hourMap[h]++;
    }
  });
  const maxHour = Math.max(...hourMap, 1);

  const LANG_COLORS: Record<string, string> = {
    PYTHON: "#3b82f6", JAVASCRIPT: "#f59e0b", JAVA: "#f97316",
    CPP: "#8b5cf6", C: "#6b7280", GO: "#06b6d4", RUST: "#ef4444",
  };

  const tabs = [
    { key: "languages", label: "Languages" },
    { key: "weekday", label: "Weekday" },
    { key: "hourly", label: "Hourly" },
  ] as const;

  if (submissions.length === 0) return null;

  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl font-bold">Submission Analytics</h2>
        <div className="flex gap-1 rounded-lg border border-border p-0.5">
          {tabs.map(t => (
            <button
              key={t.key}
              onClick={() => setView(t.key)}
              className={`rounded-md px-2.5 py-1 font-mono text-[10px] uppercase tracking-widest transition-all ${
                view === t.key
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4">
        {/* Languages view */}
        {view === "languages" && (
          <div className="space-y-3">
            {langEntries.length === 0 && (
              <p className="text-sm text-muted-foreground">No language data available.</p>
            )}
            {langEntries.map(([lang, count]) => {
              const pct = (count / maxLang) * 100;
              const color = LANG_COLORS[lang.toUpperCase()] || "var(--primary)";
              return (
                <div key={lang} className="group flex items-center gap-3">
                  <div className="w-24 shrink-0 truncate font-mono text-xs text-muted-foreground">{lang}</div>
                  <div className="flex-1">
                    <div className="h-5 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${pct}%`, backgroundColor: color }}
                      />
                    </div>
                  </div>
                  <div className="w-10 text-right font-mono text-xs font-bold text-foreground">{count}</div>
                </div>
              );
            })}
          </div>
        )}

        {/* Weekday view */}
        {view === "weekday" && (
          <div className="flex items-end justify-between gap-2 h-32">
            {weekdays.map((wd, i) => {
              const h = wdMap[i];
              const pct = h / maxWd;
              return (
                <div key={wd} className="flex flex-1 flex-col items-center gap-1" title={`${wd}: ${h} submissions`}>
                  <span className="font-mono text-[10px] text-muted-foreground">{h || ""}</span>
                  <div className="w-full overflow-hidden rounded-t-md bg-muted" style={{ height: `${Math.max(pct * 80, 4)}px` }}>
                    <div
                      className="h-full w-full rounded-t-md transition-all duration-700"
                      style={{
                        background: `linear-gradient(to top, var(--primary), var(--accent))`,
                        opacity: pct > 0 ? 0.6 + pct * 0.4 : 0.15,
                      }}
                    />
                  </div>
                  <span className="font-mono text-[9px] text-muted-foreground">{wd}</span>
                </div>
              );
            })}
          </div>
        )}

        {/* Hourly view */}
        {view === "hourly" && (
          <div className="space-y-1">
            <div className="flex items-end gap-0.5 h-20">
              {hourMap.map((h, i) => {
                const pct = h / maxHour;
                return (
                  <div
                    key={i}
                    className="flex-1 rounded-sm transition-all duration-500 hover:opacity-100"
                    style={{
                      height: `${Math.max(pct * 80, 2)}px`,
                      background: `linear-gradient(to top, var(--primary), var(--accent))`,
                      opacity: pct > 0 ? 0.5 + pct * 0.5 : 0.1,
                    }}
                    title={`${i}:00 — ${h} submissions`}
                  />
                );
              })}
            </div>
            <div className="flex justify-between font-mono text-[8px] text-muted-foreground">
              <span>00h</span>
              <span>06h</span>
              <span>12h</span>
              <span>18h</span>
              <span>23h</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

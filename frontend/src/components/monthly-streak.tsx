import * as React from "react";
import { Flame } from "lucide-react";
import type { ActivityDay } from "@/lib/api";

interface Props {
  data: ActivityDay[];
  currentStreak?: number;
  longestStreak?: number;
}

export function MonthlyStreak({ data, currentStreak = 0, longestStreak = 0 }: Props) {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const monthName = now.toLocaleDateString("en-US", { month: "long", year: "numeric" });

  const map = React.useMemo(() => {
    const m = new Map<string, number>();
    data.forEach((d) => m.set(d.date, d.count));
    return m;
  }, [data]);

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startWeekday = firstDay.getDay(); // 0=Sun

  const cells: { day: number | null; date: string | null; active: boolean; isToday: boolean }[] = [];
  for (let i = 0; i < startWeekday; i++) cells.push({ day: null, date: null, active: false, isToday: false });
  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(year, month, d);
    const ds = date.toISOString().slice(0, 10);
    const cnt = map.get(ds) || 0;
    cells.push({
      day: d,
      date: ds,
      active: cnt > 0,
      isToday: d === now.getDate(),
    });
  }

  const activeThisMonth = cells.filter((c) => c.active).length;

  return (
    <div className="rounded-xl border border-border bg-card p-5 hover-glow">
      <div className="mb-4 flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 font-display text-lg font-bold">
            <Flame className="h-4 w-4 text-medium" />
            {monthName}
          </div>
          <div className="mt-1 font-mono text-xs text-muted-foreground">
            {activeThisMonth}/{daysInMonth} days active
          </div>
        </div>
        <div className="text-right">
          <div className="font-display text-2xl font-bold text-primary">{currentStreak}</div>
          <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            day streak
          </div>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1.5">
        {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
          <div
            key={i}
            className="text-center font-mono text-[10px] text-muted-foreground"
          >
            {d}
          </div>
        ))}
        {cells.map((c, i) => {
          if (c.day === null) return <div key={i} />;
          return (
            <div
              key={i}
              title={c.date ?? ""}
              className={[
                "aspect-square rounded-md flex items-center justify-center text-[11px] font-mono transition-all",
                c.active
                  ? "bg-primary/80 text-primary-foreground shadow-[0_0_12px_var(--glow)]"
                  : "bg-muted/50 text-muted-foreground",
                c.isToday ? "ring-2 ring-primary scale-110" : "",
              ].join(" ")}
            >
              {c.day}
            </div>
          );
        })}
      </div>

      <div className="mt-4 flex justify-between border-t border-border/60 pt-3 text-center">
        <div>
          <div className="font-display text-xl font-bold">{longestStreak}</div>
          <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">longest</div>
        </div>
        <div>
          <div className="font-display text-xl font-bold text-primary">{currentStreak}</div>
          <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">current</div>
        </div>
        <div>
          <div className="font-display text-xl font-bold">{activeThisMonth}</div>
          <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">this month</div>
        </div>
      </div>
    </div>
  );
}

import * as React from "react";
import { Flame, CheckCircle2, Award } from "lucide-react";
import type { ActivityDay } from "@/lib/api";
import { cn } from "@/lib/utils";

interface Props {
  data: ActivityDay[];
  currentStreak?: number;
  longestStreak?: number;
}

export function MonthlyStreak({ data, currentStreak = 0, longestStreak = 0 }: Props) {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const monthName = now.toLocaleDateString("en-US", { month: "long" });

  const map = React.useMemo(() => {
    const m = new Map<string, number>();
    data.forEach((d) => m.set(d.date, d.count));
    return m;
  }, [data]);

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startWeekday = firstDay.getDay(); 

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
    <div className="rounded-xl border border-border bg-card p-5 hover-glow transition-all">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 font-display text-xl font-bold">
            <Flame className="h-5 w-5 text-medium animate-pulse" />
            {monthName}
          </div>
          <div className="mt-1 font-mono text-xs text-muted-foreground flex items-center gap-1.5">
            <CheckCircle2 className="h-3 w-3 text-easy" />
            {activeThisMonth}/{daysInMonth} days active
          </div>
        </div>
        <div className="text-right">
          <div className="font-display text-3xl font-bold text-primary drop-shadow-sm">{currentStreak}</div>
          <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground font-bold">
            day streak
          </div>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1.5">
        {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
          <div
            key={i}
            className="text-center font-mono text-[10px] font-bold text-muted-foreground/60 mb-1"
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
              className={cn(
                "relative aspect-square rounded-lg flex items-center justify-center text-[11px] font-bold font-mono transition-all duration-300",
                c.active
                  ? "bg-primary text-primary-foreground shadow-[0_0_15px_var(--glow)] scale-[1.02] border border-primary/50"
                  : "bg-muted/30 text-muted-foreground/40 hover:bg-muted/50",
                c.isToday && !c.active && "ring-2 ring-primary/40 ring-offset-2 ring-offset-card"
              )}
            >
              {c.active ? (
                <Award className="absolute -top-1 -right-1 h-3 w-3 text-primary-foreground fill-primary" />
              ) : null}
              {c.day}
            </div>
          );
        })}
      </div>

      <div className="mt-6 grid grid-cols-3 gap-2 border-t border-border/60 pt-4 text-center">
        <div className="p-2 rounded-lg bg-muted/20">
          <div className="font-display text-lg font-black">{longestStreak}</div>
          <div className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">longest</div>
        </div>
        <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
          <div className="font-display text-lg font-black text-primary">{currentStreak}</div>
          <div className="font-mono text-[9px] uppercase tracking-widest text-primary/70">current</div>
        </div>
        <div className="p-2 rounded-lg bg-muted/20">
          <div className="font-display text-lg font-black text-medium">{activeThisMonth}</div>
          <div className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">month</div>
        </div>
      </div>
    </div>
  );
}

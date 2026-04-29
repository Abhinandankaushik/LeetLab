import * as React from "react";
import { Flame, Calendar, TrendingUp, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

interface MonthlyStreakTrackerProps {
  heatmap: number[];
  heatmapKeys: string[];
  currentStreak: number;
  longestStreak: number;
}

export function MonthlyStreakTracker({
  heatmap,
  heatmapKeys,
  currentStreak,
  longestStreak,
}: MonthlyStreakTrackerProps) {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const todayDate = now.getDate();

  // Build a map of dateKey -> count for this month
  const monthKey = `${year}-${String(month + 1).padStart(2, "0")}`;
  const monthData: Record<number, number> = {};
  heatmapKeys.forEach((k, i) => {
    if (k.startsWith(monthKey)) {
      const day = parseInt(k.slice(-2), 10);
      monthData[day] = Number(heatmap[i] ?? 0);
    }
  });

  const solvedThisMonth = Object.values(monthData).reduce((a, b) => a + b, 0);
  const activeDaysThisMonth = Object.values(monthData).filter(v => v > 0).length;

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const monthName = now.toLocaleString("default", { month: "long" });

  const WEEKDAYS = ["S", "M", "T", "W", "T", "F", "S"];

  const getColorClass = (count: number) => {
    if (count >= 6) return "bg-primary shadow-[0_0_12px_rgba(var(--primary),0.4)] text-primary-foreground";
    if (count >= 3) return "bg-primary/70 text-primary-foreground";
    if (count >= 1) return "bg-primary/30 text-foreground";
    return "bg-muted/30 text-muted-foreground/50";
  };

  return (
    <div className="rounded-2xl border border-border/50 bg-card/40 p-6 shadow-xl backdrop-blur-sm overflow-hidden relative group">
      {/* Decorative background glow */}
      <div className="absolute -top-24 -right-24 h-48 w-48 bg-primary/10 blur-[80px] pointer-events-none group-hover:bg-primary/20 transition-colors duration-700" />
      
      {/* Header */}
      <div className="relative flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-primary/10 text-primary">
            <Calendar className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-display text-lg font-bold tracking-tight">{monthName}</h3>
            <p className="text-[10px] text-muted-foreground font-mono uppercase tracking-widest">{year}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {currentStreak > 0 && (
            <div className="flex items-center gap-1.5 rounded-full bg-orange-500/10 border border-orange-500/20 px-3 py-1 font-mono text-[11px] font-bold text-orange-500 animate-pulse">
              <Flame className="h-3.5 w-3.5 fill-current" />
              {currentStreak}d
            </div>
          )}
          <div className="flex items-center gap-1.5 rounded-full bg-primary/10 border border-primary/20 px-3 py-1 font-mono text-[11px] font-bold text-primary">
            <TrendingUp className="h-3.5 w-3.5" />
            {longestStreak}
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="relative grid grid-cols-3 gap-4 mb-8">
        <StatCard label="Activity" value={activeDaysThisMonth} icon={<Zap className="h-3 w-3" />} />
        <StatCard label="Total Hits" value={solvedThisMonth} primary />
        <StatCard label="Best Streak" value={longestStreak} />
      </div>

      {/* Calendar grid */}
      <div className="relative">
        <div className="mb-3 grid grid-cols-7 gap-1">
          {WEEKDAYS.map((d, i) => (
            <div key={i} className="text-center font-mono text-[10px] font-bold text-muted-foreground/60 uppercase">{d}</div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1.5">
          {Array.from({ length: firstDayOfMonth }).map((_, i) => (
            <div key={`pad-${i}`} className="h-8" />
          ))}

          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const count = monthData[day] ?? 0;
            const isToday = day === todayDate;
            const isFuture = day > todayDate;
            const isActive = count > 0;

            return (
              <div
                key={day}
                title={`${monthName} ${day}: ${count} activity`}
                className={cn(
                  "relative flex h-8 w-full items-center justify-center rounded-lg font-mono text-xs transition-all duration-300",
                  isFuture ? "opacity-20 border border-dashed border-border/60" : getColorClass(count),
                  isToday && "ring-2 ring-primary ring-offset-2 ring-offset-card scale-110 z-10",
                  !isFuture && "hover:scale-110 hover:z-20 cursor-default"
                )}
              >
                {day}
                {isActive && count > 1 && (
                  <span className="absolute -top-1 -right-1 h-3.5 w-3.5 rounded-full bg-white text-primary text-[8px] font-black flex items-center justify-center shadow-lg border border-primary/10">
                    {count > 9 ? "+" : count}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-6 pt-4 border-t border-border/40 flex items-center justify-between">
        <div className="text-[9px] font-bold text-muted-foreground/60 uppercase tracking-widest">Consistency Map</div>
        <div className="flex items-center gap-1.5 text-[9px] text-muted-foreground select-none uppercase tracking-widest font-bold">
          <div className="h-2 w-2 rounded-sm bg-muted/30" />
          <div className="h-2 w-2 rounded-sm bg-primary/30" />
          <div className="h-2 w-2 rounded-sm bg-primary/70" />
          <div className="h-2 w-2 rounded-sm bg-primary" />
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon, primary }: { label: string; value: number | string; icon?: React.ReactNode; primary?: boolean }) {
  return (
    <div className={cn(
      "rounded-xl px-2 py-3 border transition-all duration-300",
      primary ? "bg-primary/5 border-primary/20" : "bg-muted/20 border-transparent hover:border-border/60"
    )}>
      <div className={cn("text-xl font-bold tracking-tight mb-0.5", primary ? "text-primary" : "text-foreground")}>
        {value}
      </div>
      <div className="flex items-center justify-center gap-1 text-[9px] font-bold uppercase tracking-wider text-muted-foreground/80">
        {icon} {label}
      </div>
    </div>
  );
}


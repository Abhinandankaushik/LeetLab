import * as React from "react";
import { cn } from "@/lib/utils";
import { Flame, Award } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface HeatmapProps {
  heatmap: number[];
  heatmapKeys: string[];
  currentStreak: number;
  longestStreak: number;
  selectedYear: number | null; // null means "Last 12 Months"
  onYearChange: (year: number | null) => void;
  className?: string;
}

const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const DAY_LABELS = ["", "Mon", "", "Wed", "", "Fri", ""];

export function ProfileHeatmap({
  heatmap,
  heatmapKeys,
  currentStreak,
  longestStreak,
  selectedYear,
  onYearChange,
  className = ""
}: HeatmapProps) {
  const [tooltip, setTooltip] = React.useState<{ x: number; y: number; label: string; count: number } | null>(null);
  
  const CELL = 11;
  const GAP = 2.5;

  const source = heatmap;
  const keys = heatmapKeys;

  const cells: { key: string; count: number; date: Date | null }[] = keys.map((k, i) => ({
    key: k,
    count: Number(source[i] ?? 0),
    date: (() => { try { const d = new Date(k); return isNaN(d.getTime()) ? null : d; } catch { return null; } })(),
  }));

  const firstDate = cells.find(c => c.date)?.date ?? new Date();
  const startDow = firstDate.getUTCDay();
  const padCount = startDow;
  const padded: ({ key: string; count: number; date: Date | null } | null)[] = [
    ...Array(padCount).fill(null),
    ...cells,
  ];

  const numWeeks = Math.ceil(padded.length / 7);
  const weeks: (typeof padded[0])[][] = [];
  for (let w = 0; w < numWeeks; w++) {
    weeks.push(padded.slice(w * 7, w * 7 + 7));
  }

  const monthLabels: { weekIdx: number; label: string }[] = [];
  let lastMonth = -1;
  weeks.forEach((col, wi) => {
    const firstReal = col.find(c => c?.date);
    if (!firstReal?.date) return;
    const m = firstReal.date.getUTCMonth();
    if (m !== lastMonth) {
      monthLabels.push({ weekIdx: wi, label: MONTH_NAMES[m] });
      lastMonth = m;
    }
  });

  const getColor = (count: number): string => {
    if (count <= 0) return "rgba(128, 128, 128, 0.08)";
    if (count === 1) return "oklch(0.50 0.15 145 / 0.3)";
    if (count <= 3) return "oklch(0.60 0.18 145 / 0.5)";
    if (count <= 6) return "oklch(0.75 0.20 145 / 0.8)";
    return "var(--primary)";
  };

  const handleMouseEnter = (e: React.MouseEvent, cell: (typeof cells)[0]) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setTooltip({
      x: rect.left + rect.width / 2,
      y: rect.top,
      label: cell.key,
      count: cell.count,
    });
  };

  const formatDateLabel = (key: string) => {
    try {
      const d = new Date(key);
      if (isNaN(d.getTime())) return key;
      return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    } catch { return key; }
  };

  const currentFullYear = new Date().getUTCFullYear();
  const years = [currentFullYear, currentFullYear - 1, currentFullYear - 2];

  return (
    <div className={cn("relative rounded-2xl border border-border/50 bg-card/30 p-5 backdrop-blur-md", className)}>
      {/* Header with Stats & Year Picker */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500/10 text-orange-500 shadow-[0_0_15px_rgba(249,115,22,0.1)] transition-transform hover:scale-110">
              <Flame className="h-5 w-5 fill-current" />
            </div>
            <div>
              <div className="text-xl font-bold tracking-tight">{currentStreak}d</div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70">Current Streak</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary shadow-[0_0_15px_rgba(var(--primary),0.1)] transition-transform hover:scale-110">
              <Award className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xl font-bold tracking-tight text-primary">{longestStreak}d</div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70">Longest Streak</div>
            </div>
          </div>
        </div>

        {/* Beautiful Custom Dropdown */}
        <div className="min-w-[160px]">
          <Select
            value={selectedYear?.toString() || "last"}
            onValueChange={(val) => onYearChange(val === "last" ? null : parseInt(val))}
          >
            <SelectTrigger className="h-9 bg-muted/40 border-border/40 font-mono text-[11px] font-bold uppercase tracking-wider hover:bg-muted/60 hover:border-primary/30 transition-all">
              <SelectValue placeholder="Select Year" />
            </SelectTrigger>
            <SelectContent className="bg-card border-border/60 shadow-2xl backdrop-blur-xl">
              <SelectItem value="last" className="font-mono text-[11px] font-bold uppercase">Last 12 Months</SelectItem>
              {years.map(y => (
                <SelectItem key={y} value={y.toString()} className="font-mono text-[11px] font-bold uppercase">
                  {y} Activity
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Heatmap Grid (No Scroll) */}
      <div className="w-full flex justify-center py-2 overflow-visible">
        <div className="inline-flex gap-0 select-none">
          <div className="mr-2 flex flex-col pt-5">
            {DAY_LABELS.map((label, i) => (
              <div
                key={i}
                style={{ height: CELL, marginBottom: GAP, lineHeight: `${CELL}px` }}
                className="text-right font-mono text-[9px] text-muted-foreground/60 pr-1 select-none font-bold uppercase"
              >
                {label}
              </div>
            ))}
          </div>

          <div className="flex gap-[2.5px]">
            {weeks.map((col, wi) => {
              const monthLabel = monthLabels.find(m => m.weekIdx === wi);
              return (
                <div key={wi} className="flex flex-col" style={{ width: CELL }}>
                  <div style={{ height: 20, lineHeight: "20px" }} className="font-mono text-[9px] text-muted-foreground/60 font-black select-none whitespace-nowrap overflow-visible uppercase tracking-tighter">
                    {monthLabel ? monthLabel.label : ""}
                  </div>
                  {col.map((cell, di) => {
                    if (!cell) {
                      return <div key={di} style={{ height: CELL, marginBottom: di < 6 ? GAP : 0 }} />;
                    }
                    const isToday = cell.key === new Date().toISOString().slice(0, 10);
                    return (
                      <div
                        key={cell.key}
                        style={{
                          height: CELL,
                          width: CELL,
                          marginBottom: di < 6 ? GAP : 0,
                          backgroundColor: getColor(cell.count),
                          borderRadius: 2,
                          border: isToday ? "1px solid var(--primary)" : "none",
                          boxShadow: isToday && cell.count > 0 ? "0 0 10px var(--glow)" : "none",
                          cursor: "pointer",
                          transition: "all 0.12s cubic-bezier(0.4, 0, 0.2, 1)",
                          flexShrink: 0,
                        }}
                        onMouseEnter={(e) => handleMouseEnter(e, cell)}
                        onMouseLeave={() => setTooltip(null)}
                        className="hover:scale-150 hover:z-50 hover:ring-1 hover:ring-white/20 hover:shadow-[0_0_15px_var(--glow)]"
                      />
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="mt-6 flex items-center justify-between border-t border-border/20 pt-4">
        <div className="flex items-center gap-2 text-[9px] font-bold text-muted-foreground/50 uppercase tracking-widest">
          <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse shadow-[0_0_8px_var(--glow)]" />
          Activity auto-synced
        </div>
        <div className="flex items-center gap-2 text-[9px] text-muted-foreground select-none uppercase tracking-widest font-black">
          <span className="opacity-60">Less</span>
          {[0, 1, 3, 6, 10].map((count, i) => (
            <div
              key={i}
              style={{ height: 10, width: 10, backgroundColor: getColor(count), borderRadius: 2 }}
              className="border border-white/5 shadow-sm"
            />
          ))}
          <span className="opacity-60">More</span>
        </div>
      </div>

      {tooltip && (
        <div
          className="pointer-events-none fixed z-[999] rounded-xl border border-white/10 bg-black/90 px-4 py-2.5 shadow-2xl backdrop-blur-2xl animate-in fade-in zoom-in-95 duration-150"
          style={{
            left: tooltip.x,
            top: tooltip.y - 12,
            transform: "translate(-50%, -100%)",
          }}
        >
          <div className="font-display text-sm font-bold text-white tracking-tight">
            {tooltip.count} {tooltip.count === 1 ? "activity" : "activities"}
          </div>
          <div className="mt-0.5 font-mono text-[10px] text-white/50 tracking-widest font-bold uppercase">{formatDateLabel(tooltip.label)}</div>
          <div
            className="absolute left-1/2 -translate-x-1/2 border-[6px] border-transparent border-t-black/90"
            style={{ bottom: -12 }}
          />
        </div>
      )}
    </div>
  );
}




import * as React from "react";
import { type TagStat } from "@/lib/api";

interface TopicRingChartProps {
  tagStats: Record<string, TagStat>;
  className?: string;
}

const TAG_COLORS = [
  "#82efac", "#60a5fa", "#f59e0b", "#a78bfa", "#fb7185",
  "#34d399", "#38bdf8", "#fbbf24", "#c084fc", "#f472b6",
  "#4ade80", "#2dd4bf",
];

export function TopicRingChart({ tagStats, className = "" }: TopicRingChartProps) {
  const [hovered, setHovered] = React.useState<string | null>(null);
  const entries = Object.entries(tagStats).sort((a, b) => b[1].total - a[1].total).slice(0, 12);
  const total = entries.reduce((sum, [, s]) => sum + s.total, 0);

  if (entries.length === 0) {
    return (
      <div className={`flex items-center justify-center rounded-xl border border-dashed border-border py-8 text-sm text-muted-foreground ${className}`}>
        No topic data yet — start solving problems!
      </div>
    );
  }

  const cx = 80, cy = 80, r = 60, sw = 18;
  const circ = 2 * Math.PI * r;
  let off = 0;
  const arcs = entries.map(([tag, stat], i) => {
    const frac = total > 0 ? stat.total / total : 0;
    const da = frac * circ;
    const cur = { tag, stat, frac, da, doff: circ - off, color: TAG_COLORS[i % TAG_COLORS.length] };
    off += da;
    return cur;
  });

  const hov = hovered ? arcs.find(a => a.tag === hovered) : null;

  return (
    <div className={className}>
      <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
        <div className="relative flex-shrink-0">
          <svg width="160" height="160" viewBox="0 0 160 160" className="rotate-[-90deg]">
            <circle cx={cx} cy={cy} r={r} fill="none" stroke="oklch(0.26 0.016 250)" strokeWidth={sw} />
            {arcs.map((arc) => (
              <circle
                key={arc.tag} cx={cx} cy={cy} r={r} fill="none" stroke={arc.color}
                strokeWidth={hovered === arc.tag ? sw + 4 : sw}
                strokeDasharray={`${arc.da} ${circ}`}
                strokeDashoffset={-arc.doff}
                strokeLinecap="round"
                className="cursor-pointer transition-all duration-200"
                onMouseEnter={() => setHovered(arc.tag)}
                onMouseLeave={() => setHovered(null)}
                style={{ opacity: hovered && hovered !== arc.tag ? 0.4 : 1 }}
              />
            ))}
          </svg>
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
            {hov ? (
              <>
                <div className="font-display text-xl font-bold" style={{ color: hov.color }}>{hov.stat.total}</div>
                <div className="max-w-[80px] font-mono text-[9px] leading-tight text-muted-foreground">{hov.tag}</div>
              </>
            ) : (
              <>
                <div className="font-display text-2xl font-bold text-foreground">{total}</div>
                <div className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">solved</div>
              </>
            )}
          </div>
        </div>
        <div className="flex flex-1 flex-col gap-1.5 overflow-hidden">
          {arcs.map((arc) => (
            <div
              key={arc.tag}
              className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 transition-colors hover:bg-muted/60"
              onMouseEnter={() => setHovered(arc.tag)}
              onMouseLeave={() => setHovered(null)}
              style={{ opacity: hovered && hovered !== arc.tag ? 0.4 : 1 }}
            >
              <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: arc.color }} />
              <span className="min-w-0 truncate text-sm text-foreground/80">{arc.tag}</span>
              <span className="ml-auto font-mono text-xs font-bold">{arc.stat.total}</span>
              <div className="flex gap-1 font-mono text-[10px] text-muted-foreground">
                <span className="text-easy">{arc.stat.easy}E</span>
                <span className="text-medium">{arc.stat.medium}M</span>
                <span className="text-hard">{arc.stat.hard}H</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

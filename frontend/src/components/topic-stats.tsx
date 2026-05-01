import * as React from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

interface Stat { tag: string; solved: number; total: number; }

export function TopicStats({ stats }: { stats: Stat[] }) {
  const [expanded, setExpanded] = React.useState(false);
  const sorted = [...stats].sort((a, b) => b.solved - a.solved);
  const visible = expanded ? sorted : sorted.slice(0, 8);

  if (sorted.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card p-5">
        <div className="font-display text-lg font-bold">Skills</div>
        <p className="mt-3 text-sm text-muted-foreground">Start solving problems to see your topic-wise progress.</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="mb-4 flex items-center justify-between">
        <div className="font-display text-lg font-bold">Skills · topic-wise</div>
        <span className="font-mono text-xs text-muted-foreground">{sorted.length} tags</span>
      </div>
      <div className="space-y-3">
        {visible.map((s) => {
          const pct = s.total > 0 ? Math.round((s.solved / s.total) * 100) : 0;
          return (
            <div key={s.tag} className="group">
              <div className="mb-1 flex items-center justify-between font-mono text-xs">
                <span className="text-foreground">{s.tag}</span>
                <span className="text-muted-foreground">{s.solved}/{s.total}</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full bg-gradient-primary transition-all duration-700 group-hover:shadow-[0_0_8px_var(--glow)]"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
      {sorted.length > 8 && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="mt-4 flex w-full items-center justify-center gap-1 rounded-md border border-border py-2 font-mono text-xs text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          {expanded ? <>show less <ChevronUp className="h-3 w-3" /></> : <>show all <ChevronDown className="h-3 w-3" /></>}
        </button>
      )}
    </div>
  );
}

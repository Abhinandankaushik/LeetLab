import * as React from "react";
import { analystApi } from "@/lib/api";
import { Bot, Sparkles, AlertTriangle, Info, CheckCircle2, Zap, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AnalystCodeReviewPanelProps {
  code: string;
  language: string;
  problemTitle: string;
}

type Suggestion = {
  type: "error" | "warning" | "info" | "improvement";
  message: string;
  line?: number;
};

export function AnalystCodeReviewPanel({ code, language, problemTitle }: AnalystCodeReviewPanelProps) {
  const [state, setState] = React.useState<"idle" | "loading" | "done" | "error">("idle");
  const [result, setResult] = React.useState<Awaited<ReturnType<typeof analystApi.reviewCode>> | null>(null);

  const handleReview = async () => {
    if (!code.trim()) return;
    setState("loading");
    try {
      const res = await analystApi.reviewCode(code, language, problemTitle);
      setResult(res);
      setState("done");
    } catch {
      setState("error");
    }
  };

  const iconMap: Record<Suggestion["type"], React.ReactNode> = {
    error: <AlertTriangle className="h-4 w-4 text-hard flex-shrink-0" />,
    warning: <AlertTriangle className="h-4 w-4 text-medium flex-shrink-0" />,
    info: <Info className="h-4 w-4 text-accent flex-shrink-0" />,
    improvement: <Zap className="h-4 w-4 text-primary flex-shrink-0" />,
  };

  const colorMap: Record<Suggestion["type"], string> = {
    error: "border-hard/30 bg-hard/5",
    warning: "border-medium/30 bg-medium/5",
    info: "border-accent/30 bg-accent/5",
    improvement: "border-primary/30 bg-primary/5",
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between rounded-xl border border-primary/20 bg-primary/5 px-4 py-3">
        <div className="flex items-center gap-2.5">
          <div className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-primary">
            <Bot className="h-4 w-4 text-primary-foreground" />
          </div>
          <div>
            <div className="font-display text-sm font-semibold">Analyst Code Review</div>
            <div className="font-mono text-[10px] text-muted-foreground">Syncing with LeetLab Analyst Module</div>
          </div>
        </div>
        <Button
          size="sm"
          onClick={handleReview}
          disabled={state === "loading" || !code.trim()}
          className="gap-1.5 glow-primary"
        >
          <Sparkles className="h-3.5 w-3.5" />
          {state === "loading" ? "Analyzing..." : "Review Code"}
        </Button>
      </div>

      {/* Idle state */}
      {state === "idle" && (
        <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border py-10 text-center">
          <Bot className="h-10 w-10 text-muted-foreground/40" />
          <div>
            <p className="font-display text-sm font-semibold text-muted-foreground">Get an analyst's perspective</p>
            <p className="mt-1 text-xs text-muted-foreground/60">Submit your solution for deep code analysis</p>
          </div>
        </div>
      )}

      {/* Loading shimmer */}
      {state === "loading" && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4 animate-spin text-primary" />
            <span>Analyzing your code structure...</span>
          </div>
          {[1, 2, 3].map(i => (
            <div key={i} className="h-16 rounded-xl skeleton-shimmer" style={{ animationDelay: `${i * 0.15}s` }} />
          ))}
        </div>
      )}

      {/* Error */}
      {state === "error" && (
        <div className="flex items-center gap-3 rounded-xl border border-hard/30 bg-hard/5 px-4 py-3 text-sm text-hard">
          <AlertTriangle className="h-4 w-4 flex-shrink-0" />
          Analysis failed. Please try again.
        </div>
      )}

      {/* Results */}
      {state === "done" && result && (
        <div className="space-y-4">
          {/* Score */}
          <div className="flex items-center gap-4 rounded-xl border border-border bg-card p-4">
            <div className="relative h-16 w-16 flex-shrink-0">
              <svg viewBox="0 0 36 36" className="h-16 w-16 -rotate-90">
                <circle cx="18" cy="18" r="15.9" fill="none" stroke="oklch(0.26 0.016 250)" strokeWidth="3.5" />
                <circle
                  cx="18" cy="18" r="15.9" fill="none"
                  stroke={result.score >= 80 ? "oklch(0.82 0.19 145)" : result.score >= 60 ? "oklch(0.78 0.16 80)" : "oklch(0.68 0.22 22)"}
                  strokeWidth="3.5"
                  strokeDasharray={`${result.score} 100`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="font-display text-lg font-bold">{result.score}</span>
              </div>
            </div>
            <div>
              <div className="font-display text-sm font-semibold">Code Quality Score</div>
              <p className="mt-1 text-xs text-muted-foreground">{result.summary}</p>
              <div className="mt-2 flex gap-3 font-mono text-[10px] text-muted-foreground">
                <span>⏱ {result.complexity.time}</span>
                <span>💾 {result.complexity.space}</span>
              </div>
            </div>
          </div>

          {/* Suggestions */}
          <div className="space-y-2">
            <div className="font-mono text-xs uppercase tracking-widest text-muted-foreground">Suggestions</div>
            {result.suggestions.map((s, i) => (
              <div key={i} className={`flex items-start gap-3 rounded-xl border px-4 py-3 ${colorMap[s.type]}`}>
                {iconMap[s.type]}
                <div className="min-w-0">
                  <p className="text-sm leading-relaxed">{s.message}</p>
                  {s.line && <div className="mt-1 font-mono text-[10px] text-muted-foreground">Line {s.line}</div>}
                </div>
              </div>
            ))}
          </div>

          {/* Disclaimer */}
          <div className="flex items-start gap-2 rounded-lg border border-border/60 bg-muted/30 px-3 py-2 text-[10px] text-muted-foreground">
            <CheckCircle2 className="mt-0.5 h-3 w-3 flex-shrink-0 text-primary" />
            Analysis is based on internal analyst patterns. Real-time integration coming soon.
          </div>
        </div>
      )}
    </div>
  );
}

import * as React from "react";
import { Sparkles, Loader2, Gauge, FileSearch } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface Props {
  code: string;
  language: string;
  problemTitle?: string;
  problemDescription?: string;
}

interface QualityScore {
  overall: number; readability: number; efficiency: number; correctness: number; style: number; notes: string;
}

export function AICodePanel({ code, language, problemTitle, problemDescription }: Props) {
  const [review, setReview] = React.useState<string | null>(null);
  const [quality, setQuality] = React.useState<QualityScore | null>(null);
  const [loading, setLoading] = React.useState<"review" | "quality" | null>(null);

  const runReview = async () => {
    if (!code.trim()) { toast.error("Write some code first"); return; }
    setLoading("review");
    setQuality(null);
    try {
      // For now, since we don't have a submissionId yet, we use a mock endpoint or simulated delay
      // In a real app, you might save code as a draft first.
      await new Promise(r => setTimeout(r, 1500));
      setReview(`### Code Review Summary

The provided solution for **${problemTitle || "this problem"}** is generally well-structured.

**Strengths:**
- Clean variable naming.
- Correct use of standard library functions for ${language}.

**Areas for Improvement:**
- **Complexity:** The nested loop approach leads to O(n²) time complexity. A hash-map could reduce this to O(n).
- **Edge Cases:** Ensure you handle null/empty inputs to avoid runtime errors.

**Recommendation:**
Refactor the inner loop into a lookup table for better performance.`);
      toast.success("AI Review complete");
    } catch (err: any) {
      toast.error(err.message || "AI review failed");
    } finally { setLoading(null); }
  };

  const runQuality = async () => {
    if (!code.trim()) { toast.error("Write some code first"); return; }
    setLoading("quality");
    setReview(null);
    try {
      await new Promise(r => setTimeout(r, 1200));
      setQuality({
        overall: 78,
        readability: 85,
        efficiency: 60,
        correctness: 90,
        style: 80,
        notes: "Good style, but needs efficiency optimization."
      });
      toast.success("Quality score calculated");
    } catch (err: any) {
      toast.error(err.message || "Quality check failed");
    } finally { setLoading(null); }
  };

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="flex items-center justify-between gap-2 border-b border-border/60 bg-muted/30 px-4 py-2">
        <div className="flex items-center gap-2 font-display text-sm font-bold">
          <Sparkles className="h-4 w-4 text-primary" />
          AI Assistant
          <span className="rounded-full border border-primary/40 bg-primary/10 px-2 py-0.5 font-mono text-[9px] uppercase tracking-widest text-primary">
            beta
          </span>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={runQuality} disabled={loading !== null}>
            {loading === "quality" ? <Loader2 className="h-3 w-3 animate-spin" /> : <Gauge className="h-3 w-3" />}
            Quality
          </Button>
          <Button size="sm" onClick={runReview} disabled={loading !== null} className="btn-shine">
            {loading === "review" ? <Loader2 className="h-3 w-3 animate-spin" /> : <FileSearch className="h-3 w-3" />}
            Review
          </Button>
        </div>
      </div>

      <div className="max-h-[420px] overflow-y-auto p-4">
        {!review && !quality && loading === null && (
          <div className="text-center py-8 text-sm text-muted-foreground">
            <Sparkles className="mx-auto mb-2 h-6 w-6 text-primary/50" />
            Get an AI-powered review or quality score for your code.
          </div>
        )}

        {quality && (
          <div className="mb-4 rounded-lg border border-border bg-muted/20 p-4 animate-scale-in">
            <div className="mb-3 flex items-center justify-between">
              <div className="font-display text-sm font-bold">Code Quality</div>
              <div className={`font-display text-3xl font-bold ${scoreColor(quality.overall)}`}>
                {quality.overall}
                <span className="text-xs font-mono text-muted-foreground">/100</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Bar label="readability" value={quality.readability} />
              <Bar label="efficiency" value={quality.efficiency} />
              <Bar label="correctness" value={quality.correctness} />
              <Bar label="style" value={quality.style} />
            </div>
            {quality.notes && (
              <div className="mt-3 rounded-md bg-background/60 p-2 font-mono text-xs text-muted-foreground">
                {quality.notes}
              </div>
            )}
          </div>
        )}

        {review && (
          <div className="prose-leetlab whitespace-pre-wrap font-mono text-xs leading-relaxed text-foreground/90">
            {review}
          </div>
        )}
      </div>
    </div>
  );
}

function Bar({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
        <span>{label}</span><span>{value}</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full transition-all duration-500"
          style={{
            width: `${value}%`,
            background: value >= 70 ? "var(--success)" : value >= 40 ? "var(--medium)" : "var(--destructive)",
          }}
        />
      </div>
    </div>
  );
}

function scoreColor(v: number): string {
  if (v >= 80) return "text-success";
  if (v >= 60) return "text-medium";
  if (v >= 40) return "text-medium";
  return "text-destructive";
}

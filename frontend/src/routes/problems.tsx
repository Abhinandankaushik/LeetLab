import * as React from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { problemsApi, type Problem } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DifficultyBadge } from "@/components/difficulty-badge";
import { Search, CheckCircle2, Circle, Tag } from "lucide-react";
import { cn } from "@/lib/utils";
import { ListSkeleton, ErrorState, EmptyState } from "@/components/empty-state";
import { Bookmark, ListPlus, MoreVertical, Edit } from "lucide-react";
import { AddToPlaylistDialog } from "@/components/PlaylistDialogs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type Tier = "ALL" | "EASY" | "MEDIUM" | "HARD";

// Color-coded active state for the difficulty filter (literal classes so Tailwind keeps them).
const TIER_ACTIVE: Record<Tier, string> = {
  ALL: "bg-primary/15 text-primary ring-1 ring-inset ring-primary/30",
  EASY: "bg-easy/15 text-easy ring-1 ring-inset ring-easy/30",
  MEDIUM: "bg-medium/15 text-medium ring-1 ring-inset ring-medium/30",
  HARD: "bg-hard/15 text-hard ring-1 ring-inset ring-hard/30",
};

export default function ProblemsPage() {
  const { user } = useAuth();
  const [q, setQ] = React.useState("");
  const [tier, setTier] = React.useState<Tier>("ALL");
  const [tag, setTag] = React.useState<string | null>(null);
  const [playlistProblemId, setPlaylistProblemId] = React.useState<string | null>(null);
  const [isPlaylistOpen, setIsPlaylistOpen] = React.useState(false);

  const problemsQuery = useQuery({
    queryKey: ["problems"],
    queryFn: () => problemsApi.list().then((r: any) => (r.problems || r.data || []) as Problem[]),
    refetchOnMount: "always"
  });

  const solvedQuery = useQuery({
    queryKey: ["solved-problems", user?.id],
    queryFn: () => problemsApi.solved().then((r: any) => (r.problems || r.data || []) as Problem[]),
    enabled: !!user
  });

  const problems = problemsQuery.data ?? [];
  const solved = React.useMemo(
    () => new Set((solvedQuery.data ?? []).map((p) => p.id)),
    [solvedQuery.data],
  );

  const tags = React.useMemo(() => {
    const s = new Set<string>();
    problems.forEach((p) => p.tags?.forEach((t) => s.add(t)));
    return Array.from(s).sort();
  }, [problems]);

  const filtered = problems.filter((p) => {
    if (tier !== "ALL" && p.defficulty !== tier) return false;
    if (tag && !p.tags?.includes(tag)) return false;
    if (q && !p.title.toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  });

  const counts = {
    total: problems.length,
    easy: problems.filter((p) => p.defficulty === "EASY").length,
    medium: problems.filter((p) => p.defficulty === "MEDIUM").length,
    hard: problems.filter((p) => p.defficulty === "HARD").length,
    solved: solved.size
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-mono text-xs uppercase tracking-widest text-primary">/ problemset</p>
          <h1 className="mt-2 font-display text-4xl font-bold">Choose your battle</h1>
        </div>
        <div className="flex flex-wrap gap-2 font-mono text-[10px]">
          <Stat label="total" value={counts.total} />
          <Stat label="easy" value={counts.easy} accent="text-easy" />
          <Stat label="medium" value={counts.medium} accent="text-medium" />
          <Stat label="hard" value={counts.hard} accent="text-hard" />
          {user && <Stat label="solved" value={counts.solved} accent="text-primary" />}
        </div>
      </div>

      <div className="mb-6 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search by title..." value={q} onChange={(e) => setQ(e.target.value)} className="pl-9" />
        </div>
        <div className="flex items-center gap-1 rounded-lg border border-border bg-card p-1">
          {(["ALL", "EASY", "MEDIUM", "HARD"] as Tier[]).map((t) => (
            <button
              key={t}
              onClick={() => setTier(t)}
              className={cn(
                "rounded-md px-3 py-1.5 text-xs font-bold tracking-wide transition-all",
                tier === t ? TIER_ACTIVE[t] : "text-muted-foreground hover:text-foreground hover:bg-muted/60",
              )}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {tags.length > 0 && (
        <div className="mb-6 flex flex-wrap items-center gap-2 max-h-24 overflow-y-auto scrollbar-thin pb-2">
          <Tag className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
          <button
            onClick={() => setTag(null)}
            className={cn(
              "rounded-full border px-3 py-1 text-[10px] font-medium transition-all",
              !tag ? "border-primary/40 bg-primary/10 text-primary" : "border-border text-muted-foreground hover:border-primary/30 hover:text-foreground",
            )}
          >
            all
          </button>
          {tags.map((t) => (
            <button
              key={t}
              onClick={() => setTag(t === tag ? null : t)}
              className={cn(
                "inline-flex items-center gap-1 rounded-full border px-3 py-1 text-[10px] font-medium transition-all",
                tag === t ? "border-primary/40 bg-primary/10 text-primary" : "border-border text-muted-foreground hover:border-primary/30 hover:text-foreground",
              )}
            >
              <span className="text-primary/50">#</span>{t}
            </button>
          ))}
        </div>
      )}

      {problemsQuery.isLoading && <ListSkeleton rows={8} />}
      {problemsQuery.isError && (
        <ErrorState
          description={(problemsQuery.error as any)?.message || "Failed to load problems. Make sure the backend is running and VITE_API_URL points to it."}
          onRetry={() => problemsQuery.refetch()}
        />
      )}
      {!problemsQuery.isLoading && !problemsQuery.isError && filtered.length === 0 && (
        <EmptyState icon={Search} title="No problems match these filters" description="Try clearing filters or search." />
      )}

      {filtered.length > 0 && (
        <div className="overflow-hidden rounded-xl border border-border bg-card shadow-xl transition-all">
          <div className="relative w-full overflow-hidden">
            <div className="min-w-full">
          <div className="hidden md:grid grid-cols-[48px_1fr_120px_1fr_100px] gap-4 border-b border-border bg-muted/30 px-4 py-3 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
            <span></span><span>Title</span><span>Difficulty</span><span>Tags</span><span className="text-right">Status</span>
          </div>
          {filtered.map((p, i) => {
            const isSolved = solved.has(p.id);
            return (
              <Link
                key={p.id}
                to={`/problems/${p.id}`}
                className="group relative grid grid-cols-[40px_1fr_auto] items-center gap-4 border-b border-border/60 px-4 py-3.5 transition-all last:border-0 hover:bg-muted/40 md:grid-cols-[48px_1fr_120px_1fr_100px]"
              >
                <span className="absolute left-0 top-0 h-full w-0.5 origin-top scale-y-0 bg-primary transition-transform duration-300 group-hover:scale-y-100" />
                <span className="grid h-7 w-8 place-items-center rounded-md bg-muted/50 font-mono text-[10px] font-bold text-muted-foreground transition-colors group-hover:bg-primary/10 group-hover:text-primary">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div className="min-w-0">
                  <div className="truncate font-semibold text-sm md:text-base transition-colors group-hover:text-primary">{p.title}</div>
                  <div className="md:hidden mt-1.5 flex items-center gap-2">
                    <DifficultyBadge value={p.defficulty} />
                    {p.tags?.slice(0, 2).map((t) => (
                      <span key={t} className="rounded bg-muted px-1.5 py-0.5 font-mono text-[9px] text-muted-foreground">{t}</span>
                    ))}
                  </div>
                </div>
                <span className="hidden md:block"><DifficultyBadge value={p.defficulty} /></span>
                <span className="hidden md:flex flex-wrap gap-1">
                  {p.tags?.slice(0, 3).map((t) => (
                    <span key={t} className="rounded-md border border-border/50 bg-muted/40 px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground transition-colors group-hover:border-border">{t}</span>
                  ))}
                </span>
                <span className="flex justify-end gap-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild onClick={(e) => e.preventDefault()}>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={(e) => {
                        e.preventDefault();
                        setPlaylistProblemId(p.id);
                        setIsPlaylistOpen(true);
                      }}>
                        <ListPlus className="mr-2 h-4 w-4" /> Save to Playlist
                      </DropdownMenuItem>
                      {user?.role === "ADMIN" && (
                        <DropdownMenuItem asChild>
                          <Link 
                            to={`/admin/problems/${p.id}/edit`} 
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Edit className="mr-2 h-4 w-4" /> Edit Problem
                          </Link>
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                  {isSolved ? (
                    <span className="grid h-6 w-6 place-items-center rounded-full bg-easy/15 text-easy ring-1 ring-easy/30">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                    </span>
                  ) : (
                    <span className="grid h-6 w-6 place-items-center rounded-full text-muted-foreground/40 transition-colors group-hover:text-muted-foreground/70">
                      <Circle className="h-3.5 w-3.5" />
                    </span>
                  )}
                </span>
              </Link>
            );
          })}
            </div>
          </div>
        </div>
      )}

      <AddToPlaylistDialog 
        open={isPlaylistOpen} 
        onOpenChange={setIsPlaylistOpen} 
        problemId={playlistProblemId} 
      />
    </div>
  );
}

function Stat({ label, value, accent }: { label: string; value: number; accent?: string }) {
  return (
    <div className="group rounded-xl border border-border bg-card px-4 py-2.5 transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-[0_10px_26px_-16px_var(--glow)]">
      <div className="text-[9px] font-medium uppercase tracking-widest text-muted-foreground">{label}</div>
      <div className={cn("mt-1 font-display text-xl font-black leading-none", accent || "text-foreground")}>{value}</div>
    </div>
  );
}

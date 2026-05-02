import * as React from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { leaderboardApi } from "@/lib/api";
import { Trophy, Medal, Award } from "lucide-react";
import { ListSkeleton, EmptyState, ErrorState } from "@/components/empty-state";
import { cn } from "@/lib/utils";

type Range = "all" | "week" | "month";

export default function LeaderboardPage() {
  const [range, setRange] = React.useState<Range>("all");
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["leaderboard", range],
    queryFn: () => leaderboardApi.all({ range })
  });

  const entries = data?.entries ?? [];

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 stagger">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-mono text-xs uppercase tracking-widest text-primary">/ leaderboard</p>
          <h1 className="mt-2 font-display text-4xl font-bold">Top of the food chain</h1>
        </div>
        <div className="flex items-center gap-1 rounded-md border border-border bg-card p-1">
          {(["all", "month", "week"] as Range[]).map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={cn(
                "rounded px-3 py-1 text-xs font-semibold uppercase transition-colors",
                range === r ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground",
              )}
            >
              {r === "all" ? "all time" : r}
            </button>
          ))}
        </div>
      </div>

      {/* Podium */}
      {entries.length >= 3 && (
        <div className="mb-12 grid gap-4 sm:grid-cols-3">
          <div className="order-2 sm:order-1"><PodiumCard place={2} entry={entries[1]} /></div>
          <div className="order-1 sm:order-2 scale-105 sm:scale-110 z-10"><PodiumCard place={1} entry={entries[0]} /></div>
          <div className="order-3 sm:order-3"><PodiumCard place={3} entry={entries[2]} /></div>
        </div>
      )}

      {isLoading && <ListSkeleton rows={10} />}
      {isError && <ErrorState onRetry={() => refetch()} />}
      {!isLoading && !isError && entries.length === 0 && (
        <EmptyState
          icon={Trophy}
          title="Leaderboard not available"
          description="The leaderboard data is currently empty or the service is offline."
        />
      )}

      {entries.length > 0 && (
        <div className="overflow-hidden rounded-xl border border-border bg-card shadow-xl transition-all">
          <div className="relative w-full">
            <div className="min-w-full">
              <div className="grid grid-cols-[60px_1fr_80px] md:grid-cols-[80px_1fr_120px_120px_120px] gap-4 border-b border-border bg-muted/30 px-6 py-4 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                <span>Rank</span>
                <span>Contestant</span>
                <span className="text-right">Rating</span>
                <span className="hidden md:block text-right">Solved</span>
                <span className="hidden md:block text-right">Contests</span>
              </div>
              {entries.map((e) => (
                <Link
                  key={e.user.id}
                  to={`/u/${e.user.username || e.user.id}`}
                  className="grid grid-cols-[60px_1fr_80px] md:grid-cols-[80px_1fr_120px_120px_120px] items-center gap-4 border-b border-border/40 px-6 py-4 last:border-0 hover:bg-muted/30 transition-colors"
                >
                  <RankBadge rank={e.rank} />
                  <div className="flex items-center gap-3">
                    <div className="grid h-8 w-8 place-items-center rounded-lg bg-primary/10 text-[11px] font-bold uppercase text-primary border border-primary/20 shrink-0">
                      {e.user.name.slice(0, 2)}
                    </div>
                    <div className="min-w-0">
                      <div className="truncate font-display font-bold text-sm md:text-base">{e.user.name}</div>
                      {e.user.country && <div className="font-mono text-[10px] text-muted-foreground">{e.user.country}</div>}
                    </div>
                  </div>
                  <span className={cn("text-right font-mono font-bold text-base md:text-lg", ratingColor(e.rating))}>{e.rating}</span>
                  <span className="hidden md:block text-right font-mono text-sm text-muted-foreground">{e.solved}</span>
                  <span className="hidden md:block text-right font-mono text-sm text-muted-foreground">{e.contests}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ratingColor(r: number) {
  if (r >= 2400) return "text-hard";
  if (r >= 2100) return "text-medium";
  if (r >= 1600) return "text-accent";
  if (r >= 1200) return "text-primary";
  return "text-muted-foreground";
}

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) return <span className="flex items-center gap-1 font-mono font-bold text-medium"><Trophy className="h-4 w-4" /> 1</span>;
  if (rank === 2) return <span className="flex items-center gap-1 font-mono font-bold text-muted-foreground"><Medal className="h-4 w-4" /> 2</span>;
  if (rank === 3) return <span className="flex items-center gap-1 font-mono font-bold text-hard/80"><Award className="h-4 w-4" /> 3</span>;
  return <span className="font-mono text-sm text-muted-foreground">#{rank}</span>;
}

function PodiumCard({ place, entry }: { place: 1 | 2 | 3; entry: any }) {
  const heights = { 1: "min-h-[15rem]", 2: "min-h-[13rem]", 3: "min-h-[12rem]" };
  const accents = {
    1: "border-medium/40 bg-medium/5",
    2: "border-accent/40 bg-accent/5",
    3: "border-hard/40 bg-hard/5"
  };
  const iconColors = { 1: "text-medium", 2: "text-accent", 3: "text-hard/70" };
  const Icon = place === 1 ? Trophy : place === 2 ? Medal : Award;

  return (
    <Link 
      to={`/u/${entry.user.username || entry.user.id}`} 
      className={cn("group relative flex flex-col items-center justify-center overflow-hidden rounded-2xl border p-6 text-center transition-all hover:-translate-y-2 hover:shadow-2xl", heights[place], accents[place])}
    >
      <div className="absolute right-4 top-4 font-mono text-4xl font-black opacity-10">#{place}</div>
      <div className="relative">
        <div className="grid h-16 w-16 place-items-center rounded-2xl bg-background border border-border shadow-xl group-hover:scale-110 transition-transform">
          <span className="text-lg font-bold uppercase">{entry.user.name.slice(0, 2)}</span>
        </div>
        <div className={cn("absolute -bottom-2 -right-2 rounded-full bg-background p-1 border border-border shadow-sm", iconColors[place])}>
          <Icon className="h-4 w-4" />
        </div>
      </div>
      <div className="mt-4 w-full truncate px-2 font-display text-lg font-bold group-hover:text-primary transition-colors leading-tight">
        {entry.user.name}
      </div>
      <div className={cn("mt-1 font-mono text-2xl font-black tracking-tight", ratingColor(entry.rating))}>{entry.rating}</div>
    </Link>
  );
}

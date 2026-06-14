import * as React from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { leaderboardApi } from "@/lib/api";
import { Trophy, Medal, Award, Star, Sparkles, TrendingUp, User, Globe, Zap } from "lucide-react";
import { ListSkeleton, EmptyState, ErrorState } from "@/components/empty-state";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

type Range = "all" | "week" | "month";

export default function LeaderboardPage() {
  const [range, setRange] = React.useState<Range>("all");
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["leaderboard", range],
    queryFn: () => leaderboardApi.all({ range })
  });

  const entries = data?.entries ?? [];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:py-12 stagger min-h-screen">
      {/* Premium Header */}
      <div className="mb-10 md:mb-16 flex flex-col md:flex-row md:items-end justify-between gap-4 md:gap-8">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
             <div className="h-1 w-8 bg-primary rounded-full" />
             <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-primary font-bold">Global Rankings</p>
          </div>
          <h1 className="font-display text-3xl sm:text-5xl md:text-7xl font-black tracking-tighter leading-none">
            Elite <span className="text-muted-foreground/20">&</span> Legends
          </h1>
          <p className="max-w-xl text-muted-foreground text-sm leading-relaxed">
            Behold the architects of logic. These developers have conquered the grid with unmatched precision and speed.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-1 self-start rounded-2xl border border-border/60 bg-card/40 p-1.5 backdrop-blur-sm shadow-xl">
          {(["all", "month", "week"] as Range[]).map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={cn(
                "rounded-xl px-3 sm:px-5 py-2 text-[10px] font-black uppercase tracking-widest transition-all",
                range === r 
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" 
                  : "text-muted-foreground hover:text-foreground hover:bg-card/80",
              )}
            >
              {r === "all" ? "Infinity" : r}
            </button>
          ))}
        </div>
      </div>

      {/* Advanced Podium */}
      {entries.length >= 3 && (
        <div className="mb-12 md:mb-20 grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8 items-end px-0 md:px-4">
          <div className="order-2 md:order-1 h-full flex flex-col justify-end">
            <PodiumCard place={2} entry={entries[1]} />
          </div>
          <div className="order-1 md:order-2 h-full flex flex-col justify-end scale-100 md:scale-110 z-10">
            <PodiumCard place={1} entry={entries[0]} />
          </div>
          <div className="order-3 md:order-3 h-full flex flex-col justify-end">
            <PodiumCard place={3} entry={entries[2]} />
          </div>
        </div>
      )}

      {isLoading && <ListSkeleton rows={10} />}
      {isError && <ErrorState description="The ranking engine is undergoing maintenance." onRetry={() => refetch()} />}
      {!isLoading && !isError && entries.length === 0 && (
        <EmptyState
          icon={Trophy}
          title="The Hall of Fame is Empty"
          description="No warriors have claimed their place in this sector yet."
          className="py-32"
        />
      )}

      {entries.length > 0 && (
        <div className="overflow-hidden rounded-[32px] border border-border/60 bg-card/40 shadow-2xl backdrop-blur-md">
          <div className="relative w-full overflow-x-auto scrollbar-thin scrollbar-thumb-primary/20">
            <div className="min-w-0 md:min-w-full">
              <div className="grid grid-cols-[56px_1fr_80px] md:grid-cols-[100px_1fr_140px_140px_140px] gap-3 md:gap-4 border-b border-border/60 bg-muted/20 px-4 py-4 md:px-8 md:py-5 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-bold">
                <span>Rank</span>
                <span>Contestant</span>
                <span className="text-right">Elo Rating</span>
                <span className="hidden md:block text-right">Problems</span>
                <span className="hidden md:block text-right">Battles</span>
              </div>
              {entries.map((e) => (
                <Link
                  key={e.user.id}
                  to={`/u/${e.user.username || e.user.id}`}
                  className="grid grid-cols-[56px_1fr_80px] md:grid-cols-[100px_1fr_140px_140px_140px] items-center gap-3 md:gap-4 border-b border-border/40 px-4 py-4 md:px-8 md:py-5 last:border-0 hover:bg-primary/[0.03] transition-all group"
                >
                  <RankBadge rank={e.rank} />
                  <div className="flex items-center gap-2.5 md:gap-4 min-w-0">
                    <Avatar className="h-9 w-9 md:h-10 md:w-10 shrink-0 border border-border/60 group-hover:border-primary/40 transition-colors">
                      <AvatarImage src={e.user.image} />
                      <AvatarFallback className="bg-muted text-[10px] font-black uppercase">
                        {e.user.name.slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <div className="truncate font-display font-black text-base md:text-lg group-hover:text-primary transition-colors tracking-tight">{e.user.name}</div>
                      <div className="flex items-center gap-2 font-mono text-[9px] text-muted-foreground uppercase tracking-widest font-bold">
                        <Globe className="h-2.5 w-2.5 shrink-0" />
                        <span className="truncate">{e.user.country || "Earth Sector"}</span>
                      </div>
                    </div>
                  </div>
                  <span className={cn("text-right font-mono font-black text-lg md:text-xl", ratingColor(e.rating))}>{e.rating}</span>
                  <span className="hidden md:block text-right font-mono text-sm text-muted-foreground font-bold">{e.solved}</span>
                  <span className="hidden md:block text-right font-mono text-sm text-muted-foreground font-bold">{e.contests}</span>
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
  if (r >= 2400) return "text-hard drop-shadow-[0_0_10px_rgba(239,68,68,0.3)]";
  if (r >= 2100) return "text-medium drop-shadow-[0_0_10px_rgba(255,170,0,0.3)]";
  if (r >= 1600) return "text-accent drop-shadow-[0_0_10px_rgba(0,170,255,0.3)]";
  if (r >= 1200) return "text-primary drop-shadow-[0_0_10px_rgba(0,255,136,0.3)]";
  return "text-muted-foreground";
}

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) return <span className="flex items-center gap-2 font-mono font-black text-medium text-lg"><Trophy className="h-5 w-5 fill-current" /> 1</span>;
  if (rank === 2) return <span className="flex items-center gap-2 font-mono font-black text-slate-400 text-lg"><Medal className="h-5 w-5 fill-current" /> 2</span>;
  if (rank === 3) return <span className="flex items-center gap-2 font-mono font-black text-amber-700 text-lg"><Award className="h-5 w-5 fill-current" /> 3</span>;
  return <span className="font-mono text-sm text-muted-foreground/60 font-bold">#{rank}</span>;
}

function PodiumCard({ place, entry }: { place: 1 | 2 | 3; entry: any }) {
  const configs = {
    1: {
      height: "min-h-[300px]",
      border: "border-medium/40",
      bg: "bg-gradient-to-b from-medium/20 to-medium/5",
      glow: "shadow-[0_0_50px_-12px_rgba(255,170,0,0.3)]",
      icon: Trophy,
      iconColor: "text-medium",
      label: "Supreme Architect"
    },
    2: {
      height: "min-h-[270px]",
      border: "border-slate-400/40",
      bg: "bg-gradient-to-b from-slate-400/20 to-slate-400/5",
      glow: "shadow-[0_0_50px_-12px_rgba(148,163,184,0.2)]",
      icon: Medal,
      iconColor: "text-slate-400",
      label: "Master Elite"
    },
    3: {
      height: "min-h-[250px]",
      border: "border-amber-700/40",
      bg: "bg-gradient-to-b from-amber-700/20 to-amber-700/5",
      glow: "shadow-[0_0_50px_-12px_rgba(180,83,9,0.2)]",
      icon: Award,
      iconColor: "text-amber-700",
      label: "Grid Specialist"
    }
  };

  const config = configs[place];
  const Icon = config.icon;

  return (
    <Link 
      to={`/u/${entry.user.username || entry.user.id}`} 
      className={cn(
        "group relative flex flex-col items-center justify-end rounded-[32px] border p-5 md:p-6 text-center transition-all hover:-translate-y-2 hover:shadow-2xl backdrop-blur-md overflow-hidden",
        config.height,
        config.border,
        config.bg,
        config.glow
      )}
    >
      {/* Background Decor */}
      <div className="absolute top-0 inset-x-0 h-24 bg-gradient-to-b from-white/5 to-transparent opacity-50" />
      
      <div className="absolute top-5 md:top-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 z-20">
         <div className={cn("p-2 rounded-xl bg-background/80 border border-white/10 shadow-2xl group-hover:scale-110 transition-transform duration-500", config.iconColor)}>
            <Icon className="h-5 w-5 md:h-6 md:w-6 fill-current" />
         </div>
         <span className={cn("text-[7px] md:text-[8px] font-black uppercase tracking-[0.3em]", config.iconColor)}>Rank {place}</span>
      </div>

      <div className="relative z-10 w-full space-y-3 pt-10 md:pt-12">
        <div className="mx-auto relative w-14 h-14 md:w-16 md:h-16">
           <Avatar className="h-full w-full border-2 border-white/10 p-1 bg-background/50">
             <AvatarImage src={entry.user.image} className="rounded-full" />
             <AvatarFallback className="bg-muted text-lg font-black">{entry.user.name.slice(0, 2)}</AvatarFallback>
           </Avatar>
           <div className={cn("absolute -bottom-1 -right-1 p-1 rounded-lg bg-background border border-white/10 shadow-xl", config.iconColor)}>
              <Sparkles className="h-3 w-3 fill-current" />
           </div>
        </div>

        <div className="space-y-0.5">
          <div className="text-[8px] md:text-[9px] font-black uppercase tracking-widest text-muted-foreground opacity-60">{config.label}</div>
          <h3 className="font-display text-lg md:text-xl font-black tracking-tighter text-white group-hover:text-primary transition-colors line-clamp-1 w-full px-2">
            {entry.user.name}
          </h3>
        </div>

        <div className="flex items-center justify-center gap-2 md:gap-3 bg-black/30 rounded-xl p-2.5 backdrop-blur-sm">
           <div className="flex flex-col items-center">
              <span className={cn("text-xl md:text-2xl font-black font-mono tracking-tighter leading-none", ratingColor(entry.rating))}>
                {entry.rating}
              </span>
              <span className="text-[6px] md:text-[7px] font-bold uppercase tracking-widest text-muted-foreground mt-0.5">Rating</span>
           </div>
           <Separator orientation="vertical" className="h-6 bg-white/10" />
           <div className="flex flex-col items-center">
              <span className="text-base md:text-lg font-black font-mono tracking-tighter leading-none text-white/80">
                {entry.solved}
              </span>
              <span className="text-[6px] md:text-[7px] font-bold uppercase tracking-widest text-muted-foreground mt-0.5">Solved</span>
           </div>
        </div>
      </div>

      {/* Decorative rank number in background */}
      <div className="absolute -bottom-10 -left-8 text-[120px] md:text-[140px] font-black text-white/[0.03] pointer-events-none select-none tracking-tighter z-0">
        {place}
      </div>
    </Link>
  );
}

function Separator({ orientation = "horizontal", className }: { orientation?: "horizontal" | "vertical", className?: string }) {
  return (
    <div className={cn(
      "bg-border shrink-0",
      orientation === "horizontal" ? "h-[1px] w-full" : "w-[1px] h-full",
      className
    )} />
  );
}

import * as React from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { contestsApi, type Contest } from "@/lib/api";
import { Trophy, Calendar, Users, Clock, Zap, History, ChevronRight, Activity, Search, Filter } from "lucide-react";
import { CardGridSkeleton, EmptyState, ErrorState } from "@/components/empty-state";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";

export default function ContestHistoryPage() {
  const [search, setSearch] = React.useState("");
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["my-contests"],
    queryFn: () => contestsApi.my()
  });

  const contests = data?.contests ?? [];
  const filtered = contests.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 stagger">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div>
          <div className="flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-widest text-primary">
            <History className="h-4 w-4" /> Participation History
          </div>
          <h1 className="mt-4 font-display text-4xl font-black tracking-tight">My Contests</h1>
          <p className="mt-2 text-muted-foreground">Track your progress, view rankings, and analyze your performance in past contests.</p>
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search contests..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 h-11 bg-card border-border/60"
            />
          </div>
          <button className="flex items-center gap-2 px-4 h-11 rounded-md border border-border bg-card hover:bg-muted transition-colors text-sm font-bold">
            <Filter className="h-4 w-4" /> Filter
          </button>
        </div>
      </div>

      {isLoading && <CardGridSkeleton count={6} />}
      {isError && <ErrorState description="Couldn't fetch your contest history." onRetry={() => refetch()} />}
      
      {!isLoading && !isError && contests.length === 0 && (
        <div className="rounded-3xl border border-dashed border-border p-20 text-center bg-card/30 backdrop-blur-sm">
          <Trophy className="mx-auto h-16 w-16 text-muted-foreground/20" />
          <h2 className="mt-6 text-xl font-bold">No contests yet</h2>
          <p className="mt-2 text-muted-foreground max-w-sm mx-auto">You haven't participated in any contests. Join an upcoming one to start your competitive journey!</p>
          <Link to="/contests" className="mt-8 inline-flex items-center justify-center rounded-xl bg-primary px-8 py-3 text-sm font-bold text-primary-foreground shadow-xl glow-primary hover-lift">
            Browse Contests
          </Link>
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filtered.map((c) => (
          <HistoryCard key={c.id} contest={c} />
        ))}
      </div>
    </div>
  );
}

function HistoryCard({ contest }: { contest: Contest }) {
  const start = new Date(contest.startTime);
  
  return (
    <Link
      to={`/contests/${contest.id}`}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card p-6 transition-all hover:border-primary/50 hover:shadow-2xl hover:shadow-primary/5"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={cn(
            "rounded-md px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-wider",
            contest.status === "live" ? "bg-hard/10 text-hard" : "bg-primary/10 text-primary"
          )}>
            {contest.status}
          </span>
          <span className="font-mono text-[10px] text-muted-foreground">{start.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}</span>
        </div>
      </div>

      <h3 className="mt-6 font-display text-lg font-bold group-hover:text-primary transition-colors">{contest.name}</h3>
      
      <div className="mt-8 grid grid-cols-2 gap-4 border-t border-border/40 pt-6">
        <div className="flex flex-col">
          <span className="text-[9px] uppercase font-mono text-muted-foreground font-bold">Your Rank</span>
          <div className="mt-1 flex items-center gap-1.5 font-display font-black text-xl">
            <Trophy className="h-4 w-4 text-primary" /> #{(contest as any).rank || "—"}
          </div>
        </div>
        <div className="flex flex-col">
          <span className="text-[9px] uppercase font-mono text-muted-foreground font-bold">Problems Solved</span>
          <div className="mt-1 flex items-center gap-1.5 font-display font-black text-xl">
            <Activity className="h-4 w-4 text-primary" /> {(contest as any).solvedCount || 0}/{contest.problems?.length || 0}
          </div>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between text-[10px] font-mono text-muted-foreground">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1"><Users className="h-3 w-3" /> {contest.participantCount?.toLocaleString() || 0} participants</div>
        </div>
        <div className="flex items-center gap-1 text-primary font-bold group-hover:translate-x-1 transition-transform">
          View Results <ChevronRight className="h-3 w-3" />
        </div>
      </div>
    </Link>
  );
}

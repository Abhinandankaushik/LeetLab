import * as React from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { contestsApi, type Contest } from "@/lib/api";
import { Trophy, Calendar, Users, Clock, Zap, Timer, ChevronRight, History, Star, TrendingUp } from "lucide-react";
import { CardGridSkeleton, EmptyState, ErrorState } from "@/components/empty-state";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type Tab = "upcoming" | "past";

export default function ContestsPage() {
  const [tab, setTab] = React.useState<"live" | "upcoming" | "past">("live");
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["contests"],
    queryFn: () => contestsApi.all()
  });

  const contests = data?.contests ?? [];
  const live = contests.filter(c => c.status === "live");
  const upcoming = contests.filter(c => c.status === "upcoming");
  const past = contests.filter(c => c.status === "ended");

  // Auto-switch to upcoming if no live contests
  React.useEffect(() => {
    if (!isLoading && live.length === 0 && tab === "live") {
      setTab("upcoming");
    }
  }, [isLoading, live.length]);

  if (isLoading) return <div className="mx-auto max-w-7xl px-4 py-10"><CardGridSkeleton count={6} /></div>;
  if (isError) return <div className="mx-auto max-w-7xl px-4 py-10"><ErrorState description="Couldn't fetch contests." onRetry={() => refetch()} /></div>;

  const currentContests = tab === "live" ? live : tab === "upcoming" ? upcoming : past;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 stagger">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div>
          <h1 className="font-display text-3xl font-black tracking-tight">Contests</h1>
          <p className="mt-1 text-sm text-muted-foreground">Compete, solve, and climb the global leaderboard.</p>
        </div>
        
        <div className="hidden sm:flex items-center gap-3">
          <Link to="/contests/history" className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border bg-card hover:bg-muted transition-all text-xs font-bold">
            <History className="h-3.5 w-3.5" /> History
          </Link>
        </div>
      </div>

      {/* Tabs Section */}
      <section className="mt-8">
        <div className="flex items-center justify-between border-b border-border/60 mb-8">
          <div className="flex gap-8">
            {[
              { id: "live", label: "Live", count: live.length, color: "text-hard" },
              { id: "upcoming", label: "Upcoming", count: upcoming.length, color: "text-primary" },
              { id: "past", label: "Finished", count: past.length, color: "text-muted-foreground" }
            ].map((t) => (
              <button 
                key={t.id}
                onClick={() => setTab(t.id as any)}
                className={cn(
                  "pb-3 text-[10px] font-black uppercase tracking-[0.2em] transition-all relative flex items-center gap-2",
                  tab === t.id ? t.color : "text-muted-foreground hover:text-foreground"
                )}
              >
                {t.label}
                {tab === t.id && (
                  <div className={cn(
                    "absolute bottom-0 left-0 right-0 h-0.5 rounded-full",
                    t.id === "live" ? "bg-hard" : "bg-primary"
                  )} />
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {currentContests.length === 0 ? (
            <div className="col-span-full py-24 text-center bg-card/30 rounded-3xl border border-dashed border-border flex flex-col items-center justify-center">
              <div className="relative mb-6">
                <div className="absolute -inset-4 bg-muted/20 blur-xl rounded-full" />
                <Trophy className="h-16 w-16 text-muted-foreground/30 relative" />
              </div>
              <h2 className="text-xl font-bold">{tab === "live" ? "No contests live" : tab === "upcoming" ? "No upcoming contests" : "No past contests"}</h2>
              <p className="mt-2 text-sm text-muted-foreground max-w-xs mx-auto">Check back soon for new challenges and events.</p>
            </div>
          ) : (
            currentContests.map((c) => (
              tab === "live" ? <LiveContestCard key={c.id} contest={c} /> : <ContestCard key={c.id} contest={c} />
            ))
          )}
        </div>
      </section>
    </div>
  );
}

function LiveContestCard({ contest }: { contest: Contest }) {
  return (
    <Link
      to={`/contests/${contest.id}`}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-hard/20 bg-card p-5 transition-all hover:border-hard/40 hover:shadow-xl"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-1.5 w-1.5 rounded-full bg-hard animate-pulse" />
          <span className="font-mono text-[9px] font-bold uppercase tracking-wider text-hard">Live Now</span>
        </div>
        <div className="flex items-center gap-2 text-[9px] font-bold text-muted-foreground uppercase">
          <Users className="h-3 w-3" /> {contest.participantCount || 0}
        </div>
      </div>

      <h3 className="mt-4 font-display text-lg font-bold group-hover:text-hard transition-colors line-clamp-1">{contest.name}</h3>
      <p className="mt-1 line-clamp-2 text-xs text-muted-foreground leading-relaxed">
        {contest.description || "The arena is open! Dive in now and compete for the top spot."}
      </p>

      <div className="mt-6 flex items-center justify-between pt-4 border-t border-border/40">
        <div className="flex flex-col">
          <span className="text-[8px] font-bold uppercase text-muted-foreground tracking-widest">Ends In</span>
          <div className="font-mono text-sm font-black text-hard tabular-nums">
            <ContestCountdown startTime={contest.endTime} />
          </div>
        </div>
        <Button size="sm" className="bg-hard hover:bg-hard/90 text-white font-bold rounded-lg px-4 h-8 text-[10px] uppercase tracking-wider">
           Join Arena
        </Button>
      </div>
    </Link>
  );
}

function ContestCard({ contest }: { contest: Contest }) {
  const start = new Date(contest.startTime);
  const end = new Date(contest.endTime);
  const duration = Math.round((end.getTime() - start.getTime()) / 60000);

  return (
    <Link
      to={`/contests/${contest.id}`}
      className="group relative flex flex-col overflow-hidden rounded-xl border border-border bg-card p-5 transition-all hover:border-primary/50 hover:shadow-lg"
    >
      <div className="flex items-center justify-between">
        <span className="rounded bg-muted px-1.5 py-0.5 font-mono text-[8px] font-bold uppercase tracking-wider text-muted-foreground">
          {contest.type}
        </span>
        <div className="flex items-center gap-2">
          {contest.isRegistered ? (
            <span className="flex items-center gap-1 font-mono text-[8px] font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded border border-primary/20">
              REGISTERED
            </span>
          ) : (
             <span className="font-mono text-[9px] text-muted-foreground">{start.toLocaleDateString(undefined, { month: "short", day: "numeric" })}</span>
          )}
        </div>
      </div>

      <h3 className="mt-3 font-display text-base font-bold group-hover:text-primary transition-colors line-clamp-1">{contest.name}</h3>
      
      <div className="mt-6 flex items-center justify-between pt-4 border-t border-border/40">
        <div className="flex items-center gap-3 font-mono text-[9px] text-muted-foreground">
          <div className="flex items-center gap-1"><Users className="h-3 w-3" /> {contest.participantCount || 0}</div>
          <div className="flex items-center gap-1"><Clock className="h-3 w-3" /> {duration}m</div>
          <div className="flex items-center gap-1"><Trophy className="h-3 w-3" /> {contest.problems?.length || 0}</div>
        </div>
        <ChevronRight className="h-3.5 w-3.5 text-muted-foreground transition-all group-hover:translate-x-0.5 group-hover:text-primary" />
      </div>
    </Link>
  );
}

function StatsCard({ icon: Icon, label, value, subtext }: { icon: any; label: string; value: string; subtext: string }) {
  return (
    <div className="p-5 rounded-2xl bg-muted/30 border border-border/40">
      <div className="flex items-center gap-2 text-[10px] uppercase font-mono font-bold tracking-widest text-muted-foreground">
        <Icon className="h-3 w-3" /> {label}
      </div>
      <div className="mt-2 flex items-baseline gap-2">
        <span className="text-2xl font-black">{value}</span>
        <span className="text-[10px] text-primary font-bold">{subtext}</span>
      </div>
    </div>
  );
}

function ContestCountdown({ startTime }: { startTime: string | Date }) {
  const [timeLeft, setTimeLeft] = React.useState<string>("");

  React.useEffect(() => {
    const target = new Date(startTime).getTime();
    const update = () => {
      const now = Date.now();
      const diff = target - now;
      if (diff <= 0) { setTimeLeft("00:00:00"); return; }
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      const seconds = Math.floor((diff / 1000) % 60);
      if (days > 0) setTimeLeft(`${days}d ${hours}h ${minutes}m`);
      else setTimeLeft(`${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`);
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [startTime]);

  return <span className="tabular-nums">{timeLeft}</span>;
}

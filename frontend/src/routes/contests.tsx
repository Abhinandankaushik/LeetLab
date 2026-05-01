import * as React from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { contestsApi, type Contest } from "@/lib/api";
import { Trophy, Calendar, Users, Clock, Zap } from "lucide-react";
import { CardGridSkeleton, EmptyState, ErrorState } from "@/components/empty-state";
import { cn } from "@/lib/utils";

type Tab = "upcoming" | "live" | "ended";

export default function ContestsPage() {
  const [tab, setTab] = React.useState<Tab>("upcoming");
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["contests"],
    queryFn: () => contestsApi.all()
  });

  const contests = data?.contests ?? [];
  const filtered = contests.filter((c) => c.status === tab);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-mono text-xs uppercase tracking-widest text-primary">/ contests</p>
          <h1 className="mt-2 font-display text-4xl font-bold">Compete. Climb. Conquer.</h1>
          <p className="mt-2 max-w-xl text-sm text-muted-foreground">
            Rated weekly and biweekly contests. Win rating, earn badges, climb the leaderboard.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-8 flex overflow-x-auto scrollbar-none pb-1">
        <div className="inline-flex items-center gap-1 rounded-md border border-border bg-card p-1 shrink-0">
          {(["upcoming", "live", "ended"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                "rounded px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all shrink-0",
                tab === t ? "bg-primary text-primary-foreground shadow-lg" : "text-muted-foreground hover:text-foreground hover:bg-muted/50",
              )}
            >
              {t === "live" && <span className="mr-1.5 inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-hard" />}
              {t}
            </button>
          ))}
        </div>
      </div>

      {isLoading && <CardGridSkeleton count={6} />}
      {isError && <ErrorState description="Couldn't fetch contests." onRetry={() => refetch()} />}
      {!isLoading && !isError && filtered.length === 0 && (
        <EmptyState
          icon={Trophy}
          title={tab === "upcoming" ? "No upcoming contests" : tab === "live" ? "No live contests" : "No ended contests"}
          description={
            contests.length === 0
              ? "Contest endpoints are not yet available on the backend. Add /contests routes to your Express server to populate this page."
              : "Check back soon — new contests are scheduled regularly."
          }
        />
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filtered.map((c) => <ContestCard key={c.id} contest={c} tab={tab} />)}
      </div>
    </div>
  );
}

function ContestCard({ contest, tab }: { contest: Contest; tab: Tab }) {
  const start = new Date(contest.startTime);
  const end = new Date(contest.endTime);
  const duration = Math.round((end.getTime() - start.getTime()) / 60000);

  const accent =
    contest.type === "weekly" ? "from-primary to-accent"
      : contest.type === "biweekly" ? "from-accent to-medium"
        : contest.type === "monthly" ? "from-medium to-hard" : "from-primary to-medium";

  return (
    <Link
      to={`/contests/${contest.slug}`}
      className="group relative overflow-hidden rounded-xl border border-border bg-card p-5 transition-all hover:border-primary/50 hover:shadow-lg"
      style={{ boxShadow: "0 1px 0 0 var(--border)" }}
    >
      <div className={cn("absolute -right-12 -top-12 h-32 w-32 rounded-full bg-gradient-to-br opacity-20 blur-2xl transition-opacity group-hover:opacity-40", accent)} />
      <div className="relative">
        <div className="flex items-center justify-between">
          <span className={cn("rounded-md bg-gradient-to-r px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider text-primary-foreground", accent)}>
            {contest.type}
          </span>
          {tab === "live" && <span className="flex items-center gap-1 font-mono text-[10px] font-bold uppercase text-hard">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-hard" /> LIVE
          </span>}
        </div>

        <h3 className="mt-4 font-display text-lg font-semibold">{contest.name}</h3>
        {contest.description && <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{contest.description}</p>}

        <dl className="mt-5 grid grid-cols-2 gap-3 font-mono text-[11px]">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Calendar className="h-3 w-3" />
            <span>{start.toLocaleDateString(undefined, { month: "short", day: "numeric" })}</span>
          </div>
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Clock className="h-3 w-3" />
            <span>{duration} min</span>
          </div>
          {contest.participantCount !== undefined && (
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Users className="h-3 w-3" />
              <span>{contest.participantCount.toLocaleString()}</span>
            </div>
          )}
          {contest.problems?.length ? (
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Zap className="h-3 w-3" />
              <span>{contest.problems.length} problems</span>
            </div>
          ) : null}
        </dl>
      </div>
    </Link>
  );
}

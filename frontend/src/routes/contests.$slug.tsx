import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { contestsApi } from "@/lib/api";
import { ArrowLeft, Trophy, Calendar, Clock, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ListSkeleton, EmptyState, ErrorState } from "@/components/empty-state";
import { DifficultyBadge } from "@/components/difficulty-badge";


export default function ContestDetailPage() {
  const { slug } = useParams();
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["contest", slug],
    queryFn: () => contestsApi.get(slug!)});
  const standings = useQuery({
    queryKey: ["contest-standings", slug],
    queryFn: () => contestsApi.standings(slug!)});

  if (isLoading) return <div className="mx-auto max-w-5xl px-4 py-10"><ListSkeleton rows={6} /></div>;
  if (isError) return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <ErrorState description="Couldn't load contest." onRetry={() => refetch()} />
    </div>
  );

  const contest = data?.contest;
  if (!contest) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10">
        <EmptyState
          icon={Trophy}
          title="Contest not found"
          description="It may have been removed, or contest endpoints aren't enabled on your backend yet."
          action={<Button asChild><Link to="/contests"><ArrowLeft className="h-4 w-4" /> Back to contests</Link></Button>}
        />
      </div>
    );
  }

  const start = new Date(contest.startTime);
  const end = new Date(contest.endTime);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <Link to="/contests" className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-3 w-3" /> All contests
      </Link>

      <div className="mt-4 overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-card via-card to-primary/5 p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <span className="rounded-md bg-primary/15 px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider text-primary">
              {contest.type} · {contest.status}
            </span>
            <h1 className="mt-3 font-display text-4xl font-bold">{contest.name}</h1>
            {contest.description && <p className="mt-2 max-w-2xl text-sm text-muted-foreground">{contest.description}</p>}
          </div>
          <Button size="lg" disabled={contest.status === "ended"}>
            {contest.status === "upcoming" ? "Register" : contest.status === "live" ? "Enter contest" : "Ended"}
          </Button>
        </div>

        <dl className="mt-6 grid gap-4 font-mono text-xs sm:grid-cols-4">
          <Stat icon={Calendar} label="starts" value={start.toLocaleString()} />
          <Stat icon={Clock} label="ends" value={end.toLocaleString()} />
          <Stat icon={Users} label="entrants" value={(contest.participantCount ?? 0).toLocaleString()} />
          <Stat icon={Trophy} label="problems" value={String(contest.problems?.length ?? 0)} />
        </dl>
      </div>

      {/* Problems */}
      <h2 className="mt-10 font-display text-2xl font-bold">Problems</h2>
      <div className="mt-4 overflow-hidden rounded-xl border border-border bg-card">
        {!contest.problems?.length && (
          <div className="p-8 text-center text-sm text-muted-foreground">Problems will appear when the contest starts.</div>
        )}
        {contest.problems?.map((cp) => (
          <Link
            key={cp.id}
            to={`/problems/${cp.problem.id}`}
            className="flex items-center justify-between border-b border-border/60 px-4 py-3 last:border-0 hover:bg-muted/40"
          >
            <div className="flex items-center gap-4">
              <span className="grid h-8 w-8 place-items-center rounded-md bg-primary/15 font-mono text-sm font-bold text-primary">{cp.label}</span>
              <span className="font-medium">{cp.problem.title}</span>
              <DifficultyBadge value={cp.problem.defficulty} />
            </div>
            <span className="font-mono text-xs text-muted-foreground">{cp.points} pts</span>
          </Link>
        ))}
      </div>

      {/* Standings */}
      <h2 className="mt-10 font-display text-2xl font-bold">Standings</h2>
      <div className="mt-4 overflow-hidden rounded-xl border border-border bg-card">
        {standings.isLoading && <div className="p-6"><ListSkeleton rows={5} /></div>}
        {!standings.isLoading && (standings.data?.standings?.length ?? 0) === 0 && (
          <div className="p-8 text-center text-sm text-muted-foreground">No standings yet.</div>
        )}
        {standings.data?.standings?.map((s: any, i: number) => (
          <div key={i} className="grid grid-cols-[40px_1fr_80px_80px] items-center gap-4 border-b border-border/60 px-4 py-3 text-sm last:border-0">
            <span className="font-mono font-bold text-primary">#{s.rank ?? i + 1}</span>
            <span>{s.user?.name || s.username}</span>
            <span className="font-mono text-xs text-muted-foreground">{s.score} pts</span>
            <span className="font-mono text-xs text-muted-foreground">{s.penalty || 0} min</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function Stat({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="rounded-md border border-border/60 bg-background/40 p-3">
      <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-muted-foreground">
        <Icon className="h-3 w-3" /> {label}
      </div>
      <div className="mt-1 font-display text-sm font-bold">{value}</div>
    </div>
  );
}

import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { problemsApi, contestsApi, leaderboardApi } from "@/lib/api";
import {
  ArrowRight, Code2, Trophy, Layers, Zap, Terminal, MessageSquare,
  Flame, Users, Activity,
} from "lucide-react";
import { Typewriter } from "@/components/Typewriter";

export default function HomePage() {
  const problems = useQuery({
    queryKey: ["problems"],
    queryFn: () => problemsApi.list().then((r: any) => (r.problems || r.data || []) as any[])
  });
  const contests = useQuery({ queryKey: ["contests"], queryFn: () => contestsApi.all() });
  const leaders = useQuery({ queryKey: ["leaderboard", "all"], queryFn: () => leaderboardApi.all({ range: "all" }) });

  const problemCount = problems.data?.length ?? 0;
  const contestCount = contests.data?.contests.length ?? 0;
  const topRating = leaders.data?.entries[0]?.rating ?? 0;

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border/60">
        <div className="absolute -left-32 top-0 h-96 w-96 rounded-full bg-primary/10 blur-3xl animate-pulse-glow" />
        <div className="absolute -right-32 bottom-0 h-96 w-96 rounded-full bg-accent/10 blur-3xl animate-pulse-glow" style={{ animationDelay: "2s" }} />
        <div className="mx-auto grid max-w-7xl gap-12 px-4 py-20 lg:grid-cols-[1.2fr_1fr] lg:py-28">
          <div className="relative">
            <div className="mb-6 inline-flex animate-fade-in items-center gap-2 rounded-full border border-border bg-muted/40 px-3 py-1 font-mono text-xs text-muted-foreground">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
              v2.0 — contests · discuss · leaderboard live
            </div>
            <h1 className="font-display text-5xl font-bold leading-[1.05] tracking-tight md:text-7xl">
              <span className="block animate-slide-in-left" style={{ animationDelay: "0.05s" }}>practice.</span>
              <span className="block animate-slide-in-left" style={{ animationDelay: "0.18s" }}>compete.</span>
              <span className="block animate-slide-in-left text-gradient-animated" style={{ animationDelay: "0.32s" }}>ascend.</span>
            </h1>
            <p className="mt-6 max-w-lg animate-fade-in-up text-lg text-muted-foreground" style={{ animationDelay: "0.45s" }}>
              The competitive programming arena that fuses LeetCode's curation, Codeforces's
              rigor, and HackerRank's breadth — into one focused workspace.
            </p>
            <div className="mt-8 flex flex-wrap gap-3 animate-fade-in-up" style={{ animationDelay: "0.58s" }}>
              <Button asChild size="lg" className="font-semibold glow-primary btn-shine hover-lift">
                <Link to="/problems">Start solving <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" /></Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="hover-lift">
                <Link to="/contests">View contests</Link>
              </Button>
            </div>

            <dl className="mt-12 grid grid-cols-3 gap-6 border-t border-border/60 pt-6 font-mono stagger">
              <Stat label="problems" value={problemCount > 0 ? `${problemCount}` : "live"} />
              <Stat label="contests" value={contestCount > 0 ? `${contestCount}` : "weekly"} />
              <Stat label="top rating" value={topRating > 0 ? `${topRating}` : "—"} />
            </dl>
          </div>

          {/* 3D code preview card */}
          <div className="relative perspective-1000">
            <div className="animate-float relative preserve-3d" style={{ transform: "rotateY(-8deg) rotateX(4deg)" }}>
              <div className="overflow-hidden rounded-xl border border-border bg-card shadow-2xl shadow-black/40">
                <div className="flex items-center justify-between border-b border-border bg-muted/30 px-4 py-2">
                  <div className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-hard/70" />
                    <span className="h-2.5 w-2.5 rounded-full bg-medium/70" />
                    <span className="h-2.5 w-2.5 rounded-full bg-easy/70" />
                  </div>
                  <span className="font-mono text-xs text-muted-foreground">two_sum.py</span>
                  <Terminal className="h-3.5 w-3.5 text-muted-foreground" />
                </div>
                <pre className="overflow-x-auto p-5 font-mono text-[13px] leading-relaxed text-foreground min-h-[220px]">
                  <Typewriter text={`class Solution:
  def twoSum(self, nums, target):
    seen = {}
    for i, n in enumerate(nums):
      if (k := target - n) in seen:
        return [seen[k], i]
      seen[n] = i

# Submit → Judge0 → ✓ Accepted
# 12ms · 14.2 MB · beats 92%`} />
                </pre>
                <div className="flex items-center justify-between border-t border-border bg-muted/20 px-4 py-2 font-mono text-xs">
                  <span className="text-easy">● Accepted</span>
                  <span className="text-muted-foreground">10 / 10 testcases</span>
                </div>
              </div>
              {/* floating accent cards */}
              <div
                className="absolute -right-6 -top-6 hidden rounded-xl border border-primary/40 bg-card/90 p-3 shadow-xl backdrop-blur md:block"
                style={{ transform: "translateZ(40px) rotateY(8deg)" }}
              >
                <div className="flex items-center gap-2 font-mono text-xs">
                  <Flame className="h-4 w-4 text-medium" />
                  <span><span className="font-bold text-medium">15</span> day streak</span>
                </div>
              </div>
              <div
                className="absolute -bottom-6 -left-6 hidden rounded-xl border border-accent/40 bg-card/90 p-3 shadow-xl backdrop-blur md:block"
                style={{ transform: "translateZ(40px) rotateY(-8deg)" }}
              >
                <div className="flex items-center gap-2 font-mono text-xs">
                  <Trophy className="h-4 w-4 text-primary" />
                  <span>rating <span className="font-bold text-primary">+47</span></span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pillars */}
      <section className="mx-auto max-w-7xl px-4 py-20">
        <div className="mb-12 max-w-2xl">
          <p className="font-mono text-xs uppercase tracking-widest text-primary">/ four arenas</p>
          <h2 className="mt-3 font-display text-4xl font-bold">One platform. Every fight.</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 stagger">
          <Pillar
            to="/problems" icon={Code2} title="Problemset"
            body="Curated DSA problems. Real Judge0 execution. Multi-language support."
            accent="from-primary to-accent"
          />
          <Pillar
            to="/contests" icon={Trophy} title="Contests"
            body="Weekly rated contests. Live standings. Earn rating and badges."
            accent="from-accent to-medium"
          />
          <Pillar
            to="/leaderboard" icon={Activity} title="Leaderboard"
            body="Climb the global ranks. Compare with peers. Track your trajectory."
            accent="from-medium to-hard"
          />
          <Pillar
            to="/discuss" icon={MessageSquare} title="Discuss"
            body="Ask, answer, share editorials, and unpack interview experiences."
            accent="from-hard to-primary"
          />
        </div>
      </section>

      {/* Features grid */}
      <section className="mx-auto max-w-7xl px-4 pb-20">
        <div className="grid gap-px overflow-hidden rounded-xl border border-border bg-border md:grid-cols-2 lg:grid-cols-3 stagger">
          <Feature icon={Code2} title="Real code execution" body="Judge0-powered runner streams stdout, runtime, and memory for every testcase." />
          <Feature icon={Layers} title="Curated playlists" body="Group problems into focused tracks — DP, graphs, two-pointers, system warmups." />
          <Feature icon={Trophy} title="Submission history" body="Every run is logged with status, language, and per-testcase breakdowns." />
          <Feature icon={Zap} title="Multi-language" body="Python, JavaScript, Java, C++ — switch in one click without losing context." />
          <Feature icon={Users} title="Community discuss" body="Editorials, questions, interview experiences — a brain trust at your fingertips." />
          <Feature icon={Flame} title="Streaks & badges" body="Daily streak system and badges that reward consistency, not just talent." />
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-border/60 bg-muted/20">
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-6 px-4 py-20 text-center">
          <h2 className="max-w-2xl font-display text-4xl font-bold md:text-5xl">
            The grind is the gift.<br />
            <span className="text-gradient">Start the streak.</span>
          </h2>
          <Button asChild size="lg" className="glow-primary">
            <Link to="/problems">Browse the problemset <ArrowRight className="h-4 w-4" /></Link>
          </Button>
        </div>
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-widest text-muted-foreground">{label}</dt>
      <dd className="mt-1 text-2xl font-bold text-foreground">{value}</dd>
    </div>
  );
}

function Pillar({ to, icon: Icon, title, body, accent }: { to: string; icon: any; title: string; body: string; accent: string }) {
  return (
    <Link
      to={to}
      className="group relative overflow-hidden rounded-xl border border-border bg-card p-6 hover-lift hover:border-primary/50"
    >
      <div className={`absolute -right-10 -top-10 h-32 w-32 rounded-full bg-gradient-to-br ${accent} opacity-15 blur-2xl transition-all duration-500 group-hover:opacity-40 group-hover:scale-125`} />
      <div className="relative">
        <div className={`inline-grid h-10 w-10 place-items-center rounded-lg bg-gradient-to-br ${accent} text-primary-foreground transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3`}>
          <Icon className="h-5 w-5" />
        </div>
        <h3 className="mt-4 font-display text-lg font-semibold">{title}</h3>
        <p className="mt-1 text-sm text-muted-foreground">{body}</p>
        <ArrowRight className="mt-4 h-4 w-4 text-primary opacity-0 -translate-x-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0" />
      </div>
    </Link>
  );
}

function Feature({ icon: Icon, title, body }: { icon: any; title: string; body: string }) {
  return (
    <div className="group relative bg-card p-6 transition-all duration-300 hover:bg-card/40">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
      <Icon className="h-6 w-6 text-primary transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6" />
      <h3 className="mt-4 font-display text-lg font-semibold">{title}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{body}</p>
    </div>
  );
}

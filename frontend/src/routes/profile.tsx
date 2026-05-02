import * as React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/lib/auth-context";
import { problemsApi, submissionsApi, usersApi, type Problem, type Submission } from "@/lib/api";
import {
  Loader2, Trophy, Code2, Activity, Flame, Pencil, Globe, Github, Twitter, Linkedin, Link as LinkIcon, MapPin, Briefcase
} from "lucide-react";
import { DifficultyBadge } from "@/components/difficulty-badge";
import { ActivityHeatmap } from "@/components/activity-heatmap";
import { MonthlyStreak } from "@/components/monthly-streak";
import { TopicStats } from "@/components/topic-stats";


export default function ProfilePage() {
  const { user, loading } = useAuth();
  const [solved, setSolved] = React.useState<Problem[]>([]);
  const [subs, setSubs] = React.useState<Submission[]>([]);
  const [selectedYear, setSelectedYear] = React.useState(new Date().getFullYear());
  const [activity, setActivity] = React.useState<{ activity: any[]; currentStreak: number; maxStreak: number; totalActive: number } | null>(null);
  const [topics, setTopics] = React.useState<{ tag: string; solved: number; total: number }[]>([]);

  const availableYears = React.useMemo(() => {
    if (!user?.createdAt) return [new Date().getFullYear()];
    const startYear = new Date(user.createdAt).getFullYear();
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let y = currentYear; y >= startYear; y--) years.push(y);
    return years;
  }, [user]);

  React.useEffect(() => {
    if (!user) return;
    problemsApi.solved().then((r: any) => setSolved(r.problems || r.data || [])).catch(() => { });
    submissionsApi.all().then((r: any) => setSubs(r.submissions || r.data || [])).catch(() => { });
    usersApi.topicStats(user.id).then((r) => setTopics(r.stats)).catch(() => { });
  }, [user]);

  React.useEffect(() => {
    if (!user) return;
    usersApi.activity(user.id, selectedYear).then(setActivity).catch(() => { });
  }, [user, selectedYear]);

  const heatmapData = React.useMemo(() => {
    return activity?.activity || [];
  }, [activity]);

  // Derive topic stats from solved problems if backend missing
  const topicData = React.useMemo(() => {
    if (topics.length > 0) return topics;
    const counter = new Map<string, number>();
    solved.forEach((p) => p.tags?.forEach((t) => counter.set(t, (counter.get(t) || 0) + 1)));
    return Array.from(counter.entries()).map(([tag, count]) => ({ tag, solved: count, total: count }));
  }, [topics, solved]);

  if (loading) return <div className="grid min-h-[40vh] place-items-center"><Loader2 className="h-5 w-5 animate-spin" /></div>;
  if (!user) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <h1 className="font-display text-3xl font-bold">Sign in required</h1>
        <Link to="/login" className="mt-6 inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">Sign in</Link>
      </div>
    );
  }

  const accepted = subs.filter((s) => s.status?.toLowerCase().includes("accept")).length;
  const counts = {
    easy: solved.filter((p) => p.defficulty === "EASY").length,
    medium: solved.filter((p) => p.defficulty === "MEDIUM").length,
    hard: solved.filter((p) => p.defficulty === "HARD").length
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 stagger">
      {/* Header */}
      <div className="rounded-2xl border border-border bg-card p-4 md:p-6 hover-glow">
        <div className="flex flex-col md:flex-row items-start justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-start gap-5">
            {user.image ? (
              <img src={user.image} alt={user.name || ""} className="h-24 w-24 rounded-2xl object-cover ring-4 ring-primary/30 hover-tilt" />
            ) : (
              <div className="grid h-24 w-24 place-items-center rounded-2xl bg-gradient-primary text-3xl font-bold uppercase text-primary-foreground glow-primary hover-tilt">
                {(user.name || user.email).slice(0, 2)}
              </div>
            )}
            <div>
              <h1 className="font-display text-3xl font-bold">{user.name || user.email.split("@")[0]}</h1>
              <p className="font-mono text-sm text-muted-foreground">{user.email}</p>
              {user.bio && <p className="mt-2 max-w-xl text-sm text-foreground/80">{user.bio}</p>}
              <div className="mt-3 flex flex-wrap gap-3 font-mono text-xs text-muted-foreground">
                {user.country && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {user.country}</span>}
                {user.company && <span className="flex items-center gap-1"><Briefcase className="h-3 w-3" /> {user.company}{user.jobTitle ? ` · ${user.jobTitle}` : ""}</span>}
                {user.websiteUrl && (
                  <a href={user.websiteUrl} target="_blank" rel="noreferrer" className="story-link flex items-center gap-1 text-primary"><Globe className="h-3 w-3" /> website</a>
                )}
              </div>
              {user.socials && user.socials.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {user.socials.map((s, i) => (
                    <a key={i} href={s.url} target="_blank" rel="noreferrer"
                      className="inline-flex items-center gap-1 rounded-md border border-border px-2 py-1 font-mono text-xs hover:border-primary hover:text-primary transition-colors">
                      <SocialIcon platform={s.platform} /> {s.platform}
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>
          <Link to="/profile/edit" className="w-full md:w-auto inline-flex items-center justify-center gap-2 rounded-md border border-border px-3 py-2 text-sm hover:bg-muted hover-lift">
            <Pencil className="h-3 w-3" /> Edit Profile
          </Link>
        </div>
      </div>

      {/* Top stats */}
      <div className="mt-6 grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Trophy} label="solved" value={solved.length} accent />
        <StatCard icon={Code2} label="submissions" value={subs.length} />
        <StatCard icon={Activity} label="accepted" value={accepted} />
        <StatCard icon={Flame} label="streak" value={user.currentStreak ?? 0} />
      </div>

      <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Tier label="Easy" count={counts.easy} color="text-easy" />
        <Tier label="Medium" count={counts.medium} color="text-medium" />
        <Tier label="Hard" count={counts.hard} color="text-hard" />
      </div>

      {/* Heatmap + Monthly */}
      <div className="mt-8 flex flex-col lg:flex-row gap-6">
        <div className="flex-1 min-w-0">
          <ActivityHeatmap 
            data={heatmapData} 
            year={selectedYear} 
            onYearChange={setSelectedYear}
            availableYears={availableYears}
          />
        </div>
        <div className="w-full lg:w-80 shrink-0 mx-auto max-w-sm lg:max-w-none">
          <MonthlyStreak
            data={heatmapData}
            currentStreak={activity?.currentStreak ?? user.currentStreak ?? 0}
            longestStreak={activity?.maxStreak ?? user.longestStreak ?? 0}
          />
        </div>
      </div>

      {/* Topics + Skills */}
      <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_1fr]">
        <TopicStats stats={topicData} />
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="mb-4 font-display text-lg font-bold">Languages used</div>
          <LanguageChart subs={subs} />
        </div>
      </div>

      {/* Solved list */}
      <h2 className="mt-12 font-display text-2xl font-bold px-1">Recently solved</h2>
      <div className="mt-6 overflow-hidden rounded-xl border border-border bg-card">
        <div className="relative w-full overflow-x-auto">
          <div className="min-w-full">
            {solved.length === 0 && <div className="p-8 text-center text-sm text-muted-foreground">Nothing yet — let's fix that.</div>}
            {solved.slice(0, 12).map((p) => (
              <Link key={p.id} to={`/problems/${p.id}`} className="flex items-center justify-between border-b border-border/60 px-4 py-3.5 last:border-0 hover:bg-muted/40 hover:translate-x-1 transition-all">
                <span className="font-medium text-sm md:text-base truncate pr-4">{p.title}</span>
                <DifficultyBadge value={p.defficulty} />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, accent = false }: { icon: any; label: string; value: number; accent?: boolean }) {
  return (
    <div className={`rounded-xl border bg-card p-5 hover-lift ${accent ? "border-primary/40 glow-primary" : "border-border"}`}>
      <Icon className={`h-5 w-5 ${accent ? "text-primary" : "text-muted-foreground"}`} />
      <div className="mt-3 font-mono text-xs uppercase tracking-widest text-muted-foreground">{label}</div>
      <div className="mt-1 font-display text-3xl font-bold">{value}</div>
    </div>
  );
}

function Tier({ label, count, color }: { label: string; count: number; color: string }) {
  return (
    <div className="flex items-center justify-between rounded-md border border-border bg-card px-4 py-3 hover-lift">
      <span className="text-sm">{label}</span>
      <span className={`font-mono text-lg font-bold ${color}`}>{count}</span>
    </div>
  );
}

function SocialIcon({ platform }: { platform: string }) {
  const p = platform.toLowerCase();
  if (p.includes("github")) return <Github className="h-3 w-3" />;
  if (p.includes("twitter") || p.includes("x")) return <Twitter className="h-3 w-3" />;
  if (p.includes("linkedin")) return <Linkedin className="h-3 w-3" />;
  return <LinkIcon className="h-3 w-3" />;
}

function LanguageChart({ subs }: { subs: Submission[] }) {
  const map = new Map<string, number>();
  subs.forEach((s) => map.set(s.language, (map.get(s.language) || 0) + 1));
  const total = subs.length || 1;
  const entries = Array.from(map.entries()).sort((a, b) => b[1] - a[1]);
  if (entries.length === 0) return <p className="text-sm text-muted-foreground">No submissions yet.</p>;
  return (
    <div className="space-y-3">
      {entries.map(([lang, count]) => {
        const pct = Math.round((count / total) * 100);
        return (
          <div key={lang}>
            <div className="mb-1 flex items-center justify-between font-mono text-xs">
              <span>{lang}</span>
              <span className="text-muted-foreground">{count} ({pct}%)</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-muted">
              <div className="h-full bg-gradient-primary transition-all duration-700" style={{ width: `${pct}%` }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

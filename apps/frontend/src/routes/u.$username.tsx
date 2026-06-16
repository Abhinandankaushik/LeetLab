import * as React from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { usersApi, ratingsApi } from "@/lib/api";
import { 
  Trophy, Code2, Globe, MapPin, Eye, CheckCircle2, 
  MessageSquare, Star, TrendingUp, Users, ArrowLeft, Share2, Mail, Link as LinkIcon
} from "lucide-react";
import { ActivityHeatmap } from "@/components/activity-heatmap";
import { SolvedProblemsDonut, DifficultyRow } from "@/components/solved-problems-donut";
import { AreaChart, Area, ResponsiveContainer } from "recharts";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ProfileSkeleton } from "@/components/empty-state";

export default function PublicProfilePage() {
  const { username } = useParams();
  const [selectedYear, setSelectedYear] = React.useState(new Date().getFullYear());

  const { data: profile, isLoading, isError } = useQuery({
    queryKey: ["public-profile", username],
    queryFn: () => usersApi.public(username!),
    enabled: !!username
  });

  const { data: ratingHistoryData } = useQuery({
    queryKey: ["user-rating", profile?.user?.id],
    queryFn: () => ratingsApi.getUserRating(profile.user.id),
    enabled: !!profile?.user?.id
  });

  const ratingHistory = React.useMemo(() => {
    if (!ratingHistoryData?.success) return [];
    let currentRating = 0;
    const history = ratingHistoryData.ratingData.contestParticipations.map((p: any) => {
      currentRating += p.ratingChange || 0;
      return { rating: currentRating };
    });
    return [{ rating: 0 }, ...history];
  }, [ratingHistoryData]);

  if (isLoading) return <ProfileSkeleton />;
  if (isError || !profile) return (
    <div className="mx-auto max-w-md px-4 py-32 text-center">
      <Trophy className="mx-auto h-12 w-12 text-muted-foreground opacity-20 mb-4" />
      <h1 className="text-2xl font-black">User not found</h1>
      <p className="mt-2 text-muted-foreground">The user you are looking for does not exist or has a private profile.</p>
      <Link to="/leaderboard" className="mt-8 inline-block text-sm font-bold text-primary hover:underline">View Leaderboard</Link>
    </div>
  );

  const { user, stats, languages, skills, recentSubmissions, badges, activityHeatmap } = profile;
  const heatmapData = Object.entries(activityHeatmap).map(([date, count]) => ({ date, count }));

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 stagger">
      <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-8">
        
        {/* Sidebar */}
        <aside className="space-y-6">
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm overflow-hidden relative group">
             <div className="absolute top-0 inset-x-0 h-1 bg-gradient-primary" />
             <div className="flex flex-col items-center text-center">
                {user.image ? (
                  <img src={user.image} alt="" className="h-24 w-24 rounded-2xl object-cover ring-4 ring-primary/10" />
                ) : (
                  <div className="grid h-24 w-24 place-items-center rounded-2xl bg-gradient-primary text-3xl font-bold uppercase text-white">
                    {(user.name || user.username).slice(0, 2)}
                  </div>
                )}
                <h1 className="mt-4 font-display text-xl font-black tracking-tight">{user.name || user.username}</h1>
                <p className="font-mono text-xs text-muted-foreground">@{user.username}</p>
                <div className="mt-2 flex items-center gap-1.5 text-xs font-bold text-muted-foreground">
                   <span>Rank</span>
                   <span className="text-foreground">{stats.rank || "—"}</span>
                </div>

                <div className="mt-6 flex gap-4 text-center">
                   <div>
                      <div className="text-sm font-black">{stats.following || 0}</div>
                      <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Following</div>
                   </div>
                   <div className="h-8 w-px bg-border/60" />
                   <div>
                      <div className="text-sm font-black">{stats.followers || 0}</div>
                      <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Followers</div>
                   </div>
                </div>

                <Button className="mt-6 w-full rounded-xl bg-primary text-white font-bold shadow-lg shadow-primary/20 hover:shadow-primary/30 active:scale-95">
                   Follow
                </Button>
             </div>

             <div className="mt-8 space-y-4 pt-6 border-t border-border/40 text-sm text-foreground/80">
                <div className="flex items-center gap-3">
                   <MapPin className="h-4 w-4 text-muted-foreground" />
                   <span>{user.country || "Earth"}</span>
                </div>
                {user.websiteUrl && (
                  <a href={user.websiteUrl} className="flex items-center gap-3 text-primary hover:underline">
                    <LinkIcon className="h-4 w-4" />
                    <span className="truncate">Website</span>
                  </a>
                )}
             </div>
          </div>

          {/* Community Stats */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
             <h3 className="font-display text-sm font-bold uppercase tracking-[0.2em] text-muted-foreground mb-6">Community Stats</h3>
             <div className="space-y-4">
                <SidebarStat icon={Eye} label="Views" value={stats.views} />
                <SidebarStat icon={CheckCircle2} label="Solutions" value={stats.solutions} />
                <SidebarStat icon={MessageSquare} label="Discuss" value={stats.discuss} />
                <SidebarStat icon={Star} label="Reputation" value={stats.reputation} />
             </div>
          </div>

          {/* Languages */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
             <h3 className="font-display text-sm font-bold uppercase tracking-[0.2em] text-muted-foreground mb-6">Languages</h3>
             <div className="space-y-4">
                {languages.map((l: any) => (
                  <div key={l.name} className="flex items-center justify-between">
                     <span className="rounded-full bg-muted/40 px-2 py-0.5 font-mono text-[10px] font-bold">{l.name}</span>
                     <span className="font-mono text-xs text-muted-foreground">{l.count} <span className="text-[10px] opacity-40">solved</span></span>
                  </div>
                ))}
             </div>
          </div>

          {/* Skills */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
             <h3 className="font-display text-sm font-bold uppercase tracking-[0.2em] text-muted-foreground mb-6">Skills</h3>
             <div className="space-y-6">
                <SkillGroup label="Advanced" items={skills.advanced} color="text-hard" />
                <SkillGroup label="Intermediate" items={skills.intermediate} color="text-medium" />
                <SkillGroup label="Fundamental" items={skills.fundamental} color="text-easy" />
             </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="space-y-6 min-w-0">
           
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Contest Rating */}
              <div className="rounded-2xl border border-border bg-card p-6 shadow-sm overflow-hidden relative">
                 <div className="flex items-center justify-between mb-8">
                    <div>
                       <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Contest Rating</p>
                       <h2 className="text-3xl font-black font-display text-primary">{user.rating || 0}</h2>
                    </div>
                    <div className="text-right">
                       <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Global Rank</p>
                       <p className="text-sm font-bold">{stats.rank} <span className="text-muted-foreground/40 font-normal">/ {stats.allUsersCount || "—"}</span></p>
                    </div>
                 </div>
                 <div className="h-[120px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                       <AreaChart data={ratingHistory}>
                          <Area type="monotone" dataKey="rating" stroke="var(--primary)" strokeWidth={3} fill="var(--primary)" fillOpacity={0.1} />
                       </AreaChart>
                    </ResponsiveContainer>
                 </div>
              </div>

              {/* Percentile Card */}
              <div className="rounded-2xl border border-border bg-card p-6 shadow-sm overflow-hidden relative flex flex-col justify-between">
                 <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Top Percentile</p>
                    <h2 className="text-4xl font-black font-display text-primary mt-1">{stats.percentile}%</h2>
                 </div>
                 <div className="h-16 w-full bg-muted/20 rounded-xl flex items-end gap-1 px-4 py-2">
                    {stats.distribution?.map((v: number, i: number) => (
                      <div key={i} className={cn("flex-1 rounded-t-sm", i === Math.floor((user.rating / 3000) * 20) ? "bg-primary" : "bg-primary/20")} style={{ height: `${Math.max(10, (v / Math.max(...stats.distribution)) * 100)}%` }} />
                    ))}
                 </div>
              </div>
           </div>

           {/* Middle Grid */}
           <div className="grid grid-cols-1 md:grid-cols-[1.5fr_1fr] gap-6">
              {/* Solved Problems */}
              <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                 <h3 className="font-display text-sm font-bold uppercase tracking-widest text-muted-foreground mb-6">Solved Problems</h3>
                 <div className="flex flex-col sm:flex-row items-center gap-10">
                    <SolvedProblemsDonut solved={stats.difficultyStats} total={stats.totalByDiff} />
                    <div className="flex-1 w-full space-y-4">
                       <DifficultyRow label="Easy" solved={stats.difficultyStats.EASY} total={stats.totalByDiff.EASY} color="bg-easy" />
                       <DifficultyRow label="Medium" solved={stats.difficultyStats.MEDIUM} total={stats.totalByDiff.MEDIUM} color="bg-medium" />
                       <DifficultyRow label="Hard" solved={stats.difficultyStats.HARD} total={stats.totalByDiff.HARD} color="bg-hard" />
                    </div>
                 </div>
              </div>

              {/* Badges */}
              <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                 <div className="flex items-center justify-between mb-6">
                    <h3 className="font-display text-sm font-bold uppercase tracking-widest text-muted-foreground">Badges</h3>
                    <span className="font-mono text-xs font-bold text-primary">{badges.length}</span>
                 </div>
                 <div className="grid grid-cols-3 gap-4">
                    {badges.map((b: any) => (
                      <div key={b.key} className="group relative aspect-square rounded-xl bg-muted/20 border border-border/40 flex items-center justify-center hover:bg-muted/40 transition-colors">
                         <div className="text-2xl filter grayscale group-hover:grayscale-0 transition-all duration-500 scale-90 group-hover:scale-110">
                            {b.key === 'starter' ? '🚀' : b.key === 'hundred' ? '💯' : '🔥'}
                         </div>
                      </div>
                    ))}
                    {badges.length === 0 && <div className="col-span-3 py-8 text-center text-[10px] text-muted-foreground font-bold uppercase">No badges yet</div>}
                 </div>
              </div>
           </div>

           {/* Activity */}
           <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
              <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                 <h3 className="font-display text-sm font-bold uppercase tracking-widest text-muted-foreground">
                    {stats.totalSubmissions} submissions in the past year
                 </h3>
                 <div className="flex items-center gap-4 text-[10px] font-bold uppercase text-muted-foreground shrink-0">
                    <span>Max Streak: <span className="text-foreground">{user.longestStreak || 0}</span></span>
                    <span>Active Days: <span className="text-foreground">{stats.activeDays}</span></span>
                 </div>
              </div>
              <ActivityHeatmap data={heatmapData} year={selectedYear} onYearChange={setSelectedYear} availableYears={profile.availableYears} />
           </div>

           {/* Submissions List */}
           <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-sm">
              <div className="flex border-b border-border overflow-x-auto scrollbar-none">
                 <button className="shrink-0 whitespace-nowrap px-4 sm:px-6 py-4 text-xs font-bold uppercase tracking-widest border-b-2 border-primary text-primary bg-primary/5">Recent AC</button>
                 <button className="shrink-0 whitespace-nowrap px-4 sm:px-6 py-4 text-xs font-bold uppercase tracking-widest text-muted-foreground hover:bg-muted/30">Submissions</button>
              </div>
              <div className="divide-y divide-border/40">
                 {recentSubmissions.map((s: any) => (
                   <Link key={s.id} to={`/problems/${s.problem.id}`} className="flex items-center justify-between gap-3 p-4 hover:bg-muted/30 transition-all group">
                      <div className="flex items-center gap-3 min-w-0">
                         <div className={cn("h-2 w-2 rounded-full shrink-0", s.status === 'Accepted' ? "bg-easy" : "bg-hard")} />
                         <span className="font-bold group-hover:text-primary transition-colors truncate">{s.problem.title}</span>
                      </div>
                      <span className="text-[10px] font-mono text-muted-foreground uppercase shrink-0">{new Date(s.createdAt).toLocaleDateString()}</span>
                   </Link>
                 ))}
              </div>
           </div>
        </main>
      </div>
    </div>
  );
}

function SidebarStat({ icon: Icon, label, value }: { icon: any; label: string; value: any }) {
  return (
    <div className="flex items-center justify-between group">
       <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-muted/40 text-muted-foreground group-hover:text-primary transition-colors">
             <Icon className="h-4 w-4" />
          </div>
          <span className="text-sm font-bold text-foreground/70">{label}</span>
       </div>
       <div className="text-sm font-black">{value || 0}</div>
    </div>
  );
}

function SkillGroup({ label, items, color }: { label: string; items: any[]; color: string }) {
  if (items.length === 0) return null;
  return (
    <div className="space-y-3">
       <div className="flex items-center gap-2">
          <div className={`h-1 w-1 rounded-full ${color.replace('text', 'bg')}`} />
          <span className={`text-[10px] font-black uppercase tracking-widest ${color}`}>{label}</span>
       </div>
       <div className="flex flex-wrap gap-2">
          {items.map(s => (
            <div key={s.tag} className="flex items-center gap-1.5 rounded-lg border border-border/60 bg-muted/20 px-2 py-1">
               <span className="text-[10px] font-bold">{s.tag}</span>
               <span className="font-mono text-[9px] text-muted-foreground">x{s.solved}</span>
            </div>
          ))}
       </div>
    </div>
  );
}

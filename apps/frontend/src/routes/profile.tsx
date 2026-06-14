import * as React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/lib/auth-context";
import { 
  problemsApi, submissionsApi, usersApi, contestsApi, ratingsApi,
  type Problem, type Submission, type Contest 
} from "@/lib/api";
import {
  Loader2, Trophy, Code2, Activity, Flame, Pencil, Globe, Github, Twitter, Linkedin, Link as LinkIcon, MapPin, Briefcase,
  History, Calendar, ChevronRight, TrendingUp, Users, Eye, CheckCircle2, MessageSquare, Star, Sparkles, ChevronDown, Award
} from "lucide-react";
import { DifficultyBadge } from "@/components/difficulty-badge";
import { ActivityHeatmap } from "@/components/activity-heatmap";
import { SolvedProblemsDonut, DifficultyRow } from "@/components/solved-problems-donut";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import { cn } from "@/lib/utils";
import { ProfileSkeleton } from "@/components/empty-state";

export default function ProfilePage() {
  const { user, loading } = useAuth();
  const [profileData, setProfileData] = React.useState<any>(null);
  const [selectedYear, setSelectedYear] = React.useState(new Date().getFullYear());
  const [ratingHistory, setRatingHistory] = React.useState<any[]>([]);

  // Lazy loading submissions
  const [allSubmissions, setAllSubmissions] = React.useState<any[]>([]);
  const [page, setPage] = React.useState(1);
  const [hasMore, setHasMore] = React.useState(true);
  const [loadingMore, setLoadingMore] = React.useState(false);

  React.useEffect(() => {
    if (!user) return;
    usersApi.me().then(setProfileData).catch(() => { });
    
    ratingsApi.getUserRating(user.id).then((r: any) => {
      if (r.success && r.ratingData?.contestParticipations) {
        let currentRating = 0;
        const history = r.ratingData.contestParticipations.map((p: any) => {
          currentRating += p.ratingChange || 0;
          return {
            name: p.contest.name,
            rating: currentRating,
            date: new Date(p.contest.startTime).toLocaleDateString(),
            change: p.ratingChange
          };
        });
        setRatingHistory([{ name: "Initial", rating: 0, date: "Start" }, ...history]);
      }
    }).catch(() => { });
  }, [user]);

  React.useEffect(() => {
    if (profileData?.recentSubmissions) {
      setAllSubmissions(profileData.recentSubmissions);
      setHasMore(profileData.recentSubmissions.length < profileData.stats.totalSubmissions);
    }
  }, [profileData?.recentSubmissions, profileData?.stats?.totalSubmissions]);

  if (loading || !profileData) return <ProfileSkeleton />;

  const { stats, languages, skills, recentSubmissions, badges, activityHeatmap } = profileData;
  const heatmapData = Object.entries(activityHeatmap).map(([date, count]) => ({ date, count }));

  const loadMoreSubmissions = async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    try {
      const nextPage = page + 1;
      const res = await submissionsApi.all(nextPage, 15);
      if (res.submissions.length > 0) {
        setAllSubmissions(prev => [...prev, ...res.submissions]);
        setPage(nextPage);
        setHasMore(allSubmissions.length + res.submissions.length < res.pagination.total);
      } else {
        setHasMore(false);
      }
    } catch (e) {
      console.error("Failed to load more submissions", e);
    }
    setLoadingMore(false);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 stagger">
      <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-8">
        
        {/* Sidebar */}
        <aside className="space-y-6">
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm overflow-hidden relative group">
             <div className="absolute top-0 inset-x-0 h-1 bg-gradient-primary" />
             <div className="flex flex-col items-center text-center">
                {user.image ? (
                  <img src={user.image} alt="" className="h-24 w-24 rounded-2xl object-cover ring-4 ring-primary/10 hover-tilt" />
                ) : (
                  <div className="grid h-24 w-24 place-items-center rounded-2xl bg-gradient-primary text-3xl font-bold uppercase text-white shadow-xl shadow-primary/20">
                    {(user.name || user.email).slice(0, 2)}
                  </div>
                )}
                <h1 className="mt-4 font-display text-xl font-black tracking-tight">{user.name || user.email.split("@")[0]}</h1>
                <p className="font-mono text-xs text-muted-foreground">@{user.username || "leetlab_user"}</p>
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

                <Link to="/profile/edit" className="mt-6 w-full inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-primary/20 transition-all hover:shadow-primary/30 active:scale-95">
                  <Pencil className="h-4 w-4" /> Edit Profile
                </Link>
             </div>

             <div className="mt-8 space-y-4 pt-6 border-t border-border/40">
                <div className="flex items-center gap-3 text-sm text-foreground/80">
                   <MapPin className="h-4 w-4 text-muted-foreground" />
                   <span>{user.country || "Earth"}</span>
                </div>
                {user.websiteUrl && (
                  <a href={user.websiteUrl} className="flex items-center gap-3 text-sm text-primary hover:underline">
                    <Globe className="h-4 w-4" />
                    <span className="truncate">Website</span>
                  </a>
                )}
             </div>
          </div>

          {/* Community Stats */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
             <h3 className="font-display text-sm font-bold uppercase tracking-[0.2em] text-muted-foreground mb-6">Community Stats</h3>
             <div className="space-y-4">
                <SidebarStat icon={Eye} label="Views" value={stats.views} delta={0} />
                <SidebarStat icon={CheckCircle2} label="Solutions" value={stats.solutions} delta={0} />
                <SidebarStat icon={MessageSquare} label="Discuss" value={stats.discuss} delta={0} />
                <SidebarStat icon={Star} label="Reputation" value={stats.reputation} delta={0} />
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
              <ActivityHeatmap 
                data={heatmapData} 
                year={selectedYear} 
                onYearChange={setSelectedYear}
                availableYears={profileData.availableYears}
              />
           </div>

           {/* Submissions List */}
           <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-sm">
              <div className="flex border-b border-border overflow-x-auto scrollbar-none">
                 <button className="shrink-0 whitespace-nowrap px-4 sm:px-6 py-4 text-xs font-bold uppercase tracking-widest border-b-2 border-primary text-primary bg-primary/5">Recent AC</button>
                 <button className="shrink-0 whitespace-nowrap px-4 sm:px-6 py-4 text-xs font-bold uppercase tracking-widest text-muted-foreground hover:bg-muted/30">Submissions</button>
                 <button className="shrink-0 whitespace-nowrap px-4 sm:px-6 py-4 text-xs font-bold uppercase tracking-widest text-muted-foreground hover:bg-muted/30">Solutions</button>
              </div>
              <div className="divide-y divide-border/40">
                 {allSubmissions.map((s: any) => (
                   <Link key={s.id} to={`/problems/${s.problem.id}`} className="flex items-center justify-between gap-3 p-4 hover:bg-muted/30 transition-all group">
                      <div className="flex items-center gap-3 min-w-0">
                         <div className={cn(
                           "h-2 w-2 rounded-full shrink-0",
                           s.status === 'Accepted' ? "bg-easy" : "bg-hard"
                         )} />
                         <span className="font-bold group-hover:text-primary transition-colors truncate">{s.problem.title}</span>
                      </div>
                      <span className="text-[10px] font-mono text-muted-foreground uppercase shrink-0">{new Date(s.createdAt).toLocaleDateString()}</span>
                   </Link>
                 ))}
                 
                 {hasMore && (
                    <div className="p-4 flex justify-center border-t border-border/40">
                       <button 
                         onClick={loadMoreSubmissions}
                         disabled={loadingMore}
                         className="text-xs font-bold uppercase tracking-widest text-primary hover:underline disabled:opacity-50 flex items-center gap-2"
                       >
                          {loadingMore ? <Loader2 className="h-3 w-3 animate-spin" /> : "Load More"}
                       </button>
                    </div>
                 )}
              </div>
           </div>
        </main>
      </div>
    </div>
  );
}

function SidebarStat({ icon: Icon, label, value, delta }: { icon: any; label: string; value: any; delta: number }) {
  return (
    <div className="flex items-center justify-between group">
       <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-muted/40 text-muted-foreground group-hover:text-primary transition-colors">
             <Icon className="h-4 w-4" />
          </div>
          <span className="text-sm font-bold text-foreground/70">{label}</span>
       </div>
       <div className="text-right">
          <div className="text-sm font-black">{value || 0}</div>
          {delta > 0 && <div className="text-[9px] font-bold text-easy">+{delta} <span className="opacity-40">wk</span></div>}
       </div>
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

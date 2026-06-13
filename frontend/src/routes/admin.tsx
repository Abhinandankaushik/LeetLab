import * as React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/lib/auth-context";
import { adminApi, problemsApi, contestsApi, ratingsApi, type User, type Problem, type Contest } from "@/lib/api";
import { Users, Code2, Trophy, Activity, Shield, Sparkles, Plus, Trash2, Crown, RefreshCw, Edit2, Check, X, TrendingUp, BarChart3, PieChart as PieIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { cn } from "@/lib/utils";
import { DashboardSkeleton } from "@/components/empty-state";

export default function AdminDashboard() {
  const { user, loading } = useAuth();
  const [tab, setTab] = React.useState<"overview" | "users" | "problems" | "contests">("overview");
  const [stats, setStats] = React.useState({ users: 0, problems: 0, submissions: 0, contests: 0 });
  const [users, setUsers] = React.useState<User[]>([]);
  const [problems, setProblems] = React.useState<Problem[]>([]);
  const [contests, setContests] = React.useState<Contest[]>([]);
  const [analytics, setAnalytics] = React.useState<any>(null);
  const [editingContest, setEditingContest] = React.useState<Contest | null>(null);

  React.useEffect(() => {
    if (!user || user.role !== "ADMIN") return;
    adminApi.stats().then((r: any) => {
      // Fix: the backend returns direct counts or nested stats object
      setStats({
        users: r.users ?? r.stats?.userCount ?? 0,
        problems: r.problems ?? r.stats?.problemCount ?? 0,
        submissions: r.submissions ?? r.stats?.submissionCount ?? 0,
        contests: r.contests ?? r.stats?.contestCount ?? 0
      });
      if (r.recentUsers) setUsers(r.recentUsers);
    }).catch(() => { });
    
    adminApi.users().then((r) => setUsers(r.users)).catch(() => { });
    problemsApi.list().then((r: any) => setProblems(r.problems || r.data || [])).catch(() => { });
    contestsApi.all().then((r) => setContests(r.contests || [])).catch(() => { });
    adminApi.analytics().then(setAnalytics).catch(() => { });
  }, [user]);

  if (loading) return <DashboardSkeleton />;
  if (!user || user.role !== "ADMIN") {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <Shield className="mx-auto h-12 w-12 text-destructive" />
        <h1 className="mt-4 font-display text-3xl font-bold">Admins only</h1>
        <p className="mt-2 text-sm text-muted-foreground">You need admin role to access this dashboard.</p>
        <Link to="/" className="mt-6 inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">Home</Link>
      </div>
    );
  }

  const liveStats = {
    users: stats.users || users.length,
    problems: stats.problems || problems.length,
    submissions: stats.submissions,
    contests: stats.contests || contests.length
  };

  const setRole = async (uid: string, role: "ADMIN" | "USER") => {
    try { await adminApi.setRole(uid, role); setUsers(users.map((u) => u.id === uid ? { ...u, role } : u)); toast.success("Role updated"); }
    catch (e: any) { toast.error(e?.message || "Failed"); }
  };
  const ban = async (uid: string) => {
    if (!confirm("Ban this user?")) return;
    try { await adminApi.banUser(uid); toast.success("User banned"); } catch (e: any) { toast.error(e?.message || "Failed"); }
  };
  const deleteProblem = async (pid: string) => {
    if (!confirm("Delete this problem?")) return;
    try { await problemsApi.remove(pid); setProblems(problems.filter((p) => p.id !== pid)); toast.success("Deleted"); }
    catch (e: any) { toast.error(e?.message || "Failed"); }
  };
  const handleUpdateRatings = async (cid: string) => {
    if (!confirm("Calculate and finalize ratings for this contest? This will update user profiles.")) return;
    const tId = toast.loading("Calculating ratings...");
    try {
      await ratingsApi.updateContest(cid);
      toast.success("Ratings updated successfully!", { id: tId });
    } catch (e: any) {
      toast.error(e.message || "Failed to update ratings", { id: tId });
    }
  };

  const handleEditContest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingContest) return;
    const tId = toast.loading("Updating contest...");
    try {
      await contestsApi.update(editingContest.id, editingContest);
      setContests(contests.map(c => c.id === editingContest.id ? editingContest : c));
      setEditingContest(null);
      toast.success("Contest updated", { id: tId });
    } catch (e: any) {
      toast.error(e.message || "Failed to update", { id: tId });
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 stagger">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="font-display text-3xl md:text-4xl font-bold flex items-center gap-2">
            <Shield className="h-7 w-7 text-primary" /> Admin Dashboard
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">Manage users, problems, and contests.</p>
        </div>
        <div className="grid grid-cols-2 sm:flex gap-3">
          <Link to="/admin/contests/new" className="inline-flex items-center justify-center gap-2 rounded-md border border-border bg-card px-4 py-2.5 text-xs md:text-sm font-semibold hover:bg-muted transition-all hover-lift">
            <Trophy className="h-3.5 w-3.5 md:h-4 md:w-4" /> New Contest
          </Link>
          <Link to="/admin/problems/new" className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2.5 text-xs md:text-sm font-semibold text-primary-foreground btn-shine hover-lift">
            <Sparkles className="h-3.5 w-3.5 md:h-4 md:w-4" /> New Problem
          </Link>
        </div>
      </div>

      <div className="mt-8 flex gap-1 border-b border-border overflow-x-auto scrollbar-none pb-px">
        {(["overview", "analytics", "users", "problems", "contests"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-5 py-2.5 text-xs md:text-sm font-bold uppercase tracking-widest transition-all border-b-2 -mb-px shrink-0 ${tab === t ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
            {t}
          </button>
        ))}
      </div>

      {tab === "overview" && (
        <div className="mt-6 space-y-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Stat icon={Users} label="users" value={liveStats.users} />
            <Stat icon={Code2} label="problems" value={liveStats.problems} />
            <Stat icon={Activity} label="submissions" value={liveStats.submissions} />
            <Stat icon={Trophy} label="contests" value={liveStats.contests} />
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            <div className="rounded-2xl border border-border bg-card/50 p-6">
               <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-6 flex items-center gap-2">
                 <Activity className="h-4 w-4" /> Submission Activity
               </h3>
               <div className="h-[250px] w-full">
                 <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={analytics?.submissionChart || []}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" strokeOpacity={0.2} vertical={false} />
                      <XAxis 
                        dataKey="date" 
                        stroke="var(--muted-foreground)" 
                        fontSize={10} 
                        tickFormatter={(v) => v.split('-').slice(1).join('/')} 
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis 
                        stroke="var(--muted-foreground)" 
                        fontSize={10} 
                        axisLine={false}
                        tickLine={false}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'var(--card)', 
                          border: '1px solid var(--border)', 
                          borderRadius: '12px',
                          fontSize: '12px',
                          boxShadow: '0 10px 30px -10px rgba(0,0,0,0.5)'
                        }}
                        itemStyle={{ color: 'var(--primary)' }}
                      />
                      <Line type="monotone" dataKey="count" stroke="var(--primary)" strokeWidth={3} dot={{ fill: 'var(--primary)', r: 4 }} activeDot={{ r: 6 }} />
                    </LineChart>
                 </ResponsiveContainer>
               </div>
            </div>

            <div className="rounded-2xl border border-border bg-card/50 p-6">
               <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-6 flex items-center gap-2">
                 <BarChart3 className="h-4 w-4" /> User Growth
               </h3>
               <div className="flex flex-col items-center justify-center h-[250px]">
                 <div className="text-6xl font-black text-primary">+{analytics?.userGrowth || 0}</div>
                 <div className="text-xs font-bold text-muted-foreground uppercase mt-2">New users this week</div>
                 <TrendingUp className="h-8 w-8 text-primary mt-4 animate-bounce" />
               </div>
            </div>
          </div>
        </div>
      )}

      {tab === "analytics" && (
        <div className="mt-6 grid md:grid-cols-2 gap-6">
          <div className="rounded-2xl border border-border bg-card p-6">
             <h3 className="font-bold mb-6">Difficulty Distribution</h3>
             <div className="h-[300px]">
               <ResponsiveContainer width="100%" height="100%">
                 <PieChart>
                   <Pie
                     data={analytics?.difficultyDist || []}
                     innerRadius={60}
                     outerRadius={80}
                     paddingAngle={5}
                     dataKey="value"
                   >
                     {analytics?.difficultyDist?.map((entry: any, index: number) => (
                       <Cell key={`cell-${index}`} fill={entry.name === "EASY" ? "#00cc88" : entry.name === "MEDIUM" ? "#ffaa00" : "#ef4444"} />
                     ))}
                   </Pie>
                    <Tooltip contentStyle={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)', borderRadius: '12px' }} />
                 </PieChart>
               </ResponsiveContainer>
             </div>
             <div className="flex justify-center gap-4 text-xs font-bold mt-4">
               <div className="flex items-center gap-1.5"><div className="h-2 w-2 rounded-full bg-easy" /> EASY</div>
               <div className="flex items-center gap-1.5"><div className="h-2 w-2 rounded-full bg-medium" /> MEDIUM</div>
               <div className="flex items-center gap-1.5"><div className="h-2 w-2 rounded-full bg-hard" /> HARD</div>
             </div>
          </div>
          
          <div className="rounded-2xl border border-border bg-card p-6 flex flex-col justify-center items-center text-center">
            <PieIcon className="h-12 w-12 text-primary/40 mb-4" />
            <h3 className="text-lg font-bold">More Insights Coming</h3>
            <p className="text-sm text-muted-foreground mt-2 max-w-xs">We are currently integrating deeper analytics for contest engagement and language performance.</p>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6 md:col-span-2">
             <h3 className="font-bold mb-6">Popular Problems (By Submissions)</h3>
             <div className="space-y-4">
                {analytics?.popularProblems?.map((p: any, i: number) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-mono text-muted-foreground"># {i+1}</span>
                      <span className="text-sm font-bold">{p.title}</span>
                    </div>
                    <div className="flex items-center gap-4 flex-1 max-w-[200px] ml-4">
                       <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-primary" 
                            style={{ width: `${(p.count / analytics.popularProblems[0].count) * 100}%` }}
                          />
                       </div>
                       <span className="text-[10px] font-mono font-bold text-muted-foreground w-8">{p.count}</span>
                    </div>
                  </div>
                ))}
             </div>
          </div>
        </div>
      )}

      {tab === "users" && (
        <div className="mt-6 overflow-x-auto rounded-xl border border-border bg-card">
          <table className="w-full text-sm">
            <thead className="border-b border-border/60 bg-muted/30 font-mono text-xs uppercase tracking-widest text-muted-foreground">
              <tr><th className="px-4 py-3 text-left">User</th><th className="px-4 py-3 text-left">Email</th><th className="px-4 py-3 text-left">Role</th><th className="px-4 py-3 text-left">Rating</th><th className="px-4 py-3 text-right">Actions</th></tr>
            </thead>
            <tbody>
              {users.length === 0 && <tr><td colSpan={5} className="p-6 text-center text-muted-foreground">No users found.</td></tr>}
              {users.map((u) => (
                <tr key={u.id} className="border-b border-border/40 hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 font-medium">{u.name || u.email.split("@")[0]}</td>
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{u.email}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-0.5 font-mono text-[10px] uppercase ${u.role === "ADMIN" ? "bg-primary/20 text-primary border border-primary/20" : "bg-muted border border-border"}`}>{u.role}</span>
                  </td>
                  <td className="px-4 py-3 font-mono">{u.rating ?? "—"}</td>
                  <td className="px-4 py-3 text-right flex justify-end gap-2">
                    <Button size="sm" variant="outline" onClick={() => setRole(u.id, u.role === "ADMIN" ? "USER" : "ADMIN")} className="h-8 text-[10px] font-bold uppercase">
                      <Crown className="h-3 w-3 mr-1" /> {u.role === "ADMIN" ? "Demote" : "Promote"}
                    </Button>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      className="h-8 text-destructive hover:bg-destructive/10 text-[10px] font-bold uppercase" 
                      onClick={() => {
                        if(confirm("Permanent user deletion? This cannot be undone.")) {
                          adminApi.deleteUser(u.id).then(() => {
                            toast.success("User purged from matrix.");
                            setUsers(users.filter(user => user.id !== u.id));
                          }).catch(() => toast.error("Failed to delete user."));
                        }
                      }}
                    >
                      <Trash2 className="h-3.5 w-3.5 mr-1" /> Delete
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === "problems" && (
        <div className="mt-6 space-y-3">
          {problems.length === 0 && <div className="p-12 text-center border border-dashed border-border rounded-xl text-muted-foreground">No problems yet.</div>}
          {problems.map((p) => (
            <div key={p.id} className="flex flex-col sm:flex-row sm:items-center justify-between rounded-xl border border-border bg-card p-4 md:px-5 md:py-4 hover-glow transition-all gap-4">
              <div className="min-w-0">
                <Link to={`/problems/${p.id}`} className="font-display font-bold hover:text-primary transition-colors text-base md:text-lg block truncate">{p.title}</Link>
                <div className="mt-1 flex flex-wrap items-center gap-2">
                  <span className={`text-[10px] font-bold uppercase tracking-widest ${p.defficulty === "EASY" ? "text-easy" : p.defficulty === "MEDIUM" ? "text-medium" : "text-hard"}`}>{p.defficulty}</span>
                  <span className="text-muted-foreground text-[10px]">·</span>
                  <div className="font-mono text-[10px] text-muted-foreground truncate">{p.tags?.join(", ")}</div>
                </div>
              </div>
              <div className="flex items-center gap-2 self-end sm:self-center">
                <Button size="icon" variant="ghost" className="h-9 w-9 text-destructive hover:bg-destructive/10" onClick={() => deleteProblem(p.id)}><Trash2 className="h-4 w-4" /></Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === "contests" && (
        <div className="mt-6 overflow-hidden rounded-xl border border-border bg-card">
          <div className="flex items-center justify-between border-b border-border/60 p-4 bg-muted/20">
            <span className="font-display font-bold">Contest List</span>
            <Link to="/contests" className="inline-flex items-center gap-1 rounded-md border border-border px-3 py-1.5 text-xs hover:bg-muted transition-colors">
              <Plus className="h-3 w-3" /> Create Contest
            </Link>
          </div>
          {contests.length === 0 && <div className="p-12 text-center text-muted-foreground">No contests scheduled.</div>}
          {contests.map((c) => (
            <div key={c.id} className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-border/40 px-5 py-4 last:border-0 hover:bg-muted/30 transition-colors gap-3">
              <div className="flex flex-col">
                <Link to={`/contests/${c.slug}`} className="font-medium hover:text-primary transition-colors">{c.name}</Link>
                <div className="mt-1 flex items-center gap-2">
                   <span className="font-mono text-[10px] uppercase px-2 py-0.5 rounded border border-border bg-background">{c.status}</span>
                   <span className="text-[10px] text-muted-foreground">{new Date(c.startTime).toLocaleDateString()}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button size="icon" variant="ghost" className="h-8 w-8 text-primary hover:bg-primary/10" onClick={() => setEditingContest(c)}>
                   <Edit2 className="h-3.5 w-3.5" />
                </Button>
                {c.status === "ended" && (
                  <Button size="sm" variant="outline" className="h-8 text-xs bg-primary/5 hover:bg-primary/10 border-primary/20" onClick={() => handleUpdateRatings(c.id)}>
                    <RefreshCw className="h-3 w-3 mr-1" /> Finalize
                  </Button>
                )}
                <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive hover:bg-destructive/10" onClick={() => {/* handle delete contest */}}>
                   <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Contest Modal */}
      {editingContest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">Edit Contest</h2>
              <Button size="icon" variant="ghost" onClick={() => setEditingContest(null)}><X className="h-4 w-4" /></Button>
            </div>
            <form onSubmit={handleEditContest} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Name</label>
                <input 
                  className="w-full rounded-lg border border-border bg-muted/30 px-3 py-2 text-sm outline-none focus:border-primary transition-colors"
                  value={editingContest.name}
                  onChange={e => setEditingContest({...editingContest, name: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Status</label>
                  <select 
                    className="w-full rounded-lg border border-border bg-muted/30 px-3 py-2 text-sm outline-none focus:border-primary transition-colors"
                    value={editingContest.status}
                    onChange={e => setEditingContest({...editingContest, status: e.target.value})}
                  >
                    <option value="upcoming">Upcoming</option>
                    <option value="live">Live</option>
                    <option value="ended">Ended</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Slug</label>
                  <input 
                    className="w-full rounded-lg border border-border bg-muted/30 px-3 py-2 text-sm outline-none focus:border-primary transition-colors"
                    value={editingContest.slug}
                    onChange={e => setEditingContest({...editingContest, slug: e.target.value})}
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Description</label>
                <textarea 
                  className="w-full rounded-lg border border-border bg-muted/30 px-3 py-2 text-sm outline-none focus:border-primary transition-colors min-h-[80px]"
                  value={editingContest.description}
                  onChange={e => setEditingContest({...editingContest, description: e.target.value})}
                />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="ghost" onClick={() => setEditingContest(null)}>Cancel</Button>
                <Button type="submit" className="px-8 font-bold">Save Changes</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function Stat({ icon: Icon, label, value }: { icon: any; label: string; value: number }) {
  return (
    <div className="rounded-xl border border-border bg-card p-6 hover-lift hover-glow transition-all duration-300">
      <div className="flex items-center justify-between">
        <div className="rounded-lg bg-primary/10 p-2 text-primary shadow-[0_0_15px_rgba(var(--primary-rgb),0.2)]">
          <Icon className="h-5 w-5" />
        </div>
      </div>
      <div className="mt-4 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{label}</div>
      <div className="mt-1 font-display text-4xl font-bold tracking-tight">{value}</div>
    </div>
  );
}

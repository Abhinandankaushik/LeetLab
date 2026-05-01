import * as React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/lib/auth-context";
import { adminApi, problemsApi, contestsApi, type User, type Problem } from "@/lib/api";
import { Loader2, Users, Code2, Trophy, Activity, Shield, Sparkles, Plus, Trash2, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function AdminDashboard() {
  const { user, loading } = useAuth();
  const [tab, setTab] = React.useState<"overview" | "users" | "problems" | "contests">("overview");
  const [stats, setStats] = React.useState({ users: 0, problems: 0, submissions: 0, contests: 0 });
  const [users, setUsers] = React.useState<User[]>([]);
  const [problems, setProblems] = React.useState<Problem[]>([]);
  const [contests, setContests] = React.useState<any[]>([]);

  React.useEffect(() => {
    if (!user || user.role !== "ADMIN") return;
    adminApi.stats().then(setStats).catch(() => { });
    adminApi.users().then((r) => setUsers(r.users)).catch(() => { });
    problemsApi.list().then((r: any) => setProblems(r.problems || r.data || [])).catch(() => { });
    contestsApi.all().then((r) => setContests(r.contests || [])).catch(() => { });
  }, [user]);

  if (loading) return <div className="grid min-h-[40vh] place-items-center"><Loader2 className="h-5 w-5 animate-spin" /></div>;
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
        {(["overview", "users", "problems", "contests"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-5 py-2.5 text-xs md:text-sm font-bold uppercase tracking-widest transition-all border-b-2 -mb-px shrink-0 ${tab === t ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
            {t}
          </button>
        ))}
      </div>

      {tab === "overview" && (
        <div className="mt-6 grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Stat icon={Users} label="users" value={liveStats.users} />
          <Stat icon={Code2} label="problems" value={liveStats.problems} />
          <Stat icon={Activity} label="submissions" value={liveStats.submissions} />
          <Stat icon={Trophy} label="contests" value={liveStats.contests} />
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
                    <Button size="sm" variant="outline" onClick={() => setRole(u.id, u.role === "ADMIN" ? "USER" : "ADMIN")} className="h-8">
                      <Crown className="h-3 w-3 mr-1" /> {u.role === "ADMIN" ? "Demote" : "Promote"}
                    </Button>
                    <Button size="sm" variant="ghost" className="h-8 text-destructive hover:bg-destructive/10" onClick={() => ban(u.id)}>Ban</Button>
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
            <div key={c.id} className="flex items-center justify-between border-b border-border/40 px-5 py-4 last:border-0 hover:bg-muted/30 transition-colors">
              <Link to={`/contests/${c.slug}`} className="font-medium hover:text-primary transition-colors">{c.name}</Link>
              <div className="flex items-center gap-4">
                <span className="font-mono text-[10px] uppercase px-2 py-0.5 rounded border border-border bg-background">{c.status}</span>
              </div>
            </div>
          ))}
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

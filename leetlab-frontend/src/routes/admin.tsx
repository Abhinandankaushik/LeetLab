import * as React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/lib/auth-context";
import { adminApi } from "@/lib/api";
import { Shield, Users, Code2, Trophy, BarChart3, Loader2, Plus, TrendingUp, Activity, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function AdminDashboardPage() {
  const { user, loading } = useAuth();
  const [stats, setStats] = React.useState<any>(null);
  const [fetching, setFetching] = React.useState(true);

  React.useEffect(() => {
    if (!user || user.role !== "ADMIN") return;
    adminApi.stats().then(r => { setStats(r); setFetching(false); }).catch(() => setFetching(false));
  }, [user]);

  if (loading || fetching) return <div className="grid min-h-[40vh] place-items-center"><Loader2 className="h-5 w-5 animate-spin text-primary" /></div>;
  if (!user || user.role !== "ADMIN") {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <Shield className="mx-auto h-12 w-12 text-muted-foreground/40" />
        <h1 className="mt-4 font-display text-3xl font-bold">Admin only</h1>
        <p className="mt-2 text-sm text-muted-foreground">You need an ADMIN account to access this area.</p>
      </div>
    );
  }

  const s = stats?.stats || {};

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      {/* Header */}
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            <p className="font-mono text-xs uppercase tracking-widest text-primary">/ admin</p>
          </div>
          <h1 className="mt-2 font-display text-4xl font-bold">Admin Dashboard</h1>
          <p className="mt-2 text-sm text-muted-foreground">Manage platform content, users, and monitor activity.</p>
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <AdminStatCard icon={Users} label="Total Users" value={s.userCount ?? 0} accent="text-accent" href="/admin/users" />
        <AdminStatCard icon={Code2} label="Total Problems" value={s.problemCount ?? 0} accent="text-primary" href="/problems" />
        <AdminStatCard icon={Trophy} label="Total Contests" value={s.contestCount ?? 0} accent="text-medium" href="/contests" />
        <AdminStatCard icon={Activity} label="Submissions" value={s.submissionCount ?? 0} accent="text-easy" href="/submissions" />
      </div>

      {/* Quick actions + Recent users */}
      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        {/* Quick Actions */}
        <div className="rounded-2xl border border-border bg-card p-6">
          <h2 className="font-display text-xl font-bold flex items-center gap-2"><TrendingUp className="h-5 w-5 text-primary" />Quick Actions</h2>
          <div className="mt-4 grid gap-3">
            <QuickAction
              to="/admin/problems/new"
              icon={Plus}
              title="Add New Problem"
              desc="Create a problem with AI auto-fill"
              color="bg-primary/10 text-primary border-primary/20"
            />
            <QuickAction
              to="/admin/contests/new"
              icon={Trophy}
              title="Create Contest"
              desc="Schedule a new contest"
              color="bg-medium/10 text-medium border-medium/20"
            />
            <QuickAction
              to="/admin/users"
              icon={Users}
              title="Manage Users"
              desc="View and manage user accounts"
              color="bg-accent/10 text-accent border-accent/20"
            />
            <QuickAction
              to="/problems"
              icon={Code2}
              title="Manage Problems"
              desc="Edit, delete, or review problems"
              color="bg-easy/10 text-easy border-easy/20"
            />
          </div>
        </div>

        {/* Recent Users */}
        <div className="rounded-2xl border border-border bg-card p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-xl font-bold flex items-center gap-2"><Users className="h-5 w-5 text-accent" />Recent Users</h2>
            <Button asChild variant="ghost" size="sm">
              <Link to="/admin/users">View all <ArrowRight className="h-3 w-3 ml-1" /></Link>
            </Button>
          </div>
          <div className="mt-4 space-y-2">
            {(stats?.recentUsers || []).map((u: any) => (
              <div key={u.id} className="flex items-center gap-3 rounded-lg border border-border/60 px-3 py-2">
                <div className="grid h-8 w-8 flex-shrink-0 place-items-center rounded-full bg-primary/15 text-xs font-bold text-primary">
                  {(u.name || u.email).slice(0, 2).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <div className="truncate text-sm font-medium">{u.name || u.email.split("@")[0]}</div>
                  <div className="truncate font-mono text-[10px] text-muted-foreground">{u.email}</div>
                </div>
                <span className={`ml-auto flex-shrink-0 rounded-full px-2 py-0.5 font-mono text-[9px] font-bold ${u.role === "ADMIN" ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground"}`}>
                  {u.role}
                </span>
              </div>
            ))}
            {(!stats?.recentUsers || stats.recentUsers.length === 0) && (
              <p className="py-4 text-center text-sm text-muted-foreground">No users yet.</p>
            )}
          </div>
        </div>
      </div>

      {/* Nav cards */}
      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <NavCard to="/admin/users" icon={Users} title="User Management" desc="View all users, toggle roles, delete accounts" />
        <NavCard to="/problems" icon={Code2} title="Problem Management" desc="List, edit and remove problems" />
        <NavCard to="/admin/problems/new" icon={BarChart3} title="Add Problem (AI)" desc="Use AI to auto-fill problem fields" />
      </div>
    </div>
  );
}

function AdminStatCard({ icon: Icon, label, value, accent, href }: { icon: any; label: string; value: number; accent: string; href: string }) {
  return (
    <Link to={href} className="group relative overflow-hidden rounded-xl border border-border bg-card p-5 transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-lg">
      <div className="absolute -right-4 -top-4 h-16 w-16 rounded-full bg-primary/5 blur-2xl transition-all group-hover:bg-primary/10" />
      <Icon className={`h-5 w-5 ${accent}`} />
      <div className="mt-3 font-mono text-xs uppercase tracking-widest text-muted-foreground">{label}</div>
      <div className={`mt-1 font-display text-3xl font-bold ${accent}`}>{value.toLocaleString()}</div>
      <ArrowRight className="mt-2 h-4 w-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
    </Link>
  );
}

function QuickAction({ to, icon: Icon, title, desc, color }: { to: string; icon: any; title: string; desc: string; color: string }) {
  return (
    <Link to={to} className={`flex items-center gap-3 rounded-xl border ${color} px-4 py-3 transition-all hover:scale-[1.01] hover:shadow-sm`}>
      <div className={`grid h-9 w-9 place-items-center rounded-lg ${color}`}>
        <Icon className="h-4 w-4" />
      </div>
      <div>
        <div className="text-sm font-semibold">{title}</div>
        <div className="text-xs text-muted-foreground">{desc}</div>
      </div>
      <ArrowRight className="ml-auto h-4 w-4 opacity-50" />
    </Link>
  );
}

function NavCard({ to, icon: Icon, title, desc }: { to: string; icon: any; title: string; desc: string }) {
  return (
    <Link to={to} className="group flex flex-col gap-3 rounded-xl border border-border bg-card p-5 transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-lg">
      <Icon className="h-6 w-6 text-primary" />
      <div>
        <div className="font-display font-semibold">{title}</div>
        <div className="mt-1 text-xs text-muted-foreground">{desc}</div>
      </div>
      <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
    </Link>
  );
}

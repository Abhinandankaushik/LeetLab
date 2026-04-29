import * as React from "react";
import { useAuth } from "@/lib/auth-context";
import { adminApi } from "@/lib/api";
import { Shield, Loader2, Search, Trash2, RefreshCw, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export function AdminUsersPage() {
  const { user, loading } = useAuth();
  const [users, setUsers] = React.useState<any[]>([]);
  const [fetching, setFetching] = React.useState(true);
  const [q, setQ] = React.useState("");
  const [actionId, setActionId] = React.useState<string | null>(null);

  const fetchUsers = React.useCallback(() => {
    setFetching(true);
    adminApi.allUsers().then(r => { setUsers(r.users || []); setFetching(false); }).catch(() => setFetching(false));
  }, []);

  React.useEffect(() => {
    if (user?.role === "ADMIN") fetchUsers();
  }, [user, fetchUsers]);

  if (loading) return <div className="grid min-h-[40vh] place-items-center"><Loader2 className="h-5 w-5 animate-spin text-primary" /></div>;
  if (!user || user.role !== "ADMIN") {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <Shield className="mx-auto h-12 w-12 text-muted-foreground/40" />
        <h1 className="mt-4 font-display text-3xl font-bold">Admin only</h1>
      </div>
    );
  }

  const filtered = users.filter(u =>
    u.name?.toLowerCase().includes(q.toLowerCase()) ||
    u.email?.toLowerCase().includes(q.toLowerCase())
  );

  const handleToggleRole = async (userId: string) => {
    setActionId(userId);
    try {
      await adminApi.toggleRole(userId);
      toast.success("Role updated");
      fetchUsers();
    } catch (e: any) {
      toast.error(e.message || "Failed to update role");
    } finally {
      setActionId(null);
    }
  };

  const handleDelete = async (userId: string, name: string) => {
    if (!confirm(`Delete user "${name}"? This cannot be undone.`)) return;
    setActionId(userId);
    try {
      await adminApi.deleteUser(userId);
      toast.success("User deleted");
      setUsers(prev => prev.filter(u => u.id !== userId));
    } catch (e: any) {
      toast.error(e.message || "Failed to delete user");
    } finally {
      setActionId(null);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="font-mono text-xs uppercase tracking-widest text-primary">/ admin / users</p>
          <h1 className="mt-1 font-display text-3xl font-bold">User Management</h1>
          <p className="mt-1 text-sm text-muted-foreground">{users.length} total users</p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchUsers} className="gap-1.5">
          <RefreshCw className="h-3.5 w-3.5" />Refresh
        </Button>
      </div>

      <div className="mb-4 flex gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search users..." value={q} onChange={e => setQ(e.target.value)} className="pl-9" />
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-card">
        {/* Header */}
        <div className="hidden grid-cols-[1fr_1fr_80px_100px_80px_80px] gap-4 border-b border-border bg-muted/30 px-4 py-3 font-mono text-xs uppercase tracking-wider text-muted-foreground sm:grid">
          <span>Name</span>
          <span>Email</span>
          <span>Role</span>
          <span>Solved</span>
          <span>Submissions</span>
          <span className="text-right">Actions</span>
        </div>

        {fetching && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
          </div>
        )}

        {!fetching && filtered.length === 0 && (
          <div className="py-12 text-center text-sm text-muted-foreground">No users found.</div>
        )}

        {!fetching && filtered.map((u, i) => (
          <div
            key={u.id}
            className="grid grid-cols-[1fr_auto] items-center gap-4 border-b border-border/60 px-4 py-3 last:border-0 transition-colors hover:bg-muted/30 sm:grid-cols-[1fr_1fr_80px_100px_80px_80px]"
          >
            {/* Avatar + Name */}
            <div className="flex items-center gap-2 min-w-0">
              <div className="grid h-8 w-8 flex-shrink-0 place-items-center rounded-full bg-gradient-primary text-[11px] font-bold text-primary-foreground">
                {(u.name || u.email).slice(0, 2).toUpperCase()}
              </div>
              <span className="truncate font-medium">{u.name || "—"}</span>
            </div>
            <span className="hidden truncate font-mono text-xs text-muted-foreground sm:block">{u.email}</span>
            <span className={`hidden font-mono text-[11px] font-bold sm:block ${u.role === "ADMIN" ? "text-primary" : "text-muted-foreground"}`}>
              {u.role === "ADMIN" && <Star className="mr-1 inline h-3 w-3" />}{u.role}
            </span>
            <span className="hidden font-mono text-sm sm:block">{u._count?.ProblemSolved ?? 0}</span>
            <span className="hidden font-mono text-sm sm:block">{u._count?.Submission ?? 0}</span>

            {/* Actions */}
            <div className="flex items-center justify-end gap-1.5">
              <Button
                size="sm" variant="outline"
                onClick={() => handleToggleRole(u.id)}
                disabled={actionId === u.id || u.id === user.id}
                className="h-7 px-2 font-mono text-[10px]"
              >
                {actionId === u.id ? <Loader2 className="h-3 w-3 animate-spin" /> : u.role === "ADMIN" ? "→ USER" : "→ ADMIN"}
              </Button>
              {u.id !== user.id && (
                <Button
                  size="sm" variant="ghost"
                  onClick={() => handleDelete(u.id, u.name || u.email)}
                  disabled={actionId === u.id}
                  className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

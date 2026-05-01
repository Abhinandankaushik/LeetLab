import * as React from "react";
import { Link } from "react-router-dom";
import { submissionsApi, type Submission } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";


export default function SubmissionsPage() {
  const { user, loading: authLoading } = useAuth();
  const [subs, setSubs] = React.useState<Submission[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (authLoading) return;
    if (!user) { setLoading(false); return; }
    submissionsApi.all()
      .then((res: any) => setSubs(res.submissions || res.data || []))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [user, authLoading]);

  if (!user && !authLoading) {
    return <Gate />;
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <p className="font-mono text-xs uppercase tracking-widest text-primary">/ submissions</p>
      <h1 className="mt-2 font-display text-4xl font-bold">Your run history</h1>

      <div className="mt-8 overflow-hidden rounded-xl border border-border bg-card">
        {loading && <div className="grid place-items-center p-10 text-muted-foreground"><Loader2 className="h-5 w-5 animate-spin" /></div>}
        {error && <div className="p-10 text-center text-sm text-destructive">{error}</div>}
        {!loading && !error && subs.length === 0 && <div className="p-10 text-center text-sm text-muted-foreground">No submissions yet — go solve something.</div>}
        {subs.map((s) => {
          const ok = s.status?.toLowerCase().includes("accept");
          return (
            <Link
              key={s.id}
              to={`/problems/${s.problemId}`}
              className="grid grid-cols-[24px_1fr_120px_120px_140px] items-center gap-4 border-b border-border/60 px-4 py-3 text-sm last:border-0 hover:bg-muted/40"
            >
              {ok ? <CheckCircle2 className="h-4 w-4 text-easy" /> : <XCircle className="h-4 w-4 text-hard" />}
              <span className={ok ? "text-easy" : "text-hard"}>{s.status}</span>
              <span className="font-mono text-xs text-muted-foreground">{s.language}</span>
              <span className="font-mono text-xs text-muted-foreground">{s.time || "-"} {s.memory || ""}</span>
              <span className="font-mono text-xs text-muted-foreground">{new Date(s.createdAt).toLocaleString()}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

function Gate() {
  return (
    <div className="mx-auto max-w-md px-4 py-20 text-center">
      <h1 className="font-display text-3xl font-bold">Sign in required</h1>
      <p className="mt-2 text-sm text-muted-foreground">Sign in to see your submission history.</p>
      <Link to="/login" className="mt-6 inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">Sign in</Link>
    </div>
  );
}

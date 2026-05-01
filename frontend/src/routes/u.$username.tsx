import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { usersApi } from "@/lib/api";
import { Trophy, Flame, Award, MapPin, Globe } from "lucide-react";
import { ListSkeleton, EmptyState } from "@/components/empty-state";


export default function PublicProfile() {
  const { username } = useParams();
  const { data, isLoading } = useQuery({
    queryKey: ["user", username],
    queryFn: () => usersApi.byUsername(username!)
  });

  if (isLoading) return <div className="mx-auto max-w-4xl px-4 py-10"><ListSkeleton rows={4} /></div>;

  const user = data?.user;
  if (!user) return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <EmptyState
        icon={Trophy}
        title={`@${username} not found`}
        description="This user doesn't exist or the public profile endpoint isn't enabled on the backend yet."
      />
    </div>
  );

  const badges = data?.badges ?? [];

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <div className="overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-card via-card to-primary/5 p-8">
        <div className="flex flex-wrap items-start gap-6">
          <div className="grid h-24 w-24 place-items-center rounded-2xl bg-gradient-primary text-3xl font-bold uppercase text-primary-foreground glow-primary">
            {(user.name || username!).slice(0, 2)}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="font-display text-3xl font-bold">{user.name || username!}</h1>
            <p className="mt-1 font-mono text-xs text-muted-foreground">@{username}</p>
            {user.bio && <p className="mt-3 max-w-2xl text-sm text-foreground/80">{user.bio}</p>}
            <div className="mt-3 flex flex-wrap gap-3 text-xs text-muted-foreground">
              {user.country && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {user.country}</span>}
              {(user as any).website && <span className="flex items-center gap-1"><Globe className="h-3 w-3" /> {(user as any).website}</span>}
            </div>
          </div>
          <div className="flex gap-3">
            <BigStat icon={Trophy} label="rating" value={user.rating ?? 1200} accent />
            <BigStat icon={Flame} label="streak" value={user.currentStreak ?? 0} />
          </div>
        </div>
      </div>

      <h2 className="mt-10 font-display text-2xl font-bold">Badges</h2>
      {badges.length === 0 ? (
        <p className="mt-3 text-sm text-muted-foreground">No badges earned yet.</p>
      ) : (
        <div className="mt-4 grid gap-3 sm:grid-cols-2 md:grid-cols-3">
          {badges.map((b) => (
            <div key={b.id} className="flex items-center gap-3 rounded-xl border border-border bg-card p-4">
              <div className="grid h-12 w-12 place-items-center rounded-xl bg-primary/15 text-2xl">{b.icon}</div>
              <div>
                <div className="font-display font-semibold">{b.name}</div>
                <div className="text-xs text-muted-foreground">{b.description}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      <p className="mt-10 text-xs text-muted-foreground">
        <Link to="/leaderboard" className="text-primary hover:underline">← Back to leaderboard</Link>
      </p>
    </div>
  );
}

function BigStat({ icon: Icon, label, value, accent }: { icon: any; label: string; value: number; accent?: boolean }) {
  return (
    <div className="rounded-xl border border-border bg-background/40 p-4 text-center">
      <Icon className={`h-4 w-4 mx-auto ${accent ? "text-primary" : "text-medium"}`} />
      <div className="mt-1 text-[10px] uppercase tracking-widest text-muted-foreground">{label}</div>
      <div className={`mt-1 font-mono text-xl font-bold ${accent ? "text-primary" : "text-foreground"}`}>{value}</div>
    </div>
  );
}

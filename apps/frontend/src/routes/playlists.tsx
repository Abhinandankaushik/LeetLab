import * as React from "react";
import { Link } from "react-router-dom";
import { playlistsApi, type Playlist } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Loader2, Trash2, FolderOpen, ArrowRight, PlayCircle } from "lucide-react";
import { toast } from "sonner";
import { CreatePlaylistDialog } from "@/components/PlaylistDialogs";
import { EmptyState } from "@/components/empty-state";

export default function PlaylistsPage() {
  const { user, loading: authLoading } = useAuth();
  const [playlists, setPlaylists] = React.useState<Playlist[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [isCreateOpen, setIsCreateOpen] = React.useState(false);

  const refresh = React.useCallback(async () => {
    try {
      setLoading(true);
      const res = await playlistsApi.all();
      setPlaylists(res.playlists);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    if (authLoading) return;
    if (!user) { setLoading(false); return; }
    refresh();
  }, [user, authLoading, refresh]);

  const remove = async (id: string) => {
    if (!confirm("Are you sure you want to delete this playlist? This action cannot be undone.")) return;
    try {
      await playlistsApi.remove(id);
      toast.success("Playlist deleted");
      refresh();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete playlist");
    }
  };

  if (!user && !authLoading) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center animate-fade-in">
        <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-primary/10 grid place-items-center text-primary">
          <FolderOpen className="h-6 w-6" />
        </div>
        <h1 className="font-display text-3xl font-bold">Sign in required</h1>
        <p className="mt-2 text-sm text-muted-foreground">Log in to your account to view and manage your curated problem tracks.</p>
        <Button asChild className="mt-8 px-8 glow-primary">
          <Link to="/login">Sign in <ArrowRight className="ml-2 h-4 w-4" /></Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 animate-fade-in">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-mono text-xs uppercase tracking-widest text-primary">/ collection</p>
          <h1 className="mt-2 font-display text-2xl sm:text-3xl md:text-4xl font-bold">Your tracks</h1>
          <p className="mt-1 text-sm text-muted-foreground">Master specific domains with curated problem sets.</p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)} className="btn-shine glow-primary">
          <PlayCircle className="mr-2 h-4 w-4" /> New Track
        </Button>
      </div>

      <div className="mt-10">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-48 rounded-2xl skeleton-shimmer" />
            ))}
          </div>
        ) : playlists.length === 0 ? (
          <EmptyState 
            icon={FolderOpen} 
            title="No tracks found" 
            description="You haven't created any playlists yet. Start by grouping problems for focused practice."
            action={<Button variant="outline" onClick={() => setIsCreateOpen(true)}>Create your first track</Button>}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 stagger">
            {playlists.map((p) => (
              <div 
                key={p.id} 
                className="group relative overflow-hidden rounded-2xl border border-border bg-card/40 p-6 backdrop-blur-sm transition-all hover:bg-card/80 hover:border-primary/50 hover:shadow-2xl hover-lift"
              >
                <div className="flex items-start justify-between">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 grid place-items-center text-primary group-hover:scale-110 group-hover:rotate-3 transition-transform">
                    <FolderOpen className="h-5 w-5" />
                  </div>
                  <button 
                    onClick={() => remove(p.id)} 
                    className="p-2 text-muted-foreground opacity-60 transition-all hover:text-destructive hover:bg-destructive/10 rounded-md sm:opacity-0 sm:group-hover:opacity-100"
                    title="Delete track"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                
                <h3 className="mt-5 font-display text-xl font-bold group-hover:text-primary transition-colors">{p.name}</h3>
                <p className="mt-2 text-sm text-muted-foreground line-clamp-2 min-h-[40px]">{p.description || "No description provided."}</p>
                
                <div className="mt-6 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs bg-muted px-2 py-1 rounded border border-border">
                      {(p.problems?.length ?? 0)} problems
                    </span>
                  </div>
                  <Button variant="ghost" size="sm" asChild className="group/btn">
                    <Link to={`/playlists/${p.id}`} className="text-xs font-bold uppercase tracking-widest flex items-center gap-1">
                      Explore <ArrowRight className="h-3 w-3 transition-transform group-hover/btn:translate-x-1" />
                    </Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <CreatePlaylistDialog 
        open={isCreateOpen} 
        onOpenChange={setIsCreateOpen} 
        onSuccess={refresh}
      />
    </div>
  );
}

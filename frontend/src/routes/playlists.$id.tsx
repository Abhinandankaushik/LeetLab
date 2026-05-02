import * as React from "react";
import { useParams, Link } from "react-router-dom";
import { playlistsApi, type Playlist } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { 
  Loader2, ArrowLeft, BookOpen, Clock, BarChart2, 
  Play, MoreVertical, Trash2, CheckCircle2, Lock 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { EmptyState } from "@/components/empty-state";

export default function PlaylistDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user, loading: authLoading } = useAuth();
  const [playlist, setPlaylist] = React.useState<Playlist | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const fetchPlaylist = React.useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      const res = await playlistsApi.get(id);
      setPlaylist(res.playlist);
    } catch (err: any) {
      setError(err.message || "Failed to load playlist");
    } finally {
      setLoading(false);
    }
  }, [id]);

  React.useEffect(() => {
    if (authLoading) return;
    if (!user) { setLoading(false); return; }
    fetchPlaylist();
  }, [user, authLoading, fetchPlaylist]);

  const removeProblem = async (problemId: string) => {
    if (!id) return;
    try {
      await playlistsApi.removeProblem(id, [problemId]);
      toast.success("Problem removed from track");
      fetchPlaylist();
    } catch (err: any) {
      toast.error(err.message || "Failed to remove problem");
    }
  };

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin text-primary opacity-40 mx-auto" />
          <p className="mt-4 text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground">Initializing track data...</p>
        </div>
      </div>
    );
  }

  if (error || !playlist) {
    return (
      <div className="mx-auto max-w-md px-4 py-32 text-center stagger">
        <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-hard/10 text-hard border border-hard/20">
          <Lock className="h-8 w-8" />
        </div>
        <h1 className="font-display text-4xl font-black tracking-tight">Access Denied</h1>
        <p className="mt-4 text-muted-foreground text-sm">{error || "This track doesn't exist or you don't have permission to view it."}</p>
        <Button asChild className="mt-10 rounded-xl" variant="outline">
          <Link to="/playlists">Back to Collections</Link>
        </Button>
      </div>
    );
  }

  const problems = playlist.problems || [];

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 stagger min-h-screen">
      {/* Navigation Header */}
      <div className="mb-10 flex items-center justify-between">
        <Button variant="ghost" size="sm" asChild className="rounded-full gap-2 text-muted-foreground hover:text-foreground">
          <Link to="/playlists"><ArrowLeft className="h-4 w-4" /> Back to Library</Link>
        </Button>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="font-mono text-[10px] uppercase tracking-widest bg-muted/50 border-border/40">
            {problems.length} Problems
          </Badge>
          <Badge variant="outline" className="font-mono text-[10px] uppercase tracking-widest bg-primary/10 text-primary border-primary/20">
            Personal Track
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-12">
        {/* Left Side: Problem List */}
        <div className="space-y-8">
          <div className="space-y-4">
            <h1 className="font-display text-5xl font-black tracking-tighter text-foreground leading-none">
              {playlist.name}
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl leading-relaxed">
              {playlist.description || "A curated selection of challenges to master your craft."}
            </p>
          </div>

          <div className="mt-12 space-y-4">
            <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2 border-b border-border/40 pb-4 mb-6">
              <BookOpen className="h-3 w-3" /> Curriculum Contents
            </h3>

            {problems.length === 0 ? (
              <EmptyState 
                icon={Play}
                title="This track is empty"
                description="Add problems from the workspace to build your curriculum and start mastering new skills."
                action={<Button asChild variant="outline" className="rounded-full px-8"><Link to="/problems">Explore Problems</Link></Button>}
                className="py-20"
              />
            ) : (
              <div className="grid gap-3">
                {problems.map(({ problem }, idx) => (
                  <div 
                    key={problem.id}
                    className="group relative flex items-center justify-between p-4 md:p-5 rounded-2xl border border-border bg-card hover:border-primary/40 hover:shadow-xl hover:shadow-primary/5 transition-all cursor-default"
                  >
                    <div className="flex items-center gap-5 min-w-0">
                      <div className="font-mono text-xs text-muted-foreground/40 w-6 font-bold group-hover:text-primary/40 transition-colors">
                        {(idx + 1).toString().padStart(2, '0')}
                      </div>
                      <div className="min-w-0">
                        <Link 
                          to={`/problems/${problem.id}`}
                          className="font-display font-bold text-lg md:text-xl truncate tracking-tight hover:text-primary transition-colors block"
                        >
                          {problem.title}
                        </Link>
                        <div className="flex items-center gap-3 mt-1.5">
                          <DifficultyBadge difficulty={problem.defficulty} />
                          <span className="text-muted-foreground/30 text-xs">•</span>
                          <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">
                            {Array.isArray(problem.tags) ? problem.tags[0] : (problem.tags as any)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <Button variant="ghost" size="icon" asChild className="h-10 w-10 rounded-xl hover:bg-primary/10 hover:text-primary group-hover:scale-105 transition-all">
                        <Link to={`/problems/${problem.id}`} title="Solve Problem">
                          <Play className="h-4 w-4 fill-current" />
                        </Link>
                      </Button>
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl opacity-40 hover:opacity-100">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="rounded-xl border-border bg-card/95 backdrop-blur-md">
                          <DropdownMenuItem 
                            className="text-hard focus:text-hard focus:bg-hard/10 font-bold text-xs gap-2 cursor-pointer"
                            onClick={() => removeProblem(problem.id)}
                          >
                            <Trash2 className="h-3.5 w-3.5" /> Remove from Track
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Stats & Info */}
        <div className="space-y-6">
          <div className="rounded-3xl border border-border bg-card/40 p-6 backdrop-blur-sm space-y-6">
            <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Track Statistics</h4>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-2xl bg-muted/30 border border-border/40">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-primary/10 text-primary">
                    <CheckCircle2 className="h-4 w-4" />
                  </div>
                  <span className="text-sm font-medium">Completion</span>
                </div>
                <span className="font-mono text-sm font-bold">0%</span>
              </div>

              <div className="flex items-center justify-between p-4 rounded-2xl bg-muted/30 border border-border/40">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-orange-500/10 text-orange-500">
                    <BarChart2 className="h-4 w-4" />
                  </div>
                  <span className="text-sm font-medium">Difficulty Avg</span>
                </div>
                <span className="font-mono text-sm font-bold text-orange-500">Medium</span>
              </div>

              <div className="flex items-center justify-between p-4 rounded-2xl bg-muted/30 border border-border/40">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-blue-500/10 text-blue-500">
                    <Clock className="h-4 w-4" />
                  </div>
                  <span className="text-sm font-medium">Est. Time</span>
                </div>
                <span className="font-mono text-sm font-bold text-blue-500">{problems.length * 45}m</span>
              </div>
            </div>

            <Button asChild className="w-full h-12 rounded-2xl font-bold gap-2 shadow-xl shadow-primary/20" disabled={problems.length === 0}>
              <Link to="/problems">
                <Play className="h-4 w-4 fill-current" /> Start Solving
              </Link>
            </Button>
          </div>

          <div className="p-6 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground opacity-60">About Tracks</h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Tracks are your personal curriculum. Use them to group problems by category, difficulty, or interview prep focus.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function DifficultyBadge({ difficulty }: { difficulty: string }) {
  const normalized = difficulty.toLowerCase();
  return (
    <span className={cn(
      "text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border",
      normalized === "easy" ? "text-easy border-easy/30 bg-easy/5" :
      normalized === "medium" ? "text-medium border-medium/30 bg-medium/5" :
      "text-hard border-hard/30 bg-hard/5"
    )}>
      {difficulty}
    </span>
  );
}

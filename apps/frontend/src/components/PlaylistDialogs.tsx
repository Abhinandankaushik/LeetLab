import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { playlistsApi, Playlist } from "@/lib/api";
import { toast } from "sonner";
import { Loader2, Plus, Bookmark, ListPlus, FolderPlus } from "lucide-react";

interface CreatePlaylistDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (playlist: Playlist) => void;
}

export function CreatePlaylistDialog({ open, onOpenChange, onSuccess }: CreatePlaylistDialogProps) {
  const [name, setName] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;
    try {
      setIsLoading(true);
      const res = await playlistsApi.create({ name, description });
      toast.success("Playlist created");
      onSuccess?.(res.playlist);
      onOpenChange(false);
      setName("");
      setDescription("");
    } catch (error: any) {
      toast.error(error.message || "Failed to create playlist");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FolderPlus className="h-5 w-5 text-primary" /> Create Playlist
          </DialogTitle>
          <DialogDescription>
            Group related problems together for structured practice.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Name</label>
            <Input 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              placeholder="e.g. Dynamic Programming Basics" 
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Description (Optional)</label>
            <Textarea 
              value={description} 
              onChange={(e) => setDescription(e.target.value)} 
              placeholder="What is this collection about?" 
            />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
              Create Playlist
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

interface AddToPlaylistDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  problemId: string | null;
}

export function AddToPlaylistDialog({ open, onOpenChange, problemId }: AddToPlaylistDialogProps) {
  const [playlists, setPlaylists] = React.useState<Playlist[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isAdding, setIsAdding] = React.useState<string | null>(null);
  const [isCreateOpen, setIsCreateOpen] = React.useState(false);

  const fetchPlaylists = React.useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await playlistsApi.all();
      setPlaylists(res.playlists);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    if (open) fetchPlaylists();
  }, [open, fetchPlaylists]);

  const handleAdd = async (playlistId: string) => {
    if (!problemId) return;
    try {
      setIsAdding(playlistId);
      await playlistsApi.addProblem(playlistId, [problemId]);
      toast.success("Added to playlist");
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.message || "Failed to add problem");
    } finally {
      setIsAdding(null);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Bookmark className="h-5 w-5 text-primary" /> Add to Playlist
            </DialogTitle>
            <DialogDescription>
              Select a collection to save this problem.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-2 max-h-[300px] overflow-y-auto py-4">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-8 gap-2">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-xs text-muted-foreground">Loading your playlists...</p>
              </div>
            ) : playlists.length === 0 ? (
              <div className="text-center py-8 space-y-4">
                <p className="text-sm text-muted-foreground">You don't have any playlists yet.</p>
                <Button variant="outline" size="sm" onClick={() => setIsCreateOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" /> Create First Playlist
                </Button>
              </div>
            ) : (
              <div className="grid gap-2">
                {playlists.map((pl) => (
                  <button
                    key={pl.id}
                    onClick={() => handleAdd(pl.id)}
                    disabled={!!isAdding}
                    className="flex items-center justify-between p-3 rounded-lg border border-border bg-card hover:bg-accent hover:border-primary/50 transition-all text-left"
                  >
                    <div>
                      <p className="font-medium text-sm">{pl.name}</p>
                      <p className="text-xs text-muted-foreground">{pl.problems?.length || 0} problems</p>
                    </div>
                    {isAdding === pl.id ? (
                      <Loader2 className="h-4 w-4 animate-spin text-primary" />
                    ) : (
                      <ListPlus className="h-4 w-4 text-muted-foreground" />
                    )}
                  </button>
                ))}
                <Button variant="ghost" size="sm" className="mt-2 w-full" onClick={() => setIsCreateOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" /> Create New Playlist
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <CreatePlaylistDialog 
        open={isCreateOpen} 
        onOpenChange={setIsCreateOpen} 
        onSuccess={(newPlaylist) => {
          setPlaylists(prev => [newPlaylist, ...prev]);
          handleAdd(newPlaylist.id);
        }}
      />
    </>
  );
}

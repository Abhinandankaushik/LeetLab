import * as React from "react";
import * as ReactDOM from "react-dom";
import { usePlaylistStore } from "@/stores/playlist.store";
import { useAuth } from "@/lib/auth-context";
import { BookmarkPlus, Plus, Check, Loader2, FolderOpen, X, ListPlus } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface AddToPlaylistButtonProps {
  problemId: string;
  problemTitle?: string;
  compact?: boolean;
}

export function AddToPlaylistButton({ problemId, problemTitle, compact = false }: AddToPlaylistButtonProps) {
  const { user } = useAuth();
  const { playlists, loading, fetch, create, addProblem } = usePlaylistStore();

  const [open, setOpen] = React.useState(false);
  const [adding, setAdding] = React.useState<string | null>(null);
  const [added, setAdded] = React.useState<Set<string>>(new Set());

  // Create form state
  const [createMode, setCreateMode] = React.useState(false);
  const [newName, setNewName] = React.useState("");
  const [newDesc, setNewDesc] = React.useState("");
  const [creating, setCreating] = React.useState(false);

  // Portal positioning
  const triggerRef = React.useRef<HTMLButtonElement>(null);
  const panelRef = React.useRef<HTMLDivElement>(null);
  const [pos, setPos] = React.useState<{ top?: number; bottom?: number; left: number; width: number }>({ top: 0, left: 0, width: 280 });

  // Fetch playlists when opened
  React.useEffect(() => {
    if (open && user) fetch();
  }, [open, user, fetch]);

  // Position the floating panel relative to the trigger button
  const updatePosition = React.useCallback(() => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const panelWidth = 280;
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    let left = rect.right - panelWidth;
    if (left < 8) left = 8;
    if (left + panelWidth > viewportWidth - 8) left = viewportWidth - panelWidth - 8;

    const spaceBelow = viewportHeight - rect.bottom;
    const spaceAbove = rect.top;
    const estimatedMaxHeight = 380; // Estimated height of full popup

    if (spaceBelow < estimatedMaxHeight && spaceAbove > spaceBelow) {
      // Place it above the button
      setPos({
        bottom: viewportHeight - rect.top + 6,
        top: undefined,
        left,
        width: panelWidth,
      });
    } else {
      // Place it below the button
      setPos({
        top: rect.bottom + 6,
        bottom: undefined,
        left,
        width: panelWidth,
      });
    }
  }, []);

  React.useEffect(() => {
    if (!open) return;
    updatePosition();
    window.addEventListener("scroll", updatePosition, true);
    window.addEventListener("resize", updatePosition);
    return () => {
      window.removeEventListener("scroll", updatePosition, true);
      window.removeEventListener("resize", updatePosition);
    };
  }, [open, updatePosition]);

  // Close on outside click
  React.useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        triggerRef.current && !triggerRef.current.contains(target) &&
        panelRef.current && !panelRef.current.contains(target)
      ) {
        setOpen(false);
        setCreateMode(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  if (!user) return null;

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    updatePosition();
    setOpen((v) => !v);
    if (!open) setCreateMode(false);
  };

  const handleAdd = async (playlistId: string) => {
    if (added.has(playlistId)) return;
    setAdding(playlistId);
    try {
      await addProblem(playlistId, [problemId]);
      setAdded((prev) => new Set([...prev, playlistId]));
      toast.success("Added to playlist!");
    } catch (e: any) {
      toast.error(e.message || "Failed to add");
    } finally {
      setAdding(null);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    setCreating(true);
    try {
      const playlist = await create({
        name: newName.trim(),
        description: newDesc.trim() || undefined,
      });
      toast.success(`Playlist "${newName}" created!`);
      setNewName("");
      setNewDesc("");
      setCreateMode(false);
      if (playlist?.id) {
        await handleAdd(playlist.id);
      }
    } catch (e: any) {
      toast.error(e.message || "Failed to create playlist");
    } finally {
      setCreating(false);
    }
  };

  const panel = open ? (
    <div
      ref={panelRef}
      style={{
        position: "fixed",
        top: pos.top !== undefined ? `${pos.top}px` : "auto",
        bottom: pos.bottom !== undefined ? `${pos.bottom}px` : "auto",
        left: `${pos.left}px`,
        width: `${pos.width}px`,
        zIndex: 9999,
        animation: pos.bottom !== undefined ? "slideUp 0.15s ease-out" : "slideDown 0.15s ease-out",
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="overflow-hidden rounded-xl border border-border/80 bg-popover shadow-2xl shadow-black/40" style={{ backdropFilter: "blur(20px)" }}>
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border/60 px-3 py-2.5">
          <div>
            <span className="font-mono text-xs font-bold text-foreground">Add to Playlist</span>
            {problemTitle && (
              <div className="mt-0.5 max-w-[200px] truncate font-mono text-[10px] text-muted-foreground">{problemTitle}</div>
            )}
          </div>
          <button
            onClick={() => { setOpen(false); setCreateMode(false); }}
            className="rounded p-0.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Playlists list */}
        <div className="max-h-48 overflow-y-auto">
          {loading && (
            <div className="flex items-center justify-center py-5">
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
            </div>
          )}
          {!loading && playlists.length === 0 && !createMode && (
            <div className="px-3 py-4 text-center text-xs text-muted-foreground">
              No playlists yet — create one below!
            </div>
          )}
          {!loading && playlists.map((p) => {
            const isAdded = added.has(p.id);
            const isAdding = adding === p.id;
            return (
              <button
                key={p.id}
                onClick={() => handleAdd(p.id)}
                disabled={isAdded || isAdding}
                className={cn(
                  "flex w-full items-center gap-2.5 px-3 py-2.5 text-left text-sm transition-all",
                  isAdded ? "opacity-60 cursor-default" : "hover:bg-muted/60 cursor-pointer"
                )}
              >
                <FolderOpen className={cn("h-3.5 w-3.5 flex-shrink-0", isAdded ? "text-easy" : "text-muted-foreground")} />
                <div className="min-w-0 flex-1">
                  <div className="truncate font-medium text-foreground/90 text-xs">{p.name}</div>
                  {(p as any).description && (
                    <div className="truncate font-mono text-[10px] text-muted-foreground">{(p as any).description}</div>
                  )}
                </div>
                <span className="ml-auto flex-shrink-0 font-mono text-[10px] text-muted-foreground">
                  {(p as any).problems?.length ?? (p as any)._count?.problems ?? 0}p
                </span>
                {isAdding
                  ? <Loader2 className="h-3.5 w-3.5 flex-shrink-0 animate-spin text-primary" />
                  : isAdded
                  ? <Check className="h-3.5 w-3.5 flex-shrink-0 text-easy" />
                  : null}
              </button>
            );
          })}
        </div>

        {/* Create new playlist section */}
        <div className="border-t border-border/60">
          {createMode ? (
            <form onSubmit={handleCreate} className="p-3 space-y-2">
              <div className="font-mono text-[10px] uppercase tracking-widest text-primary mb-2">New Playlist</div>
              <Input
                autoFocus
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Playlist title *"
                className="h-8 text-xs"
                required
              />
              <Textarea
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                placeholder="Description (optional)"
                className="h-16 resize-none text-xs"
                rows={2}
              />
              <div className="flex gap-2">
                <Button
                  type="submit"
                  size="sm"
                  disabled={creating || !newName.trim()}
                  className="flex-1 h-7 gap-1.5 text-xs"
                >
                  {creating ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />}
                  {creating ? "Creating..." : "Create & Add"}
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  className="h-7 px-2"
                  onClick={() => { setCreateMode(false); setNewName(""); setNewDesc(""); }}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </form>
          ) : (
            <button
              onClick={() => setCreateMode(true)}
              className="flex w-full items-center gap-2 px-3 py-2.5 text-xs text-primary transition-colors hover:bg-primary/8"
            >
              <ListPlus className="h-3.5 w-3.5" />
              New playlist
            </button>
          )}
        </div>
      </div>
    </div>
  ) : null;

  return (
    <>
      <button
        ref={triggerRef}
        id={`add-to-playlist-${problemId}`}
        onClick={handleToggle}
        title="Add to playlist"
        className={cn(
          "group flex items-center gap-1.5 rounded-lg border border-border/60 bg-card/60 font-mono text-xs text-muted-foreground transition-all hover:border-primary/50 hover:bg-card hover:text-primary",
          compact ? "h-7 w-7 justify-center p-0" : "px-2.5 py-1.5",
          open && "border-primary/50 bg-card text-primary"
        )}
      >
        <BookmarkPlus className="h-3.5 w-3.5 flex-shrink-0" />
        {!compact && <span>Save</span>}
      </button>

      {/* Portal — renders outside the table so it's never clipped by overflow:hidden */}
      {typeof document !== "undefined" && ReactDOM.createPortal(panel, document.body)}
    </>
  );
}

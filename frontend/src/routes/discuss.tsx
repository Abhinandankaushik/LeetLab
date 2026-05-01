import * as React from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { discussApi, type DiscussPost } from "@/lib/api";
import { MessageSquare, ArrowUp, Eye, Pin, Search, Plus, Tag, Loader2, Send } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ListSkeleton, EmptyState, ErrorState } from "@/components/empty-state";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth-context";
import { cn } from "@/lib/utils";

const TYPES = [
  { key: "all", label: "All" },
  { key: "question", label: "Questions" },
  { key: "editorial", label: "Editorials" },
  { key: "interview-experience", label: "Interviews" },
  { key: "general", label: "General" },
] as const;

export default function DiscussPage() {
  const [type, setType] = React.useState<string>("all");
  const [q, setQ] = React.useState("");

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["discuss", type, q],
    queryFn: () => discussApi.all({ type: type === "all" ? undefined : type, q: q || undefined })
  });

  const posts = data?.discussions ?? [];

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-mono text-xs uppercase tracking-widest text-primary">/ discuss</p>
          <h1 className="mt-2 font-display text-4xl font-bold">Community brain trust</h1>
          <p className="mt-2 max-w-xl text-sm text-muted-foreground">
            Ask, answer, share editorials, and learn from interview experiences.
          </p>
        </div>
        <NewPostDialog onPostCreated={() => refetch()} />
      </div>

      <div className="mb-6 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search discussions..." value={q} onChange={(e) => setQ(e.target.value)} className="pl-9" />
        </div>
        <div className="flex flex-wrap items-center gap-1 rounded-md border border-border bg-card p-1">
          {TYPES.map((t) => (
            <button
              key={t.key}
              onClick={() => setType(t.key)}
              className={cn(
                "rounded px-3 py-1 text-xs font-semibold transition-colors",
                type === t.key ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground",
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {isLoading && <ListSkeleton rows={6} />}
      {isError && <ErrorState description="Couldn't load discussions." onRetry={() => refetch()} />}
      {!isLoading && !isError && posts.length === 0 && (
        <EmptyState
          icon={MessageSquare}
          title="No posts yet"
          description="Discuss endpoints aren't yet available on the backend, or no posts match these filters. Add /discuss routes to your Express server to enable the forum."
        />
      )}

      <div className="space-y-3">
        {posts.map((p) => <PostRow key={p.id} post={p} />)}
      </div>
    </div>
  );
}

function PostRow({ post }: { post: DiscussPost }) {
  return (
    <Link
      to={`/discuss/${post.id}`}
      className="group block rounded-xl border border-border bg-card p-4 transition-all hover:border-primary/50"
    >
      <div className="flex items-start gap-4">
        <div className="flex flex-col items-center gap-1 rounded-md bg-muted/40 px-2 py-1.5">
          <ArrowUp className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="font-mono text-xs font-bold">{post.upvotes}</span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            {post.isPinned && <Pin className="h-3 w-3 text-primary" />}
            <span className="rounded bg-primary/10 px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-primary">{post.type}</span>
            {post.problemId && (
              <span className="text-[10px] text-muted-foreground font-mono">/ {post.problem?.title}</span>
            )}
          </div>
          <h3 className="mt-1.5 truncate font-display text-base font-semibold group-hover:text-primary">
            {post.problemId ? `${post.problem?.title}: ${post.title}` : post.title}
          </h3>
          <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
            <span>by <span className="font-mono text-foreground/80">{post.user?.name || post.author?.name || "Anonymous"}</span></span>
            <span className="font-mono">{new Date(post.createdAt).toLocaleDateString()}</span>
            <span className="flex items-center gap-1"><Eye className="h-3 w-3" />{post.views}</span>
            <span className="flex items-center gap-1"><MessageSquare className="h-3 w-3" />{post.commentCount ?? 0}</span>
            {post.tags?.slice(0, 3).map((t) => (
              <span key={t} className="flex items-center gap-1 rounded bg-muted px-1.5 py-0.5 font-mono text-[10px]">
                <Tag className="h-2.5 w-2.5" />{t}
              </span>
            ))}
          </div>
        </div>
      </div>
    </Link>
  );
}

function NewPostDialog({ onPostCreated }: { onPostCreated: () => void }) {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [open, setOpen] = React.useState(false);
  const [title, setTitle] = React.useState("");
  const [content, setContent] = React.useState("");
  const [type, setType] = React.useState("general");
  const [tags, setTags] = React.useState("");

  const createMut = useMutation({
    mutationFn: (data: any) => discussApi.create(data),
    onSuccess: () => {
      toast.success("Post created successfully!");
      setOpen(false);
      setTitle("");
      setContent("");
      setTags("");
      onPostCreated();
      qc.invalidateQueries({ queryKey: ["discuss"] });
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to create post");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return toast.error("Please sign in to post");
    if (!title.trim() || !content.trim()) return toast.error("Title and content are required");

    createMut.mutate({
      title: title.trim(),
      content: content.trim(),
      type,
      tags: tags.split(",").map(t => t.trim()).filter(Boolean),
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="btn-shine">
          <Plus className="h-4 w-4 mr-2" /> New post
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl font-bold">Create New Discussion</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-xs font-mono uppercase tracking-widest text-muted-foreground">Title</label>
            <Input 
              placeholder="What's on your mind?" 
              value={title} 
              onChange={(e) => setTitle(e.target.value)} 
              className="font-display text-lg"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-mono uppercase tracking-widest text-muted-foreground">Type</label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {TYPES.filter(t => t.key !== 'all').map(t => (
                    <SelectItem key={t.key} value={t.key}>{t.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-mono uppercase tracking-widest text-muted-foreground">Tags (comma separated)</label>
              <Input 
                placeholder="e.g. array, interview, help" 
                value={tags} 
                onChange={(e) => setTags(e.target.value)} 
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-mono uppercase tracking-widest text-muted-foreground">Content</label>
            <Textarea 
              placeholder="Write your post here... Markdown is supported." 
              value={content} 
              onChange={(e) => setContent(e.target.value)} 
              className="min-h-[200px] resize-none"
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={createMut.isPending} className="btn-shine">
              {createMut.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Send className="h-4 w-4 mr-2" />}
              Publish Post
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

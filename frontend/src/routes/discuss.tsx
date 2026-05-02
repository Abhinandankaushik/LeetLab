import * as React from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { discussApi, type DiscussPost } from "@/lib/api";
import { 
  MessageSquare, ArrowUp, Eye, Pin, Search, Plus, 
  Tag, Loader2, Send, Filter, Clock, TrendingUp, Sparkles, User 
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { CardGridSkeleton, EmptyState, ErrorState } from "@/components/empty-state";
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
import { Badge } from "@/components/ui/badge";

const TYPES = [
  { key: "all", label: "All Topics" },
  { key: "question", label: "Questions" },
  { key: "editorial", label: "Editorials" },
  { key: "interview-experience", label: "Interviews" },
  { key: "problem", label: "Problems" },
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
    <div className="mx-auto max-w-7xl px-4 py-10 stagger min-h-screen">
      {/* Premium Header Section */}
      <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
             <div className="h-1 w-8 bg-primary rounded-full" />
             <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-primary font-bold">Community Forum</p>
          </div>
          <h1 className="font-display text-4xl md:text-6xl font-black tracking-tighter leading-none">
            Discuss <span className="text-muted-foreground/20">&</span> Learn
          </h1>
          <p className="max-w-xl text-muted-foreground text-sm leading-relaxed">
            Join the most elite developers to exchange insights, share editorials, and crack interview experiences together.
          </p>
        </div>
        <NewPostDialog onPostCreated={() => refetch()} />
      </div>

      {/* Modern Filter & Search Bar */}
      <div className="mb-10 grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-4">
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <Input 
            placeholder="Search discussions, topics, or keywords..." 
            value={q} 
            onChange={(e) => setQ(e.target.value)} 
            className="pl-11 h-12 bg-card/40 border-border/60 rounded-2xl focus:ring-primary/20 shadow-sm" 
          />
        </div>
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-1">
            {TYPES.map((t) => (
              <button
                key={t.key}
                onClick={() => setType(t.key)}
                className={cn(
                  "h-12 px-5 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all whitespace-nowrap border",
                  type === t.key 
                    ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20" 
                    : "bg-card/40 text-muted-foreground border-border/60 hover:border-primary/40 hover:text-foreground hover:bg-card/80",
                )}
              >
                {t.label}
              </button>
            ))}
        </div>
      </div>

      {/* Content Area */}
      {isLoading && <CardGridSkeleton count={6} />}
      {isError && <ErrorState description="The discourse has encountered a temporary anomaly." onRetry={() => refetch()} />}
      {!isLoading && !isError && posts.length === 0 && (
        <EmptyState
          icon={MessageSquare}
          title="The silence is deafening"
          description="Be the one to start the conversation. No posts match your current search parameters."
          className="py-32"
        />
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts.map((p) => <PostCard key={p.id} post={p} />)}
      </div>
    </div>
  );
}

function PostCard({ post }: { post: DiscussPost }) {
  const typeColors: Record<string, string> = {
    question: "bg-orange-500/10 text-orange-500 border-orange-500/20",
    editorial: "bg-easy/10 text-easy border-easy/20",
    "interview-experience": "bg-blue-500/10 text-blue-500 border-blue-500/20",
    general: "bg-primary/10 text-primary border-primary/20"
  };

  return (
    <Link
      to={`/discuss/${post.id}`}
      className="group relative flex flex-col rounded-3xl border border-border bg-card/40 p-6 backdrop-blur-sm transition-all hover:bg-card hover:border-primary/40 hover:shadow-2xl hover:shadow-primary/5 hover-lift overflow-hidden"
    >
      {post.isPinned && (
        <div className="absolute top-0 right-0 p-3">
          <div className="p-1.5 rounded-full bg-primary/10 text-primary animate-pulse">
            <Pin className="h-3 w-3 fill-current" />
          </div>
        </div>
      )}

      <div className="flex-1">
        <div className="flex items-center gap-2 mb-4">
          <Badge variant="outline" className={cn("rounded-full text-[9px] font-black uppercase tracking-widest border px-2 py-0.5", typeColors[post.type.toLowerCase()] || typeColors.general)}>
            {post.type}
          </Badge>
          {post.problemId && (
            <span className="text-[10px] font-mono text-muted-foreground/60 truncate uppercase tracking-tighter">
              / {post.problem?.title}
            </span>
          )}
        </div>

        <h3 className="font-display text-xl font-bold tracking-tight leading-tight group-hover:text-primary transition-colors line-clamp-2 min-h-[3rem]">
          {post.title}
        </h3>

        {/* Metadata removed as per user request */}
      </div>

      <div className="mt-8 pt-5 border-t border-border/40 flex items-center justify-between">
        <div className="flex items-center gap-4 text-[10px] font-mono text-muted-foreground font-bold">
           <span className="flex items-center gap-1.5 hover:text-primary transition-colors">
              <TrendingUp className="h-3 w-3" /> {post.upvotes ?? 0}
           </span>
           <span className="flex items-center gap-1.5">
              <MessageSquare className="h-3 w-3" /> {post._count?.comments ?? post.commentCount ?? 0}
           </span>
        </div>
        <div className="p-2 rounded-xl bg-muted/40 group-hover:bg-primary/10 group-hover:text-primary transition-all">
           <Plus className="h-3.5 w-3.5" />
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
      toast.success("Perspective published to the grid.");
      setOpen(false);
      setTitle("");
      setContent("");
      setTags("");
      onPostCreated();
      qc.invalidateQueries({ queryKey: ["discuss"] });
    },
    onError: (err: any) => {
      toast.error(err.message || "Uplink failed. Try again.");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return toast.error("Authentication required to broadcast.");
    if (!title.trim() || !content.trim()) return toast.error("All signals (title/content) must be non-empty.");

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
        <Button className="h-12 px-8 rounded-2xl font-black uppercase tracking-widest gap-2 shadow-xl shadow-primary/20 animate-in fade-in zoom-in duration-500">
          <Plus className="h-4 w-4" /> Start Discussion
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[700px] rounded-3xl border-border bg-background p-0 overflow-hidden shadow-2xl">
        <div className="p-6 md:p-8 bg-muted/10 border-b border-border/60">
           <DialogHeader>
             <div className="flex items-center gap-2 mb-2">
                <Sparkles className="h-4 w-4 text-primary" />
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">Post Creation Arena</span>
             </div>
             <DialogTitle className="font-display text-3xl font-black tracking-tighter">Share your wisdom</DialogTitle>
           </DialogHeader>
        </div>

        <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground/60">Discussion Headline</label>
            <Input 
              placeholder="e.g. My journey into FAANG with LeetLab..." 
              value={title} 
              onChange={(e) => setTitle(e.target.value)} 
              className="h-12 bg-card border-border/40 font-display text-lg font-bold rounded-xl"
            />
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground/60">Topic Category</label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger className="h-12 bg-card border-border/40 rounded-xl">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-border bg-card/95 backdrop-blur-md">
                  {TYPES.filter(t => t.key !== 'all').map(t => (
                    <SelectItem key={t.key} value={t.key} className="text-xs font-bold uppercase tracking-tight">{t.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground/60">Keywords (CSV)</label>
              <Input 
                placeholder="array, help, interview" 
                value={tags} 
                onChange={(e) => setTags(e.target.value)} 
                className="h-12 bg-card border-border/40 rounded-xl"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground/60">Detailed Content</label>
            <Textarea 
              placeholder="Deep dive into your thoughts... Markdown supported." 
              value={content} 
              onChange={(e) => setContent(e.target.value)} 
              className="min-h-[250px] bg-card border-border/40 rounded-2xl resize-none p-5 text-sm leading-relaxed"
            />
          </div>

          <div className="pt-4 flex items-center justify-between">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)} className="rounded-xl font-bold text-xs uppercase">Abort</Button>
            <Button type="submit" disabled={createMut.isPending} className="h-12 px-10 rounded-2xl font-black uppercase tracking-widest shadow-lg shadow-primary/20">
              {createMut.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Send className="h-4 w-4 mr-2" />}
              Publish to Grid
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

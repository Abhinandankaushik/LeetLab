import * as React from "react";
import { useParams, Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { discussApi } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { 
  ArrowLeft, ArrowUp, ThumbsDown, Eye, MessageSquare, 
  Loader2, Send, Share2, MoreHorizontal, User, Calendar, Clock,
  TrendingUp, Award, Bookmark, ShieldCheck, Sparkles
} from "lucide-react";
import { CardGridSkeleton, EmptyState, ErrorState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export default function PostDetail() {
  const { postId } = useParams();
  const { user } = useAuth();
  const qc = useQueryClient();
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["discuss-post", postId],
    queryFn: () => discussApi.get(postId!)});

  const { data: commentsData } = useQuery({
    queryKey: ["discuss-comments", postId],
    queryFn: () => discussApi.getComments(postId!),
    enabled: !!postId
  });

  const [comment, setComment] = React.useState("");
  const [voting, setVoting] = React.useState(false);

  const commentMut = useMutation({
    mutationFn: (content: string) => discussApi.comment(postId!, content),
    onSuccess: () => {
      setComment("");
      toast.success("Perspective added to the discourse.");
      qc.invalidateQueries({ queryKey: ["discuss-post", postId] });
      qc.invalidateQueries({ queryKey: ["discuss-comments", postId] });
    },
    onError: (e: any) => toast.error(e?.message || "Uplink failed.")});

  const vote = async (type: "UPVOTE" | "DOWNVOTE") => {
    if (!user) { toast.error("Authenticate to influence the grid."); return; }
    setVoting(true);
    try {
      await discussApi.vote(postId!, type);
      qc.invalidateQueries({ queryKey: ["discuss-post", postId] });
    } catch (e: any) {
      toast.error(e?.message || "Transmission error.");
    } finally { setVoting(false); }
  };

  if (isLoading) return (
    <div className="mx-auto max-w-5xl px-4 py-16 text-center">
       <Loader2 className="h-10 w-10 animate-spin text-primary opacity-30 mx-auto" />
       <p className="mt-4 text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground">Synchronizing with community brain trust...</p>
    </div>
  );

  if (isError) return <div className="mx-auto max-w-4xl px-4 py-20"><ErrorState onRetry={() => refetch()} /></div>;

  const post = data?.discussion;
  if (!post) return (
    <div className="mx-auto max-w-4xl px-4 py-20 text-center">
      <EmptyState 
        icon={MessageSquare} 
        title="Frequency Lost" 
        description="This discussion has been redacted or never existed in this dimension."
        action={<Button asChild variant="outline" className="rounded-full"><Link to="/discuss"><ArrowLeft className="h-4 w-4 mr-2" /> Return to Forum</Link></Button>} 
      />
    </div>
  );

  const comments = commentsData?.comments ?? [];
  const typeColors: Record<string, string> = {
    question: "bg-orange-500/10 text-orange-500 border-orange-500/20",
    editorial: "bg-easy/10 text-easy border-easy/20",
    "interview-experience": "bg-blue-500/10 text-blue-500 border-blue-500/20",
    general: "bg-primary/10 text-primary border-primary/20"
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 stagger min-h-screen">
      {/* Navigation & Actions */}
      <div className="mb-10 flex items-center justify-between">
        <Button variant="ghost" size="sm" asChild className="rounded-full gap-2 text-muted-foreground hover:text-foreground">
          <Link to="/discuss"><ArrowLeft className="h-4 w-4" /> All Discussions</Link>
        </Button>
        <div className="flex items-center gap-2">
           <Button variant="outline" size="icon" className="rounded-xl h-9 w-9 opacity-60 hover:opacity-100" title="Bookmark">
              <Bookmark className="h-4 w-4" />
           </Button>
           <Button variant="outline" size="icon" className="rounded-xl h-9 w-9 opacity-60 hover:opacity-100" title="Share">
              <Share2 className="h-4 w-4" />
           </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-12 items-start">
        {/* Main Content Column */}
        <div className="space-y-8">
           <div className="space-y-6">
              <div className="flex items-center gap-3">
                 <Badge variant="outline" className={cn("rounded-full text-[10px] font-black uppercase tracking-widest px-3 py-1 border", typeColors[post.type.toLowerCase()] || typeColors.general)}>
                    {post.type}
                 </Badge>
                 {post.problemId && (
                   <Link to={`/problems/${post.problemId}`} className="text-xs font-mono font-bold text-primary hover:underline flex items-center gap-1.5">
                      <Sparkles className="h-3 w-3" /> Related Problem: {post.problem?.title}
                   </Link>
                 )}
              </div>

              <h1 className="font-display text-4xl md:text-5xl font-black tracking-tighter leading-tight text-foreground">
                {post.title}
              </h1>

              <div className="py-2 border-b border-border/40">
                 {/* Metadata removed as per user request */}
              </div>
           </div>

           <article className="prose prose-invert prose-p:leading-relaxed prose-p:text-muted-foreground max-w-none">
              <div className="whitespace-pre-wrap text-lg leading-relaxed text-foreground/90 font-medium">
                {post.content}
              </div>
           </article>

           {post.tags?.length ? (
             <div className="flex flex-wrap gap-2 pt-6">
               {post.tags.map((t: string) => (
                 <span key={t} className="px-3 py-1 rounded-full bg-muted/50 border border-border/40 font-mono text-[11px] text-muted-foreground font-bold hover:text-primary hover:border-primary/40 transition-colors cursor-pointer">
                   #{t}
                 </span>
               ))}
             </div>
           ) : null}

           {/* Feedback Section */}
           <div className="mt-12 p-8 rounded-3xl border border-border bg-card/40 backdrop-blur-sm flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="text-center md:text-left">
                 <h4 className="font-display text-xl font-bold tracking-tight">Was this insight helpful?</h4>
                 <p className="text-sm text-muted-foreground">Your vote helps the community identify high-quality content.</p>
              </div>
              <div className="flex items-center gap-3">
                 <Button 
                   onClick={() => vote("UPVOTE")}
                   disabled={voting}
                   className={cn(
                     "h-12 px-6 rounded-2xl font-black uppercase tracking-widest gap-2 transition-all",
                     post.userVote === "UPVOTE" ? "bg-primary shadow-lg shadow-primary/20" : "bg-muted border-border/40 hover:bg-primary/10 hover:text-primary"
                   )}
                 >
                   <ArrowUp className="h-4 w-4" /> {post.upvotes ?? 0}
                 </Button>
                 <Button 
                   variant="outline"
                   onClick={() => vote("DOWNVOTE")}
                   disabled={voting}
                   className={cn(
                     "h-12 px-4 rounded-2xl transition-all border-border/40",
                     post.userVote === "DOWNVOTE" ? "bg-hard/20 text-hard border-hard/40" : "hover:bg-hard/10 hover:text-hard"
                   )}
                 >
                   <ThumbsDown className="h-4 w-4" />
                 </Button>
              </div>
           </div>

           {/* Comments Section */}
           <div className="mt-20 space-y-8">
              <div className="flex items-center justify-between border-b border-border/40 pb-4">
                 <h2 className="font-display text-2xl font-black tracking-tighter flex items-center gap-3">
                    <MessageSquare className="h-6 w-6 text-primary" />
                    {post._count?.comments ?? comments.length} Thoughts
                 </h2>
                 <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                    Sorted by <Badge variant="outline" className="text-[9px]">Recent</Badge>
                 </div>
              </div>

              {user ? (
                <form
                  onSubmit={(e) => { e.preventDefault(); if (comment.trim()) commentMut.mutate(comment.trim()); }}
                  className="group relative rounded-3xl border border-border bg-card p-6 focus-within:border-primary/40 transition-all shadow-sm focus-within:shadow-xl focus-within:shadow-primary/5"
                >
                  <Textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Contribute to the collective intelligence..."
                    rows={4}
                    className="resize-none bg-transparent border-none focus-visible:ring-0 p-0 text-sm leading-relaxed"
                  />
                  <div className="mt-4 flex justify-end">
                    <Button type="submit" disabled={commentMut.isPending || !comment.trim()} className="h-10 px-8 rounded-xl font-bold uppercase text-[11px] tracking-widest shadow-lg shadow-primary/20">
                      {commentMut.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Send className="h-4 w-4 mr-2" />}
                      Broadcast
                    </Button>
                  </div>
                </form>
              ) : (
                <div className="p-10 rounded-3xl border border-dashed border-border bg-muted/10 text-center">
                   <p className="text-sm text-muted-foreground font-medium">
                     <Link to="/login" className="text-primary font-bold hover:underline">Authorize your identity</Link> to join the discourse.
                   </p>
                </div>
              )}

              <div className="space-y-6">
                {comments.length === 0 && (
                  <div className="py-12 text-center opacity-40">
                     <MessageSquare className="h-10 w-10 mx-auto mb-2" />
                     <p className="text-xs font-mono uppercase tracking-widest">No signals received yet.</p>
                  </div>
                )}
                {comments.map((c: any) => (
                  <div key={c.id} className="group relative rounded-3xl border border-border bg-card/40 p-6 hover:bg-card hover:border-primary/40 transition-all stagger">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                         <div className="h-8 w-8 rounded-xl bg-muted border border-border/40 grid place-items-center text-muted-foreground/40 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                            <User className="h-4 w-4" />
                         </div>
                         <div>
                            <p className="text-[11px] font-bold text-foreground">{c.user?.name || c.author?.name}</p>
                            <p className="text-[9px] font-mono text-muted-foreground uppercase opacity-60">{new Date(c.createdAt).toLocaleDateString()}</p>
                         </div>
                      </div>
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg opacity-0 group-hover:opacity-100">
                         <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="text-sm leading-relaxed text-muted-foreground group-hover:text-foreground/90 transition-colors whitespace-pre-wrap pl-11">
                      {c.content}
                    </p>
                  </div>
                ))}
              </div>
           </div>
        </div>

        {/* Sidebar Info Column */}
        <aside className="space-y-6 hidden lg:block sticky top-24">
           <div className="rounded-3xl border border-border bg-card/40 p-6 space-y-6">
              <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">About Discussion</h4>
              <div className="space-y-4">
                 <div className="flex items-center justify-between p-3 rounded-2xl bg-muted/30 border border-border/40">
                    <div className="flex items-center gap-2">
                       <TrendingUp className="h-4 w-4 text-primary" />
                       <span className="text-[11px] font-medium">Momentum</span>
                    </div>
                    <span className="text-xs font-bold">{(post.upvotes ?? 0) > 10 ? "High" : "Stable"}</span>
                 </div>
                 <div className="flex items-center justify-between p-3 rounded-2xl bg-muted/30 border border-border/40">
                    <div className="flex items-center gap-2">
                       <Award className="h-4 w-4 text-orange-500" />
                       <span className="text-[11px] font-medium">Engagement</span>
                    </div>
                    <span className="text-xs font-bold">{(post.upvotes ?? 0) > 5 ? "High" : "Steady"}</span>
                 </div>
                 <div className="flex items-center justify-between p-3 rounded-2xl bg-muted/30 border border-border/40">
                    <div className="flex items-center gap-2">
                       <ShieldCheck className="h-4 w-4 text-blue-500" />
                       <span className="text-[11px] font-medium">Visibility</span>
                    </div>
                    <span className="text-xs font-bold text-blue-500">{post.type.toUpperCase()}</span>
                 </div>
              </div>
              <p className="text-[10px] text-muted-foreground leading-relaxed italic">
                “In the arena of code, logic is the only weapon that matters.”
              </p>
           </div>

           <div className="rounded-3xl border border-border bg-primary/5 p-6 border-dashed">
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-primary mb-2">Platform Tip</h4>
              <p className="text-xs text-primary/80 leading-relaxed">
                Good discussions often lead to verified editorials. Maintain high-quality discourse to earn reputation points.
              </p>
           </div>
        </aside>
      </div>
    </div>
  );
}

import * as React from "react";
import { useParams, Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { discussApi, type DiscussComment } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { useRealtimeRoom } from "@/lib/use-realtime-room";
import { 
  ArrowLeft, ArrowUp, ThumbsDown, Eye, MessageSquare, 
  Loader2, Send, Share2, Bookmark, Clock, User, 
  TrendingUp, Award, ShieldCheck, Flame, ChevronDown, 
  MoreVertical, Sparkles, Trash2, Users
} from "lucide-react";
import { EmptyState, ErrorState, DetailSkeleton } from "@/components/empty-state";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function PostDetail() {
  const { postId } = useParams();
  const { user } = useAuth();
  const qc = useQueryClient();

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["discuss-post", postId],
    queryFn: () => discussApi.get(postId!),
    enabled: !!postId
  });

  const post = data?.discussion;

  const { data: commentsData } = useQuery({
    queryKey: ["discuss-comments", postId],
    queryFn: () => discussApi.getComments(postId!),
    enabled: !!postId
  });

  const [comment, setComment] = React.useState("");
  const [voting, setVoting] = React.useState(false);
  const [online, setOnline] = React.useState(0);
  const [typingName, setTypingName] = React.useState<string | null>(null);
  const typingTimer = React.useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const lastTypingSent = React.useRef(0);

  const upsertComment = React.useCallback((c: DiscussComment) => {
    qc.setQueryData<{ comments: DiscussComment[] }>(["discuss-comments", postId], (old) => {
      const list = old?.comments ?? [];
      if (list.some((x) => x.id === c.id)) {
        return { comments: list.map((x) => (x.id === c.id ? { ...x, ...c } : x)) };
      }
      return { comments: [...list, c] };
    });
  }, [qc, postId]);

  const room = useRealtimeRoom(postId, {
    onComment: (c) => upsertComment(c),
    onDeleteComment: (commentId) => {
      qc.setQueryData<{ comments: DiscussComment[] }>(["discuss-comments", postId], (old) =>
        old ? { comments: old.comments.filter((x) => x.id !== commentId) } : old
      );
    },
    onVote: (commentId, votes) => {
      qc.setQueryData<{ comments: DiscussComment[] }>(["discuss-comments", postId], (old) =>
        old
          ? { comments: old.comments.map((x) => (x.id === commentId ? { ...x, upvotes: votes.upvotes, downvotes: votes.downvotes } : x)) }
          : old
      );
    },
    onPresence: (count) => setOnline(count),
    onTyping: (u) => {
      setTypingName(u?.name || "Someone");
      if (typingTimer.current) clearTimeout(typingTimer.current);
      typingTimer.current = setTimeout(() => setTypingName(null), 2500);
    },
  });

  React.useEffect(() => () => { if (typingTimer.current) clearTimeout(typingTimer.current); }, []);

  const commentMut = useMutation({
    mutationFn: (content: string) => discussApi.comment(postId!, content),
    onSuccess: (data) => {
      setComment("");
      toast.success("Intelligence shared with the collective.");
      if (data?.comment) {
        upsertComment(data.comment);
        room.sendComment(data.comment);
      }
      qc.invalidateQueries({ queryKey: ["discuss-post", postId] });
    },
    onError: (e: any) => toast.error(e?.message || "Broadcast failed.")
  });

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

  const voteComment = async (commentId: string, type: "UPVOTE" | "DOWNVOTE") => {
    if (!user) { toast.error("Authenticate to influence the grid."); return; }
    try {
      const res = await discussApi.voteComment(commentId, type);
      qc.invalidateQueries({ queryKey: ["discuss-comments", postId] });
      if (res?.votes) room.sendVote(commentId, res.votes);
    } catch (e: any) {
      toast.error(e?.message || "Transmission error.");
    }
  };

  const handleDeletePost = async () => {
    if (!confirm("Vanish this discourse forever?")) return;
    try {
      await discussApi.remove(postId!);
      toast.success("Discourse purged.");
      window.location.href = "/discuss";
    } catch (e: any) {
      toast.error("Failed to purge.");
    }
  };

  const handleDeleteComment = async (id: string) => {
    if (!confirm("Silence this thought?")) return;
    try {
      await discussApi.removeComment(id);
      toast.success("Thought silenced.");
      qc.invalidateQueries({ queryKey: ["discuss-comments", postId] });
      room.sendDeleteComment(id);
    } catch (e: any) {
      toast.error("Failed to silence.");
    }
  };

  const [expanded, setExpanded] = React.useState(false);
  const contentRef = React.useRef<HTMLDivElement>(null);
  const [isLong, setIsLong] = React.useState(false);

  React.useEffect(() => {
    if (contentRef.current && contentRef.current.scrollHeight > 800) {
      setIsLong(true);
    }
  }, [post?.content]);

  const [scrollProgress, setScrollProgress] = React.useState(0);
  React.useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = (window.scrollY / totalHeight) * 100;
      setScrollProgress(progress);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const [sortBy, setSortBy] = React.useState<"recent" | "upvoted">("recent");

  const comments = React.useMemo(() => {
    const list = [...(commentsData?.comments ?? [])];
    if (sortBy === "recent") {
      return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
    return list.sort((a, b) => ((b.upvotes ?? 0) - (b.downvotes ?? 0)) - ((a.upvotes ?? 0) - (a.downvotes ?? 0)));
  }, [commentsData?.comments, sortBy]);

  if (isLoading) return <DetailSkeleton />;

  if (isError) return <div className="min-h-screen bg-background p-10"><ErrorState onRetry={() => refetch()} /></div>;

  if (!post && !isLoading) return (
    <div className="min-h-screen bg-background p-10 flex items-center justify-center">
      <EmptyState 
        icon={MessageSquare} 
        title="Signal Lost" 
        description="The requested discourse does not exist in this sector."
        action={<Button asChild variant="outline" className="rounded-full border-primary/20 text-primary"><Link to="/discuss"><ArrowLeft className="h-4 w-4 mr-2" /> Back to Grid</Link></Button>} 
      />
    </div>
  );

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/30 selection:text-primary">
      <div className="mx-auto max-w-[1400px] px-4 md:px-8 py-10">
        
        {/* 1. Breadcrumb & Actions */}
        <div className="mb-10 flex items-center justify-between">
          <Link to="/discuss" className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-muted-foreground hover:text-primary transition-all group">
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            All Discussions
          </Link>
          <div className="flex items-center gap-2">
             <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-card hover:text-primary border border-transparent hover:border-primary/20 transition-all">
                <Bookmark className="h-4 w-4" />
             </Button>
             <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-card hover:text-primary border border-transparent hover:border-primary/20 transition-all">
                <Share2 className="h-4 w-4" />
             </Button>
             {user?.role === "ADMIN" && (
               <Button 
                onClick={handleDeletePost}
                variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-hard/10 hover:text-hard border border-transparent hover:border-hard/20 transition-all"
               >
                 <Trash2 className="h-4 w-4" />
               </Button>
             )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-12 items-start">
          
          {/* LEFT COLUMN: Main Content */}
          <div className="w-full min-w-0 space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
             
             {/* Header Section */}
             <div className="space-y-6">
                <div className="flex items-center gap-3">
                   <Badge className="bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 rounded-lg px-3 py-1 text-[10px] font-black tracking-[0.1em] gap-1.5 transition-all">
                      <Flame className="h-3 w-3 fill-current" />
                      PROBLEM
                   </Badge>
                   {post.problemId && (
                     <Link to={`/problems/${post.problemId}`} className="text-xs font-mono font-bold text-muted-foreground hover:text-primary transition-colors flex items-center gap-2">
                        <Sparkles className="h-3 w-3 text-primary/40" />
                        {post.problem?.title}
                     </Link>
                   )}
                </div>

                <h1 className="font-display text-4xl md:text-6xl font-black tracking-tighter leading-[1.1] text-foreground">
                  {post.title}
                </h1>

                <div className="flex flex-wrap items-center justify-between gap-6 pt-4">
                   <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10 border border-primary/20 p-0.5 bg-background">
                         <AvatarFallback className="bg-card text-primary font-black text-xs">
                            {post.author?.name?.[0] || post.user?.name?.[0] || "?"}
                         </AvatarFallback>
                      </Avatar>
                      <div className="space-y-0.5">
                         <p className="text-sm font-black text-foreground hover:text-primary cursor-pointer transition-colors">
                            {post.author?.name || post.user?.name || "Anonymous Entity"}
                         </p>
                         <div className="flex items-center gap-2 text-[10px] font-mono text-muted-foreground uppercase tracking-widest font-bold">
                            <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                         </div>
                      </div>
                   </div>

                   {/* Minimal Voting in Header */}
                   <div className="flex items-center bg-card/80 backdrop-blur-md rounded-xl border border-border p-1.5 gap-1 shadow-xl">
                      <Button 
                        onClick={() => vote("UPVOTE")}
                        disabled={voting}
                        variant="ghost"
                        className={cn(
                          "h-9 px-4 rounded-lg font-black uppercase tracking-widest text-[10px] gap-2 transition-all",
                          post.userVote === "UPVOTE" 
                            ? "bg-primary text-primary-foreground hover:bg-primary/90" 
                            : "text-muted-foreground hover:text-primary hover:bg-primary/5"
                        )}
                      >
                        <ArrowUp className={cn("h-3.5 w-3.5", post.userVote === "UPVOTE" ? "fill-current" : "")} />
                        {post.upvotes ?? 0}
                      </Button>
                      <Separator orientation="vertical" className="h-4 bg-border" />
                      <Button 
                        onClick={() => vote("DOWNVOTE")}
                        disabled={voting}
                        variant="ghost"
                        size="icon"
                        className={cn(
                          "h-9 w-9 rounded-lg transition-all",
                          post.userVote === "DOWNVOTE" 
                            ? "bg-red-500/20 text-red-500 hover:bg-red-500/30" 
                            : "text-muted-foreground hover:text-red-500 hover:bg-red-500/5"
                        )}
                      >
                        <ThumbsDown className="h-3.5 w-3.5" />
                      </Button>
                   </div>
                </div>
                <Separator className="bg-border mt-8" />
             </div>

             {/* Content Article */}
             <article className="relative group">
                <div 
                  ref={contentRef}
                  className={cn(
                    "prose max-w-full prose-p:leading-[1.8] prose-p:text-foreground/80 prose-headings:text-foreground prose-strong:text-primary prose-code:text-primary prose-code:bg-primary/5 prose-code:px-1 prose-code:rounded overflow-hidden transition-all duration-700",
                    !expanded && isLong ? "max-h-[800px]" : "max-h-none"
                  )}
                >
                  <div className="whitespace-pre-wrap break-words text-base md:text-lg font-medium leading-relaxed overflow-hidden">
                    {post.content}
                  </div>
                </div>

                {!expanded && isLong && (
                  <div className="absolute bottom-0 left-0 w-full h-64 bg-gradient-to-t from-background via-background/80 to-transparent flex items-end justify-center pb-8">
                     <Button 
                       onClick={() => setExpanded(true)}
                       className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90 font-black uppercase tracking-widest px-8 h-12 shadow-2xl shadow-primary/20 group/btn"
                     >
                        Read Full Perspective
                        <ChevronDown className="ml-2 h-4 w-4 group-hover/btn:translate-y-1 transition-transform" />
                     </Button>
                  </div>
                )}
             </article>

             {/* Comments Section */}
             <div className="mt-12 md:mt-24 space-y-10">
                <div className="flex flex-col gap-4 border-b border-border pb-6 sm:flex-row sm:items-center sm:justify-between">
                   <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                      <h2 className="font-display text-2xl sm:text-3xl font-black tracking-tighter flex items-center gap-3 sm:gap-4">
                         <MessageSquare className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
                         {post._count?.comments ?? comments.length} <span className="text-muted-foreground">Thoughts</span>
                      </h2>
                      <div className="flex items-center gap-1.5 rounded-full border border-border bg-card/40 px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                         <span className={cn("h-2 w-2 rounded-full", room.connected ? "bg-primary animate-pulse" : "bg-muted-foreground/40")} />
                         <Users className="h-3 w-3" />
                         {online > 0 ? online : 1} live
                      </div>
                   </div>
                   <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                         <Button variant="ghost" className="self-end sm:self-auto rounded-xl border border-border bg-card/30 gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-foreground">
                            Sorted by: <span className="text-primary">{sortBy === "recent" ? "Recent" : "Upvoted"}</span>
                            <ChevronDown className="h-3 w-3" />
                         </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-card border-border text-foreground/80">
                         <DropdownMenuItem 
                           onClick={() => setSortBy("upvoted")}
                           className="text-[10px] font-black uppercase tracking-widest focus:bg-primary/10 focus:text-primary"
                         >
                           Most Upvoted
                         </DropdownMenuItem>
                         <DropdownMenuItem 
                           onClick={() => setSortBy("recent")}
                           className="text-[10px] font-black uppercase tracking-widest focus:bg-primary/10 focus:text-primary"
                         >
                           Recent First
                         </DropdownMenuItem>
                      </DropdownMenuContent>
                   </DropdownMenu>
                </div>

                <div className="max-h-[600px] overflow-y-auto space-y-4 pr-4 scrollbar-thin scrollbar-thumb-primary/20 scrollbar-track-transparent hover:scrollbar-thumb-primary/40 transition-all">
                  {comments.length === 0 && (
                    <div className="py-20 text-center opacity-20 group">
                       <MessageSquare className="h-12 w-12 mx-auto mb-4 text-primary group-hover:scale-110 transition-transform duration-500" />
                       <p className="text-[10px] font-mono uppercase tracking-[0.3em] font-bold">No signals received.</p>
                    </div>
                  )}
                  {comments.map((c: any, i) => (
                    <div 
                      key={c.id} 
                      className="group relative rounded-2xl border border-border bg-card/30 p-4 hover:bg-card hover:border-primary/20 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-3">
                           <Avatar className="h-7 w-7 border border-border group-hover:border-primary/20 transition-colors">
                              <AvatarFallback className="bg-card text-muted-foreground text-[9px] font-black">
                                {c.user?.name?.[0] || c.author?.name?.[0] || "U"}
                              </AvatarFallback>
                           </Avatar>
                           <div>
                              <p className="text-[11px] font-black text-foreground/90 group-hover:text-primary transition-colors tracking-tight">
                                {c.user?.name || c.author?.name || "System Unit"}
                              </p>
                              <p className="text-[9px] font-mono text-muted-foreground uppercase font-bold tracking-tighter">
                                {new Date(c.createdAt).toLocaleDateString()}
                              </p>
                           </div>
                        </div>
                        <div className="flex items-center gap-1">
                           <div className="flex items-center bg-background/50 rounded-lg border border-border overflow-hidden mr-2">
                              <button 
                                onClick={() => voteComment(c.id, "UPVOTE")}
                                className={cn(
                                  "p-1.5 transition-colors hover:text-primary",
                                  c.userVote === "UPVOTE" ? "text-primary bg-primary/10" : "text-muted-foreground"
                                )}
                              >
                                 <ArrowUp className={cn("h-3 w-3", c.userVote === "UPVOTE" && "fill-current")} />
                              </button>
                              <span className="text-[10px] font-black px-1 min-w-[1.5rem] text-center text-muted-foreground">
                                {c.upvotes ?? 0}
                              </span>
                              <button 
                                onClick={() => voteComment(c.id, "DOWNVOTE")}
                                className={cn(
                                  "p-1.5 transition-colors hover:text-red-500",
                                  c.userVote === "DOWNVOTE" ? "text-red-500 bg-red-500/10" : "text-muted-foreground"
                                )}
                              >
                                 <ThumbsDown className={cn("h-3 w-3", c.userVote === "DOWNVOTE" && "fill-current")} />
                              </button>
                           </div>
                           <Button variant="ghost" size="icon" className="h-6 w-6 rounded-md opacity-0 group-hover:opacity-100 transition-opacity">
                              <MoreVertical className="h-3 w-3" />
                           </Button>
                           {user?.role === "ADMIN" && (
                             <Button 
                              onClick={() => handleDeleteComment(c.id)}
                              variant="ghost" size="icon" className="h-6 w-6 rounded-md text-hard hover:bg-hard/10"
                             >
                               <Trash2 className="h-3 w-3" />
                             </Button>
                           )}
                        </div>
                      </div>
                      <p className="text-muted-foreground text-xs leading-relaxed pl-10 group-hover:text-foreground/80 transition-colors">
                        {c.content}
                      </p>
                    </div>
                  ))}
                </div>

                {user ? (
                  <form
                    onSubmit={(e) => { e.preventDefault(); if (comment.trim()) commentMut.mutate(comment.trim()); }}
                    className="relative group rounded-3xl border border-border bg-card/30 p-6 md:p-8 focus-within:border-primary/40 transition-all duration-500 hover:bg-card/50"
                  >
                    <Textarea
                      value={comment}
                      onChange={(e) => {
                        setComment(e.target.value);
                        const now = Date.now();
                        if (user && now - lastTypingSent.current > 1500) {
                          lastTypingSent.current = now;
                          room.sendTyping({ id: user.id, name: user.name || "Someone" });
                        }
                      }}
                      placeholder="Contribute to the collective intelligence..."
                      className="min-h-[160px] bg-transparent border-none focus-visible:ring-0 p-0 text-lg leading-relaxed placeholder:text-muted-foreground resize-none"
                    />
                    {typingName && (
                      <p className="mt-2 text-[11px] italic text-muted-foreground animate-in fade-in">{typingName} is typing...</p>
                    )}
                    <div className="mt-6 flex justify-end">
                      <Button type="submit" disabled={commentMut.isPending || !comment.trim()} className="h-12 px-10 rounded-2xl font-black uppercase tracking-widest bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] active:scale-95">
                        {commentMut.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-3" /> : <Send className="h-4 w-4 mr-3" />}
                        BROADCAST
                      </Button>
                    </div>
                  </form>
                ) : (
                  <div className="p-12 rounded-3xl border border-dashed border-border bg-card/20 text-center group transition-colors hover:border-primary/20">
                     <p className="text-muted-foreground font-medium">
                       <Link to="/login" className="text-primary font-black hover:underline underline-offset-4">Authorize your connection</Link> to share perspectives.
                     </p>
                  </div>
                )}
             </div>
          </div>

          {/* RIGHT COLUMN: Sidebar (Sticky) */}
          <aside className="space-y-8 sticky top-32">
             <div className="rounded-[32px] border border-border bg-card/40 p-8 space-y-8 backdrop-blur-sm relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-30 transition-opacity">
                   <TrendingUp className="h-20 w-20 text-primary" />
                </div>
                
                <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
                   <TrendingUp className="h-4 w-4 text-primary" /> About Discussion
                </h4>
                
                <div className="space-y-4">
                   <div className="flex items-center justify-between p-4 rounded-2xl bg-background/50 border border-border group/item hover:border-primary/30 transition-colors">
                      <div className="flex items-center gap-3">
                         <TrendingUp className="h-4 w-4 text-primary" />
                         <span className="text-xs font-bold text-muted-foreground">Momentum</span>
                      </div>
                      <span className="text-xs font-black text-foreground uppercase">{(post.upvotes ?? 0) > 10 ? "High" : "Stable"}</span>
                   </div>
                   <div className="flex items-center justify-between p-4 rounded-2xl bg-background/50 border border-border group/item hover:border-primary/30 transition-colors">
                      <div className="flex items-center gap-3">
                         <Award className="h-4 w-4 text-orange-500" />
                         <span className="text-xs font-bold text-muted-foreground">Engagement</span>
                      </div>
                      <span className="text-xs font-black text-foreground uppercase">{(post.upvotes ?? 0) > 5 ? "Active" : "Steady"}</span>
                   </div>
                   <div className="flex items-center justify-between p-4 rounded-2xl bg-background/50 border border-border group/item hover:border-primary/30 transition-colors">
                      <div className="flex items-center gap-3">
                         <Eye className="h-4 w-4 text-blue-500" />
                         <span className="text-xs font-bold text-muted-foreground">Visibility</span>
                      </div>
                      <Badge className="bg-primary/10 text-primary border-primary/20 rounded-md text-[9px] font-black uppercase">
                        {post.type}
                      </Badge>
                   </div>
                </div>

                <div className="pt-6 border-t border-border">
                   <p className="text-sm italic text-muted-foreground leading-relaxed font-serif">
                     “In the arena of code, logic is the only weapon that matters.”
                   </p>
                </div>
             </div>

             <div className="rounded-[32px] border border-primary/10 bg-gradient-to-br from-primary/10 to-transparent p-8 relative overflow-hidden group border-dashed">
                <div className="absolute -bottom-4 -right-4 h-24 w-24 bg-primary/5 blur-3xl rounded-full" />
                <h4 className="text-[10px] font-black uppercase tracking-widest text-primary mb-4 flex items-center gap-2">
                   <ShieldCheck className="h-4 w-4" /> Platform Tip
                </h4>
                <p className="text-xs text-foreground/80 leading-relaxed font-medium">
                  Good discussions often lead to verified editorials. Maintain high-quality discourse to earn reputation points and unlock elite profile badges.
                </p>
             </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

import * as React from "react";
import { useParams, Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { discussApi } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { ArrowLeft, ArrowUp, ThumbsDown, Eye, MessageSquare, Loader2, Send } from "lucide-react";
import { ListSkeleton, EmptyState, ErrorState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";


export default function PostDetail() {
  const { postId } = useParams();
  const { user } = useAuth();
  const qc = useQueryClient();
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["discuss-post", postId],
    queryFn: () => discussApi.get(postId!)});

  const [comment, setComment] = React.useState("");
  const [voting, setVoting] = React.useState(false);

  const commentMut = useMutation({
    mutationFn: (content: string) => discussApi.comment(postId!, content),
    onSuccess: () => {
      setComment("");
      toast.success("Comment posted");
      qc.invalidateQueries({ queryKey: ["discuss-post", postId] });
    },
    onError: (e: any) => toast.error(e?.message || "Failed to post comment")});

  const vote = async (type: "UPVOTE" | "DOWNVOTE") => {
    if (!user) { toast.error("Sign in to vote"); return; }
    setVoting(true);
    try {
      await discussApi.vote(postId!, type);
      qc.invalidateQueries({ queryKey: ["discuss-post", postId] });
    } catch (e: any) {
      toast.error(e?.message || "Vote failed");
    } finally { setVoting(false); }
  };

  if (isLoading) return <div className="mx-auto max-w-3xl px-4 py-10"><ListSkeleton rows={6} /></div>;
  if (isError) return <div className="mx-auto max-w-3xl px-4 py-10"><ErrorState onRetry={() => refetch()} /></div>;

  const post = data?.discussion;
  if (!post) return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <EmptyState icon={MessageSquare} title="Post not found" action={
        <Button asChild><Link to="/discuss"><ArrowLeft className="h-4 w-4" /> Back</Link></Button>
      } />
    </div>
  );

  const comments = data?.comments ?? [];

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <Link to="/discuss" className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-3 w-3" /> All posts
      </Link>

      <div className="mt-4 rounded-2xl border border-border bg-card p-6">
        <span className="rounded bg-primary/10 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-primary">{post.type}</span>
        <h1 className="mt-3 font-display text-3xl font-bold">{post.title}</h1>

        <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
          <span>by <span className="font-mono text-foreground/80">{post.author?.name || post.user?.name}</span></span>
          <span className="font-mono">{new Date(post.createdAt).toLocaleDateString()}</span>
          <button
            onClick={() => vote("UPVOTE")}
            disabled={voting}
            className={cn(
              "flex items-center gap-1 rounded px-1.5 py-0.5 transition hover:bg-primary/10 hover:text-primary disabled:opacity-50",
              post.userVote === "UPVOTE" && "text-primary font-bold bg-primary/5"
            )}
          >
            <ArrowUp className="h-3 w-3" />{post.upvotes ?? 0}
          </button>
          <button
            onClick={() => vote("DOWNVOTE")}
            disabled={voting}
            className={cn(
              "flex items-center gap-1 rounded px-1.5 py-0.5 transition hover:bg-hard/10 hover:text-hard disabled:opacity-50",
              post.userVote === "DOWNVOTE" && "text-hard font-bold bg-hard/5"
            )}
          >
            <ThumbsDown className="h-3 w-3" />{post.downvotes ?? 0}
          </button>
          <span className="flex items-center gap-1"><Eye className="h-3 w-3" />{post.views ?? 0}</span>
        </div>

        <article className="prose prose-sm mt-6 max-w-none whitespace-pre-wrap text-foreground/90">
          {post.content}
        </article>

        {post.tags?.length ? (
          <div className="mt-6 flex flex-wrap gap-1.5">
            {post.tags.map((t) => (
              <span key={t} className="rounded bg-muted px-2 py-0.5 font-mono text-[10px] text-muted-foreground">#{t}</span>
            ))}
          </div>
        ) : null}
      </div>

      <h2 className="mt-10 font-display text-xl font-bold">
        {comments.length} {comments.length === 1 ? "comment" : "comments"}
      </h2>

      {user ? (
        <form
          onSubmit={(e) => { e.preventDefault(); if (comment.trim()) commentMut.mutate(comment.trim()); }}
          className="mt-4 rounded-xl border border-border bg-card p-4"
        >
          <Textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share your thoughts..."
            rows={3}
            className="resize-none"
          />
          <div className="mt-2 flex justify-end">
            <Button type="submit" size="sm" disabled={commentMut.isPending || !comment.trim()} className="btn-shine">
              {commentMut.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
              Comment
            </Button>
          </div>
        </form>
      ) : (
        <p className="mt-4 text-sm text-muted-foreground">
          <Link to="/login" className="text-primary hover:underline">Sign in</Link> to join the discussion.
        </p>
      )}

      <div className="mt-4 space-y-3">
        {comments.length === 0 && <p className="text-sm text-muted-foreground">No comments yet — be the first.</p>}
        {comments.map((c: any) => (
          <div key={c.id} className="rounded-md border border-border bg-card p-4 hover-lift transition">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span className="font-mono">{c.user?.name || c.author?.name}</span>
              <span className="font-mono">{new Date(c.createdAt).toLocaleDateString()}</span>
            </div>
            <p className="mt-2 whitespace-pre-wrap text-sm">{c.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

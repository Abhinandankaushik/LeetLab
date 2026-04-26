import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, MessageSquare, Share2, Bookmark, Flag, ThumbsUp, ThumbsDown, CheckCircle2 } from 'lucide-react';
import Avatar from '../components/ui/Avatar';
import TagChip from '../components/ui/TagChip';
import { forumThreads } from '../lib/communityData';

const DiscussionThreadPage = () => {
  const { id } = useParams();
  const [reply, setReply] = useState('');

  const thread = useMemo(() => forumThreads[id] || forumThreads['post-101'], [id]);

  return (
    <div className="mx-auto w-full max-w-5xl space-y-5">
      <section className="rounded-3xl border border-base-300 bg-base-100 p-5 shadow-lg">
        <Link to="/discussion" className="btn btn-ghost btn-sm">
          <ArrowLeft className="h-4 w-4" /> Back to Discuss
        </Link>

        <h1 className="mt-3 text-3xl font-black tracking-tight">{thread.title}</h1>

        <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-base-content/65">
          <div className="inline-flex items-center gap-2"><Avatar username={thread.author.username} />{thread.author.displayName}</div>
          <span>{new Date(thread.createdAt).toLocaleString('en-US')}</span>
          <span>{thread.views.toLocaleString()} views</span>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          {thread.tags.map((tag) => (
            <TagChip key={tag} label={tag} />
          ))}
        </div>

        <p className="mt-4 leading-7 text-base-content/85">{thread.content}</p>

        <div className="mt-4 flex flex-wrap gap-2">
          <button type="button" className="btn btn-sm btn-outline"><ThumbsUp className="h-4 w-4" />{thread.votes}</button>
          <button type="button" className="btn btn-sm btn-outline"><ThumbsDown className="h-4 w-4" />Downvote</button>
          <button type="button" className="btn btn-sm btn-outline"><MessageSquare className="h-4 w-4" />Reply</button>
          <button type="button" className="btn btn-sm btn-outline"><Share2 className="h-4 w-4" />Share</button>
          <button type="button" className="btn btn-sm btn-outline"><Bookmark className="h-4 w-4" />Bookmark</button>
          <button type="button" className="btn btn-sm btn-outline"><Flag className="h-4 w-4" />Report</button>
        </div>
      </section>

      <section className="space-y-3">
        {thread.comments.map((comment) => (
          <article key={comment.id} className="rounded-2xl border border-base-300 bg-base-100 p-4 shadow-sm">
            <div className="flex items-center justify-between gap-2">
              <div className="inline-flex items-center gap-2 text-sm font-semibold">
                <Avatar username={comment.author} />
                {comment.author}
              </div>
              <span className="text-xs text-base-content/60">{new Date(comment.createdAt).toLocaleString('en-US')}</span>
            </div>

            <p className="mt-3 text-sm leading-7 text-base-content/80">{comment.text}</p>

            <div className="mt-3 flex flex-wrap items-center gap-2">
              <button type="button" className="btn btn-xs btn-ghost"><ThumbsUp className="h-3.5 w-3.5" />{comment.votes}</button>
              <button type="button" className="btn btn-xs btn-ghost"><MessageSquare className="h-3.5 w-3.5" />Reply</button>
              {comment.isBestAnswer && (
                <span className="inline-flex items-center gap-1 rounded-full border border-success/40 bg-success/15 px-2 py-1 text-xs font-semibold text-success">
                  <CheckCircle2 className="h-3.5 w-3.5" />Best Answer
                </span>
              )}
            </div>

            {comment.replies?.length > 0 && (
              <div className="mt-3 space-y-2 border-l-2 border-base-300 pl-3">
                {comment.replies.map((nested) => (
                  <div key={nested.id} className="rounded-xl border border-base-300 bg-base-200 p-3">
                    <div className="text-xs font-semibold">{nested.author} • {new Date(nested.createdAt).toLocaleString('en-US')}</div>
                    <p className="mt-1 text-sm text-base-content/80">{nested.text}</p>
                  </div>
                ))}
              </div>
            )}
          </article>
        ))}
      </section>

      <section className="rounded-3xl border border-base-300 bg-base-100 p-5 shadow-lg">
        <h2 className="text-lg font-bold">Add Reply</h2>
        <textarea
          value={reply}
          onChange={(e) => setReply(e.target.value)}
          className="textarea textarea-bordered mt-3 min-h-28 w-full"
          placeholder="Share your approach, hint, or correction..."
        />
        <div className="mt-3 flex justify-end">
          <button type="button" className="btn btn-primary" disabled={!reply.trim()}>Post Reply</button>
        </div>
      </section>
    </div>
  );
};

export default DiscussionThreadPage;

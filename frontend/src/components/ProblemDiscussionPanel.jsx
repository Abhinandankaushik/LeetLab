import { useEffect, useState } from 'react';
import { MessageCircle, Send } from 'lucide-react';
import { useDiscussionStore } from '../store/useDiscussionStore';
import { useAuthStore } from '../store/useAuthStore';

const ProblemDiscussionPanel = ({ problemId, compact = false }) => {
  const { authUser } = useAuthStore();
  const {
    discussions,
    isDiscussionLoading,
    getProblemDiscussions,
    createDiscussion,
    clearDiscussions,
  } = useDiscussionStore();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  useEffect(() => {
    if (!problemId) return;

    getProblemDiscussions(problemId);
    return () => clearDiscussions();
  }, [problemId, getProblemDiscussions, clearDiscussions]);

  const onCreate = async (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    await createDiscussion(problemId, { title, content });
    setTitle('');
    setContent('');
  };

  return (
    <div className={`space-y-4 ${compact ? '' : 'mx-auto max-w-5xl'}`}>
      <form onSubmit={onCreate} className="rounded-2xl border border-base-300 bg-base-100 p-4 shadow-sm">
        <h3 className="mb-3 inline-flex items-center gap-2 text-lg font-bold">
          <MessageCircle className="h-4 w-4 text-primary" />
          Start A Discussion
        </h3>
        <div className="space-y-3">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Thread title"
            className="input input-bordered w-full"
          />
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write your idea, approach, or question..."
            className="textarea textarea-bordered min-h-28 w-full"
          />
          <div className="flex justify-end">
            <button className="btn btn-primary" type="submit" disabled={!authUser}>
              <Send className="h-4 w-4" /> Post
            </button>
          </div>
        </div>
      </form>

      <div className="space-y-3">
        {isDiscussionLoading ? (
          <div className="grid min-h-28 place-items-center">
            <span className="loading loading-spinner text-primary" />
          </div>
        ) : discussions.length > 0 ? (
          discussions.map((item) => (
            <article key={item.id} className="rounded-2xl border border-base-300 bg-base-100 p-4 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h4 className="text-lg font-semibold">{item.title}</h4>
                  <p className="mt-1 text-xs text-base-content/60">
                    by {item.user?.name || 'Anonymous'} on {new Date(item.createdAt).toLocaleString('en-US')}
                  </p>
                </div>
                <span className="badge badge-outline">{item.upvotes} upvotes</span>
              </div>
              <p className="mt-3 whitespace-pre-wrap text-sm text-base-content/80">{item.content}</p>
            </article>
          ))
        ) : (
          <div className="rounded-2xl border border-dashed border-base-300 p-5 text-center text-sm text-base-content/70">
            No discussions yet. Be the first one to post.
          </div>
        )}
      </div>
    </div>
  );
};

export default ProblemDiscussionPanel;

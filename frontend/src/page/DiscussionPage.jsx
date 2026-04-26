import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { MessageCircle, Search, Clock3, Filter } from 'lucide-react';
import { useDiscussionStore } from '../store/useDiscussionStore';
import { forumPosts } from '../lib/communityData';
import TagChip from '../components/ui/TagChip';

const DiscussionPage = () => {
  const { discussionStats, getDiscussionStats, isDiscussionLoading } = useDiscussionStore();
  const [search, setSearch] = useState('');
  const [difficulty, setDifficulty] = useState('ALL');

  useEffect(() => {
    getDiscussionStats();
  }, [getDiscussionStats]);

  const filtered = useMemo(() => {
    return (discussionStats || [])
      .filter((problem) => problem.title.toLowerCase().includes(search.toLowerCase()))
      .filter((problem) => (difficulty === 'ALL' ? true : problem.defficulty === difficulty));
  }, [discussionStats, search, difficulty]);

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      <section className="rounded-3xl border border-base-300 bg-base-100 p-6 shadow-lg">
        <h1 className="text-3xl font-black tracking-tight">Community Discussions</h1>
        <p className="mt-2 text-base-content/70">
          Browse discussion threads by problem and jump straight into problem-specific conversations.
        </p>

        <div className="mt-5 grid gap-3 md:grid-cols-3">
          <label className="input input-bordered flex items-center gap-2 md:col-span-2">
            <Search className="h-4 w-4 opacity-70" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by problem title"
              className="grow"
            />
          </label>
          <label className="select select-bordered flex items-center gap-2">
            <Filter className="h-4 w-4 opacity-70" />
            <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
              <option value="ALL">All Difficulty</option>
              <option value="EASY">Easy</option>
              <option value="MEDIUM">Medium</option>
              <option value="HARD">Hard</option>
            </select>
          </label>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {isDiscussionLoading ? (
          <div className="col-span-full grid min-h-60 place-items-center rounded-3xl border border-base-300 bg-base-100">
            <span className="loading loading-dots loading-lg text-primary" />
          </div>
        ) : filtered.length > 0 ? (
          filtered.map((problem) => (
            <Link
              to={`/discussion/problem/${problem.id}`}
              key={problem.id}
              className="group rounded-3xl border border-base-300 bg-base-100 p-5 shadow transition hover:-translate-y-0.5 hover:shadow-xl"
            >
              <div className="flex items-start justify-between gap-3">
                <h3 className="text-lg font-bold transition group-hover:text-primary">{problem.title}</h3>
                <span className="badge badge-outline">{problem.defficulty}</span>
              </div>
              <p className="mt-2 line-clamp-3 text-sm text-base-content/70">{problem.description}</p>
              <div className="mt-4 flex items-center justify-between text-xs text-base-content/60">
                <span className="inline-flex items-center gap-1">
                  <MessageCircle className="h-4 w-4" />
                  {problem._count?.discussions ?? 0} threads
                </span>
                <span className="inline-flex items-center gap-1">
                  <Clock3 className="h-4 w-4" />
                  {new Date(problem.createdAt).toLocaleDateString('en-US')}
                </span>
              </div>
            </Link>
          ))
        ) : (
          <div className="col-span-full rounded-3xl border border-base-300 bg-base-100 p-10 text-center text-base-content/70">
            No discussions found for this filter.
          </div>
        )}
      </section>

      <section className="rounded-3xl border border-base-300 bg-base-100 p-6 shadow-lg">
        <h2 className="text-2xl font-black tracking-tight">Forum Threads</h2>
        <p className="mt-1 text-sm text-base-content/70">Questions, editorials, and interview experiences from the community.</p>

        <div className="mt-4 space-y-3">
          {forumPosts.map((post) => (
            <Link
              to={`/discussion/thread/${post.id}`}
              key={post.id}
              className="block rounded-2xl border border-base-300 bg-base-200 p-4 transition hover:border-primary/40 hover:bg-base-300"
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <h3 className="text-lg font-bold hover:text-primary">{post.title}</h3>
                <span className="badge badge-outline">{post.type}</span>
              </div>
              <p className="mt-2 line-clamp-2 text-sm text-base-content/70">{post.content}</p>

              <div className="mt-3 flex flex-wrap gap-2">
                {post.tags.map((tag) => (
                  <TagChip key={`${post.id}-${tag}`} label={tag} />
                ))}
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-base-content/60">
                <span>{post.authorName}</span>
                <span>{new Date(post.createdAt).toLocaleDateString('en-US')}</span>
                <span>{post.votes} votes</span>
                <span>{post.replies} replies</span>
                <span>{post.views} views</span>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
};

export default DiscussionPage;

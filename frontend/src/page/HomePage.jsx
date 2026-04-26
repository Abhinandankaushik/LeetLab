import { Link } from 'react-router-dom';
import { Trophy, BookOpenText, LibraryBig, MessageCircle, ArrowRight, Sparkles, ShieldCheck } from 'lucide-react';

const HomePage = () => {
  return (
    <div className="mx-auto w-full max-w-7xl space-y-8">
      <section className="relative overflow-hidden rounded-3xl border border-base-300 bg-base-100 px-6 py-12 shadow-xl sm:px-10">
        <div className="pointer-events-none absolute -left-10 -top-10 h-40 w-40 rounded-full bg-primary/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-8 right-0 h-44 w-44 rounded-full bg-secondary/20 blur-3xl" />

        <div className="relative z-10 max-w-3xl">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/25 bg-base-100 px-4 py-2 text-sm font-semibold text-primary">
            <Sparkles className="h-4 w-4" /> Production-grade coding workspace
          </div>
          <h1 className="text-4xl font-black leading-tight tracking-tight sm:text-6xl">
            Practice, Discuss, Track, and Build with LeetLab
          </h1>
          <p className="mt-4 text-base leading-7 text-base-content/70 sm:text-lg">
            Solve algorithmic problems, explore community threads, save custom playlists, and deep dive into detailed submission summaries.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/problems" className="btn btn-primary">
              Start Solving <ArrowRight className="h-4 w-4" />
            </Link>
            <Link to="/discussion" className="btn btn-outline">
              Explore Discussion
            </Link>
          </div>
        </div>
      </section>

      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-3xl border border-base-300 bg-base-100 p-5 shadow">
          <Trophy className="h-6 w-6 text-primary" />
          <h2 className="mt-3 text-lg font-bold">Problem Solving</h2>
          <p className="mt-1 text-sm text-base-content/70">A focused list of problems with filters, tags, and progress tracking.</p>
        </div>
        <div className="rounded-3xl border border-base-300 bg-base-100 p-5 shadow">
          <MessageCircle className="h-6 w-6 text-primary" />
          <h2 className="mt-3 text-lg font-bold">Threaded Discussions</h2>
          <p className="mt-1 text-sm text-base-content/70">Every problem has dedicated discussion threads to ask, share, and learn.</p>
        </div>
        <div className="rounded-3xl border border-base-300 bg-base-100 p-5 shadow">
          <LibraryBig className="h-6 w-6 text-primary" />
          <h2 className="mt-3 text-lg font-bold">Library & Playlists</h2>
          <p className="mt-1 text-sm text-base-content/70">Organize preparation with playlists and bookmark key challenges.</p>
        </div>
        <div className="rounded-3xl border border-base-300 bg-base-100 p-5 shadow">
          <BookOpenText className="h-6 w-6 text-primary" />
          <h2 className="mt-3 text-lg font-bold">Submission Analytics</h2>
          <p className="mt-1 text-sm text-base-content/70">Detailed testcase-level breakdowns and execution summary after every run.</p>
        </div>
      </section>

      <section className="rounded-3xl border border-base-300 bg-base-100 p-6 shadow-lg">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-black tracking-tight">Platform Flow</h2>
            <p className="mt-1 text-base-content/70">
              A simple path to stay consistent like top coding platforms.
            </p>
          </div>
          <span className="inline-flex items-center gap-2 rounded-full bg-success/15 px-4 py-2 text-sm font-semibold text-success">
            <ShieldCheck className="h-4 w-4" /> Role-based secure routes
          </span>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-4">
          <Link to="/problems" className="rounded-2xl border border-base-300 bg-base-200 p-4 transition hover:bg-base-300">
            <p className="text-xs text-base-content/60">Step 1</p>
            <p className="text-base font-bold">Pick A Problem</p>
          </Link>
          <div className="rounded-2xl border border-base-300 bg-base-200 p-4 opacity-80">
            <p className="text-xs text-base-content/60">Step 2</p>
            <p className="text-base font-bold">Write & Submit</p>
          </div>
          <Link to="/discussion" className="rounded-2xl border border-base-300 bg-base-200 p-4 transition hover:bg-base-300">
            <p className="text-xs text-base-content/60">Step 3</p>
            <p className="text-base font-bold">Discuss Approach</p>
          </Link>
          <Link to="/library" className="rounded-2xl border border-base-300 bg-base-200 p-4 transition hover:bg-base-300">
            <p className="text-xs text-base-content/60">Step 4</p>
            <p className="text-base font-bold">Save In Library</p>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default HomePage;

import { useMemo, useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Trophy, Users, Timer, Code2, Terminal, BarChart3 } from 'lucide-react';
import { Editor } from '@monaco-editor/react';
import { contestData } from '../lib/contestData';
import DifficultyBadge from '../components/ui/DifficultyBadge';
import VerdictBadge from '../components/ui/VerdictBadge';

const verdictByProblem = {
  A: 'accepted',
  B: 'accepted',
  C: 'wrong_answer',
  D: 'tle',
};

const formatRemaining = (targetTime) => {
  const diff = new Date(targetTime).getTime() - Date.now();
  if (diff <= 0) return '00:00:00';

  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
};

const ContestDetailPage = () => {
  const { id } = useParams();
  const [tick, setTick] = useState(Date.now());
  const [activeProblemCode, setActiveProblemCode] = useState('A');
  const [code, setCode] = useState(`function solve(input) {\n  // your contest solution\n  return input;\n}`);

  useEffect(() => {
    const interval = window.setInterval(() => setTick(Date.now()), 1000);
    return () => window.clearInterval(interval);
  }, []);

  const contest = useMemo(() => {
    if (id === contestData.live.id) return contestData.live;
    return {
      ...contestData.live,
      id,
      name: `Contest ${id}`,
    };
  }, [id]);

  const activeProblem = contest.problems.find((problem) => problem.code === activeProblemCode) || contest.problems[0];

  return (
    <div className="mx-auto w-full max-w-[1500px] space-y-4">
      <section className="sticky top-2 z-40 rounded-2xl border border-primary/30 bg-base-100/95 p-4 shadow-lg backdrop-blur">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <Link to="/contest" className="mb-2 inline-flex items-center gap-1 text-sm text-primary hover:underline">
              <ArrowLeft className="h-4 w-4" /> Back to contests
            </Link>
            <h1 className="text-2xl font-black tracking-tight">{contest.name}</h1>
            <p className="text-sm text-base-content/65">Live ranked round • Stay sharp and submit carefully</p>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="rounded-xl border border-base-300 bg-base-200 px-4 py-2">
              <p className="text-xs text-base-content/60">Time Left</p>
              <p className="font-code text-lg font-bold text-error">{formatRemaining(contest.endTime)}</p>
            </div>
            <div className="rounded-xl border border-base-300 bg-base-200 px-4 py-2">
              <p className="text-xs text-base-content/60">My Rank</p>
              <p className="text-lg font-bold">#247</p>
            </div>
            <div className="rounded-xl border border-base-300 bg-base-200 px-4 py-2">
              <p className="text-xs text-base-content/60">Participants</p>
              <p className="text-lg font-bold">{contest.participants.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 xl:grid-cols-[280px_1fr_280px]">
        <aside className="rounded-2xl border border-base-300 bg-base-100 p-4 shadow">
          <h2 className="text-lg font-bold">Problems</h2>
          <div className="mt-4 space-y-2">
            {contest.problems.map((problem) => (
              <button
                key={problem.code}
                type="button"
                onClick={() => setActiveProblemCode(problem.code)}
                className={`w-full rounded-xl border px-3 py-2 text-left transition ${activeProblemCode === problem.code ? 'border-primary bg-primary/10' : 'border-base-300 bg-base-200 hover:bg-base-300'}`}
              >
                <p className="font-semibold">{problem.code}. {problem.title}</p>
                <div className="mt-2 flex items-center justify-between text-xs text-base-content/70">
                  <span>{problem.points} pts</span>
                  <VerdictBadge status={verdictByProblem[problem.code]} />
                </div>
              </button>
            ))}
          </div>
          <div className="mt-4 rounded-xl border border-base-300 bg-base-200 p-3">
            <p className="text-xs text-base-content/65">My Score</p>
            <p className="text-xl font-black">1500 / 5500</p>
          </div>
        </aside>

        <main className="space-y-4">
          <article className="rounded-2xl border border-base-300 bg-base-100 p-4 shadow">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-xl font-black">{activeProblem.code}. {activeProblem.title}</h3>
                <p className="text-sm text-base-content/70">Solve with optimal complexity and avoid penalty.</p>
              </div>
              <DifficultyBadge level={activeProblem.points <= 800 ? 'easy' : activeProblem.points <= 1500 ? 'medium' : 'hard'} />
            </div>
          </article>

          <article className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <div className="rounded-2xl border border-base-300 bg-base-100 p-4 shadow">
              <div className="mb-3 flex items-center gap-2 font-semibold"><Code2 className="h-4 w-4" />Problem Statement</div>
              <p className="text-sm leading-7 text-base-content/80">
                You are given multiple operations over an integer sequence. Return the minimum number of edits required to satisfy monotonic constraints after each update.
              </p>
              <div className="mt-4 rounded-xl border border-base-300 bg-base-200 p-3 text-sm">
                <p className="font-semibold">Input</p>
                <p className="font-code">n m\narray elements\nqueries</p>
              </div>
              <div className="mt-3 rounded-xl border border-base-300 bg-base-200 p-3 text-sm">
                <p className="font-semibold">Output</p>
                <p className="font-code">minimum edits per query</p>
              </div>
            </div>

            <div className="rounded-2xl border border-base-300 bg-base-100 p-0 shadow">
              <div className="flex items-center justify-between border-b border-base-300 px-4 py-3">
                <span className="inline-flex items-center gap-2 text-sm font-semibold"><Terminal className="h-4 w-4" />Contest Editor</span>
                <button type="button" className="btn btn-primary btn-sm">Submit</button>
              </div>
              <Editor
                height="470px"
                language="javascript"
                theme="vs-dark"
                value={code}
                onChange={(next) => setCode(next || '')}
                options={{
                  minimap: { enabled: false },
                  fontSize: 14,
                  automaticLayout: true,
                }}
              />
            </div>
          </article>
        </main>

        <aside className="rounded-2xl border border-base-300 bg-base-100 p-4 shadow">
          <h2 className="inline-flex items-center gap-2 text-lg font-bold"><BarChart3 className="h-4 w-4" />Live Leaderboard</h2>
          <div className="mt-4 space-y-2">
            {contest.leaderboard.map((entry) => (
              <div key={entry.rank} className={`rounded-xl border px-3 py-2 ${entry.isMe ? 'border-primary bg-primary/10' : 'border-base-300 bg-base-200'}`}>
                <div className="flex items-center justify-between text-sm font-semibold">
                  <span>#{entry.rank} {entry.username}</span>
                  <span>{entry.score}</span>
                </div>
                <div className="mt-1 inline-flex items-center gap-1 text-xs text-base-content/65">
                  <Users className="h-3 w-3" /> penalty {entry.penalty}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 rounded-xl border border-base-300 bg-base-200 p-3 text-xs text-base-content/70">
            <p className="inline-flex items-center gap-1"><Timer className="h-3.5 w-3.5" /> refreshes every 30s</p>
            <p className="mt-1 inline-flex items-center gap-1"><Trophy className="h-3.5 w-3.5" /> careful submissions reduce penalty</p>
          </div>
        </aside>
      </section>
    </div>
  );
};

export default ContestDetailPage;

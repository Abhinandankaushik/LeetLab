import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Clock3, Users, CircleDot, BellRing, Timer, Trophy, ChevronRight } from 'lucide-react';
import { contestData } from '../lib/contestData';

const formatRemaining = (targetTime) => {
  const diff = new Date(targetTime).getTime() - Date.now();
  if (diff <= 0) return '00:00:00';

  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
};

const typeStyles = {
  div1: 'border-[#FF475744] text-[#FF4757] bg-[#FF47571A]',
  div2: 'border-[#6C63FF44] text-[#6C63FF] bg-[#6C63FF1A]',
  weekly: 'border-[#00D4AA44] text-[#00D4AA] bg-[#00D4AA1A]',
  monthly: 'border-[#FFB80044] text-[#FFB800] bg-[#FFB8001A]',
  special: 'border-[#03A89E44] text-[#03A89E] bg-[#03A89E1A]',
};

const ContestPage = () => {
  const [ticker, setTicker] = useState(Date.now());

  useEffect(() => {
    const interval = window.setInterval(() => setTicker(Date.now()), 1000);
    return () => window.clearInterval(interval);
  }, []);

  const liveContest = contestData.live;

  const upcomingWithCountdown = useMemo(() => {
    return contestData.upcoming.map((contest) => ({
      ...contest,
      countdown: formatRemaining(contest.startTime),
    }));
  }, [ticker]);

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      {liveContest && (
        <section className="relative overflow-hidden rounded-3xl border border-primary/40 bg-gradient-to-r from-primary/20 via-base-100 to-secondary/20 p-5 shadow-xl">
          <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-primary/20 blur-3xl" />
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-error/40 bg-error/10 px-3 py-1 text-xs font-semibold text-error">
                <CircleDot className="h-3.5 w-3.5 animate-pulse" /> LIVE
              </span>
              <h1 className="mt-3 text-2xl font-black tracking-tight sm:text-3xl">{liveContest.name}</h1>
              <p className="mt-1 text-sm text-base-content/70">Participants: {liveContest.participants.toLocaleString()} • Rated range {liveContest.ratingRange}</p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <div className="rounded-xl border border-base-300 bg-base-100/90 px-4 py-2 text-center">
                <p className="text-xs text-base-content/60">Ends In</p>
                <p className="font-code text-xl font-semibold">{formatRemaining(liveContest.endTime)}</p>
              </div>
              <Link to={`/contest/${liveContest.id}`} className="btn ll-btn-primary border-0 text-white">
                Join Now <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>
      )}

      <section className="rounded-3xl border border-base-300 bg-base-100 p-6 shadow-lg">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black tracking-tight">Upcoming Contests</h2>
            <p className="text-sm text-base-content/70">Register early and lock your challenge window.</p>
          </div>
          <span className="hidden items-center gap-2 rounded-full border border-base-300 bg-base-200 px-3 py-1 text-xs font-semibold text-base-content/70 md:inline-flex">
            <Timer className="h-3.5 w-3.5" /> Live countdown enabled
          </span>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {upcomingWithCountdown.map((contest) => (
            <article key={contest.id} className="rounded-2xl border border-base-300 bg-base-200 p-5 shadow transition hover:-translate-y-1 hover:shadow-xl">
              <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${typeStyles[contest.type] || typeStyles.special}`}>
                {contest.type.toUpperCase()}
              </span>
              <h3 className="mt-3 text-xl font-bold">{contest.name}</h3>
              <div className="mt-4 space-y-2 text-sm text-base-content/75">
                <p className="inline-flex items-center gap-2"><Clock3 className="h-4 w-4" /> {new Date(contest.startTime).toLocaleString()}</p>
                <p className="inline-flex items-center gap-2"><Users className="h-4 w-4" /> {contest.participants.toLocaleString()} registered</p>
                <p className="inline-flex items-center gap-2"><Trophy className="h-4 w-4" /> Rating range: {contest.ratingRange}</p>
              </div>
              <div className="mt-4 rounded-xl border border-base-300 bg-base-100 px-3 py-2 text-sm">
                <p className="text-xs text-base-content/60">Starts in</p>
                <p className="font-code text-lg font-semibold">{contest.countdown}</p>
              </div>
              <div className="mt-4 flex items-center gap-2">
                <button type="button" className="btn btn-primary btn-sm flex-1">Register</button>
                <button type="button" className="btn btn-outline btn-sm flex-1"><BellRing className="h-4 w-4" />Remind</button>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="rounded-3xl border border-base-300 bg-base-100 p-6 shadow-lg">
        <h2 className="mb-4 text-2xl font-black tracking-tight">Past Contests</h2>
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>#</th>
                <th>Name</th>
                <th>Date</th>
                <th>Duration</th>
                <th>My Rank</th>
                <th>Participants</th>
                <th>Editorial</th>
              </tr>
            </thead>
            <tbody>
              {contestData.past.map((contest, index) => (
                <tr key={contest.id} className="hover">
                  <td>{index + 1}</td>
                  <td>{contest.name}</td>
                  <td>{contest.date}</td>
                  <td>{contest.duration}</td>
                  <td>#{contest.myRank}</td>
                  <td>{contest.participants.toLocaleString()}</td>
                  <td>
                    {contest.editorial ? (
                      <span className="badge badge-success badge-outline">Available</span>
                    ) : (
                      <span className="badge badge-outline">Pending</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default ContestPage;

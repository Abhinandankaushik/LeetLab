import { Link } from 'react-router-dom';
import { Flame, TrendingUp, CalendarClock, Target, ArrowRight } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { dashboardData } from '../lib/communityData';
import VerdictBadge from '../components/ui/VerdictBadge';
import DifficultyBadge from '../components/ui/DifficultyBadge';

const DashboardPage = () => {
  const { authUser } = useAuthStore();

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      <section className="rounded-3xl border border-base-300 bg-base-100 p-6 shadow-lg">
        <h1 className="text-3xl font-black tracking-tight">Good morning, {authUser?.name || 'Coder'}!</h1>
        <p className="mt-2 text-base-content/70">Stay in rhythm and move one step closer to your target role.</p>
        <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-warning/40 bg-warning/15 px-4 py-1.5 text-sm font-semibold text-warning">
          <Flame className="h-4 w-4" /> {dashboardData.streak} day streak
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-base-300 bg-base-100 p-4">
          <p className="text-xs text-base-content/60">Today Solved</p>
          <p className="mt-1 text-2xl font-black">{dashboardData.todaySolved}</p>
        </div>
        <div className="rounded-2xl border border-base-300 bg-base-100 p-4">
          <p className="text-xs text-base-content/60">Weekly Goal</p>
          <p className="mt-1 text-2xl font-black">{dashboardData.weeklyDone}/{dashboardData.weeklyGoal}</p>
        </div>
        <div className="rounded-2xl border border-base-300 bg-base-100 p-4">
          <p className="text-xs text-base-content/60">Streak</p>
          <p className="mt-1 text-2xl font-black">{dashboardData.streak} days</p>
        </div>
        <div className="rounded-2xl border border-base-300 bg-base-100 p-4">
          <p className="text-xs text-base-content/60">Rank Change</p>
          <p className="mt-1 inline-flex items-center gap-1 text-2xl font-black text-success"><TrendingUp className="h-5 w-5" />{dashboardData.rankChange}</p>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-3xl border border-base-300 bg-base-100 p-5 lg:col-span-2">
          <h2 className="text-xl font-black">Recent Submissions</h2>
          <div className="mt-4 space-y-3">
            {dashboardData.recentSubmissions.map((item) => (
              <div key={item.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-base-300 bg-base-200 p-3">
                <div>
                  <p className="font-semibold">{item.title}</p>
                  <p className="text-xs text-base-content/60">{item.when}</p>
                </div>
                <VerdictBadge status={item.verdict} />
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-base-300 bg-base-100 p-5">
          <h2 className="text-xl font-black">Upcoming Contests</h2>
          <div className="mt-4 space-y-3">
            {dashboardData.upcomingContests.map((contest) => (
              <Link key={contest.id} to={`/contest/${contest.id}`} className="block rounded-xl border border-base-300 bg-base-200 p-3 transition hover:bg-base-300">
                <p className="font-semibold">{contest.name}</p>
                <p className="mt-1 inline-flex items-center gap-1 text-xs text-base-content/65"><CalendarClock className="h-3.5 w-3.5" />{contest.startsIn}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-base-300 bg-base-100 p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="inline-flex items-center gap-2 text-xl font-black"><Target className="h-5 w-5" />Recommended Problems</h2>
          <Link to="/problems" className="btn btn-sm btn-outline">Open Problem Set <ArrowRight className="h-4 w-4" /></Link>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {dashboardData.recommendations.map((problem) => (
            <article key={problem.id} className="rounded-xl border border-base-300 bg-base-200 p-3">
              <p className="text-sm font-semibold">{problem.title}</p>
              <p className="mt-1 text-xs text-base-content/65">{problem.topic}</p>
              <div className="mt-2">
                <DifficultyBadge level={problem.difficulty} />
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
};

export default DashboardPage;

import { useMemo, useState } from 'react';
import Avatar from '../components/ui/Avatar';
import RatingBadge from '../components/ui/RatingBadge';
import { leaderboardUsers } from '../lib/communityData';

const filters = ['Global', 'Country', 'Institution', 'Friends'];
const periods = ['All Time', 'This Month', 'This Week'];

const LeaderboardPage = () => {
  const [scope, setScope] = useState('Global');
  const [period, setPeriod] = useState('All Time');

  const podium = useMemo(() => leaderboardUsers.slice(0, 3), []);

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      <section className="rounded-3xl border border-base-300 bg-base-100 p-6 shadow-lg">
        <h1 className="text-3xl font-black tracking-tight">Global Rankings</h1>
        <p className="mt-2 text-sm text-base-content/70">Track top performers, rating momentum, and your standing.</p>

        <div className="mt-5 flex flex-wrap gap-2">
          {filters.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setScope(item)}
              className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${scope === item ? 'border-primary bg-primary/15 text-primary' : 'border-base-300 bg-base-200 text-base-content/70'}`}
            >
              {item}
            </button>
          ))}
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          {periods.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setPeriod(item)}
              className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${period === item ? 'border-secondary bg-secondary/15 text-secondary' : 'border-base-300 bg-base-200 text-base-content/70'}`}
            >
              {item}
            </button>
          ))}
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="order-2 rounded-3xl border border-base-300 bg-base-100 p-5 text-center shadow md:order-1">
          <p className="text-xl">🥈</p>
          <Avatar username={podium[1].username} size="lg" className="mt-2 justify-center" />
          <p className="mt-2 text-lg font-bold">{podium[1].username}</p>
          <p className="text-sm text-base-content/65">rating {podium[1].rating}</p>
        </div>
        <div className="order-1 rounded-3xl border border-warning/50 bg-base-100 p-5 text-center shadow-xl md:order-2 md:-mt-4">
          <p className="text-2xl">🥇</p>
          <Avatar username={podium[0].username} size="xl" className="mt-2 justify-center" />
          <p className="mt-2 text-xl font-black">{podium[0].username}</p>
          <p className="text-sm text-base-content/65">rating {podium[0].rating}</p>
        </div>
        <div className="order-3 rounded-3xl border border-base-300 bg-base-100 p-5 text-center shadow md:order-3">
          <p className="text-xl">🥉</p>
          <Avatar username={podium[2].username} size="lg" className="mt-2 justify-center" />
          <p className="mt-2 text-lg font-bold">{podium[2].username}</p>
          <p className="text-sm text-base-content/65">rating {podium[2].rating}</p>
        </div>
      </section>

      <section className="rounded-3xl border border-base-300 bg-base-100 p-4 shadow-lg">
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>Rank</th>
                <th>User</th>
                <th>Rating</th>
                <th>Solved</th>
                <th>Contests</th>
                <th>Country</th>
              </tr>
            </thead>
            <tbody>
              {leaderboardUsers.map((user) => (
                <tr key={user.rank} className={user.isMe ? 'bg-primary/10' : 'hover'}>
                  <td>
                    <span className={`font-semibold ${user.rank <= 3 ? 'text-warning' : ''}`}>#{user.rank}</span>
                  </td>
                  <td>
                    <div className="flex items-center gap-3">
                      <Avatar username={user.username} />
                      <span className="font-semibold">{user.username}</span>
                    </div>
                  </td>
                  <td><RatingBadge rating={user.rating} /></td>
                  <td>{user.solved}</td>
                  <td>{user.contests}</td>
                  <td>{user.country}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default LeaderboardPage;

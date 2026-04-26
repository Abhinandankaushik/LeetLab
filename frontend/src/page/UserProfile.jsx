import { useState, useEffect, useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { axiosInstance } from '../lib/axios';
import { format } from 'date-fns';
import {
  FolderOpen,
  PlaySquare,
  Mail,
  Shield,
  CalendarDays,
  Trophy,
  Activity,
  ArrowUpRight,
  BookOpen,
  CheckCircle2,
  Target,
} from 'lucide-react';

import Progressbar from '../components/Progressbar';
import TotalProblemTrack from '../components/TotalProblemTrack';

const UserProfile = () => {
  const { id } = useParams();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activePlaylistId, setActivePlaylistId] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axiosInstance.get(`/profile/${id}`);
        setProfileData(response.data);
      } catch {
        setError('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [id]);

  const activePlaylist = useMemo(
    () => profileData?.playlists?.find((playlist) => playlist.id === activePlaylistId) ?? null,
    [profileData?.playlists, activePlaylistId]
  );

  if (loading) {
    return (
      <div className="grid min-h-[calc(100vh-8rem)] place-items-center">
        <span className="loading loading-dots loading-lg text-primary" />
      </div>
    );
  }

  if (error || !profileData) {
    return (
      <div className="grid min-h-[calc(100vh-8rem)] place-items-center">
        <div className="rounded-2xl border border-base-300 bg-base-100 px-8 py-6 text-error">{error || 'Profile not found'}</div>
      </div>
    );
  }

  const {
    user,
    stats,
    TotalProblemSolvedByUser,
    TotalProblemPresentInPlatform,
    recentSubmissions,
    playlists,
    createdProblemsCount,
  } = profileData;

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      <section className="rounded-3xl border border-base-300 bg-base-100 p-6 shadow-lg">
        <div className="flex flex-col items-start gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            <div className="h-20 w-20 overflow-hidden rounded-2xl border border-primary/30 bg-base-200">
              <img
                src={user.image || `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(user.name || user.email)}`}
                alt={user.name}
                className="h-full w-full object-cover"
              />
            </div>
            <div>
              <h1 className="text-3xl font-black tracking-tight">{user.name}</h1>
              <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-base-content/70">
                <span className="inline-flex items-center gap-1 rounded-full bg-base-200 px-3 py-1"><Mail className="h-4 w-4" />{user.email}</span>
                <span className="inline-flex items-center gap-1 rounded-full bg-base-200 px-3 py-1"><Shield className="h-4 w-4" />{user.role}</span>
                <span className="inline-flex items-center gap-1 rounded-full bg-base-200 px-3 py-1"><CalendarDays className="h-4 w-4" />Joined {format(new Date(user.createdAt), 'MMM dd, yyyy')}</span>
              </div>
            </div>
          </div>

          <div className="grid w-full gap-3 sm:grid-cols-3 lg:w-auto">
            <div className="rounded-2xl border border-base-300 bg-base-200 px-4 py-3">
              <p className="text-xs text-base-content/60">Solved</p>
              <p className="text-2xl font-black text-primary">{stats.totalSolved}</p>
            </div>
            <div className="rounded-2xl border border-base-300 bg-base-200 px-4 py-3">
              <p className="text-xs text-base-content/60">Submissions</p>
              <p className="text-2xl font-black text-secondary">{stats.totalSubmissions}</p>
            </div>
            <div className="rounded-2xl border border-base-300 bg-base-200 px-4 py-3">
              <p className="text-xs text-base-content/60">Acceptance</p>
              <p className="text-2xl font-black text-success">{stats.acceptanceRate}%</p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-3xl border border-base-300 bg-base-100 p-5 shadow">
          <div className="mb-4 flex items-center gap-2">
            <Trophy className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-bold">Progress Overview</h2>
          </div>
          <div className="grid gap-5 md:grid-cols-2">
            <Progressbar value={stats.totalSolved} totalProblemsCount={stats.totalProblems} />
            <TotalProblemTrack
              TotalProblemSolvedByUser={TotalProblemSolvedByUser}
              TotalProblemPresentInPlatform={TotalProblemPresentInPlatform}
            />
          </div>
        </div>

        <div className="rounded-3xl border border-base-300 bg-base-100 p-5 shadow">
          <div className="mb-4 flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-bold">Highlights</h2>
          </div>
          <div className="space-y-3 text-sm">
            <div className="rounded-xl border border-base-300 bg-base-200 p-3">
              <p className="text-base-content/70">Accepted Submissions</p>
              <p className="text-lg font-bold text-success">{stats.acceptedSubmissions}</p>
            </div>
            <div className="rounded-xl border border-base-300 bg-base-200 p-3">
              <p className="text-base-content/70">Problems Created</p>
              <p className="text-lg font-bold text-secondary">{createdProblemsCount}</p>
            </div>
            <Link to="/problems" className="flex items-center justify-between rounded-xl border border-base-300 bg-base-200 p-3 transition hover:bg-base-300">
              <span className="inline-flex items-center gap-2"><BookOpen className="h-4 w-4" />Solve More Problems</span>
              <ArrowUpRight className="h-4 w-4" />
            </Link>
            <Link to="/discussion" className="flex items-center justify-between rounded-xl border border-base-300 bg-base-200 p-3 transition hover:bg-base-300">
              <span className="inline-flex items-center gap-2"><Target className="h-4 w-4" />Join Discussions</span>
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-3xl border border-base-300 bg-base-100 p-5 shadow">
          <div className="mb-4 flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-bold">Recent Submissions</h2>
          </div>

          {recentSubmissions?.length > 0 ? (
            <div className="space-y-2">
              {recentSubmissions.map((sub) => (
                <div key={sub.id} className="rounded-xl border border-base-300 px-4 py-3 transition hover:bg-base-200">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <Link to={`/problem/${sub.problem.id}`} className="font-semibold text-primary hover:underline">
                        {sub.problem.title}
                      </Link>
                      <p className="text-xs text-base-content/65">{format(new Date(sub.createdAt), 'MMM dd, yyyy · HH:mm')}</p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <span className="badge badge-outline">{sub.language}</span>
                      <span className={`badge ${sub.status === 'Accepted' ? 'badge-success' : 'badge-error'}`}>
                        {sub.status}
                      </span>
                      <Link to={`/submission/${sub.id}`} className="btn btn-ghost btn-xs">
                        View Details <ArrowUpRight className="h-3 w-3" />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-base-300 p-6 text-center text-sm text-base-content/70">
              No recent submissions.
            </div>
          )}
        </div>

        <div className="rounded-3xl border border-base-300 bg-base-100 p-5 shadow">
          <div className="mb-4 flex items-center gap-2">
            <FolderOpen className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-bold">Playlists</h2>
          </div>

          <div className="space-y-2">
            {playlists?.length > 0 ? (
              playlists.map((playlist) => (
                <button
                  onClick={() => setActivePlaylistId(playlist.id)}
                  key={playlist.id}
                  className={`w-full rounded-xl border p-3 text-left transition hover:bg-base-200 ${activePlaylistId === playlist.id ? 'border-primary bg-base-200' : 'border-base-300'}`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-semibold text-primary">{playlist.name}</h3>
                    <span className="text-xs text-base-content/70">{playlist._count?.problems ?? 0} problems</span>
                  </div>
                  <p className="mt-1 line-clamp-2 text-xs text-base-content/65">{playlist.description || 'No description provided.'}</p>
                </button>
              ))
            ) : (
              <div className="rounded-xl border border-dashed border-base-300 p-4 text-sm text-base-content/70">
                No playlists available.
              </div>
            )}
          </div>

          {activePlaylist && (
            <div className="mt-4 rounded-xl border border-base-300 bg-base-200 p-3 text-sm">
              <p className="font-semibold">{activePlaylist.name}</p>
              <p className="mt-1 text-base-content/70">{activePlaylist.description || 'No description provided.'}</p>
              <Link to={`/library?playlist=${activePlaylist.id}`} className="btn btn-primary btn-sm mt-3">
                Open in Library
              </Link>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default UserProfile;

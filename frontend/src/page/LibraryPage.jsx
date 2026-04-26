import { useEffect, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { BookMarked, ListVideo, Trash2, ArrowRight, Bookmark } from 'lucide-react';
import { usePlaylistStore } from '../store/usePlaylistStore';
import { useProblemStore } from '../store/useProblemStore';

const LibraryPage = () => {
  const [searchParams] = useSearchParams();
  const playlistIdFromQuery = searchParams.get('playlist');

  const {
    playlists,
    currentPlaylist,
    isLoading,
    getAllPlaylists,
    getPlaylistDetails,
    deletePlaylist,
  } = usePlaylistStore();

  const { problems, getAllProblem } = useProblemStore();

  useEffect(() => {
    getAllPlaylists();
  }, [getAllPlaylists]);

  useEffect(() => {
    getAllProblem();
  }, [getAllProblem]);

  useEffect(() => {
    if (playlistIdFromQuery) {
      getPlaylistDetails(playlistIdFromQuery);
    }
  }, [playlistIdFromQuery, getPlaylistDetails]);

  const bookmarkedProblems = useMemo(() => {
    const savedIds = JSON.parse(localStorage.getItem('leetlab-bookmarks') || '[]');
    return (problems || []).filter((p) => savedIds.includes(p.id));
  }, [problems]);

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      <section className="rounded-3xl border border-base-300 bg-base-100 p-6 shadow-lg">
        <h1 className="text-3xl font-black tracking-tight">Your Library</h1>
        <p className="mt-2 text-base-content/70">
          Manage your playlists and quickly jump back to saved problems.
        </p>
      </section>

      <section className="rounded-3xl border border-base-300 bg-base-100 p-5 shadow">
        <h2 className="mb-4 inline-flex items-center gap-2 text-xl font-bold"><Bookmark className="h-5 w-5 text-primary" />Bookmarks</h2>
        {bookmarkedProblems.length > 0 ? (
          <div className="grid gap-3 md:grid-cols-2">
            {bookmarkedProblems.map((problem) => (
              <Link key={problem.id} to={`/problem/${problem.id}`} className="rounded-xl border border-base-300 bg-base-200 p-3 transition hover:bg-base-300">
                <p className="font-semibold text-primary">{problem.title}</p>
                <p className="mt-1 text-xs text-base-content/65">{problem.defficulty}</p>
              </Link>
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-base-300 p-4 text-sm text-base-content/70">
            No bookmarks yet. Save problems from problem pages.
          </div>
        )}
      </section>

      <div className="grid gap-5 lg:grid-cols-2">
        <section className="rounded-3xl border border-base-300 bg-base-100 p-5 shadow">
          <h2 className="mb-4 text-xl font-bold">Playlists</h2>
          <div className="space-y-3">
            {isLoading ? (
              <div className="grid min-h-40 place-items-center">
                <span className="loading loading-spinner text-primary" />
              </div>
            ) : playlists?.length > 0 ? (
              playlists.map((playlist) => (
                <div key={playlist.id} className="rounded-2xl border border-base-300 p-4">
                  <div className="flex items-start justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => getPlaylistDetails(playlist.id)}
                      className="text-left"
                    >
                      <h3 className="text-lg font-semibold text-primary">{playlist.name}</h3>
                      <p className="text-sm text-base-content/70">
                        {playlist.description || 'No description'}
                      </p>
                    </button>
                    <button
                      className="btn btn-ghost btn-sm"
                      type="button"
                      onClick={() => deletePlaylist(playlist.id)}
                    >
                      <Trash2 className="h-4 w-4 text-error" />
                    </button>
                  </div>
                  <div className="mt-3 flex items-center gap-2 text-xs text-base-content/60">
                    <BookMarked className="h-4 w-4" />
                    {playlist._count?.problems ?? 0} saved problems
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-base-300 p-6 text-center text-base-content/70">
                No playlists found. Create one from the Problems page.
              </div>
            )}
          </div>
        </section>

        <section className="rounded-3xl border border-base-300 bg-base-100 p-5 shadow">
          <h2 className="mb-4 text-xl font-bold">Playlist Details</h2>
          {currentPlaylist ? (
            <>
              <div className="rounded-2xl bg-base-200 p-4">
                <h3 className="text-lg font-semibold text-primary">{currentPlaylist.name}</h3>
                <p className="mt-1 text-sm text-base-content/70">
                  {currentPlaylist.description || 'No description'}
                </p>
              </div>

              <div className="mt-4 space-y-2">
                {currentPlaylist.problems?.length > 0 ? (
                  currentPlaylist.problems.map((item) => (
                    <Link
                      to={`/problem/${item.problem.id}`}
                      key={item.id}
                      className="flex items-center justify-between rounded-xl border border-base-300 px-3 py-2 text-sm transition hover:bg-base-200"
                    >
                      <span>{item.problem.title}</span>
                      <span className="inline-flex items-center gap-1 text-base-content/60">
                        View <ArrowRight className="h-4 w-4" />
                      </span>
                    </Link>
                  ))
                ) : (
                  <div className="rounded-xl border border-dashed border-base-300 p-4 text-sm text-base-content/70">
                    This playlist is empty.
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="grid min-h-40 place-items-center rounded-2xl border border-dashed border-base-300 text-base-content/70">
              <div className="text-center">
                <ListVideo className="mx-auto h-6 w-6" />
                <p className="mt-2">Select a playlist to view its problems.</p>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default LibraryPage;

import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { playlistsApi, type Playlist } from "@/lib/api";

interface PlaylistStore {
  playlists: Playlist[];
  loading: boolean;
  fetch: () => Promise<void>;
  create: (data: { name: string; description?: string }) => Promise<Playlist | null>;
  remove: (id: string) => Promise<void>;
  addProblem: (playlistId: string, problemIds: string[]) => Promise<void>;
  removeProblem: (playlistId: string, problemIds: string[]) => Promise<void>;
}

export const usePlaylistStore = create<PlaylistStore>()(
  devtools(
    (set, get) => ({
      playlists: [],
      loading: false,

      fetch: async () => {
        set({ loading: true });
        try {
          const res: any = await playlistsApi.all();
          set({ playlists: res.playlists || res.data || [] });
        } catch {}
        finally { set({ loading: false }); }
      },

      create: async (data) => {
        try {
          const res: any = await playlistsApi.create(data);
          const playlist = res.playlist || res.data;
          await get().fetch();
          return playlist;
        } catch {
          return null;
        }
      },

      remove: async (id) => {
        await playlistsApi.remove(id);
        set((s) => ({ playlists: s.playlists.filter((p) => p.id !== id) }));
      },

      addProblem: async (playlistId, problemIds) => {
        await playlistsApi.addProblem(playlistId, problemIds);
      },

      removeProblem: async (playlistId, problemIds) => {
        await playlistsApi.removeProblem(playlistId, problemIds);
      },
    }),
    { name: "playlist-store" }
  )
);

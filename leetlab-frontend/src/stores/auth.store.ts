import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { authApi, usersApi, type User } from "@/lib/api";

interface AuthStore {
  user: User | null;
  loading: boolean;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  refresh: () => Promise<void>;
  login: (email: string, password: string) => Promise<User>;
  register: (name: string, email: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<User> & { skills?: string[] }) => Promise<void>;
  isAdmin: () => boolean;
}

export const useAuthStore = create<AuthStore>()(
  devtools(
    (set, get) => ({
      user: null,
      loading: true,

      setUser: (user) => set({ user }),
      setLoading: (loading) => set({ loading }),
      isAdmin: () => get().user?.role === "ADMIN",

      refresh: async () => {
        set({ loading: true });
        try {
          const res = await authApi.check();
          set({ user: res.user, loading: false });
        } catch {
          set({ user: null, loading: false });
        }
      },

      login: async (email, password) => {
        const res = await authApi.login({ email, password });
        set({ user: res.user });
        return res.user;
      },

      register: async (name, email, password) => {
        const res = await authApi.register({ name, email, password });
        set({ user: res.user });
        return res.user;
      },

      logout: async () => {
        try { await authApi.logout(); } catch {}
        set({ user: null });
      },

      updateProfile: async (data) => {
        const res: any = await usersApi.updateProfile(data as any);
        const updated = res?.user ?? res?.data;
        if (updated) set({ user: { ...get().user!, ...updated } });
        else set({ user: { ...get().user!, ...data } });
      },
    }),
    { name: "auth-store" }
  )
);

import * as React from "react";
import { authApi, type User } from "./api";

interface AuthState {
  user: User | null;
  loading: boolean;
  refresh: () => Promise<void>;
  login: (email: string, password: string) => Promise<User>;
  register: (name: string, email: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
}

const AuthContext = React.createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<User | null>(null);
  const [loading, setLoading] = React.useState(true);

  const refresh = React.useCallback(async () => {
    try {
      const res = await authApi.check();
      setUser(res.user);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => { refresh(); }, [refresh]);

  const login = async (email: string, password: string) => {
    const res = await authApi.login({ email, password });
    setUser(res.user);
    return res.user;
  };
  const register = async (name: string, email: string, password: string) => {
    const res = await authApi.register({ name, email, password });
    setUser(res.user);
    return res.user;
  };
  const logout = async () => {
    try { await authApi.logout(); } catch {}
    // Also clear any Clerk (OAuth) session so it doesn't linger and trigger
    // "Session already exists" on the next social sign-in. No-op when Clerk is
    // disabled (window.Clerk is undefined).
    try { await (window as any).Clerk?.signOut?.(); } catch {}
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, refresh, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = React.useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}

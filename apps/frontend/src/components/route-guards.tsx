import * as React from "react";
import { Navigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "@/lib/auth-context";
import { Loader2, Shield } from "lucide-react";

function FullScreenLoader() {
  return (
    <div className="grid min-h-[40vh] place-items-center">
      <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
    </div>
  );
}

function AdminsOnly() {
  return (
    <div className="mx-auto max-w-md px-4 py-20 text-center">
      <Shield className="mx-auto h-12 w-12 text-destructive" />
      <h1 className="mt-4 font-display text-3xl font-bold">Admins only</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        You need admin role to access this page.
      </p>
      <Link
        to="/"
        className="mt-6 inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
      >
        Home
      </Link>
    </div>
  );
}

/**
 * Requires an authenticated user. While the session is being resolved we show a
 * loader so we never flash protected content. Unauthenticated users are sent to
 * /login with the attempted location so they can be returned after signing in.
 */
export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <FullScreenLoader />;
  if (!user) return <Navigate to="/login" replace state={{ from: location }} />;
  return <>{children}</>;
}

/**
 * Requires an authenticated user with the ADMIN role. Guests are redirected to
 * login; signed-in non-admins get an explicit "admins only" screen.
 */
export function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <FullScreenLoader />;
  if (!user) return <Navigate to="/login" replace state={{ from: location }} />;
  if (user.role !== "ADMIN") return <AdminsOnly />;
  return <>{children}</>;
}

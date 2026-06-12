import React from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "@/lib/auth-context";
import { ThemeProvider } from "@/lib/theme-context";
import { Toaster } from "sonner";

// Layout Components
import { SiteHeader } from "@/components/site-header";
import { PageTransition, ScrollProgress } from "@/components/page-transition";
import { InteractiveBackground } from "@/components/interactive-background";
import { ProtectedRoute, AdminRoute } from "@/components/route-guards";

// Page Components
import Home from "@/routes/index";
import Admin from "@/routes/admin";
import AdminProblemsNew from "@/routes/admin.problems.new";
import AdminProblemsEdit from "@/routes/admin.problems.edit";
import AdminAIProblem from "@/routes/admin.problems.ai";
import AdminContestsNew from "@/routes/admin.contests.new";
import Contests from "@/routes/contests";
import ContestsDetail from "@/routes/contests.$slug";
import Discuss from "@/routes/discuss";
import DiscussPost from "@/routes/discuss.$postId";
import Leaderboard from "@/routes/leaderboard";
import Login from "@/routes/login";
import Register from "@/routes/register";
import Playlists from "@/routes/playlists";
import PlaylistDetail from "@/routes/playlists.$id";
import Problems from "@/routes/problems";
import ProblemsDetail from "@/routes/problems.$problemId";
import Profile from "@/routes/profile";
import ProfileEdit from "@/routes/profile.edit";
import Submissions from "@/routes/submissions";
import UserProfile from "@/routes/u.$username";
import Terms from "@/routes/terms";
import Privacy from "@/routes/privacy";
import ContestWorkspace from "@/routes/contests.$slug.workspace";
import ContestStandings from "@/routes/contests.$id.standings";
import ContestHistory from "@/routes/contests.history";
import NotFound from "@/routes/not-found";
import { clerkEnabled } from "@/lib/clerk";
import { SsoCallback, SsoFinish } from "@/components/social-auth";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const themeInit = `
(function(){try{
  var t = localStorage.getItem('leetlab-theme');
  if(t!=='dark' && t!=='light'){
    t = window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  }
  document.documentElement.setAttribute('data-theme', t);
}catch(e){document.documentElement.setAttribute('data-theme','dark');}})();
`;

function App() {
  const location = useLocation();
  const isWorkspace = location.pathname.includes("/workspace") || location.pathname.includes("/problems/");

  React.useEffect(() => {
    const script = document.createElement("script");
    script.innerHTML = themeInit;
    document.head.appendChild(script);
  }, []);

  // Cursor-following spotlight: any element with `data-spotlight` gets --mx/--my
  // updated so the `.spotlight` utility can render a glow under the pointer.
  React.useEffect(() => {
    const onMove = (e: MouseEvent) => {
      const el = (e.target as HTMLElement | null)?.closest?.("[data-spotlight]") as HTMLElement | null;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      el.style.setProperty("--mx", `${e.clientX - rect.left}px`);
      el.style.setProperty("--my", `${e.clientY - rect.top}px`);
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <div className="relative z-10 flex min-h-screen flex-col">
            <InteractiveBackground />
            <ScrollProgress />
            {!isWorkspace && <SiteHeader />}
            <main className="flex-1">
              <PageTransition>
                <Routes>
                  {/* Public routes */}
                  <Route path="/" element={<Home />} />
                  <Route path="/contests" element={<Contests />} />
                  <Route path="/contests/:id" element={<ContestsDetail />} />
                  <Route path="/contests/:id/standings" element={<ContestStandings />} />
                  <Route path="/discuss" element={<Discuss />} />
                  <Route path="/discuss/:postId" element={<DiscussPost />} />
                  <Route path="/leaderboard" element={<Leaderboard />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  {clerkEnabled && (
                    <>
                      <Route path="/sso-callback" element={<SsoCallback />} />
                      <Route path="/sso-finish" element={<SsoFinish />} />
                    </>
                  )}
                  <Route path="/problems" element={<Problems />} />
                  <Route path="/problems/:problemId" element={<ProblemsDetail />} />
                  <Route path="/u/:username" element={<UserProfile />} />
                  <Route path="/terms" element={<Terms />} />
                  <Route path="/privacy" element={<Privacy />} />

                  {/* Authenticated-only routes */}
                  <Route path="/contests/history" element={<ProtectedRoute><ContestHistory /></ProtectedRoute>} />
                  <Route path="/contests/:id/workspace" element={<ProtectedRoute><ContestWorkspace /></ProtectedRoute>} />
                  <Route path="/contests/:id/workspace/:problemId" element={<ProtectedRoute><ContestWorkspace /></ProtectedRoute>} />
                  <Route path="/playlists" element={<ProtectedRoute><Playlists /></ProtectedRoute>} />
                  <Route path="/playlists/:id" element={<ProtectedRoute><PlaylistDetail /></ProtectedRoute>} />
                  <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                  <Route path="/profile/edit" element={<ProtectedRoute><ProfileEdit /></ProtectedRoute>} />
                  <Route path="/submissions" element={<ProtectedRoute><Submissions /></ProtectedRoute>} />

                  {/* Admin-only routes */}
                  <Route path="/admin" element={<AdminRoute><Admin /></AdminRoute>} />
                  <Route path="/admin/problems/new" element={<AdminRoute><AdminProblemsNew /></AdminRoute>} />
                  <Route path="/admin/problems/:problemId/edit" element={<AdminRoute><AdminProblemsEdit /></AdminRoute>} />
                  <Route path="/admin/problems/ai" element={<AdminRoute><AdminAIProblem /></AdminRoute>} />
                  <Route path="/admin/contests/new" element={<AdminRoute><AdminContestsNew /></AdminRoute>} />

                  <Route path="*" element={<NotFound />} />
                </Routes>
              </PageTransition>
            </main>
          </div>
          <Toaster position="bottom-right" richColors />
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;

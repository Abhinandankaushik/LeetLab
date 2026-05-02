import React from "react";
import { Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "@/lib/auth-context";
import { ThemeProvider } from "@/lib/theme-context";
import { Toaster } from "sonner";

// Layout Components
import { SiteHeader } from "@/components/site-header";
import { PageTransition, ScrollProgress } from "@/components/page-transition";
import { InteractiveBackground } from "@/components/interactive-background";

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
import NotFound from "@/routes/not-found";

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
  React.useEffect(() => {
    const script = document.createElement("script");
    script.innerHTML = themeInit;
    document.head.appendChild(script);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <div className="relative z-10 flex min-h-screen flex-col">
            <InteractiveBackground />
            <ScrollProgress />
            <SiteHeader />
            <main className="flex-1">
              <PageTransition>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/admin" element={<Admin />} />
                  <Route path="/admin/problems/new" element={<AdminProblemsNew />} />
                  <Route path="/admin/problems/:problemId/edit" element={<AdminProblemsEdit />} />
                  <Route path="/admin/problems/ai" element={<AdminAIProblem />} />
                  <Route path="/admin/contests/new" element={<AdminContestsNew />} />
                  <Route path="/contests" element={<Contests />} />
                  <Route path="/contests/:slug" element={<ContestsDetail />} />
                  <Route path="/discuss" element={<Discuss />} />
                  <Route path="/discuss/:postId" element={<DiscussPost />} />
                  <Route path="/leaderboard" element={<Leaderboard />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/playlists" element={<Playlists />} />
                  <Route path="/playlists/:id" element={<PlaylistDetail />} />
                  <Route path="/problems" element={<Problems />} />
                  <Route path="/problems/:problemId" element={<ProblemsDetail />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/profile/edit" element={<ProfileEdit />} />
                  <Route path="/submissions" element={<Submissions />} />
                  <Route path="/u/:username" element={<UserProfile />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </PageTransition>
            </main>
            <footer className="border-t border-border/60 py-6 text-center text-xs text-muted-foreground">
              <span className="font-mono">// LeetLab — built for the relentless</span>
            </footer>
          </div>
          <Toaster position="bottom-right" richColors />
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;

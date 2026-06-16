import * as React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Terminal, Flame, Trophy, ArrowRight, ShieldCheck, Eye, EyeOff } from "lucide-react";
import { Typewriter } from "@/components/Typewriter";
import { clerkEnabled } from "@/lib/clerk";
import { SocialAuthButtons } from "@/components/social-auth";

export default function LoginPage() {
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  const redirectTo = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname || "/problems";

  useEffect(() => {
    if (user) navigate(redirectTo, { replace: true });
  }, [user, navigate, redirectTo]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      toast.success("Welcome back.");
      navigate(redirectTo, { replace: true });
    } catch (err: any) {
      toast.error(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-[calc(100vh-3.5rem)] overflow-hidden px-4 py-4 lg:py-8">
      {/* Background Pulses */}
      <div className="absolute -left-32 top-0 h-96 w-96 rounded-full bg-primary/10 blur-3xl animate-pulse-glow" />
      <div className="absolute -right-32 bottom-0 h-96 w-96 rounded-full bg-accent/10 blur-3xl animate-pulse-glow" style={{ animationDelay: "2s" }} />

      <div className="mx-auto grid max-w-5xl items-start gap-10 lg:grid-cols-2 lg:items-center">
        {/* 3D code preview card (LEFT) */}
        <div className="relative hidden perspective-1000 lg:block animate-fade-in" style={{ animationDelay: "0.5s" }}>
          {/* Extra Background Animations for Code Card */}
          <div className="absolute inset-0 -z-10 flex items-center justify-center">
            <div className="h-64 w-64 animate-pulse-glow rounded-full bg-primary/20 blur-[100px]" />
            <div className="absolute h-48 w-48 animate-bounce rounded-full bg-accent/10 blur-[80px]" style={{ animationDuration: '8s' }} />
          </div>

          <div className="animate-float relative preserve-3d" style={{ transform: "rotateY(12deg) rotateX(6deg)" }}>
            <div className="overflow-hidden rounded-xl border border-border bg-card shadow-2xl shadow-black/40">
              <div className="flex items-center justify-between border-b border-border bg-muted/30 px-4 py-2">
                <div className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-hard/70" />
                  <span className="h-2.5 w-2.5 rounded-full bg-medium/70" />
                  <span className="h-2.5 w-2.5 rounded-full bg-easy/70" />
                </div>
                <span className="font-mono text-xs text-muted-foreground">auth_session.sh</span>
                <Terminal className="h-3.5 w-3.5 text-muted-foreground" />
              </div>
              <pre className="overflow-x-auto p-6 font-mono text-[13px] leading-relaxed text-foreground min-h-[220px]">
                <Typewriter mode="bash" text={`$ leetlab auth login
> Checking credentials...
> Syncing local workspace...
> Fetching active streaks...

[SUCCESS] Authenticated as User
Current Streak: 15 days
Global Rank: #412

Ready to solve.
`} />
              </pre>
              <div className="flex items-center justify-between border-t border-border bg-muted/20 px-4 py-2 font-mono text-xs">
                <span className="text-primary flex items-center gap-1.5">
                  <ShieldCheck className="h-3 w-3" /> Secure session active
                </span>
                <span className="text-muted-foreground">v2.0.4</span>
              </div>
            </div>

            {/* floating accent cards */}
            <div
              className="absolute right-2 -top-5 rounded-xl border border-primary/40 bg-card/90 p-4 shadow-xl backdrop-blur"
              style={{ transform: "translateZ(40px) rotateY(-12deg)" }}
            >
              <div className="flex items-center gap-2 font-mono text-xs">
                <Flame className="h-4 w-4 text-medium" />
                <span><span className="font-bold text-medium">15</span> day streak</span>
              </div>
            </div>
            <div
              className="absolute -bottom-5 left-2 rounded-xl border border-accent/40 bg-card/90 p-4 shadow-xl backdrop-blur"
              style={{ transform: "translateZ(40px) rotateY(12deg)" }}
            >
              <div className="flex items-center gap-2 font-mono text-xs">
                <Trophy className="h-4 w-4 text-primary" />
                <span>rating <span className="font-bold text-primary">+47</span></span>
              </div>
            </div>
          </div>
        </div>

        {/* Form (RIGHT) */}
        <div className="w-full max-w-sm animate-fade-in-up lg:ml-auto">
          <p className="font-mono text-xs uppercase tracking-widest text-primary animate-slide-in-right">/ auth</p>
          <h1 className="mt-1.5 font-display text-3xl font-bold animate-slide-in-right" style={{ animationDelay: "0.1s" }}>Sign in</h1>
          <p className="mt-1 text-sm text-muted-foreground animate-slide-in-right" style={{ animationDelay: "0.2s" }}>
            The grind continues. Pick up where you left off.
          </p>

          <form onSubmit={submit} className="mt-4 space-y-3 rounded-2xl border border-border bg-card p-4 shadow-2xl shadow-black/20 animate-scale-in" style={{ animationDelay: "0.3s" }}>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="relentless@dev.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-muted/30"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link to="#" className="text-xs text-primary hover:underline">Forgot?</Link>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-muted/30 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground transition-colors hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <Button type="submit" className="w-full glow-primary btn-shine hover-lift" disabled={loading}>
              {loading ? "Authorizing..." : "Sign in"}
              {!loading && <ArrowRight className="ml-2 h-4 w-4" />}
            </Button>
            {clerkEnabled && <SocialAuthButtons />}
            <p className="text-center text-xs text-muted-foreground">
              Don't have an account? <Link to="/register" className="font-semibold text-primary hover:underline">Create one</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}

import * as React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Terminal, Sparkles, UserPlus, ArrowRight, Zap } from "lucide-react";
import { Typewriter } from "@/components/Typewriter";

export default function RegisterPage() {
  const { register, user } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    if (user) navigate("/problems");
  }, [user, navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register(name, email, password);
      toast.success("Account created. Let's solve.");
      navigate("/problems");
    } catch (err: any) {
      toast.error(err.message || "Registration failed");
    } finally { setLoading(false); }
  };

  return (
    <div className="relative min-h-[calc(100vh-3.5rem)] overflow-hidden px-4 py-10 lg:py-20">
      {/* Background Pulses */}
      <div className="absolute -left-32 top-0 h-96 w-96 rounded-full bg-primary/10 blur-3xl animate-pulse-glow" />
      <div className="absolute -right-32 bottom-0 h-96 w-96 rounded-full bg-accent/10 blur-3xl animate-pulse-glow" style={{ animationDelay: "2s" }} />

      <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-2">
        {/* 3D code preview card (LEFT) */}
        <div className="relative hidden perspective-1000 lg:block animate-fade-in" style={{ animationDelay: "0.5s" }}>
          {/* Extra Background Animations for Code Card */}
          <div className="absolute inset-0 -z-10 flex items-center justify-center">
            <div className="h-64 w-64 animate-pulse-glow rounded-full bg-accent/20 blur-[100px]" />
            <div className="absolute h-48 w-48 animate-bounce rounded-full bg-primary/10 blur-[80px]" style={{ animationDuration: '10s' }} />
          </div>

          <div className="animate-float relative preserve-3d" style={{ transform: "rotateY(12deg) rotateX(6deg)" }}>
            <div className="overflow-hidden rounded-xl border border-border bg-card shadow-2xl shadow-black/40">
              <div className="flex items-center justify-between border-b border-border bg-muted/30 px-4 py-2">
                <div className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-hard/70" />
                  <span className="h-2.5 w-2.5 rounded-full bg-medium/70" />
                  <span className="h-2.5 w-2.5 rounded-full bg-easy/70" />
                </div>
                <span className="font-mono text-xs text-muted-foreground">register_user.js</span>
                <Terminal className="h-3.5 w-3.5 text-muted-foreground" />
              </div>
              <pre className="overflow-x-auto p-6 font-mono text-[13px] leading-relaxed text-foreground min-h-[220px]">
                <Typewriter mode="bash" text={`$ leetlab auth register
> Creating unique ID... 
> Initializing data structures...
> Setting up performance metrics...

[SUCCESS] Profile created!
Badge earned: [NEWBIE]
Initial Rating: 0

Welcome to the lab, Solver.
`} />
              </pre>
              <div className="flex items-center justify-between border-t border-border bg-muted/20 px-4 py-2 font-mono text-xs">
                <span className="text-primary flex items-center gap-1.5">
                  <UserPlus className="h-3 w-3" /> New member onboarding
                </span>
                <span className="text-muted-foreground">v2.0.4</span>
              </div>
            </div>

            {/* floating accent cards */}
            <div
              className="absolute -right-6 -top-6 rounded-xl border border-accent/40 bg-card/90 p-4 shadow-xl backdrop-blur"
              style={{ transform: "translateZ(40px) rotateY(-12deg)" }}
            >
              <div className="flex items-center gap-2 font-mono text-xs">
                <Sparkles className="h-4 w-4 text-primary" />
                <span>Level up your <span className="font-bold text-primary">skills</span></span>
              </div>
            </div>
            <div
              className="absolute -bottom-6 -left-6 rounded-xl border border-primary/40 bg-card/90 p-4 shadow-xl backdrop-blur"
              style={{ transform: "translateZ(40px) rotateY(12deg)" }}
            >
              <div className="flex items-center gap-2 font-mono text-xs">
                <Zap className="h-4 w-4 text-accent" />
                <span>High speed <span className="font-bold text-accent">execution</span></span>
              </div>
            </div>
          </div>
        </div>

        {/* Form (RIGHT) */}
        <div className="w-full max-w-md animate-fade-in-up lg:ml-auto">
          <p className="font-mono text-xs uppercase tracking-widest text-primary animate-slide-in-right">/ register</p>
          <h1 className="mt-2 font-display text-5xl font-bold animate-slide-in-right" style={{ animationDelay: "0.1s" }}>Join the lab</h1>
          <p className="mt-2 text-sm text-muted-foreground animate-slide-in-right" style={{ animationDelay: "0.2s" }}>
            The arena is waiting. Forge your path in DSA.
          </p>

          <form onSubmit={submit} className="mt-8 space-y-4 rounded-2xl border border-border bg-card p-6 shadow-2xl shadow-black/20 animate-scale-in" style={{ animationDelay: "0.3s" }}>
            <div className="space-y-2">
              <Label htmlFor="name">Display Name</Label>
              <Input
                id="name"
                placeholder="The Relentless"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-muted/30"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="solver@leetlab.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-muted/30"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-muted/30"
              />
            </div>
            <Button type="submit" className="w-full glow-primary btn-shine hover-lift" size="lg" disabled={loading}>
              {loading ? "Initializing..." : "Create account"}
              {!loading && <ArrowRight className="ml-2 h-4 w-4" />}
            </Button>
            <p className="text-center text-xs text-muted-foreground">
              Already a member? <Link to="/login" className="font-semibold text-primary hover:underline">Sign in</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}

import * as React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth-context";
import { ArrowLeft, Loader2, Shield, Sparkles, BrainCircuit, CheckCircle2, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { api } from "@/lib/api";

export default function AdminAIProblemPage() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [problemName, setProblemName] = React.useState("");
  const [isGenerating, setIsGenerating] = React.useState(false);

  if (authLoading) return <div className="grid min-h-[40vh] place-items-center"><Loader2 className="h-5 w-5 animate-spin" /></div>;
  
  if (!user || user.role !== "ADMIN") {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <Shield className="mx-auto h-12 w-12 text-destructive" />
        <h1 className="mt-4 font-display text-3xl font-bold">Admins only</h1>
        <p className="mt-2 text-sm text-muted-foreground">You need admin role to access this dashboard.</p>
        <Link to="/" className="mt-6 inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">Home</Link>
      </div>
    );
  }

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!problemName.trim()) return toast.error("Please enter a problem name");

    try {
      setIsGenerating(true);
      const res = await api.post("/ai/generate-problem", { problemName });
      
      if (res.success && res.problem) {
        toast.success("Problem generated! Reviewing details...");
        // Navigate to the standard create page but pass the AI data via state
        navigate("/admin/problems/new", { state: { aiGeneratedProblem: res.problem } });
      } else {
        throw new Error("Failed to generate problem data");
      }
    } catch (error: any) {
      toast.error(error.message || "AI generation failed");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 animate-fade-in">
      <div className="mb-8">
        <Link 
          to="/admin" 
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors group"
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" /> 
          Back to Admin Dashboard
        </Link>
      </div>

      <div className="text-center mb-12">
        <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-2xl bg-gradient-primary text-primary-foreground glow-primary animate-float">
          <BrainCircuit className="h-8 w-8" />
        </div>
        <h1 className="font-display text-3xl md:text-4xl font-bold tracking-tight px-2">AI Problem Architect</h1>
        <p className="mt-3 text-sm md:text-base text-muted-foreground max-w-lg mx-auto px-4">
          Just name the challenge. Our AI will draft the description, constraints, 
          multi-language starter code, and test cases for you.
        </p>
      </div>

      <div className="relative overflow-hidden rounded-3xl border border-border bg-card p-1 shadow-2xl">
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
        
        <form onSubmit={handleGenerate} className="relative z-10 p-8 md:p-12">
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="font-mono text-xs uppercase tracking-widest text-muted-foreground">Problem Title</label>
              <div className="flex flex-col gap-3">
                <div className="relative flex-1">
                  <Input 
                    value={problemName}
                    onChange={(e) => setProblemName(e.target.value)}
                    placeholder="e.g. Find the Median of Two Sorted Arrays"
                    className="h-14 md:h-16 px-6 text-base md:text-xl font-medium bg-muted/20 border-border/60 focus:border-primary transition-all"
                    disabled={isGenerating}
                  />
                </div>
                <Button 
                  type="submit" 
                  disabled={isGenerating || !problemName.trim()}
                  className="h-12 md:h-14 px-8 glow-primary btn-shine w-full sm:w-auto self-center sm:self-end"
                >
                  {isGenerating ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Generate Problem
                    </>
                  )}
                </Button>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3 pt-6 border-t border-border/40">
              <FeatureItem icon={CheckCircle2} label="Auto-Description" />
              <FeatureItem icon={CheckCircle2} label="Starter Code (JS, PY, C++)" />
              <FeatureItem icon={CheckCircle2} label="Standard Testcases" />
            </div>
          </div>
        </form>
      </div>

      <div className="mt-12 rounded-2xl border border-border/40 bg-muted/30 p-6">
        <h3 className="font-mono text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">How it works</h3>
        <div className="grid gap-6 md:grid-cols-3">
          <Step num="01" text="Enter a clear, descriptive name for the algorithmic problem." />
          <Step num="02" text="Our AI parses the intent and constructs the full Prisma model JSON." />
          <Step num="03" text="Review and refine the generated data in the master editor." />
        </div>
      </div>
    </div>
  );
}

function FeatureItem({ icon: Icon, label }: { icon: any; label: string }) {
  return (
    <div className="flex items-center gap-2 text-sm text-foreground/80">
      <Icon className="h-4 w-4 text-easy" />
      <span>{label}</span>
    </div>
  );
}

function Step({ num, text }: { num: string; text: string }) {
  return (
    <div className="flex gap-3">
      <span className="font-mono text-primary font-bold">{num}</span>
      <p className="text-sm text-muted-foreground leading-relaxed">{text}</p>
    </div>
  );
}

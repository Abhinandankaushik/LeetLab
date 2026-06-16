import * as React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth-context";
import { useQuery } from "@tanstack/react-query";
import { problemsApi, contestsApi } from "@/lib/api";
import { ArrowLeft, Loader2, Shield, Trophy, Calendar, Plus, Trash2, Search, CheckCircle2, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { FormSkeleton } from "@/components/empty-state";

export default function NewContestPage() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState("");

  // Form State
  const [name, setName] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [startTime, setStartTime] = React.useState("");
  const [endTime, setEndTime] = React.useState("");
  const [selectedProblemIds, setSelectedProblemIds] = React.useState<string[]>([]);

  // Fetch problems for the picker
  const { data: problemsData } = useQuery({
    queryKey: ["problems"],
    queryFn: () => problemsApi.list().then(r => r.problems || [])
  });

  const filteredProblems = (problemsData || []).filter(p => 
    p.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (authLoading) return <FormSkeleton />;
  
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

  const toggleProblem = (id: string) => {
    setSelectedProblemIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !startTime || !endTime || selectedProblemIds.length === 0) {
      return toast.error("Please fill all required fields and pick at least one problem");
    }

    try {
      setIsLoading(true);
      const data = {
        name,
        description,
        startTime: new Date(startTime).toISOString(),
        endTime: new Date(endTime).toISOString(),
        problems: selectedProblemIds.map(id => ({ id })) as any
      };
      await contestsApi.create(data);
      toast.success("Contest created successfully");
      navigate("/admin");
    } catch (error: any) {
      toast.error(error.message || "Failed to create contest");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 animate-fade-in">
      <div className="mb-6">
        <Link 
          to="/admin" 
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors group"
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" /> 
          Back to Admin Dashboard
        </Link>
      </div>

      <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="font-display text-3xl md:text-4xl font-bold flex items-center gap-2">
            <Trophy className="h-7 w-7 md:h-8 md:w-8 text-primary" /> Create New Contest
          </h1>
          <p className="mt-1 text-sm md:text-base text-muted-foreground">Schedule a competitive arena for the community.</p>
        </div>
        <Button onClick={handleSubmit} disabled={isLoading} className="glow-primary btn-shine h-12 px-8 w-full md:w-auto">
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
          Launch Contest
        </Button>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1.2fr_1fr]">
        {/* Left Col: Contest Details */}
        <section className="rounded-2xl border border-border bg-card p-5 md:p-8 space-y-6 shadow-sm h-fit">
          <h2 className="font-display text-xl font-bold flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" /> Contest Config
          </h2>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-mono uppercase tracking-widest text-muted-foreground">Contest Name</label>
              <Input 
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Weekly Contest 124"
                className="h-12 bg-muted/20 border-border/60"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-mono uppercase tracking-widest text-muted-foreground">Description (Optional)</label>
              <textarea 
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Markdown supported contest rules/info..."
                className="w-full rounded-md border border-border/60 bg-muted/20 px-3 py-2 text-sm min-h-[120px]"
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-xs font-mono uppercase tracking-widest text-muted-foreground">Start Time</label>
                <div className="relative">
                  <Input 
                    type="datetime-local" 
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="h-12 pl-10 bg-muted/20 border-border/60"
                  />
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-mono uppercase tracking-widest text-muted-foreground">End Time</label>
                <div className="relative">
                  <Input 
                    type="datetime-local" 
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="h-12 pl-10 bg-muted/20 border-border/60"
                  />
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Right Col: Problem Picker */}
        <section className="flex flex-col rounded-2xl border border-border bg-card shadow-sm overflow-hidden h-[500px] md:h-[600px]">
          <div className="p-6 border-b border-border bg-muted/20">
            <h2 className="font-display text-xl font-bold flex items-center gap-2">
              <Plus className="h-5 w-5 text-primary" /> Problem Selection
            </h2>
            <p className="mt-1 text-xs text-muted-foreground">Select {selectedProblemIds.length} problems for this contest</p>
            
            <div className="mt-4 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search problems..." 
                className="pl-10 h-10 bg-background"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-2 scrollbar-thin">
            {filteredProblems.map((p) => {
              const isSelected = selectedProblemIds.includes(p.id);
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => toggleProblem(p.id)}
                  className={cn(
                    "w-full text-left p-4 rounded-xl border transition-all flex items-center justify-between group",
                    isSelected 
                      ? "border-primary bg-primary/5 shadow-sm" 
                      : "border-border/40 hover:border-primary/40 hover:bg-muted/30"
                  )}
                >
                  <div className="min-w-0">
                    <div className="font-bold truncate">{p.title}</div>
                    <div className="mt-1 flex items-center gap-2 text-[10px] uppercase font-mono tracking-wider">
                      <span className={cn(
                        p.defficulty === "EASY" ? "text-easy" : p.defficulty === "MEDIUM" ? "text-medium" : "text-hard"
                      )}>
                        {p.defficulty}
                      </span>
                      <span className="text-muted-foreground">/</span>
                      <span className="text-muted-foreground truncate">{p.tags.join(", ")}</span>
                    </div>
                  </div>
                  <div className={cn(
                    "h-6 w-6 rounded-full border flex items-center justify-center transition-colors shrink-0 ml-4",
                    isSelected ? "bg-primary border-primary text-primary-foreground" : "border-border group-hover:border-primary/40"
                  )}>
                    {isSelected && <CheckCircle2 className="h-4 w-4" />}
                  </div>
                </button>
              );
            })}
            {filteredProblems.length === 0 && (
              <div className="text-center py-12 text-muted-foreground text-sm">
                No problems found matching your search.
              </div>
            )}
          </div>

          <div className="p-4 border-t border-border bg-muted/10">
            <div className="flex items-center justify-between text-sm font-mono uppercase tracking-widest text-muted-foreground">
              <span>Order</span>
              <span>A, B, C...</span>
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {selectedProblemIds.map((id, idx) => {
                const p = problemsData?.find(x => x.id === id);
                return (
                  <div key={id} className="flex items-center gap-1.5 rounded-lg bg-background border border-border px-3 py-1.5 text-xs">
                    <span className="font-bold text-primary">{String.fromCharCode(65 + idx)}</span>
                    <span className="truncate max-w-[100px]">{p?.title}</span>
                    <button onClick={() => toggleProblem(id)} className="text-muted-foreground hover:text-destructive transition-colors">
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                );
              })}
              {selectedProblemIds.length === 0 && <span className="text-xs text-muted-foreground italic">No problems selected yet.</span>}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

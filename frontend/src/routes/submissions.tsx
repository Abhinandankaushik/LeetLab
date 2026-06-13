import * as React from "react";
import { Link } from "react-router-dom";
import { submissionsApi, type Submission } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { 
  CheckCircle2, XCircle, Loader2, Clock, Zap, ChevronRight, 
  Terminal, Code2, ShieldAlert, ShieldCheck, ArrowLeft 
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import Editor from "@monaco-editor/react";

const formatStat = (val: string | null, type: 'time' | 'memory' = 'time') => {
  if (!val || val === "[]" || val === "null") return type === 'time' ? "0 ms" : "0 KB";
  try {
    const parsed = JSON.parse(val);
    const values = Array.isArray(parsed) 
      ? parsed.filter(v => v != null).map(v => parseFloat(v) || 0) 
      : [parseFloat(val) || 0];
    
    if (values.length === 0) return type === 'time' ? "0 ms" : "0 KB";
    
    const maxVal = Math.max(...values);
    
    if (type === 'time') {
      // Execution time is in seconds. Convert to ms if small.
      if (maxVal === 0) return "0 ms";
      if (maxVal < 1) return `${(maxVal * 1000).toFixed(0)} ms`;
      return `${maxVal.toFixed(3)} s`;
    } else {
      // Memory usage is in KB. Convert to MB if large.
      if (maxVal === 0) return "0 KB";
      if (maxVal > 1024) return `${(maxVal / 1024).toFixed(2)} MB`;
      return `${maxVal.toFixed(0)} KB`;
    }
  } catch {
    // Fallback if not JSON or other error
    if (!val) return type === 'time' ? "0 ms" : "0 KB";
    if (type === 'time' && !String(val).includes('ms') && !String(val).includes('s')) return `${val} s`;
    if (type === 'memory' && !String(val).includes('KB') && !String(val).includes('MB')) return `${val} KB`;
    return val;
  }
};

export default function SubmissionsPage() {
  const { user, loading: authLoading } = useAuth();
  const [subs, setSubs] = React.useState<Submission[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [selectedSub, setSelectedSub] = React.useState<Submission | null>(null);
  const [isDetailOpen, setIsDetailOpen] = React.useState(false);

  React.useEffect(() => {
    if (authLoading) return;
    if (!user) { setLoading(false); return; }
    submissionsApi.all()
      .then((res: any) => setSubs(res.submissions || []))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [user, authLoading]);

  const handleViewDetail = async (subId: string) => {
    try {
      const res: any = await submissionsApi.get(subId);
      setSelectedSub(res.submission || res.data);
      setIsDetailOpen(true);
    } catch (err) {
      console.error("Failed to fetch submission details", err);
      toast.error("Failed to load details");
    }
  };

  if (!user && !authLoading) {
    return <Gate />;
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 stagger min-h-screen">
      <div className="flex items-center gap-2 mb-2">
        <div className="h-1 w-8 bg-primary rounded-full" />
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-primary font-bold">Workspace History</p>
      </div>
      <h1 className="font-display text-4xl md:text-5xl font-black tracking-tighter">Your Submissions</h1>
      <p className="mt-2 text-muted-foreground text-sm max-w-lg">Track your progress and review previous solutions to improve your coding logic.</p>

      <div className="mt-12 space-y-3">
        {loading && (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="h-10 w-10 animate-spin text-primary opacity-40" />
            <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Retrieving history...</p>
          </div>
        )}
        
        {error && (
          <div className="p-8 rounded-2xl border border-hard/20 bg-hard/5 text-center">
            <ShieldAlert className="h-8 w-8 text-hard mx-auto mb-3" />
            <p className="text-sm font-bold text-hard">{error}</p>
          </div>
        )}

        {!loading && !error && subs.length === 0 && (
          <div className="p-20 text-center rounded-2xl border border-dashed border-border bg-muted/10">
            <Terminal className="h-10 w-10 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="text-lg font-bold">No submissions yet</h3>
            <p className="text-sm text-muted-foreground mt-1">Start solving problems to build your history.</p>
            <Link to="/problems" className="mt-6 inline-flex h-9 items-center justify-center rounded-full bg-primary px-6 text-xs font-bold text-primary-foreground hover:bg-primary/90 transition-all shadow-lg shadow-primary/20">
              Browse Problems
            </Link>
          </div>
        )}

        {!loading && !error && subs.map((s) => {
          const ok = s.status?.toLowerCase().includes("accept");
          return (
            <div
              key={s.id}
              onClick={() => handleViewDetail(s.id)}
              className="group relative flex flex-col md:flex-row md:items-center justify-between rounded-2xl border border-border bg-card p-4 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/5 transition-all cursor-pointer gap-4 overflow-hidden"
            >
              <div className={cn(
                "absolute left-0 top-0 bottom-0 w-1 transition-all group-hover:w-1.5",
                ok ? "bg-easy" : "bg-hard"
              )} />
              
              <div className="flex items-center gap-4 min-w-0">
                <div className={cn(
                  "p-2.5 rounded-xl shrink-0 transition-transform group-hover:scale-110",
                  ok ? "bg-easy/10 text-easy" : "bg-hard/10 text-hard"
                )}>
                  {ok ? <CheckCircle2 className="h-5 w-5" /> : <XCircle className="h-5 w-5" />}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className={cn("text-xs font-black uppercase tracking-tight", ok ? "text-easy" : "text-hard")}>
                      {s.status}
                    </span>
                    <span className="text-[10px] text-muted-foreground/60">•</span>
                    <span className="text-[10px] font-mono text-muted-foreground/80 uppercase">
                      {s.language}
                    </span>
                  </div>
                  <h3 className="font-display font-bold text-base md:text-lg truncate tracking-tight group-hover:text-primary transition-colors">
                    {(s as any).problem?.title || "Unknown Problem"}
                  </h3>
                </div>
              </div>

              <div className="flex items-center justify-between md:justify-end gap-6 font-mono text-[11px] text-muted-foreground border-t md:border-0 pt-3 md:pt-0">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-3 w-3 opacity-50" />
                    <span>{formatStat(s.time, 'time')}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Zap className="h-3 w-3 opacity-50" />
                    <span>{formatStat(s.memory, 'memory')}</span>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="hidden sm:inline opacity-60">
                    {new Date(s.createdAt).toLocaleDateString()}
                  </span>
                  <div className="p-1.5 rounded-full bg-muted/50 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                    <ChevronRight className="h-4 w-4" />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Submission Detail Modal */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="w-[calc(100vw-2rem)] sm:max-w-5xl max-h-[90vh] overflow-y-auto scrollbar-thin rounded-2xl border-border bg-background p-0 gap-0 shadow-2xl">
          {selectedSub && (
            <div className="flex flex-col h-full">
              {/* Header section with context */}
              <div className="p-4 md:p-6 border-b border-border/60 bg-muted/10">
                <DialogHeader className="text-left">
                  <div className="flex items-center gap-3 mb-3 md:mb-4">
                    <Badge variant="outline" className="font-mono text-[9px] md:text-[10px] uppercase tracking-wider bg-background">
                      {selectedSub.language}
                    </Badge>
                  </div>
                  <DialogTitle className="font-display text-xl md:text-3xl font-black tracking-tight leading-tight mb-2 text-wrap">
                    {(selectedSub as any).problem?.title || "Problem Detail"}
                  </DialogTitle>
                  <div className="flex items-center gap-4 text-[10px] md:text-[11px] font-mono text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <Clock className="h-3 w-3" /> {new Date(selectedSub.createdAt).toLocaleString()}
                    </span>
                  </div>
                </DialogHeader>
              </div>

              <div className="p-6 space-y-10">
                {/* 1. Results Summary */}
                <div className="space-y-4">
                  <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
                    <Terminal className="h-3 w-3" /> Execution Summary
                  </h4>
                  <div className={cn(
                    "p-6 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-6",
                    selectedSub.status.toLowerCase().includes("accept") ? "bg-easy/5 border-easy/20 shadow-[0_0_20px_-10px_rgba(var(--easy),0.2)]" : "bg-hard/5 border-hard/20 shadow-[0_0_20px_-10px_rgba(var(--hard),0.2)]"
                  )}>
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "p-3 rounded-2xl shadow-inner",
                        selectedSub.status.toLowerCase().includes("accept") ? "bg-easy/10 text-easy" : "bg-hard/10 text-hard"
                      )}>
                        {selectedSub.status.toLowerCase().includes("accept") ? <CheckCircle2 className="h-7 w-7" /> : <XCircle className="h-7 w-7" />}
                      </div>
                      <div>
                        <div className={cn("text-2xl font-black uppercase tracking-tight", selectedSub.status.toLowerCase().includes("accept") ? "text-easy" : "text-hard")}>
                          {selectedSub.status}
                        </div>
                        <div className="flex items-center gap-3 text-xs font-medium text-muted-foreground mt-1">
                          <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {formatStat(selectedSub.time, 'time')}</span>
                          <span className="opacity-30">|</span>
                          <span className="flex items-center gap-1"><Zap className="h-3 w-3" /> {formatStat(selectedSub.memory, 'memory')}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col items-end">
                      <div className="text-3xl font-black font-mono tracking-tighter">
                        {selectedSub.passedCount ?? 0} <span className="text-xs text-muted-foreground font-medium mx-1">/</span> {selectedSub.totalCount ?? 0}
                      </div>
                      <div className="text-[10px] uppercase font-bold tracking-[0.15em] text-muted-foreground mt-1.5 opacity-70">Passed Cases</div>
                    </div>
                  </div>

                  {/* Compile Error / Stderr */}
                  {(selectedSub.compileOutput || selectedSub.stderr) && (
                    <div className="rounded-xl bg-hard/10 border border-hard/20 p-5">
                      <p className="text-[10px] font-bold text-hard uppercase tracking-widest mb-3 flex items-center gap-1.5">
                        <ShieldAlert className="h-4 w-4" /> Runtime Error Traceback
                      </p>
                      <pre className="whitespace-pre-wrap font-mono text-xs text-hard leading-relaxed bg-hard/5 p-4 rounded-xl border border-hard/10 overflow-x-auto shadow-inner">
                        {selectedSub.compileOutput || selectedSub.stderr}
                      </pre>
                    </div>
                  )}
                </div>

                {/* 2. Source Code - Monaco Editor Integration */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
                      <Code2 className="h-3 w-3" /> Solution Implementation
                    </h4>
                    <Button 
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        const code = (selectedSub.sourceCode as any).code || selectedSub.sourceCode;
                        navigator.clipboard.writeText(String(code));
                        toast.success("Code copied to clipboard");
                      }}
                      className="text-[10px] font-bold uppercase text-primary h-7 px-3 rounded-full hover:bg-primary/10"
                    >
                      Copy Snippet
                    </Button>
                  </div>
                  <div className="rounded-2xl border border-border overflow-hidden bg-[#1e1e1e] shadow-xl transition-all duration-300">
                    <Editor
                      height={Math.min(Math.max((String((selectedSub.sourceCode as any).code || selectedSub.sourceCode).split('\n').length * 19) + 40, 150), 600) + "px"}
                      language={selectedSub.language.toLowerCase().includes("python") ? "python" : selectedSub.language.toLowerCase().includes("java") ? "java" : "cpp"}
                      value={String((selectedSub.sourceCode as any).code || selectedSub.sourceCode)}
                      theme="vs-dark"
                      options={{
                        readOnly: true,
                        minimap: { enabled: false },
                        fontSize: 13,
                        fontFamily: "'JetBrains Mono', monospace",
                        scrollBeyondLastLine: false,
                        automaticLayout: true,
                        padding: { top: 20, bottom: 20 },
                        lineNumbers: "on",
                        glyphMargin: false,
                        folding: true,
                        lineDecorationsWidth: 10,
                        lineNumbersMinChars: 3,
                        scrollbar: {
                          vertical: 'auto',
                          horizontal: 'auto',
                        }
                      }}
                    />
                  </div>
                </div>

                {/* 3. Detailed Testcase Analysis */}
                {selectedSub.testCases && selectedSub.testCases.length > 0 && (
                  <div className="space-y-5">
                    <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2 border-b border-border/40 pb-2">
                      <ShieldCheck className="h-3 w-3" /> In-depth Case Verification
                    </h4>
                    <div className="grid grid-cols-1 gap-4">
                      {selectedSub.testCases.map((tc, idx) => (
                        <div key={idx} className={cn(
                          "rounded-2xl border overflow-hidden shadow-sm transition-all hover:shadow-md",
                          tc.passed ? "border-easy/20 bg-easy/[0.02]" : "border-hard/20 bg-hard/[0.02]"
                        )}>
                          <div className={cn(
                            "flex items-center justify-between px-5 py-3 border-b",
                            tc.passed ? "bg-easy/5 border-easy/10" : "bg-hard/5 border-hard/10"
                          )}>
                            <div className="flex items-center gap-3">
                              <span className="font-mono text-[11px] font-black uppercase tracking-tight opacity-70">Case #{idx + 1}</span>
                              {tc.passed ? (
                                <Badge className="bg-easy/20 text-easy hover:bg-easy/20 border-none text-[9px] font-bold uppercase py-0 px-2 h-5">Passed</Badge>
                              ) : (
                                <Badge className="bg-hard/20 text-hard hover:bg-hard/20 border-none text-[9px] font-bold uppercase py-0 px-2 h-5">Failed</Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-4 font-mono text-[10px] text-muted-foreground">
                              <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {tc.time || "0 ms"}</span>
                            </div>
                          </div>
                          
                          <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-6 font-mono text-[11px]">
                            <div className="space-y-2">
                              <span className="text-[9px] font-bold uppercase text-muted-foreground/60 tracking-widest block">Input</span>
                              <div className="bg-muted/40 p-3 rounded-xl border border-border/40 max-h-[120px] overflow-y-auto scrollbar-thin whitespace-pre-wrap leading-relaxed">
                                {tc.stdin || <span className="opacity-30 italic">No input available</span>}
                              </div>
                            </div>
                            <div className="space-y-2">
                              <span className="text-[9px] font-bold uppercase text-muted-foreground/60 tracking-widest block">Expected</span>
                              <div className="bg-easy/5 p-3 rounded-xl border border-easy/20 text-easy/80 max-h-[120px] overflow-y-auto scrollbar-thin whitespace-pre-wrap leading-relaxed">
                                {tc.expected || <span className="opacity-30 italic">No expected output</span>}
                              </div>
                            </div>
                            <div className="space-y-2">
                              <span className="text-[9px] font-bold uppercase text-muted-foreground/60 tracking-widest block">Actual Output</span>
                              <div className={cn(
                                "p-3 rounded-xl border max-h-[120px] overflow-y-auto scrollbar-thin whitespace-pre-wrap leading-relaxed",
                                tc.passed ? "bg-easy/5 border-easy/20 text-easy" : "bg-hard/5 border-hard/20 text-hard"
                              )}>
                                {tc.stdout || <span className="opacity-30 italic">{tc.status?.includes("Time") ? "Time Limit Exceeded" : "No output produced"}</span>}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {/* Hidden Cases Info (If applicable) */}
                    {(selectedSub.totalHiddenCases ?? 0) > 0 && (
                      <div className="mt-4 p-4 rounded-2xl border border-border bg-muted/20 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
                         <div className="flex items-center gap-3">
                            <ShieldCheck className="h-5 w-5 text-muted-foreground/60 shrink-0" />
                            <span className="text-[11px] md:text-xs font-bold text-muted-foreground">Plus {selectedSub.totalHiddenCases} hidden test cases verified in our secure sandbox.</span>
                         </div>
                         <div className="text-[11px] md:text-xs font-mono font-bold text-easy whitespace-nowrap">
                            {selectedSub.hiddenPassedCount} / {selectedSub.totalHiddenCases} PASSED
                         </div>
                      </div>
                    )}
                  </div>
                )}
                
                <div className="pt-8 border-t border-border/40 text-center pb-4">
                  <Button variant="ghost" size="sm" asChild className="text-primary font-bold text-xs gap-2 rounded-full px-6">
                    <Link to={`/problems/${selectedSub.problemId}`}>
                      <ArrowLeft className="h-3 w-3" /> Return to Workspace
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Gate() {
  return (
    <div className="mx-auto max-w-md px-4 py-32 text-center stagger">
      <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary border border-primary/20">
        <ShieldAlert className="h-8 w-8" />
      </div>
      <h1 className="font-display text-4xl font-black tracking-tight">Access Restricted</h1>
      <p className="mt-4 text-muted-foreground text-sm">You need to be authenticated to view your personal submission archive and solve history.</p>
      <div className="mt-10 flex flex-col gap-3">
        <Link to="/login" className="flex h-11 items-center justify-center rounded-xl bg-primary px-8 text-sm font-bold text-primary-foreground shadow-xl shadow-primary/20 hover:scale-[1.02] transition-all">Sign in to your account</Link>
        <Link to="/register" className="flex h-11 items-center justify-center rounded-xl border border-border bg-card px-8 text-sm font-bold hover:bg-muted transition-all">Create a new account</Link>
      </div>
    </div>
  );
}

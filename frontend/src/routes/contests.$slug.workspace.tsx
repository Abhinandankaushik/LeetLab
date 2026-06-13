import * as React from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Editor from "@monaco-editor/react";
import {
  contestsApi, executeApi, submissionsApi, LANGUAGES,
  type Problem, type Submission, type Contest, type ContestProblem
} from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { useTheme } from "@/lib/theme-context";
import { Button } from "@/components/ui/button";
import { DifficultyBadge } from "@/components/difficulty-badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EditorToolbar } from "@/components/EditorToolbar";
import { 
  ArrowLeft, CheckCircle2, XCircle, Loader2, 
  Terminal, Trophy, Clock, Timer, LayoutDashboard, ChevronRight, Menu,
  ShieldCheck, ShieldAlert, ThumbsUp, ThumbsDown, Bookmark, Send
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { 
  ResizableHandle, 
  ResizablePanel, 
  ResizablePanelGroup 
} from "@/components/ui/resizable";
import { EditorSkeleton } from "@/components/empty-state";
import { useQuery, useQueryClient } from "@tanstack/react-query";

export default function ContestWorkspace() {

  const { id, problemId: activeProblemId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  // 1. Fetch Contest Data
  const { data: contestData, isLoading: contestLoading } = useQuery({
    queryKey: ["contest", id],
    queryFn: () => contestsApi.get(id!)
  });

  const contest = contestData?.contest;
  const problems = contest?.problems || [];
  const isRegistered = !!contest?.isRegistered;
  const hasStarted = !!contest?.hasStarted;
  const isAdmin = user?.role === 'ADMIN';

  // 2. Determine Active Problem
  const activeProblem = React.useMemo(() => {
    if (!activeProblemId && problems.length > 0) return problems[0];
    return problems.find(p => p.problem.id === activeProblemId) || problems[0];
  }, [activeProblemId, problems]);

  const [lang, setLang] = React.useState<any>(LANGUAGES[0]);
  const [code, setCode] = React.useState<string>("");
  const [running, setRunning] = React.useState(false);
  const [result, setResult] = React.useState<Submission | null>(null);
  
  const [consoleHeight, setConsoleHeight] = React.useState(12);
  const [isResizingConsole, setIsResizingConsole] = React.useState(false);
  const queryClient = useQueryClient();

  const [editorSettings, setEditorSettings] = React.useState({
    fontSize: 14,
    theme: "vs-dark",
    fontFamily: "JetBrains Mono, monospace",
  });

  // 3. Full-Screen Anti-Cheat Logic
  React.useEffect(() => {
    const handleFullscreenChange = () => {
      // isFullscreen removed
    };
    
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  const handleConsoleMouseDown = (e: React.MouseEvent) => {
    setIsResizingConsole(true);
  };

  React.useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isResizingConsole) {
        const h = 100 - (e.clientY / window.innerHeight) * 100;
        setConsoleHeight(Math.min(Math.max(h, 10), 80));
      }
    };

    const handleMouseUp = () => {
      setIsResizingConsole(false);
    };

    if (isResizingConsole) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "row-resize";
    } else {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "default";
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "default";
    };
  }, [isResizingConsole]);

  // Handle Initial Code Load
  React.useEffect(() => {
    if (activeProblem?.problem) {
      const p = activeProblem.problem;
      const initialLang = LANGUAGES.find(l => p.codeSnippets?.[l.key]) || LANGUAGES[0];
      setLang(initialLang);
      setCode(p.codeSnippets?.[initialLang.key] || "");
    }
  }, [activeProblem?.problem?.id]);

  const handleRun = async (isSubmit: boolean) => {
    if (!activeProblem) return;
    setRunning(true);
    try {
      // For running (not submit), send example test cases
      const examples = Array.isArray(activeProblem.problem.examples)
        ? activeProblem.problem.examples
        : (activeProblem.problem.examples ? Object.values(activeProblem.problem.examples) : []);
      
      const stdins = !isSubmit ? examples.map((t: any) => String(t.input ?? "")) : undefined;
      const expected = !isSubmit ? examples.map((t: any) => String(t.output ?? "")) : undefined;

      const res: any = await executeApi.run({
        language_id: lang.id,
        source_code: code,
        problemId: activeProblem.problem.id,
        contestId: id,
        isSubmit,
        stdin: stdins,
        expected_outputs: expected
      });

      const sub: Submission = {
        ...(res.submission || res.data || res),
        totalCount: res.totalCount,
        passedCount: res.passedCount,
        hiddenPassedCount: res.submission?.hiddenPassedCount ?? res.hiddenPassedCount,
        hiddenFailedCount: res.submission?.hiddenFailedCount ?? res.hiddenFailedCount,
        totalHiddenCases: res.submission?.totalHiddenCases ?? res.totalHiddenCases,
      };

      setResult(sub);
      if (isSubmit && sub.status?.toLowerCase().includes("accept")) {
        toast.success("Accepted! Points updated.");
        // Re-fetch contest data to update isSolved and points
        queryClient.invalidateQueries({ queryKey: ["contest", id] });
        queryClient.invalidateQueries({ queryKey: ["contest-standings", id] });
      } else if (isSubmit) {
        toast.error(res.status || "Wrong Answer");
      }
      
      // Auto-expand console to show result
      setConsoleHeight(40);
    } catch (err: any) {
      toast.error(err.message || "Execution failed");
    } finally {
      setRunning(false);
    }
  };

  if (contestLoading) return <EditorSkeleton fullScreen />;
  if (!contest) return <div className="p-20 text-center">Contest not found.</div>;

  // Enforce Registration and Timing (except for admins)
  if (!isAdmin) {
    if (!isRegistered) {
      return (
        <div className="h-screen w-screen flex flex-col items-center justify-center bg-background p-6 text-center stagger">
          <div className="relative mb-8">
             <div className="absolute -inset-10 bg-primary/20 blur-3xl rounded-full" />
             <Trophy className="h-24 w-24 text-primary/40 relative" />
          </div>
          <h1 className="text-4xl font-black tracking-tight">Access Restricted</h1>
          <p className="mt-4 text-muted-foreground max-w-md mx-auto leading-relaxed">
            You are not registered for <strong>{contest.name}</strong>. 
            Please register on the contest details page to participate.
          </p>
          <div className="mt-10 flex gap-4">
            <Button size="lg" className="rounded-2xl px-8 font-black" onClick={() => navigate(`/contests/${id}`)}>
              Go to Registration
            </Button>
          </div>
        </div>
      );
    }
    
    if (!hasStarted) {
      return (
        <div className="h-screen w-screen flex flex-col items-center justify-center bg-background p-6 text-center stagger">
          <div className="relative mb-8">
             <div className="absolute -inset-10 bg-primary/20 blur-3xl rounded-full" />
             <Clock className="h-24 w-24 text-primary/40 relative" />
          </div>
          <h1 className="text-4xl font-black tracking-tight">Arena Not Open</h1>
          <p className="mt-4 text-muted-foreground max-w-md mx-auto leading-relaxed">
            The contest has not started yet. Please wait for the official start time to enter the workspace.
          </p>
          <div className="mt-10">
            <Button size="lg" className="rounded-2xl px-8 font-black" onClick={() => navigate(`/contests/${id}`)}>
              Wait in Details Page
            </Button>
          </div>
        </div>
      );
    }
  }

  return (
    <div className="h-screen w-screen flex flex-col bg-background overflow-hidden selection:bg-primary/30 relative">

      {/* Contest Header - Hidden in Full Screen */}
      {/* Contest Header */}
      <header className="h-14 border-b border-border bg-card/50 backdrop-blur-md flex items-center justify-between px-4 shrink-0 z-50 shadow-sm">
          <div className="flex items-center gap-4 flex-1">
            <Link to={`/contests/${id}`} className="flex items-center gap-2 group shrink-0">
              <ArrowLeft className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
              <Trophy className="h-4 w-4 text-primary" />
              <span className="font-display font-bold text-sm truncate max-w-[200px]">{contest.name}</span>
            </Link>

            <div className="h-6 w-px bg-border hidden lg:block" />

            {/* Problem Selector Dropdown */}
            <div className="flex items-center gap-2 ml-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground hidden lg:block">Problem</span>
              <select 
                value={activeProblem?.problem?.id} 
                onChange={(e) => navigate(`/contests/${id}/workspace/${e.target.value}`)}
                className="bg-muted/40 border border-border/60 rounded-lg px-3 py-1.5 text-sm font-bold focus:ring-2 ring-primary outline-none transition-all cursor-pointer hover:bg-muted/60"
              >
                {problems.map(cp => (
                  <option key={cp.id} value={cp.problem.id}>
                    {cp.label}. {cp.problem.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 px-4 py-1.5 rounded-full bg-muted/40 border border-border/60">
              <Clock className="h-4 w-4 text-primary" />
              <span className="font-mono text-sm font-bold tabular-nums">
                <Countdown target={contest.endTime} />
              </span>
            </div>
            <Button size="sm" variant="outline" className="rounded-xl border-primary/20 hover:bg-primary/5 text-primary" onClick={() => navigate(`/contests/${id}/standings`)}>
              <LayoutDashboard className="h-4 w-4 mr-2" /> Standings
            </Button>
          </div>
      </header>

      <main className="flex-1 flex overflow-hidden relative bg-background">
        <ResizablePanelGroup direction="horizontal">
            <ResizablePanel defaultSize={40} minSize={20} id="description-panel">
              <div className="h-full overflow-y-auto scrollbar-thin bg-background p-6">
                <div className="flex items-center gap-3 mb-4">
                  <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 font-mono text-xl font-black text-primary">
                    {activeProblem?.label || "A"}
                  </span>
                  <div>
                    <h1 className="font-display text-2xl font-bold">{activeProblem?.problem?.title || "Select a problem"}</h1>
                    <div className="flex items-center gap-2">
                      <DifficultyBadge value={activeProblem?.problem?.defficulty || "EASY"} />
                      {activeProblem?.problem?.visibility === "PRIVATE" && (
                        <span className="flex items-center gap-1 text-[10px] font-black uppercase text-hard bg-hard/10 px-2 py-0.5 rounded border border-hard/20">
                          <ShieldAlert className="h-3 w-3" /> Private
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Masked Problem Check */}
                {!activeProblem?.problem?.description ? (
                   <div className="mt-20 flex flex-col items-center text-center p-8 bg-muted/10 rounded-3xl border border-dashed border-border/60 stagger">
                      <div className="p-4 rounded-full bg-hard/10 text-hard mb-4 shadow-[0_0_20px_rgba(var(--hard),0.1)]">
                         <ShieldAlert className="h-10 w-10" />
                      </div>
                      <h2 className="text-xl font-black tracking-tight">Access Restricted</h2>
                      <p className="text-sm text-muted-foreground mt-2 max-w-sm">
                        This is a private contest problem. Access is restricted after the contest has ended.
                      </p>
                      <Button variant="outline" className="mt-6 rounded-2xl font-black" onClick={() => navigate(`/contests/${id}`)}>
                        Go Back
                      </Button>
                   </div>
                ) : (
                <Tabs defaultValue="desc" className="mt-8">
                  <TabsList className="bg-muted/20">
                    <TabsTrigger value="desc">Description</TabsTrigger>
                    <TabsTrigger value="examples">Examples</TabsTrigger>
                    <TabsTrigger value="submissions">My Submissions</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="desc" className="mt-6 space-y-6">
                    <div className="prose prose-invert max-w-none text-sm leading-relaxed">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {activeProblem?.problem?.description || ""}
                      </ReactMarkdown>
                    </div>
                    {activeProblem?.problem?.constraints && (
                      <div className="rounded-xl border border-border bg-muted/10 p-4">
                        <h3 className="font-mono text-[10px] font-bold uppercase tracking-widest text-primary mb-2">Constraints</h3>
                        <pre className="font-mono text-xs whitespace-pre-wrap">{activeProblem?.problem?.constraints}</pre>
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="examples" className="mt-6 space-y-4">
                    {((activeProblem?.problem?.examples as any[]) || []).map((ex, i) => (
                      <div key={i} className="rounded-xl border border-border bg-card/50 p-4">
                        <div className="font-mono text-[10px] font-bold text-primary mb-3 uppercase">Example {i + 1}</div>
                        <div className="space-y-2 text-sm font-mono">
                          <div className="bg-muted/40 p-2 rounded">
                            <span className="text-muted-foreground mr-2">Input:</span>{ex.input}
                          </div>
                          <div className="bg-muted/40 p-2 rounded">
                            <span className="text-muted-foreground mr-2">Output:</span>{ex.output}
                          </div>
                        </div>
                      </div>
                    ))}
                  </TabsContent>
                </Tabs>
                )}
              </div>
            </ResizablePanel>

            <ResizableHandle className="w-1 bg-border hover:bg-primary/50 transition-colors" />

            <ResizablePanel defaultSize={60} minSize={30}>
              <div className="h-full flex flex-col bg-background relative overflow-hidden">
                <div className="h-full flex flex-col bg-card overflow-hidden">
                    <EditorToolbar
                      onRun={() => { handleRun(false); }}
                      onSubmit={() => { handleRun(true); }}
                      running={running}
                      isFullscreen={false}
                      onToggleFullscreen={() => {}}
                      settings={editorSettings}
                      onSettingsChange={(s: any) => setEditorSettings({...editorSettings, ...s})}
                      languages={LANGUAGES}
                      activeLang={lang}
                      onLangChange={setLang}
                      // Pass contest props for Full Screen HUD
                      problems={problems}
                      activeProblem={activeProblem}
                      onProblemChange={(pid) => navigate(`/contests/${id}/workspace/${pid}`)}
                      contestTimer={contest ? <Countdown target={contest.endTime} /> : null}
                    />
                    <div className="flex-1 min-h-0 relative bg-card">
                      <Editor
                        theme={editorSettings.theme}
                        language={lang.monaco}
                        value={code}
                        onChange={(v) => setCode(v || "")}
                        options={{
                          fontSize: editorSettings.fontSize,
                          fontFamily: editorSettings.fontFamily,
                          minimap: { enabled: false },
                          automaticLayout: true,
                          padding: { top: 20 },
                          scrollbar: { verticalScrollbarSize: 8 },
                        }}
                      />
                    </div>
                    
                    {/* Output (Console) */}
                    <div
                      className={cn(
                        "relative shrink-0 border-t border-border bg-background/80 backdrop-blur-xl transition-all overflow-hidden flex flex-col shadow-[0_-4px_20px_-5px_rgba(0,0,0,0.3)]",
                        !isResizingConsole && "transition-[height] duration-300",
                        result || running ? "" : "h-12"
                      )}
                      style={result || running ? { height: `${consoleHeight}%` } : {}}
                    >
                      {/* Vertical Resize Handle */}
                      {(result || running) && (
                        <div
                          onMouseDown={handleConsoleMouseDown}
                          className="absolute top-0 left-0 right-0 h-1 cursor-row-resize hover:bg-primary/40 transition-colors z-20"
                        />
                      )}

                      <div className="flex items-center justify-between px-4 py-2 bg-muted/20 border-b border-border/40 shrink-0">
                        <div className="font-mono text-[10px] uppercase tracking-widest text-primary font-bold flex items-center gap-2">
                           <Terminal className="h-3 w-3" /> / console
                        </div>
                        {(result || running) && (
                          <button onClick={() => setResult(null)} className="text-[10px] text-muted-foreground hover:text-foreground underline">clear</button>
                        )}
                      </div>
                      <div className="flex-1 overflow-y-auto p-4 scrollbar-thin text-wrap font-mono text-xs">
                        {!result && !running && (
                          <p className="font-mono text-[11px] text-muted-foreground italic">Run your code to see testcase results.</p>
                        )}
                        {running && (
                          <div className="flex items-center gap-2 font-mono text-[11px] text-muted-foreground animate-pulse">
                            <Loader2 className="h-3 w-3 animate-spin" />
                            Running in secure sandbox...
                          </div>
                        )}
                        {result && <ResultPanel sub={result} problem={activeProblem.problem} />}
                      </div>
                    </div>
                </div>
              </div>
            </ResizablePanel>
          </ResizablePanelGroup>
        </main>
      </div>
    );
  }

// Reuse ResultPanel logic from problem detail page
function ResultPanel({ sub, problem }: { sub: Submission; problem: Problem }) {
  const ok = sub.status?.toLowerCase().includes("accept");
  const tcs = sub.testCases || [];
  const passed = sub.passedCount ?? tcs.filter((t: any) => t.passed).length;
  const total = sub.totalCount ?? tcs.length;

  const examples = Array.isArray(problem.examples)
    ? problem.examples
    : problem.examples ? Object.values(problem.examples) : [];
    
  const normalize = (s: any) => String(s ?? "")
    .replace(/\r\n/g, "\n")
    .split('\n')
    .map(line => line.trim())
    .join('\n')
    .trim();
    
  const exampleInputs = new Set(examples.map(ex => normalize((ex as any).input)));

  const formatStat = (s: string) => {
    if (!s) return "";
    if (s.includes("ms")) return s;
    if (parseFloat(s) < 1) return (parseFloat(s) * 1000).toFixed(0) + "ms";
    return s + "s";
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className={cn(
        "rounded-xl border p-4 shadow-sm transition-all",
        ok ? "border-easy/30 bg-easy/5 shadow-[0_0_20px_-10px_rgba(var(--easy),0.1)]" : "border-hard/30 bg-hard/5 shadow-[0_0_20px_-10px_rgba(var(--hard),0.1)]"
      )}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={cn("p-2 rounded-full", ok ? "bg-easy/20 text-easy" : "bg-hard/20 text-hard")}>
              {ok ? <CheckCircle2 className="h-5 w-5" /> : <XCircle className="h-5 w-5" />}
            </div>
            <div>
              <h3 className={cn("text-lg font-black tracking-tight", ok ? "text-easy" : "text-hard")}>
                {sub.status || "Finished"}
              </h3>
              <div className="flex items-center gap-3 mt-1">
                <p className="text-[11px] font-black text-muted-foreground uppercase tracking-wider">
                  {passed} / {total} Passed
                </p>
                <div className="flex h-1.5 w-24 bg-muted rounded-full overflow-hidden border border-border/20">
                  <div
                    className={cn("h-full transition-all duration-1000", ok ? "bg-easy" : "bg-hard")}
                    style={{ width: `${(passed / (total || 1)) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1 font-mono text-[10px] text-muted-foreground uppercase tracking-widest font-bold">
            <div className="flex items-center gap-2">
              <span className="bg-muted px-2 py-0.5 rounded border border-border/40 text-foreground">{sub.language}</span>
              {sub.time && <span className="bg-muted px-2 py-0.5 rounded border border-border/40 text-foreground">{formatStat(sub.time)}</span>}
            </div>
            <span className="opacity-60">{new Date().toLocaleTimeString()}</span>
          </div>
        </div>

        {(sub.compileOutput || sub.stderr) && (
          <div className="mt-4 rounded-lg bg-hard/10 border border-hard/20 p-3">
            <p className="text-[10px] font-black text-hard uppercase tracking-widest mb-1 flex items-center gap-2">
              <ShieldAlert className="h-3 w-3" /> Error Trace
            </p>
            <pre className="whitespace-pre-wrap font-mono text-xs text-hard/90 leading-relaxed scrollbar-thin max-h-40 overflow-y-auto">
              {sub.compileOutput || sub.stderr}
            </pre>
          </div>
        )}
      </div>

      <div className="space-y-4">
        <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground border-b border-border/40 pb-2 flex items-center gap-2">
           <Terminal className="h-3 w-3" /> Test Case Analysis
        </h4>

        <div className="grid gap-3">
          {/* Public Examples */}
          {tcs.filter(t => exampleInputs.has(normalize(t.stdin))).map((t, idx) => (
            <div key={idx} className={cn(
              "rounded-xl border bg-card transition-all overflow-hidden shadow-sm hover:shadow-md",
              t.passed ? "border-easy/20" : "border-hard/20"
            )}>
              <div className={cn(
                "flex items-center justify-between px-4 py-2 border-b",
                t.passed ? "bg-easy/5 border-easy/10" : "bg-hard/5 border-hard/10"
              )}>
                <span className="font-mono text-[10px] font-black uppercase tracking-tighter opacity-80">
                  Example Case #{idx + 1}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono text-muted-foreground font-bold">{formatStat(t.time)}</span>
                  {t.passed ? <CheckCircle2 className="h-3 w-3 text-easy" /> : <XCircle className="h-3 w-3 text-hard" />}
                </div>
              </div>

              <div className="p-4 space-y-3 font-mono text-xs">
                <div>
                  <span className="text-muted-foreground text-[10px] font-black uppercase block mb-1 opacity-50">Input</span>
                  <code className="block bg-muted/40 p-2 rounded border border-border/40 whitespace-pre-wrap">
                    {t.stdin || "n/a"}
                  </code>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-muted-foreground text-[10px] font-black uppercase block mb-1 opacity-50">Expected</span>
                    <code className="block bg-muted/40 p-2 rounded border border-border/40 text-easy/80 font-bold">
                      {t.expected}
                    </code>
                  </div>
                  <div>
                    <span className="text-muted-foreground text-[10px] font-black uppercase block mb-1 opacity-50">Actual Output</span>
                    <code className={cn(
                      "block p-2 rounded border font-bold",
                      t.passed ? "bg-easy/5 border-easy/20 text-easy" : "bg-hard/5 border-hard/20 text-hard"
                    )}>
                      {t.stdout || (t.status?.includes("Time") ? "TLE" : "no output")}
                    </code>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Hidden Cases Summary */}
          {(() => {
            const hPassed = sub.hiddenPassedCount ?? 0;
            const hFailed = sub.hiddenFailedCount ?? 0;
            const totalH = sub.totalHiddenCases ?? (hPassed + hFailed);
            if (totalH === 0) return null;
            const hOk = hFailed === 0;

            return (
              <div className={cn(
                "rounded-xl border p-5 transition-all shadow-sm relative overflow-hidden",
                hOk ? "bg-easy/5 border-easy/20" : "bg-hard/5 border-hard/20"
              )}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={cn("p-3 rounded-2xl", hOk ? "bg-easy/10 text-easy" : "bg-hard/10 text-hard")}>
                      {hOk ? <ShieldCheck className="h-6 w-6" /> : <ShieldAlert className="h-6 w-6" />}
                    </div>
                    <div>
                      <h4 className="text-sm font-black uppercase tracking-tight">Private Test Cases</h4>
                      <p className="text-[11px] text-muted-foreground font-medium mt-0.5">
                        {hOk ? "Passed all secret tests" : `${hFailed} hidden cases failed`}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={cn("text-2xl font-black font-mono tracking-tighter", hOk ? "text-easy" : "text-hard")}>
                      {hPassed} <span className="text-xs text-muted-foreground">/</span> {totalH}
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      </div>
    </div>
  );
}

function Countdown({ target }: { target: string | Date }) {
  const [timeLeft, setTimeLeft] = React.useState<string>("—");

  React.useEffect(() => {
    const targetDate = new Date(target).getTime();
    const update = () => {
      const now = Date.now();
      const diff = targetDate - now;
      if (diff <= 0) { setTimeLeft("00:00:00"); return; }
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      const seconds = Math.floor((diff / 1000) % 60);
      setTimeLeft(`${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`);
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [target]);

  return <span>{timeLeft}</span>;
}

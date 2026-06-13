import * as React from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Editor from "@monaco-editor/react";
import {
  problemsApi, executeApi, submissionsApi, discussApi, playlistsApi, LANGUAGES,
  type Problem, type Submission, type DiscussPost, type Playlist
} from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { useTheme } from "@/lib/theme-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { DifficultyBadge } from "@/components/difficulty-badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AICodePanel } from "@/components/ai-code-panel";
import { EditorToolbar } from "@/components/EditorToolbar";
import { ArrowLeft, CheckCircle2, XCircle, Loader2, ThumbsUp, ThumbsDown, Send, ShieldAlert, ShieldCheck, Trash2, Scale, Clock, Zap, ListChecks, Code2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Bookmark } from "lucide-react";

// Helper to format statistics (time, memory) that might be stored as JSON strings
const formatStat = (val: string | null) => {
  if (!val) return "n/a";
  let raw: string = val;
  try {
    const parsed = JSON.parse(val);
    if (Array.isArray(parsed)) raw = String(parsed[0] ?? "");
  } catch {
    /* not JSON — use as-is */
  }
  if (!raw) return "n/a";
  // Memory: "12345 KB" -> show in MB once it gets large.
  const kb = /^([\d.]+)\s*KB$/i.exec(raw.trim());
  if (kb) {
    const n = Number(kb[1]);
    return n > 1024 ? `${(n / 1024).toFixed(1)} MB` : `${Math.round(n)} KB`;
  }
  return raw;
};
import { AddToPlaylistDialog } from "@/components/PlaylistDialogs";
import * as Resizable from "react-resizable-panels";



export default function ProblemDetail() {
  const {
    PanelResizeHandle: ResizableHandle,
    Panel: ResizablePanel,
    PanelGroup: ResizablePanelGroup
  } = Resizable;

  const { problemId } = useParams();
  const { user } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();

  const [problem, setProblem] = React.useState<Problem | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const [lang, setLang] = React.useState<any>(null);
  const [code, setCode] = React.useState<string>("");
  const [running, setRunning] = React.useState(false);
  const [result, setResult] = React.useState<Submission | null>(null);
  const [submissions, setSubmissions] = React.useState<Submission[]>([]);
  const [problemDiscussions, setProblemDiscussions] = React.useState<DiscussPost[]>([]);
  const [isPlaylistOpen, setIsPlaylistOpen] = React.useState(false);
  const [userPlaylists, setUserPlaylists] = React.useState<Playlist[]>([]);
  const [isFullscreen, setIsFullscreen] = React.useState(false);
  const [editorSettings, setEditorSettings] = React.useState(() => {
    const savedW = typeof window !== "undefined" ? Number(window.localStorage.getItem("leetlab:editorWidth")) : 0;
    return {
      fontSize: 14,
      theme: theme === "light" ? "leetlab-light" : "leetlab-dark",
      fontFamily: "JetBrains Mono, monospace",
      editorWidth: savedW >= 20 && savedW <= 80 ? savedW : 60, // Default 60% for editor
    };
  });

  // Editor refs + live status (cursor position, selection, line count) for the
  // interactive status bar and keyboard shortcuts.
  const editorRef = React.useRef<any>(null);
  const monacoRef = React.useRef<any>(null);
  const handleRunRef = React.useRef<(isSubmit?: boolean) => void>(() => {});
  const [editorStatus, setEditorStatus] = React.useState({ line: 1, col: 1, selected: 0, lines: 1 });
  const [isDragging, setIsDragging] = React.useState(false);
  const [consoleHeight, setConsoleHeight] = React.useState(() => {
    const saved = typeof window !== "undefined" ? Number(window.localStorage.getItem("leetlab:consoleHeight")) : 0;
    return saved >= 12 && saved <= 85 ? saved : 40;
  });
  const [isResizingConsole, setIsResizingConsole] = React.useState(false);
  const [isMobile, setIsMobile] = React.useState(false);

  // Refs for smooth, lag-free panel resizing: during a drag we mutate the DOM
  // styles directly (throttled with rAF) and only commit to React state on
  // mouse-up, so the heavy editor tree never re-renders per frame.
  const containerRef = React.useRef<HTMLDivElement>(null);
  const leftPanelRef = React.useRef<HTMLDivElement>(null);
  const rightPanelRef = React.useRef<HTMLDivElement>(null);
  const consoleRef = React.useRef<HTMLDivElement>(null);
  const dragModeRef = React.useRef<null | "h" | "v">(null);
  const rafRef = React.useRef<number | null>(null);
  const pointerRef = React.useRef({ x: 0, y: 0 });
  const widthCommitRef = React.useRef(0);
  const heightCommitRef = React.useRef(0);

  React.useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const applyDrag = React.useCallback(() => {
    rafRef.current = null;
    const mode = dragModeRef.current;
    if (mode === "h" && containerRef.current && leftPanelRef.current && rightPanelRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      let leftW = ((pointerRef.current.x - rect.left) / rect.width) * 100;
      leftW = Math.min(Math.max(leftW, 20), 80);
      leftPanelRef.current.style.width = `${leftW}%`;
      rightPanelRef.current.style.width = `${100 - leftW}%`;
      widthCommitRef.current = 100 - leftW;
    } else if (mode === "v" && rightPanelRef.current && consoleRef.current) {
      const rect = rightPanelRef.current.getBoundingClientRect();
      let h = ((rect.bottom - pointerRef.current.y) / rect.height) * 100;
      h = Math.min(Math.max(h, 12), 85);
      consoleRef.current.style.height = `${h}%`;
      heightCommitRef.current = h;
    }
  }, []);

  const onDragMove = React.useCallback((e: MouseEvent) => {
    pointerRef.current = { x: e.clientX, y: e.clientY };
    if (rafRef.current == null) rafRef.current = requestAnimationFrame(applyDrag);
  }, [applyDrag]);

  const endDrag = React.useCallback(() => {
    window.removeEventListener("mousemove", onDragMove);
    window.removeEventListener("mouseup", endDrag);
    document.body.style.cursor = "";
    document.body.style.userSelect = "";
    if (rafRef.current != null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    const mode = dragModeRef.current;
    dragModeRef.current = null;
    if (mode === "h") {
      setIsDragging(false);
      if (widthCommitRef.current > 0) {
        const w = widthCommitRef.current;
        setEditorSettings((s) => ({ ...s, editorWidth: w }));
        window.localStorage.setItem("leetlab:editorWidth", String(Math.round(w)));
      }
    } else if (mode === "v") {
      setIsResizingConsole(false);
      if (heightCommitRef.current > 0) {
        const h = heightCommitRef.current;
        setConsoleHeight(h);
        window.localStorage.setItem("leetlab:consoleHeight", String(Math.round(h)));
      }
    }
  }, [onDragMove]);

  const startDrag = React.useCallback(
    (mode: "h" | "v") => (e: React.MouseEvent) => {
      if (window.innerWidth < 1024) return;
      e.preventDefault();
      dragModeRef.current = mode;
      widthCommitRef.current = 0;
      heightCommitRef.current = 0;
      if (mode === "h") setIsDragging(true);
      else setIsResizingConsole(true);
      document.body.style.cursor = "grabbing";
      document.body.style.userSelect = "none";
      window.addEventListener("mousemove", onDragMove);
      window.addEventListener("mouseup", endDrag);
    },
    [onDragMove, endDrag]
  );

  React.useEffect(() => () => endDrag(), [endDrag]);

  React.useEffect(() => {
    let cancel = false;
    (async () => {
      setLoading(true); setError(null);
      try {
        const res: any = await problemsApi.get(problemId!);
        const p: Problem = res.problem || res.data;
        if (!cancel) {
          setProblem(p);

          // Dynamic Language filtering: only show what the problem supports
          const supportedLangs = LANGUAGES.filter(l =>
            (p.codeSnippets && p.codeSnippets[l.key]) ||
            (p.referenceSolutions && p.referenceSolutions[l.key])
          );

          // Fallback to all if somehow none match, but usually pick first supported
          const available = supportedLangs.length > 0 ? supportedLangs : LANGUAGES;
          const initial = available[0];

          setLang(initial);
          setCode(p.codeSnippets?.[initial.key] || "");
        }
      } catch (err: any) {
        if (!cancel) setError(err.message || "Failed to load problem");
      } finally { if (!cancel) setLoading(false); }
    })();
    return () => { cancel = true; };
  }, [problemId]);

  React.useEffect(() => {
    if (!problem || !lang) return;
    setCode(problem.codeSnippets?.[lang.key] || code || "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang?.key, problem?.id]);

  React.useEffect(() => {
    if (!user || !problemId) return;
    submissionsApi.byProblem(problemId).then((res: any) => {
      setSubmissions(res.submissions || res.data || []);
    }).catch(() => { });
  }, [user, problemId, result]);

  const [unifiedDiscussion, setUnifiedDiscussion] = React.useState<any>(null);

  React.useEffect(() => {
    if (!problemId) return;
    discussApi.byProblem(problemId).then((res: any) => {
      setUnifiedDiscussion(res.discussion || null);
    }).catch(() => { });
  }, [problemId]);

  React.useEffect(() => {
    if (user) {
      playlistsApi.all().then((res: any) => {
        setUserPlaylists(res.playlists || []);
      }).catch(() => { });
    }
  }, [user, isPlaylistOpen]); // Re-fetch when user changes or after a playlist modification (dialog closes)

  const handleRun = async (isSubmit: boolean = false) => {
    if (!user) { toast.error("Sign in to run code"); navigate("/login"); return; }
    if (!problem) return;

    // Auto-open console if it's currently small/closed
    setConsoleHeight(prev => Math.max(prev, 35));
    setRunning(true);
    setResult(null);
    try {
      // If submitting, don't send test cases (backend fetches hidden ones)
      // If running, send examples as test cases
      const examples: any[] = Array.isArray(problem.examples)
        ? problem.examples
        : (problem.examples ? Object.values(problem.examples) : []);

      const stdins = !isSubmit ? examples.map((t) => String(t.input ?? "")) : undefined;
      const expected = !isSubmit ? examples.map((t) => String(t.output ?? "")) : undefined;

      const res: any = await executeApi.run({
        source_code: code,
        language_id: lang.id,
        stdin: stdins,
        expected_outputs: expected,
        problemId: problem.id,
        isSubmit: isSubmit
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

      const ok = sub.status?.toLowerCase().includes("accept");
      if (ok) {
        toast.success(isSubmit ? "Solution Accepted! 🎉" : "All testcases passed ✓");
      } else {
        toast.error(sub.status || "Wrong answer");
      }

      // Refresh submissions if it was a real submit
      if (isSubmit) {
        submissionsApi.byProblem(problemId!).then((res: any) => {
          setSubmissions(res.submissions || res.data || []);
        }).catch(() => { });
      }
    } catch (err: any) {
      toast.error(err.message || "Execution failed");
    } finally {
      setRunning(false);
    }
  };

  // Keep the latest handleRun reachable from Monaco command callbacks (which
  // capture a stale closure at mount time).
  React.useEffect(() => {
    handleRunRef.current = handleRun;
  });

  // Follow the app's light/dark mode for the editor — but only when the user is
  // on one of the default themes (don't override hand-picked themes like Monokai).
  React.useEffect(() => {
    setEditorSettings((s) => {
      const isDefault = ["leetlab-dark", "leetlab-light", "vs-dark", "light"].includes(s.theme);
      if (!isDefault) return s;
      const next = theme === "light" ? "leetlab-light" : "leetlab-dark";
      return s.theme === next ? s : { ...s, theme: next };
    });
  }, [theme]);

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-3.5rem)] items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary opacity-80" />
          <p className="text-xs font-mono text-muted-foreground animate-pulse tracking-widest uppercase">Initializing Workspace...</p>
        </div>
      </div>
    );
  }

  if (error || !problem || !lang) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center">
        <h1 className="font-display text-2xl font-bold">Problem unavailable</h1>
        <p className="mt-2 text-sm text-muted-foreground">{error || "Not found"}</p>
        <Button asChild className="mt-6"><Link to="/problems"><ArrowLeft className="h-4 w-4" />Back to problemset</Link></Button>
      </div>
    );
  }

  const examples: any[] = Array.isArray(problem.examples)
    ? problem.examples
    : problem.examples ? Object.values(problem.examples) : [];

  const isProblemSaved = userPlaylists.some(p =>
    p.problems?.some(pp => pp.problem.id === problemId)
  );

  return (
    <div className={cn(
      "flex flex-col bg-background",
      isFullscreen ? "fixed inset-0 z-50 h-screen w-screen" : "min-h-screen h-screen"
    )}>
      <div
        ref={containerRef}
        className={cn(
        "flex-1 flex relative bg-background",
        isMobile ? "flex-col overflow-y-auto overflow-x-hidden" : "flex-row overflow-hidden"
      )}>
        {/* Workspace Background Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
        
        {/* Left: description - Hidden in Fullscreen */}
        {!isFullscreen && (
          <>
            <div
              ref={leftPanelRef}
              className={cn(
                "bg-background/40 backdrop-blur-sm shrink-0 flex flex-col",
                !isDragging && "transition-all duration-300",
                isMobile ? "w-full border-b border-border" : "border-r border-border h-full overflow-hidden"
              )}
              style={isMobile ? {} : { width: `${100 - editorSettings.editorWidth}%` }}
            >
              <div className={cn("p-4 md:p-6 flex-1 flex flex-col overflow-hidden")}>
                <div className="shrink-0">
                  <Link to="/problems" className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors group">
                    <ArrowLeft className="h-3 w-3 group-hover:-translate-x-0.5 transition-transform" /> All problems
                  </Link>
                  <div className="mt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <h1 className="font-display text-xl md:text-2xl font-bold tracking-tight text-foreground">{problem.title}</h1>
                      <DifficultyBadge value={problem.defficulty} />
                    </div>
                    <Button
                      variant={isProblemSaved ? "secondary" : "outline"}
                      size="sm"
                      className={cn(
                        "flex items-center gap-2 h-8 w-fit shrink-0 transition-all duration-300",
                        isProblemSaved && "bg-primary/20 border-primary/30 text-primary hover:bg-primary/30 shadow-[0_0_10px_rgba(var(--primary),0.1)]"
                      )}
                      onClick={() => setIsPlaylistOpen(true)}
                    >
                      <Bookmark className={cn("h-4 w-4", isProblemSaved && "fill-current")} />
                      {isProblemSaved ? "Saved" : "Save"}
                    </Button>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {problem.tags?.map((t) => (
                      <span
                        key={t}
                        className="inline-flex items-center gap-1 rounded-md bg-primary/5 px-2 py-0.5 font-mono text-[10px] font-medium text-muted-foreground border border-border/50 transition-colors hover:border-primary/40 hover:text-foreground"
                      >
                        <span className="text-primary/60">#</span>{t}
                      </span>
                    ))}
                  </div>
                </div>

                <Tabs defaultValue="desc" className="mt-6 flex-1 flex flex-col overflow-hidden">
                  <TabsList className="w-full justify-start h-11 gap-1 bg-muted/30 p-1 overflow-x-auto overflow-y-hidden scrollbar-none flex-nowrap shrink-0 border border-border/50 rounded-xl">
                    {[
                      { v: "desc", l: "Description" },
                      { v: "examples", l: "Examples" },
                      { v: "hints", l: "Hints" },
                      { v: "ai", l: "AI" },
                      { v: "subs", l: "Submissions" },
                      { v: "discuss", l: "Discuss" },
                    ].map((t) => (
                      <TabsTrigger
                        key={t.v}
                        value={t.v}
                        className="min-w-fit rounded-lg px-3 text-[11px] md:text-xs font-medium text-muted-foreground transition-all hover:text-foreground data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:font-semibold data-[state=active]:shadow-sm data-[state=active]:ring-1 data-[state=active]:ring-primary/20"
                      >
                        {t.l}
                      </TabsTrigger>
                    ))}
                  </TabsList>

                  <div className="flex-1 overflow-y-auto mt-4 scrollbar-thin pr-2">
                    <TabsContent value="ai" className="mt-0 animate-in fade-in duration-300">
                      <AICodePanel
                        code={code}
                        language={lang.key}
                        problemTitle={problem.title}
                        problemDescription={problem.description}
                      />
                    </TabsContent>

                    <TabsContent value="desc" className="mt-0 space-y-6 animate-in fade-in duration-300">
                      <div className="prose max-w-none whitespace-pre-wrap text-[15px] leading-7 text-foreground/90 font-sans">
                        {problem.description}
                      </div>
                      {problem.constraints && (
                        <div className="rounded-xl border border-border bg-card/50 p-4 shadow-sm">
                          <div className="mb-3 flex items-center gap-2">
                            <span className="grid h-6 w-6 place-items-center rounded-md bg-primary/10 text-primary ring-1 ring-primary/20">
                              <Scale className="h-3.5 w-3.5" />
                            </span>
                            <h3 className="font-display text-xs font-bold uppercase tracking-widest text-primary">Constraints</h3>
                          </div>
                          <pre className="whitespace-pre-wrap font-mono text-[13px] leading-relaxed text-foreground/80">{problem.constraints}</pre>
                        </div>
                      )}

                      {/* Placeholder for future detailed stats or info to fill space */}
                      <div className="pt-10 pb-20 opacity-30 flex flex-col items-center gap-3 select-none">
                         <div className="h-px w-full bg-gradient-to-r from-transparent via-border to-transparent" />
                         <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-muted-foreground">End of Documentation</span>
                      </div>
                    </TabsContent>

                    <TabsContent value="examples" className="mt-0 space-y-4 animate-in fade-in duration-300">
                      {examples.length === 0 && <p className="text-sm text-muted-foreground">No examples provided.</p>}
                      {examples.map((ex, i) => (
                        <div key={i} className="rounded-xl border border-border bg-card/40 p-4 shadow-sm backdrop-blur-sm">
                          <div className="font-mono text-[10px] uppercase tracking-widest text-primary font-bold">Example {i + 1}</div>
                          <div className="mt-3 space-y-2 text-sm">
                            {ex.input !== undefined && (
                              <div className="flex gap-2">
                                <span className="font-semibold text-muted-foreground shrink-0 w-12">Input:</span>
                                <code className="font-mono bg-muted/40 px-1.5 py-0.5 rounded text-xs">{String(ex.input) || "none"}</code>
                              </div>
                            )}
                            {ex.output !== undefined && (
                              <div className="flex gap-2">
                                <span className="font-semibold text-muted-foreground shrink-0 w-12">Output:</span>
                                <code className="font-mono bg-muted/40 px-1.5 py-0.5 rounded text-xs">{String(ex.output)}</code>
                              </div>
                            )}
                            {ex.explanation && (
                              <div className="mt-2 text-muted-foreground text-xs italic border-l-2 border-primary/20 pl-3">
                                {ex.explanation}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </TabsContent>

                    <TabsContent value="hints" className="mt-0 space-y-4 animate-in fade-in duration-300">
                      {problem.hints ? (
                        <div className="rounded-xl border border-border bg-card/40 p-4 backdrop-blur-sm">
                          <h3 className="text-xs font-bold uppercase tracking-widest text-primary mb-2">Hints</h3>
                          <div className="whitespace-pre-wrap text-sm text-foreground/80">{problem.hints}</div>
                        </div>
                      ) : <p className="text-sm text-muted-foreground italic text-center py-8">No hints — you've got this.</p>}
                      {problem.editorial && (
                        <div className="rounded-xl border border-border bg-primary/5 p-4 backdrop-blur-sm">
                          <h3 className="font-display text-xs font-semibold uppercase tracking-widest text-primary">Editorial</h3>
                          <div className="mt-2 whitespace-pre-wrap text-sm leading-relaxed">{problem.editorial}</div>
                        </div>
                      )}
                    </TabsContent>

                    <TabsContent value="subs" className="mt-0 animate-in fade-in duration-300">
                      {!user && <p className="text-sm text-muted-foreground">Sign in to view your submissions.</p>}
                      {user && submissions.length === 0 && <p className="text-sm text-muted-foreground">No submissions yet.</p>}
                      <div className="space-y-2">
                        {submissions.map((s) => {
                          const ok = s.status?.toLowerCase().includes("accept");
                          return (
                            <div
                              key={s.id}
                              onClick={async () => {
                                try {
                                  const { submission: fullSub } = await submissionsApi.get(s.id);
                                  setResult(fullSub);
                                  if (consoleHeight < 15) setConsoleHeight(40);
                                  // Clear any existing toast so the new one plays a fresh enter animation
                                  toast.dismiss();
                                  toast.info(`Viewing submission from ${new Date(s.createdAt!).toLocaleTimeString()}`, {
                                    className: "toast-slide-in",
                                  });
                                } catch (err: any) {
                                  toast.error("Failed to load submission details");
                                }
                              }}
                              className="flex flex-col sm:flex-row sm:items-center justify-between rounded-lg border border-border bg-card/40 p-3 text-sm hover:border-primary/30 transition-colors cursor-pointer group gap-3 backdrop-blur-sm"
                            >
                              <div className="flex items-center justify-between sm:justify-start gap-2">
                                <div className="flex items-center gap-2 min-w-0">
                                  {ok ? <CheckCircle2 className="h-4 w-4 text-easy shrink-0" /> : <XCircle className="h-4 w-4 text-hard shrink-0" />}
                                  <span className={cn("font-bold truncate", ok ? "text-easy" : "text-hard")}>{s.status}</span>
                                </div>
                                <span className="font-mono text-[9px] md:text-[10px] bg-muted/60 px-1.5 py-0.5 rounded text-muted-foreground uppercase shrink-0">{s.language}</span>
                              </div>
                              <div className="flex items-center justify-between sm:justify-end gap-3 font-mono text-[10px] text-muted-foreground border-t sm:border-0 pt-2 sm:pt-0">
                                <div className="flex items-center gap-3">
                                  {s.time && <span className="hidden xs:inline">{formatStat(s.time)}</span>}
                                  {s.memory && <span className="hidden xs:inline">{formatStat(s.memory)}</span>}
                                  <span className="text-[9px] bg-muted/40 px-1.5 py-0.5 rounded whitespace-nowrap">
                                    {new Date(s.createdAt).toLocaleDateString()}
                                  </span>
                                </div>
                                <span className="opacity-0 group-hover:opacity-100 transition-opacity text-primary font-bold text-[9px] sm:text-[10px] shrink-0">VIEW →</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </TabsContent>
                    <TabsContent value="discuss" className="mt-0 animate-in fade-in duration-300">
                      <DiscussionPanel
                        problemId={problemId!}
                        discussion={unifiedDiscussion}
                        setDiscussion={setUnifiedDiscussion}
                      />
                    </TabsContent>
                  </div>
                </Tabs>
              </div>
            </div>
            {/* Drag Handle - Desktop Only */}
            {!isMobile && (
              <div
                onMouseDown={startDrag("h")}
                className={cn(
                  "group/handle relative z-10 flex h-full w-1.5 shrink-0 cursor-grab items-center justify-center transition-colors active:cursor-grabbing",
                  isDragging ? "bg-primary/60" : "bg-border/40 hover:bg-primary/30"
                )}
              >
                <span className="pointer-events-none absolute inset-y-0 -left-1.5 -right-1.5" />
                <span className={cn(
                  "pointer-events-none h-8 w-0.5 rounded-full transition-colors",
                  isDragging ? "bg-primary-foreground/60" : "bg-foreground/20 group-hover/handle:bg-primary/60"
                )} />
              </div>
            )}
          </>
        )}

        {/* Right: editor + result */}
        <div
          ref={rightPanelRef}
          className={cn(
            "flex flex-col bg-card shrink-0",
            !isDragging && "transition-all duration-300",
            isMobile ? "w-full min-h-screen" : "h-full overflow-hidden"
          )}
          style={isMobile ? {} : { width: isFullscreen ? "100%" : `${editorSettings.editorWidth}%` }}
        >
          <EditorToolbar
            onRun={() => handleRun(false)}
            onSubmit={() => handleRun(true)}
            running={running}
            isFullscreen={isFullscreen}
            onToggleFullscreen={() => setIsFullscreen(!isFullscreen)}
            settings={editorSettings}
            onSettingsChange={setEditorSettings}
            languages={LANGUAGES.filter(l =>
              (problem?.codeSnippets && problem.codeSnippets[l.key]) ||
              (problem?.referenceSolutions && problem.referenceSolutions[l.key])
            ).length > 0 ? LANGUAGES.filter(l =>
              (problem?.codeSnippets && problem.codeSnippets[l.key]) ||
              (problem?.referenceSolutions && problem.referenceSolutions[l.key])
            ) : LANGUAGES}
            activeLang={lang}
            onLangChange={(l) => {
              setLang(l);
              setCode(problem?.codeSnippets?.[l.key] || "");
            }}
          />

          <div className="flex-1 relative overflow-hidden group/editor flex flex-col">
            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-primary/20 to-transparent z-10" />
            <div className="flex-1 relative">
              <Editor
                key={editorSettings.theme}
                height="100%"
                language={lang.monaco}
                theme={editorSettings.theme}
                value={code}
                onChange={(v) => setCode(v ?? "")}
                beforeMount={(monaco) => {
                  // Shared, richly-coloured token rules for readable syntax
                  // highlighting (GitHub-inspired palettes).
                  const darkRules = [
                    { token: 'comment', foreground: '8b949e', fontStyle: 'italic' },
                    { token: 'keyword', foreground: 'ff7b72' },
                    { token: 'keyword.control', foreground: 'ff7b72' },
                    { token: 'operator', foreground: 'ff7b72' },
                    { token: 'operators', foreground: 'ff7b72' },
                    { token: 'string', foreground: 'a5d6ff' },
                    { token: 'string.escape', foreground: '79c0ff' },
                    { token: 'number', foreground: '79c0ff' },
                    { token: 'regexp', foreground: '7ee787' },
                    { token: 'type', foreground: 'ffa657' },
                    { token: 'type.identifier', foreground: 'ffa657' },
                    { token: 'namespace', foreground: 'ffa657' },
                    { token: 'function', foreground: 'd2a8ff' },
                    { token: 'variable', foreground: 'e6edf3' },
                    { token: 'variable.predefined', foreground: '79c0ff' },
                    { token: 'constant', foreground: '79c0ff' },
                    { token: 'delimiter', foreground: '8b949e' },
                    { token: 'tag', foreground: '7ee787' },
                    { token: 'attribute.name', foreground: '79c0ff' },
                    { token: 'attribute.value', foreground: 'a5d6ff' },
                  ];
                  const lightRules = [
                    { token: 'comment', foreground: '6e7781', fontStyle: 'italic' },
                    { token: 'keyword', foreground: 'cf222e' },
                    { token: 'keyword.control', foreground: 'cf222e' },
                    { token: 'operator', foreground: 'cf222e' },
                    { token: 'operators', foreground: 'cf222e' },
                    { token: 'string', foreground: '0a3069' },
                    { token: 'string.escape', foreground: '0550ae' },
                    { token: 'number', foreground: '0550ae' },
                    { token: 'regexp', foreground: '116329' },
                    { token: 'type', foreground: '953800' },
                    { token: 'type.identifier', foreground: '953800' },
                    { token: 'namespace', foreground: '953800' },
                    { token: 'function', foreground: '8250df' },
                    { token: 'variable', foreground: '1f2328' },
                    { token: 'constant', foreground: '0550ae' },
                    { token: 'delimiter', foreground: '6e7781' },
                    { token: 'tag', foreground: '116329' },
                    { token: 'attribute.name', foreground: '0550ae' },
                    { token: 'attribute.value', foreground: '0a3069' },
                  ];

                  // Primary dark theme (matches the app's dark mode)
                  monaco.editor.defineTheme('leetlab-dark', {
                    base: 'vs-dark',
                    inherit: true,
                    rules: darkRules,
                    colors: {
                      'editor.background': '#0d1117',
                      'editor.foreground': '#e6edf3',
                      'editorLineNumber.foreground': '#484f58',
                      'editorLineNumber.activeForeground': '#c9d1d9',
                      'editor.selectionBackground': '#264f78',
                      'editor.inactiveSelectionBackground': '#264f7855',
                      'editor.lineHighlightBackground': '#161b2280',
                      'editorCursor.foreground': '#58a6ff',
                      'editorIndentGuide.background': '#21262d',
                      'editorIndentGuide.activeBackground': '#30363d',
                      'editorBracketMatch.background': '#3fb95033',
                      'editorBracketMatch.border': '#3fb95080',
                      'editorWidget.background': '#161b22',
                      'editorWidget.border': '#30363d',
                      'editorSuggestWidget.background': '#161b22',
                      'editorSuggestWidget.selectedBackground': '#1f6feb44',
                      'scrollbarSlider.background': '#484f5855',
                      'scrollbarSlider.hoverBackground': '#484f5888',
                      'editorStickyScroll.background': '#0d1117',
                    },
                  });

                  // Primary light theme (soft, matches the app's light mode)
                  monaco.editor.defineTheme('leetlab-light', {
                    base: 'vs',
                    inherit: true,
                    rules: lightRules,
                    colors: {
                      'editor.background': '#fbfcfe',
                      'editor.foreground': '#1f2328',
                      'editorLineNumber.foreground': '#aab1bd',
                      'editorLineNumber.activeForeground': '#1f2328',
                      'editor.selectionBackground': '#b6d7ff80',
                      'editor.lineHighlightBackground': '#eef2f7',
                      'editorCursor.foreground': '#2563eb',
                      'editorIndentGuide.background': '#e6e9ee',
                      'editorIndentGuide.activeBackground': '#c4cad3',
                      'editorBracketMatch.background': '#2563eb1f',
                      'editorBracketMatch.border': '#2563eb55',
                      'editorWidget.background': '#ffffff',
                      'editorWidget.border': '#e6e9ee',
                      'scrollbarSlider.background': '#c4cad366',
                      'editorStickyScroll.background': '#fbfcfe',
                    },
                  });

                  // Oceanic Blue
                  monaco.editor.defineTheme('oceanic', {
                    base: 'vs-dark',
                    inherit: true,
                    rules: [
                      { token: 'comment', foreground: '65737e', fontStyle: 'italic' },
                      { token: 'keyword', foreground: 'c594c5' },
                      { token: 'operator', foreground: 'c594c5' },
                      { token: 'string', foreground: '99c794' },
                      { token: 'number', foreground: 'f99157' },
                      { token: 'type', foreground: 'fac863' },
                      { token: 'function', foreground: '6699cc' },
                      { token: 'constant', foreground: 'f99157' },
                    ],
                    colors: {
                      'editor.background': '#1b2b34',
                      'editor.foreground': '#d4d4d4',
                      'editorLineNumber.foreground': '#4f5b66',
                      'editor.selectionBackground': '#4f5b6650',
                      'editor.lineHighlightBackground': '#24343d',
                      'editorCursor.foreground': '#6699cc',
                      'editorIndentGuide.background': '#2b3a42',
                      'editorIndentGuide.activeBackground': '#3e515b',
                    },
                  });

                  // Monokai
                  monaco.editor.defineTheme('monokai', {
                    base: 'vs-dark',
                    inherit: true,
                    rules: [
                      { token: 'comment', foreground: '75715e', fontStyle: 'italic' },
                      { token: 'keyword', foreground: 'f92672' },
                      { token: 'operator', foreground: 'f92672' },
                      { token: 'string', foreground: 'e6db74' },
                      { token: 'number', foreground: 'ae81ff' },
                      { token: 'constant', foreground: 'ae81ff' },
                      { token: 'type', foreground: '66d9ef', fontStyle: 'italic' },
                      { token: 'function', foreground: 'a6e22e' },
                      { token: 'variable', foreground: 'f8f8f2' },
                    ],
                    colors: {
                      'editor.background': '#272822',
                      'editor.foreground': '#f8f8f2',
                      'editorLineNumber.foreground': '#90908a',
                      'editor.selectionBackground': '#49483e',
                      'editor.lineHighlightBackground': '#3e3d32',
                      'editorCursor.foreground': '#f8f8f0',
                      'editorIndentGuide.background': '#3b3a32',
                      'editorIndentGuide.activeBackground': '#595849',
                    },
                  });

                  // Cyberpunk Neon
                  monaco.editor.defineTheme('cyberpunk', {
                    base: 'vs-dark',
                    inherit: true,
                    rules: [
                      { token: 'comment', foreground: '32cd32', fontStyle: 'italic' },
                      { token: 'keyword', foreground: 'ff00ff', fontStyle: 'bold' },
                      { token: 'operator', foreground: 'ff5edb' },
                      { token: 'string', foreground: '00ffff' },
                      { token: 'number', foreground: 'fffb00' },
                      { token: 'type', foreground: 'ff8a00' },
                      { token: 'function', foreground: '00ff9f' },
                      { token: 'constant', foreground: 'fffb00' },
                    ],
                    colors: {
                      'editor.background': '#10002b',
                      'editor.foreground': '#ffffff',
                      'editorLineNumber.foreground': '#7b2cbf',
                      'editor.selectionBackground': '#5a189a',
                      'editor.lineHighlightBackground': '#240046',
                      'editorCursor.foreground': '#ff00ff',
                      'editorIndentGuide.background': '#2d0a52',
                      'editorIndentGuide.activeBackground': '#5a189a',
                    },
                  });

                  // One Dark
                  monaco.editor.defineTheme('one-dark', {
                    base: 'vs-dark',
                    inherit: true,
                    rules: [
                      { token: 'comment', foreground: '5c6370', fontStyle: 'italic' },
                      { token: 'keyword', foreground: 'c678dd' },
                      { token: 'operator', foreground: '56b6c2' },
                      { token: 'string', foreground: '98c379' },
                      { token: 'number', foreground: 'd19a66' },
                      { token: 'type', foreground: 'e5c07b' },
                      { token: 'function', foreground: '61afef' },
                      { token: 'constant', foreground: 'd19a66' },
                      { token: 'variable', foreground: 'e06c75' },
                    ],
                    colors: {
                      'editor.background': '#282c34',
                      'editor.foreground': '#abb2bf',
                      'editorLineNumber.foreground': '#4b5263',
                      'editor.selectionBackground': '#3e4451',
                      'editor.lineHighlightBackground': '#2c313c',
                      'editorCursor.foreground': '#528bff',
                      'editorIndentGuide.background': '#3b4048',
                      'editorIndentGuide.activeBackground': '#545862',
                    },
                  });
                }}
                onMount={(editor, monaco) => {
                  editorRef.current = editor;
                  monacoRef.current = monaco;

                  // Keyboard shortcuts: Ctrl/Cmd+Enter = Run, +Shift = Submit.
                  editor.addAction({
                    id: "leetlab-run",
                    label: "Run Code",
                    keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter],
                    run: () => handleRunRef.current?.(false),
                  });
                  editor.addAction({
                    id: "leetlab-submit",
                    label: "Submit Code",
                    keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.Enter],
                    run: () => handleRunRef.current?.(true),
                  });

                  const updateStatus = () => {
                    const pos = editor.getPosition();
                    const model = editor.getModel();
                    const sel = editor.getSelection();
                    const selected = sel && model ? model.getValueInRange(sel).length : 0;
                    setEditorStatus({
                      line: pos?.lineNumber ?? 1,
                      col: pos?.column ?? 1,
                      selected,
                      lines: model?.getLineCount() ?? 1,
                    });
                  };
                  editor.onDidChangeCursorSelection(updateStatus);
                  editor.onDidChangeModelContent(updateStatus);
                  updateStatus();
                }}
                options={{
                  fontFamily: editorSettings.fontFamily,
                  fontSize: editorSettings.fontSize,
                  lineHeight: 1.7, // More breathing room
                  letterSpacing: 0.4,
                  minimap: { enabled: false },
                  scrollBeyondLastLine: false,
                  padding: { top: 20, bottom: 20 },
                  automaticLayout: true,
                  cursorSmoothCaretAnimation: "on",
                  cursorBlinking: "smooth", // Modern smooth blink
                  cursorStyle: "line",
                  cursorWidth: 2,
                  smoothScrolling: true,
                  mouseWheelZoom: true, // Ctrl + wheel to zoom
                  lineNumbersMinChars: 4,
                  roundedSelection: true,
                  matchBrackets: "always",
                  selectionHighlight: true,
                  stickyScroll: { enabled: true }, // keep current scope pinned on top
                  bracketPairColorization: { enabled: true },
                  guides: {
                    indentation: true,
                    bracketPairs: true,
                    highlightActiveIndentation: true,
                    highlightActiveBracketPair: true,
                  },
                  renderLineHighlight: "all", // Highlight whole line
                  renderWhitespace: "selection",
                  suggestOnTriggerCharacters: true,
                  quickSuggestions: { other: true, comments: true, strings: true },
                  tabSize: 4,
                  fixedOverflowWidgets: true,
                  scrollbar: {
                    verticalScrollbarSize: 10,
                    horizontalScrollbarSize: 10,
                    useShadows: true,
                  },
                  fontLigatures: true,
                }}
              />
              {/* Floating Language Indicator */}
              <div className="absolute right-6 bottom-6 opacity-0 group-hover/editor:opacity-100 transition-all duration-500 translate-y-2 group-hover/editor:translate-y-0 pointer-events-none z-10">
                <div className="flex items-center gap-3 px-3 py-1.5 rounded-full bg-background/80 backdrop-blur-xl border border-primary/20 shadow-2xl glow-primary-sm">
                  <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                  <span className="text-[10px] font-bold font-mono text-foreground uppercase tracking-widest">
                    {lang.name}
                  </span>
                </div>
              </div>
            </div>

            {/* Interactive status bar */}
            <div className="flex items-center justify-between gap-3 border-t border-border/40 bg-background/60 px-4 py-1 font-mono text-[10px] text-muted-foreground backdrop-blur-xl shrink-0">
              <div className="flex items-center gap-2.5">
                <span className="flex items-center gap-1.5 text-foreground">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                  {lang.name}
                </span>
                <span className="text-border">|</span>
                <span>Ln {editorStatus.line}, Col {editorStatus.col}</span>
                {editorStatus.selected > 0 && (
                  <>
                    <span className="text-border">|</span>
                    <span className="text-primary">{editorStatus.selected} selected</span>
                  </>
                )}
              </div>
              <div className="flex items-center gap-2.5">
                <span>{editorStatus.lines} {editorStatus.lines === 1 ? "line" : "lines"}</span>
                <span className="text-border hidden sm:inline">|</span>
                <span className="hidden sm:inline">Spaces: 4</span>
                <span className="text-border hidden md:inline">|</span>
                <span className="hidden md:inline text-muted-foreground/80">⌘/Ctrl+↵ Run · ⇧+↵ Submit</span>
              </div>
            </div>
          </div>

          <div
            ref={consoleRef}
            className={cn(
              "relative border-t border-border bg-background/80 backdrop-blur-xl overflow-hidden flex flex-col shadow-[0_-4px_20px_-5px_rgba(0,0,0,0.3)]",
              !isResizingConsole && "transition-[height] duration-300",
              result || running ? "" : "h-12"
            )}
            style={result || running ? { height: `${consoleHeight}%` } : {}}
          >
            {/* Vertical Resize Handle */}
            {(result || running) && (
              <div
                onMouseDown={startDrag("v")}
                className="group/vh absolute top-0 left-0 right-0 z-20 flex h-2.5 cursor-grab items-center justify-center active:cursor-grabbing"
              >
                <span className={cn(
                  "h-0.5 w-10 rounded-full transition-all",
                  isResizingConsole ? "w-16 bg-primary" : "bg-foreground/20 group-hover/vh:bg-primary/60 group-hover/vh:w-16"
                )} />
              </div>
            )}

            <div className="flex items-center justify-between px-4 py-2 bg-muted/20 border-b border-border/40 shrink-0">
              <div className="font-mono text-[10px] uppercase tracking-widest text-primary font-bold">/ console</div>
              {(result || running) && (
                <button onClick={() => setResult(null)} className="text-[10px] text-muted-foreground hover:text-foreground underline">clear</button>
              )}
            </div>
            <div className="flex-1 overflow-y-auto p-4 scrollbar-thin text-wrap">
              {!result && !running && (
                <p className="font-mono text-[11px] text-muted-foreground italic">Run your code to see testcase results.</p>
              )}
              {running && (
                <div className="flex items-center gap-2 font-mono text-[11px] text-muted-foreground">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Running in secure sandbox...
                </div>
              )}
              {result && <ResultPanel sub={result} problem={problem} />}
            </div>
          </div>
        </div>
      </div>

      <AddToPlaylistDialog
        open={isPlaylistOpen}
        onOpenChange={setIsPlaylistOpen}
        problemId={problem.id}
      />
    </div>
  );
}

function ResultPanel({ sub, problem }: { sub: Submission; problem: Problem }) {
  const ok = sub.status?.toLowerCase().includes("accept");
  const tcs = sub.testCases || [];
  const passed = sub.passedCount ?? tcs.filter((t) => t.passed).length;
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



  const pct = Math.round((passed / (total || 1)) * 100);

  return (
    <div className="mt-3 space-y-5">
      {/* Submission Summary Header */}
      <div className={cn(
        "relative overflow-hidden rounded-2xl border p-5 shadow-sm transition-all",
        ok ? "border-easy/30 bg-linear-to-br from-easy/8 to-transparent" : "border-hard/30 bg-linear-to-br from-hard/8 to-transparent"
      )}>
        {/* Decorative glow */}
        <div className={cn(
          "pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full blur-3xl opacity-20",
          ok ? "bg-easy" : "bg-hard"
        )} />

        <div className="relative flex items-start justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className={cn(
              "grid h-12 w-12 place-items-center rounded-2xl ring-1 animate-in zoom-in duration-500",
              ok ? "bg-easy/15 text-easy ring-easy/30" : "bg-hard/15 text-hard ring-hard/30"
            )}>
              {ok ? <CheckCircle2 className="h-6 w-6" /> : <XCircle className="h-6 w-6" />}
            </div>
            <div>
              <h3 className={cn("font-display text-xl font-black tracking-tight leading-none", ok ? "text-easy" : "text-hard")}>
                {sub.status || "Finished"}
              </h3>
              <p className="mt-1.5 text-[11px] font-medium text-muted-foreground">
                {ok
                  ? "Nice — your solution cleared every test case."
                  : `${total - passed} of ${total} test case${total - passed > 1 ? "s" : ""} failed. Review the cases below.`}
              </p>
            </div>
          </div>
          <span className="shrink-0 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            {sub.createdAt ? new Date(sub.createdAt).toLocaleTimeString() : new Date().toLocaleTimeString()}
          </span>
        </div>

        {/* Acceptance progress */}
        <div className="relative mt-4">
          <div className="mb-1.5 flex items-center justify-between text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
            <span>Test cases passed</span>
            <span className={ok ? "text-easy" : "text-hard"}>{pct}%</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-muted/60 border border-border/20">
            <div
              className={cn("h-full rounded-full transition-all duration-1000 ease-out", ok ? "bg-easy" : "bg-hard")}
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>

        {/* Compile Error / Stderr */}
        {(sub.compileOutput || sub.stderr) && (
          <div className="relative mt-4 rounded-lg bg-hard/10 border border-hard/20 p-3">
            <p className="text-[10px] font-bold text-hard uppercase tracking-widest mb-1">Error Trace</p>
            <pre className="whitespace-pre-wrap font-mono text-xs text-hard leading-relaxed">
              {sub.compileOutput || sub.stderr}
            </pre>
          </div>
        )}
      </div>

      {/* Stat cards — LeetCode-style submission insights */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <ResultStat icon={Clock} label="Runtime" value={sub.time ? formatStat(sub.time) : "n/a"} hint="Execution time" />
        <ResultStat icon={Zap} label="Memory" value={sub.memory ? formatStat(sub.memory) : "n/a"} hint="Peak usage" />
        <ResultStat icon={ListChecks} label="Test Cases" value={`${passed}/${total}`} hint={ok ? "All passed" : `${total - passed} failed`} accent={ok ? "easy" : "hard"} />
        <ResultStat icon={Code2} label="Language" value={sub.language} hint="Runtime env" />
      </div>

      {/* Detailed Test Cases */}
      <div className="space-y-4">
        <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground border-b border-border/40 pb-2">Test Case Analysis</h4>

        <div className="grid gap-3">
          {/* 1. Public Examples */}
          {tcs.filter(t => exampleInputs.has(normalize(t.stdin))).map((t, idx) => (
            <div key={t.id || idx} className={cn(
              "rounded-xl border bg-card transition-all overflow-hidden shadow-sm hover:shadow-md",
              t.passed ? "border-easy/20" : "border-hard/20"
            )}>
              <div className={cn(
                "flex items-center justify-between px-4 py-2 border-b",
                t.passed ? "bg-easy/5 border-easy/10" : "bg-hard/5 border-hard/10"
              )}>
                <span className="font-mono text-[10px] font-bold uppercase tracking-tighter">
                  Example Case #{idx + 1}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono text-muted-foreground">{t.time}</span>
                  {t.passed ? <CheckCircle2 className="h-3 w-3 text-easy" /> : <XCircle className="h-3 w-3 text-hard" />}
                </div>
              </div>

              <div className="p-4 space-y-3 font-mono text-xs">
                <div>
                  <span className="text-muted-foreground text-[10px] uppercase block mb-1">Input</span>
                  <code className="block bg-muted/40 p-2 rounded border border-border/40 whitespace-pre-wrap">
                    {t.stdin || "n/a"}
                  </code>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-muted-foreground text-[10px] uppercase block mb-1">Expected</span>
                    <code className="block bg-muted/40 p-2 rounded border border-border/40 text-easy/80">
                      {t.expected}
                    </code>
                  </div>
                  <div>
                    <span className="text-muted-foreground text-[10px] uppercase block mb-1">Actual Output</span>
                    <code className={cn(
                      "block p-2 rounded border",
                      t.passed ? "bg-easy/5 border-easy/20 text-easy" : "bg-hard/5 border-hard/20 text-hard"
                    )}>
                      {t.stdout || (t.status?.includes("Time") ? "TLE" : "no output")}
                    </code>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* 2. Hidden Cases Summary */}
          {(() => {
            const hPassed = sub.hiddenPassedCount ?? 0;
            const hFailed = sub.hiddenFailedCount ?? 0;
            const totalH = sub.totalHiddenCases ?? (hPassed + hFailed);

            if (totalH === 0) return null;

            const hOk = hFailed === 0;

            return (
              <div className={cn(
                "rounded-xl border p-5 transition-all shadow-sm relative overflow-hidden",
                hOk 
                  ? "bg-easy/5 border-easy/20 shadow-[0_0_20px_-10px_rgba(var(--easy),0.2)]" 
                  : "bg-hard/5 border-hard/20 shadow-[0_0_20px_-10px_rgba(var(--hard),0.2)]"
              )}>
                {/* Background Pattern */}
                <div className="absolute top-0 right-0 p-4 opacity-[0.03] pointer-events-none">
                  <ShieldCheck className="h-24 w-24" />
                </div>

                <div className="flex items-center justify-between relative z-10">
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "p-3 rounded-2xl shadow-inner animate-in zoom-in duration-500",
                      hOk ? "bg-easy/10 text-easy" : "bg-hard/10 text-hard"
                    )}>
                      {hOk ? <ShieldCheck className="h-6 w-6" /> : <ShieldAlert className="h-6 w-6" />}
                    </div>
                    <div>
                      <h4 className="text-sm font-black uppercase tracking-tight">
                        {hOk ? "All Private Cases Passed" : "Private Test Cases Summary"}
                      </h4>
                      <p className="text-[11px] text-muted-foreground font-medium mt-0.5 max-w-[200px]">
                        {hOk 
                          ? "Your solution passed all secret validation tests." 
                          : `${hFailed} hidden case${hFailed > 1 ? "s" : ""} failed. Review your logic for edge cases.`}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={cn(
                      "text-2xl font-black font-mono leading-none tracking-tighter", 
                      hOk ? "text-easy" : "text-hard"
                    )}>
                      {hPassed} <span className="text-xs text-muted-foreground font-medium mx-0.5">/</span> {totalH}
                    </div>
                    <div className="text-[9px] uppercase font-bold tracking-widest text-muted-foreground mt-1.5 opacity-70">
                      Hidden Passed
                    </div>
                  </div>
                </div>

                {!hOk && (
                  <div className="mt-5 space-y-2">
                    <div className="flex justify-between text-[10px] font-mono text-muted-foreground px-1">
                      <span>Progress</span>
                      <span>{Math.round((hPassed / totalH) * 100)}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-muted/40 rounded-full overflow-hidden border border-border/10">
                      <div
                        className={cn(
                          "h-full transition-all duration-1000 ease-out", 
                          "bg-hard shadow-[0_0_10px_rgba(var(--hard),0.4)]"
                        )}
                        style={{ width: `${(hPassed / totalH) * 100}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            );
          })()}
        </div>
      </div>
    </div>
  );
}

function ResultStat({
  icon: Icon,
  label,
  value,
  hint,
  accent,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  hint?: string;
  accent?: "easy" | "hard";
}) {
  return (
    <div className="group rounded-xl border border-border bg-card/60 p-3.5 transition-all hover:border-primary/30 hover:shadow-[0_8px_24px_-18px_var(--glow)]">
      <div className="flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </div>
      <div className={cn(
        "mt-2 truncate font-mono text-base font-bold leading-none",
        accent === "easy" ? "text-easy" : accent === "hard" ? "text-hard" : "text-foreground"
      )}>
        {value}
      </div>
      {hint && <div className="mt-1.5 text-[10px] text-muted-foreground/70">{hint}</div>}
    </div>
  );
}

function DiscussionPanel({ problemId, discussion, setDiscussion }: { problemId: string, discussion: any, setDiscussion: any }) {
  const { user } = useAuth();
  const [content, setContent] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  // Auto-expand logic
  React.useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [content]);

  if (!discussion) {
    return (
      <div className="flex flex-col h-[400px] items-center justify-center border rounded-xl bg-muted/5">
        <Loader2 className="h-6 w-6 animate-spin text-primary opacity-50" />
      </div>
    );
  }

  const messages = discussion.comments || [];

  const handlePost = async () => {
    if (!user) { toast.error("Sign in to post"); return; }
    if (!content.trim()) return;
    setIsSubmitting(true);
    try {
      // Logic Change: Post a COMMENT to the unified discussion instead of creating a NEW discussion
      const res = await discussApi.comment(discussion.id, content.trim());
      
      setDiscussion({
        ...discussion,
        comments: [...messages, res.comment]
      });

      setContent("");
      if (textareaRef.current) textareaRef.current.style.height = "38px";
      toast.success("Message sent");
    } catch (err: any) {
      toast.error(err.message || "Failed to post");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVote = async (id: string, type: "UPVOTE" | "DOWNVOTE") => {
    if (!user) { toast.error("Sign in to vote"); return; }
    try {
      // Logic Change: Use voteComment for chat messages (which are now comments)
      const res = await discussApi.voteComment(id, type);
      setDiscussion({
        ...discussion,
        comments: messages.map((m: any) => m.id === id ? {
          ...m,
          upvotes: res.votes.upvotes,
          downvotes: res.votes.downvotes,
          userVote: m.userVote === type ? null : type
        } : m)
      });
    } catch (err: any) {
      toast.error(err.message || "Failed to vote");
    }
  };

  const handleDeleteMessage = async (id: string) => {
    if (!confirm("Vanish this signal?")) return;
    try {
      await discussApi.removeComment(id);
      setDiscussion({
        ...discussion,
        comments: messages.filter((m: any) => m.id !== id)
      });
      toast.success("Signal purged");
    } catch (err: any) {
      toast.error("Purge failed");
    }
  };

  return (
    <div className="flex flex-col h-[400px] border rounded-xl overflow-hidden bg-muted/5 mb-8 shadow-inner">
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin">
        {messages.length === 0 && <p className="text-center text-muted-foreground text-xs py-10 italic">No messages yet. Say hi!</p>}
        {messages.map((m: any) => (
          <div key={m.id} className={cn(
            "flex flex-col max-w-[85%] group animate-in slide-in-from-bottom-2",
            m.user?.id === user?.id ? "ml-auto items-end" : "mr-auto items-start"
          )}>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-bold text-muted-foreground">{m.user?.username || m.user?.name}</span>
              <span className="text-[9px] text-muted-foreground/60">{new Date(m.createdAt).toLocaleTimeString()}</span>
            </div>
            <div className={cn(
              "px-3 py-2 rounded-2xl text-sm shadow-sm",
              m.user?.id === user?.id ? "bg-primary text-primary-foreground rounded-tr-none" : "bg-card border border-border rounded-tl-none"
            )}>
              {m.content}
            </div>
            <div className="flex items-center gap-3 mt-1 transition-opacity text-muted-foreground/70">
              <button
                onClick={() => handleVote(m.id, "UPVOTE")}
                className={cn(
                  "flex items-center gap-1 text-[10px] hover:text-primary transition-colors",
                  m.userVote === "UPVOTE" && "text-primary font-bold"
                )}
              >
                <ThumbsUp className="h-3 w-3" /> {m.upvotes}
              </button>
              <button
                onClick={() => handleVote(m.id, "DOWNVOTE")}
                className={cn(
                  "flex items-center gap-1 text-[10px] hover:text-hard transition-colors",
                  m.userVote === "DOWNVOTE" && "text-hard font-bold"
                )}
              >
                <ThumbsDown className="h-3 w-3" /> {m.downvotes}
              </button>
              {user?.role === "ADMIN" && (
                <button
                  onClick={() => handleDeleteMessage(m.id)}
                  className="flex items-center gap-1 text-[10px] text-hard hover:text-hard/80 opacity-0 group-hover:opacity-100 transition-all ml-auto"
                >
                  <Trash2 className="h-2.5 w-2.5" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
      <div className="p-3 border-t bg-card/90 backdrop-blur-sm flex items-end gap-2 shrink-0">
        <Textarea
          ref={textareaRef}
          placeholder="Type your message..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handlePost();
            }
          }}
          className="min-h-[38px] max-h-[200px] py-2 text-xs bg-background/50 focus-visible:ring-primary/30 resize-none overflow-y-auto scrollbar-thin transition-[height] duration-100"
          rows={1}
        />
        <Button size="sm" className="h-9 px-3 glow-primary shrink-0 mb-[1px]" onClick={handlePost} disabled={isSubmitting}>
          {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        </Button>
      </div>
    </div>
  );
}

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
import { ArrowLeft, CheckCircle2, XCircle, Loader2, ThumbsUp, ThumbsDown, Send, ShieldAlert, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Bookmark } from "lucide-react";

// Helper to format statistics (time, memory) that might be stored as JSON strings
const formatStat = (val: string | null) => {
  if (!val) return "n/a";
  try {
    const parsed = JSON.parse(val);
    return Array.isArray(parsed) ? parsed[0] : val;
  } catch {
    return val;
  }
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
  const [editorSettings, setEditorSettings] = React.useState({
    fontSize: 14,
    theme: "vs-dark",
    fontFamily: "JetBrains Mono, monospace",
    editorWidth: 60 // Default 60% for editor
  });
  const [isDragging, setIsDragging] = React.useState(false);
  const [consoleHeight, setConsoleHeight] = React.useState(40);
  const [isResizingConsole, setIsResizingConsole] = React.useState(false);
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (isMobile) return;
    setIsDragging(true);
  };

  const handleConsoleMouseDown = (e: React.MouseEvent) => {
    setIsResizingConsole(true);
  };

  React.useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        const newWidth = 100 - (e.clientX / window.innerWidth) * 100;
        setEditorSettings(s => ({
          ...s,
          editorWidth: Math.min(Math.max(newWidth, 20), 80)
        }));
      }

      if (isResizingConsole) {
        const h = 100 - (e.clientY / window.innerHeight) * 100;
        setConsoleHeight(Math.min(Math.max(h, 10), 80));
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setIsResizingConsole(false);
    };

    if (isDragging || isResizingConsole) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = isDragging ? "col-resize" : "row-resize";
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
  }, [isDragging, isResizingConsole]);

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

  React.useEffect(() => {
    if (!problemId) return;
    discussApi.byProblem(problemId).then((res: any) => {
      setProblemDiscussions(res.discussions || []);
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
      isFullscreen ? "fixed inset-0 z-50 h-screen w-screen" : "min-h-[calc(100vh-3.5rem)] h-[calc(100vh-3.5rem)]"
    )}>
      <div className={cn(
        "flex-1 flex relative",
        isMobile ? "flex-col overflow-y-auto overflow-x-hidden" : "flex-row overflow-hidden"
      )}>
        {/* Left: description - Hidden in Fullscreen */}
        {!isFullscreen && (
          <>
            <div
              className={cn(
                "bg-background shrink-0",
                !isDragging && "transition-all duration-300",
                isMobile ? "w-full border-b border-border" : "border-r border-border h-full overflow-y-auto scrollbar-thin"
              )}
              style={isMobile ? {} : { width: `${100 - editorSettings.editorWidth}%` }}
            >
              <div className={cn("p-4 md:p-6")}>
                <Link to="/problems" className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
                  <ArrowLeft className="h-3 w-3" /> All problems
                </Link>
                <div className="mt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <h1 className="font-display text-xl md:text-2xl font-bold tracking-tight">{problem.title}</h1>
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
                <div className="mt-2 flex flex-wrap gap-1">
                  {problem.tags?.map((t) => (
                    <span key={t} className="rounded bg-muted px-2 py-0.5 font-mono text-[10px] text-muted-foreground border border-border/40">{t}</span>
                  ))}
                </div>

                <Tabs defaultValue="desc" className="mt-6">
                  <TabsList className="w-full justify-start h-10 bg-muted/20 p-1 overflow-x-auto overflow-y-hidden scrollbar-none flex-nowrap shrink-0">
                    <TabsTrigger value="desc" className="text-[11px] md:text-xs min-w-fit">Description</TabsTrigger>
                    <TabsTrigger value="examples" className="text-[11px] md:text-xs min-w-fit">Examples</TabsTrigger>
                    <TabsTrigger value="hints" className="text-[11px] md:text-xs min-w-fit">Hints</TabsTrigger>
                    <TabsTrigger value="ai" className="text-[11px] md:text-xs min-w-fit">AI</TabsTrigger>
                    <TabsTrigger value="subs" className="text-[11px] md:text-xs min-w-fit">Submissions</TabsTrigger>
                    <TabsTrigger value="discuss" className="text-[11px] md:text-xs min-w-fit">Discuss</TabsTrigger>
                  </TabsList>

                  <TabsContent value="ai" className="mt-4 animate-in fade-in duration-300">
                    <AICodePanel
                      code={code}
                      language={lang.key}
                      problemTitle={problem.title}
                      problemDescription={problem.description}
                    />
                  </TabsContent>

                  <TabsContent value="desc" className="mt-4 space-y-6 animate-in fade-in duration-300">
                    <div className="prose max-w-none whitespace-pre-wrap text-sm leading-relaxed text-foreground/90 font-sans">
                      {problem.description}
                    </div>
                    {problem.constraints && (
                      <div className="rounded-xl border border-border/60 bg-muted/20 p-4">
                        <h3 className="font-display text-xs font-semibold uppercase tracking-widest text-primary">Constraints</h3>
                        <pre className="mt-2 whitespace-pre-wrap font-mono text-xs leading-relaxed">{problem.constraints}</pre>
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="examples" className="mt-4 space-y-4 animate-in fade-in duration-300">
                    {examples.length === 0 && <p className="text-sm text-muted-foreground">No examples provided.</p>}
                    {examples.map((ex, i) => (
                      <div key={i} className="rounded-xl border border-border bg-card p-4 shadow-sm">
                        <div className="font-mono text-[10px] uppercase tracking-widest text-primary font-bold">Example {i + 1}</div>
                        <div className="mt-3 space-y-2 text-sm">
                          {ex.input !== undefined && (
                            <div className="flex gap-2">
                              <span className="font-semibold text-muted-foreground shrink-0 w-12">Input:</span>
                              <code className="font-mono bg-muted px-1.5 py-0.5 rounded text-xs">{String(ex.input) || "none"}</code>
                            </div>
                          )}
                          {ex.output !== undefined && (
                            <div className="flex gap-2">
                              <span className="font-semibold text-muted-foreground shrink-0 w-12">Output:</span>
                              <code className="font-mono bg-muted px-1.5 py-0.5 rounded text-xs">{String(ex.output)}</code>
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

                  <TabsContent value="hints" className="mt-4 space-y-4 animate-in fade-in duration-300">
                    {problem.hints ? (
                      <div className="rounded-xl border border-border bg-card p-4">
                        <h3 className="text-xs font-bold uppercase tracking-widest text-primary mb-2">Hints</h3>
                        <div className="whitespace-pre-wrap text-sm text-foreground/80">{problem.hints}</div>
                      </div>
                    ) : <p className="text-sm text-muted-foreground italic text-center py-8">No hints — you've got this.</p>}
                    {problem.editorial && (
                      <div className="rounded-xl border border-border bg-primary/5 p-4">
                        <h3 className="font-display text-xs font-semibold uppercase tracking-widest text-primary">Editorial</h3>
                        <div className="mt-2 whitespace-pre-wrap text-sm leading-relaxed">{problem.editorial}</div>
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="subs" className="mt-4 animate-in fade-in duration-300">
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
                                // Auto-open console if it was closed
                                if (consoleHeight < 15) {
                                  setConsoleHeight(40);
                                }
                                toast.info(`Viewing submission from ${new Date(s.createdAt!).toLocaleTimeString()}`);
                              } catch (err: any) {
                                toast.error("Failed to load submission details");
                              }
                            }}
                            className="flex flex-col sm:flex-row sm:items-center justify-between rounded-lg border border-border bg-card p-3 text-sm hover:border-primary/30 transition-colors cursor-pointer group gap-3"
                          >
                            <div className="flex items-center justify-between sm:justify-start gap-2">
                              <div className="flex items-center gap-2 min-w-0">
                                {ok ? <CheckCircle2 className="h-4 w-4 text-easy shrink-0" /> : <XCircle className="h-4 w-4 text-hard shrink-0" />}
                                <span className={cn("font-bold truncate", ok ? "text-easy" : "text-hard")}>{s.status}</span>
                              </div>
                              <span className="font-mono text-[9px] md:text-[10px] bg-muted px-1.5 py-0.5 rounded text-muted-foreground uppercase shrink-0">{s.language}</span>
                            </div>
                            <div className="flex items-center justify-between sm:justify-end gap-3 font-mono text-[10px] text-muted-foreground border-t sm:border-0 pt-2 sm:pt-0">
                              <div className="flex items-center gap-3">
                                {s.time && <span className="hidden xs:inline">{formatStat(s.time)}</span>}
                                {s.memory && <span className="hidden xs:inline">{formatStat(s.memory)}</span>}
                                <span className="text-[9px] bg-muted/40 px-1.5 py-0.5 rounded whitespace-nowrap">
                                  {new Date(s.createdAt).toLocaleDateString()} {new Date(s.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>
                              <span className="opacity-0 group-hover:opacity-100 transition-opacity text-primary font-bold text-[9px] sm:text-[10px] shrink-0">VIEW →</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </TabsContent>
                  <TabsContent value="discuss" className="mt-4 animate-in fade-in duration-300">
                    <DiscussionPanel
                      problemId={problemId!}
                      discussions={problemDiscussions}
                      setDiscussions={setProblemDiscussions}
                    />
                  </TabsContent>
                </Tabs>
              </div>
            </div>
            {/* Drag Handle */}
            {/* Drag Handle - Desktop Only */}
            {!isMobile && (
              <div
                onMouseDown={handleMouseDown}
                className="w-1.5 h-full cursor-col-resize hover:bg-primary/40 transition-colors bg-border/40 z-10"
              />
            )}
          </>
        )}

        {/* Right: editor + result */}
        <div
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
                  // Oceanic Blue
                  monaco.editor.defineTheme('oceanic', {
                    base: 'vs-dark',
                    inherit: true,
                    rules: [{ token: '', foreground: 'd4d4d4', background: '1b2b34' }],
                    colors: {
                      'editor.background': '#1b2b34',
                      'editor.foreground': '#d4d4d4',
                      'editorLineNumber.foreground': '#4f5b66',
                      'editor.selectionBackground': '#4f5b6650',
                      'editor.lineHighlightBackground': '#24343d',
                      'editorCursor.foreground': '#6699cc'
                    }
                  });

                  // Monokai
                  monaco.editor.defineTheme('monokai', {
                    base: 'vs-dark',
                    inherit: true,
                    rules: [
                      { token: 'comment', foreground: '75715e' },
                      { token: 'keyword', foreground: 'f92672' },
                      { token: 'string', foreground: 'e6db74' }
                    ],
                    colors: {
                      'editor.background': '#272822',
                      'editor.foreground': '#f8f8f2',
                      'editorLineNumber.foreground': '#90908a',
                      'editor.selectionBackground': '#49483e',
                      'editor.lineHighlightBackground': '#3e3d32',
                      'editorCursor.foreground': '#f8f8f0'
                    }
                  });

                  // Cyberpunk Neon
                  monaco.editor.defineTheme('cyberpunk', {
                    base: 'vs-dark',
                    inherit: true,
                    rules: [
                      { token: 'keyword', foreground: 'ff00ff', fontStyle: 'bold' },
                      { token: 'string', foreground: '00ffff' },
                      { token: 'comment', foreground: '32cd32', fontStyle: 'italic' }
                    ],
                    colors: {
                      'editor.background': '#10002b',
                      'editor.foreground': '#ffffff',
                      'editorLineNumber.foreground': '#7b2cbf',
                      'editor.selectionBackground': '#5a189a',
                      'editor.lineHighlightBackground': '#240046',
                      'editorCursor.foreground': '#ff00ff'
                    }
                  });

                  // One Dark
                  monaco.editor.defineTheme('one-dark', {
                    base: 'vs-dark',
                    inherit: true,
                    rules: [
                      { token: 'keyword', foreground: 'c678dd' },
                      { token: 'string', foreground: '98c379' },
                      { token: 'identifier', foreground: '61afef' }
                    ],
                    colors: {
                      'editor.background': '#282c34',
                      'editor.foreground': '#abb2bf',
                      'editorLineNumber.foreground': '#4b5263',
                      'editor.selectionBackground': '#3e4451',
                      'editor.lineHighlightBackground': '#2c313c',
                      'editorCursor.foreground': '#528bff'
                    }
                  });
                }}
                onMount={(editor, monaco) => {
                  // No-op or extra setup if needed
                }}
                options={{
                  fontFamily: editorSettings.fontFamily,
                  fontSize: editorSettings.fontSize,
                  lineHeight: 1.6, // More breathing room
                  letterSpacing: 0.5,
                  minimap: { enabled: false },
                  scrollBeyondLastLine: false,
                  padding: { top: 20, bottom: 20 },
                  automaticLayout: true,
                  cursorSmoothCaretAnimation: "on",
                  cursorBlinking: "smooth", // Modern smooth blink
                  cursorStyle: "line",
                  smoothScrolling: true,
                  lineNumbersMinChars: 4,
                  bracketPairColorization: { enabled: true },
                  guides: {
                    indentation: true,
                    bracketPairs: true
                  },
                  renderLineHighlight: "all", // Highlight whole line
                  renderWhitespace: "none",
                  suggestOnTriggerCharacters: true,
                  quickSuggestions: { other: true, comments: true, strings: true },
                  scrollbar: {
                    verticalScrollbarSize: 8,
                    horizontalScrollbarSize: 8,
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
          </div>

          {/* Output */}
          <div
            className={cn(
              "relative border-t border-border bg-background/60 transition-all overflow-hidden flex flex-col",
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
                  Executing on Judge0 arena...
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



  return (
    <div className="mt-3 space-y-6">
      {/* Submission Summary Header */}
      <div className={cn(
        "rounded-xl border p-4 shadow-sm transition-all",
        ok ? "border-easy/30 bg-easy/5" : "border-hard/30 bg-hard/5"
      )}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={cn(
              "p-2 rounded-full",
              ok ? "bg-easy/20" : "bg-hard/20"
            )}>
              {ok ? <CheckCircle2 className="h-5 w-5 text-easy" /> : <XCircle className="h-5 w-5 text-hard" />}
            </div>
            <div>
              <h3 className={cn("text-lg font-bold tracking-tight", ok ? "text-easy" : "text-hard")}>
                {sub.status || "Finished"}
              </h3>
              <div className="flex items-center gap-3 mt-1">
                <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                  {passed} / {total} Passed
                </p>
                <div className="flex h-1.5 w-24 bg-muted rounded-full overflow-hidden border border-border/20">
                  <div
                    className={cn("h-full transition-all duration-1000", ok ? "bg-easy shadow-[0_0_8px_rgba(var(--easy),0.5)]" : "bg-hard shadow-[0_0_8px_rgba(var(--hard),0.5)]")}
                    style={{ width: `${(passed / (total || 1)) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1 font-mono text-[10px] text-muted-foreground uppercase tracking-widest">
            <div className="flex items-center gap-2">
              <span className="bg-muted px-2 py-0.5 rounded border border-border/40 text-foreground">{sub.language}</span>
              {sub.time && <span className="bg-muted px-2 py-0.5 rounded border border-border/40 text-foreground">{formatStat(sub.time)}</span>}
              {sub.memory && <span className="bg-muted px-2 py-0.5 rounded border border-border/40 text-foreground">{formatStat(sub.memory)}</span>}
            </div>
            <span>{sub.createdAt ? new Date(sub.createdAt).toLocaleTimeString() : new Date().toLocaleTimeString()}</span>
          </div>
        </div>

        {/* Compile Error / Stderr */}
        {(sub.compileOutput || sub.stderr) && (
          <div className="mt-4 rounded-lg bg-hard/10 border border-hard/20 p-3">
            <p className="text-[10px] font-bold text-hard uppercase tracking-widest mb-1">Error Trace</p>
            <pre className="whitespace-pre-wrap font-mono text-xs text-hard leading-relaxed">
              {sub.compileOutput || sub.stderr}
            </pre>
          </div>
        )}
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

function DiscussionPanel({ problemId, discussions, setDiscussions }: { problemId: string, discussions: DiscussPost[], setDiscussions: any }) {
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

  const handlePost = async () => {
    if (!user) { toast.error("Sign in to post"); return; }
    if (!content.trim()) return;
    setIsSubmitting(true);
    try {
      const res = await discussApi.create({
        title: "Discussion",
        content,
        problemId,
        type: "problem"
      });
      setDiscussions([res.discussion, ...discussions]);
      setContent("");
      if (textareaRef.current) textareaRef.current.style.height = "38px";
      toast.success("Message posted");
    } catch (err: any) {
      toast.error(err.message || "Failed to post");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVote = async (id: string, type: "UPVOTE" | "DOWNVOTE") => {
    if (!user) { toast.error("Sign in to vote"); return; }
    try {
      const res = await discussApi.vote(id, type);
      setDiscussions(discussions.map(d => d.id === id ? {
        ...d,
        upvotes: res.votes.upvotes,
        downvotes: res.votes.downvotes,
        userVote: d.userVote === type ? null : type
      } : d));
    } catch (err: any) {
      toast.error(err.message || "Failed to vote");
    }
  };

  return (
    <div className="flex flex-col h-[400px] border rounded-xl overflow-hidden bg-muted/5 mb-8 shadow-inner">
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin">
        {discussions.length === 0 && <p className="text-center text-muted-foreground text-xs py-10 italic">No discussions yet. Start the conversation!</p>}
        {discussions.map((d) => (
          <div key={d.id} className={cn(
            "flex flex-col max-w-[85%] group animate-in slide-in-from-bottom-2",
            d.user?.id === user?.id ? "ml-auto items-end" : "mr-auto items-start"
          )}>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-bold text-muted-foreground">{d.user?.username || d.user?.name}</span>
              <span className="text-[9px] text-muted-foreground/60">{new Date(d.createdAt).toLocaleTimeString()}</span>
            </div>
            <div className={cn(
              "px-3 py-2 rounded-2xl text-sm shadow-sm",
              d.user?.id === user?.id ? "bg-primary text-primary-foreground rounded-tr-none" : "bg-card border border-border rounded-tl-none"
            )}>
              {d.content}
            </div>
            <div className="flex items-center gap-3 mt-1 transition-opacity text-muted-foreground/70">
              <button
                onClick={() => handleVote(d.id, "UPVOTE")}
                className={cn(
                  "flex items-center gap-1 text-[10px] hover:text-primary transition-colors",
                  d.userVote === "UPVOTE" && "text-primary font-bold"
                )}
              >
                <ThumbsUp className="h-3 w-3" /> {d.upvotes}
              </button>
              <button
                onClick={() => handleVote(d.id, "DOWNVOTE")}
                className={cn(
                  "flex items-center gap-1 text-[10px] hover:text-hard transition-colors",
                  d.userVote === "DOWNVOTE" && "text-hard font-bold"
                )}
              >
                <ThumbsDown className="h-3 w-3" /> {d.downvotes}
              </button>
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

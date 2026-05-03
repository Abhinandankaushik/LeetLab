import * as React from "react";
import { Maximize2, Minimize2, Play, Pause, RotateCcw, Settings, Type, Palette, Layout, Code2, Trophy, Timer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu";
import { Minus, Plus as PlusIcon } from "lucide-react";

interface EditorSettings {
  fontSize: number;
  theme: string;
  fontFamily: string;
  editorWidth: number; // 30 to 70
}

interface EditorToolbarProps {
  onRun: () => void;
  onSubmit: () => void;
  running: boolean;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
  settings: EditorSettings;
  onSettingsChange: (s: EditorSettings) => void;
  languages: any[];
  activeLang: any;
  onLangChange: (l: any) => void;
  // Contest Props
  problems?: any[];
  activeProblem?: any;
  onProblemChange?: (id: string) => void;
  contestTimer?: React.ReactNode;
}

export function EditorToolbar({
  onRun,
  onSubmit,
  running,
  isFullscreen,
  onToggleFullscreen,
  settings,
  onSettingsChange,
  languages,
  activeLang,
  onLangChange,
  problems,
  activeProblem,
  onProblemChange,
  contestTimer
}: EditorToolbarProps) {
  // Timer State
  const [seconds, setSeconds] = React.useState(0);
  const [isActive, setIsActive] = React.useState(false);

  React.useEffect(() => {
    let interval: any = null;
    if (isActive) {
      interval = setInterval(() => {
        setSeconds(s => s + 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isActive]);

  const formatTime = (total: number) => {
    const h = Math.floor(total / 3600);
    const m = Math.floor((total % 3600) / 60);
    const s = total % 60;
    return `${h > 0 ? `${h}:` : ""}${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div className="flex items-center justify-between border-b border-primary/10 bg-background/40 px-3 py-2 backdrop-blur-xl sticky top-0 z-30 shadow-sm">
      <div className="absolute inset-x-0 bottom-[-1px] h-[1px] bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
      
      <div className="flex items-center gap-3">
        {/* Problem Selector (Contest Mode) */}
        {problems && onProblemChange && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 gap-2 font-black text-xs hover:bg-primary/10 border border-primary/20 bg-primary/5 rounded-lg px-3">
                <Trophy className="h-3.5 w-3.5 text-primary" />
                <span className="text-primary">{activeProblem?.label}. {activeProblem?.problem?.title}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-64">
              {problems.map((p) => (
                <DropdownMenuItem key={p.id} onClick={() => onProblemChange(p.problem.id)} className="gap-3">
                  <span className="flex h-6 w-6 items-center justify-center rounded-md bg-muted font-mono text-[10px] font-black">
                    {p.label}
                  </span>
                  <span className="font-bold text-sm">{p.problem.title}</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        {/* Contest Timer HUD */}
        {contestTimer && (
          <div className="flex items-center gap-2 px-4 py-1 rounded-full bg-muted/40 border border-border/60 font-mono text-xs font-bold shadow-inner">
            <Timer className="h-3.5 w-3.5 text-primary animate-pulse" />
            {contestTimer}
          </div>
        )}

        {!problems && (
          <>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 gap-2 font-mono text-xs hover:bg-primary/10">
                  <Layout className="h-3.5 w-3.5" />
                  {activeLang.name}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-40">
                {languages.map((l) => (
                  <DropdownMenuItem key={l.id} onClick={() => onLangChange(l)}>
                    {l.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <div className="h-4 w-px bg-border/60" />

            {/* Timer - Hidden on very small screens */}
            <div className={cn(
              "hidden md:flex items-center gap-2 rounded-full border px-3 py-1 font-mono text-[11px] transition-all shrink-0",
              isActive ? "border-primary/50 bg-primary/5 text-primary glow-primary-sm" : "border-border/40 bg-muted/40 text-muted-foreground"
            )}>
              <span className={cn(isActive && "animate-pulse")}>{formatTime(seconds)}</span>
              <div className="flex items-center gap-1">
                <button onClick={() => setIsActive(!isActive)} className="hover:text-foreground">
                  {isActive ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
                </button>
                <button onClick={() => { setSeconds(0); setIsActive(false); }} className="hover:text-foreground">
                  <RotateCcw className="h-3 w-3" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      <div className="flex items-center gap-2">
        {/* Settings */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-primary/10">
              <Settings className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="flex items-center gap-2">
              <Type className="h-4 w-4" /> Text Settings
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <div className="px-2 py-1.5">
              <div className="mb-2 text-[10px] uppercase tracking-wider text-muted-foreground">Font Size ({settings.fontSize}px)</div>
              <div className="flex items-center gap-1">
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="h-7 w-7" 
                  onClick={() => onSettingsChange({ ...settings, fontSize: Math.max(10, settings.fontSize - 1) })}
                >
                  <Minus className="h-3 w-3" />
                </Button>
                <div className="flex-1 text-center font-mono text-xs">{settings.fontSize}</div>
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="h-7 w-7" 
                  onClick={() => onSettingsChange({ ...settings, fontSize: Math.min(30, settings.fontSize + 1) })}
                >
                  <PlusIcon className="h-3 w-3" />
                </Button>
              </div>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuLabel className="flex items-center gap-2">
              <Palette className="h-4 w-4" /> Appearance
            </DropdownMenuLabel>
            <DropdownMenuRadioGroup value={settings.theme} onValueChange={(v) => onSettingsChange({ ...settings, theme: v })}>
              <DropdownMenuRadioItem value="vs-dark">Dark (VS Code)</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="light">Light</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="oceanic">Oceanic Blue</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="monokai">Monokai</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="cyberpunk">Cyberpunk Neon</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="one-dark">One Dark</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="hc-black">High Contrast</DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button 
          variant="ghost" 
          size="icon" 
          className="h-8 w-8 hover:bg-primary/10" 
          onClick={onToggleFullscreen}
        >
          {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
        </Button>

        <div className="h-4 w-px bg-border/60 mx-0.5 sm:mx-1" />

        <div className="flex items-center gap-2">
          <Button 
            size="sm" 
            variant="ghost" 
            onClick={onRun} 
            disabled={running}
            className="h-8 px-3 sm:px-4 hover:bg-primary/10 font-bold text-xs transition-all active:scale-95"
          >
            <Play className="h-3 w-3 sm:mr-1.5 fill-current" />
            <span className="hidden sm:inline">Run</span>
          </Button>
          <Button 
            size="sm" 
            onClick={onSubmit} 
            disabled={running}
            className="h-8 px-4 sm:px-5 glow-primary btn-shine font-black text-xs transition-all active:scale-95 rounded-lg shadow-[0_0_15px_-3px_rgba(var(--primary),0.4)]"
          >
            <Code2 className="h-3 w-3 sm:mr-1.5" />
            <span className="hidden sm:inline">Submit</span>
          </Button>
        </div>
      </div>
    </div>
  );
}

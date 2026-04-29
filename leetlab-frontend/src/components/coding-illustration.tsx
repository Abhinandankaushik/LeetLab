import React from "react";
import { cn } from "@/lib/utils";
import { Terminal, Code2, Database, Cpu, Globe } from "lucide-react";

export function CodingIllustration({ className }: { className?: string }) {
  const [tick, setTick] = React.useState(0);

  React.useEffect(() => {
    const timer = setInterval(() => setTick(t => t + 1), 8000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className={cn("relative hidden h-full w-full overflow-hidden rounded-2xl bg-muted/20 backdrop-blur-3xl border border-border lg:block", className)}>
      {/* Background gradients */}
      <div className="absolute -left-[10%] top-[-10%] h-[50%] w-[50%] rounded-full bg-primary/20 blur-[120px]" />
      <div className="absolute -right-[10%] bottom-[-10%] h-[50%] w-[50%] rounded-full bg-blue-500/20 blur-[120px]" />
      
      {/* Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_70%,transparent_100%)]" />

      {/* Floating Elements Container */}
      <div className="absolute inset-0 flex items-center justify-center">
        
        {/* Main Editor Window */}
        <div className="relative z-10 w-[80%] max-w-md animate-floating rounded-xl border border-border bg-card/80 shadow-2xl backdrop-blur-md">
          {/* Header */}
          <div className="flex items-center gap-1.5 border-b border-border bg-muted/30 px-4 py-3">
            <div className="h-3 w-3 rounded-full bg-red-500/80" />
            <div className="h-3 w-3 rounded-full bg-yellow-500/80" />
            <div className="h-3 w-3 rounded-full bg-green-500/80" />
            <div className="ml-2 flex items-center gap-2 font-mono text-[10px] text-muted-foreground">
              <Terminal className="h-3 w-3" /> solution.ts
            </div>
          </div>
          {/* Code Body */}
          <div key={tick} className="p-4 font-mono text-xs leading-loose text-foreground/80">
            <div className="flex">
              <span className="w-8 select-none text-muted-foreground/50">1</span>
              <span className="animate-typewriter" style={{ animationDelay: "0.2s" }}><span className="text-primary">function</span> <span className="text-blue-500 dark:text-blue-400">solve</span>(nums: <span className="text-yellow-600 dark:text-yellow-300">number</span>[], target: <span className="text-yellow-600 dark:text-yellow-300">number</span>) {'{'}</span>
            </div>
            <div className="flex">
              <span className="w-8 select-none text-muted-foreground/50">2</span>
              <span className="ml-4 animate-typewriter" style={{ animationDelay: "0.8s" }}><span className="text-primary">const</span> map <span className="text-primary">=</span> <span className="text-primary">new</span> <span className="text-yellow-600 dark:text-yellow-300">Map</span>();</span>
            </div>
            <div className="flex">
              <span className="w-8 select-none text-muted-foreground/50">3</span>
              <span className="ml-4 animate-typewriter" style={{ animationDelay: "1.4s" }}><span className="text-primary">for</span> (<span className="text-primary">let</span> i <span className="text-primary">=</span> <span className="text-orange-500 dark:text-orange-400">0</span>; i <span className="text-primary">&lt;</span> nums.length; i<span className="text-primary">++</span>) {'{'}</span>
            </div>
            <div className="flex">
              <span className="w-8 select-none text-muted-foreground/50">4</span>
              <span className="ml-8 animate-typewriter" style={{ animationDelay: "2.0s" }}><span className="text-primary">const</span> complement <span className="text-primary">=</span> target <span className="text-primary">-</span> nums[i];</span>
            </div>
            <div className="flex">
              <span className="w-8 select-none text-muted-foreground/50">5</span>
              <span className="ml-8 animate-typewriter" style={{ animationDelay: "2.6s" }}><span className="text-primary">if</span> (map.<span className="text-blue-500 dark:text-blue-400">has</span>(complement)) {'{'}</span>
            </div>
            <div className="flex">
              <span className="w-8 select-none text-muted-foreground/50">6</span>
              <span className="ml-12 animate-typewriter" style={{ animationDelay: "3.2s" }}><span className="text-primary">return</span> [map.<span className="text-blue-500 dark:text-blue-400">get</span>(complement), i];</span>
            </div>
            <div className="flex">
              <span className="w-8 select-none text-muted-foreground/50">7</span>
              <span className="ml-8 animate-typewriter" style={{ animationDelay: "3.8s" }}>{'}'}</span>
            </div>
            <div className="flex">
              <span className="w-8 select-none text-muted-foreground/50">8</span>
              <span className="ml-8 animate-typewriter" style={{ animationDelay: "4.0s" }}>map.<span className="text-blue-500 dark:text-blue-400">set</span>(nums[i], i);</span>
            </div>
            <div className="flex">
              <span className="w-8 select-none text-muted-foreground/50">9</span>
              <span className="ml-4 animate-typewriter" style={{ animationDelay: "4.6s" }}>{'}'}</span>
            </div>
            <div className="flex">
              <span className="w-8 select-none text-muted-foreground/50">10</span>
              <span className="animate-typewriter" style={{ animationDelay: "4.8s" }}>{'}'}</span>
            </div>
          </div>
        </div>

        {/* Floating Icons */}
        <div className="absolute left-[10%] top-[20%] flex h-12 w-12 animate-floating items-center justify-center rounded-xl border border-border bg-card shadow-xl backdrop-blur-md" style={{ animationDelay: "1s" }}>
          <Code2 className="h-6 w-6 text-primary" />
        </div>
        
        <div className="absolute bottom-[25%] right-[15%] flex h-14 w-14 animate-floating items-center justify-center rounded-xl border border-border bg-card shadow-xl backdrop-blur-md" style={{ animationDelay: "2.5s" }}>
          <Database className="h-7 w-7 text-blue-500 dark:text-blue-400" />
        </div>

        <div className="absolute right-[20%] top-[15%] flex h-10 w-10 animate-floating items-center justify-center rounded-xl border border-border bg-card shadow-xl backdrop-blur-md" style={{ animationDelay: "1.5s" }}>
          <Cpu className="h-5 w-5 text-purple-500 dark:text-purple-400" />
        </div>

        <div className="absolute bottom-[20%] left-[20%] flex h-16 w-16 animate-floating items-center justify-center rounded-xl border border-border bg-card shadow-xl backdrop-blur-md" style={{ animationDelay: "0.5s" }}>
          <Globe className="h-8 w-8 text-green-500 dark:text-green-400" />
        </div>

        {/* Decorative connecting lines (SVG) */}
        <svg className="absolute inset-0 h-full w-full opacity-20" xmlns="http://www.w3.org/2000/svg">
          <path d="M 20% 30% Q 40% 40% 50% 50%" stroke="var(--primary)" strokeWidth="1" fill="none" strokeDasharray="4 4" className="animate-[dash_3s_linear_infinite]" />
          <path d="M 80% 70% Q 60% 60% 50% 50%" stroke="#60a5fa" strokeWidth="1" fill="none" strokeDasharray="4 4" className="animate-[dash_3s_linear_infinite_reverse]" />
        </svg>

      </div>
    </div>
  );
}

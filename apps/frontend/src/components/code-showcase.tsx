import * as React from "react";
import { Terminal } from "lucide-react";

type Snippet = { file: string; verdict: string; code: string };

const SNIPPETS: Snippet[] = [
  {
    file: "two_sum.py",
    verdict: "Accepted · 0ms",
    code: `class Solution:
  def twoSum(self, nums, target):
    seen = {}
    for i, n in enumerate(nums):
      if target - n in seen:
        return [seen[target - n], i]
      seen[n] = i`,
  },
  {
    file: "quick_sort.cpp",
    verdict: "Beats 99.4%",
    code: `vector<int> sort(vector<int>& a) {
  if (a.size() <= 1) return a;
  int pivot = a[a.size() / 2];
  // partition around the pivot
  auto less = filter(a, pivot);
  return merge(sort(less.lo), sort(less.hi));
}`,
  },
  {
    file: "fib.js",
    verdict: "Runtime 4ms",
    code: `const fib = (n, memo = {}) => {
  if (n <= 1) return n;
  // cache overlapping subproblems
  if (memo[n]) return memo[n];
  memo[n] = fib(n - 1) + fib(n - 2);
  return memo[n];
};`,
  },
];

const KEYWORDS = new Set([
  "class", "def", "return", "if", "elif", "else", "for", "while", "in", "from",
  "import", "const", "let", "var", "function", "new", "public", "static", "void",
  "auto", "namespace", "using", "include", "struct", "template", "typename",
  "true", "false", "None", "null", "self", "await", "async", "yield", "lambda",
]);
const TYPES = new Set([
  "int", "vector", "string", "bool", "double", "float", "char", "map",
  "unordered_map", "set", "pair", "size_t", "Solution",
]);

const TOKEN_RE =
  /(\/\/.*$|#.*$)|("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|`(?:[^`\\]|\\.)*`)|(\b\d+\.?\d*\b)|([A-Za-z_]\w*)(?=\s*\()|([A-Za-z_]\w*)|(\s+)|([^\s])/gm;

function highlight(code: string): React.ReactNode[] {
  const out: React.ReactNode[] = [];
  let m: RegExpExecArray | null;
  let key = 0;
  TOKEN_RE.lastIndex = 0;
  while ((m = TOKEN_RE.exec(code)) !== null) {
    const [, comment, str, num, fn, ident, ws, punct] = m;
    if (ws !== undefined) { out.push(ws); continue; }
    if (comment !== undefined) { out.push(<span key={key++} className="text-zinc-500 italic">{comment}</span>); continue; }
    if (str !== undefined) { out.push(<span key={key++} className="text-emerald-400">{str}</span>); continue; }
    if (num !== undefined) { out.push(<span key={key++} className="text-purple-400">{num}</span>); continue; }
    if (fn !== undefined) {
      if (KEYWORDS.has(fn)) { out.push(<span key={key++} className="text-blue-400 font-bold">{fn}</span>); continue; }
      if (TYPES.has(fn)) { out.push(<span key={key++} className="text-yellow-300 font-bold">{fn}</span>); continue; }
      out.push(<span key={key++} className="text-violet-300">{fn}</span>);
      continue;
    }
    if (ident !== undefined) {
      if (KEYWORDS.has(ident)) { out.push(<span key={key++} className="text-blue-400 font-bold">{ident}</span>); continue; }
      if (TYPES.has(ident)) { out.push(<span key={key++} className="text-yellow-300 font-bold">{ident}</span>); continue; }
      out.push(<span key={key++} className="text-orange-300/90">{ident}</span>);
      continue;
    }
    if (punct !== undefined) { out.push(<span key={key++} className="text-zinc-400">{punct}</span>); continue; }
  }
  return out;
}

/**
 * Animated, self-cycling code window for the home hero. Types a snippet, holds,
 * deletes, then switches language — with a brief glitch on each switch.
 */
export function CodeShowcase() {
  const [index, setIndex] = React.useState(0);
  const [count, setCount] = React.useState(0);
  const [phase, setPhase] = React.useState<"typing" | "holding" | "deleting">("typing");
  const [glitch, setGlitch] = React.useState(false);

  const snippet = SNIPPETS[index];
  const code = snippet.code;

  React.useEffect(() => {
    let t: ReturnType<typeof setTimeout>;
    if (phase === "typing") {
      if (count < code.length) {
        // Type a touch faster through whitespace/newlines for a snappy feel.
        const ch = code[count];
        const speed = ch === "\n" ? 90 : ch === " " ? 12 : 26;
        t = setTimeout(() => setCount((c) => c + 1), speed);
      } else {
        t = setTimeout(() => setPhase("holding"), 1800);
      }
    } else if (phase === "holding") {
      t = setTimeout(() => setPhase("deleting"), 200);
    } else {
      if (count > 0) {
        t = setTimeout(() => setCount((c) => Math.max(0, c - 3)), 12);
      } else {
        setGlitch(true);
        t = setTimeout(() => {
          setGlitch(false);
          setIndex((i) => (i + 1) % SNIPPETS.length);
          setPhase("typing");
        }, 220);
      }
    }
    return () => clearTimeout(t);
  }, [phase, count, code]);

  const visible = code.slice(0, count);
  const typingDone = phase === "holding" || (phase === "typing" && count >= code.length);

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card shadow-2xl shadow-black/40">
      <div className="flex items-center justify-between border-b border-border bg-muted/30 px-4 py-2">
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-hard/70" />
          <span className="h-2.5 w-2.5 rounded-full bg-medium/70" />
          <span className="h-2.5 w-2.5 rounded-full bg-easy/70" />
        </div>
        <span className="font-mono text-xs text-muted-foreground transition-all duration-300">
          {snippet.file}
        </span>
        <Terminal className="h-3.5 w-3.5 text-muted-foreground" />
      </div>

      <pre
        className={cnGlitch(glitch)}
        style={{ transition: "opacity 0.18s ease, transform 0.18s ease" }}
      >
        {highlight(visible)}
        <span
          className="ml-0.5 inline-block h-[1.15em] w-[2px] translate-y-[2px] bg-primary"
          style={{ animation: typingDone ? "blink-caret 1s steps(2) infinite" : "none" }}
        />
      </pre>

      <div className="flex items-center justify-between border-t border-border bg-muted/20 px-4 py-2 font-mono text-xs">
        <span className="flex items-center gap-1.5 text-easy">
          <span className="h-1.5 w-1.5 rounded-full bg-easy animate-pulse" /> Absolute W
        </span>
        <span className="text-muted-foreground transition-all duration-300">{snippet.verdict}</span>
      </div>
    </div>
  );
}

function cnGlitch(glitch: boolean) {
  return [
    "overflow-x-auto p-5 font-mono text-[13px] leading-relaxed text-foreground min-h-[220px] whitespace-pre",
    glitch ? "opacity-40 translate-x-[3px]" : "opacity-100 translate-x-0",
  ].join(" ");
}

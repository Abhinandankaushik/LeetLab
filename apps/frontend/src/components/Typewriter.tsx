import React, { useState, useEffect, useMemo } from "react";

interface TypewriterProps {
  text: string;
  mode?: "python" | "bash";
  delay?: number;
  restartDelay?: number;
}

export function Typewriter({ text, mode = "python", delay = 30, restartDelay = 3000 }: TypewriterProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setCurrentIndex((prev) => prev + 1);
      }, delay);
      return () => clearTimeout(timeout);
    } else {
      const timeout = setTimeout(() => {
        setCurrentIndex(0);
      }, restartDelay);
      return () => clearTimeout(timeout);
    }
  }, [currentIndex, text, delay, restartDelay]);

  const renderedTokens = useMemo(() => {
    const currentText = text.slice(0, currentIndex);
    
    if (mode === "python") {
      // Simple tokenizer for Python
      const tokenRegex = /("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|#.*$|\b(?:class|def|if|return|in|for|from|import)\b|\b(?:Solution|enumerate)\b|\b(?:self|nums|target|seen|k|i|n)\b|\b\d+\b|[(){}[\]:+\-*/=>!<]|[\s\w]+)/gm;
      
      const parts = currentText.split(tokenRegex).filter(Boolean);
      return parts.map((part, i) => {
        let colorClass = "text-foreground";
        if (/^("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')$/.test(part)) colorClass = "text-emerald-400";
        else if (/^#.*$/.test(part)) colorClass = "text-zinc-500 italic";
        else if (/^\b(class|def|if|return|in|for|from|import)\b$/.test(part)) colorClass = "text-blue-400 font-bold";
        else if (/^\b(Solution|enumerate)\b$/.test(part)) colorClass = "text-yellow-300 font-bold";
        else if (/^\b(self|nums|target|seen|k|i|n)\b$/.test(part)) colorClass = "text-orange-300 italic";
        else if (/^\d+$/.test(part)) colorClass = "text-purple-400";
        else if (/^[(){}[\]:+\-*/=>!<]$/.test(part)) colorClass = "text-zinc-400";
        
        return <span key={i} className={colorClass}>{part}</span>;
      });
    } else {
      // Simple tokenizer for Bash
      const lines = currentText.split("\n");
      return lines.map((line, i) => {
        let content: React.ReactNode = line;
        if (line.startsWith("$ ")) {
          content = <span className="text-sky-300 font-bold">{line}</span>;
        } else if (line.startsWith("> ")) {
          content = <span className="text-zinc-400">{line}</span>;
        } else {
          // Highlight special bracketed words
          const parts = line.split(/(\[SUCCESS\]|\[WELCOME\]|\[ERROR\]|\[FAILURE\])/g);
          content = parts.map((part, j) => {
            if (part === "[SUCCESS]" || part === "[WELCOME]") return <span key={j} className="text-emerald-400 font-bold">{part}</span>;
            if (part === "[ERROR]" || part === "[FAILURE]") return <span key={j} className="text-rose-400 font-bold">{part}</span>;
            return <span key={j}>{part}</span>;
          });
        }
        return (
          <React.Fragment key={i}>
            {content}
            {i < lines.length - 1 && "\n"}
          </React.Fragment>
        );
      });
    }
  }, [currentIndex, text, mode]);

  return (
    <>
      {renderedTokens}
      <span className="inline-block w-[2px] h-[1.2em] bg-primary align-middle ml-0.5 animate-pulse" />
    </>
  );
}

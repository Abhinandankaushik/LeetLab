import * as React from "react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

interface SolvedDonutProps {
  solved: {
    EASY: number;
    MEDIUM: number;
    HARD: number;
  };
  total: {
    EASY: number;
    MEDIUM: number;
    HARD: number;
  };
}

export function SolvedProblemsDonut({ solved, total }: SolvedDonutProps) {
  const totalSolved = solved.EASY + solved.MEDIUM + solved.HARD;
  const totalAvailable = total.EASY + total.MEDIUM + total.HARD;

  const data = [
    { name: "Solved", value: totalSolved },
    { name: "Remaining", value: Math.max(0, totalAvailable - totalSolved) },
  ];

  return (
    <div className="relative flex items-center justify-center h-40 w-40">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            innerRadius={65}
            outerRadius={80}
            paddingAngle={0}
            dataKey="value"
            startAngle={90}
            endAngle={450}
            stroke="none"
          >
            <Cell fill="var(--primary)" />
            <Cell fill="var(--muted)" />
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className="absolute flex flex-col items-center justify-center text-center">
        <span className="text-3xl font-black font-display leading-none">{totalSolved}</span>
        <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mt-1">Solved</span>
      </div>
    </div>
  );
}

export function DifficultyRow({ label, solved, total, color }: { label: string; solved: number; total: number; color: string }) {
  const pct = total > 0 ? Math.round((solved / total) * 100) : 0;
  return (
    <div className="w-full space-y-1">
      <div className="flex items-center justify-between font-mono text-[10px] font-bold uppercase tracking-widest">
        <span className="text-muted-foreground">{label}</span>
        <span>
          <span className="text-foreground">{solved}</span>
          <span className="text-muted-foreground/40 mx-1">/</span>
          <span className="text-muted-foreground">{total}</span>
        </span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted/40">
        <div 
          className={`h-full rounded-full transition-all duration-1000 ${color}`} 
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

import * as React from "react";
import { ChevronDown, Calendar } from "lucide-react";
import type { ActivityDay } from "@/lib/api";
import { cn } from "@/lib/utils";

interface Props {
  data: ActivityDay[];
  year?: number;
  onYearChange?: (year: number) => void;
  availableYears?: number[];
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const DAYS = ["Mon", "Wed", "Fri"];

function getLevel(count: number): number {
  if (count <= 0) return 0;
  if (count < 2) return 1;
  if (count < 4) return 2;
  if (count < 7) return 3;
  return 4;
}

function fmtDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export function ActivityHeatmap({ data, year, onYearChange, availableYears = [] }: Props) {
  const targetYear = year ?? new Date().getFullYear();
  
  // Ensure we have at least the current year and the target year in availableYears
  const years = React.useMemo(() => {
    const ySet = new Set(availableYears);
    ySet.add(new Date().getFullYear());
    ySet.add(targetYear);
    return Array.from(ySet).sort((a, b) => b - a);
  }, [availableYears, targetYear]);

  const map = React.useMemo(() => {
    const m = new Map<string, number>();
    data.forEach((d) => m.set(d.date, d.count));
    return m;
  }, [data]);

  const weeks = React.useMemo(() => {
    const start = new Date(targetYear, 0, 1);
    const startDay = start.getDay();
    start.setDate(start.getDate() - startDay);

    const weekArr: { date: string; count: number; inYear: boolean }[][] = [];
    const cursor = new Date(start);
    for (let w = 0; w < 53; w++) {
      const week: { date: string; count: number; inYear: boolean }[] = [];
      for (let d = 0; d < 7; d++) {
        const dateStr = fmtDate(cursor);
        week.push({
          date: dateStr,
          count: map.get(dateStr) || 0,
          inYear: cursor.getFullYear() === targetYear,
        });
        cursor.setDate(cursor.getDate() + 1);
      }
      weekArr.push(week);
    }
    return weekArr;
  }, [targetYear, map]);

  const totalActive = React.useMemo(
    () => data.filter((d) => d.count > 0).length,
    [data]
  );
  const totalSubmissions = React.useMemo(
    () => data.reduce((a, b) => a + b.count, 0),
    [data]
  );

  const cellSize = 12;
  const cellGap = 3;

  return (
    <div className="rounded-xl border border-border bg-card p-5 hover-glow transition-all">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 font-display text-xl font-bold">
            <Calendar className="h-5 w-5 text-primary opacity-70" />
            {totalSubmissions} submissions <span className="text-muted-foreground font-normal text-sm">in {targetYear}</span>
          </div>
          <div className="font-mono text-xs text-muted-foreground mt-1">
            Active {totalActive} day{totalActive === 1 ? "" : "s"}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative group">
            <select 
              value={targetYear}
              onChange={(e) => onYearChange?.(parseInt(e.target.value))}
              className="appearance-none bg-muted/50 border border-border rounded-md px-3 py-1.5 pr-8 font-mono text-xs focus:ring-1 focus:ring-primary outline-none cursor-pointer hover:bg-muted transition-colors"
            >
              {years.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground pointer-events-none" />
          </div>

          <div className="hidden sm:flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            less
            {[0, 1, 2, 3, 4].map((l) => (
              <span
                key={l}
                className="inline-block rounded-sm"
                style={{
                  width: cellSize,
                  height: cellSize,
                  background: levelColor(l),
                }}
              />
            ))}
            more
          </div>
        </div>
      </div>

      <div className="overflow-x-auto scrollbar-thin pb-2">
        <svg
          width={weeks.length * (cellSize + cellGap) + 35}
          height={7 * (cellSize + cellGap) + 25}
          className="block min-w-full"
        >
          {weeks.map((week, wi) => {
            const firstInYear = week.find((d) => d.inYear);
            if (!firstInYear) return null;
            const date = new Date(firstInYear.date);
            const isFirstWeekOfMonth = date.getDate() <= 7;
            if (!isFirstWeekOfMonth) return null;
            return (
              <text
                key={`m-${wi}`}
                x={wi * (cellSize + cellGap) + 32}
                y={10}
                className="fill-muted-foreground font-bold"
                style={{ fontSize: 9, fontFamily: "var(--font-mono)" }}
              >
                {MONTHS[date.getMonth()]}
              </text>
            );
          })}
          {DAYS.map((d, i) => (
            <text
              key={d}
              x={0}
              y={(i * 2 + 1) * (cellSize + cellGap) + 23}
              className="fill-muted-foreground"
              style={{ fontSize: 8, fontFamily: "var(--font-mono)" }}
            >
              {d}
            </text>
          ))}
          {weeks.map((week, wi) =>
            week.map((day, di) => {
              const level = day.inYear ? getLevel(day.count) : -1;
              return (
                <rect
                  key={`${wi}-${di}`}
                  x={wi * (cellSize + cellGap) + 32}
                  y={di * (cellSize + cellGap) + 16}
                  width={cellSize}
                  height={cellSize}
                  rx={2}
                  fill={level === -1 ? "transparent" : levelColor(level)}
                  className={cn(
                    "transition-all hover:stroke-primary",
                    level > 0 && "cursor-pointer"
                  )}
                  style={{ strokeWidth: level > 0 ? 1 : 0 }}
                >
                  <title>
                    {day.count} submission{day.count === 1 ? "" : "s"} on {new Date(day.date).toDateString()}
                  </title>
                </rect>
              );
            })
          )}
        </svg>
      </div>
    </div>
  );
}

function levelColor(level: number): string {
  switch (level) {
    case 0: return "color-mix(in oklab, var(--muted) 80%, transparent)";
    case 1: return "color-mix(in oklab, var(--primary) 25%, var(--muted))";
    case 2: return "color-mix(in oklab, var(--primary) 50%, var(--muted))";
    case 3: return "color-mix(in oklab, var(--primary) 75%, var(--muted))";
    case 4: return "var(--primary)";
    default: return "transparent";
  }
}

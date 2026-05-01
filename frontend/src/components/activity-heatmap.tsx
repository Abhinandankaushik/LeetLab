import * as React from "react";
import type { ActivityDay } from "@/lib/api";

interface Props {
  data: ActivityDay[];
  year?: number;
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

export function ActivityHeatmap({ data, year }: Props) {
  const targetYear = year ?? new Date().getFullYear();
  const map = React.useMemo(() => {
    const m = new Map<string, number>();
    data.forEach((d) => m.set(d.date, d.count));
    return m;
  }, [data]);

  // Generate 53 weeks × 7 days for the year
  const weeks = React.useMemo(() => {
    const start = new Date(targetYear, 0, 1);
    // Move start to previous Sunday
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
    () => Array.from(map.values()).filter((c) => c > 0).length,
    [map]
  );
  const totalSubmissions = React.useMemo(
    () => Array.from(map.values()).reduce((a, b) => a + b, 0),
    [map]
  );

  const cellSize = 12;
  const cellGap = 3;

  return (
    <div className="rounded-xl border border-border bg-card p-5 hover-glow">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="font-display text-xl font-bold">
            {totalSubmissions} submissions <span className="text-muted-foreground font-normal text-sm">in {targetYear}</span>
          </div>
          <div className="font-mono text-xs text-muted-foreground">
            Active {totalActive} day{totalActive === 1 ? "" : "s"}
          </div>
        </div>
        <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
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

      <div className="overflow-x-auto scrollbar-thin pb-2">
        <svg
          width={weeks.length * (cellSize + cellGap) + 30}
          height={7 * (cellSize + cellGap) + 24}
          className="block min-w-full"
        >
          {/* Month labels */}
          {weeks.map((week, wi) => {
            const firstInYear = week.find((d) => d.inYear);
            if (!firstInYear) return null;
            const date = new Date(firstInYear.date);
            const isFirstWeekOfMonth = date.getDate() <= 7;
            if (!isFirstWeekOfMonth) return null;
            return (
              <text
                key={`m-${wi}`}
                x={wi * (cellSize + cellGap) + 30}
                y={10}
                className="fill-muted-foreground"
                style={{ fontSize: 10, fontFamily: "var(--font-mono)" }}
              >
                {MONTHS[date.getMonth()]}
              </text>
            );
          })}
          {/* Day labels */}
          {DAYS.map((d, i) => (
            <text
              key={d}
              x={0}
              y={(i * 2 + 1) * (cellSize + cellGap) + 22}
              className="fill-muted-foreground"
              style={{ fontSize: 9, fontFamily: "var(--font-mono)" }}
            >
              {d}
            </text>
          ))}
          {/* Cells */}
          {weeks.map((week, wi) =>
            week.map((day, di) => {
              const level = day.inYear ? getLevel(day.count) : -1;
              return (
                <rect
                  key={`${wi}-${di}`}
                  x={wi * (cellSize + cellGap) + 30}
                  y={di * (cellSize + cellGap) + 16}
                  width={cellSize}
                  height={cellSize}
                  rx={2}
                  fill={level === -1 ? "transparent" : levelColor(level)}
                  className="transition-all hover:stroke-primary"
                  style={{ strokeWidth: 1 }}
                >
                  <title>
                    {day.count} submission{day.count === 1 ? "" : "s"} on {day.date}
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

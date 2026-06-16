import { cn } from "@/lib/utils";
import type { Difficulty } from "@/lib/api";

const styles: Record<Difficulty, string> = {
  EASY: "bg-easy/15 text-easy border-easy/30",
  MEDIUM: "bg-medium/15 text-medium border-medium/30",
  HARD: "bg-hard/15 text-hard border-hard/30",
};

export function DifficultyBadge({ value, className }: { value: Difficulty; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-semibold uppercase tracking-wider",
        styles[value],
        className,
      )}
    >
      {value}
    </span>
  );
}

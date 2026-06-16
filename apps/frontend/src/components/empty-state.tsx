import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border bg-card/40 p-12 text-center", className)}>
      {Icon && (
        <div className="grid h-14 w-14 place-items-center rounded-2xl bg-primary/10 text-primary">
          <Icon className="h-6 w-6" />
        </div>
      )}
      <h3 className="font-display text-lg font-semibold">{title}</h3>
      {description && <p className="max-w-sm text-sm text-muted-foreground">{description}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}

export function ErrorState({
  title = "Something broke",
  description,
  onRetry,
  className,
}: {
  title?: string;
  description?: string;
  onRetry?: () => void;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col items-center justify-center gap-3 rounded-xl border border-destructive/30 bg-destructive/5 p-10 text-center", className)}>
      <h3 className="font-display text-lg font-semibold text-destructive">{title}</h3>
      {description && <p className="max-w-md text-sm text-muted-foreground">{description}</p>}
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-2 rounded-md border border-destructive/40 bg-destructive/10 px-4 py-1.5 text-xs font-semibold text-destructive transition-colors hover:bg-destructive/20"
        >
          Retry
        </button>
      )}
    </div>
  );
}

export function ListSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-14 rounded-md skeleton-shimmer" />
      ))}
    </div>
  );
}

export function CardGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="h-44 rounded-xl skeleton-shimmer" />
      ))}
    </div>
  );
}

/** Base shimmer block — compose page skeletons out of these. */
export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("skeleton-shimmer rounded-md", className)} />;
}

/** Profile / public profile loading shape. */
export function ProfileSkeleton() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 space-y-8 animate-in fade-in duration-300">
      <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
        <Skeleton className="h-24 w-24 shrink-0 rounded-full" />
        <div className="w-full flex-1 space-y-3">
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-4 w-32" />
          <div className="flex gap-2 pt-2">
            <Skeleton className="h-6 w-20 rounded-full" />
            <Skeleton className="h-6 w-24 rounded-full" />
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-xl" />
        ))}
      </div>
      <Skeleton className="h-40 w-full rounded-xl" />
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-14 w-full rounded-lg" />
        ))}
      </div>
    </div>
  );
}

/** Generic article/detail loading shape (discuss post, playlist detail). */
export function DetailSkeleton() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-10 space-y-6 animate-in fade-in duration-300">
      <Skeleton className="h-4 w-28" />
      <Skeleton className="h-9 w-3/4" />
      <div className="flex items-center gap-3">
        <Skeleton className="h-8 w-8 rounded-full" />
        <Skeleton className="h-4 w-40" />
      </div>
      <div className="space-y-3 pt-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className={cn("h-4", ["w-full", "w-5/6", "w-2/3"][i % 3])} />
        ))}
      </div>
      <Skeleton className="h-48 w-full rounded-xl" />
    </div>
  );
}

/** Two-pane coding workspace loading shape (problem detail, contest workspace). */
export function EditorSkeleton({ fullScreen = false }: { fullScreen?: boolean }) {
  return (
    <div className={cn("flex w-full animate-in fade-in duration-300", fullScreen ? "h-screen" : "h-[calc(100vh-3.5rem)]")}>
      <div className="hidden w-2/5 flex-col gap-4 border-r border-border p-6 lg:flex">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-8 w-2/3" />
        <div className="flex gap-2">
          <Skeleton className="h-6 w-16 rounded-full" />
          <Skeleton className="h-6 w-16 rounded-full" />
        </div>
        <div className="space-y-3 pt-4">
          {Array.from({ length: 9 }).map((_, i) => (
            <Skeleton key={i} className={cn("h-4", ["w-full", "w-5/6", "w-2/3"][i % 3])} />
          ))}
        </div>
      </div>
      <div className="flex flex-1 flex-col">
        <Skeleton className="h-11 w-full rounded-none" />
        <div className="flex-1 space-y-3 p-6">
          {Array.from({ length: 12 }).map((_, i) => (
            <Skeleton key={i} className={cn("h-4", ["w-1/3", "w-2/3", "w-1/2", "w-3/4"][i % 4])} />
          ))}
        </div>
      </div>
    </div>
  );
}

/** Form loading shape (admin create/edit, profile edit). */
export function FormSkeleton() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 space-y-6 animate-in fade-in duration-300">
      <Skeleton className="h-8 w-52" />
      <div className="space-y-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-10 w-full rounded-lg" />
          </div>
        ))}
        <Skeleton className="h-10 w-32 rounded-lg" />
      </div>
    </div>
  );
}

/** Stat cards + table loading shape (dashboards, submissions). */
export function DashboardSkeleton({ stats = 4, rows = 8 }: { stats?: number; rows?: number }) {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 space-y-6 animate-in fade-in duration-300">
      <Skeleton className="h-8 w-56" />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {Array.from({ length: stats }).map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-xl" />
        ))}
      </div>
      <div className="space-y-2">
        {Array.from({ length: rows }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full rounded-lg" />
        ))}
      </div>
    </div>
  );
}

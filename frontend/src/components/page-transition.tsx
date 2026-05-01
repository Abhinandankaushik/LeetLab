import { useLocation } from "react-router-dom";
import * as React from "react";

/**
 * Re-mounts children with a fade-in-up animation on every route change.
 * Pure CSS — no extra deps.
 */
export function PageTransition({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  return (
    <div key={location.pathname} className="page-enter">
      {children}
    </div>
  );
}

/** Top scroll-progress bar — fixed, gradient, smooth. */
export function ScrollProgress() {
  const [progress, setProgress] = React.useState(0);
  React.useEffect(() => {
    const onScroll = () => {
      const h = document.documentElement;
      const scrolled = h.scrollTop;
      const max = h.scrollHeight - h.clientHeight;
      setProgress(max > 0 ? (scrolled / max) * 100 : 0);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-50 h-[2px] bg-transparent">
      <div
        className="h-full bg-gradient-to-r from-primary via-accent to-primary transition-[width] duration-150 ease-out"
        style={{ width: `${progress}%`, boxShadow: "0 0 12px var(--glow)" }}
      />
    </div>
  );
}

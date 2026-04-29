import * as React from "react";

/**
 * Canvas-based animated particle background.
 * Renders soft floating orbs + connecting lines, purely on canvas so it
 * never affects DOM layout and works in dark/light mode.
 */
export function BackgroundAnimation() {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf: number;
    let W = 0, H = 0;

    // ── Particle ────────────────────────────────────────────────────────
    interface Particle {
      x: number; y: number;
      vx: number; vy: number;
      r: number;
      opacity: number;
      color: string;
    }

    const COLORS = [
      "oklch(0.82 0.19 145)", // primary green
      "oklch(0.72 0.16 220)", // accent blue
      "oklch(0.78 0.16 80)",  // amber/medium
    ];

    let particles: Particle[] = [];

    const resize = () => {
      W = canvas.width = window.innerWidth;
      H = canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const spawn = (): Particle => ({
      x: Math.random() * W,
      y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      r: Math.random() * 2 + 1,
      opacity: Math.random() * 0.4 + 0.05,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
    });

    const count = Math.min(70, Math.floor((W * H) / 18000));
    particles = Array.from({ length: count }, spawn);

    const CONNECT_DIST = 140;

    const draw = () => {
      ctx.clearRect(0, 0, W, H);

      // ── Move particles ────────────────────────────────────────────
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < -10) p.x = W + 10;
        if (p.x > W + 10) p.x = -10;
        if (p.y < -10) p.y = H + 10;
        if (p.y > H + 10) p.y = -10;
      });

      // ── Draw connections ──────────────────────────────────────────
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < CONNECT_DIST) {
            const alpha = (1 - dist / CONNECT_DIST) * 0.12;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `oklch(0.82 0.19 145 / ${alpha})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }
      }

      // ── Draw particles ────────────────────────────────────────────
      particles.forEach((p) => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        // Parse color and add opacity
        const c = p.color.replace(")", ` / ${p.opacity})`).replace("oklch(", "oklch(");
        ctx.fillStyle = c;
        ctx.fill();
      });

      raf = requestAnimationFrame(draw);
    };

    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-0"
      aria-hidden="true"
      style={{ mixBlendMode: "screen" }}
    />
  );
}

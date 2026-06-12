import React, { useEffect, useRef } from "react";

/**
 * Theme-aware, mouse-reactive particle field.
 *
 * - Pulls its colours from the live CSS theme tokens (--primary / --accent) so it
 *   always matches dark/light mode instead of a hard-coded hue.
 * - Particles softly drift, link to nearby neighbours, and react to the cursor
 *   (connection lines + a gentle parallax push near the pointer).
 * - Fully disabled when the user prefers reduced motion.
 */
export const InteractiveBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    /** Resolve a CSS custom property to an {r,g,b} triple via the canvas colour parser. */
    const resolveRGB = (varName: string, fallback: [number, number, number]): [number, number, number] => {
      try {
        const raw = getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
        if (!raw) return fallback;
        ctx.fillStyle = "#000";
        ctx.fillStyle = raw; // browser normalises oklch() -> #rrggbb
        const hex = ctx.fillStyle as string;
        const m = /^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(hex);
        if (!m) return fallback;
        return [parseInt(m[1], 16), parseInt(m[2], 16), parseInt(m[3], 16)];
      } catch {
        return fallback;
      }
    };

    let primary = resolveRGB("--primary", [110, 231, 183]);
    let accent = resolveRGB("--accent", [96, 165, 250]);
    const rgba = (c: [number, number, number], a: number) => `rgba(${c[0]}, ${c[1]}, ${c[2]}, ${a})`;

    let animationFrameId = 0;
    let particles: Particle[] = [];
    const connectionDistance = 150;
    const mouse = { x: -9999, y: -9999, active: false };
    let dpr = Math.min(window.devicePixelRatio || 1, 2);

    const particleCount = () => {
      const area = window.innerWidth * window.innerHeight;
      return Math.min(90, Math.max(36, Math.round(area / 22000)));
    };

    class Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      hue: [number, number, number];

      constructor() {
        this.x = Math.random() * window.innerWidth;
        this.y = Math.random() * window.innerHeight;
        this.vx = (Math.random() - 0.5) * 0.45;
        this.vy = (Math.random() - 0.5) * 0.45;
        this.size = Math.random() * 1.8 + 0.8;
        this.hue = Math.random() > 0.5 ? primary : accent;
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;

        // Gentle parallax push away from the cursor.
        if (mouse.active) {
          const dx = this.x - mouse.x;
          const dy = this.y - mouse.y;
          const dist = Math.hypot(dx, dy);
          if (dist < mouse_radius && dist > 0.01) {
            const force = (mouse_radius - dist) / mouse_radius;
            this.x += (dx / dist) * force * 1.1;
            this.y += (dy / dist) * force * 1.1;
          }
        }

        if (this.x < 0 || this.x > window.innerWidth) this.vx *= -1;
        if (this.y < 0 || this.y > window.innerHeight) this.vy *= -1;
        this.x = Math.max(0, Math.min(window.innerWidth, this.x));
        this.y = Math.max(0, Math.min(window.innerHeight, this.y));
      }

      draw() {
        if (!ctx) return;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = rgba(this.hue, 0.55);
        ctx.fill();
      }
    }

    const mouse_radius = 170;

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const init = () => {
      resize();
      particles = Array.from({ length: particleCount() }, () => new Particle());
    };

    const drawConnections = () => {
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p.x - p2.x;
          const dy = p.y - p2.y;
          const dist = Math.hypot(dx, dy);
          if (dist < connectionDistance) {
            ctx.beginPath();
            ctx.strokeStyle = rgba(primary, 0.16 * (1 - dist / connectionDistance));
            ctx.lineWidth = 0.7;
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }

        // Brighter links to the cursor.
        if (mouse.active) {
          const dxm = p.x - mouse.x;
          const dym = p.y - mouse.y;
          const dm = Math.hypot(dxm, dym);
          if (dm < mouse_radius) {
            ctx.beginPath();
            ctx.strokeStyle = rgba(accent, 0.35 * (1 - dm / mouse_radius));
            ctx.lineWidth = 0.9;
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(mouse.x, mouse.y);
            ctx.stroke();
          }
        }
      }
    };

    const renderStatic = () => {
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      particles.forEach((p) => p.draw());
      drawConnections();
    };

    const animate = () => {
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      particles.forEach((p) => {
        p.update();
        p.draw();
      });
      drawConnections();
      animationFrameId = requestAnimationFrame(animate);
    };

    const onMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      mouse.active = true;
    };
    const onMouseLeave = () => { mouse.active = false; };
    const onResize = () => { init(); if (reduceMotion) renderStatic(); };
    const onThemeChange = () => {
      primary = resolveRGB("--primary", primary);
      accent = resolveRGB("--accent", accent);
      particles.forEach((p) => { p.hue = Math.random() > 0.5 ? primary : accent; });
      if (reduceMotion) renderStatic();
    };

    init();
    if (reduceMotion) {
      renderStatic();
    } else {
      animate();
      window.addEventListener("mousemove", onMouseMove, { passive: true });
      window.addEventListener("mouseout", onMouseLeave);
    }
    window.addEventListener("resize", onResize);

    const themeObserver = new MutationObserver(onThemeChange);
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseout", onMouseLeave);
      window.removeEventListener("resize", onResize);
      themeObserver.disconnect();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none z-0 opacity-50"
      style={{ background: "transparent" }}
    />
  );
};

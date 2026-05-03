import { Link } from "react-router-dom";
import { Github, Linkedin, Twitter, Code2, Globe, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";

export function SiteFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative z-10 border-t border-border/60 bg-background/50 backdrop-blur-md transition-colors duration-300">
      <div className="mx-auto max-w-7xl px-4 py-12 md:py-16">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-4 lg:gap-20">
          {/* Brand and Mission */}
          <div className="md:col-span-2">
            <Link to="/" className="group flex items-center gap-2 font-display text-xl font-bold transition-transform hover:scale-[1.02]">
              <span className="grid h-8 w-8 place-items-center rounded-md bg-gradient-primary text-primary-foreground glow-primary transition-transform duration-500 group-hover:rotate-[360deg]">
                <Code2 className="h-4 w-4" />
              </span>
              <span>
                leet<span className="text-gradient-animated">/</span>lab
              </span>
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted-foreground">
              The elite coding playground built for the real ones. 
              Master the grind, build your legacy, and stay ahead of the curve.
            </p>
            <div className="mt-6 flex items-center gap-4">
              <Button asChild variant="ghost" size="icon" className="h-9 w-9 rounded-full transition-all hover:bg-primary/10 hover:text-primary hover:shadow-[0_0_20px_var(--glow)]">
                <a href="https://github.com/Abhinandankaushik" target="_blank" rel="noopener noreferrer" aria-label="GitHub">
                  <Github className="h-5 w-5" />
                </a>
              </Button>
              <Button asChild variant="ghost" size="icon" className="h-9 w-9 rounded-full transition-all hover:bg-primary/10 hover:text-primary hover:shadow-[0_0_20px_var(--glow)]">
                <a href="https://www.linkedin.com/in/abhinandan16/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
                  <Linkedin className="h-5 w-5" />
                </a>
              </Button>
              <Button asChild variant="ghost" size="icon" className="h-9 w-9 rounded-full transition-all hover:bg-primary/10 hover:text-primary hover:shadow-[0_0_20px_var(--glow)]">
                <a href="https://x.com/Abhii1716" target="_blank" rel="noopener noreferrer" aria-label="Twitter">
                  <Twitter className="h-5 w-5" />
                </a>
              </Button>
            </div>
          </div>

          {/* Quick Links */}
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-2 md:col-span-2 lg:gap-12">
            <div className="flex flex-col gap-4">
              <h3 className="font-display text-sm font-bold uppercase tracking-wider text-foreground/90">Platform</h3>
              <nav className="flex flex-col gap-2.5">
                <FooterLink to="/problems">The Forge</FooterLink>
                <FooterLink to="/contests">Arenas</FooterLink>
                <FooterLink to="/leaderboard">Hall of Fame</FooterLink>
                <FooterLink to="/discuss">The Den</FooterLink>
              </nav>
            </div>
            <div className="flex flex-col gap-4">
              <h3 className="font-display text-sm font-bold uppercase tracking-wider text-foreground/90">Resources</h3>
              <nav className="flex flex-col gap-2.5">
                <FooterLink to="/playlists">Playlists</FooterLink>
                <FooterLink to="/submissions">My Submissions</FooterLink>
                <FooterLink to="/profile">Profile Settings</FooterLink>
              </nav>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 flex flex-col items-center justify-between gap-6 border-t border-border/40 pt-8 md:mt-16 md:flex-row">
          <p className="text-center font-mono text-[11px] text-muted-foreground md:text-left">
            &copy; {currentYear} LeetLab. All rights reserved.
          </p>

          <div className="flex items-center gap-1.5 font-mono text-[11px] text-muted-foreground transition-colors hover:text-primary">
            <span>Made with</span>
            <Heart className="h-3 w-3 fill-primary text-primary animate-pulse" />
            <span>by</span>
            <a
              href="https://github.com/Abhinandankaushik"
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold decoration-primary/30 underline-offset-4 hover:underline"
            >
              Abhinandan Kaushik
            </a>
          </div>

          <div className="flex items-center gap-6 font-mono text-[11px] text-muted-foreground">
            <Link to="/privacy" className="hover:text-foreground">Privacy</Link>
            <Link to="/terms" className="hover:text-foreground">Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterLink({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <Link
      to={to}
      className="text-sm text-muted-foreground transition-colors hover:translate-x-1 hover:text-primary inline-flex items-center gap-1 group"
    >
      <span className="h-px w-0 bg-primary transition-all group-hover:w-2" />
      {children}
    </Link>
  );
}

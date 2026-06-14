import * as React from "react";
import { Link, useNavigate, NavLink as RRNavLink } from "react-router-dom";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  Code2, LogOut, User as UserIcon, Settings, Trophy, MessageSquare,
  ListChecks, Layers, Activity, Shield, Sparkles, ChevronDown, Home as HomeIcon, Menu, X, History
} from "lucide-react";

import { cn } from "@/lib/utils";

interface NavItem { to: string; label: string; icon?: any; }

const PRIMARY: NavItem[] = [
  { to: "/", label: "Home", icon: HomeIcon },
  { to: "/problems", label: "Problems", icon: Code2 },
  { to: "/contests", label: "Contests", icon: Trophy },
  { to: "/discuss", label: "Discuss", icon: MessageSquare },
  { to: "/leaderboard", label: "Leaderboard", icon: Activity },
];

const SECONDARY: NavItem[] = [
  { to: "/playlists", label: "Playlists", icon: Layers },
  { to: "/submissions", label: "Submissions", icon: ListChecks },
];

export function SiteHeader() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [profileOpen, setProfileOpen] = React.useState(false);
  const profileRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    function onClick(e: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <>
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/70 backdrop-blur-xl supports-[backdrop-filter]:bg-background/50 animate-fade-in relative">
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-4 px-4">
        <Link to="/" className="group flex items-center gap-2 font-display text-lg font-bold transition-transform hover:scale-[1.02]">
          <span className="grid h-8 w-8 place-items-center rounded-md bg-gradient-primary text-primary-foreground glow-primary transition-transform duration-300 group-hover:scale-105">
            <Code2 className="h-4 w-4" />
          </span>
          <span>
            leet<span className="text-gradient-animated">/</span>lab
          </span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {PRIMARY.map((it) => (
            <NavLink key={it.to} to={it.to}>{it.label}</NavLink>
          ))}
          <div className="hidden lg:flex lg:items-center lg:gap-1">
            {SECONDARY.map((it) => (
              <NavLink key={it.to} to={it.to}>{it.label}</NavLink>
            ))}
          </div>
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setProfileOpen((v) => !v)}
              onMouseEnter={() => setProfileOpen(true)}
              className={cn(
                "group flex items-center gap-2 rounded-full border border-border/60 bg-card transition-all hover:border-primary hover:shadow-[0_0_20px_var(--glow)]",
                user ? "pr-3 pl-1 py-1" : "p-1.5"
              )}
              aria-haspopup="menu"
              aria-expanded={profileOpen}
            >
              {user ? (
                <>
                  <Avatar user={user} />
                  <span className="hidden sm:flex flex-col items-start leading-tight">
                    <span className="font-mono text-xs">{user.name || user.email.split("@")[0]}</span>
                    {typeof user.rating === "number" ? (
                      <span className="font-mono text-[10px] text-primary">{user.rating}</span>
                    ) : null}
                  </span>
                  <ChevronDown className={`h-3 w-3 text-muted-foreground transition-transform ${profileOpen ? "rotate-180" : ""}`} />
                </>
              ) : (
                <>
                  <div className="grid h-7 w-7 place-items-center rounded-full bg-muted text-muted-foreground">
                    <Menu className="h-4 w-4" />
                  </div>
                  <span className="hidden sm:inline font-mono text-xs px-1">Menu</span>
                  <ChevronDown className={`h-3 w-3 text-muted-foreground transition-transform ${profileOpen ? "rotate-180" : ""}`} />
                </>
              )}
            </button>

            {profileOpen && (
              <div
                onMouseLeave={() => setProfileOpen(false)}
                className="absolute right-0 top-full mt-2 w-72 origin-top-right animate-scale-in rounded-xl border border-border bg-popover shadow-2xl overflow-y-auto max-h-[80vh] scrollbar-thin"
                role="menu"
              >
                {user ? (
                  <>
                    <div className="border-b border-border/60 p-4 bg-muted/20">
                      <div className="flex items-center gap-3">
                        <Avatar user={user} size="lg" />
                        <div className="min-w-0">
                          <div className="truncate font-display text-sm font-bold">{user.name || user.email.split("@")[0]}</div>
                          <div className="truncate font-mono text-xs text-muted-foreground">{user.email}</div>
                        </div>
                      </div>
                      <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                        <MiniStat label="rating" value={user.rating ?? "—"} />
                        <MiniStat label="streak" value={user.currentStreak ?? 0} />
                        <MiniStat label="role" value={user.role === "ADMIN" ? "ADM" : "USR"} />
                      </div>
                    </div>

                    <div className="p-1">
                      <DropItem to="/profile" icon={UserIcon} onClick={() => setProfileOpen(false)}>My Profile</DropItem>
                      <DropItem to="/contests/history" icon={History} onClick={() => setProfileOpen(false)}>Contest History</DropItem>
                      <DropItem to="/profile/edit" icon={Settings} onClick={() => setProfileOpen(false)}>Edit Profile</DropItem>
                    </div>

                    <div className="border-t border-border/60 p-1 lg:hidden">
                      <div className="px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Navigation</div>
                      {PRIMARY.map((it) => (
                        <DropItem key={it.to} to={it.to} icon={it.icon} onClick={() => setProfileOpen(false)}>{it.label}</DropItem>
                      ))}
                    </div>

                    <div className="border-t border-border/60 p-1">
                      <div className="px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-muted-foreground lg:hidden">Resources</div>
                      {SECONDARY.map((it) => (
                        <DropItem key={it.to} to={it.to} icon={it.icon} onClick={() => setProfileOpen(false)}>{it.label}</DropItem>
                      ))}
                    </div>

                    {user.role === "ADMIN" && (
                      <div className="border-t border-border/60 p-1">
                        <DropItem to="/admin" icon={Shield} accent onClick={() => setProfileOpen(false)}>Admin Dashboard</DropItem>
                        <DropItem to="/admin/problems/ai" icon={Sparkles} onClick={() => setProfileOpen(false)}>New Problem (AI)</DropItem>
                      </div>
                    )}

                    <div className="border-t border-border/60 p-1">
                      <button
                        onClick={() => { handleLogout(); setProfileOpen(false); }}
                        className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-destructive hover:bg-destructive/10"
                      >
                        <LogOut className="h-4 w-4" /> Log out
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="p-1 lg:hidden">
                      <div className="px-3 py-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Navigation</div>
                      {PRIMARY.map((it) => (
                        <DropItem key={it.to} to={it.to} icon={it.icon} onClick={() => setProfileOpen(false)}>{it.label}</DropItem>
                      ))}
                    </div>
                    <div className="border-t border-border/60 p-1 lg:hidden">
                      <div className="px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">More</div>
                       {SECONDARY.map((it) => (
                        <DropItem key={it.to} to={it.to} icon={it.icon} onClick={() => setProfileOpen(false)}>{it.label}</DropItem>
                      ))}
                    </div>
                    <div className="border-t border-border/60 p-3 flex flex-col gap-2">
                      <Button asChild variant="outline" size="sm" className="w-full" onClick={() => setProfileOpen(false)}>
                        <Link to="/login">Sign in</Link>
                      </Button>
                      <Button asChild size="sm" className="w-full btn-shine" onClick={() => setProfileOpen(false)}>
                        <Link to="/register">Sign up</Link>
                      </Button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
    </>
  );
}

function NavLink({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <RRNavLink
      to={to}
      end={to === "/"}
      className={({ isActive }) =>
        cn(
          "relative rounded-lg px-3 py-1.5 text-sm transition-all duration-200",
          isActive
            ? "font-semibold text-primary bg-primary/10 ring-1 ring-inset ring-primary/30 shadow-[0_0_18px_-7px_var(--glow)]"
            : "font-medium text-muted-foreground hover:text-foreground hover:bg-muted/70"
        )
      }
    >
      {({ isActive }) => (
        <span className="relative flex items-center">
          {children}
          {isActive && (
            <span className="pointer-events-none absolute bottom-[-9px] left-1/2 h-0.5 w-5 -translate-x-1/2 rounded-full bg-primary shadow-[0_0_8px_var(--primary)]" />
          )}
        </span>
      )}
    </RRNavLink>
  );
}

function DropItem({ to, icon: Icon, children, accent = false, onClick }: { to: string; icon?: any; children: React.ReactNode; accent?: boolean; onClick?: () => void }) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className={cn(
        "flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-all hover:bg-muted hover:translate-x-0.5",
        accent ? "text-primary font-semibold" : "text-foreground/80"
      )}
    >
      {Icon && <Icon className="h-4 w-4" />} {children}
    </Link>
  );
}

function Avatar({ user, size = "md" }: { user: any; size?: "md" | "lg" }) {
  const cls = size === "lg" ? "h-10 w-10 text-sm" : "h-7 w-7 text-[10px]";
  if (user.image) {
    return (
      <img
        src={user.image}
        alt={user.name || user.email}
        className={`${cls} rounded-full object-cover ring-2 ring-primary/40`}
      />
    );
  }
  return (
    <span className={`${cls} grid place-items-center rounded-full bg-gradient-primary font-bold uppercase text-primary-foreground`}>
      {(user.name || user.email).slice(0, 2)}
    </span>
  );
}

function MiniStat({ label, value }: { label: string; value: any }) {
  return (
    <div className="rounded-md bg-muted/50 p-2">
      <div className="font-display text-sm font-bold">{value}</div>
      <div className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">{label}</div>
    </div>
  );
}

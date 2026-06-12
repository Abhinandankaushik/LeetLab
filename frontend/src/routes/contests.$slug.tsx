import React from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { contestsApi, ratingsApi } from "@/lib/api";
import { ArrowLeft, Trophy, Calendar, Clock, Users, LogIn, LogOut, Layers, ChevronRight, Activity, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ListSkeleton, ErrorState } from "@/components/empty-state";
import { DifficultyBadge } from "@/components/difficulty-badge";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function ContestDetailPage() {
  const { id } = useParams();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["contest", id],
    queryFn: () => contestsApi.get(id!),
    retry: 1
  });

  const contest = data?.contest;
  const isLive = !!contest?.isLive;
  const isUpcoming = contest && !contest.hasStarted;
  const isEnded = contest?.endTime ? new Date(contest.endTime) < new Date() : false;

  const standings = useQuery({
    queryKey: ["contest-standings", id],
    queryFn: () => contestsApi.standings(id!),
    enabled: !!contest
  });

  const register = useMutation({
    mutationFn: () => contestsApi.register(id!),
    onSuccess: () => {
      toast.success("Registered for contest!");
      queryClient.invalidateQueries({ queryKey: ["contest", id] });
      queryClient.invalidateQueries({ queryKey: ["contests"] });
    },
    onError: (err: any) => toast.error(err.message || "Registration failed")
  });

  const unregister = useMutation({
    mutationFn: () => contestsApi.unregister(id!),
    onSuccess: () => {
      toast.success("Unenrolled from contest");
      queryClient.invalidateQueries({ queryKey: ["contest", id] });
      queryClient.invalidateQueries({ queryKey: ["contests"] });
    },
    onError: (err: any) => toast.error(err.message || "Unenrollment failed")
  });

  if (isLoading) return <div className="mx-auto max-w-7xl px-4 py-20"><ListSkeleton rows={10} /></div>;
  if (isError || !data?.contest) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-20">
        <ErrorState 
          title="Contest Not Found"
          description={`The contest with ID "${id}" doesn't exist or has been removed.`} 
          onRetry={() => refetch()} 
        />
      </div>
    );
  }

  const isRegistered = !!contest?.isRegistered;
  const startTime = contest?.startTime ? new Date(contest.startTime) : new Date();
  const endTime = contest?.endTime ? new Date(contest.endTime) : new Date();

  const handleAction = () => {
    if (isLive) {
      if (isRegistered) {
        navigate(`/contests/${id}/workspace`);
      } else {
        register.mutate();
      }
    } else if (isUpcoming) {
      if (isRegistered) {
        unregister.mutate();
      } else {
        register.mutate();
      }
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-6 py-12 stagger">
      <Link to="/contests" className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-primary transition-all mb-8 hover:-translate-x-1">
        <ArrowLeft className="h-4 w-4" /> All contests
      </Link>

      {/* Hero Section */}
      <section className="mb-16">
        <div className="flex flex-col md:flex-row items-start justify-between gap-8 border-b border-border/40 pb-10">
          <div className="flex-1">
             <div className="flex items-center gap-3 mb-4">
                <span className={cn(
                  "px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider shadow-sm",
                  isLive ? "bg-hard text-white animate-pulse" : isUpcoming ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"
                )}>
                  {isLive ? "Live" : isUpcoming ? "Upcoming" : "Ended"}
                </span>
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-muted-foreground">
                   {startTime.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })} · {startTime.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                </span>
             </div>
             <h1 className="font-display text-5xl md:text-6xl font-black tracking-tight text-foreground mb-6">
                {contest?.name}
             </h1>
             <div className="flex flex-wrap items-center gap-3">
                <Button variant="outline" className="rounded-full h-10 px-6 font-bold text-xs gap-2 border-border/60 hover:bg-primary/5 hover:border-primary/40 transition-all active:scale-95">
                   <Activity className="h-4 w-4 text-primary" /> Virtual Contest
                </Button>
                <Button variant="outline" size="icon" className="rounded-full h-10 w-10 border-border/60 hover:bg-muted transition-all">
                   <Share2 className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" className="rounded-full h-10 w-10 border-border/60 hover:bg-muted transition-all">
                   <Activity className="h-4 w-4" />
                </Button>
             </div>
          </div>
          
          <div className="shrink-0 flex flex-col items-center gap-4">
             <div className={cn(
               "relative group p-1 rounded-2xl bg-gradient-to-br from-primary/20 to-transparent",
               isEnded && "opacity-50 grayscale"
             )}>
                <Button 
                  size="lg"
                  disabled={isEnded || register.isPending || unregister.isPending}
                  onClick={handleAction}
                  className={cn(
                    "relative h-14 px-10 text-base font-black uppercase tracking-widest rounded-xl transition-all active:scale-95 shadow-xl",
                    isLive ? (isRegistered ? "bg-hard hover:bg-hard/90 shadow-hard/20" : "bg-primary shadow-primary/20") :
                    isRegistered ? "bg-muted text-foreground hover:bg-destructive hover:text-white" : "bg-primary shadow-primary/20"
                  )}
                >
                  {isLive ? (isRegistered ? "Enter Arena" : "Register Now") : isUpcoming ? (isRegistered ? "Unenroll" : "Register Now") : "Contest Ended"}
                </Button>
                {isLive && isRegistered && (
                  <div className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-hard border-2 border-background flex items-center justify-center animate-bounce">
                    <Trophy className="h-3 w-3 text-white" />
                  </div>
                )}
             </div>
             {!isEnded && (
               <div className="font-mono text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                  <Clock className="h-3 w-3" /> 
                  <CountdownText target={isUpcoming ? startTime : endTime} />
               </div>
             )}
          </div>
        </div>
      </section>

      <div className="grid gap-12 lg:grid-cols-[1fr_360px]">
        {/* Left Column: Description */}
        <div className="space-y-12">
          <section className="prose prose-invert max-w-none">
             <div className="flex items-center gap-3 mb-6 text-muted-foreground">
                <Layers className="h-5 w-5" />
                <span className="text-xs font-black uppercase tracking-widest font-mono">Contest Overview</span>
             </div>
             <div className="text-foreground/80 leading-relaxed text-lg font-sans">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {contest.description || "No description provided for this contest."}
                </ReactMarkdown>
             </div>
          </section>

          {/* Bonus Prizes or Rules Section Mock */}
          <section className="p-8 rounded-[2rem] border border-primary/10 bg-primary/5 shadow-inner">
             <h3 className="flex items-center gap-3 text-lg font-black mb-4">
                <Trophy className="h-5 w-5 text-primary" /> Bonus Prizes
             </h3>
             <ul className="space-y-3 text-sm text-muted-foreground font-medium">
                <li className="flex items-center gap-3">
                   <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                   Contestants ranked <strong className="text-foreground">1st - 3rd</strong> will win a LeetLab T-Shirt
                </li>
                <li className="flex items-center gap-3">
                   <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                   Contestants ranked <strong className="text-foreground">4th - 10th</strong> will win a LeetLab Sticker Pack
                </li>
             </ul>
          </section>
        </div>

        {/* Right Column: Sidebar */}
        <aside className="space-y-8">
           {/* Ranking Card */}
           <div className="group rounded-[2rem] border border-border/40 bg-card/40 backdrop-blur-xl p-6 shadow-2xl transition-all hover:shadow-primary/5 hover:border-primary/20">
              <div className="flex items-center justify-between mb-6">
                 <div className="flex items-center gap-3">
                    <Activity className="h-5 w-5 text-primary" />
                    <h3 className="font-display text-lg font-black tracking-tight">Ranking</h3>
                 </div>
                 <div className="flex -space-x-3 overflow-hidden">
                    {standings.data?.standings?.slice(0, 5).map((s: any, i: number) => (
                      <img 
                        key={i}
                        src={s.user?.image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${s.user?.username}`} 
                        className="h-8 w-8 rounded-full border-2 border-background bg-muted object-cover"
                        alt=""
                      />
                    ))}
                 </div>
              </div>
              <div className="space-y-3 mb-6">
                 {standings.data?.standings?.slice(0, 3).map((s: any, i: number) => (
                   <div key={i} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-3">
                         <span className={cn(
                           "font-mono font-black italic",
                           i === 0 ? "text-hard" : i === 1 ? "text-orange-500" : "text-primary"
                         )}>#{i + 1}</span>
                         <span className="font-bold truncate max-w-[120px]">{s.user?.username}</span>
                      </div>
                      <span className="font-mono text-xs font-black text-muted-foreground">{s.totalPoints} pts</span>
                   </div>
                 ))}
              </div>
              <Link to={`/contests/${id}/standings`} className="block w-full text-center py-3 rounded-xl bg-primary/5 border border-primary/10 text-xs font-black text-primary hover:bg-primary/10 transition-all">
                 View Full Standings
              </Link>
           </div>

           {/* Problem List Card */}
           <div className="rounded-[2rem] border border-border/40 bg-card/40 backdrop-blur-xl p-6 shadow-2xl">
              <div className="flex items-center gap-3 mb-6">
                 <Layers className="h-5 w-5 text-primary" />
                 <h3 className="font-display text-lg font-black tracking-tight">Problem List</h3>
              </div>
              <div className="space-y-2">
                 {!contest.problems?.length && (
                   <p className="text-xs text-muted-foreground text-center py-8">Locked until contest starts</p>
                 )}
                 {contest.problems?.map((cp: any) => (
                   <Link
                     key={cp.id}
                     to={`/contests/${id}/workspace/${cp.problem.id}`}
                     className="flex items-center justify-between p-4 rounded-2xl hover:bg-primary/5 border border-transparent hover:border-primary/10 transition-all group"
                   >
                     <span className="font-bold text-sm text-foreground/80 group-hover:text-primary transition-colors truncate max-w-[200px]">
                        {cp.problem.title}
                     </span>
                     <span className="h-6 w-6 rounded-full bg-muted/50 border border-border/60 flex items-center justify-center text-[10px] font-black font-mono shadow-inner group-hover:bg-primary group-hover:text-white group-hover:border-primary transition-all">
                        {cp.points}
                     </span>
                   </Link>
                 ))}
              </div>
           </div>

           {/* Contest Stats Footer */}
           <div className="grid grid-cols-2 gap-4 px-2">
              <div className="flex flex-col gap-1">
                 <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Participants</span>
                 <span className="text-xl font-black tabular-nums">{(contest.participantCount ?? 0).toLocaleString()}</span>
              </div>
              <div className="flex flex-col gap-1">
                 <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Difficulty</span>
                 <span className="text-xl font-black tabular-nums">Mixed</span>
              </div>
           </div>
        </aside>
      </div>
    </div>
  );
}

function CountdownText({ target }: { target: string | Date }) {
  const [timeLeft, setTimeLeft] = React.useState<string>("—");

  React.useEffect(() => {
    const targetDate = new Date(target).getTime();
    const update = () => {
      const now = Date.now();
      const diff = targetDate - now;
      if (diff <= 0) {
        setTimeLeft("00:00:00");
        return;
      }
      const h = Math.floor(diff / (1000 * 60 * 60));
      const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const s = Math.floor((diff % (1000 * 60)) / 1000);
      setTimeLeft(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`);
    };
    update();
    const timer = setInterval(update, 1000);
    return () => clearInterval(timer);
  }, [target]);

  return <span>{timeLeft} left</span>;
}


function StatBadge({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-card/80 border border-border/60 shadow-sm backdrop-blur-md">
      <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
        <Icon className="h-4 w-4 text-primary" />
      </div>
      <div>
        <div className="text-[9px] uppercase font-bold tracking-widest text-muted-foreground">{label}</div>
        <div className="text-sm font-black tracking-tight">{value}</div>
      </div>
    </div>
  );
}

function CountdownCard({ label, target, onEnd, active }: { label: string; target: string | Date; onEnd?: () => void; active?: boolean }) {
  const [timeLeft, setTimeLeft] = React.useState<string>("—");

  React.useEffect(() => {
    if (!target) return;
    const targetDate = new Date(target).getTime();
    const update = () => {
      const now = Date.now();
      const diff = targetDate - now;
      if (diff <= 0) {
        setTimeLeft(active ? "00:00:00" : "—");
        if (active) onEnd?.();
        return;
      }
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const secs = Math.floor((diff % (1000 * 60)) / 1000);
      
      if (days > 0) setTimeLeft(`${days}d ${hours}h ${mins}m`);
      else setTimeLeft(`${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`);
    };
    update();
    const timer = setInterval(update, 1000);
    return () => clearInterval(timer);
  }, [target, active, onEnd]);

  return (
    <div className={cn(
      "rounded-2xl p-5 border transition-all duration-500",
      active ? "bg-primary/10 border-primary/40 shadow-lg" : "bg-muted/30 border-border/40 opacity-50 grayscale"
    )}>
      <div className="font-mono text-[10px] uppercase font-bold tracking-widest text-muted-foreground">{label}</div>
      <div className={cn(
        "mt-1 font-display text-2xl font-black tracking-widest",
        active ? "text-primary" : "text-muted-foreground"
      )}>{timeLeft}</div>
    </div>
  );
}

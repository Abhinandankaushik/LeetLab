import React from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { contestsApi } from "@/lib/api";
import { ArrowLeft, Trophy, Users, Clock, Share2, Search, Filter, Globe, ChevronLeft, ChevronRight, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ListSkeleton, ErrorState } from "@/components/empty-state";
import { cn } from "@/lib/utils";

export default function ContestStandingsPage() {
  const { id } = useParams();

  const { data: contestData, isLoading: contestLoading } = useQuery({
    queryKey: ["contest", id],
    queryFn: () => contestsApi.get(id!)
  });

  const { data: standingsData, isLoading: standingsLoading, isError } = useQuery({
    queryKey: ["contest-standings", id],
    queryFn: () => contestsApi.standings(id!),
    enabled: !!id
  });

  const [search, setSearch] = React.useState("");
  const [page, setPage] = React.useState(1);
  const itemsPerPage = 20;

  if (contestLoading || standingsLoading) return <div className="mx-auto max-w-[1600px] px-6 py-20"><ListSkeleton rows={15} /></div>;
  if (isError || !standingsData) return <div className="mx-auto max-w-7xl px-6 py-20"><ErrorState title="Failed to load standings" onRetry={() => {}} /></div>;

  const contest = contestData?.contest;
  const standings = standingsData.standings || [];
  const problems = contest?.problems || [];

  const filteredStandings = standings.filter((s: any) => 
    s.user.username?.toLowerCase().includes(search.toLowerCase()) ||
    s.user.name?.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filteredStandings.length / itemsPerPage);
  const paginatedStandings = filteredStandings.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  return (
    <div className="mx-auto max-w-[1600px] px-6 py-10 stagger">
      <header className="mb-10">
        <Link to={`/contests/${id}`} className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors mb-6">
          <ArrowLeft className="h-3 w-3" /> Back to Contest
        </Link>
        
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="font-display text-4xl font-black tracking-tight flex items-baseline gap-3">
              Ranking of <span className="text-primary">{contest?.name || "Contest"}</span>
            </h1>
            <div className="mt-4 flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
               <div className="flex items-center gap-2 bg-primary/5 px-3 py-1 rounded-full border border-primary/10">
                 <Globe className="h-4 w-4 text-primary" />
                 <span className="font-bold text-foreground">Global</span>
               </div>
               <div className="flex items-center gap-2 opacity-50">
                 <Users className="h-4 w-4" />
                 <span>{standings.length.toLocaleString()} Participants</span>
               </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="relative group hidden sm:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <input 
                type="text" 
                placeholder="Search username..." 
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="h-10 w-64 pl-10 pr-4 rounded-xl bg-muted/30 border border-border/40 focus:outline-none focus:ring-2 ring-primary/20 focus:bg-muted/50 transition-all text-sm font-medium"
              />
            </div>
            <Button variant="outline" size="icon" className="rounded-xl border-border/40" onClick={() => {
               const url = window.location.href;
               navigator.clipboard.writeText(url);
               alert("Standings link copied to clipboard!");
            }}><Share2 className="h-4 w-4" /></Button>
          </div>
        </div>
      </header>

      <div className="overflow-x-auto rounded-[2rem] border border-border/60 bg-card/30 backdrop-blur-xl shadow-2xl shadow-primary/5">
        <table className="w-full border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-border/40 bg-muted/20 backdrop-blur-md">
              <th className="px-6 py-5 font-black uppercase tracking-widest text-[10px] text-muted-foreground w-20">Rank</th>
              <th className="px-6 py-5 font-black uppercase tracking-widest text-[10px] text-muted-foreground">Name</th>
              <th className="px-6 py-5 font-black uppercase tracking-widest text-[10px] text-muted-foreground text-center">Score</th>
              <th className="px-6 py-5 font-black uppercase tracking-widest text-[10px] text-muted-foreground text-center">Finish Time</th>
              {problems.map((p: any) => (
                <th key={p.id} className="px-6 py-5 font-black uppercase tracking-widest text-[10px] text-muted-foreground text-center min-w-[120px]">
                  {p.label} ({p.points})
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border/20">
            {paginatedStandings.map((row: any) => (
              <tr key={row.user.id} className={cn(
                "group transition-all hover:bg-primary/5",
                row.rank === 1 ? "bg-hard/5" : row.rank === 2 ? "bg-orange-500/5" : row.rank === 3 ? "bg-primary/5" : ""
              )}>
                <td className="px-6 py-4">
                  <div className={cn(
                    "font-mono text-base font-black italic",
                    row.rank === 1 ? "text-hard" : row.rank === 2 ? "text-orange-500" : row.rank === 3 ? "text-primary" : "text-muted-foreground"
                  )}>
                    {row.rank}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                       <img 
                        src={row.user.image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${row.user.username}`} 
                        alt="" 
                        className="h-10 w-10 rounded-full border-2 border-border/40 bg-muted"
                      />
                      {row.rank <= 3 && (
                        <div className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-background flex items-center justify-center border border-border shadow-sm">
                          <Trophy className={cn("h-2.5 w-2.5", row.rank === 1 ? "text-hard" : row.rank === 2 ? "text-orange-500" : "text-primary")} />
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="font-black text-sm group-hover:text-primary transition-colors">{row.user.username || row.user.name}</div>
                      <div className="flex items-center gap-1.5 mt-0.5 opacity-50">
                         <span className="text-[10px] font-bold font-mono uppercase tracking-widest">Rating: {row.user.rating || 0}</span>
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-center font-mono font-black text-primary text-base">
                  {row.totalPoints}
                </td>
                <td className="px-6 py-4 text-center font-mono text-xs font-bold text-muted-foreground">
                  {formatTime(row.totalTime)}
                </td>
                {problems.map((cp: any) => {
                  const solved = row.solvedProblems.find((s: any) => s.label === cp.label);
                  return (
                    <td key={cp.id} className="px-6 py-4">
                      {solved ? (
                        <div className="flex flex-col items-center gap-1 animate-in zoom-in-50 duration-500">
                          <div className="flex items-center gap-1.5 text-easy">
                            <Check className="h-3.5 w-3.5" />
                            <span className="font-mono text-[11px] font-black tabular-nums">{formatTime(solved.time)}</span>
                          </div>
                        </div>
                      ) : (
                        <div className="flex justify-center opacity-10">
                          <Clock className="h-4 w-4" />
                        </div>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
        
        {paginatedStandings.length === 0 && (
          <div className="flex flex-col items-center justify-center py-32 text-center text-muted-foreground">
             <Trophy className="h-16 w-16 mb-6 opacity-10" />
             <h3 className="text-xl font-bold text-foreground">{search ? "No results found" : "No Submissions Yet"}</h3>
             <p className="mt-2 text-sm max-max-xs mx-auto">{search ? "Try a different search term." : "Be the first to submit and claim the top rank in this contest!"}</p>
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="mt-10 flex items-center justify-center gap-4">
          <Button 
            variant="ghost" 
            disabled={page === 1} 
            onClick={() => setPage(p => p - 1)}
            className="rounded-xl"
          >
            <ChevronLeft className="h-4 w-4 mr-2" /> Previous
          </Button>
          <div className="flex items-center gap-2 font-mono text-xs font-bold">
             {Array.from({ length: totalPages }).map((_, i) => (
               <span 
                key={i}
                onClick={() => setPage(i + 1)}
                className={cn(
                  "h-8 w-8 rounded-lg flex items-center justify-center transition-all cursor-pointer",
                  page === i + 1 ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" : "hover:bg-muted"
                )}
              >
                {i + 1}
              </span>
             ))}
          </div>
          <Button 
            variant="ghost" 
            disabled={page === totalPages}
            onClick={() => setPage(p => p + 1)}
            className="rounded-xl"
          >
            Next <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      )}
    </div>
  );
}

function formatTime(minutes: number) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  const s = 0; // Backend currently only provides minutes
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

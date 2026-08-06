"use client";

import { useEffect, useState } from "react";
import { UserCircle, Flame, Trophy, Star } from "lucide-react";
import { useAuth } from "@/features/auth/components/auth-provider";
import { Button } from "@/components/ui/button";
import { getDashboardMetrics } from "@/features/study/services/progress";

type Metrics = Awaited<ReturnType<typeof getDashboardMetrics>>;

export function ProfileSection() {
  const { user, profile } = useAuth();
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  
  useEffect(() => {
    let isMounted = true;
    getDashboardMetrics().then((data) => {
      if (isMounted) setMetrics(data);
    });
    return () => { isMounted = false; };
  }, []);

  const createdAt = user?.created_at ? new Date(user.created_at).toLocaleDateString('en-US', {
    month: 'long', year: 'numeric'
  }) : 'August 2026';

  const displayName = profile?.full_name || user?.email?.split('@')[0] || "Student";
  const avatarUrl = profile?.avatar_url;

  return (
    <div id="profile" className="w-full bg-gradient-to-br from-surface to-background border border-white/[0.05] rounded-3xl p-8 sm:p-10 relative overflow-hidden mb-8 shadow-2xl">
      {/* Decorative Glow */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-accent/5 rounded-full blur-[120px] pointer-events-none -translate-y-1/2 translate-x-1/3" />
      
      <div className="relative z-10 flex flex-col md:flex-row gap-8 items-start md:items-center justify-between">
        
        {/* User Info */}
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6 w-full md:w-auto">
          <div className="relative group shrink-0">
            <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-surface-hover border border-white/10 flex items-center justify-center overflow-hidden transition-all duration-500 group-hover:border-accent/50 shadow-xl">
              {avatarUrl ? (
                <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
              ) : (
                <UserCircle className="w-16 h-16 text-muted-foreground opacity-50" />
              )}
            </div>
            <div className="absolute inset-0 rounded-full bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-300 cursor-pointer backdrop-blur-sm">
              <span className="text-sm font-semibold tracking-wider text-white uppercase">Change</span>
            </div>
          </div>
          
          <div className="flex flex-col text-left">
            <h2 className="text-3xl sm:text-4xl font-light tracking-tight text-foreground mb-1">{displayName}</h2>
            <p className="text-muted-foreground text-sm sm:text-base">{user?.email}</p>
            <div className="flex flex-wrap items-center gap-3 mt-4">
              <span className="inline-flex items-center rounded-full bg-accent/10 px-3 py-1 text-xs font-semibold text-accent border border-accent/20 tracking-widest uppercase shadow-[0_0_15px_rgba(79,70,229,0.1)]">
                Pro Member
              </span>
              <span className="text-xs text-muted-foreground/70 uppercase tracking-widest font-semibold">Joined {createdAt}</span>
            </div>
          </div>
        </div>

        {/* Edit Button */}
        <div className="shrink-0 w-full md:w-auto mt-4 md:mt-0">
          <Button variant="outline" className="w-full md:w-auto rounded-full px-8 py-6 text-sm font-semibold tracking-wider uppercase border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 transition-all duration-300">
            Edit Profile
          </Button>
        </div>
      </div>

      {/* Stats Divider */}
      <div className="w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent my-10 relative z-10" />

      {/* Stats Row */}
      <div className="relative z-10 grid grid-cols-1 sm:grid-cols-3 gap-6">
        
        <div className="flex items-center gap-4 p-5 rounded-2xl bg-black/20 border border-white/[0.03] hover:bg-black/30 transition-colors">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 shrink-0">
            <Trophy className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Current Level</div>
            <div className="text-2xl font-light text-foreground">{metrics?.xpDetails?.currentLevel || 1}</div>
          </div>
        </div>

        <div className="flex items-center gap-4 p-5 rounded-2xl bg-black/20 border border-white/[0.03] hover:bg-black/30 transition-colors">
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500 shrink-0">
            <Star className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Total XP</div>
            <div className="text-2xl font-light text-foreground">
              {metrics?.xpDetails?.currentXP?.toLocaleString() || 0}
              <span className="text-sm text-muted-foreground ml-1">XP</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 p-5 rounded-2xl bg-black/20 border border-white/[0.03] hover:bg-black/30 transition-colors">
          <div className="w-12 h-12 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-500 shrink-0">
            <Flame className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Current Streak</div>
            <div className="text-2xl font-light text-foreground">
              {metrics?.currentStreak || 0}
              <span className="text-sm text-muted-foreground ml-1">Days</span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}

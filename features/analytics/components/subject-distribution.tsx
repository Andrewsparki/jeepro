"use client";

import { useMemo } from "react";
import { StudySession } from "@/features/study/services/progress";
import { Subject } from "@/features/syllabus/services/syllabus";

import { BarChart2 } from "lucide-react";
import { 
  Radar, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  ResponsiveContainer,
  Tooltip
} from "recharts";

interface SubjectDistributionProps {
  sessions: StudySession[];
  syllabus: Subject[];
}

export function SubjectDistribution({ sessions, syllabus }: SubjectDistributionProps) {
  const data = useMemo(() => {
    const subjectTime: Record<string, number> = {};
    const totalTime = sessions.reduce((acc, s) => acc + s.duration_seconds, 0);

    sessions.forEach(session => {
      let subName = "General";
      if (session.chapter_id) {
        for (const sub of syllabus) {
          if (sub.chapters.find(c => c.id === session.chapter_id)) {
            subName = sub.name;
            break;
          }
        }
      }
      subjectTime[subName] = (subjectTime[subName] || 0) + session.duration_seconds;
    });

    const items = Object.entries(subjectTime)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, seconds]) => ({
        subject: name,
        hours: Number((seconds / 3600).toFixed(1)),
        fullMark: Math.max(10, Math.ceil((totalTime / 3600) * 0.8)) // Scaling for Radar
      }));

    // Pad to at least 3 points for a valid radar shape
    while (items.length > 0 && items.length < 3) {
      items.push({ subject: `Empty ${items.length}`, hours: 0, fullMark: items[0].fullMark });
    }

    return items;
  }, [sessions, syllabus]);

  return (
    <div className="premium-card flex flex-col h-[400px]">
      <div className="flex items-center gap-3 mb-2 relative z-10 px-6 pt-6">
        <div className="p-2.5 bg-accent/10 rounded-xl text-accent shadow-[0_0_15px_rgba(79,70,229,0.15)] border border-accent/20">
          <BarChart2 className="w-5 h-5" />
        </div>
        <h3 className="font-bold text-xl tracking-tight text-foreground">Subject Balance</h3>
      </div>
      
      <div className="flex-1 w-full min-h-0 relative z-10 pb-6">
        {data.length === 0 ? (
          <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground">
            <BarChart2 className="w-12 h-12 mb-3 opacity-20" />
            <p className="text-sm font-semibold uppercase tracking-widest">No subject data</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="65%" data={data}>
              <PolarGrid stroke="var(--border)" opacity={0.4} />
              <PolarAngleAxis 
                dataKey="subject" 
                tick={{ fill: 'var(--muted-foreground)', fontSize: 12, fontWeight: 600 }} 
              />
              <PolarRadiusAxis 
                angle={30} 
                domain={[0, 'dataMax + 1']} 
                tick={false} 
                axisLine={false} 
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(10, 10, 10, 0.85)', 
                  borderColor: 'rgba(255,255,255,0.1)',
                  borderRadius: '16px',
                  backdropFilter: 'blur(16px)',
                  WebkitBackdropFilter: 'blur(16px)',
                  boxShadow: '0 20px 40px -10px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1)',
                  padding: '16px 20px',
                }}
                itemStyle={{ color: 'hsl(var(--foreground))', fontWeight: 700, fontSize: '16px' }}
                labelStyle={{ color: 'hsl(var(--muted-foreground))', marginBottom: '8px', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}
              />
              <Radar 
                name="Hours" 
                dataKey="hours" 
                stroke="var(--accent)" 
                fill="var(--accent)" 
                fillOpacity={0.2} 
                strokeWidth={3}
                animationDuration={1500}
                animationEasing="ease-out"
              />
            </RadarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}

export function SubjectDistributionSkeleton() {
  return (
    <div className="p-6 rounded-3xl bg-card border border-border/40 flex flex-col h-[400px]">
      <div className="flex items-center gap-2 mb-6">
        <div className="w-9 h-9 bg-muted/20 rounded-lg animate-pulse" />
        <div className="h-6 w-32 bg-muted/20 rounded-md animate-pulse" />
      </div>
      <div className="flex-1 w-full bg-muted/10 rounded-full animate-pulse" style={{ margin: '40px' }} />
    </div>
  );
}

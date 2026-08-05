import { Skeleton } from "@/components/ui/skeleton";
import { GlassCard } from "@/components/ui/glass-card";

export default function Loading() {
  return (
    <div className="flex-1 space-y-6 p-6 sm:p-8 pt-6 w-full h-full max-w-7xl mx-auto">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between mb-8">
        <div className="space-y-2">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-5 w-48" />
        </div>
      </div>

      {/* Top Stats Skeleton */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <GlassCard key={i} className="p-6 h-[140px] flex flex-col justify-between">
            <div className="flex justify-between items-center">
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-8 w-8 rounded-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-8 w-16" />
              <Skeleton className="h-4 w-32" />
            </div>
          </GlassCard>
        ))}
      </div>

      {/* Main Content Area Skeleton */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7 pt-4">
        <GlassCard className="col-span-4 p-6 min-h-[400px]">
          <Skeleton className="h-6 w-48 mb-6" />
          <div className="space-y-4">
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-40 w-full" />
          </div>
        </GlassCard>
        
        <GlassCard className="col-span-3 p-6 min-h-[400px]">
          <Skeleton className="h-6 w-32 mb-6" />
          <div className="space-y-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-full max-w-[200px]" />
                  <Skeleton className="h-3 w-full max-w-[150px]" />
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}

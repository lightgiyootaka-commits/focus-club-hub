import { BarChart3 } from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { cn } from '@/lib/utils';
import type { WeeklyStats } from '@/hooks/useGamification';

interface WeeklyGraphProps {
  stats: WeeklyStats[];
  dailyGoal?: number;
  className?: string;
}

export function WeeklyGraph({ stats, dailyGoal = 60, className }: WeeklyGraphProps) {
  const maxMinutes = Math.max(...stats.map(s => s.minutes), dailyGoal);
  const totalMinutes = stats.reduce((sum, s) => sum + s.minutes, 0);
  const avgMinutes = Math.round(totalMinutes / 7);

  const getDayLabel = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { weekday: 'short' }).charAt(0);
  };

  const isToday = (dateStr: string) => {
    return dateStr === new Date().toISOString().split('T')[0];
  };

  return (
    <GlassCard className={cn('', className)}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-primary" />
          <h3 className="font-display font-semibold text-foreground">This Week</h3>
        </div>
        <div className="text-right">
          <p className="text-sm font-medium text-foreground">{Math.floor(totalMinutes / 60)}h {totalMinutes % 60}m</p>
          <p className="text-xs text-muted-foreground">avg {avgMinutes}m/day</p>
        </div>
      </div>

      {/* Bar chart */}
      <div className="flex items-end justify-between gap-2 h-24 mb-2">
        {stats.map((stat) => {
          const height = maxMinutes > 0 ? (stat.minutes / maxMinutes) * 100 : 0;
          const metGoal = stat.minutes >= dailyGoal;
          
          return (
            <div key={stat.date} className="flex-1 flex flex-col items-center gap-1">
              <div className="relative w-full h-20 flex items-end justify-center">
                {/* Goal line indicator */}
                {stat.minutes > 0 && (
                  <div
                    className="absolute w-full border-t border-dashed border-muted-foreground/30"
                    style={{ bottom: `${(dailyGoal / maxMinutes) * 100}%` }}
                  />
                )}
                
                <div
                  className={cn(
                    'w-full max-w-[24px] rounded-t-md transition-all duration-500',
                    isToday(stat.date) 
                      ? 'bg-gradient-to-t from-primary to-accent' 
                      : metGoal 
                        ? 'bg-success/80' 
                        : 'bg-muted-foreground/40',
                    stat.minutes === 0 && 'bg-muted/30'
                  )}
                  style={{ height: `${Math.max(height, stat.minutes > 0 ? 10 : 4)}%` }}
                />
              </div>
              
              <span className={cn(
                'text-xs',
                isToday(stat.date) ? 'text-primary font-semibold' : 'text-muted-foreground'
              )}>
                {getDayLabel(stat.date)}
              </span>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-4 pt-2 border-t border-border/50">
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-gradient-to-r from-primary to-accent" />
          <span className="text-xs text-muted-foreground">Today</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-success/80" />
          <span className="text-xs text-muted-foreground">Goal met</span>
        </div>
      </div>
    </GlassCard>
  );
}

import { Flame, Shield } from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { cn } from '@/lib/utils';

interface StreakDisplayProps {
  currentStreak: number;
  longestStreak: number;
  isProtected?: boolean;
  className?: string;
}

export function StreakDisplay({ 
  currentStreak, 
  longestStreak, 
  isProtected,
  className 
}: StreakDisplayProps) {
  const streakLevel = currentStreak >= 30 ? 'legendary' : 
                      currentStreak >= 14 ? 'epic' : 
                      currentStreak >= 7 ? 'rare' : 'common';

  const streakColors = {
    common: 'text-muted-foreground',
    rare: 'text-primary',
    epic: 'text-purple-400',
    legendary: 'text-amber-400',
  };

  const glowColors = {
    common: '',
    rare: 'shadow-[0_0_20px_hsl(var(--primary)/0.3)]',
    epic: 'shadow-[0_0_20px_rgba(168,85,247,0.3)]',
    legendary: 'shadow-[0_0_30px_rgba(251,191,36,0.4)]',
  };

  return (
    <GlassCard className={cn(
      'relative overflow-hidden transition-all duration-300',
      glowColors[streakLevel],
      className
    )}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={cn(
            'relative p-3 rounded-xl',
            'bg-gradient-to-br from-primary/20 to-accent/10'
          )}>
            <Flame className={cn(
              'w-8 h-8 transition-all duration-300',
              streakColors[streakLevel],
              currentStreak > 0 && 'animate-pulse'
            )} />
            {isProtected && (
              <Shield className="w-4 h-4 text-success absolute -top-1 -right-1" />
            )}
          </div>
          
          <div>
            <p className="text-sm text-muted-foreground">Current Streak</p>
            <p className={cn(
              'font-display text-3xl font-bold',
              streakColors[streakLevel]
            )}>
              {currentStreak} <span className="text-lg font-normal">days</span>
            </p>
          </div>
        </div>

        <div className="text-right">
          <p className="text-xs text-muted-foreground">Best</p>
          <p className="font-display text-lg font-semibold text-foreground">
            {longestStreak}
          </p>
        </div>
      </div>

      {/* Streak milestones */}
      <div className="flex gap-1 mt-4">
        {[7, 14, 30].map((milestone) => (
          <div
            key={milestone}
            className={cn(
              'flex-1 h-1.5 rounded-full transition-all duration-500',
              currentStreak >= milestone 
                ? 'bg-gradient-to-r from-primary to-accent' 
                : 'bg-muted'
            )}
          />
        ))}
      </div>
      <div className="flex justify-between mt-1 text-xs text-muted-foreground">
        <span>7d</span>
        <span>14d</span>
        <span>30d</span>
      </div>
    </GlassCard>
  );
}

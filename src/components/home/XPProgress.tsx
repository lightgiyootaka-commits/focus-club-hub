import { Star, Zap } from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { getLevelTitle } from '@/hooks/useGamification';

interface XPProgressProps {
  totalXP: number;
  currentLevel: number;
  xpToNextLevel: number;
  className?: string;
}

export function XPProgress({ 
  totalXP, 
  currentLevel, 
  xpToNextLevel,
  className 
}: XPProgressProps) {
  const currentLevelXP = totalXP % xpToNextLevel;
  const progress = (currentLevelXP / xpToNextLevel) * 100;
  const levelTitle = getLevelTitle(currentLevel);

  return (
    <GlassCard className={cn('relative', className)}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="relative">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <span className="font-display text-lg font-bold text-primary-foreground">
                {currentLevel}
              </span>
            </div>
            <Star className="w-4 h-4 text-amber-400 absolute -top-1 -right-1 fill-amber-400" />
          </div>
          <div>
            <p className="font-display font-semibold text-foreground">{levelTitle}</p>
            <p className="text-xs text-muted-foreground">Level {currentLevel}</p>
          </div>
        </div>
        
        <div className="text-right">
          <div className="flex items-center gap-1 text-primary">
            <Zap className="w-4 h-4 fill-primary" />
            <span className="font-semibold">{currentLevelXP}</span>
          </div>
          <p className="text-xs text-muted-foreground">/ {xpToNextLevel} XP</p>
        </div>
      </div>

      <div className="relative">
        <Progress value={progress} className="h-3" />
        <div 
          className="absolute top-0 left-0 h-full bg-gradient-to-r from-primary/0 via-white/30 to-primary/0 animate-shimmer"
          style={{ width: `${progress}%` }}
        />
      </div>

      <p className="text-xs text-muted-foreground mt-2 text-center">
        {Math.ceil(xpToNextLevel - currentLevelXP)} XP to Level {currentLevel + 1}
      </p>
    </GlassCard>
  );
}

import { Target, Timer } from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { GlassButton } from '@/components/ui/GlassButton';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

interface DailyGoalTrackerProps {
  todayMinutes: number;
  dailyGoal: number;
  className?: string;
}

export function DailyGoalTracker({ 
  todayMinutes, 
  dailyGoal,
  className 
}: DailyGoalTrackerProps) {
  const navigate = useNavigate();
  const progress = Math.min((todayMinutes / dailyGoal) * 100, 100);
  const remaining = Math.max(dailyGoal - todayMinutes, 0);
  const isComplete = todayMinutes >= dailyGoal;

  const circumference = 2 * Math.PI * 45; // radius = 45
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <GlassCard 
      variant={isComplete ? "gradient" : "default"}
      glow={isComplete}
      className={cn('text-center', className)}
    >
      <div className="flex items-center justify-center gap-2 mb-4">
        <Target className={cn('w-5 h-5', isComplete ? 'text-success' : 'text-primary')} />
        <h3 className="font-display font-semibold text-foreground">Daily Goal</h3>
      </div>

      {/* Circular progress */}
      <div className="relative w-32 h-32 mx-auto mb-4">
        <svg className="w-full h-full transform -rotate-90">
          {/* Background circle */}
          <circle
            cx="64"
            cy="64"
            r="45"
            className="fill-none stroke-muted"
            strokeWidth="8"
          />
          {/* Progress circle */}
          <circle
            cx="64"
            cy="64"
            r="45"
            className={cn(
              'fill-none transition-all duration-1000',
              isComplete ? 'stroke-success' : 'stroke-primary'
            )}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
          />
        </svg>
        
        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <p className="font-display text-2xl font-bold text-foreground">
            {todayMinutes}
          </p>
          <p className="text-xs text-muted-foreground">/ {dailyGoal} min</p>
        </div>
      </div>

      {isComplete ? (
        <div className="space-y-2">
          <p className="text-success font-medium">Goal Complete! 🎉</p>
          <p className="text-sm text-muted-foreground">
            +{todayMinutes - dailyGoal} bonus minutes today
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            {remaining} minutes to go
          </p>
          <GlassButton
            variant="primary"
            size="sm"
            onClick={() => navigate('/timer')}
            className="w-full"
          >
            <Timer className="w-4 h-4 mr-2" />
            Start Session
          </GlassButton>
        </div>
      )}
    </GlassCard>
  );
}

import { Sparkles, TrendingUp, Award, Clock, Target } from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { cn } from '@/lib/utils';
import type { WeeklyStats, UserStreak } from '@/hooks/useGamification';

interface PersonalizedInsightsProps {
  weeklyStats: WeeklyStats[];
  streak: UserStreak | null;
  totalFocusMinutes: number;
  dailyGoal: number;
  className?: string;
}

interface Insight {
  icon: typeof Sparkles;
  message: string;
  type: 'positive' | 'encouraging' | 'milestone';
}

export function PersonalizedInsights({ 
  weeklyStats, 
  streak, 
  totalFocusMinutes,
  dailyGoal,
  className 
}: PersonalizedInsightsProps) {
  const generateInsights = (): Insight[] => {
    const insights: Insight[] = [];
    
    const todayMinutes = weeklyStats[weeklyStats.length - 1]?.minutes || 0;
    const weekTotal = weeklyStats.reduce((sum, s) => sum + s.minutes, 0);
    const weekAvg = Math.round(weekTotal / 7);
    const lastWeekAvg = dailyGoal; // Placeholder for previous week comparison

    // Streak insights
    if (streak) {
      if (streak.current_streak >= 7 && streak.current_streak < 14) {
        insights.push({
          icon: Award,
          message: "You're on a week-long streak! Keep the momentum going.",
          type: 'milestone'
        });
      } else if (streak.current_streak >= 14 && streak.current_streak < 30) {
        insights.push({
          icon: Award,
          message: "Two weeks strong! You're building a powerful habit.",
          type: 'milestone'
        });
      } else if (streak.current_streak >= 30) {
        insights.push({
          icon: Award,
          message: "A month of consistent focus! You're unstoppable.",
          type: 'milestone'
        });
      }
    }

    // Daily progress insights
    if (todayMinutes === 0) {
      insights.push({
        icon: Target,
        message: "Start your first session today to keep your streak alive!",
        type: 'encouraging'
      });
    } else if (todayMinutes < dailyGoal) {
      const remaining = dailyGoal - todayMinutes;
      insights.push({
        icon: Clock,
        message: `Just ${remaining} more minutes to hit your daily goal!`,
        type: 'encouraging'
      });
    } else {
      insights.push({
        icon: Sparkles,
        message: "Daily goal crushed! You're on fire today.",
        type: 'positive'
      });
    }

    // Weekly comparison
    if (weekAvg > lastWeekAvg * 0.9) {
      insights.push({
        icon: TrendingUp,
        message: "You're on track to beat your weekly average!",
        type: 'positive'
      });
    }

    // Total milestones
    const totalHours = Math.floor(totalFocusMinutes / 60);
    if (totalHours >= 100) {
      insights.push({
        icon: Award,
        message: "Century club member! 100+ hours of deep work.",
        type: 'milestone'
      });
    } else if (totalHours >= 50) {
      insights.push({
        icon: Award,
        message: "Half-century achieved! Keep pushing boundaries.",
        type: 'milestone'
      });
    } else if (totalHours >= 10) {
      insights.push({
        icon: TrendingUp,
        message: "10+ hours logged. Building strong habits!",
        type: 'positive'
      });
    }

    return insights.slice(0, 2); // Show max 2 insights
  };

  const insights = generateInsights();

  if (insights.length === 0) return null;

  const typeStyles = {
    positive: 'from-success/20 to-success/5 border-success/30',
    encouraging: 'from-primary/20 to-primary/5 border-primary/30',
    milestone: 'from-amber-500/20 to-amber-500/5 border-amber-500/30',
  };

  const iconStyles = {
    positive: 'text-success',
    encouraging: 'text-primary',
    milestone: 'text-amber-400',
  };

  return (
    <div className={cn('space-y-2', className)}>
      {insights.map((insight, index) => (
        <GlassCard
          key={index}
          className={cn(
            'py-3 px-4 bg-gradient-to-r border',
            typeStyles[insight.type]
          )}
        >
          <div className="flex items-center gap-3">
            <insight.icon className={cn('w-5 h-5 flex-shrink-0', iconStyles[insight.type])} />
            <p className="text-sm text-foreground">{insight.message}</p>
          </div>
        </GlassCard>
      ))}
    </div>
  );
}

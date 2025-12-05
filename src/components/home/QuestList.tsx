import { Scroll, Clock, CheckCircle, Sunrise, Trophy, Users, Flame, Zap } from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { cn } from '@/lib/utils';
import type { Quest } from '@/hooks/useGamification';

interface QuestListProps {
  quests: Quest[];
  className?: string;
}

const iconMap: Record<string, typeof Clock> = {
  clock: Clock,
  'check-circle': CheckCircle,
  sunrise: Sunrise,
  trophy: Trophy,
  users: Users,
  flame: Flame,
};

export function QuestList({ quests, className }: QuestListProps) {
  const dailyQuests = quests.filter(q => q.quest_type === 'daily');
  const weeklyQuests = quests.filter(q => q.quest_type === 'weekly');

  const renderQuest = (quest: Quest) => {
    const Icon = iconMap[quest.icon || 'clock'] || Clock;
    const progress = quest.current_progress || 0;
    const progressPercent = Math.min((progress / quest.target_value) * 100, 100);
    const isComplete = quest.is_completed;

    return (
      <div
        key={quest.id}
        className={cn(
          'flex items-center gap-3 p-3 rounded-xl transition-all duration-200',
          'bg-background/50',
          isComplete && 'opacity-60'
        )}
      >
        <div className={cn(
          'w-10 h-10 rounded-lg flex items-center justify-center',
          isComplete 
            ? 'bg-success/20' 
            : 'bg-gradient-to-br from-primary/20 to-accent/10'
        )}>
          <Icon className={cn(
            'w-5 h-5',
            isComplete ? 'text-success' : 'text-primary'
          )} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <p className={cn(
              'text-sm font-medium truncate',
              isComplete ? 'text-muted-foreground line-through' : 'text-foreground'
            )}>
              {quest.title}
            </p>
            <div className="flex items-center gap-1 text-xs text-primary ml-2">
              <Zap className="w-3 h-3" />
              <span>+{quest.xp_reward}</span>
            </div>
          </div>
          
          {/* Progress bar */}
          <div className="flex items-center gap-2">
            <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
              <div
                className={cn(
                  'h-full transition-all duration-500',
                  isComplete 
                    ? 'bg-success' 
                    : 'bg-gradient-to-r from-primary to-accent'
                )}
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <span className="text-xs text-muted-foreground whitespace-nowrap">
              {progress}/{quest.target_value}
            </span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <GlassCard className={cn('', className)}>
      <div className="flex items-center gap-2 mb-4">
        <Scroll className="w-5 h-5 text-primary" />
        <h3 className="font-display font-semibold text-foreground">Quests</h3>
      </div>

      {/* Daily Quests */}
      {dailyQuests.length > 0 && (
        <div className="mb-4">
          <p className="text-xs text-muted-foreground mb-2 uppercase tracking-wider">Daily</p>
          <div className="space-y-2">
            {dailyQuests.map(renderQuest)}
          </div>
        </div>
      )}

      {/* Weekly Quests */}
      {weeklyQuests.length > 0 && (
        <div>
          <p className="text-xs text-muted-foreground mb-2 uppercase tracking-wider">Weekly</p>
          <div className="space-y-2">
            {weeklyQuests.map(renderQuest)}
          </div>
        </div>
      )}

      {quests.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-4">
          No active quests
        </p>
      )}
    </GlassCard>
  );
}

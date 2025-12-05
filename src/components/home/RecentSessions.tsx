import { Clock, Calendar } from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { cn } from '@/lib/utils';

interface Session {
  id: string;
  started_at: string | null;
  duration_minutes: number | null;
  club_id: string | null;
}

interface RecentSessionsProps {
  sessions: Session[];
  className?: string;
}

export function RecentSessions({ sessions, className }: RecentSessionsProps) {
  const formatTime = (dateStr: string | null) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    }
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  const formatDuration = (minutes: number | null) => {
    if (!minutes) return '0m';
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  // Group sessions by date
  const groupedSessions = sessions.reduce((groups, session) => {
    const date = session.started_at?.split('T')[0] || 'unknown';
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(session);
    return groups;
  }, {} as Record<string, Session[]>);

  const sortedDates = Object.keys(groupedSessions).sort((a, b) => 
    new Date(b).getTime() - new Date(a).getTime()
  ).slice(0, 3);

  if (sessions.length === 0) {
    return null;
  }

  return (
    <GlassCard className={cn('', className)}>
      <div className="flex items-center gap-2 mb-4">
        <Calendar className="w-5 h-5 text-primary" />
        <h3 className="font-display font-semibold text-foreground">Recent Sessions</h3>
      </div>

      <div className="space-y-4">
        {sortedDates.map((date) => (
          <div key={date}>
            <p className="text-xs text-muted-foreground mb-2">
              {formatDate(groupedSessions[date][0]?.started_at)}
            </p>
            <div className="space-y-2">
              {groupedSessions[date].slice(0, 3).map((session) => (
                <div
                  key={session.id}
                  className={cn(
                    'flex items-center justify-between p-3 rounded-xl',
                    'bg-background/50'
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                      <Clock className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        Focus Session
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatTime(session.started_at)}
                      </p>
                    </div>
                  </div>
                  <span className="text-sm font-semibold text-primary">
                    {formatDuration(session.duration_minutes)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </GlassCard>
  );
}

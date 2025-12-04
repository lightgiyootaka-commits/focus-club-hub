import { cn } from "@/lib/utils";
import { Trophy, Medal, Award } from "lucide-react";

interface LeaderboardItemProps {
  rank: number;
  name: string;
  avatarUrl?: string | null;
  focusMinutes: number;
  isCurrentUser?: boolean;
}

export function LeaderboardItem({ 
  rank, 
  name, 
  avatarUrl, 
  focusMinutes, 
  isCurrentUser 
}: LeaderboardItemProps) {
  const getRankIcon = () => {
    switch (rank) {
      case 1:
        return <Trophy className="w-5 h-5 text-yellow-500" />;
      case 2:
        return <Medal className="w-5 h-5 text-gray-400" />;
      case 3:
        return <Award className="w-5 h-5 text-amber-600" />;
      default:
        return <span className="w-5 text-center text-muted-foreground font-medium">{rank}</span>;
    }
  };

  const formatTime = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  return (
    <div
      className={cn(
        "flex items-center gap-4 p-4 rounded-xl transition-colors",
        isCurrentUser 
          ? "bg-primary/10 border border-primary/20" 
          : "bg-secondary/30 hover:bg-secondary/50"
      )}
    >
      <div className="w-8 flex items-center justify-center">
        {getRankIcon()}
      </div>
      
      <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center overflow-hidden">
        {avatarUrl ? (
          <img src={avatarUrl} alt={name} className="w-full h-full object-cover" />
        ) : (
          <span className="text-lg font-semibold text-muted-foreground">
            {name.charAt(0).toUpperCase()}
          </span>
        )}
      </div>
      
      <div className="flex-1 min-w-0">
        <p className={cn(
          "font-medium truncate",
          isCurrentUser ? "text-primary" : "text-foreground"
        )}>
          {name}
          {isCurrentUser && <span className="text-xs ml-2 text-muted-foreground">(you)</span>}
        </p>
      </div>
      
      <div className="text-right">
        <span className={cn(
          "font-display font-semibold",
          rank <= 3 ? "gradient-text" : "text-foreground"
        )}>
          {formatTime(focusMinutes)}
        </span>
      </div>
    </div>
  );
}
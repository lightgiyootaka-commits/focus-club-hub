import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { GlassCard } from "@/components/ui/GlassCard";
import { LeaderboardItem } from "@/components/leaderboard/LeaderboardItem";
import { useAuth } from "@/contexts/AuthContext";
import { getGlobalLeaderboard } from "@/lib/supabase";
import { toast } from "sonner";
import { Trophy, Crown } from "lucide-react";

interface LeaderboardEntry {
  id: string;
  name: string | null;
  avatar_url: string | null;
  total_focus_minutes: number | null;
}

export default function Leaderboard() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      loadLeaderboard();
    }
  }, [user]);

  const loadLeaderboard = async () => {
    try {
      const { data, error } = await getGlobalLeaderboard(50);
      if (error) throw error;
      if (data) setLeaderboard(data);
    } catch (error) {
      console.error("Error loading leaderboard:", error);
      toast.error("Failed to load leaderboard");
    } finally {
      setLoading(false);
    }
  };

  const topThree = leaderboard.slice(0, 3);
  const rest = leaderboard.slice(3);

  if (authLoading || loading) {
    return (
      <Layout title="Leaderboard">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Leaderboard" showStreak={false}>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="text-center">
          <Trophy className="w-12 h-12 text-primary mx-auto mb-2" />
          <h2 className="font-display text-xl font-bold">Top Focusers</h2>
          <p className="text-muted-foreground text-sm">Global rankings by total focus time</p>
        </div>

        {/* Top 3 Podium */}
        {topThree.length >= 3 && (
          <GlassCard variant="gradient" className="pt-8">
            <div className="flex items-end justify-center gap-4">
              {/* Second Place */}
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center overflow-hidden border-2 border-gray-400">
                  {topThree[1].avatar_url ? (
                    <img src={topThree[1].avatar_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-xl font-bold text-muted-foreground">
                      {(topThree[1].name || "?").charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <div className="mt-2 text-center">
                  <p className="text-sm font-medium truncate max-w-20">{topThree[1].name || "Anonymous"}</p>
                  <p className="text-xs text-muted-foreground">{topThree[1].total_focus_minutes || 0}m</p>
                </div>
                <div className="w-16 h-16 bg-secondary/50 rounded-t-lg mt-2 flex items-center justify-center">
                  <span className="text-2xl font-bold text-gray-400">2</span>
                </div>
              </div>

              {/* First Place */}
              <div className="flex flex-col items-center -mt-4">
                <Crown className="w-8 h-8 text-yellow-500 mb-2" />
                <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center overflow-hidden border-2 border-yellow-500">
                  {topThree[0].avatar_url ? (
                    <img src={topThree[0].avatar_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-2xl font-bold text-muted-foreground">
                      {(topThree[0].name || "?").charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <div className="mt-2 text-center">
                  <p className="text-sm font-semibold truncate max-w-24">{topThree[0].name || "Anonymous"}</p>
                  <p className="text-xs text-primary font-medium">{topThree[0].total_focus_minutes || 0}m</p>
                </div>
                <div className="w-20 h-24 bg-primary/20 rounded-t-lg mt-2 flex items-center justify-center">
                  <span className="text-3xl font-bold gradient-text">1</span>
                </div>
              </div>

              {/* Third Place */}
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center overflow-hidden border-2 border-amber-600">
                  {topThree[2].avatar_url ? (
                    <img src={topThree[2].avatar_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-xl font-bold text-muted-foreground">
                      {(topThree[2].name || "?").charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <div className="mt-2 text-center">
                  <p className="text-sm font-medium truncate max-w-20">{topThree[2].name || "Anonymous"}</p>
                  <p className="text-xs text-muted-foreground">{topThree[2].total_focus_minutes || 0}m</p>
                </div>
                <div className="w-16 h-12 bg-secondary/50 rounded-t-lg mt-2 flex items-center justify-center">
                  <span className="text-2xl font-bold text-amber-600">3</span>
                </div>
              </div>
            </div>
          </GlassCard>
        )}

        {/* Rest of leaderboard */}
        {rest.length > 0 && (
          <div className="space-y-2">
            {rest.map((entry, index) => (
              <LeaderboardItem
                key={entry.id}
                rank={index + 4}
                name={entry.name || "Anonymous"}
                avatarUrl={entry.avatar_url}
                focusMinutes={entry.total_focus_minutes || 0}
                isCurrentUser={entry.id === user?.id}
              />
            ))}
          </div>
        )}

        {leaderboard.length === 0 && (
          <GlassCard className="text-center py-12">
            <Trophy className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-display text-lg font-semibold mb-2">No rankings yet</h3>
            <p className="text-muted-foreground">Start focusing to appear on the leaderboard!</p>
          </GlassCard>
        )}
      </div>
    </Layout>
  );
}
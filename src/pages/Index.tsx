import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { GlassCard } from "@/components/ui/GlassCard";
import { GlassButton } from "@/components/ui/GlassButton";
import { useAuth } from "@/contexts/AuthContext";
import { getProfile, getClubs, getGlobalLeaderboard } from "@/lib/supabase";
import { Timer, Users, Trophy, ArrowRight, Flame } from "lucide-react";
import { ClubCard } from "@/components/clubs/ClubCard";
import { LeaderboardItem } from "@/components/leaderboard/LeaderboardItem";

interface Profile {
  id: string;
  name: string | null;
  total_focus_minutes: number | null;
  streak_days: number | null;
}

interface Club {
  id: string;
  name: string;
  description: string | null;
  member_count: number | null;
  image_url: string | null;
}

interface LeaderboardEntry {
  id: string;
  name: string | null;
  avatar_url: string | null;
  total_focus_minutes: number | null;
}

export default function Index() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [clubs, setClubs] = useState<Club[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    if (!user) return;
    
    try {
      const [profileRes, clubsRes, leaderboardRes] = await Promise.all([
        getProfile(user.id),
        getClubs(),
        getGlobalLeaderboard(5),
      ]);

      if (profileRes.data) setProfile(profileRes.data);
      if (clubsRes.data) setClubs(clubsRes.data.slice(0, 3));
      if (leaderboardRes.data) setLeaderboard(leaderboardRes.data);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatFocusTime = (minutes: number | null) => {
    if (!minutes) return "0m";
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  if (authLoading || loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="FocusClub" streakCount={profile?.streak_days || 0}>
      <div className="space-y-6 animate-fade-in">
        {/* Welcome Section */}
        <section className="mt-2">
          <h2 className="text-2xl font-display font-bold text-foreground mb-1">
            Hey, {profile?.name || "there"}!
          </h2>
          <p className="text-muted-foreground">Ready to focus today?</p>
        </section>

        {/* Stats Cards */}
        <section className="grid grid-cols-2 gap-4">
          <GlassCard className="text-center">
            <Timer className="w-8 h-8 text-primary mx-auto mb-2" />
            <p className="font-display text-2xl font-bold text-foreground">
              {formatFocusTime(profile?.total_focus_minutes)}
            </p>
            <p className="text-sm text-muted-foreground">Total Focus</p>
          </GlassCard>
          
          <GlassCard className="text-center">
            <Flame className="w-8 h-8 text-primary mx-auto mb-2" />
            <p className="font-display text-2xl font-bold text-foreground">
              {profile?.streak_days || 0}
            </p>
            <p className="text-sm text-muted-foreground">Day Streak</p>
          </GlassCard>
        </section>

        {/* Quick Start Timer */}
        <GlassCard variant="gradient" glow className="text-center">
          <h3 className="font-display text-lg font-semibold mb-2">Start Focusing</h3>
          <p className="text-muted-foreground text-sm mb-4">Begin a 25-minute focus session</p>
          <GlassButton 
            variant="primary" 
            size="lg"
            onClick={() => navigate("/timer")}
            className="w-full"
          >
            <Timer className="w-5 h-5 mr-2" />
            Start Timer
          </GlassButton>
        </GlassCard>

        {/* Clubs Preview */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display text-lg font-semibold">Your Clubs</h3>
            <GlassButton 
              variant="ghost" 
              size="sm"
              onClick={() => navigate("/clubs")}
            >
              View all <ArrowRight className="w-4 h-4 ml-1" />
            </GlassButton>
          </div>
          
          {clubs.length > 0 ? (
            <div className="space-y-3">
              {clubs.map((club) => (
                <ClubCard
                  key={club.id}
                  id={club.id}
                  name={club.name}
                  description={club.description}
                  memberCount={club.member_count || 1}
                  imageUrl={club.image_url}
                />
              ))}
            </div>
          ) : (
            <GlassCard className="text-center py-8">
              <Users className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">No clubs yet</p>
              <GlassButton 
                variant="outline" 
                size="sm" 
                className="mt-3"
                onClick={() => navigate("/clubs")}
              >
                Browse Clubs
              </GlassButton>
            </GlassCard>
          )}
        </section>

        {/* Leaderboard Preview */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display text-lg font-semibold">Top Focusers</h3>
            <GlassButton 
              variant="ghost" 
              size="sm"
              onClick={() => navigate("/leaderboard")}
            >
              View all <ArrowRight className="w-4 h-4 ml-1" />
            </GlassButton>
          </div>
          
          {leaderboard.length > 0 ? (
            <div className="space-y-2">
              {leaderboard.map((entry, index) => (
                <LeaderboardItem
                  key={entry.id}
                  rank={index + 1}
                  name={entry.name || "Anonymous"}
                  avatarUrl={entry.avatar_url}
                  focusMinutes={entry.total_focus_minutes || 0}
                  isCurrentUser={entry.id === user?.id}
                />
              ))}
            </div>
          ) : (
            <GlassCard className="text-center py-8">
              <Trophy className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">No rankings yet</p>
            </GlassCard>
          )}
        </section>
      </div>
    </Layout>
  );
}
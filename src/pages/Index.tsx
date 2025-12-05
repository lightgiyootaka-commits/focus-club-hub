import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { GlassButton } from "@/components/ui/GlassButton";
import { useAuth } from "@/contexts/AuthContext";
import { getProfile, getClubs, getUserFocusSessions } from "@/lib/supabase";
import { Timer, ArrowRight } from "lucide-react";
import { useGamification } from "@/hooks/useGamification";

// Home components
import { StreakDisplay } from "@/components/home/StreakDisplay";
import { XPProgress } from "@/components/home/XPProgress";
import { DailyTasks } from "@/components/home/DailyTasks";
import { WeeklyGraph } from "@/components/home/WeeklyGraph";
import { QuestList } from "@/components/home/QuestList";
import { PersonalizedInsights } from "@/components/home/PersonalizedInsights";
import { DailyGoalTracker } from "@/components/home/DailyGoalTracker";
import { RecentSessions } from "@/components/home/RecentSessions";

interface Profile {
  id: string;
  name: string | null;
  total_focus_minutes: number | null;
  streak_days: number | null;
  daily_goal_minutes: number | null;
}

interface Session {
  id: string;
  started_at: string | null;
  duration_minutes: number | null;
  club_id: string | null;
  is_active: boolean | null;
}

export default function Index() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [recentSessions, setRecentSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

  const {
    xp,
    streak,
    quests,
    tasks,
    weeklyStats,
    loading: gamificationLoading,
    addTask,
    toggleTask,
    deleteTask,
  } = useGamification();

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
      const [profileRes, sessionsRes] = await Promise.all([
        getProfile(user.id),
        getUserFocusSessions(user.id),
      ]);

      if (profileRes.data) setProfile(profileRes.data);
      if (sessionsRes.data) {
        const completedSessions = sessionsRes.data.filter(s => !s.is_active);
        setRecentSessions(completedSessions.slice(0, 10));
      }
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate today's focus minutes from weekly stats
  const todayMinutes = weeklyStats[weeklyStats.length - 1]?.minutes || 0;
  const dailyGoal = profile?.daily_goal_minutes || 60;

  if (authLoading || loading || gamificationLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="FocusClub" streakCount={streak?.current_streak || 0}>
      <div className="space-y-6 animate-fade-in pb-4">
        {/* Welcome Section */}
        <section className="mt-2">
          <h2 className="text-2xl font-display font-bold text-foreground mb-1">
            Hey, {profile?.name || "there"}!
          </h2>
          <p className="text-muted-foreground">Ready to focus today?</p>
        </section>

        {/* Personalized Insights */}
        <PersonalizedInsights
          weeklyStats={weeklyStats}
          streak={streak}
          totalFocusMinutes={profile?.total_focus_minutes || 0}
          dailyGoal={dailyGoal}
        />

        {/* XP and Streak Row */}
        {xp && (
          <XPProgress
            totalXP={xp.total_xp}
            currentLevel={xp.current_level}
            xpToNextLevel={xp.xp_to_next_level}
          />
        )}

        {streak && (
          <StreakDisplay
            currentStreak={streak.current_streak}
            longestStreak={streak.longest_streak}
            isProtected={streak.streak_protected_until ? new Date(streak.streak_protected_until) > new Date() : false}
          />
        )}

        {/* Daily Goal Tracker */}
        <DailyGoalTracker
          todayMinutes={todayMinutes}
          dailyGoal={dailyGoal}
        />

        {/* Weekly Activity Graph */}
        <WeeklyGraph
          stats={weeklyStats}
          dailyGoal={dailyGoal}
        />

        {/* Daily Tasks */}
        <DailyTasks
          tasks={tasks}
          onAddTask={addTask}
          onToggleTask={toggleTask}
          onDeleteTask={deleteTask}
        />

        {/* Quests */}
        <QuestList quests={quests} />

        {/* Recent Sessions */}
        <RecentSessions sessions={recentSessions} />

        {/* Quick Actions */}
        <section className="pt-2">
          <div className="flex gap-3">
            <GlassButton
              variant="primary"
              size="lg"
              onClick={() => navigate("/timer")}
              className="flex-1"
            >
              <Timer className="w-5 h-5 mr-2" />
              Start Session
            </GlassButton>
            <GlassButton
              variant="outline"
              size="lg"
              onClick={() => navigate("/clubs")}
            >
              Clubs <ArrowRight className="w-4 h-4 ml-1" />
            </GlassButton>
          </div>
        </section>
      </div>
    </Layout>
  );
}

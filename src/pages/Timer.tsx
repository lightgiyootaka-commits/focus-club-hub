import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { FocusTimer } from "@/components/timer/FocusTimer";
import { GlassCard } from "@/components/ui/GlassCard";
import { useAuth } from "@/contexts/AuthContext";
import { startFocusSession, endFocusSession, updateUserStats, getActiveFocusSession } from "@/lib/supabase";
import { toast } from "sonner";
import { Target, Zap, Brain } from "lucide-react";

export default function Timer() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [todaySessions, setTodaySessions] = useState(0);
  const [todayMinutes, setTodayMinutes] = useState(0);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      checkActiveSession();
    }
  }, [user]);

  const checkActiveSession = async () => {
    if (!user) return;
    const { data } = await getActiveFocusSession(user.id);
    if (data) {
      setActiveSessionId(data.id);
    }
  };

  const handleStart = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await startFocusSession(user.id);
      if (error) throw error;
      if (data) {
        setActiveSessionId(data.id);
      }
    } catch (error) {
      console.error("Error starting session:", error);
      toast.error("Failed to start session");
    }
  };

  const handleComplete = async (minutes: number) => {
    if (!user || !activeSessionId) return;

    try {
      const { error: sessionError } = await endFocusSession(activeSessionId, minutes);
      if (sessionError) throw sessionError;

      const { error: statsError } = await updateUserStats(user.id, minutes);
      if (statsError) throw statsError;

      setActiveSessionId(null);
      setTodaySessions((prev) => prev + 1);
      setTodayMinutes((prev) => prev + minutes);
      
      toast.success(`Great focus! You completed ${minutes} minutes.`);
    } catch (error) {
      console.error("Error completing session:", error);
      toast.error("Failed to save session");
    }
  };

  const tips = [
    { icon: Target, text: "Set clear goals before starting" },
    { icon: Zap, text: "Take short breaks between sessions" },
    { icon: Brain, text: "Silence notifications for deep work" },
  ];

  if (authLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Focus Timer">
      <div className="flex flex-col items-center pt-8 space-y-8 animate-fade-in">
        <FocusTimer
          initialMinutes={25}
          onStart={handleStart}
          onComplete={handleComplete}
        />

        {/* Today's Stats */}
        <GlassCard className="w-full">
          <h3 className="font-display font-semibold mb-4">Today's Progress</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 rounded-xl bg-secondary/30">
              <p className="font-display text-2xl font-bold text-primary">{todaySessions}</p>
              <p className="text-sm text-muted-foreground">Sessions</p>
            </div>
            <div className="text-center p-4 rounded-xl bg-secondary/30">
              <p className="font-display text-2xl font-bold text-primary">{todayMinutes}m</p>
              <p className="text-sm text-muted-foreground">Focused</p>
            </div>
          </div>
        </GlassCard>

        {/* Tips */}
        <GlassCard className="w-full">
          <h3 className="font-display font-semibold mb-4">Focus Tips</h3>
          <div className="space-y-3">
            {tips.map((tip, index) => (
              <div key={index} className="flex items-center gap-3 text-muted-foreground">
                <tip.icon className="w-5 h-5 text-primary flex-shrink-0" />
                <span className="text-sm">{tip.text}</span>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>
    </Layout>
  );
}
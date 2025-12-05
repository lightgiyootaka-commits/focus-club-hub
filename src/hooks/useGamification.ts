import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface UserXP {
  total_xp: number;
  current_level: number;
  xp_to_next_level: number;
}

export interface UserStreak {
  current_streak: number;
  longest_streak: number;
  last_activity_date: string | null;
  streak_protected_until: string | null;
}

export interface Quest {
  id: string;
  title: string;
  description: string | null;
  quest_type: 'daily' | 'weekly' | 'monthly';
  target_value: number;
  xp_reward: number;
  icon: string | null;
  current_progress?: number;
  is_completed?: boolean;
}

export interface Badge {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
  badge_type: string;
  rarity: string;
  earned_at?: string;
}

export interface DailyTask {
  id: string;
  title: string;
  is_completed: boolean;
  task_date: string;
}

export interface WeeklyStats {
  date: string;
  minutes: number;
}

const LEVEL_TITLES = [
  'Beginner',
  'Apprentice', 
  'Focused',
  'Dedicated',
  'Deep Worker',
  'Master',
  'Grandmaster',
  'Monk'
];

export function getLevelTitle(level: number): string {
  const index = Math.min(Math.floor((level - 1) / 5), LEVEL_TITLES.length - 1);
  return LEVEL_TITLES[index];
}

export function getXPForLevel(level: number): number {
  return Math.floor(100 * Math.pow(1.5, level - 1));
}

export function useGamification() {
  const { user } = useAuth();
  const [xp, setXP] = useState<UserXP | null>(null);
  const [streak, setStreak] = useState<UserStreak | null>(null);
  const [quests, setQuests] = useState<Quest[]>([]);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [tasks, setTasks] = useState<DailyTask[]>([]);
  const [weeklyStats, setWeeklyStats] = useState<WeeklyStats[]>([]);
  const [loading, setLoading] = useState(true);

  const loadGamificationData = useCallback(async () => {
    if (!user) return;

    try {
      // Load XP
      const { data: xpData } = await supabase
        .from('user_xp')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (!xpData) {
        // Create initial XP record
        const { data: newXP } = await supabase
          .from('user_xp')
          .insert({ user_id: user.id })
          .select()
          .single();
        setXP(newXP);
      } else {
        setXP(xpData);
      }

      // Load Streak
      const { data: streakData } = await supabase
        .from('user_streaks')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (!streakData) {
        const { data: newStreak } = await supabase
          .from('user_streaks')
          .insert({ user_id: user.id })
          .select()
          .single();
        setStreak(newStreak);
      } else {
        setStreak(streakData);
      }

      // Load Quests with progress
      const today = new Date().toISOString().split('T')[0];
      const { data: questsData } = await supabase
        .from('quests')
        .select('*')
        .eq('is_active', true);

      if (questsData) {
        const { data: progressData } = await supabase
          .from('user_quests')
          .select('*')
          .eq('user_id', user.id)
          .eq('assigned_at', today);

        const questsWithProgress: Quest[] = questsData.map(quest => {
          const progress = progressData?.find(p => p.quest_id === quest.id);
          return {
            id: quest.id,
            title: quest.title,
            description: quest.description,
            quest_type: quest.quest_type as 'daily' | 'weekly' | 'monthly',
            target_value: quest.target_value,
            xp_reward: quest.xp_reward,
            icon: quest.icon,
            current_progress: progress?.current_progress || 0,
            is_completed: progress?.is_completed || false,
          };
        });
        setQuests(questsWithProgress);
      }

      // Load Badges
      const { data: allBadges } = await supabase.from('badges').select('*');
      const { data: earnedBadges } = await supabase
        .from('user_badges')
        .select('badge_id, earned_at')
        .eq('user_id', user.id);

      if (allBadges) {
        const badgesWithStatus = allBadges.map(badge => {
          const earned = earnedBadges?.find(e => e.badge_id === badge.id);
          return {
            ...badge,
            earned_at: earned?.earned_at,
          };
        });
        setBadges(badgesWithStatus);
      }

      // Load Today's Tasks
      const { data: tasksData } = await supabase
        .from('daily_tasks')
        .select('*')
        .eq('user_id', user.id)
        .eq('task_date', today)
        .order('created_at', { ascending: true });

      setTasks(tasksData || []);

      // Load Weekly Stats
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      
      const { data: sessions } = await supabase
        .from('focus_sessions')
        .select('started_at, duration_minutes')
        .eq('user_id', user.id)
        .gte('started_at', weekAgo.toISOString())
        .eq('is_active', false);

      // Group by day
      const statsMap = new Map<string, number>();
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        statsMap.set(date.toISOString().split('T')[0], 0);
      }

      sessions?.forEach(session => {
        const date = session.started_at?.split('T')[0];
        if (date && statsMap.has(date)) {
          statsMap.set(date, (statsMap.get(date) || 0) + (session.duration_minutes || 0));
        }
      });

      setWeeklyStats(Array.from(statsMap.entries()).map(([date, minutes]) => ({ date, minutes })));

    } catch (error) {
      console.error('Error loading gamification data:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadGamificationData();
  }, [loadGamificationData]);

  const addTask = async (title: string) => {
    if (!user) return;
    const today = new Date().toISOString().split('T')[0];
    
    const { data, error } = await supabase
      .from('daily_tasks')
      .insert({ user_id: user.id, title, task_date: today })
      .select()
      .single();

    if (data && !error) {
      setTasks(prev => [...prev, data]);
    }
    return { data, error };
  };

  const toggleTask = async (taskId: string) => {
    if (!user) return;
    
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const newCompleted = !task.is_completed;
    const { error } = await supabase
      .from('daily_tasks')
      .update({ 
        is_completed: newCompleted,
        completed_at: newCompleted ? new Date().toISOString() : null 
      })
      .eq('id', taskId);

    if (!error) {
      setTasks(prev => prev.map(t => 
        t.id === taskId ? { ...t, is_completed: newCompleted } : t
      ));
    }
  };

  const deleteTask = async (taskId: string) => {
    if (!user) return;
    
    const { error } = await supabase
      .from('daily_tasks')
      .delete()
      .eq('id', taskId);

    if (!error) {
      setTasks(prev => prev.filter(t => t.id !== taskId));
    }
  };

  const addXP = async (amount: number) => {
    if (!user || !xp) return;

    let newTotalXP = xp.total_xp + amount;
    let newLevel = xp.current_level;
    let xpNeeded = xp.xp_to_next_level;

    // Check for level up
    while (newTotalXP >= xpNeeded) {
      newTotalXP -= xpNeeded;
      newLevel++;
      xpNeeded = getXPForLevel(newLevel);
    }

    const { data, error } = await supabase
      .from('user_xp')
      .update({ 
        total_xp: newTotalXP,
        current_level: newLevel,
        xp_to_next_level: xpNeeded,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', user.id)
      .select()
      .single();

    if (data && !error) {
      setXP(data);
    }
    
    return { leveledUp: newLevel > xp.current_level, newLevel };
  };

  const updateStreak = async () => {
    if (!user || !streak) return;

    const today = new Date().toISOString().split('T')[0];
    const lastActivity = streak.last_activity_date;
    
    let newStreak = streak.current_streak;
    
    if (lastActivity !== today) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];

      if (lastActivity === yesterdayStr) {
        newStreak++;
      } else if (!lastActivity) {
        newStreak = 1;
      } else {
        // Streak broken unless protected
        const protectedUntil = streak.streak_protected_until;
        if (protectedUntil && new Date(protectedUntil) > new Date()) {
          newStreak++; // Protected, continue streak
        } else {
          newStreak = 1; // Reset streak
        }
      }

      const { data, error } = await supabase
        .from('user_streaks')
        .update({
          current_streak: newStreak,
          longest_streak: Math.max(newStreak, streak.longest_streak),
          last_activity_date: today,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id)
        .select()
        .single();

      if (data && !error) {
        setStreak(data);
      }
    }

    return newStreak;
  };

  return {
    xp,
    streak,
    quests,
    badges,
    tasks,
    weeklyStats,
    loading,
    addTask,
    toggleTask,
    deleteTask,
    addXP,
    updateStreak,
    refreshData: loadGamificationData,
    getLevelTitle,
  };
}

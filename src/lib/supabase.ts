import { supabase } from "@/integrations/supabase/client";
import type { User, Session } from "@supabase/supabase-js";

export { supabase };

// Auth functions
export const signUp = async (email: string, password: string, name?: string) => {
  const redirectUrl = `${window.location.origin}/`;
  
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: redirectUrl,
      data: { name: name || email.split('@')[0] }
    }
  });
  return { data, error };
};

export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  return { data, error };
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  return { error };
};

export const getCurrentUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser();
  return { user, error };
};

export const getCurrentSession = async () => {
  const { data: { session }, error } = await supabase.auth.getSession();
  return { session, error };
};

// Profile functions
export const getProfile = async (userId: string) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();
  return { data, error };
};

export const updateProfile = async (userId: string, updates: { name?: string; avatar_url?: string }) => {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();
  return { data, error };
};

// Club functions
export const getClubs = async () => {
  const { data, error } = await supabase
    .from('clubs')
    .select(`
      *,
      creator:profiles!clubs_created_by_fkey(name, avatar_url)
    `)
    .order('created_at', { ascending: false });
  return { data, error };
};

export const getClub = async (clubId: string) => {
  const { data, error } = await supabase
    .from('clubs')
    .select(`
      *,
      creator:profiles!clubs_created_by_fkey(name, avatar_url)
    `)
    .eq('id', clubId)
    .maybeSingle();
  return { data, error };
};

export const createClub = async (name: string, description: string, createdBy: string) => {
  const { data, error } = await supabase
    .from('clubs')
    .insert({ name, description, created_by: createdBy })
    .select()
    .single();
  
  if (data && !error) {
    // Auto-join creator to club
    await supabase
      .from('club_members')
      .insert({ club_id: data.id, user_id: createdBy });
  }
  
  return { data, error };
};

export const joinClub = async (clubId: string, userId: string) => {
  const { data, error } = await supabase
    .from('club_members')
    .insert({ club_id: clubId, user_id: userId })
    .select()
    .single();
  
  return { data, error };
};

export const leaveClub = async (clubId: string, userId: string) => {
  const { error } = await supabase
    .from('club_members')
    .delete()
    .eq('club_id', clubId)
    .eq('user_id', userId);
  return { error };
};

export const getClubMembers = async (clubId: string) => {
  const { data, error } = await supabase
    .from('club_members')
    .select(`
      *,
      profile:profiles(id, name, avatar_url, total_focus_minutes)
    `)
    .eq('club_id', clubId);
  return { data, error };
};

export const isClubMember = async (clubId: string, userId: string) => {
  const { data, error } = await supabase
    .from('club_members')
    .select('id')
    .eq('club_id', clubId)
    .eq('user_id', userId)
    .maybeSingle();
  return { isMember: !!data, error };
};

// Focus session functions
export const startFocusSession = async (userId: string, clubId?: string) => {
  const { data, error } = await supabase
    .from('focus_sessions')
    .insert({ 
      user_id: userId, 
      club_id: clubId,
      started_at: new Date().toISOString(),
      is_active: true 
    })
    .select()
    .single();
  return { data, error };
};

export const endFocusSession = async (sessionId: string, durationMinutes: number) => {
  const { data, error } = await supabase
    .from('focus_sessions')
    .update({ 
      ended_at: new Date().toISOString(),
      duration_minutes: durationMinutes,
      is_active: false 
    })
    .eq('id', sessionId)
    .select()
    .single();
  return { data, error };
};

export const getActiveFocusSession = async (userId: string) => {
  const { data, error } = await supabase
    .from('focus_sessions')
    .select('*')
    .eq('user_id', userId)
    .eq('is_active', true)
    .maybeSingle();
  return { data, error };
};

export const getUserFocusSessions = async (userId: string) => {
  const { data, error } = await supabase
    .from('focus_sessions')
    .select('*')
    .eq('user_id', userId)
    .order('started_at', { ascending: false });
  return { data, error };
};

export const updateUserStats = async (userId: string, additionalMinutes: number) => {
  const { data: profile } = await getProfile(userId);
  if (profile) {
    const { error } = await supabase
      .from('profiles')
      .update({ 
        total_focus_minutes: (profile.total_focus_minutes || 0) + additionalMinutes 
      })
      .eq('id', userId);
    return { error };
  }
  return { error: new Error('Profile not found') };
};

// Leaderboard functions
export const getGlobalLeaderboard = async (limit = 10) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, name, avatar_url, total_focus_minutes')
    .order('total_focus_minutes', { ascending: false })
    .limit(limit);
  return { data, error };
};

export const getClubLeaderboard = async (clubId: string, limit = 10) => {
  const { data, error } = await supabase
    .from('club_members')
    .select(`
      profile:profiles(id, name, avatar_url, total_focus_minutes)
    `)
    .eq('club_id', clubId)
    .order('joined_at', { ascending: true })
    .limit(limit);
  
  // Sort by total_focus_minutes client-side
  if (data) {
    data.sort((a, b) => 
      ((b.profile as any)?.total_focus_minutes || 0) - ((a.profile as any)?.total_focus_minutes || 0)
    );
  }
  
  return { data, error };
};
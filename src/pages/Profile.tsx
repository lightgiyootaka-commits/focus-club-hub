import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { GlassCard } from "@/components/ui/GlassCard";
import { GlassButton } from "@/components/ui/GlassButton";
import { GlassInput } from "@/components/ui/GlassInput";
import { useAuth } from "@/contexts/AuthContext";
import { getProfile, updateProfile, getUserFocusSessions } from "@/lib/supabase";
import { toast } from "sonner";
import { User, Timer, Calendar, Award, Edit2, Check, X, Loader2 } from "lucide-react";

interface Profile {
  id: string;
  name: string | null;
  email: string | null;
  avatar_url: string | null;
  total_focus_minutes: number | null;
  streak_days: number | null;
  created_at: string;
}

interface FocusSession {
  id: string;
  duration_minutes: number;
  started_at: string;
  ended_at: string | null;
}

export default function Profile() {
  const { user, loading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [sessions, setSessions] = useState<FocusSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [newName, setNewName] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      loadProfile();
    }
  }, [user]);

  const loadProfile = async () => {
    if (!user) return;

    try {
      const [profileRes, sessionsRes] = await Promise.all([
        getProfile(user.id),
        getUserFocusSessions(user.id),
      ]);

      if (profileRes.data) {
        setProfile(profileRes.data);
        setNewName(profileRes.data.name || "");
      }
      if (sessionsRes.data) setSessions(sessionsRes.data.slice(0, 10));
    } catch (error) {
      console.error("Error loading profile:", error);
      toast.error("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user || !newName.trim()) return;

    setSaving(true);
    try {
      const { error } = await updateProfile(user.id, { name: newName.trim() });
      if (error) throw error;
      
      setProfile((prev) => prev ? { ...prev, name: newName.trim() } : null);
      setEditing(false);
      toast.success("Profile updated!");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth");
  };

  const formatTime = (minutes: number | null) => {
    if (!minutes) return "0m";
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  if (authLoading || loading) {
    return (
      <Layout title="Profile">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Profile" showStreak={false}>
      <div className="space-y-6 animate-fade-in">
        {/* Profile Header */}
        <GlassCard variant="gradient">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center overflow-hidden">
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
              ) : (
                <User className="w-10 h-10 text-muted-foreground" />
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              {editing ? (
                <div className="flex items-center gap-2">
                  <GlassInput
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="h-10"
                    maxLength={50}
                  />
                  <GlassButton
                    variant="primary"
                    size="icon"
                    onClick={handleSave}
                    disabled={saving || !newName.trim()}
                  >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  </GlassButton>
                  <GlassButton
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setEditing(false);
                      setNewName(profile?.name || "");
                    }}
                  >
                    <X className="w-4 h-4" />
                  </GlassButton>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <h2 className="font-display text-2xl font-bold text-foreground truncate">
                    {profile?.name || "Anonymous"}
                  </h2>
                  <GlassButton
                    variant="ghost"
                    size="icon"
                    onClick={() => setEditing(true)}
                    className="flex-shrink-0"
                  >
                    <Edit2 className="w-4 h-4" />
                  </GlassButton>
                </div>
              )}
              <p className="text-muted-foreground text-sm truncate">{profile?.email}</p>
              <p className="text-muted-foreground text-xs mt-1">
                Member since {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : "N/A"}
              </p>
            </div>
          </div>
        </GlassCard>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-3">
          <GlassCard className="text-center p-4">
            <Timer className="w-6 h-6 text-primary mx-auto mb-1" />
            <p className="font-display text-xl font-bold">{formatTime(profile?.total_focus_minutes)}</p>
            <p className="text-xs text-muted-foreground">Total Focus</p>
          </GlassCard>
          
          <GlassCard className="text-center p-4">
            <Calendar className="w-6 h-6 text-primary mx-auto mb-1" />
            <p className="font-display text-xl font-bold">{sessions.length}</p>
            <p className="text-xs text-muted-foreground">Sessions</p>
          </GlassCard>
          
          <GlassCard className="text-center p-4">
            <Award className="w-6 h-6 text-primary mx-auto mb-1" />
            <p className="font-display text-xl font-bold">{profile?.streak_days || 0}</p>
            <p className="text-xs text-muted-foreground">Day Streak</p>
          </GlassCard>
        </div>

        {/* Recent Sessions */}
        <section>
          <h3 className="font-display text-lg font-semibold mb-4">Recent Sessions</h3>
          
          {sessions.length > 0 ? (
            <div className="space-y-2">
              {sessions.map((session) => (
                <GlassCard key={session.id} className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Timer className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{formatTime(session.duration_minutes)}</p>
                      <p className="text-xs text-muted-foreground">{formatDate(session.started_at)}</p>
                    </div>
                  </div>
                </GlassCard>
              ))}
            </div>
          ) : (
            <GlassCard className="text-center py-8">
              <Timer className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">No sessions yet</p>
            </GlassCard>
          )}
        </section>

        {/* Sign Out */}
        <GlassButton
          variant="outline"
          className="w-full"
          onClick={handleSignOut}
        >
          Sign Out
        </GlassButton>
      </div>
    </Layout>
  );
}
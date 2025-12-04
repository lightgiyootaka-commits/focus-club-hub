import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { GlassCard } from "@/components/ui/GlassCard";
import { GlassButton } from "@/components/ui/GlassButton";
import { LeaderboardItem } from "@/components/leaderboard/LeaderboardItem";
import { useAuth } from "@/contexts/AuthContext";
import { getClub, getClubMembers, joinClub, leaveClub, isClubMember } from "@/lib/supabase";
import { toast } from "sonner";
import { Users, Timer, ArrowLeft, UserPlus, UserMinus, Loader2 } from "lucide-react";

interface Club {
  id: string;
  name: string;
  description: string | null;
  member_count: number | null;
  image_url: string | null;
  created_by: string | null;
}

interface Member {
  profile: {
    id: string;
    name: string | null;
    avatar_url: string | null;
    total_focus_minutes: number | null;
  } | null;
}

export default function ClubDetail() {
  const { id } = useParams<{ id: string }>();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [club, setClub] = useState<Club | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [isMember, setIsMember] = useState(false);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (id && user) {
      loadClubData();
    }
  }, [id, user]);

  const loadClubData = async () => {
    if (!id || !user) return;

    try {
      const [clubRes, membersRes, membershipRes] = await Promise.all([
        getClub(id),
        getClubMembers(id),
        isClubMember(id, user.id),
      ]);

      if (clubRes.data) setClub(clubRes.data);
      if (membersRes.data) setMembers(membersRes.data as Member[]);
      setIsMember(membershipRes.isMember);
    } catch (error) {
      console.error("Error loading club:", error);
      toast.error("Failed to load club");
    } finally {
      setLoading(false);
    }
  };

  const handleJoinLeave = async () => {
    if (!id || !user) return;

    setJoining(true);
    try {
      if (isMember) {
        const { error } = await leaveClub(id, user.id);
        if (error) throw error;
        toast.success("Left the club");
        setIsMember(false);
      } else {
        const { error } = await joinClub(id, user.id);
        if (error) throw error;
        toast.success("Joined the club!");
        setIsMember(true);
      }
      loadClubData();
    } catch (error: any) {
      if (error?.code === "23505") {
        toast.error("You're already a member");
      } else {
        toast.error(isMember ? "Failed to leave club" : "Failed to join club");
      }
    } finally {
      setJoining(false);
    }
  };

  const sortedMembers = [...members].sort(
    (a, b) =>
      (b.profile?.total_focus_minutes || 0) - (a.profile?.total_focus_minutes || 0)
  );

  if (authLoading || loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </Layout>
    );
  }

  if (!club) {
    return (
      <Layout title="Club not found">
        <GlassCard className="text-center py-12">
          <p className="text-muted-foreground mb-4">This club doesn't exist</p>
          <GlassButton variant="primary" onClick={() => navigate("/clubs")}>
            Back to Clubs
          </GlassButton>
        </GlassCard>
      </Layout>
    );
  }

  return (
    <Layout title={club.name} showStreak={false}>
      <div className="space-y-6 animate-fade-in">
        {/* Back Button */}
        <GlassButton variant="ghost" size="sm" onClick={() => navigate("/clubs")}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Clubs
        </GlassButton>

        {/* Club Header */}
        <GlassCard variant="gradient">
          <div className="flex items-start gap-4">
            <div className="w-20 h-20 rounded-2xl bg-secondary flex items-center justify-center overflow-hidden flex-shrink-0">
              {club.image_url ? (
                <img src={club.image_url} alt={club.name} className="w-full h-full object-cover" />
              ) : (
                <Users className="w-10 h-10 text-muted-foreground" />
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <h1 className="font-display text-2xl font-bold text-foreground">{club.name}</h1>
              {club.description && (
                <p className="text-muted-foreground mt-1">{club.description}</p>
              )}
              <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <Users className="w-4 h-4" />
                  {members.length} member{members.length !== 1 ? "s" : ""}
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex gap-3 mt-6">
            <GlassButton
              variant={isMember ? "outline" : "primary"}
              className="flex-1"
              onClick={handleJoinLeave}
              disabled={joining}
            >
              {joining ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : isMember ? (
                <>
                  <UserMinus className="w-4 h-4 mr-2" />
                  Leave Club
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4 mr-2" />
                  Join Club
                </>
              )}
            </GlassButton>
            
            {isMember && (
              <GlassButton
                variant="primary"
                onClick={() => navigate("/timer")}
              >
                <Timer className="w-4 h-4 mr-2" />
                Focus
              </GlassButton>
            )}
          </div>
        </GlassCard>

        {/* Members Leaderboard */}
        <section>
          <h2 className="font-display text-lg font-semibold mb-4">Club Leaderboard</h2>
          
          {sortedMembers.length > 0 ? (
            <div className="space-y-2">
              {sortedMembers.map((member, index) =>
                member.profile ? (
                  <LeaderboardItem
                    key={member.profile.id}
                    rank={index + 1}
                    name={member.profile.name || "Anonymous"}
                    avatarUrl={member.profile.avatar_url}
                    focusMinutes={member.profile.total_focus_minutes || 0}
                    isCurrentUser={member.profile.id === user?.id}
                  />
                ) : null
              )}
            </div>
          ) : (
            <GlassCard className="text-center py-8">
              <p className="text-muted-foreground">No members yet</p>
            </GlassCard>
          )}
        </section>
      </div>
    </Layout>
  );
}
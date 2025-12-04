import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { GlassCard } from "@/components/ui/GlassCard";
import { GlassButton } from "@/components/ui/GlassButton";
import { GlassInput } from "@/components/ui/GlassInput";
import { ClubCard } from "@/components/clubs/ClubCard";
import { useAuth } from "@/contexts/AuthContext";
import { getClubs, createClub } from "@/lib/supabase";
import { toast } from "sonner";
import { Plus, Search, Users, X, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Club {
  id: string;
  name: string;
  description: string | null;
  member_count: number | null;
  image_url: string | null;
}

export default function Clubs() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [clubs, setClubs] = useState<Club[]>([]);
  const [filteredClubs, setFilteredClubs] = useState<Club[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newClubName, setNewClubName] = useState("");
  const [newClubDescription, setNewClubDescription] = useState("");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      loadClubs();
    }
  }, [user]);

  useEffect(() => {
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      setFilteredClubs(
        clubs.filter(
          (club) =>
            club.name.toLowerCase().includes(query) ||
            club.description?.toLowerCase().includes(query)
        )
      );
    } else {
      setFilteredClubs(clubs);
    }
  }, [searchQuery, clubs]);

  const loadClubs = async () => {
    try {
      const { data, error } = await getClubs();
      if (error) throw error;
      if (data) {
        setClubs(data);
        setFilteredClubs(data);
      }
    } catch (error) {
      console.error("Error loading clubs:", error);
      toast.error("Failed to load clubs");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateClub = async () => {
    if (!user || !newClubName.trim()) return;

    setCreating(true);
    try {
      const { data, error } = await createClub(
        newClubName.trim(),
        newClubDescription.trim(),
        user.id
      );
      if (error) throw error;
      
      toast.success("Club created!");
      setShowCreateModal(false);
      setNewClubName("");
      setNewClubDescription("");
      loadClubs();
      
      if (data) {
        navigate(`/clubs/${data.id}`);
      }
    } catch (error) {
      console.error("Error creating club:", error);
      toast.error("Failed to create club");
    } finally {
      setCreating(false);
    }
  };

  if (authLoading || loading) {
    return (
      <Layout title="Clubs">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Clubs">
      <div className="space-y-6 animate-fade-in">
        {/* Search and Create */}
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <GlassInput
              placeholder="Search clubs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12"
            />
          </div>
          <GlassButton
            variant="primary"
            size="icon"
            onClick={() => setShowCreateModal(true)}
          >
            <Plus className="w-5 h-5" />
          </GlassButton>
        </div>

        {/* Clubs List */}
        {filteredClubs.length > 0 ? (
          <div className="space-y-3">
            {filteredClubs.map((club) => (
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
          <GlassCard className="text-center py-12">
            <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-display text-lg font-semibold mb-2">
              {searchQuery ? "No clubs found" : "No clubs yet"}
            </h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery
                ? "Try a different search term"
                : "Be the first to create a focus club!"}
            </p>
            {!searchQuery && (
              <GlassButton variant="primary" onClick={() => setShowCreateModal(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create Club
              </GlassButton>
            )}
          </GlassCard>
        )}

        {/* Create Club Modal */}
        <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
          <DialogContent className="glass-card border-border">
            <DialogHeader>
              <DialogTitle className="font-display text-xl">Create a Club</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Club Name
                </label>
                <GlassInput
                  placeholder="Enter club name"
                  value={newClubName}
                  onChange={(e) => setNewClubName(e.target.value)}
                  maxLength={50}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Description (optional)
                </label>
                <GlassInput
                  placeholder="What's this club about?"
                  value={newClubDescription}
                  onChange={(e) => setNewClubDescription(e.target.value)}
                  maxLength={200}
                />
              </div>
              
              <div className="flex gap-3 pt-4">
                <GlassButton
                  variant="ghost"
                  className="flex-1"
                  onClick={() => setShowCreateModal(false)}
                >
                  Cancel
                </GlassButton>
                <GlassButton
                  variant="primary"
                  className="flex-1"
                  onClick={handleCreateClub}
                  disabled={!newClubName.trim() || creating}
                >
                  {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : "Create"}
                </GlassButton>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}
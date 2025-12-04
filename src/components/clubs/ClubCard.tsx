import { GlassCard } from "@/components/ui/GlassCard";
import { Users } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface ClubCardProps {
  id: string;
  name: string;
  description?: string | null;
  memberCount: number;
  imageUrl?: string | null;
}

export function ClubCard({ id, name, description, memberCount, imageUrl }: ClubCardProps) {
  const navigate = useNavigate();

  return (
    <GlassCard
      className="cursor-pointer hover:scale-[1.02] transition-transform duration-300"
      onClick={() => navigate(`/clubs/${id}`)}
    >
      <div className="flex gap-4">
        <div className="w-16 h-16 rounded-xl bg-secondary flex items-center justify-center overflow-hidden flex-shrink-0">
          {imageUrl ? (
            <img src={imageUrl} alt={name} className="w-full h-full object-cover" />
          ) : (
            <Users className="w-7 h-7 text-muted-foreground" />
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="font-display font-semibold text-lg text-foreground truncate">
            {name}
          </h3>
          {description && (
            <p className="text-muted-foreground text-sm line-clamp-2 mt-1">
              {description}
            </p>
          )}
          <div className="flex items-center gap-1.5 mt-2 text-muted-foreground text-sm">
            <Users className="w-4 h-4" />
            <span>{memberCount} member{memberCount !== 1 ? 's' : ''}</span>
          </div>
        </div>
      </div>
    </GlassCard>
  );
}
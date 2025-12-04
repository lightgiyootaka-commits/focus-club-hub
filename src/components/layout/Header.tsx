import { useAuth } from "@/contexts/AuthContext";
import { LogOut, Flame } from "lucide-react";
import { GlassButton } from "@/components/ui/GlassButton";
import { useNavigate } from "react-router-dom";

interface HeaderProps {
  title?: string;
  showStreak?: boolean;
  streakCount?: number;
}

export function Header({ title = "FocusClub", showStreak = true, streakCount = 0 }: HeaderProps) {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth");
  };

  return (
    <header className="sticky top-0 z-40 w-full">
      <div className="glass-card mx-4 mt-4 flex items-center justify-between py-3 px-4 rounded-2xl">
        <h1 className="font-display text-xl font-bold gradient-text">{title}</h1>
        
        <div className="flex items-center gap-3">
          {showStreak && streakCount > 0 && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 text-primary">
              <Flame className="w-4 h-4" />
              <span className="text-sm font-semibold">{streakCount}</span>
            </div>
          )}
          
          {user && (
            <GlassButton
              variant="ghost"
              size="icon"
              onClick={handleSignOut}
              className="text-muted-foreground hover:text-foreground"
            >
              <LogOut className="w-5 h-5" />
            </GlassButton>
          )}
        </div>
      </div>
    </header>
  );
}
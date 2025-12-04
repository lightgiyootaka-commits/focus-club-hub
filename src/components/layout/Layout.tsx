import { ReactNode } from "react";
import { Header } from "./Header";
import { BottomNav } from "./BottomNav";

interface LayoutProps {
  children: ReactNode;
  title?: string;
  showHeader?: boolean;
  showNav?: boolean;
  showStreak?: boolean;
  streakCount?: number;
}

export function Layout({ 
  children, 
  title, 
  showHeader = true, 
  showNav = true,
  showStreak = true,
  streakCount = 0 
}: LayoutProps) {
  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background gradient effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent/5 rounded-full blur-3xl" />
      </div>
      
      <div className="relative z-10">
        {showHeader && <Header title={title} showStreak={showStreak} streakCount={streakCount} />}
        
        <main className={`px-4 ${showNav ? 'pb-28' : 'pb-4'} ${showHeader ? 'pt-4' : 'pt-8'}`}>
          {children}
        </main>
        
        {showNav && <BottomNav />}
      </div>
    </div>
  );
}
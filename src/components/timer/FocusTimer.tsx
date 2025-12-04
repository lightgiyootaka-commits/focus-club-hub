import { useState, useEffect, useRef, useCallback } from "react";
import { Play, Pause, RotateCcw, Check } from "lucide-react";
import { GlassButton } from "@/components/ui/GlassButton";
import { GlassCard } from "@/components/ui/GlassCard";
import { cn } from "@/lib/utils";

interface FocusTimerProps {
  initialMinutes?: number;
  onComplete?: (minutes: number) => void;
  onStart?: () => void;
  onPause?: () => void;
}

export function FocusTimer({ 
  initialMinutes = 25, 
  onComplete, 
  onStart, 
  onPause 
}: FocusTimerProps) {
  const [totalSeconds, setTotalSeconds] = useState(initialMinutes * 60);
  const [remainingSeconds, setRemainingSeconds] = useState(initialMinutes * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number | null>(null);

  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;
  const progress = ((totalSeconds - remainingSeconds) / totalSeconds) * 100;
  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  const startTimer = useCallback(() => {
    if (remainingSeconds <= 0) return;
    
    setIsRunning(true);
    setIsCompleted(false);
    startTimeRef.current = Date.now();
    onStart?.();

    intervalRef.current = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current!);
          setIsRunning(false);
          setIsCompleted(true);
          const elapsedMinutes = Math.ceil((totalSeconds - 0) / 60);
          onComplete?.(elapsedMinutes);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [remainingSeconds, totalSeconds, onComplete, onStart]);

  const pauseTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsRunning(false);
    onPause?.();
  }, [onPause]);

  const resetTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setRemainingSeconds(totalSeconds);
    setIsRunning(false);
    setIsCompleted(false);
  }, [totalSeconds]);

  const finishEarly = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    const elapsedMinutes = Math.ceil((totalSeconds - remainingSeconds) / 60);
    setIsRunning(false);
    setIsCompleted(true);
    if (elapsedMinutes > 0) {
      onComplete?.(elapsedMinutes);
    }
  }, [totalSeconds, remainingSeconds, onComplete]);

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const presetTimes = [15, 25, 45, 60];

  return (
    <div className="flex flex-col items-center gap-8">
      {/* Timer Ring */}
      <div className="relative">
        <svg className="w-72 h-72 transform -rotate-90">
          {/* Background ring */}
          <circle
            cx="144"
            cy="144"
            r="130"
            fill="none"
            stroke="hsl(var(--secondary))"
            strokeWidth="8"
          />
          {/* Progress ring */}
          <circle
            cx="144"
            cy="144"
            r="130"
            fill="none"
            stroke="url(#gradient)"
            strokeWidth="8"
            strokeLinecap="round"
            style={{
              strokeDasharray: 2 * Math.PI * 130,
              strokeDashoffset: 2 * Math.PI * 130 - (progress / 100) * 2 * Math.PI * 130,
              transition: "stroke-dashoffset 0.5s ease",
            }}
          />
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="hsl(var(--primary))" />
              <stop offset="100%" stopColor="hsl(var(--accent))" />
            </linearGradient>
          </defs>
        </svg>
        
        {/* Time display */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={cn(
            "font-display text-6xl font-bold tracking-tight transition-colors",
            isCompleted ? "gradient-text" : "text-foreground"
          )}>
            {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
          </span>
          <span className="text-muted-foreground text-sm mt-2">
            {isCompleted ? "Completed!" : isRunning ? "Stay focused..." : "Ready to focus"}
          </span>
        </div>
      </div>

      {/* Preset time buttons */}
      {!isRunning && !isCompleted && (
        <div className="flex gap-2">
          {presetTimes.map((time) => (
            <GlassButton
              key={time}
              variant={totalSeconds === time * 60 ? "primary" : "outline"}
              size="sm"
              onClick={() => {
                setTotalSeconds(time * 60);
                setRemainingSeconds(time * 60);
              }}
            >
              {time}m
            </GlassButton>
          ))}
        </div>
      )}

      {/* Control buttons */}
      <div className="flex items-center gap-4">
        <GlassButton
          variant="ghost"
          size="icon"
          onClick={resetTimer}
          disabled={!isRunning && remainingSeconds === totalSeconds}
        >
          <RotateCcw className="w-5 h-5" />
        </GlassButton>
        
        <GlassButton
          variant="primary"
          size="lg"
          onClick={isRunning ? pauseTimer : startTimer}
          disabled={remainingSeconds === 0 && !isCompleted}
          className="w-16 h-16 rounded-full"
        >
          {isRunning ? (
            <Pause className="w-7 h-7" />
          ) : (
            <Play className="w-7 h-7 ml-1" />
          )}
        </GlassButton>
        
        {isRunning && (
          <GlassButton
            variant="ghost"
            size="icon"
            onClick={finishEarly}
          >
            <Check className="w-5 h-5" />
          </GlassButton>
        )}
      </div>
    </div>
  );
}
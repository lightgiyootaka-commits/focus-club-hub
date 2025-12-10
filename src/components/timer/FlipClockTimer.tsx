import { useState, useEffect, useRef, useCallback } from "react";
import { Play, Pause, RotateCcw, Check } from "lucide-react";
import { GlassButton } from "@/components/ui/GlassButton";
import { cn } from "@/lib/utils";

interface FlipClockTimerProps {
  initialMinutes?: number;
  onComplete?: (minutes: number) => void;
  onStart?: () => void;
  onPause?: () => void;
}

interface FlipDigitProps {
  value: string;
  prevValue: string;
  isFlipping: boolean;
}

function FlipDigit({ value, prevValue, isFlipping }: FlipDigitProps) {
  return (
    <div className="flip-digit-container">
      <div className="flip-digit">
        {/* Static top half */}
        <div className="digit-top">
          <span>{value}</span>
        </div>
        
        {/* Static bottom half */}
        <div className="digit-bottom">
          <span>{value}</span>
        </div>
        
        {/* Flipping card - top (shows previous value, flips down) */}
        <div className={cn("digit-flip-top", isFlipping && "flip-animation-top")}>
          <span>{prevValue}</span>
        </div>
        
        {/* Flipping card - bottom (shows new value, flips up) */}
        <div className={cn("digit-flip-bottom", isFlipping && "flip-animation-bottom")}>
          <span>{value}</span>
        </div>
      </div>
    </div>
  );
}

export function FlipClockTimer({ 
  initialMinutes = 25, 
  onComplete, 
  onStart, 
  onPause 
}: FlipClockTimerProps) {
  const [totalSeconds, setTotalSeconds] = useState(initialMinutes * 60);
  const [remainingSeconds, setRemainingSeconds] = useState(initialMinutes * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [prevTime, setPrevTime] = useState({ m1: "2", m2: "5", s1: "0", s2: "0" });
  const [isFlipping, setIsFlipping] = useState({ m1: false, m2: false, s1: false, s2: false });
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;
  
  const currentTime = {
    m1: String(Math.floor(minutes / 10)),
    m2: String(minutes % 10),
    s1: String(Math.floor(seconds / 10)),
    s2: String(seconds % 10),
  };

  // Track flipping state when digits change
  useEffect(() => {
    const newFlipping = {
      m1: currentTime.m1 !== prevTime.m1,
      m2: currentTime.m2 !== prevTime.m2,
      s1: currentTime.s1 !== prevTime.s1,
      s2: currentTime.s2 !== prevTime.s2,
    };
    
    setIsFlipping(newFlipping);
    
    const timeout = setTimeout(() => {
      setIsFlipping({ m1: false, m2: false, s1: false, s2: false });
      setPrevTime(currentTime);
    }, 600);
    
    return () => clearTimeout(timeout);
  }, [remainingSeconds]);

  const startTimer = useCallback(() => {
    if (remainingSeconds <= 0) return;
    
    setIsRunning(true);
    setIsCompleted(false);
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
      {/* Flip Clock Display */}
      <div className={cn(
        "flip-clock-wrapper",
        isCompleted && "flip-clock-completed"
      )}>
        <div className="flip-clock">
          {/* Minutes */}
          <div className="flip-group">
            <FlipDigit 
              value={currentTime.m1} 
              prevValue={prevTime.m1} 
              isFlipping={isFlipping.m1} 
            />
            <FlipDigit 
              value={currentTime.m2} 
              prevValue={prevTime.m2} 
              isFlipping={isFlipping.m2} 
            />
            <span className="flip-label">MIN</span>
          </div>
          
          {/* Separator */}
          <div className="flip-separator">
            <span className={cn(isRunning && "animate-pulse")}>:</span>
          </div>
          
          {/* Seconds */}
          <div className="flip-group">
            <FlipDigit 
              value={currentTime.s1} 
              prevValue={prevTime.s1} 
              isFlipping={isFlipping.s1} 
            />
            <FlipDigit 
              value={currentTime.s2} 
              prevValue={prevTime.s2} 
              isFlipping={isFlipping.s2} 
            />
            <span className="flip-label">SEC</span>
          </div>
        </div>
        
        {/* Status text */}
        <p className={cn(
          "text-center mt-6 text-sm transition-colors",
          isCompleted ? "text-primary font-semibold" : "text-muted-foreground"
        )}>
          {isCompleted ? "Session Complete!" : isRunning ? "Stay focused..." : "Ready to focus"}
        </p>
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
                const newM1 = String(Math.floor(time / 10));
                const newM2 = String(time % 10);
                setPrevTime({ m1: newM1, m2: newM2, s1: "0", s2: "0" });
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
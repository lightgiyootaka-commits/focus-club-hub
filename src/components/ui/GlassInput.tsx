import { cn } from "@/lib/utils";
import { InputHTMLAttributes, forwardRef } from "react";

interface GlassInputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

const GlassInput = forwardRef<HTMLInputElement, GlassInputProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(
          "flex h-12 w-full rounded-xl px-4 py-3",
          "bg-secondary/50 border border-border/50",
          "text-foreground placeholder:text-muted-foreground",
          "transition-all duration-300",
          "focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50",
          "backdrop-blur-sm",
          error && "border-destructive focus:ring-destructive/50",
          className
        )}
        {...props}
      />
    );
  }
);

GlassInput.displayName = "GlassInput";

export { GlassInput };
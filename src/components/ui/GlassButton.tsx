import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes, forwardRef } from "react";

interface GlassButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "primary" | "ghost" | "outline";
  size?: "sm" | "md" | "lg" | "icon";
}

const GlassButton = forwardRef<HTMLButtonElement, GlassButtonProps>(
  ({ className, variant = "default", size = "md", children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "relative inline-flex items-center justify-center font-medium transition-all duration-300 rounded-xl",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          "disabled:pointer-events-none disabled:opacity-50",
          // Variants
          variant === "default" && [
            "bg-secondary/80 text-secondary-foreground border border-border/50",
            "hover:bg-secondary hover:border-border",
            "backdrop-blur-sm"
          ],
          variant === "primary" && [
            "bg-primary text-primary-foreground",
            "hover:bg-primary/90",
            "shadow-glow hover:shadow-[0_0_30px_hsl(var(--primary)/0.4)]"
          ],
          variant === "ghost" && [
            "bg-transparent text-foreground",
            "hover:bg-secondary/50"
          ],
          variant === "outline" && [
            "bg-transparent border border-border text-foreground",
            "hover:bg-secondary/30 hover:border-primary/50"
          ],
          // Sizes
          size === "sm" && "h-9 px-4 text-sm",
          size === "md" && "h-11 px-6 text-base",
          size === "lg" && "h-14 px-8 text-lg",
          size === "icon" && "h-11 w-11",
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);

GlassButton.displayName = "GlassButton";

export { GlassButton };
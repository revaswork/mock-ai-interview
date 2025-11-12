import type React from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { forwardRef } from "react"

interface ArcadeButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "accent"
  size?: "sm" | "md" | "lg"
  children: React.ReactNode
}

export const ArcadeButton = forwardRef<HTMLButtonElement, ArcadeButtonProps>(
  ({ className, variant = "primary", size = "md", children, ...props }, ref) => {
    const variantClasses = {
      primary: "bg-primary text-primary-foreground hover:bg-primary/90",
      secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/90",
      accent: "bg-accent text-accent-foreground hover:bg-accent/90",
    }

    const sizeClasses = {
      sm: "px-4 py-2 text-sm",
      md: "px-6 py-3 text-base",
      lg: "px-8 py-4 text-lg",
    }

    return (
      <Button
        ref={ref}
        className={cn(
          "arcade-button font-bold uppercase tracking-wider pixel-border",
          variantClasses[variant],
          sizeClasses[size],
          "hover:pixel-bounce",
          className,
        )}
        {...props}
      >
        {children}
      </Button>
    )
  },
)

ArcadeButton.displayName = "ArcadeButton"

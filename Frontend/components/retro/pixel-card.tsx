import type React from "react"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { forwardRef } from "react"

interface PixelCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  variant?: "default" | "primary" | "secondary" | "accent"
}

export const PixelCard = forwardRef<HTMLDivElement, PixelCardProps>(
  ({ className, variant = "default", children, ...props }, ref) => {
    const variantClasses = {
      default: "bg-card text-card-foreground",
      primary: "bg-primary/10 text-foreground border-primary",
      secondary: "bg-secondary/10 text-foreground border-secondary",
      accent: "bg-accent/10 text-foreground border-accent",
    }

    return (
      <Card ref={ref} className={cn("pixel-border shadow-none", variantClasses[variant], className)} {...props}>
        {children}
      </Card>
    )
  },
)

PixelCard.displayName = "PixelCard"

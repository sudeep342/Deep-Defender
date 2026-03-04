import * as React from "react"
import { cn } from "@/lib/utils"

const CyberCard = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { variant?: "default" | "destructive" | "success" | "primary" }
>(({ className, variant = "default", ...props }, ref) => {
  const variantStyles = {
    default: "border-border/50 bg-card/80 backdrop-blur-sm",
    destructive: "border-destructive/30 bg-destructive/5 box-glow-destructive",
    success: "border-success/30 bg-success/5 shadow-[0_0_15px_rgba(0,255,0,0.05)]",
    primary: "border-primary/30 bg-primary/5 box-glow-primary",
  };

  return (
    <div
      ref={ref}
      className={cn(
        "rounded-none border relative overflow-hidden transition-all duration-300",
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {/* Top left bracket */}
      <div className={cn(
        "absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2",
        variant === 'default' ? "border-primary/50" : `border-${variant}`
      )} />
      {/* Bottom right bracket */}
      <div className={cn(
        "absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2",
        variant === 'default' ? "border-primary/50" : `border-${variant}`
      )} />
      {props.children}
    </div>
  )
})
CyberCard.displayName = "CyberCard"

export { CyberCard }

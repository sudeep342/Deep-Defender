import { ReactNode } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Shield, ShieldAlert, LogOut, Activity } from "lucide-react";
import { useAnalytics } from "@/hooks/use-events";

export function Layout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const { data: analytics } = useAnalytics();

  const isCritical = analytics?.recentCriticalIp !== null && analytics?.criticalEvents !== undefined && analytics.criticalEvents > 0;

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground scanlines">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-md">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {isCritical ? (
              <ShieldAlert className="w-8 h-8 text-destructive animate-pulse" />
            ) : (
              <Shield className="w-8 h-8 text-primary" />
            )}
            <div className="flex flex-col">
              <h1 className="text-xl font-display font-bold tracking-wider text-primary text-glow-primary leading-none">
                DEEP<span className="text-foreground">DEFENDER</span>
              </h1>
              <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-mono">
                AI NIDS System v2.4
              </span>
            </div>
          </div>

          {user && (
            <div className="flex items-center gap-6">
              <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-secondary/50 rounded-full border border-border">
                <Activity className="w-4 h-4 text-success animate-pulse" />
                <span className="text-xs font-mono text-muted-foreground">SYSTEM ONLINE</span>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-medium">{user.firstName} {user.lastName}</p>
                  <p className="text-xs text-muted-foreground font-mono">{user.email}</p>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => logout()}
                  className="border-primary/20 hover:bg-primary/10 hover:text-primary transition-colors rounded-none"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  LOGOUT
                </Button>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-8 relative">
        {/* Subtle grid background */}
        <div className="absolute inset-0 cyber-grid -z-10 pointer-events-none opacity-50" />
        {children}
      </main>
    </div>
  );
}

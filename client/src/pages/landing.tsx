import { Button } from "@/components/ui/button";
import { ShieldAlert, Network, Lock, Cpu } from "lucide-react";
import { Layout } from "@/components/layout";

export default function LandingPage() {
  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  return (
    <Layout>
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-8rem)]">
        
        {/* Decorative Radar Element */}
        <div className="relative w-64 h-64 mb-12 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full border border-primary/20" />
          <div className="absolute inset-4 rounded-full border border-primary/30" />
          <div className="absolute inset-12 rounded-full border border-primary/40 border-dashed" />
          <div className="absolute inset-0 rounded-full radar-sweep rounded-full mix-blend-screen" />
          
          {/* Central Core */}
          <div className="absolute inset-0 m-auto w-4 h-4 rounded-full bg-primary shadow-[0_0_20px_var(--primary)] animate-pulse" />
          
          {/* Floating blips */}
          <div className="absolute top-1/4 left-1/4 w-2 h-2 rounded-full bg-destructive shadow-[0_0_10px_var(--destructive)] animate-ping" />
          <div className="absolute bottom-1/3 right-1/4 w-2 h-2 rounded-full bg-success shadow-[0_0_10px_var(--success)] opacity-70" />
        </div>

        <div className="text-center max-w-2xl mx-auto space-y-6 relative z-10">
          <h1 className="text-5xl md:text-7xl font-display font-black tracking-tight">
            DEEP<span className="text-primary text-glow-primary">DEFENDER</span>
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground font-mono leading-relaxed">
            Neural-network powered intrusion detection. Classifying network anomalies in real-time with hybrid CNN-ANN architecture.
          </p>

          <div className="grid grid-cols-3 gap-4 py-8 border-y border-border/50 my-8 bg-background/50 backdrop-blur-sm">
            <div className="flex flex-col items-center gap-2">
              <Network className="w-6 h-6 text-primary" />
              <span className="text-xs font-mono text-muted-foreground">PACKET CAPTURE</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <Cpu className="w-6 h-6 text-primary" />
              <span className="text-xs font-mono text-muted-foreground">AI CLASSIFICATION</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <ShieldAlert className="w-6 h-6 text-primary" />
              <span className="text-xs font-mono text-muted-foreground">THREAT ALERT</span>
            </div>
          </div>

          <Button 
            onClick={handleLogin}
            size="lg" 
            className="w-full sm:w-auto text-lg h-14 px-8 font-display tracking-widest rounded-none border border-primary bg-primary/10 hover:bg-primary/20 text-primary box-glow-primary transition-all duration-300"
          >
            <Lock className="w-5 h-5 mr-3" />
            INITIALIZE AUTHENTICATION
          </Button>
        </div>
      </div>
    </Layout>
  );
}

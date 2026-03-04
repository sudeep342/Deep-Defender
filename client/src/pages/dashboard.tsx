import { useEvents, useAnalytics } from "@/hooks/use-events";
import { Layout } from "@/components/layout";
import { CyberCard } from "@/components/ui/cyber-card";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Activity, ShieldAlert, ShieldCheck, Target, Server, Trash2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { api } from "@shared/routes";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer
} from "recharts";

export default function Dashboard() {
  const { data: events, isLoading: isLoadingEvents } = useEvents();
  const { data: analytics, isLoading: isLoadingAnalytics } = useAnalytics();
  const { toast } = useToast();
  const [isClassifying, setIsClassifying] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const form = useForm({
    resolver: zodResolver(api.events.classify.input),
    defaultValues: {
      sourceIp: "",
      protocol: "TCP",
    },
  });

  const onReset = async () => {
    if (!confirm("Are you sure you want to clear all network event logs? This action cannot be undone.")) return;
    
    setIsResetting(true);
    try {
      await apiRequest("POST", api.events.reset.path);
      toast({
        title: "Database Reset",
        description: "All network event logs have been cleared.",
      });
      queryClient.invalidateQueries({ queryKey: [api.events.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.events.analytics.path] });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to reset database.",
        variant: "destructive",
      });
    } finally {
      setIsResetting(false);
    }
  };

  // Prepare chart data from events
  const chartData = useMemo(() => {
    if (!events) return [];
    
    const groups: Record<string, { time: string, normal: number, critical: number }> = {};
    
    events.slice().reverse().forEach(event => {
      const date = new Date(event.timestamp);
      date.setSeconds(Math.floor(date.getSeconds() / 10) * 10);
      date.setMilliseconds(0);
      const timeStr = format(date, "HH:mm:ss");
      
      if (!groups[timeStr]) {
        groups[timeStr] = { time: timeStr, normal: 0, critical: 0 };
      }
      
      if (event.classification === "Critical") {
        groups[timeStr].critical++;
      } else {
        groups[timeStr].normal++;
      }
    });
    
    return Object.values(groups).slice(-20);
  }, [events]);

  const onClassify = async (values: any) => {
    setIsClassifying(true);
    try {
      const res = await apiRequest("POST", api.events.classify.path, values);
      const event = await res.json();
      
      toast({
        title: "Classification Complete",
        description: `IP ${event.sourceIp} classified as ${event.classification} (${(event.confidence * 100).toFixed(1)}% confidence)`,
        variant: event.classification === "Critical" ? "destructive" : "default",
      });

      queryClient.invalidateQueries({ queryKey: [api.events.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.events.analytics.path] });
      form.reset();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to classify packet. Please check the IP address format.",
        variant: "destructive",
      });
    } finally {
      setIsClassifying(false);
    }
  };

  const formatConfidence = (conf: number) => `${(conf * 100).toFixed(1)}%`;

  return (
    <Layout>
      <div className="space-y-6">
        
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-2xl font-display text-primary tracking-wide flex items-center gap-2">
            <Activity className="w-6 h-6" />
            THREAT TELEMETRY
          </h2>
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={onReset}
              disabled={isResetting}
              className="border-destructive/30 text-destructive hover:bg-destructive/10 font-mono text-xs rounded-none h-8"
            >
              <Trash2 className="w-3 h-3 mr-2" />
              {isResetting ? "CLEARING..." : "RESET DATABASE"}
            </Button>
            <div className="flex items-center gap-2 px-3 py-1 bg-secondary/30 border border-border text-xs font-mono h-8">
              <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
              LIVE STREAM ACTIVE
            </div>
          </div>
        </div>

        {/* Analytics Overview Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <CyberCard className="p-6 flex flex-col justify-between" variant="primary">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <p className="text-sm font-mono text-primary/80">TOTAL PACKETS</p>
                {isLoadingAnalytics ? (
                  <Skeleton className="h-10 w-24 bg-primary/20" />
                ) : (
                  <p className="text-4xl font-display font-bold text-glow-primary text-primary">
                    {analytics?.totalEvents.toLocaleString() || 0}
                  </p>
                )}
              </div>
              <Server className="w-8 h-8 text-primary/50" />
            </div>
          </CyberCard>

          <CyberCard className="p-6 flex flex-col justify-between" variant="success">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <p className="text-sm font-mono text-success/80">NORMAL TRAFFIC</p>
                {isLoadingAnalytics ? (
                  <Skeleton className="h-10 w-24 bg-success/20" />
                ) : (
                  <p className="text-4xl font-display font-bold text-success text-glow-success">
                    {analytics?.normalEvents.toLocaleString() || 0}
                  </p>
                )}
              </div>
              <ShieldCheck className="w-8 h-8 text-success/50" />
            </div>
          </CyberCard>

          <CyberCard className="p-6 flex flex-col justify-between" variant="destructive">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <p className="text-sm font-mono text-destructive/80">CRITICAL ANOMALIES</p>
                {isLoadingAnalytics ? (
                  <Skeleton className="h-10 w-24 bg-destructive/20" />
                ) : (
                  <p className="text-4xl font-display font-bold text-destructive text-glow-destructive">
                    {analytics?.criticalEvents.toLocaleString() || 0}
                  </p>
                )}
              </div>
              <ShieldAlert className="w-8 h-8 text-destructive/50" />
            </div>
          </CyberCard>

          <CyberCard className="p-6 flex flex-col justify-between" variant={analytics?.recentCriticalIp ? "destructive" : "default"}>
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <p className="text-sm font-mono text-muted-foreground">LAST THREAT ORIGIN</p>
                {isLoadingAnalytics ? (
                  <Skeleton className="h-8 w-32 bg-border" />
                ) : (
                  <p className="text-xl font-mono mt-2 text-foreground">
                    {analytics?.recentCriticalIp || "NONE DETECTED"}
                  </p>
                )}
              </div>
              <Target className={analytics?.recentCriticalIp ? "w-8 h-8 text-destructive/50" : "w-8 h-8 text-muted-foreground"} />
            </div>
          </CyberCard>
        </div>

        {/* Traffic Visualization Graph */}
        <CyberCard className="p-6 h-[400px]">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary" />
              <h3 className="font-display tracking-wider text-sm text-primary">TRAFFIC CLASSIFICATION TRENDS</h3>
            </div>
            <div className="flex gap-4 text-[10px] font-mono">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-success rounded-full" />
                <span className="text-success">NORMAL</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-destructive rounded-full" />
                <span className="text-destructive">CRITICAL</span>
              </div>
            </div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorNormal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--success))" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="hsl(var(--success))" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorCritical" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--destructive))" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="hsl(var(--destructive))" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} opacity={0.2} />
                <XAxis dataKey="time" stroke="hsl(var(--muted-foreground))" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(val) => Math.floor(val)} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'hsl(var(--background))', borderColor: 'hsl(var(--border))', fontSize: '12px', fontFamily: 'var(--font-mono)' }}
                  itemStyle={{ padding: '2px 0' }}
                />
                <Area type="monotone" dataKey="normal" stroke="hsl(var(--success))" fillOpacity={1} fill="url(#colorNormal)" strokeWidth={2} isAnimationActive={false} />
                <Area type="monotone" dataKey="critical" stroke="hsl(var(--destructive))" fillOpacity={1} fill="url(#colorCritical)" strokeWidth={2} isAnimationActive={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CyberCard>

        {/* Manual Testing Form */}
        <CyberCard className="p-6 border-primary/20 bg-primary/5">
          <div className="flex items-center gap-2 mb-4">
            <ShieldAlert className="w-5 h-5 text-primary" />
            <h3 className="font-display tracking-wider text-sm text-primary">MANUAL PACKET CLASSIFICATION</h3>
          </div>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onClassify)} className="flex flex-col md:flex-row gap-4 items-end">
              <FormField
                control={form.control}
                name="sourceIp"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel className="text-xs font-mono text-muted-foreground">SOURCE IP ADDRESS</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. 192.168.1.1" {...field} className="bg-background/50 border-primary/20 font-mono" />
                    </FormControl>
                    <FormMessage className="text-[10px]" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="protocol"
                render={({ field }) => (
                  <FormItem className="w-full md:w-48">
                    <FormLabel className="text-xs font-mono text-muted-foreground">PROTOCOL</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-background/50 border-primary/20 font-mono">
                          <SelectValue placeholder="Select protocol" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-background border-primary/20 font-mono">
                        {["TCP", "UDP", "ICMP", "HTTP", "HTTPS", "DNS"].map(p => (
                          <SelectItem key={p} value={p}>{p}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage className="text-[10px]" />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isClassifying} className="w-full md:w-auto bg-primary text-primary-foreground font-display tracking-widest hover:bg-primary/90">
                {isClassifying ? "ANALYZING..." : "TEST CLASSIFICATION"}
              </Button>
            </form>
          </Form>
        </CyberCard>

        {/* Live Traffic Log */}
        <CyberCard className="mt-8 flex flex-col h-[500px]">
          <div className="px-6 py-4 border-b border-border/50 bg-secondary/20 flex justify-between items-center">
            <h3 className="font-display tracking-wider text-sm text-muted-foreground">NETWORK EVENT LOG</h3>
            <span className="text-xs font-mono text-primary/70">polling: 2000ms</span>
          </div>
          
          <div className="flex-1 overflow-auto p-0 custom-scrollbar">
            <Table>
              <TableHeader className="bg-background/95 sticky top-0 z-10 backdrop-blur">
                <TableRow className="border-border/50 hover:bg-transparent">
                  <TableHead className="font-mono text-xs text-primary w-[180px]">TIMESTAMP</TableHead>
                  <TableHead className="font-mono text-xs text-primary">SOURCE IP</TableHead>
                  <TableHead className="font-mono text-xs text-primary">DEST IP</TableHead>
                  <TableHead className="font-mono text-xs text-primary">PROTO</TableHead>
                  <TableHead className="font-mono text-xs text-primary text-right">SIZE (B)</TableHead>
                  <TableHead className="font-mono text-xs text-primary text-center">CLASSIFICATION</TableHead>
                  <TableHead className="font-mono text-xs text-primary text-right">CONFIDENCE</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="font-mono text-sm">
                {isLoadingEvents ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-16 ml-auto" /></TableCell>
                      <TableCell><Skeleton className="h-6 w-20 mx-auto" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-12 ml-auto" /></TableCell>
                    </TableRow>
                  ))
                ) : !events || events.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-12 text-muted-foreground font-sans">
                      No network events captured yet. Awaiting traffic...
                    </TableCell>
                  </TableRow>
                ) : (
                  events.map((event) => {
                    const isCritical = event.classification === 'Critical';
                    return (
                      <TableRow key={event.id} className={`border-border/30 transition-colors ${isCritical ? 'bg-destructive/5 hover:bg-destructive/10' : 'hover:bg-secondary/40'}`}>
                        <TableCell className="text-muted-foreground">{format(new Date(event.timestamp), "HH:mm:ss.SSS")}</TableCell>
                        <TableCell className={isCritical ? "text-destructive font-bold" : ""}>{event.sourceIp}</TableCell>
                        <TableCell>{event.destinationIp}</TableCell>
                        <TableCell className="text-primary/70">{event.protocol}</TableCell>
                        <TableCell className="text-right text-muted-foreground">{event.packetSize}</TableCell>
                        <TableCell className="text-center">
                          <Badge variant="outline" className={`rounded-none border px-2 py-0.5 ${isCritical ? "border-destructive text-destructive bg-destructive/10 box-glow-destructive" : "border-success text-success bg-success/10"}`}>
                            {event.classification.toUpperCase()}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <span className={event.confidence > 0.9 ? "text-primary text-glow-primary font-bold" : "text-muted-foreground"}>{formatConfidence(event.confidence)}</span>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CyberCard>
      </div>
    </Layout>
  );
}

import { useQuery } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { z } from "zod";

// Hook to fetch and poll live network events
export function useEvents() {
  return useQuery({
    queryKey: [api.events.list.path],
    queryFn: async () => {
      const res = await fetch(api.events.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch events");
      const data = await res.json();
      
      // Parse data to ensure it matches the schema contract
      const parsed = api.events.list.responses[200].safeParse(data);
      if (!parsed.success) {
        console.error("[Zod] Events validation failed:", parsed.error.format());
        // Fallback to returning raw data if validation fails but request succeeded
        // This prevents the UI from totally breaking if schema is slightly mismatched during dev
        return data as z.infer<typeof api.events.list.responses[200]>; 
      }
      return parsed.data;
    },
    // Poll every 2 seconds for live updates
    refetchInterval: 2000,
  });
}

// Hook to fetch and poll analytics overview
export function useAnalytics() {
  return useQuery({
    queryKey: [api.events.analytics.path],
    queryFn: async () => {
      const res = await fetch(api.events.analytics.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch analytics");
      const data = await res.json();
      
      const parsed = api.events.analytics.responses[200].safeParse(data);
      if (!parsed.success) {
        console.error("[Zod] Analytics validation failed:", parsed.error.format());
        return data as z.infer<typeof api.events.analytics.responses[200]>;
      }
      return parsed.data;
    },
    // Poll every 2 seconds to keep stats in sync with events
    refetchInterval: 2000,
  });
}

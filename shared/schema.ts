import { pgTable, text, serial, integer, timestamp, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Re-export auth models so Drizzle picks them up
export * from "./models/auth";

// === TABLE DEFINITIONS ===
export const networkEvents = pgTable("network_events", {
  id: serial("id").primaryKey(),
  sourceIp: text("source_ip").notNull(),
  destinationIp: text("destination_ip").notNull(),
  protocol: text("protocol").notNull(),
  packetSize: integer("packet_size").notNull(),
  classification: text("classification").notNull(), // 'Normal' or 'Critical'
  confidence: real("confidence").notNull(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

// === BASE SCHEMAS ===
export const insertNetworkEventSchema = createInsertSchema(networkEvents).omit({ id: true, timestamp: true });

// === EXPLICIT API CONTRACT TYPES ===
export type InsertNetworkEvent = z.infer<typeof insertNetworkEventSchema>;
export type NetworkEvent = typeof networkEvents.$inferSelect;

export type CreateNetworkEventRequest = InsertNetworkEvent;
export type NetworkEventResponse = NetworkEvent;
export type NetworkEventsListResponse = NetworkEvent[];

export interface DashboardAnalytics {
  totalEvents: number;
  criticalEvents: number;
  normalEvents: number;
  recentCriticalIp: string | null;
}

import { db } from "./db";
import { networkEvents, type NetworkEvent, type InsertNetworkEvent, type DashboardAnalytics } from "@shared/schema";
import { desc, sql } from "drizzle-orm";

export interface IStorage {
  getNetworkEvents(limit?: number): Promise<NetworkEvent[]>;
  createNetworkEvent(event: InsertNetworkEvent): Promise<NetworkEvent>;
  getDashboardAnalytics(): Promise<DashboardAnalytics>;
  resetEvents(): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getNetworkEvents(limit = 100): Promise<NetworkEvent[]> {
    return await db.select()
      .from(networkEvents)
      .orderBy(desc(networkEvents.timestamp))
      .limit(limit);
  }

  async createNetworkEvent(event: InsertNetworkEvent): Promise<NetworkEvent> {
    const [newEvent] = await db.insert(networkEvents).values(event).returning();
    return newEvent;
  }

  async resetEvents(): Promise<void> {
    await db.delete(networkEvents);
  }

  async getDashboardAnalytics(): Promise<DashboardAnalytics> {
    const result = await db.execute<{
      total: number;
      normal: number;
      critical: number;
    }>(sql`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN classification = 'Normal' THEN 1 ELSE 0 END) as normal,
        SUM(CASE WHEN classification = 'Critical' THEN 1 ELSE 0 END) as critical
      FROM network_events
    `);

    const row = result.rows[0];

    const recentCritical = await db.execute<{ source_ip: string }>(sql`
      SELECT source_ip 
      FROM network_events 
      WHERE classification = 'Critical' 
      ORDER BY timestamp DESC 
      LIMIT 1
    `);

    return {
      totalEvents: Number(row.total || 0),
      normalEvents: Number(row.normal || 0),
      criticalEvents: Number(row.critical || 0),
      recentCriticalIp: recentCritical.rows.length > 0 ? recentCritical.rows[0].source_ip : null,
    };
  }
}

export const storage = new DatabaseStorage();

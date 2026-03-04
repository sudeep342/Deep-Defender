import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { registerAuthRoutes, setupAuth, isAuthenticated } from "./replit_integrations/auth";

// Packet Generator Simulator
function startPacketGenerator() {
  const protocols = ["TCP", "UDP", "ICMP", "HTTP", "HTTPS", "DNS"];
  
  setInterval(async () => {
    // Simulate AI classification
    const isCritical = Math.random() > 0.85; // 15% chance of critical
    const classification = isCritical ? "Critical" : "Normal";
    const confidence = isCritical ? (0.8 + Math.random() * 0.19) : (0.9 + Math.random() * 0.09);
    
    // Generate random IPs
    const srcIp = `192.168.1.${Math.floor(Math.random() * 255)}`;
    const destIp = isCritical ? `10.0.0.${Math.floor(Math.random() * 50)}` : `192.168.1.${Math.floor(Math.random() * 255)}`;
    const protocol = protocols[Math.floor(Math.random() * protocols.length)];
    const packetSize = Math.floor(Math.random() * 1500) + 40;

    try {
      await storage.createNetworkEvent({
        sourceIp: srcIp,
        destinationIp: destIp,
        protocol,
        packetSize,
        classification,
        confidence,
      });
    } catch (err) {
      console.error("Failed to generate packet:", err);
    }
  }, 2000);
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Setup Authentication
  await setupAuth(app);
  registerAuthRoutes(app);

  // API Routes (protected by isAuthenticated)
  app.get(api.events.list.path, isAuthenticated, async (req, res) => {
    try {
      const events = await storage.getNetworkEvents(50); // Get last 50 events
      res.json(events);
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch events" });
    }
  });

  app.get(api.events.analytics.path, isAuthenticated, async (req, res) => {
    try {
      const analytics = await storage.getDashboardAnalytics();
      res.json(analytics);
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch analytics" });
    }
  });

  app.post(api.events.classify.path, isAuthenticated, async (req, res) => {
    try {
      const input = api.events.classify.input.parse(req.body);
      
      // Manual classification logic (simulating model inference)
      const isCritical = input.sourceIp.startsWith("10.") || Math.random() > 0.8;
      const classification = isCritical ? "Critical" : "Normal";
      const confidence = 0.85 + Math.random() * 0.14;
      const packetSize = Math.floor(Math.random() * 1000) + 64;

      const event = await storage.createNetworkEvent({
        sourceIp: input.sourceIp,
        destinationIp: "127.0.0.1",
        protocol: input.protocol,
        packetSize,
        classification,
        confidence,
      });

      res.json(event);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post(api.events.reset.path, isAuthenticated, async (req, res) => {
    try {
      await storage.resetEvents();
      res.json({ message: "Database reset successful" });
    } catch (err) {
      res.status(500).json({ message: "Failed to reset database" });
    }
  });

  // Start background generator
  startPacketGenerator();

  return httpServer;
}

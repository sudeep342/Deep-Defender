import { z } from 'zod';
import { insertNetworkEventSchema } from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

const networkEventSchema = z.object({
  id: z.number(),
  sourceIp: z.string(),
  destinationIp: z.string(),
  protocol: z.string(),
  packetSize: z.number(),
  classification: z.string(),
  confidence: z.number(),
  timestamp: z.union([z.string(), z.date()]),
});

export const api = {
  events: {
    list: {
      method: 'GET' as const,
      path: '/api/events' as const,
      responses: {
        200: z.array(networkEventSchema),
      },
    },
    analytics: {
      method: 'GET' as const,
      path: '/api/analytics' as const,
      responses: {
        200: z.object({
          totalEvents: z.number(),
          criticalEvents: z.number(),
          normalEvents: z.number(),
          recentCriticalIp: z.string().nullable(),
        }),
      },
    },
    classify: {
      method: 'POST' as const,
      path: '/api/classify' as const,
      input: z.object({
        sourceIp: z.string().ip(),
        protocol: z.enum(["TCP", "UDP", "ICMP", "HTTP", "HTTPS", "DNS"]),
      }),
      responses: {
        200: networkEventSchema,
        400: errorSchemas.validation,
      },
    },
    reset: {
      method: 'POST' as const,
      path: '/api/events/reset' as const,
      responses: {
        200: z.object({ message: z.string() }),
      },
    }
  },
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}

export type NetworkEventResponse = z.infer<typeof api.events.list.responses[200]>[number];
export type DashboardAnalyticsResponse = z.infer<typeof api.events.analytics.responses[200]>;
export type ClassifyInput = z.infer<typeof api.events.classify.input>;

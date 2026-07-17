import { z } from 'zod';

export const chatMessageSchema = z.object({
  message: z.string().min(1).max(2000).trim(),
  sessionId: z.string().uuid().optional(),
  language: z.enum(['en', 'es', 'fr', 'pt', 'ar', 'hi', 'ja', 'de', 'it', 'zh']).default('en'),
  history: z.array(z.object({ role: z.string(), content: z.string() })).optional(),
});

export const navigationRequestSchema = z.object({
  origin: z.object({
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180),
  }),
  destination: z.string().min(1),
  accessible: z.boolean().default(false),
  crowdAware: z.boolean().default(true),
});

export const emergencyReportSchema = z.object({
  type: z.enum(['medical', 'security', 'fire', 'weather', 'lost_child']),
  severity: z.enum(['low', 'medium', 'high', 'critical']),
  latitude: z.number(),
  longitude: z.number(),
  description: z.string().min(10).max(1000),
});

export const sosAlertSchema = z.object({
  latitude: z.number(),
  longitude: z.number(),
  type: z.enum(['personal', 'medical', 'security']).default('personal'),
  message: z.string().max(500).optional(),
});

export const translateRequestSchema = z.object({
  text: z.string().min(1).max(5000),
  targetLanguage: z.enum(['en', 'es', 'fr', 'pt', 'ar', 'hi', 'ja', 'de', 'it', 'zh']),
  sourceLanguage: z.enum(['en', 'es', 'fr', 'pt', 'ar', 'hi', 'ja', 'de', 'it', 'zh']).optional(),
});

export const volunteerTaskSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().min(1).max(1000),
  priority: z.enum(['low', 'medium', 'high']),
  location: z.string().min(1),
  startTime: z.string(),
  endTime: z.string(),
});

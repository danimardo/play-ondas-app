import { z } from 'zod';

export const LogLevelSchema = z.enum(['trace', 'debug', 'info', 'warn', 'error', 'fatal', 'silent']);
export type LogLevel = z.infer<typeof LogLevelSchema>;

export const LogProcessSchema = z.enum(['backend', 'client']);
export type LogProcess = z.infer<typeof LogProcessSchema>;

export const LogEntrySchema = z.object({
  time: z.string(),           // ISO-8601 UTC, e.g. "2026-06-13T12:00:00.000Z"
  localTime: z.string(),      // "DD/MM/YYYY HH:mm:ss" Europe/Madrid
  timezone: z.literal('Europe/Madrid'),
  level: LogLevelSchema,
  event: z.string(),          // dot-separated stable name
  process: LogProcessSchema,
  context: z.record(z.string(), z.unknown()).optional(),
});
export type LogEntry = z.infer<typeof LogEntrySchema>;

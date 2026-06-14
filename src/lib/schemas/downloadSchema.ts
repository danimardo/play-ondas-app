import { z } from 'zod';
import { WaveIdSchema } from './waveSchema';

export const DownloadFileStatusSchema = z.enum(['pending', 'downloading', 'completed', 'failed']);
export type DownloadFileStatus = z.infer<typeof DownloadFileStatusSchema>;

export const FileDownloadProgressSchema = z.object({
  waveId: WaveIdSchema,
  progressPercent: z.number().min(0).max(100),
  bytesDownloaded: z.number().nonnegative(),
  totalBytes: z.number().nonnegative(),
  status: DownloadFileStatusSchema,
});
export type FileDownloadProgress = z.infer<typeof FileDownloadProgressSchema>;

export const GlobalDownloadStatusSchema = z.enum([
  'idle',
  'checking',
  'downloading',
  'completed',
  'failed',
]);
export type GlobalDownloadStatus = z.infer<typeof GlobalDownloadStatusSchema>;

export const GlobalDownloadProgressSchema = z.object({
  currentFileIndex: z.number().nonnegative(),
  totalFiles: z.number().positive(),
  totalBytesDownloaded: z.number().nonnegative(),
  totalBytesEstimated: z.number().nonnegative(),
  globalProgressPercent: z.number().min(0).max(100),
  status: GlobalDownloadStatusSchema,
  error: z.string().nullish(),
  // Record parcial: Rust solo envía las ondas que faltan por descargar, no las 5 siempre
  files: z.record(z.string(), FileDownloadProgressSchema),
});
export type GlobalDownloadProgress = z.infer<typeof GlobalDownloadProgressSchema>;

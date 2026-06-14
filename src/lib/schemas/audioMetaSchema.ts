import { z } from 'zod';
import { WaveIdSchema } from './waveSchema';

export const AudioSourceSchema = z.enum([
  'downloaded-default',
  'bundled-default',
  'custom',
  'unavailable',
]);
export type AudioSource = z.infer<typeof AudioSourceSchema>;

export const WaveAudioAssociationSchema = z.object({
  waveId: WaveIdSchema,
  source: AudioSourceSchema,
  resolvedPath: z.string().nullable(),
  displayName: z.string(),
});
export type WaveAudioAssociation = z.infer<typeof WaveAudioAssociationSchema>;

export const CustomAudioFileSchema = z.object({
  waveId: WaveIdSchema,
  displayName: z.string(),
  format: z.enum(['mp3', 'wav', 'ogg', 'flac', 'm4a']),
  sizeBytes: z.number().positive(),
  sourcePath: z.string(),
  isValid: z.boolean(),
});
export type CustomAudioFile = z.infer<typeof CustomAudioFileSchema>;

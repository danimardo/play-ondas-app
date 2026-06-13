import { z } from 'zod';
import { WaveIdSchema } from './waveSchema';

export const ThemeSchema = z.enum(['auto', 'light', 'dark']);
export type Theme = z.infer<typeof ThemeSchema>;

export const CustomAudioMapSchema = z.object({
  gamma: z.string().nullable(),
  beta: z.string().nullable(),
  alfa: z.string().nullable(),
  'theta-delta': z.string().nullable(),
  'brown-noise': z.string().nullable(),
});
export type CustomAudioMap = z.infer<typeof CustomAudioMapSchema>;

export const UserSettingsSchema = z.object({
  schemaVersion: z.literal('1.0.0'),
  selectedWave: WaveIdSchema,
  volume: z.number().int().min(0).max(100),
  theme: ThemeSchema,
  loop: z.literal(true), // always true in v1
  minimizeToTrayOnClose: z.boolean(),
  startMinimized: z.boolean(),
  closeDialogSeen: z.boolean(),
  customAudio: CustomAudioMapSchema,
});
export type UserSettings = z.infer<typeof UserSettingsSchema>;

export const DEFAULT_SETTINGS: UserSettings = {
  schemaVersion: '1.0.0',
  selectedWave: 'gamma',
  volume: 70, // FR-010: volumen por defecto cuando no hay settings previos
  theme: 'auto',
  loop: true,
  minimizeToTrayOnClose: true,
  startMinimized: false,
  closeDialogSeen: false,
  customAudio: {
    gamma: null,
    beta: null,
    alfa: null,
    'theta-delta': null,
    'brown-noise': null,
  },
};

export const ValidationErrorSchema = z.object({
  field: z.string(),
  code: z.string(),
  message: z.string(),
});
export type ValidationError = z.infer<typeof ValidationErrorSchema>;

export const LoadSettingsResponseSchema = z.discriminatedUnion('ok', [
  z.object({ ok: z.literal(true), settings: UserSettingsSchema }),
  z.object({ ok: z.literal(false), error: ValidationErrorSchema, defaults: UserSettingsSchema }),
]);
export type LoadSettingsResponse = z.infer<typeof LoadSettingsResponseSchema>;

export const PersistSettingsResponseSchema = z.discriminatedUnion('ok', [
  z.object({ ok: z.literal(true) }),
  z.object({ ok: z.literal(false), error: ValidationErrorSchema }),
]);
export type PersistSettingsResponse = z.infer<typeof PersistSettingsResponseSchema>;

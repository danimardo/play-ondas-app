import { z } from 'zod';
import { WaveIdSchema } from './waveSchema';

export const ThemeSchema = z.enum(['auto', 'light', 'dark']);
export type Theme = z.infer<typeof ThemeSchema>;

export const ShortcutsSchema = z.object({
  toggle: z.string(),
  pause: z.string(),
  stop: z.string(),
});
export type Shortcuts = z.infer<typeof ShortcutsSchema>;

export const DEFAULT_SHORTCUTS: Shortcuts = {
  toggle: 'ctrl+shift+p',
  pause: 'ctrl+shift+x',
  stop: 'ctrl+shift+s',
};

export const CustomAudioMapSchema = z.object({
  gamma: z.string().nullable(),
  beta: z.string().nullable(),
  alfa: z.string().nullable(),
  theta: z.string().nullable().default(null),
  delta: z.string().nullable().default(null),
  'brown-noise': z.string().nullable(),
  'white-noise': z.string().nullable().default(null),
  'pink-noise': z.string().nullable().default(null),
  'green-noise': z.string().nullable().default(null),
  fireplace: z.string().nullable().default(null),
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
  // Shortcuts (optional in older settings files — defaults applied by Zod)
  shortcuts: ShortcutsSchema.default(DEFAULT_SHORTCUTS),
  // Window geometry (optional — absent in older settings files)
  windowX: z.number().int().optional(),
  windowY: z.number().int().optional(),
  windowWidth: z.number().int().optional(),
  windowHeight: z.number().int().optional(),
  // Suprimir el diálogo de oferta de descarga en cada arranque
  skipAudioDownloadOffer: z.boolean().default(false),
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
    theta: null,
    delta: null,
    'brown-noise': null,
    'white-noise': null,
    'pink-noise': null,
    'green-noise': null,
    fireplace: null,
  },
  shortcuts: DEFAULT_SHORTCUTS,
  skipAudioDownloadOffer: false,
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

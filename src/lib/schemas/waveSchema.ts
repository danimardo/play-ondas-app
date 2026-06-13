import { z } from 'zod';

export const WaveIdSchema = z.enum([
  'gamma',
  'beta',
  'alfa',
  'theta-delta',
  'brown-noise',
]);

export type WaveId = z.infer<typeof WaveIdSchema>;

export const WaveCategorySchema = z.object({
  id: WaveIdSchema,
  name: z.string(),
  frequency: z.string(),
  color: z.string(),
  shortDescription: z.string(),
  recommendedFor: z.string(),
  caution: z.string(),
});

export type WaveCategory = z.infer<typeof WaveCategorySchema>;

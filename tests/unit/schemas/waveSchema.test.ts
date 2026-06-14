import { describe, it, expect } from 'vitest';
import { WaveIdSchema } from '../../../src/lib/schemas/waveSchema';

describe('Wave schema validation', () => {
  it('should validate all 5 canonical wave IDs', () => {
    expect(WaveIdSchema.safeParse('gamma').success).toBe(true);
    expect(WaveIdSchema.safeParse('beta').success).toBe(true);
    expect(WaveIdSchema.safeParse('alfa').success).toBe(true);
    expect(WaveIdSchema.safeParse('theta-delta').success).toBe(true);
    expect(WaveIdSchema.safeParse('brown-noise').success).toBe(true);
  });

  it('should reject invalid wave IDs', () => {
    expect(WaveIdSchema.safeParse('alpha').success).toBe(false);
    expect(WaveIdSchema.safeParse('theta').success).toBe(false);
    expect(WaveIdSchema.safeParse('delta').success).toBe(false);
    expect(WaveIdSchema.safeParse('pink-noise').success).toBe(false);
  });
});

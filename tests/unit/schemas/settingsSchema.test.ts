import { describe, it, expect } from 'vitest';
import { UserSettingsSchema, DEFAULT_SETTINGS } from '../../../src/lib/schemas/settingsSchema';

describe('Settings schema validation', () => {
  it('should parse valid default settings', () => {
    const parsed = UserSettingsSchema.safeParse(DEFAULT_SETTINGS);
    expect(parsed.success).toBe(true);
  });

  it('should reject settings with mismatch version', () => {
    const invalid = {
      ...DEFAULT_SETTINGS,
      schemaVersion: '1.0.1',
    };
    const parsed = UserSettingsSchema.safeParse(invalid);
    expect(parsed.success).toBe(false);
  });

  it('should reject invalid volume level', () => {
    const invalid = {
      ...DEFAULT_SETTINGS,
      volume: 105,
    };
    const parsed = UserSettingsSchema.safeParse(invalid);
    expect(parsed.success).toBe(false);
  });
});

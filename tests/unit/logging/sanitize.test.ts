import { describe, it, expect } from 'vitest';
import { sanitizeForLog } from '../../../src/lib/logging/sanitize';

describe('Logging sanitize', () => {
  it('should redact sensitive keys case-insensitively', () => {
    const input = {
      password: 'my-password',
      token: 'secret-token',
      apiKey: 'my-api-key',
      normalField: 'safe-value',
      nested: {
        privateKey: 'key-data',
        auth: 'authorized',
      },
    };

    const expected = {
      password: '[REDACTED]',
      token: '[REDACTED]',
      apiKey: '[REDACTED]',
      normalField: 'safe-value',
      nested: {
        privateKey: '[REDACTED]',
        auth: '[REDACTED]',
      },
    };

    expect(sanitizeForLog(input)).toEqual(expected);
  });

  it('should redact keys inside arrays', () => {
    const input = [
      { key: 'secret', normal: 'safe' },
      { bearer: 'jwt-bearer' }
    ];

    const expected = [
      { key: '[REDACTED]', normal: 'safe' },
      { bearer: '[REDACTED]' }
    ];

    expect(sanitizeForLog(input)).toEqual(expected);
  });

  it('should handle errors by sanitizing stacks', () => {
    const err = new Error('Test error message');
    const sanitized: any = sanitizeForLog(err);
    expect(sanitized.name).toBe('Error');
    expect(sanitized.message).toBe('Test error message');
    expect(sanitized.stack).toBe('[STACK TRACE REDACTED]');
  });
});

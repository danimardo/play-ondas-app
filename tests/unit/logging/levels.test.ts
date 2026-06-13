import { describe, it, expect } from 'vitest';
import { isEnabled } from '../../../src/lib/logging/levels';

describe('Logging levels isEnabled', () => {
  it('should correctly prioritize levels', () => {
    // Current trace: all targets enabled
    expect(isEnabled('trace', 'trace')).toBe(true);
    expect(isEnabled('trace', 'debug')).toBe(true);
    expect(isEnabled('trace', 'info')).toBe(true);
    expect(isEnabled('trace', 'warn')).toBe(true);
    expect(isEnabled('trace', 'error')).toBe(true);
    expect(isEnabled('trace', 'fatal')).toBe(true);
    expect(isEnabled('trace', 'silent')).toBe(true);

    // Current info
    expect(isEnabled('info', 'trace')).toBe(false);
    expect(isEnabled('info', 'debug')).toBe(false);
    expect(isEnabled('info', 'info')).toBe(true);
    expect(isEnabled('info', 'warn')).toBe(true);
    expect(isEnabled('info', 'error')).toBe(true);
    expect(isEnabled('info', 'fatal')).toBe(true);

    // Current silent: nothing enabled except silent
    expect(isEnabled('silent', 'info')).toBe(false);
    expect(isEnabled('silent', 'error')).toBe(false);
    expect(isEnabled('silent', 'silent')).toBe(true);
  });
});

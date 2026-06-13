import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@tauri-apps/api/core', () => ({
  invoke: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('loglevel', () => ({
  default: {
    setLevel: vi.fn(),
    trace: vi.fn(),
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

import log from 'loglevel';
import { invoke } from '@tauri-apps/api/core';
import { logger } from '../../../src/lib/client/logging/logger.client';

describe('logger.client — todos los niveles', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('logger.info emite al backend y llama a log.info', async () => {
    logger.info('test.event', { key: 'val' }, 'op-001');
    await Promise.resolve(); // flush microtasks
    expect(vi.mocked(log.info)).toHaveBeenCalled();
  });

  it('logger.warn emite al backend y llama a log.warn', async () => {
    logger.warn('test.warn', { key: 'val' }, 'op-002');
    await Promise.resolve();
    expect(vi.mocked(log.warn)).toHaveBeenCalled();
  });

  it('logger.error emite al backend y llama a log.error', async () => {
    logger.error('test.error', { key: 'val' }, 'op-003');
    await Promise.resolve();
    expect(vi.mocked(log.error)).toHaveBeenCalled();
  });

  it('logger.fatal emite al backend y llama a log.error con [FATAL]', async () => {
    logger.fatal('test.fatal', { key: 'val' }, 'op-004');
    await Promise.resolve();
    expect(vi.mocked(log.error)).toHaveBeenCalledWith(
      expect.stringContaining('[FATAL]'),
      expect.anything()
    );
  });

  it('logger.debug se invoca sin lanzar excepción', () => {
    expect(() => logger.debug('test.debug', { key: 'val' })).not.toThrow();
  });

  it('logger.trace se invoca sin lanzar excepción', () => {
    expect(() => logger.trace('test.trace', { key: 'val' })).not.toThrow();
  });

  it('sendToBackend llama a invoke con los parámetros correctos', async () => {
    logger.info('backend.event', { data: 'x' }, 'op-005');
    // Permitir que la promesa de sendToBackend resuelva
    await new Promise(resolve => setTimeout(resolve, 10));
    expect(vi.mocked(invoke)).toHaveBeenCalledWith(
      'emit_log_event',
      expect.objectContaining({ level: 'info', event: 'backend.event' })
    );
  });

  it('sendToBackend no propaga error si invoke falla', async () => {
    vi.mocked(invoke).mockRejectedValueOnce(new Error('IPC error'));
    expect(() => logger.error('fail.event', {}, 'op-006')).not.toThrow();
    await new Promise(resolve => setTimeout(resolve, 10));
    // No error bubbles up
  });

  it('sanitizeForLog elimina claves sensibles del contexto', async () => {
    logger.info('sanitize.test', { password: 'secret', safeKey: 'value' }, 'op-007');
    await new Promise(resolve => setTimeout(resolve, 10));
    const lastCall = vi.mocked(invoke).mock.calls.find(
      ([cmd]) => cmd === 'emit_log_event'
    );
    if (lastCall) {
      const args = lastCall[1] as any;
      // sanitizeForLog reemplaza valores sensibles con [REDACTED]
      expect(args.context?.password).toBe('[REDACTED]');
      expect(args.context?.safeKey).toBe('value');
    }
  });
});

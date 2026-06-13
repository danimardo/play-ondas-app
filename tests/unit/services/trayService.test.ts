import { describe, it, expect, vi, beforeEach } from 'vitest';
import { isTrayAvailable, sendTrayAction } from '../../../src/lib/services/trayService';
import { invoke } from '@tauri-apps/api/core';

vi.mock('@tauri-apps/api/core', () => ({
  invoke: vi.fn(),
}));

// Mock logger to avoid emitting actual log events through client logging loop during tests
vi.mock('../../../src/lib/client/logging/logger.client', () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

describe('TrayService Unit Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('isTrayAvailable debería devolver true si invoke devuelve true', async () => {
    vi.mocked(invoke).mockResolvedValueOnce(true);
    const result = await isTrayAvailable();
    expect(invoke).toHaveBeenCalledWith('resolve_tray_available');
    expect(result).toBe(true);
  });

  it('isTrayAvailable debería devolver false si invoke devuelve false', async () => {
    vi.mocked(invoke).mockResolvedValueOnce(false);
    const result = await isTrayAvailable();
    expect(result).toBe(false);
  });

  it('isTrayAvailable debería devolver false si invoke falla o lanza excepción', async () => {
    vi.mocked(invoke).mockRejectedValueOnce(new Error('Tray system error'));
    const result = await isTrayAvailable();
    expect(result).toBe(false);
  });

  it('sendTrayAction debería llamar a tray_action con la acción correspondiente', async () => {
    vi.mocked(invoke).mockResolvedValueOnce(null);
    await sendTrayAction('play');
    expect(invoke).toHaveBeenCalledWith('tray_action', { action: 'play' });
  });

  it('sendTrayAction debería capturar la excepción si el invoke falla', async () => {
    vi.mocked(invoke).mockRejectedValueOnce(new Error('Tauri command error'));
    await expect(sendTrayAction('stop')).resolves.not.toThrow();
  });
});

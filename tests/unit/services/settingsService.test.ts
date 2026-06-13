import { describe, it, expect, vi, beforeEach } from 'vitest';
import { loadSettings, persistSettings } from '../../../src/lib/services/settingsService';
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

describe('SettingsService Unit Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('loadSettings debería invocar load_settings y devolver el resultado ok', async () => {
    const mockSettings = {
      schemaVersion: '1.0.0' as const,
      theme: 'auto' as const,
      volume: 75,
      selectedWave: 'gamma' as const,
      loop: true as const,
      minimizeToTrayOnClose: true,
      startMinimized: false,
      closeDialogSeen: true,
      customAudio: {
        gamma: null,
        beta: null,
        alfa: null,
        'theta-delta': null,
        'brown-noise': null,
      },
    };

    vi.mocked(invoke).mockResolvedValueOnce({
      ok: true,
      settings: mockSettings,
    });

    const result = await loadSettings();
    expect(invoke).toHaveBeenCalledWith('load_settings', expect.any(Object));
    expect(result).toEqual({
      ok: true,
      settings: mockSettings,
    });
  });

  it('loadSettings debería capturar y registrar fallos devueltos por el comando', async () => {
    const mockDefaults = {
      schemaVersion: '1.0.0' as const,
      theme: 'auto' as const,
      volume: 75,
      selectedWave: 'gamma' as const,
      loop: true as const,
      minimizeToTrayOnClose: true,
      startMinimized: false,
      closeDialogSeen: true,
      customAudio: {
        gamma: null,
        beta: null,
        alfa: null,
        'theta-delta': null,
        'brown-noise': null,
      },
    };

    vi.mocked(invoke).mockResolvedValueOnce({
      ok: false,
      defaults: mockDefaults,
      error: {
        field: 'general',
        code: 'CORRUPT_CONFIG',
        message: 'Config corrupta',
      },
    });

    const result = await loadSettings();
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe('CORRUPT_CONFIG');
      expect(result.defaults).toEqual(mockDefaults);
    }
  });

  it('loadSettings debería relanzar excepciones de invoke', async () => {
    vi.mocked(invoke).mockRejectedValueOnce(new Error('Fatal IPC error'));
    await expect(loadSettings()).rejects.toThrow('Fatal IPC error');
  });

  it('persistSettings debería invocar persist_settings y devolver el resultado ok', async () => {
    const mockSettings = {
      schemaVersion: '1.0.0' as const,
      theme: 'dark' as const,
      volume: 50,
      selectedWave: 'beta' as const,
      loop: true as const,
      minimizeToTrayOnClose: false,
      startMinimized: true,
      closeDialogSeen: false,
      customAudio: {
        gamma: null,
        beta: null,
        alfa: null,
        'theta-delta': null,
        'brown-noise': null,
      },
    };

    vi.mocked(invoke).mockResolvedValueOnce({
      ok: true,
    });

    const result = await persistSettings(mockSettings);
    expect(invoke).toHaveBeenCalledWith('persist_settings', expect.objectContaining({
      settings: mockSettings,
    }));
    expect(result).toEqual({ ok: true });
  });

  it('persistSettings debería registrar fallos devueltos por el comando', async () => {
    const mockSettings = {
      schemaVersion: '1.0.0' as const,
      theme: 'dark' as const,
      volume: 50,
      selectedWave: 'beta' as const,
      loop: true as const,
      minimizeToTrayOnClose: false,
      startMinimized: true,
      closeDialogSeen: false,
      customAudio: {
        gamma: null,
        beta: null,
        alfa: null,
        'theta-delta': null,
        'brown-noise': null,
      },
    };

    vi.mocked(invoke).mockResolvedValueOnce({
      ok: false,
      error: {
        field: 'persist',
        code: 'WRITE_ERROR',
        message: 'No se pudo escribir',
      },
    });

    const result = await persistSettings(mockSettings);
    expect(result).toEqual({
      ok: false,
      error: {
        field: 'persist',
        code: 'WRITE_ERROR',
        message: 'No se pudo escribir',
      },
    });
  });

  it('persistSettings debería relanzar excepciones de invoke', async () => {
    const mockSettings = {
      schemaVersion: '1.0.0' as const,
      theme: 'dark' as const,
      volume: 50,
      selectedWave: 'beta' as const,
      loop: true as const,
      minimizeToTrayOnClose: false,
      startMinimized: true,
      closeDialogSeen: false,
      customAudio: {
        gamma: null,
        beta: null,
        alfa: null,
        'theta-delta': null,
        'brown-noise': null,
      },
    };

    vi.mocked(invoke).mockRejectedValueOnce(new Error('Atomic write failed'));
    await expect(persistSettings(mockSettings)).rejects.toThrow('Atomic write failed');
  });
});

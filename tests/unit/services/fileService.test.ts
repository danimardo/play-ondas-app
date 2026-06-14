import { describe, it, expect, vi, beforeEach } from 'vitest';
import { pickAudioFile, replaceWaveAudio, restoreWaveAudio } from '../../../src/lib/services/fileService';
import { invoke } from '@tauri-apps/api/core';
import { open } from '@tauri-apps/plugin-dialog';

vi.mock('@tauri-apps/api/core', () => ({
  invoke: vi.fn(),
}));

vi.mock('@tauri-apps/plugin-dialog', () => ({
  open: vi.fn(),
}));

describe('FileService Unit Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock general que responde según el comando de Tauri
    vi.mocked(invoke).mockImplementation(async (cmd, args: any) => {
      if (cmd === 'replace_wave_audio') {
        // En el test de error simulamos la respuesta fallida
        if (args.sourcePath && args.sourcePath.endsWith('.txt')) {
          return {
            ok: false,
            error: {
              code: 'VALIDATION_FAILED',
              message: 'Formato no soportado',
            },
          };
        }
        return {
          ok: true,
          displayName: 'my-custom-sound.mp3',
        };
      }
      if (cmd === 'restore_wave_audio') {
        return {
          ok: true,
        };
      }
      return undefined;
    });
  });

  it('debería abrir el diálogo de selección y devolver la ruta del archivo si se selecciona uno', async () => {
    vi.mocked(open).mockResolvedValueOnce('C:\\path\\to\\audio.mp3');

    const result = await pickAudioFile();

    expect(open).toHaveBeenCalledWith(
      expect.objectContaining({
        multiple: false,
        directory: false,
        filters: [
          expect.objectContaining({
            extensions: ['mp3', 'wav', 'ogg', 'flac', 'm4a'],
          }),
        ],
      })
    );
    expect(result).toBe('C:\\path\\to\\audio.mp3');
  });

  it('debería devolver null si el selector de archivos se cancela', async () => {
    vi.mocked(open).mockResolvedValueOnce(null);

    const result = await pickAudioFile();

    expect(result).toBeNull();
  });

  it('debería invocar replace_wave_audio y parsear la respuesta de éxito correctamente', async () => {
    const result = await replaceWaveAudio('beta', 'C:\\path\\to\\sound.mp3');

    expect(invoke).toHaveBeenCalledWith(
      'replace_wave_audio',
      expect.objectContaining({
        waveId: 'beta',
        sourcePath: 'C:\\path\\to\\sound.mp3',
      })
    );
    expect(result).toEqual({
      ok: true,
      displayName: 'my-custom-sound.mp3',
    });
  });

  it('debería devolver un error estructurado si replace_wave_audio falla', async () => {
    const result = await replaceWaveAudio('beta', 'C:\\path\\to\\sound.txt');

    expect(result).toEqual({
      ok: false,
      error: {
        code: 'VALIDATION_FAILED',
        message: 'Formato no soportado',
      },
    });
  });

  it('debería invocar restore_wave_audio con éxito', async () => {
    const result = await restoreWaveAudio('beta');

    expect(invoke).toHaveBeenCalledWith(
      'restore_wave_audio',
      expect.objectContaining({
        waveId: 'beta',
      })
    );
    expect(result).toEqual({
      ok: true,
    });
  });

  it('debería devolver error estructurado si restore_wave_audio responde ok: false', async () => {
    vi.mocked(invoke).mockImplementation(async (cmd) => {
      if (cmd === 'restore_wave_audio') {
        return {
          ok: false,
          error: { code: 'FILE_NOT_FOUND', message: 'Archivo no encontrado' },
        };
      }
      return undefined;
    });

    const result = await restoreWaveAudio('gamma');

    expect(result).toEqual({
      ok: false,
      error: { code: 'FILE_NOT_FOUND', message: 'Archivo no encontrado' },
    });
  });

  it('debería capturar excepción en restore_wave_audio y devolver error', async () => {
    vi.mocked(invoke).mockImplementation(async (cmd) => {
      if (cmd === 'restore_wave_audio') throw new Error('IPC failure');
      return undefined;
    });

    const result = await restoreWaveAudio('beta');

    expect(result).toEqual({
      ok: false,
      error: { code: 'RESTORE_ERROR', message: 'IPC failure' },
    });
  });

  it('debería capturar excepción en replaceWaveAudio y devolver error', async () => {
    vi.mocked(invoke).mockImplementation(async (cmd) => {
      if (cmd === 'replace_wave_audio') throw new Error('Network error');
      return undefined;
    });

    const result = await replaceWaveAudio('beta', '/path/to/audio.mp3');

    expect(result).toEqual({
      ok: false,
      error: { code: 'REPLACE_ERROR', message: 'Network error' },
    });
  });

  it('debería devolver null y no lanzar excepción si pickAudioFile falla', async () => {
    vi.mocked(open).mockRejectedValueOnce(new Error('Dialog error'));

    const result = await pickAudioFile();

    expect(result).toBeNull();
  });
});

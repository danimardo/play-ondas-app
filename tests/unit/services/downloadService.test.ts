import { describe, it, expect, vi, beforeEach } from 'vitest';
import { downloadStore } from '../../../src/lib/stores/downloadStore.svelte';
import { invoke } from '@tauri-apps/api/core';
import { listen } from '@tauri-apps/api/event';

vi.mock('@tauri-apps/api/core', () => ({
  invoke: vi.fn(),
}));

vi.mock('@tauri-apps/api/event', () => ({
  listen: vi.fn().mockResolvedValue(() => {}),
}));

describe('DownloadStore Unit Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(listen).mockResolvedValue(() => {});
    downloadStore.reset();
  });

  it('debería verificar los archivos faltantes invocando check_audio_files', async () => {
    vi.mocked(invoke).mockResolvedValueOnce(['gamma', 'beta']);

    const missing = await downloadStore.checkMissingFiles();

    expect(invoke).toHaveBeenCalledWith('check_audio_files');
    expect(missing).toEqual(['gamma', 'beta']);
    expect(downloadStore.missingFiles).toEqual(['gamma', 'beta']);
  });

  it('debería iniciar la descarga escuchando el progreso e invocando start_audio_download', async () => {
    vi.mocked(invoke).mockImplementation(async (cmd) => {
      if (cmd === 'start_audio_download') return undefined;
      if (cmd === 'check_audio_files') return [];
      return undefined;
    });

    await downloadStore.startDownload();

    expect(listen).toHaveBeenCalledWith('download-progress', expect.any(Function));
    expect(invoke).toHaveBeenCalledWith('start_audio_download');
  });

  it('debería manejar error de red en startDownload y poner status en failed', async () => {
    vi.mocked(invoke).mockImplementation(async (cmd) => {
      if (cmd === 'start_audio_download') throw new Error('DOWNLOAD_FAILED_NETWORK: connection refused');
      return undefined;
    });

    await downloadStore.startDownload();

    expect(downloadStore.progress.status).toBe('failed');
    expect(downloadStore.isFailed).toBe(true);
  });

  it('debería manejar error HTTP 4XX en startDownload', async () => {
    vi.mocked(invoke).mockImplementation(async (cmd) => {
      if (cmd === 'start_audio_download') throw new Error('DOWNLOAD_FAILED_HTTP_4XX: 404 Not Found');
      return undefined;
    });

    await downloadStore.startDownload();

    expect(downloadStore.isFailed).toBe(true);
    expect(downloadStore.progress.error).toContain('DOWNLOAD_FAILED_HTTP_4XX');
  });

  it('debería manejar error HTTP 5XX en startDownload', async () => {
    vi.mocked(invoke).mockImplementation(async (cmd) => {
      if (cmd === 'start_audio_download') throw new Error('DOWNLOAD_FAILED_HTTP_5XX: 503 Service Unavailable');
      return undefined;
    });

    await downloadStore.startDownload();

    expect(downloadStore.isFailed).toBe(true);
    expect(downloadStore.progress.error).toContain('DOWNLOAD_FAILED_HTTP_5XX');
  });

  it('debería limpiar el listener activo en reset()', async () => {
    const unlistenMock = vi.fn();
    vi.mocked(listen).mockResolvedValueOnce(unlistenMock);
    vi.mocked(invoke).mockImplementation(async (cmd) => {
      if (cmd === 'start_audio_download') return undefined;
      if (cmd === 'check_audio_files') return [];
      return undefined;
    });

    await downloadStore.startDownload();
    downloadStore.reset();

    expect(unlistenMock).toHaveBeenCalled();
    expect(downloadStore.isDownloading).toBe(false);
  });

  it('debería capturar error Zod en el payload del evento download-progress sin lanzar', async () => {
    let capturedHandler: ((e: { payload: unknown }) => void) | null = null;

    vi.mocked(listen).mockImplementationOnce(async (_event, handler) => {
      capturedHandler = handler as any;
      return () => {};
    });
    vi.mocked(invoke).mockImplementation(async (cmd) => {
      if (cmd === 'start_audio_download') return undefined;
      if (cmd === 'check_audio_files') return [];
      return undefined;
    });

    const promise = downloadStore.startDownload();

    // Dejar que listen resuelva y startDownload lo asigne
    await Promise.resolve();
    await Promise.resolve();

    if (capturedHandler) {
      // Payload inválido: Zod debe capturarlo sin lanzar
      capturedHandler({ payload: { invalid: 'data' } });
    }

    await promise;
    // Si no lanzó, el test pasa
  });

  it('debería retornar [] si check_audio_files falla con Zod', async () => {
    vi.mocked(invoke).mockImplementation(async (cmd) => {
      if (cmd === 'check_audio_files') return 'not-an-array'; // Zod fallará
      return undefined;
    });

    const result = await downloadStore.checkMissingFiles();
    expect(result).toEqual([]);
  });
});

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { invoke } from '@tauri-apps/api/core';
import { playerController } from '../../../src/lib/services/playerController';
import { playerStore } from '../../../src/lib/stores/playerStore.svelte';
import { settingsStore } from '../../../src/lib/stores/settingsStore.svelte';
import { audioService } from '../../../src/lib/services/audioService';

vi.mock('@tauri-apps/api/core', () => ({
  invoke: vi.fn(),
  convertFileSrc: (p: string) => `asset://${p}`,
}));

vi.mock('../../../src/lib/services/audioService', () => ({
  audioService: {
    play: vi.fn(),
    pause: vi.fn(),
    stop: vi.fn(),
    setVolume: vi.fn(),
    get operationId() {
      return 'op-test';
    },
  },
}));

function mockResolve(source: string, resolvedPath: string | null) {
  vi.mocked(invoke).mockResolvedValueOnce({
    waveId: 'beta',
    source,
    resolvedPath,
    displayName: resolvedPath ? 'beta.mp3' : 'Audio no disponible',
  });
}

describe('playerController', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    playerStore.selectWave('beta');
    playerStore.setPlaybackStatus('stopped');
    playerStore.setVolume(70);
    playerStore.setCurrentAudioSource(null);
    playerStore.setErrorMessage(null);
  });

  it('play() resuelve la ruta y reproduce, marcando estado playing', async () => {
    mockResolve('downloaded-default', '/data/defaults/beta.mp3');

    await playerController.play();

    expect(invoke).toHaveBeenCalledWith('resolve_audio_path', {
      waveId: 'beta',
      customFileName: null,
    });
    expect(playerStore.currentAudioSource).toBe('downloaded-default');
    expect(playerStore.playbackStatus).toBe('playing');
    expect(audioService.play).toHaveBeenCalledWith('beta', '/data/defaults/beta.mp3', 'downloaded-default');
  });

  it('play() con audio no disponible no reproduce y deja estado stopped', async () => {
    mockResolve('unavailable', null);

    await playerController.play();

    expect(playerStore.currentAudioSource).toBe('unavailable');
    expect(playerStore.playbackStatus).toBe('stopped');
    expect(audioService.play).not.toHaveBeenCalled();
  });

  it('resolveInitial() resuelve sin reproducir', async () => {
    mockResolve('downloaded-default', '/data/defaults/beta.mp3');

    await playerController.resolveInitial();

    expect(playerStore.currentAudioSource).toBe('downloaded-default');
    expect(playerStore.playbackStatus).toBe('stopped');
    expect(audioService.play).not.toHaveBeenCalled();
  });

  it('pause() pausa solo si estaba reproduciendo', () => {
    playerStore.setPlaybackStatus('playing');
    playerController.pause();
    expect(audioService.pause).toHaveBeenCalled();
    expect(playerStore.playbackStatus).toBe('paused');
  });

  it('stop() detiene y marca stopped', () => {
    playerStore.setPlaybackStatus('playing');
    playerController.stop();
    expect(audioService.stop).toHaveBeenCalled();
    expect(playerStore.playbackStatus).toBe('stopped');
  });

  it('toggle() reproduce si no está sonando', async () => {
    mockResolve('downloaded-default', '/data/defaults/beta.mp3');
    playerStore.setPlaybackStatus('stopped');

    playerController.toggle();
    // toggle llama play() de forma asíncrona
    await vi.waitFor(() => expect(audioService.play).toHaveBeenCalled());
  });

  it('toggle() pausa si está sonando', () => {
    playerStore.setPlaybackStatus('playing');
    playerController.toggle();
    expect(audioService.pause).toHaveBeenCalled();
  });

  it('selectWave() sincroniza settingsStore y playerStore', async () => {
    mockResolve('downloaded-default', '/data/defaults/alfa.mp3');

    await playerController.selectWave('alfa');

    expect(playerStore.selectedWave).toBe('alfa');
    expect(settingsStore.selectedWave).toBe('alfa');
  });

  it('setVolume() sincroniza ambos stores y el audioService', () => {
    playerController.setVolume(33);
    expect(playerStore.volume).toBe(33);
    expect(settingsStore.volume).toBe(33);
    expect(audioService.setVolume).toHaveBeenCalledWith(33);
  });

  it('syncFromSettings() aplica volumen y onda persistidos', () => {
    settingsStore.selectedWave = 'gamma';
    settingsStore.volume = 55;

    playerController.syncFromSettings();

    expect(playerStore.selectedWave).toBe('gamma');
    expect(playerStore.volume).toBe(55);
    expect(audioService.setVolume).toHaveBeenCalledWith(55);
  });

  it('marca estado de error y mensaje si resolve_audio_path falla', async () => {
    vi.mocked(invoke).mockRejectedValueOnce(new Error('IPC down'));

    await playerController.play();

    expect(playerStore.playbackStatus).toBe('error');
    expect(playerStore.errorMessage).toBeTruthy();
  });
});

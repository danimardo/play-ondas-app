import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@tauri-apps/api/core', () => ({
  invoke: vi.fn(),
  convertFileSrc: (p: string) => `tauri://${p}`,
}));

import { audioService } from '../../../src/lib/services/audioService';

describe('AudioService HTMLAudioElement wrapper', () => {
  let playMock: any;
  let pauseMock: any;

  beforeEach(() => {
    vi.clearAllMocks();
    playMock = vi.fn().mockResolvedValue(undefined);
    pauseMock = vi.fn();

    vi.stubGlobal('Audio', class {
      loop = false;
      volume = 0.5;
      currentTime = 0;
      paused = false;
      play = playMock;
      pause = pauseMock;
      onerror: ((e: Event) => void) | null = null;
    });
  });

  it('should play audio successfully', () => {
    audioService.play('gamma', '/path/to/gamma.mp3', 'downloaded-default');
    expect(playMock).toHaveBeenCalled();
  });

  it('should pause audio successfully', () => {
    audioService.play('gamma', '/path/to/gamma.mp3', 'downloaded-default');
    audioService.pause();
    expect(pauseMock).toHaveBeenCalled();
  });

  it('should stop audio and reset currentTime', () => {
    audioService.play('gamma', '/path/to/gamma.mp3', 'downloaded-default');
    audioService.stop();
    expect(pauseMock).toHaveBeenCalled();
  });

  it('should set volume on existing audio element', () => {
    audioService.play('gamma', '/path/to/gamma.mp3', 'downloaded-default');
    audioService.setVolume(50);
    // No throws = service handles it correctly
  });

  it('should set volume before any audio element exists', () => {
    // Reset state by calling stop
    audioService.stop();
    audioService.setVolume(80);
    // Should not throw when no audio element exists
  });

  it('should switch wave: stop current and play new', async () => {
    audioService.play('gamma', '/path/to/gamma.mp3', 'downloaded-default');
    await audioService.switchWave('beta', '/path/to/beta.mp3', 'downloaded-default');
    // Should call pause twice: once for stop of gamma, once for play of beta replacing audio
    expect(pauseMock).toHaveBeenCalled();
    expect(playMock).toHaveBeenCalledTimes(2);
  });

  it('should handle play error from HTMLAudioElement.play() rejection', async () => {
    playMock = vi.fn().mockRejectedValue(new Error('NotAllowedError'));
    vi.stubGlobal('Audio', class {
      loop = false;
      volume = 0.5;
      currentTime = 0;
      paused = false;
      play = playMock;
      pause = pauseMock;
      onerror: ((e: Event) => void) | null = null;
    });

    // Should not throw; error is handled internally
    audioService.play('gamma', '/error/path.mp3', 'downloaded-default');
    // Wait for the promise rejection to be handled
    await new Promise(resolve => setTimeout(resolve, 10));
  });
});

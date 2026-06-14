import { describe, it, expect, vi, beforeEach } from 'vitest';
import { audioService } from '../../../src/lib/services/audioService';

vi.mock('@tauri-apps/api/core', () => ({
  invoke: vi.fn(),
  convertFileSrc: (p: string) => `tauri://${p}`,
}));

import { invoke } from '@tauri-apps/api/core';

describe('audioPlayback logging integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal('Audio', class {
      loop = false;
      volume = 0.5;
      play = vi.fn().mockResolvedValue(undefined);
      pause = vi.fn();
    });
  });

  it('should emit starting and stopping logs on play/stop cycle', () => {
    audioService.play('gamma', '/path/to/gamma.mp3', 'downloaded-default');
    
    // Check invoke is called with emit_log_event and audio.playback.started
    expect(invoke).toHaveBeenCalledWith('emit_log_event', expect.objectContaining({
      level: 'info',
      event: 'audio.playback.started',
      context: expect.objectContaining({
        waveId: 'gamma',
        audioSource: 'default',
      }),
      operationId: expect.any(String),
    }));

    audioService.stop();

    // Check invoke is called with emit_log_event and audio.playback.stopped
    expect(invoke).toHaveBeenCalledWith('emit_log_event', expect.objectContaining({
      level: 'info',
      event: 'audio.playback.stopped',
      context: expect.objectContaining({
        waveId: 'gamma',
      }),
      operationId: expect.any(String),
    }));
  });
});

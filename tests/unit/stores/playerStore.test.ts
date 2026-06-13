import { describe, it, expect } from 'vitest';
import { playerStore } from '../../../src/lib/stores/playerStore.svelte';

describe('PlayerStore state machine', () => {
  it('should initialize with default values', () => {
    expect(playerStore.selectedWave).toBe('gamma');
    expect(playerStore.playbackStatus).toBe('stopped');
    expect(playerStore.volume).toBe(70); // FR-010: volumen por defecto = 70
    expect(playerStore.loop).toBe(true);
  });

  it('should transition selectWave correctly', () => {
    playerStore.selectWave('beta');
    expect(playerStore.selectedWave).toBe('beta');
  });

  it('should update volume correctly', () => {
    playerStore.setVolume(50);
    expect(playerStore.volume).toBe(50);
  });
});

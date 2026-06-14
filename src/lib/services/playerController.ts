import { invoke } from '@tauri-apps/api/core';
import { playerStore } from '../stores/playerStore.svelte';
import { settingsStore } from '../stores/settingsStore.svelte';
import { audioService } from './audioService';
import { WaveId } from '../schemas/waveSchema';
import { WaveAudioAssociationSchema } from '../schemas/audioMetaSchema';

/**
 * Orquesta la reproducción uniendo playerStore, settingsStore, audioService y el
 * comando Rust `resolve_audio_path`. Es la única fuente de acciones de reproducción:
 * tanto los controles del footer como los atajos de teclado y el menú de bandeja
 * llaman aquí directamente (sin trucos de DOM).
 *
 * Además mantiene sincronizados `playerStore` (estado de UI en vivo) y `settingsStore`
 * (estado persistible) para que el volumen y la onda seleccionada se guarden y se
 * restauren entre ejecuciones (US3).
 */
async function resolveAndPlay(waveId: WaveId, playImmediate: boolean): Promise<void> {
  try {
    const customFileName = settingsStore.customAudio[waveId] ?? null;
    const raw = await invoke('resolve_audio_path', { waveId, customFileName });
    const res = WaveAudioAssociationSchema.parse(raw);

    playerStore.setCurrentAudioSource(res.source);

    if (!res.resolvedPath) {
      playerStore.setPlaybackStatus('stopped');
      return;
    }

    if (playImmediate) {
      playerStore.setPlaybackStatus('playing');
      audioService.play(waveId, res.resolvedPath, res.source);
      playerStore.setOperationId(audioService.operationId);
    }
  } catch (err) {
    playerStore.setPlaybackStatus('error');
    playerStore.setErrorMessage(
      'No se pudo cargar el audio de la onda seleccionada. Inténtalo de nuevo.'
    );
  }
}

export const playerController = {
  /** Aplica las preferencias persistidas (onda, volumen) tras cargar settings. */
  syncFromSettings(): void {
    playerStore.selectWave(settingsStore.selectedWave);
    playerStore.setVolume(settingsStore.volume);
    audioService.setVolume(settingsStore.volume);
  },

  /** Resuelve la ruta de la onda actual sin reproducir (arranque). */
  async resolveInitial(): Promise<void> {
    await resolveAndPlay(playerStore.selectedWave, false);
  },

  async play(): Promise<void> {
    if (playerStore.playbackStatus === 'paused') {
      audioService.resume();
      playerStore.setPlaybackStatus('playing');
      return;
    }
    await resolveAndPlay(playerStore.selectedWave, true);
  },

  pause(): void {
    audioService.pause();
    if (playerStore.playbackStatus === 'playing') {
      playerStore.setPlaybackStatus('paused');
    }
  },

  stop(): void {
    audioService.stop();
    playerStore.setPlaybackStatus('stopped');
  },

  /** Play/Pausa según el estado actual (atajo Ctrl+Shift+P). */
  toggle(): void {
    if (playerStore.playbackStatus === 'playing') {
      this.pause();
    } else {
      void this.play();
    }
  },

  async selectWave(waveId: WaveId): Promise<void> {
    playerStore.selectWave(waveId);
    settingsStore.selectedWave = waveId;
    const isPlaying = playerStore.playbackStatus === 'playing';
    await resolveAndPlay(waveId, isPlaying);
  },

  setVolume(vol: number): void {
    playerStore.setVolume(vol);
    settingsStore.volume = vol;
    audioService.setVolume(vol);
  },

  /** Re-resuelve la onda actual tras cambiar/restaurar su audio personalizado. */
  async refreshCurrentWave(): Promise<void> {
    const isPlaying = playerStore.playbackStatus === 'playing';
    await resolveAndPlay(playerStore.selectedWave, isPlaying);
  },
};

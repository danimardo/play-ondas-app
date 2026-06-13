import { convertFileSrc } from '@tauri-apps/api/core';
import { nanoid } from '../logging/nanoid';
import { logger } from '../client/logging/logger.client';
import { WaveId } from '../schemas/waveSchema';
import { AudioSource } from '../schemas/audioMetaSchema';

class AudioService {
  #audio: HTMLAudioElement | null = null;
  #currentWaveId: WaveId | null = null;
  #operationId: string | null = null;
  #volume = 0.75; // 0.0 to 1.0
  #loop = true;

  get operationId() {
    return this.#operationId;
  }

  play(waveId: WaveId, filePath: string, source: AudioSource) {
    if (!this.#operationId) {
      this.#operationId = nanoid(8);
    }
    
    logger.info('audio.playback.started', {
      waveId,
      audioSource: source === 'custom' ? 'custom' : 'default',
      loop: this.#loop,
    }, this.#operationId);

    try {
      if (this.#audio) {
        this.#audio.pause();
      }

      const audioUrl = convertFileSrc(filePath);
      this.#audio = new Audio(audioUrl);
      this.#audio.loop = this.#loop;
      this.#audio.volume = this.#volume;
      this.#currentWaveId = waveId;

      this.#audio.onerror = () => {
        logger.error('audio.playback.failed', {
          waveId,
          audioSource: source,
          errorCode: 'PLAYBACK_FAILED',
          errorMessage: 'Error during HTMLAudioElement playback',
        }, this.#operationId || undefined);
      };

      this.#audio.play().catch(err => {
        logger.error('audio.playback.failed', {
          waveId,
          audioSource: source,
          errorCode: 'PLAYBACK_FAILED',
          errorMessage: err instanceof Error ? err.message : String(err),
        }, this.#operationId || undefined);
      });
    } catch (err) {
      logger.error('audio.playback.failed', {
        waveId,
        audioSource: source,
        errorCode: 'PLAYBACK_FAILED',
        errorMessage: err instanceof Error ? err.message : String(err),
      }, this.#operationId || undefined);
    }
  }

  pause() {
    if (this.#audio && !this.#audio.paused) {
      this.#audio.pause();
      if (this.#currentWaveId && this.#operationId) {
        logger.info('audio.playback.paused', { waveId: this.#currentWaveId }, this.#operationId);
      }
    }
  }

  stop() {
    if (this.#audio) {
      this.#audio.pause();
      this.#audio.currentTime = 0;
      if (this.#currentWaveId && this.#operationId) {
        logger.info('audio.playback.stopped', { waveId: this.#currentWaveId }, this.#operationId);
      }
      this.#operationId = null;
    }
  }

  setVolume(volume100: number) {
    this.#volume = volume100 / 100;
    if (this.#audio) {
      this.#audio.volume = this.#volume;
    }
  }

  setLoop(loop: boolean) {
    this.#loop = loop;
    if (this.#audio) {
      this.#audio.loop = loop;
    }
  }

  async switchWave(waveId: WaveId, filePath: string, source: AudioSource) {
    this.stop();
    this.#operationId = nanoid(8);
    this.play(waveId, filePath, source);
  }
}

export const audioService = new AudioService();

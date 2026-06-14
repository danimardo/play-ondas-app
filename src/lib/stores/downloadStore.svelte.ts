import { listen, UnlistenFn } from '@tauri-apps/api/event';
import { invoke } from '@tauri-apps/api/core';
import { z } from 'zod';
import { WaveIdSchema, WaveId } from '../schemas/waveSchema';
import { GlobalDownloadProgress, GlobalDownloadProgressSchema } from '../schemas/downloadSchema';
import { logger } from '../client/logging/logger.client';
import { nanoid } from '../logging/nanoid';

const INITIAL_PROGRESS: GlobalDownloadProgress = {
  currentFileIndex: 0,
  totalFiles: 5,
  totalBytesDownloaded: 0,
  totalBytesEstimated: 0,
  globalProgressPercent: 0,
  status: 'idle',
  files: {},
};

class DownloadStore {
  #progress = $state<GlobalDownloadProgress>(INITIAL_PROGRESS);
  #missingFiles = $state<WaveId[]>([]);
  #usingExamples = $state(false);
  #unlistenProgress: UnlistenFn | null = null;

  get progress() {
    return this.#progress;
  }

  get missingFiles() {
    return this.#missingFiles;
  }

  get usingExamples() {
    return this.#usingExamples;
  }

  get isDownloading() {
    return this.#progress.status === 'downloading';
  }

  get isFailed() {
    return this.#progress.status === 'failed';
  }

  get isCompleted() {
    return this.#progress.status === 'completed';
  }

  async checkMissingFiles(): Promise<WaveId[]> {
    try {
      const raw = await invoke('check_audio_files');
      const missing = z.array(WaveIdSchema).parse(raw);
      this.#missingFiles = missing;
      return missing;
    } catch (err) {
      logger.error('validation.failed', { errorCode: 'CHECK_FILES_ERROR', error: String(err) });
      return [];
    }
  }

  async startDownload(): Promise<void> {
    const operationId = nanoid(8);
    logger.info('audio.download.started', {}, operationId);
    
    // Si ya hay un listener activo, lo limpiamos
    if (this.#unlistenProgress) {
      this.#unlistenProgress();
      this.#unlistenProgress = null;
    }

    this.#progress = {
      ...INITIAL_PROGRESS,
      status: 'checking',
    };

    try {
      // Nos suscribimos a los eventos de progreso emitidos desde Rust
      this.#unlistenProgress = await listen<unknown>('download-progress', (event) => {
        try {
          // Validamos en runtime el payload de Tauri IPC con Zod antes de mutar el store (Principio VI)
          const parsed = GlobalDownloadProgressSchema.parse(event.payload);
          this.#progress = parsed;
          
          // Loggear eventos significativos del ciclo
          if (parsed.status === 'completed') {
            logger.info('audio.download.completed', { filesCount: parsed.totalFiles }, operationId);
          }
        } catch (validationErr) {
          logger.error('validation.failed', {
            errorCode: 'PROGRESS_EVENT_VALIDATION_FAILED',
            errorMessage: validationErr instanceof Error ? validationErr.message : String(validationErr),
          }, operationId);
        }
      });

      // Lanzamos la descarga
      await invoke('start_audio_download');
      
      // Tras finalizar con éxito, refrescamos la lista de archivos faltantes
      await this.checkMissingFiles();
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      
      // Determinamos el tipo de fallo de la descarga
      let errorCode = 'DOWNLOAD_FAILED_UNKNOWN';
      if (errorMsg.includes('DOWNLOAD_FAILED_NETWORK')) {
        errorCode = 'DOWNLOAD_FAILED_NETWORK';
      } else if (errorMsg.includes('DOWNLOAD_FAILED_HTTP_4XX')) {
        errorCode = 'DOWNLOAD_FAILED_HTTP_4XX';
      } else if (errorMsg.includes('DOWNLOAD_FAILED_HTTP_5XX')) {
        errorCode = 'DOWNLOAD_FAILED_HTTP_5XX';
      }

      logger.error('audio.download.file.failed', {
        errorCode,
        errorMessage: errorMsg,
      }, operationId);

      this.#progress = {
        ...this.#progress,
        status: 'failed',
        error: errorMsg,
      };
    }
  }

  useExamples() {
    this.#usingExamples = true;
    this.reset();
  }

  reset() {
    this.#progress = INITIAL_PROGRESS;
    if (this.#unlistenProgress) {
      this.#unlistenProgress();
      this.#unlistenProgress = null;
    }
  }
}

export const downloadStore = new DownloadStore();

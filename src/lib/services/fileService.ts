import { invoke } from '@tauri-apps/api/core';
import { open } from '@tauri-apps/plugin-dialog';
import { z } from 'zod';
import { nanoid } from '../logging/nanoid';
import { logger } from '../client/logging/logger.client';

export const ReplaceAudioResponseSchema = z.discriminatedUnion('ok', [
  z.object({
    ok: z.literal(true),
    displayName: z.string(),
  }),
  z.object({
    ok: z.literal(false),
    error: z.object({
      code: z.string(),
      message: z.string(),
    }),
  }),
]);
export type ReplaceAudioResponse = z.infer<typeof ReplaceAudioResponseSchema>;

export const RestoreAudioResponseSchema = z.discriminatedUnion('ok', [
  z.object({
    ok: z.literal(true),
  }),
  z.object({
    ok: z.literal(false),
    error: z.object({
      code: z.string(),
      message: z.string(),
    }),
  }),
]);
export type RestoreAudioResponse = z.infer<typeof RestoreAudioResponseSchema>;

export async function pickAudioFile(): Promise<string | null> {
  try {
    const selected = await open({
      title: 'Seleccionar audio personalizado',
      multiple: false,
      directory: false,
      filters: [
        {
          name: 'Audio',
          extensions: ['mp3', 'wav', 'ogg', 'flac', 'm4a'],
        },
      ],
    });
    
    return (selected as string) || null;
  } catch (err) {
    logger.error('validation.failed', {
      errorCode: 'PICK_FILE_ERROR',
      errorMessage: err instanceof Error ? err.message : String(err),
    });
    return null;
  }
}

export async function replaceWaveAudio(waveId: string, sourcePath: string): Promise<ReplaceAudioResponse> {
  const operationId = nanoid(8);
  logger.info('audio.file.replace.started', { waveId }, operationId);
  const startTime = Date.now();

  try {
    const rawResult = await invoke('replace_wave_audio', {
      operationId,
      waveId,
      sourcePath,
    });

    const parsed = ReplaceAudioResponseSchema.parse(rawResult);
    if (parsed.ok) {
      logger.info('audio.file.replace.completed', {
        waveId,
        durationMs: Date.now() - startTime,
      }, operationId);
    } else {
      logger.error('audio.file.replace.failed', {
        waveId,
        errorCode: parsed.error.code,
        errorMessage: parsed.error.message,
      }, operationId);
    }

    return parsed;
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    logger.error('audio.file.replace.failed', {
      waveId,
      errorCode: 'REPLACE_ERROR',
      errorMessage: errorMsg,
    }, operationId);

    return {
      ok: false,
      error: {
        code: 'REPLACE_ERROR',
        message: errorMsg,
      },
    };
  }
}

export async function restoreWaveAudio(waveId: string): Promise<RestoreAudioResponse> {
  const operationId = nanoid(8);
  logger.info('audio.file.restore.started', { waveId }, operationId);
  const startTime = Date.now();

  try {
    const rawResult = await invoke('restore_wave_audio', {
      operationId,
      waveId,
    });

    const parsed = RestoreAudioResponseSchema.parse(rawResult);
    if (parsed.ok) {
      logger.info('audio.file.restore.completed', {
        waveId,
        durationMs: Date.now() - startTime,
      }, operationId);
    } else {
      logger.error('audio.file.restore.failed', {
        waveId,
        errorCode: parsed.error.code,
        errorMessage: parsed.error.message,
      }, operationId);
    }

    return parsed;
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    logger.error('audio.file.restore.failed', {
      waveId,
      errorCode: 'RESTORE_ERROR',
      errorMessage: errorMsg,
    }, operationId);

    return {
      ok: false,
      error: {
        code: 'RESTORE_ERROR',
        message: errorMsg,
      },
    };
  }
}

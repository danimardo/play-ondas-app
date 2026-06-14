import { invoke } from '@tauri-apps/api/core';
import { LoadSettingsResponseSchema, PersistSettingsResponseSchema, UserSettings } from '../schemas/settingsSchema';
import { nanoid } from '../logging/nanoid';
import { logger } from '../client/logging/logger.client';

export async function loadSettings(): Promise<ReturnType<typeof LoadSettingsResponseSchema.parse>> {
  const operationId = nanoid(8);
  logger.info('config.load.started', {}, operationId);
  try {
    const rawResult = await invoke('load_settings', { operationId });
    const parsed = LoadSettingsResponseSchema.parse(rawResult);
    if (parsed.ok) {
      logger.info('config.load.completed', { schemaVersion: parsed.settings.schemaVersion }, operationId);
    } else {
      logger.warn('config.load.failed', { errorCode: parsed.error.code }, operationId);
    }
    return parsed;
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    logger.error('config.load.failed', { errorCode: 'LOAD_ERROR', errorMessage: errorMsg }, operationId);
    throw err;
  }
}

export async function persistSettings(settings: UserSettings): Promise<ReturnType<typeof PersistSettingsResponseSchema.parse>> {
  const operationId = nanoid(8);
  logger.info('settings.persist.started', {}, operationId);
  const startTime = Date.now();
  try {
    const rawResult = await invoke('persist_settings', { operationId, settings });
    const parsed = PersistSettingsResponseSchema.parse(rawResult);
    if (parsed.ok) {
      logger.info('settings.persist.completed', { durationMs: Date.now() - startTime }, operationId);
    } else {
      logger.error('settings.persist.failed', { errorCode: parsed.error.code }, operationId);
    }
    return parsed;
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    logger.error('settings.persist.failed', { errorCode: 'WRITE_ERROR', errorMessage: errorMsg }, operationId);
    throw err;
  }
}

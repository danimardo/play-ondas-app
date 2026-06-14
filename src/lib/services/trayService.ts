import { invoke } from '@tauri-apps/api/core';
import { z } from 'zod';
import { logger } from '../client/logging/logger.client';
import { nanoid } from '../logging/nanoid';

export const TrayActionSchema = z.enum(['play', 'pause', 'stop', 'show_hide', 'exit']);
export type TrayAction = z.infer<typeof TrayActionSchema>;

export async function isTrayAvailable(): Promise<boolean> {
  try {
    const available = await invoke<boolean>('resolve_tray_available');
    return !!available;
  } catch (err) {
    logger.warn('tray.unavailable', {
      errorCode: 'TRAY_CHECK_FAILED',
      errorMessage: err instanceof Error ? err.message : String(err),
    });
    return false;
  }
}

export async function sendTrayAction(action: TrayAction): Promise<void> {
  const operationId = nanoid(8);
  logger.info('tray.action.started', { action }, operationId);
  try {
    await invoke('tray_action', { action });
    logger.info('tray.action.completed', { action }, operationId);
  } catch (err) {
    logger.error('tray.action.failed', {
      action,
      errorCode: 'TRAY_ACTION_FAILED',
      errorMessage: err instanceof Error ? err.message : String(err),
    }, operationId);
  }
}

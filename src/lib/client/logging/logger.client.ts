import log from 'loglevel';
import { env } from '../../config/env';
import { sanitizeForLog } from '../../logging/sanitize';
import { invoke } from '@tauri-apps/api/core';
import { LogLevel } from '../../logging/types';
import { isEnabled } from '../../logging/levels';

const clientLevel = env.VITE_PUBLIC_LOG_LEVEL as LogLevel;

// Map loglevel levels
log.setLevel(clientLevel === 'fatal' ? 'error' : clientLevel === 'silent' ? 'silent' : clientLevel);

async function sendToBackend(level: LogLevel, event: string, context?: Record<string, unknown>, operationId?: string) {
  if (isEnabled(clientLevel, level)) {
    try {
      const sanitizedContext = context ? sanitizeForLog(context) as Record<string, unknown> : undefined;
      await invoke('emit_log_event', {
        level,
        event,
        context: sanitizedContext,
        operationId,
      });
    } catch (err) {
      log.error('Failed to emit log event to backend:', err);
    }
  }
}

export const logger = {
  trace(event: string, context?: Record<string, unknown>) {
    if (isEnabled(clientLevel, 'trace')) {
      log.trace(`[TRACE] ${event}`, context);
    }
  },
  debug(event: string, context?: Record<string, unknown>) {
    if (isEnabled(clientLevel, 'debug')) {
      log.debug(`[DEBUG] ${event}`, context);
    }
  },
  info(event: string, context?: Record<string, unknown>, operationId?: string) {
    if (isEnabled(clientLevel, 'info')) {
      log.info(`[INFO] ${event}`, context);
      sendToBackend('info', event, context, operationId);
    }
  },
  warn(event: string, context?: Record<string, unknown>, operationId?: string) {
    if (isEnabled(clientLevel, 'warn')) {
      log.warn(`[WARN] ${event}`, context);
      sendToBackend('warn', event, context, operationId);
    }
  },
  error(event: string, context?: Record<string, unknown>, operationId?: string) {
    if (isEnabled(clientLevel, 'error')) {
      log.error(`[ERROR] ${event}`, context);
      sendToBackend('error', event, context, operationId);
    }
  },
  fatal(event: string, context?: Record<string, unknown>, operationId?: string) {
    if (isEnabled(clientLevel, 'fatal')) {
      log.error(`[FATAL] ${event}`, context);
      sendToBackend('fatal', event, context, operationId);
    }
  },
};

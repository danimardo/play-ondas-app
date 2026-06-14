import { LogLevel } from './types';

export const LOG_LEVELS: LogLevel[] = ['trace', 'debug', 'info', 'warn', 'error', 'fatal', 'silent'];

const LEVEL_PRIORITY: Record<LogLevel, number> = {
  trace: 0,
  debug: 1,
  info: 2,
  warn: 3,
  error: 4,
  fatal: 5,
  silent: 6,
};

export function isEnabled(current: LogLevel, target: LogLevel): boolean {
  return LEVEL_PRIORITY[target] >= LEVEL_PRIORITY[current];
}

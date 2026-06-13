import { z } from 'zod';
import { LogLevelSchema } from '../logging/types';

const EnvSchema = z.object({
  LOG_LEVEL: LogLevelSchema.default('info'),
  VITE_PUBLIC_LOG_LEVEL: LogLevelSchema.default('info'),
});

const rawEnv = {
  LOG_LEVEL: import.meta.env.LOG_LEVEL || import.meta.env.VITE_LOG_LEVEL,
  VITE_PUBLIC_LOG_LEVEL: import.meta.env.VITE_PUBLIC_LOG_LEVEL,
};

export const env = EnvSchema.parse(rawEnv);

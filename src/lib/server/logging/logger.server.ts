import pino from 'pino';
import { env } from '../../config/env';
import { formatters } from './formatters.server';
import { createFileTransports } from './fileTransports.server';

const isDev = process.env.NODE_ENV !== 'production';

let loggerInstance;

if (isDev) {
  const targets = createFileTransports();
  loggerInstance = pino({
    level: env.LOG_LEVEL,
    formatters,
    transport: {
      targets: [
        {
          target: 'pino/file',
          options: { destination: 1 }, // stdout
          level: env.LOG_LEVEL,
        },
        ...targets,
      ],
    },
  });
} else {
  loggerInstance = pino({
    level: env.LOG_LEVEL,
    formatters,
    transport: {
      target: 'pino/file',
      options: { destination: 1 }, // stdout in production
    },
  });
}

export const logger = loggerInstance;
export default logger;

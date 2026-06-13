import fs from 'fs';
import path from 'path';

export function createFileTransports() {
  const isDev = process.env.NODE_ENV !== 'production';
  if (!isDev) {
    return [];
  }

  const logsDir = path.resolve(process.cwd(), '.logs');
  if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
  }

  const logFile = path.join(logsDir, 'app.log');
  const jsonlFile = path.join(logsDir, 'app.jsonl');

  // Truncate files
  fs.writeFileSync(logFile, '');
  fs.writeFileSync(jsonlFile, '');

  return [
    {
      target: 'pino/file',
      options: { destination: jsonlFile },
      level: 'trace',
    },
    {
      target: 'pino-pretty',
      options: {
        destination: logFile,
        colorize: false,
        translateTime: 'SYS:dd/mm/yyyy HH:MM:ss',
      },
      level: 'trace',
    },
  ];
}

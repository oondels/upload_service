import pino from 'pino';
import vars from '../config/env';

const isDev = vars.DEV_ENV === 'development';

export const logger = pino({
  level: isDev ? 'debug' : 'info',
  formatters: {
    level: (label) => {
      return { level: label.toUpperCase() };
    },
  },
  messageKey: 'message',
  timestamp: pino.stdTimeFunctions.isoTime, // Formato ISO 8601 UTC
  redact: {
    paths: ['password', 'token', 'authorization', 'req.headers.authorization'],
    censor: '***REDACTED***'
  },
  // O auto-instrumentations-node irá injetar trace_id e span_id automaticamente aqui
  base: {
    'service.name': 'uploadService',
    'service.version': vars.SERVICE_VERSION,
  },
  transport: isDev
    ? {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'SYS:standard',
          ignore: 'pid,hostname',
        },
      }
    : undefined, // Em prod, envia JSON via stdout
});

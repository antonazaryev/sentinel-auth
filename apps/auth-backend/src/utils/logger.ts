import pino from 'pino';
import { config } from '../config';

export const logger = pino({
  level: config.logging.level,
  transport: {
    target: 'pino-pretty',
    options: {
      translateTime: 'HH:MM:ss Z',
      ignore: 'pid,hostname',
    },
  },
}); 
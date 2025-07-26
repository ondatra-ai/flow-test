import type { LogMetadata } from '../../types/utils/logger.types.js';

export interface ILogger {
  error(message: string, error: Error, meta?: LogMetadata): void;
  warn(message: string, meta?: LogMetadata): void;
  info(message: string, meta?: LogMetadata): void;
  debug(message: string, meta?: LogMetadata): void;
  log(message: string, meta?: LogMetadata): void;
}

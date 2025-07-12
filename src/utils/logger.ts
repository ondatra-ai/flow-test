import { injectable } from 'tsyringe';

import type { Logger, LogMetadata } from '../interfaces/utils/index.js';

/**
 * Log levels for the application
 */
export enum LogLevel {
  ERROR = 'error',
  WARN = 'warn',
  INFO = 'info',
  DEBUG = 'debug',
}

// Re-export for backward compatibility
export type { Logger } from '../interfaces/utils/index.js';

/**
 * Simple console logger implementation
 */
@injectable()
export class ConsoleLogger implements Logger {
  constructor(private readonly level: LogLevel = LogLevel.INFO) {}

  public error(message: string, meta?: LogMetadata): void {
    this.log(LogLevel.ERROR, message, meta);
  }

  public warn(message: string, meta?: LogMetadata): void {
    if (this.shouldLog(LogLevel.WARN)) {
      this.log(LogLevel.WARN, message, meta);
    }
  }

  public info(message: string, meta?: LogMetadata): void {
    if (this.shouldLog(LogLevel.INFO)) {
      this.log(LogLevel.INFO, message, meta);
    }
  }

  public debug(message: string, meta?: LogMetadata): void {
    if (this.shouldLog(LogLevel.DEBUG)) {
      this.log(LogLevel.DEBUG, message, meta);
    }
  }

  private shouldLog(level: LogLevel): boolean {
    const levels = [
      LogLevel.ERROR,
      LogLevel.WARN,
      LogLevel.INFO,
      LogLevel.DEBUG,
    ];
    return levels.indexOf(level) <= levels.indexOf(this.level);
  }

  private log(level: LogLevel, message: string, meta?: LogMetadata): void {
    const timestamp = new Date().toISOString();
    const metaString = meta ? ` ${JSON.stringify(meta)}` : '';
    if (level === LogLevel.ERROR) {
      console.error(
        `[${timestamp}] ${level.toUpperCase()}: ${message}${metaString}`
      );
    } else {
      console.log(
        `[${timestamp}] ${level.toUpperCase()}: ${message}${metaString}`
      );
    }
  }
}

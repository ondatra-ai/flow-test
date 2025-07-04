import { injectable } from 'tsyringe';

/**
 * Log levels for the application
 */
export enum LogLevel {
  ERROR = 'error',
  WARN = 'warn',
  INFO = 'info',
  DEBUG = 'debug',
}

/**
 * Logger interface for consistent logging across the application
 */
export interface Logger {
  error(message: string, meta?: Record<string, unknown>): void;
  warn(message: string, meta?: Record<string, unknown>): void;
  info(message: string, meta?: Record<string, unknown>): void;
  debug(message: string, meta?: Record<string, unknown>): void;
}

/**
 * Simple console logger implementation
 */
@injectable()
export class ConsoleLogger implements Logger {
  constructor(private readonly level: LogLevel = LogLevel.INFO) {}

  public error(message: string, meta?: Record<string, unknown>): void {
    this.log(LogLevel.ERROR, message, meta);
  }

  public warn(message: string, meta?: Record<string, unknown>): void {
    if (this.shouldLog(LogLevel.WARN)) {
      this.log(LogLevel.WARN, message, meta);
    }
  }

  public info(message: string, meta?: Record<string, unknown>): void {
    if (this.shouldLog(LogLevel.INFO)) {
      this.log(LogLevel.INFO, message, meta);
    }
  }

  public debug(message: string, meta?: Record<string, unknown>): void {
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

  private log(
    level: LogLevel,
    message: string,
    meta?: Record<string, unknown>
  ): void {
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

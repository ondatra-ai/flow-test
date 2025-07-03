import 'reflect-metadata';

import { container } from 'tsyringe';

import { Logger, ConsoleLogger, LogLevel } from '../utils/logger.js';

/**
 * Configure the dependency injection container
 */
export function configureContainer(): void {
  // Register Logger with ConsoleLogger implementation
  container.register<Logger>('Logger', {
    useFactory: () => new ConsoleLogger(LogLevel.INFO),
  });
}

/**
 * Export pre-configured container
 */
export { container };

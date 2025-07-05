import 'reflect-metadata';

import { container } from 'tsyringe';

import { Logger, ConsoleLogger, LogLevel } from '../utils/logger.js';

import { TOKENS } from './tokens.js';

/**
 * Configure the dependency injection container
 */
export function configureContainer(): void {
  // Register Logger with ConsoleLogger implementation as singleton
  container.register<Logger>(TOKENS.Logger, {
    useFactory: () => new ConsoleLogger(LogLevel.INFO),
  });
}

/**
 * Export pre-configured container
 */
export { container };

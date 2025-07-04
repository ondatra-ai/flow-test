import 'reflect-metadata';

import { container } from 'tsyringe';

import { Logger, ConsoleLogger } from '../utils/logger.js';

import { TOKENS } from './tokens.js';

/**
 * Configure the dependency injection container
 */
export function configureContainer(): void {
  // Register Logger with ConsoleLogger implementation as singleton
  container.registerSingleton<Logger>(TOKENS.Logger, ConsoleLogger);
}

/**
 * Export pre-configured container
 */
export { container };

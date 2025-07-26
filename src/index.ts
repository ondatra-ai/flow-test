#!/usr/bin/env node
import 'reflect-metadata';
import { program } from 'commander';
import { config } from 'dotenv';

// Load environment variables from .env file
config();

import { setupCliProgram, registerCommands } from './cli/setup.js';
import { initializeContainer, container } from './config/container.js';
import { SERVICES } from './config/tokens.js';
import type { ILogger } from './interfaces/utils/logger.interface.js';
import { cast, castError } from './utils/cast.js';

// Configure dependency injection container
initializeContainer();

/**
 * Main entry point for the Ondatra Code application
 *
 * This function orchestrates the CLI setup and parsing
 */
async function main(): Promise<void> {
  setupCliProgram(program);
  registerCommands(program);
  await program.parseAsync(process.argv);
}

main().catch(error => {
  const typedError = cast<Error>(error);
  const logger = container.resolve<ILogger>(SERVICES.Logger);
  logger.error('Failed to start application:', castError(typedError));
  process.exit(1);
});

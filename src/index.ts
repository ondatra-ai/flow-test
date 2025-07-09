#!/usr/bin/env node
import 'reflect-metadata';

import { program } from 'commander';

import { setupCliProgram, registerCommands } from './cli/setup.js';
import { initializeContainer, container } from './config/container.js';
import { SERVICES } from './config/tokens.js';
import type { Logger } from './utils/logger.js';

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

main().catch((error: unknown) => {
  const logger = container.resolve<Logger>(SERVICES.Logger);
  logger.error('Failed to start application:', {
    error: error instanceof Error ? error.message : String(error),
  });
  process.exit(1);
});

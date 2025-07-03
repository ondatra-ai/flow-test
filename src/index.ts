#!/usr/bin/env node
import 'reflect-metadata';

import { program } from 'commander';

import { container, configureContainer } from './config/container.js';
import { TOKENS } from './config/tokens.js';
import type { Logger } from './utils/logger.js';

// Configure dependency injection container
configureContainer();

/**
 * Main entry point for the Ondatra Code application
 *
 * This module sets up the CLI using Commander.js and provides
 * basic version information and help commands.
 */
async function main(): Promise<void> {
  const logger = container.resolve<Logger>(TOKENS.Logger);

  program
    .name('ondatra-code')
    .description(
      'Ondatra Code - An interactive conversational interface similar to claude-code'
    )
    .version('1.0.0');

  program
    .command('chat')
    .description('Start the chat interface')
    .action(() => {
      logger.info('Ondatra Code');
      // TODO: Initialize chat interface
    });

  // Default action
  program.action(() => {
    logger.info('Ondatra Code');
  });

  await program.parseAsync(process.argv);
}

main().catch((error: unknown) => {
  const logger = container.resolve<Logger>(TOKENS.Logger);
  logger.info('Ondatra Code');
  logger.error('Failed to start application:', {
    error: error instanceof Error ? error.message : String(error),
  });
  process.exit(1);
});

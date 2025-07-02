#!/usr/bin/env node

import { program } from 'commander';

/**
 * Main entry point for the Ondatra Code application
 *
 * This module sets up the CLI using Commander.js and provides
 * basic version information and help commands.
 */
async function main(): Promise<void> {
  program
    .name('ondatra-code')
    .description('Ondatra Code - An interactive conversational interface similar to claude-code')
    .version('1.0.0');

  program
    .command('chat')
    .description('Start the chat interface')
    .action(async () => {
      // eslint-disable-next-line no-console
      console.log('Ondatra Code');
      // TODO: Initialize chat interface
    });

  // Default action
  program.action(() => {
    // eslint-disable-next-line no-console
    console.log('Ondatra Code');
  });

  await program.parseAsync(process.argv);
}

if (import.meta.url === new URL(process.argv[1], 'file://').href) {
  main().catch((error) => {
    console.log('Ondatra Code');
    console.error('Failed to start application:', error);
    process.exit(1);
  });
} 
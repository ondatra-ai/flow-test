#!/usr/bin/env node

import { program } from 'commander';

/**
 * Main entry point for the Claude Code CLI application
 */
async function main(): Promise<void> {
  program
    .name('claude-code')
    .description('A TypeScript-based CLI application that clones claude-code functionality')
    .version('1.0.0');

  program
    .command('chat')
    .description('Start the chat interface')
    .action(async () => {
      // eslint-disable-next-line no-console
      console.log('Claude Code CLI');
      // TODO: Initialize chat interface
    });

  // Default action
  program.action(() => {
    // eslint-disable-next-line no-console
    console.log('Claude Code CLI');
  });

  await program.parseAsync(process.argv);
}

// Execute main function
main().catch((error: unknown) => {
  // eslint-disable-next-line no-console
  console.error('Error:', error);
  process.exit(1);
}); 
import { container, SERVICES } from '../config/container.js';
import type { Logger } from '../utils/logger.js';
import { generateTests } from '../utils/test-generator.js';

/**
 * Handle the chat command
 */
export function handleChatCommand(): void {
  const logger = container.resolve<Logger>(SERVICES.Logger);
  logger.info('Ondatra Code');
  // TODO: Initialize chat interface
}

/**
 * Handle the tests:generate command
 */
export async function handleTestsGenerateCommand(): Promise<void> {
  const logger = container.resolve<Logger>(SERVICES.Logger);
  try {
    await generateTests();
  } catch (error) {
    logger.error('Command failed:', {
      error: error instanceof Error ? error.message : String(error),
    });
    process.exit(1);
  }
}

/**
 * Handle the default action when no command is specified
 */
export function handleDefaultAction(): void {
  const logger = container.resolve<Logger>(SERVICES.Logger);
  logger.info('Ondatra Code');
}

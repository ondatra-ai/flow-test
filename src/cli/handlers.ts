import { container } from '../config/container.js';
import { SERVICES } from '../config/tokens.js';
import { Session } from '../flow/session/session.js';
import type { FlowManager } from '../utils/flow-manager.js';
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
    throw error;
  }
}

/**
 * Handle the flow:run command
 */
export async function handleFlowRunCommand(
  flowName: string,
  parameters: string[]
): Promise<void> {
  const logger = container.resolve<Logger>(SERVICES.Logger);
  const flowManager = container.resolve<FlowManager>(SERVICES.FlowManager);

  try {
    logger.info(`Loading flow: ${flowName}`);
    const flow = await flowManager.loadFlow(flowName);

    logger.info(`Starting flow execution: ${flowName}`);
    const session = new Session(flow);
    const context = session.getContext();

    // Inject parameters into context
    parameters.forEach((param, index) => {
      context.set(`param${index}`, param);
    });
    context.set('flowName', flowName);

    // Execute flow
    session.start();
    while (!session.isComplete()) {
      await session.executeCurrentStep();
    }

    logger.info(`Flow '${flowName}' completed successfully`);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error(`Flow execution failed: ${errorMessage}`);
    throw error;
  }
}

/**
 * Handle the default action when no command is specified
 */
export function handleDefaultAction(): void {
  const logger = container.resolve<Logger>(SERVICES.Logger);
  logger.info('Ondatra Code');
}

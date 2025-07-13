import { container } from '../config/container.js';
import { SERVICES } from '../config/tokens.js';
import { Session } from '../flow/session/session.js';
import type { IContext } from '../interfaces/flow/index.js';
import { cast, castError } from '../utils/cast.js';
import { FlowManager } from '../utils/flow-manager.js';
import { parseGitHubIssueUrl } from '../utils/github-url-parser.js';
import type { Logger } from '../utils/logger.js';
import { generateTests } from '../utils/test-generator.js';

/**
 * Handle GitHub issue URL option and populate context
 */
function handleGitHubIssueOption(
  githubIssue: string,
  context: IContext,
  logger: Logger
): void {
  try {
    const { owner, repo, issue_number } = parseGitHubIssueUrl(githubIssue);
    context.set('github.issue.url', githubIssue);
    context.set('github.issue.owner', owner);
    context.set('github.issue.repo', repo);
    context.set('github.issue.number', issue_number.toString());
  } catch (error) {
    const errorMessage =
      error instanceof Error
        ? error.message
        : 'Unknown error parsing GitHub URL';
    logger.error(
      `Failed to parse GitHub issue URL: ${errorMessage}`,
      castError(error)
    );
    throw error;
  }
}

/**
 * Setup flow parameters and context
 */
function setupFlowContext(
  parameters: string[],
  flowName: string,
  context: IContext
): void {
  parameters.forEach((param, index) => {
    context.set(`param${index}`, param);
  });
  context.set('flowName', flowName);
}

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
    logger.error('Command failed:', castError(error));
    throw error;
  }
}

/**
 * Handle the flow:run command
 */
// eslint-disable-next-line max-lines-per-function
export async function handleFlowRunCommand(
  flowName: string,
  parameters: string[],
  options?: { githubIssue?: string }
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
    setupFlowContext(parameters, flowName, context);

    // Handle GitHub issue URL if provided
    if (options?.githubIssue) {
      handleGitHubIssueOption(options.githubIssue, context, logger);
    }

    // Execute flow
    session.start();
    while (session.status === 'running') {
      await session.executeCurrentStep();
    }

    if (session.status === 'error') {
      throw new Error('Flow execution failed');
    }

    logger.info(`Flow '${flowName}' completed successfully`);
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : cast<string>(error);
    logger.error(`Flow execution failed: ${errorMessage}`, castError(error));
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

import { container } from '../config/container.js';
import { SERVICES } from '../config/tokens.js';
import { Session } from '../flow/session/session.js';
import type { IContext } from '../interfaces/flow/context.interface.js';
import type { ILogger } from '../interfaces/utils/logger.interface.js';
import { FlowManager } from '../utils/flow-manager.js';
import { parseGitHubIssueUrl } from '../utils/github-url-parser.js';

/**
 * Handle GitHub issue URL option and populate context
 */
function handleGitHubIssueOption(githubIssue: string, context: IContext): void {
  const { owner, repo, issue_number } = parseGitHubIssueUrl(githubIssue);
  context.set('github.issue.url', githubIssue);
  context.set('github.issue.owner', owner);
  context.set('github.issue.repo', repo);
  context.set('github.issue.number', issue_number.toString());
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
  const logger = container.resolve<ILogger>(SERVICES.Logger);
  logger.info('Ondatra Code');
  logger.info('Chat interface functionality is not yet implemented');
}

/**
 * Handle the flow:run command
 */
export async function handleFlowRunCommand(
  flowName: string,
  parameters: string[],
  options?: { githubIssue?: string }
): Promise<void> {
  const logger = container.resolve<ILogger>(SERVICES.Logger);
  const flowManager = container.resolve<FlowManager>(SERVICES.FlowManager);

  logger.info(`Loading flow: ${flowName}`);
  const flow = await flowManager.loadFlow(flowName);

  logger.info(`Starting flow execution: ${flowName}`);
  const session = new Session(flow, logger);
  const context = session.getContext();

  // Inject parameters into context
  setupFlowContext(parameters, flowName, context);

  // Handle GitHub issue URL if provided
  if (options?.githubIssue) {
    handleGitHubIssueOption(options.githubIssue, context);
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
}

/**
 * Handle the default action when no command is specified
 */
export function handleDefaultAction(): void {
  const logger = container.resolve<ILogger>(SERVICES.Logger);
  logger.info('Ondatra Code');
}

import { injectable, inject } from 'tsyringe';

import { SERVICES } from '../config/tokens.js';
import { GitHubClient } from '../utils/github-client.js';
import { Logger } from '../utils/logger.js';
import { validateStep } from '../validation/index.js';

import { Step } from './step.js';
import { ActionStep } from './types/action-step.js';
import { DecisionStep } from './types/decision-step.js';
import { LogStep } from './types/log-step.js';
import { ReadGitHubIssueStep } from './types/read-github-issue-step.js';

/**
 * Factory for creating typed step instances
 */
@injectable()
export class StepFactory {
  constructor(
    @inject(SERVICES.Logger) private readonly logger: Logger,
    @inject(SERVICES.GitHubClient) private readonly githubClient: GitHubClient
  ) {}

  /**
   * Create a step instance based on step data
   */
  createStep(stepData: unknown): Step {
    // Validate step data using Zod schema
    const validatedConfig = validateStep(stepData);

    // Create appropriate step instance based on type
    switch (validatedConfig.type) {
      case 'action':
        return new ActionStep(this.logger, validatedConfig);

      case 'decision':
        return new DecisionStep(this.logger, validatedConfig);

      case 'log':
        return new LogStep(this.logger, validatedConfig);

      case 'read-github-issue':
        return new ReadGitHubIssueStep(
          this.logger,
          this.githubClient,
          validatedConfig
        );

      default:
        // This should never happen since validateStep ensures valid types
        throw new Error(
          `Unknown step type: ${JSON.stringify(validatedConfig)}`
        );
    }
  }
}

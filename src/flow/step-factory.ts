import { injectable, inject } from 'tsyringe';

import { SERVICES } from '../config/tokens.js';
import type { StepConfig } from '../types/validation/index.js';
import { GitHubClient } from '../utils/github-client.js';
import { Logger } from '../utils/logger.js';

import type { IStep } from './step.js';
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
  createStep(stepData: StepConfig): IStep {
    // Create appropriate step instance based on type
    switch (stepData.type) {
      case 'action':
        return new ActionStep(this.logger, stepData);

      case 'decision':
        return new DecisionStep(this.logger, stepData);

      case 'log':
        return new LogStep(this.logger, stepData);

      case 'read-github-issue':
        return new ReadGitHubIssueStep(
          this.logger,
          this.githubClient,
          stepData
        );

      default:
        // This should never happen since Zod schema ensures valid types
        throw new Error(`Unknown step type: ${JSON.stringify(stepData)}`);
    }
  }
}

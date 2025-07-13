import { injectable, inject, container } from 'tsyringe';

import { SERVICES } from '../config/tokens.js';
import type { ILLMProvider } from '../interfaces/providers/index.js';
import type { StepConfig } from '../types/validation/index.js';
import { GitHubClient } from '../utils/github-client.js';
import { Logger } from '../utils/logger.js';

import type { IStep } from './step.js';
import { PlanGenerationStep } from './types/plan-generation-step.js';
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
      case 'read-github-issue':
        return new ReadGitHubIssueStep(
          this.logger,
          this.githubClient,
          stepData
        );

      case 'plan-generation': {
        const llmProvider = this.resolveLLMProvider(stepData.llm_provider);
        return new PlanGenerationStep(this.logger, llmProvider, stepData);
      }

      default:
        // This should never happen since Zod schema ensures valid types
        throw new Error(`Unknown step type: ${JSON.stringify(stepData)}`);
    }
  }

  /**
   * Resolve the appropriate LLM provider based on provider name
   */
  private resolveLLMProvider(
    providerName: 'openai' | 'claude' | 'gemini'
  ): ILLMProvider {
    switch (providerName) {
      case 'claude':
        return container.resolve<ILLMProvider>(SERVICES.ClaudeProvider);
      case 'openai':
        return container.resolve<ILLMProvider>(SERVICES.OpenAIProvider);
      case 'gemini':
        return container.resolve<ILLMProvider>(SERVICES.GeminiProvider);
      default:
        throw new Error(`Unsupported LLM provider: ${providerName as string}`);
    }
  }
}

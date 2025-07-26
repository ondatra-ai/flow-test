import { injectable, inject, container } from 'tsyringe';

import { SERVICES } from '../config/tokens.js';
import type { IStep } from '../interfaces/flow/step.interface.js';
import type { ILLMProvider } from '../interfaces/providers/index.js';
import type { StepConfig } from '../types/validation/index.js';
import { GitHubClient } from '../utils/github-client.js';
import { ILogger } from '../utils/logger.js';

import { PlanGenerationStep } from './types/plan-generation-step.js';
import { ReadGitHubIssueStep } from './types/read-github-issue-step.js';

/**
 * Helper function to ensure exhaustive type checking
 */
function assertNever(x: StepConfig): never {
  const stepType = x.type as string;
  const configJson = JSON.stringify(x, null, 2);
  throw new Error(
    `Unexpected step type: "${stepType}". Full step config: ${configJson}`
  );
}

/**
 * Factory for creating typed step instances
 */
@injectable()
export class StepFactory {
  constructor(
    @inject(SERVICES.Logger) private readonly logger: ILogger,
    @inject(SERVICES.GitHubClient) private readonly githubClient: GitHubClient
  ) {}

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
        return assertNever(stepData);
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
        // This should never happen, but keeping for TypeScript exhaustiveness
        throw new Error(`Unknown LLM provider: ${providerName as string}`);
    }
  }
}

import { inject, injectable } from 'tsyringe';

import { SERVICES } from '../../config/tokens.js';
import { type ILLMProvider } from '../../interfaces/providers/index.js';
import { castError } from '../../utils/cast.js';
import { Logger } from '../../utils/logger.js';
import { type PlanGenerationStepConfig } from '../../validation/index.js';
import { IContext } from '../context.js';
import { Step, IStep } from '../step.js';

/**
 * Flow step for generating execution plans from GitHub issue data
 */
@injectable()
export class PlanGenerationStep extends Step implements IStep {
  private readonly config: PlanGenerationStepConfig;
  private readonly llmProvider: ILLMProvider;

  constructor(
    @inject(SERVICES.Logger) logger: Logger,
    llmProvider: ILLMProvider,
    config: PlanGenerationStepConfig
  ) {
    super(
      config.id,
      `PlanGenerationStep: Generating plan`,
      config.nextStepId,
      logger
    );
    this.config = config;
    this.llmProvider = llmProvider;
  }

  public async execute(context: IContext): Promise<string | null> {
    this.logger.info(`Executing PlanGenerationStep: ${this.config.id}`);

    try {
      // Get issue data from context (set by ReadGitHubIssueStep)
      const issueTitle = context.get('github.issue.title') || 'Unknown Issue';
      const issueBody = context.get('github.issue.body') || '';
      const issueNumber = context.get('github.issue.number') || '';

      this.logger.info(
        `Generating plan for issue #${issueNumber}: "${issueTitle}"`
      );

      // Generate plan using LLM provider
      const plan = await this.generatePlan(issueTitle, issueBody);

      // Output the plan to console with clear markers
      this.logger.info('=== GENERATED PLAN ===');
      this.logger.info(plan);
      this.logger.info('=== END PLAN ===');

      this.logger.info('Plan generation completed successfully');

      return super.execute(context);
    } catch (error) {
      this.logger.error(`PlanGenerationStep failed`, castError(error), {
        stepId: this.config.id,
      });
      throw error;
    }
  }

  private async generatePlan(title: string, body: string): Promise<string> {
    const prompt =
      this.config.prompt_template ||
      `Generate a detailed execution plan for the following GitHub issue:

Title: ${title}
Description: ${body}

Please provide a structured plan with:
1. Overview
2. Requirements Analysis  
3. Implementation Steps
4. Success Criteria
5. Timeline

Format the response as markdown.`;

    const request = {
      prompt,
      signal: new AbortController().signal,
      model: this.config.model || 'gpt-3.5-turbo',
      temperature: this.config.temperature || 0.7,
      maxTokens: this.config.max_tokens || 2000,
      messages: [
        {
          role: 'user' as const,
          content: prompt,
        },
      ],
    };

    return await this.llmProvider.generate(request);
  }

  public getConfig(): PlanGenerationStepConfig {
    return this.config;
  }
}

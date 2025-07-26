import { inject, injectable } from 'tsyringe';

import { SERVICES } from '../../config/tokens.js';
import type { IContext } from '../../interfaces/flow/context.interface.js';
import type { IStep } from '../../interfaces/flow/step.interface.js';
import { type ILLMProvider } from '../../interfaces/providers/index.js';
import { ILogger } from '../../utils/logger.js';
import { type PlanGenerationStepConfig } from '../../validation/index.js';
import { Step } from '../step.js';

/**
 * Flow step for generating execution plans from GitHub issue data
 */
@injectable()
export class PlanGenerationStep extends Step implements IStep {
  private readonly config: PlanGenerationStepConfig;
  private readonly llmProvider: ILLMProvider;

  constructor(
    @inject(SERVICES.Logger) logger: ILogger,
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
  }

  private async generatePlan(title: string, body: string): Promise<string> {
    let prompt =
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

    // If using a custom prompt template, substitute template variables
    if (this.config.prompt_template) {
      prompt = prompt
        .replace(/\{\{github\.issue\.title\}\}/g, title)
        .replace(/\{\{github\.issue\.body\}\}/g, body);
    }

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

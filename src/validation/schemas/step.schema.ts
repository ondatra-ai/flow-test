import { z } from 'zod';

/**
 * Base schema for all step configurations
 */
const StepConfigBaseSchema = z.object({
  id: z.string().min(1, 'Step ID is required'),
  nextStepId: z.record(
    z.string(),
    z.string().min(1, 'Next step ID cannot be empty')
  ),
});

/**
 * Schema for ReadGitHubIssueStep configuration
 */
export const ReadGitHubIssueStepConfigSchema = StepConfigBaseSchema.extend({
  type: z.literal('read-github-issue'),
  issueUrl: z.string().url('Issue URL must be a valid URL'),
  github_token: z.string().optional(),
});

/**
 * Schema for PlanGenerationStep configuration
 */
export const PlanGenerationStepConfigSchema = StepConfigBaseSchema.extend({
  type: z.literal('plan-generation'),
  llm_provider: z.enum(['openai', 'claude', 'gemini']),
  prompt_template: z.string().optional(),
  model: z.string().optional(),
  max_tokens: z.number().optional(),
  temperature: z.number().optional(),
});

/**
 * Union schema for all step configurations
 */
export const StepConfigSchema = z.discriminatedUnion('type', [
  ReadGitHubIssueStepConfigSchema,
  PlanGenerationStepConfigSchema,
]);

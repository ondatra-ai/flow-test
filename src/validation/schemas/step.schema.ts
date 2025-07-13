import { z } from 'zod';

/**
 * Base schema for all step configurations
 */
const StepConfigBaseSchema = z.object({
  id: z.string().min(1, 'Step ID is required'),
  nextStepId: z.record(z.string().min(1, 'Next step ID cannot be empty')),
});

/**
 * Schema for ReadGitHubIssueStep configuration
 */
export const ReadGitHubIssueStepConfigSchema = StepConfigBaseSchema.extend({
  type: z.literal('read-github-issue'),
  issueUrl: z.string().url('Issue URL must be a valid URL'),
  github_token: z.string().optional(),
});

// Re-export for backward compatibility
export type { ReadGitHubIssueStepConfig } from '../../types/validation/index.js';

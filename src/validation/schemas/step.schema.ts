import { z } from 'zod';

/**
 * Base schema for all step configurations
 */
const StepConfigBaseSchema = z.object({
  id: z.string().min(1, 'Step ID is required'),
  nextStepId: z.record(z.string().min(1, 'Next step ID cannot be empty')),
});

/**
 * Schema for ActionStep configuration
 */
const ActionStepConfigSchema = StepConfigBaseSchema.extend({
  type: z.literal('action'),
  operation: z.enum(['setContext', 'removeContext', 'updateContext']),
  key: z.string().min(1, 'Key is required for action step'),
  value: z.string().optional(),
}).refine(
  data => {
    // Value is required for setContext and updateContext operations
    if (
      (data.operation === 'setContext' || data.operation === 'updateContext') &&
      !data.value
    ) {
      return false;
    }
    return true;
  },
  {
    message: 'Value is required for setContext and updateContext operations',
    path: ['value'],
  }
);

/**
 * Schema for DecisionStep configuration
 */
const DecisionStepConfigSchema = StepConfigBaseSchema.extend({
  type: z.literal('decision'),
  condition: z.string().min(1, 'Condition is required for decision step'),
  contextKey: z.string().min(1, 'Context key is required for decision step'),
  trueValue: z.string().min(1, 'True value is required for decision step'),
  falseValue: z.string().min(1, 'False value is required for decision step'),
});

/**
 * Schema for LogStep configuration
 */
const LogStepConfigSchema = StepConfigBaseSchema.extend({
  type: z.literal('log'),
  message: z.string().min(1, 'Message is required for log step'),
  level: z.enum(['error', 'warn', 'info', 'debug']),
});

/**
 * Schema for ReadGitHubIssueStep configuration
 */
const ReadGitHubIssueStepConfigSchema = StepConfigBaseSchema.extend({
  type: z.literal('read-github-issue'),
  issueUrl: z.string().url('Issue URL must be a valid URL'),
  includeComments: z.boolean().optional().default(true),
  github_token: z.string().optional(),
});

/**
 * Union schema for all step configurations
 */
export const StepConfigSchema = z.union([
  ActionStepConfigSchema,
  DecisionStepConfigSchema,
  LogStepConfigSchema,
  ReadGitHubIssueStepConfigSchema,
]);

/**
 * Normalize step type to lowercase for case-insensitive validation
 */
export function normalizeStepType(data: unknown): unknown {
  if (typeof data === 'object' && data !== null && 'type' in data) {
    const typedData = data as Record<string, unknown>;
    return {
      ...typedData,
      type:
        typeof typedData.type === 'string'
          ? typedData.type.toLowerCase()
          : typedData.type,
    };
  }
  return data;
}

/**
 * Zod-inferred types for step configurations
 */
export type StepConfig = z.infer<typeof StepConfigSchema>;
export type ActionStepConfig = z.infer<typeof ActionStepConfigSchema>;
export type DecisionStepConfig = z.infer<typeof DecisionStepConfigSchema>;
export type LogStepConfig = z.infer<typeof LogStepConfigSchema>;
export type ReadGitHubIssueStepConfig = z.infer<
  typeof ReadGitHubIssueStepConfigSchema
>;

import type { z } from 'zod';

import { FlowConfigSchema } from '../../validation/schemas/flow.schema.js';
import {
  ReadGitHubIssueStepConfigSchema,
  PlanGenerationStepConfigSchema,
} from '../../validation/schemas/step.schema.js';

// Flow types
export type FlowConfig = z.infer<typeof FlowConfigSchema>;

// Extract specific step types
export type ReadGitHubIssueStepConfig = z.infer<
  typeof ReadGitHubIssueStepConfigSchema
>;

export type PlanGenerationStepConfig = z.infer<
  typeof PlanGenerationStepConfigSchema
>;

// Union type for all step configurations
export type StepConfig = ReadGitHubIssueStepConfig | PlanGenerationStepConfig;

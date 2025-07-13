import type { z } from 'zod';

import { FlowConfigSchema } from '../../validation/schemas/flow.schema.js';
import { ReadGitHubIssueStepConfigSchema } from '../../validation/schemas/step.schema.js';

// Flow types
export type FlowConfig = z.infer<typeof FlowConfigSchema>;

// Extract specific step types
export type ReadGitHubIssueStepConfig = z.infer<
  typeof ReadGitHubIssueStepConfigSchema
>;

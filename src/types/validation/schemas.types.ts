import type { z } from 'zod';

import { FlowConfigSchema } from '../../validation/schemas/flow.schema.js';
import { StepConfigSchema } from '../../validation/schemas/step.schema.js';

// Flow types
export type FlowConfig = z.infer<typeof FlowConfigSchema>;

// Step types - we need to create these based on discriminated union
export type StepConfig = z.infer<typeof StepConfigSchema>;

// Extract specific step types from the union
export type ReadGitHubIssueStepConfig = Extract<
  StepConfig,
  { type: 'read-github-issue' }
>;

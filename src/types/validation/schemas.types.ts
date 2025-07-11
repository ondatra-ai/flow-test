import type { z } from 'zod';

import { FlowDefinitionSchema } from '../../validation/schemas/flow.schema.js';
import { StepConfigSchema } from '../../validation/schemas/step.schema.js';

// Flow types
export type FlowDefinition = z.infer<typeof FlowDefinitionSchema>;

// Step types - we need to create these based on discriminated union
export type StepConfig = z.infer<typeof StepConfigSchema>;

// Extract specific step types from the union
export type ActionStepConfig = Extract<StepConfig, { type: 'action' }>;
export type DecisionStepConfig = Extract<StepConfig, { type: 'decision' }>;
export type LogStepConfig = Extract<StepConfig, { type: 'log' }>;
export type ReadGitHubIssueStepConfig = Extract<
  StepConfig,
  { type: 'read-github-issue' }
>;

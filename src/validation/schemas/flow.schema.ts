import { z } from 'zod';

import { StepConfigSchema } from './step.schema.js';

/**
 * Schema for flow definition validation
 */
export const FlowDefinitionSchema = z
  .object({
    id: z.string().min(1, 'Flow ID is required'),
    name: z.string().optional(),
    description: z.string().optional(),
    steps: z.array(StepConfigSchema).min(1, 'Flow must have at least one step'),
  })
  .refine(
    data => {
      // Validate that all step references exist
      const stepIds = new Set(data.steps.map(step => step.id));

      for (const step of data.steps) {
        if (!step.nextStepId || typeof step.nextStepId !== 'object') {
          throw new Error(
            `Invalid nextStepId for step '${step.id}': must be an object`
          );
        }

        for (const [, refStepId] of Object.entries(step.nextStepId)) {
          if (typeof refStepId !== 'string') {
            throw new Error(
              `Invalid step reference in nextStepId for step '${step.id}': ` +
                `must be string`
            );
          }
          if (!stepIds.has(refStepId)) {
            return false;
          }
        }
      }

      return true;
    },
    {
      message: 'All step references in nextStepId must point to existing steps',
    }
  );

/**
 * Zod-inferred type for flow definition
 */
export type FlowDefinition = z.infer<typeof FlowDefinitionSchema>;

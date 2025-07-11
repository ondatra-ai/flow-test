import { ZodError } from 'zod';

import {
  FlowDefinitionSchema,
  type FlowDefinition,
} from './schemas/flow.schema.js';
import {
  StepConfigSchema,
  type StepConfig,
  normalizeStepType,
} from './schemas/step.schema.js';

/**
 * Format Zod validation errors into user-friendly messages
 */
function formatValidationError(error: ZodError): string {
  const messages = error.issues.map(issue => {
    const path = issue.path.join('.');
    const pathStr = path ? `${path}: ` : '';
    return `${pathStr}${issue.message}`;
  });

  return `Validation failed:\n${messages.join('\n')}`;
}

/**
 * Validate flow data against schema
 */
export function validateFlow(data: unknown): FlowDefinition {
  try {
    const normalizedData = normalizeStepData(data);
    return FlowDefinitionSchema.parse(normalizedData);
  } catch (error) {
    if (error instanceof ZodError) {
      throw new Error(formatValidationError(error));
    }
    throw error;
  }
}

/**
 * Normalize step data for case-insensitive validation
 */
function normalizeStepData(data: unknown): unknown {
  if (typeof data === 'object' && data !== null) {
    if (Array.isArray(data)) {
      return data.map(normalizeStepData);
    }

    const typedData = data as Record<string, unknown>;
    const normalized = { ...typedData };

    if ('steps' in normalized && Array.isArray(normalized.steps)) {
      normalized.steps = normalized.steps.map(normalizeStepType);
    }

    return normalized;
  }

  return data;
}

/**
 * Validate step data against schema
 */
export function validateStep(data: unknown): StepConfig {
  try {
    const normalizedData = normalizeStepType(data);
    return StepConfigSchema.parse(normalizedData);
  } catch (error) {
    if (error instanceof ZodError) {
      throw new Error(formatValidationError(error));
    }
    throw error;
  }
}

import { vi } from 'vitest';

import { StepFactory } from '../../../src/flow/step-factory.js';
import { Logger } from '../../../src/utils/logger.js';

// Test data
export const VALID_FLOW_DATA = {
  id: 'test-flow',
  name: 'Test Flow',
  description: 'A test flow',
  steps: [
    {
      id: 'step1',
      type: 'log',
      message: 'First step',
      level: 'info',
      nextStepId: { default: 'step2' },
    },
    {
      id: 'step2',
      type: 'log',
      message: 'Second step',
      level: 'info',
      nextStepId: {},
    },
  ],
};

export const DYNAMIC_FLOW_DATA = {
  id: 'dynamic-flow',
  steps: [
    {
      id: 'router',
      type: 'decision',
      message: 'Router step',
      condition: 'context.workflow === "bug"',
      contextKey: 'route',
      trueValue: 'bug',
      falseValue: 'feature',
      nextStepId: {
        bug: 'bug-step',
        feature: 'feature-step',
        default: 'end-step',
      },
    },
    {
      id: 'bug-step',
      type: 'log',
      message: 'Bug step',
      level: 'info',
      nextStepId: {},
    },
    {
      id: 'feature-step',
      type: 'log',
      message: 'Feature step',
      level: 'info',
      nextStepId: {},
    },
    {
      id: 'end-step',
      type: 'log',
      message: 'End step',
      level: 'info',
      nextStepId: {},
    },
  ],
};

// Helper functions
export function createMockLogger(): Logger {
  return {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn(),
  } as unknown as Logger;
}

export function createMockStepFactory(): StepFactory {
  const factory = {
    createStep: vi.fn().mockImplementation((stepData: unknown) => {
      const data = stepData as { id: string };
      // Create a simple mock step
      return {
        getId: (): string => data.id,
        execute: vi.fn().mockResolvedValue(null),
      };
    }),
  } as unknown as StepFactory;
  return factory;
}

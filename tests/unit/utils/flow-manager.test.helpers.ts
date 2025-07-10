import { vi } from 'vitest';

import { StepFactory } from '../../../src/flow/step-factory.js';
import { Logger } from '../../../src/utils/logger.js';

/**
 * Test data factory for creating flow test data
 */
export class FlowTestDataFactory {
  /**
   * Create a basic log step
   */
  static createLogStep(
    id: string,
    message: string,
    nextStepId: Record<string, string> = {}
  ): Record<string, unknown> {
    return {
      id,
      type: 'log',
      message,
      level: 'info',
      nextStepId,
    };
  }

  /**
   * Create a decision step with configuration object
   */
  static createDecisionStep(
    id: string,
    condition: string,
    nextStepId: Record<string, string>,
    options: {
      contextKey?: string;
      trueValue?: string;
      falseValue?: string;
    } = {}
  ): Record<string, unknown> {
    const {
      contextKey = 'route',
      trueValue = 'true',
      falseValue = 'false',
    } = options;

    return {
      id,
      type: 'decision',
      condition,
      contextKey,
      trueValue,
      falseValue,
      nextStepId,
    };
  }

  /**
   * Create a complete flow with multiple steps
   */
  static createFlow(
    id: string,
    steps: Record<string, unknown>[],
    name?: string,
    description?: string
  ): Record<string, unknown> {
    return {
      id,
      ...(name && { name }),
      ...(description && { description }),
      steps,
    };
  }
}

// Test data using the factory
export const VALID_FLOW_DATA = FlowTestDataFactory.createFlow(
  'test-flow',
  [
    FlowTestDataFactory.createLogStep('step1', 'First step', {
      default: 'step2',
    }),
    FlowTestDataFactory.createLogStep('step2', 'Second step', {}),
  ],
  'Test Flow',
  'A test flow'
);

export const DYNAMIC_FLOW_DATA = FlowTestDataFactory.createFlow(
  'dynamic-flow',
  [
    FlowTestDataFactory.createDecisionStep(
      'router',
      'context.workflow === "bug"',
      { bug: 'bug-step', feature: 'feature-step', default: 'end-step' }
    ),
    FlowTestDataFactory.createLogStep('bug-step', 'Bug step'),
    FlowTestDataFactory.createLogStep('feature-step', 'Feature step'),
    FlowTestDataFactory.createLogStep('end-step', 'End step'),
  ]
);

/**
 * Mock factory for creating test mocks
 */
export class MockFactory {
  /**
   * Create a mock logger with all required methods
   */
  static createLogger(): Logger {
    return {
      info: vi.fn(),
      error: vi.fn(),
      warn: vi.fn(),
      debug: vi.fn(),
    } as unknown as Logger;
  }

  /**
   * Create a mock step factory
   */
  static createStepFactory(): StepFactory {
    return {
      createStep: vi.fn().mockImplementation((stepData: unknown) => {
        const data = stepData as { id: string };
        // Create a simple mock step
        return {
          getId: (): string => data.id,
          execute: vi.fn().mockResolvedValue(null),
        };
      }),
    } as unknown as StepFactory;
  }
}

// Legacy exports for backward compatibility
export const createMockLogger = (): Logger => MockFactory.createLogger();
export const createMockStepFactory = (): StepFactory =>
  MockFactory.createStepFactory();

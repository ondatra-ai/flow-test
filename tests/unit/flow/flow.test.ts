import { describe, it, expect, vi, beforeEach } from 'vitest';

import { Context } from '../../../src/flow/context.js';
import { Flow } from '../../../src/flow/flow.js';
import { Step } from '../../../src/flow/step.js';
import { Logger } from '../../../src/utils/logger.js';

// Mock logger functions
const mockLoggerInfo = vi.fn();
const mockLoggerError = vi.fn();
const mockLoggerDebug = vi.fn();
const mockLoggerWarn = vi.fn();

const mockLogger = {
  info: mockLoggerInfo,
  error: mockLoggerError,
  debug: mockLoggerDebug,
  warn: mockLoggerWarn,
} as unknown as Logger;

// Helper function to create mock steps
function createMockSteps(): Step[] {
  return [
    new Step('step1', 'Step 1 executed', { default: 'step2' }, mockLogger),
    new Step('step2', 'Step 2 executed', {}, mockLogger),
  ];
}

// Helper function to create mock steps with more variety
function createMultipleSteps(): Step[] {
  return [
    new Step('start', 'Start step', { default: 'middle' }, mockLogger),
    new Step('middle', 'Middle step', { default: 'end' }, mockLogger),
    new Step('end', 'End step', {}, mockLogger),
  ];
}

// Helper function to clear mocks
function clearMocks(): void {
  mockLoggerInfo.mockClear();
  mockLoggerError.mockClear();
  mockLoggerDebug.mockClear();
  mockLoggerWarn.mockClear();
}

describe('Flow', () => {
  beforeEach(clearMocks);

  describe('constructor', () => {
    it('should create a flow with steps and initialStepId', () => {
      const mockSteps = createMockSteps();
      const flow = new Flow('test-flow', mockSteps, 'step1');
      expect(flow.getSteps()).toHaveLength(2);
      expect(flow.getFirstStepId()).toBe('step1');
    });

    it('should create a flow with custom initialStepId', () => {
      const mockSteps = createMockSteps();
      const flow = new Flow('test-flow', mockSteps, 'step2');
      expect(flow.getSteps()).toHaveLength(2);
      expect(flow.getFirstStepId()).toBe('step2');
    });

    it('should throw error for invalid initialStepId', () => {
      const mockSteps = createMockSteps();
      expect(() => {
        new Flow('test-flow', mockSteps, 'invalid-step');
      }).toThrow("Initial step 'invalid-step' not found in flow steps");
    });

    it('should throw error for empty initialStepId', () => {
      const mockSteps = createMockSteps();
      expect(() => {
        new Flow('test-flow', mockSteps, '');
      }).toThrow('Initial step ID is required');
    });

    it('should throw error for missing initialStepId', () => {
      const mockSteps = createMockSteps();
      expect(() => {
        // @ts-expect-error - Testing runtime behavior with missing parameter
        new Flow('test-flow', mockSteps);
      }).toThrow('Initial step ID is required');
    });

    it('should handle empty flow with any initialStepId', () => {
      expect(() => {
        new Flow('empty-flow', [], 'any-step');
      }).toThrow("Initial step 'any-step' not found in flow steps");
    });
  });

  describe('getId', () => {
    it('should return the flow id', () => {
      const mockSteps = createMockSteps();
      const flow = new Flow('test-flow', mockSteps, 'step1');
      expect(flow.getId()).toBe('test-flow');
    });
  });
});

describe('Flow getFirstStepId', () => {
  beforeEach(clearMocks);

  it('should return the configured initialStepId', () => {
    const mockSteps = createMockSteps();
    const flow = new Flow('test-flow', mockSteps, 'step1');
    const firstStepId = flow.getFirstStepId();

    expect(firstStepId).toBeDefined();
    expect(firstStepId).toBe('step1');
  });

  it('should return configured initialStepId when set to different step', () => {
    const mockSteps = createMultipleSteps();
    const flow = new Flow('test-flow', mockSteps, 'middle');
    const firstStepId = flow.getFirstStepId();

    expect(firstStepId).toBeDefined();
    expect(firstStepId).toBe('middle');
  });

  it('should return configured initialStepId even if it is not the first in array', () => {
    const mockSteps = createMultipleSteps();
    const flow = new Flow('test-flow', mockSteps, 'end');
    const firstStepId = flow.getFirstStepId();

    expect(firstStepId).toBeDefined();
    expect(firstStepId).toBe('end');
  });

  it('should return undefined for empty flow', () => {
    // Note: This test is no longer valid since we can't create an empty flow
    // with a valid initialStepId. Keeping for documentation but it will throw
    expect(() => {
      new Flow('empty-flow', [], 'any-step');
    }).toThrow("Initial step 'any-step' not found in flow steps");
  });
});

describe('Flow getSteps', () => {
  beforeEach(clearMocks);

  it('should return all steps', () => {
    const mockSteps = createMockSteps();
    const flow = new Flow('test-flow', mockSteps, 'step1');
    const steps = flow.getSteps();

    expect(steps).toHaveLength(2);
    expect(steps[0].getId()).toBe('step1');
    expect(steps[1].getId()).toBe('step2');
  });
});

describe('Flow execute', () => {
  beforeEach(clearMocks);

  it('should execute step by id and return next step id', async () => {
    const mockSteps = createMockSteps();
    const flow = new Flow('test-flow', mockSteps, 'step1');
    const context = new Context();
    const result = await flow.execute('step1', context);

    expect(result).toBe('step2');
    expect(mockLoggerInfo).toHaveBeenCalledWith('Step 1 executed');
  });

  it('should execute end step and return null', async () => {
    const mockSteps = createMockSteps();
    const flow = new Flow('test-flow', mockSteps, 'step1');
    const context = new Context();
    const result = await flow.execute('step2', context);

    expect(result).toBe(null);
    expect(mockLoggerInfo).toHaveBeenCalledWith('Step 2 executed');
  });

  it('should return null for non-existent step', async () => {
    const mockSteps = createMockSteps();
    const flow = new Flow('test-flow', mockSteps, 'step1');
    const context = new Context();
    const result = await flow.execute('non-existent', context);

    expect(result).toBe(null);
  });

  it('should support dynamic routing with context', async () => {
    const dynamicStep = new Step(
      'dynamic-step',
      'Dynamic routing step',
      {
        bug: 'bug-step',
        feature: 'feature-step',
        default: 'default-step',
      },
      mockLogger
    );
    const flow = new Flow('test-flow', [dynamicStep], 'dynamic-step');
    const context = new Context();
    context.set('nextStep', 'bug');

    const result = await flow.execute('dynamic-step', context);

    expect(result).toBe('bug-step');
    expect(mockLoggerInfo).toHaveBeenCalledWith('Dynamic routing step');
  });
});

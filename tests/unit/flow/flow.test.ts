import { describe, it, expect, vi, beforeEach } from 'vitest';

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
    new Step('step1', 'Step 1 executed', 'step2', mockLogger),
    new Step('step2', 'Step 2 executed', null, mockLogger),
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
    it('should create a flow with steps', () => {
      const mockSteps = createMockSteps();
      const flow = new Flow('test-flow', mockSteps);
      expect(flow.getSteps()).toHaveLength(2);
    });
  });
});

describe('Flow getFirstStepId', () => {
  beforeEach(clearMocks);

  it('should return the first step id', () => {
    const mockSteps = createMockSteps();
    const flow = new Flow('test-flow', mockSteps);
    const firstStepId = flow.getFirstStepId();

    expect(firstStepId).toBeDefined();
    expect(firstStepId).toBe('step1');
  });

  it('should return undefined for empty flow', () => {
    const emptyFlow = new Flow('empty-flow', []);
    const firstStepId = emptyFlow.getFirstStepId();

    expect(firstStepId).toBeUndefined();
  });
});

describe('Flow getNextStepId', () => {
  beforeEach(clearMocks);

  it('should return the next step id when it exists', () => {
    const mockSteps = createMockSteps();
    const flow = new Flow('test-flow', mockSteps);
    const nextStepId = flow.getNextStepId('step1');

    expect(nextStepId).toBeDefined();
    expect(nextStepId).toBe('step2');
  });

  it('should return undefined when next step does not exist', () => {
    const mockSteps = createMockSteps();
    const flow = new Flow('test-flow', mockSteps);
    const nextStepId = flow.getNextStepId('step2');

    expect(nextStepId).toBeUndefined();
  });
});

describe('Flow getSteps', () => {
  beforeEach(clearMocks);

  it('should return all steps', () => {
    const mockSteps = createMockSteps();
    const flow = new Flow('test-flow', mockSteps);
    const steps = flow.getSteps();

    expect(steps).toHaveLength(2);
    expect(steps[0].getId()).toBe('step1');
    expect(steps[1].getId()).toBe('step2');
  });
});

describe('Flow execute', () => {
  beforeEach(clearMocks);

  it('should execute step by id successfully', async () => {
    const mockSteps = createMockSteps();
    const flow = new Flow('test-flow', mockSteps);
    const result = await flow.execute('step1');

    expect(result).toBe(true);
    expect(mockLoggerInfo).toHaveBeenCalledWith('Step 1 executed');
  });

  it('should return false for non-existent step', async () => {
    const mockSteps = createMockSteps();
    const flow = new Flow('test-flow', mockSteps);
    const result = await flow.execute('non-existent');

    expect(result).toBe(false);
  });
});

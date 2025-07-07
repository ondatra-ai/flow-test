import { describe, it, expect, vi, beforeEach } from 'vitest';

import { Flow } from '../../../../src/flow/flow.js';
import { Session } from '../../../../src/flow/session/session.js';
import { Step } from '../../../../src/flow/step.js';
import { Logger } from '../../../../src/utils/logger.js';

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

const mockSteps = [
  new Step('step1', 'Step 1 executed', 'step2', mockLogger),
  new Step('step2', 'Step 2 executed', null, mockLogger),
];

describe('Session', (): void => {
  beforeEach((): void => {
    mockLoggerInfo.mockClear();
    mockLoggerError.mockClear();
    mockLoggerDebug.mockClear();
    mockLoggerWarn.mockClear();
  });
});

describe('Session start', (): void => {
  it('should throw error when flow has no steps', (): void => {
    const emptyFlow = new Flow('empty-flow', []);
    const session = new Session(emptyFlow);

    expect(() => session.start()).toThrow('Flow has no steps');
  });

  it('should throw error when session is already started', (): void => {
    const flow = new Flow('test-flow', mockSteps);
    const session = new Session(flow);

    session.start();
    expect(() => session.start()).toThrow(
      'Session is already started or completed'
    );
  });
});

describe('Session executeCurrentStep', (): void => {
  it('should throw error when session is not running', async (): Promise<void> => {
    const flow = new Flow('test-flow', mockSteps);
    const session = new Session(flow);

    // Don't start the session
    await expect(session.executeCurrentStep()).rejects.toThrow(
      'Session is not running or has no current step'
    );
  });

  it('should handle step execution failure', async (): Promise<void> => {
    // Create a mock flow that will return false for execute
    const mockFlow = {
      getFirstStepId: (): string => 'step1',
      getNextStepId: (): string | null => null,
      execute: vi.fn().mockResolvedValue(false),
      getId: (): string => 'test-flow',
      getSteps: (): Step[] => mockSteps,
    };

    const session = new Session(mockFlow);
    session.start();

    const result = await session.executeCurrentStep();
    expect(result).toBe(false);
    expect(mockFlow.execute).toHaveBeenCalledWith('step1');
  });

  it('should throw error when session is completed', async (): Promise<void> => {
    const flow = new Flow('test-flow', mockSteps);
    const session = new Session(flow);

    session.start();

    // Execute all steps until completion
    while (!session.isComplete()) {
      await session.executeCurrentStep();
    }

    // Now try to execute when session is complete
    await expect(session.executeCurrentStep()).rejects.toThrow(
      'Session is not running or has no current step'
    );
  });
});

describe('Session two-step flow execution', (): void => {
  it('should execute two-step flow with logging and automatic advancement', async (): Promise<void> => {
    const flow = new Flow('test-flow', mockSteps);
    const session = new Session(flow);

    // Start session
    session.start();

    // Execute step 1 (automatically advances to step 2)
    const result1 = await session.executeCurrentStep();
    expect(result1).toBe(true);
    expect(mockLoggerInfo).toHaveBeenCalledWith('Step 1 executed');

    // Execute step 2 (automatically completes session)
    const result2 = await session.executeCurrentStep();
    expect(result2).toBe(true);
    expect(mockLoggerInfo).toHaveBeenCalledWith('Step 2 executed');
    expect(session.isComplete()).toBe(true);

    // Verify all logging calls
    expect(mockLoggerInfo).toHaveBeenCalledWith('Step 1 executed');
    expect(mockLoggerInfo).toHaveBeenCalledWith('Step 2 executed');
  });

  it('should handle complete flow execution in simple loop', async (): Promise<void> => {
    const flow = new Flow('test-flow', mockSteps);
    const session = new Session(flow);

    // Start session
    session.start();

    // Execute flow until completion
    while (!session.isComplete()) {
      await session.executeCurrentStep();
    }

    // Verify final state
    expect(session.isComplete()).toBe(true);

    // Verify all steps were logged
    expect(mockLoggerInfo).toHaveBeenCalledWith('Step 1 executed');
    expect(mockLoggerInfo).toHaveBeenCalledWith('Step 2 executed');
  });
});

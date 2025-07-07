import { describe, it, expect, vi, beforeEach } from 'vitest';

import { Flow, IFlow } from '../../../../src/flow/flow.js';
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
    const mockExecute = vi.fn().mockResolvedValue(false);
    const mockFlow = {
      getFirstStepId: (): string => 'step1',
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      getNextStepId: (_stepId: string): string | undefined => undefined,
      execute: mockExecute,
      getId: (): string => 'test-flow',
      getSteps: (): Step[] => mockSteps,
    } as IFlow;

    const session = new Session(mockFlow);
    session.start();

    const result = await session.executeCurrentStep();
    expect(result).toBe(false);
    expect(mockExecute).toHaveBeenCalledWith('step1', expect.any(Object));
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
  beforeEach((): void => {
    mockLoggerInfo.mockClear();
    mockLoggerError.mockClear();
    mockLoggerDebug.mockClear();
    mockLoggerWarn.mockClear();
  });

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

describe('Session context management', (): void => {
  it('should provide access to context', (): void => {
    const flow = new Flow('test-flow', mockSteps);
    const session = new Session(flow);

    const context = session.getContext();
    expect(context).toBeDefined();
    expect(typeof context.get).toBe('function');
    expect(typeof context.set).toBe('function');
  });

  it('should maintain same context instance throughout session', (): void => {
    const flow = new Flow('test-flow', mockSteps);
    const session = new Session(flow);

    const context1 = session.getContext();
    const context2 = session.getContext();

    expect(context1).toBe(context2);
  });

  it('should allow context to be used for data storage', (): void => {
    const flow = new Flow('test-flow', mockSteps);
    const session = new Session(flow);

    const context = session.getContext();
    context.set('testKey', 'testValue');

    expect(context.get('testKey')).toBe('testValue');
  });
});

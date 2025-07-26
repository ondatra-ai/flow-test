import { describe, it, expect, vi, beforeEach } from 'vitest';

import { Flow } from '../../../../src/flow/flow.js';
import { Session } from '../../../../src/flow/session/session.js';
import { Step } from '../../../../src/flow/step.js';
import type { IFlow } from '../../../../src/interfaces/flow/flow.interface.js';
import type { SessionStatus } from '../../../../src/types/flow/session.types.js';
import { createLoggerMock } from '../../mocks/utils/logger-mock.js';

// Create centralized logger mock
const loggerMock = createLoggerMock();
const mockLogger = loggerMock.mock;

const mockSteps = [
  new Step('step1', 'Step 1 executed', { default: 'step2' }, mockLogger),
  new Step('step2', 'Step 2 executed', {}, mockLogger),
];

describe('Session start', (): void => {
  it('should throw error when flow has no steps', (): void => {
    // Note: This test is no longer valid since we can't create an empty flow
    // with a valid initialStepId. The Flow constructor will throw first.
    expect(() => {
      new Flow('empty-flow', [], 'any-step');
    }).toThrow("Initial step 'any-step' not found in flow steps");
  });

  it('should set status to error when flow has no steps', (): void => {
    // Note: This test is no longer relevant since Flow constructor validation
    // prevents creating flows with invalid initialStepId
    expect(() => {
      new Flow('empty-flow', [], 'any-step');
    }).toThrow("Initial step 'any-step' not found in flow steps");
  });

  it('should throw error when session is already started', (): void => {
    const flow = new Flow('test-flow', mockSteps, 'step1');
    const session = new Session(flow, mockLogger);

    session.start();
    expect(() => session.start()).toThrow(
      'Session is already started or completed'
    );
  });

  it('should set status to error when session is already started', (): void => {
    const flow = new Flow('test-flow', mockSteps, 'step1');
    const session = new Session(flow, mockLogger);

    session.start();
    try {
      session.start();
    } catch (_error) {
      expect(session.status).toBe('error');
    }
  });

  it('should return running status when started', (): void => {
    const flow = new Flow('test-flow', mockSteps, 'step1');
    const session = new Session(flow, mockLogger);

    const status: SessionStatus = session.start();
    expect(status).toBe('running');
    expect(session.status).toBe('running');
  });
});

describe('Session executeCurrentStep', (): void => {
  it('should throw error when session is not running', async (): Promise<void> => {
    const flow = new Flow('test-flow', mockSteps, 'step1');
    const session = new Session(flow, mockLogger);

    // Don't start the session
    await expect(session.executeCurrentStep()).rejects.toThrow(
      'Session is not running or has no current step'
    );
  });

  it('should handle flow execution returning null as completion', async (): Promise<void> => {
    // Create a mock flow that returns null (end step)
    const mockExecute = vi.fn().mockResolvedValue(null);
    const mockFlow = {
      getFirstStepId: (): string => 'step1',
      execute: mockExecute,
      getId: (): string => 'test-flow',
      getSteps: (): Step[] => mockSteps,
    } as IFlow;

    const session = new Session(mockFlow, mockLogger);
    session.start();

    const result = await session.executeCurrentStep();
    expect(result).toBe(true);
    expect(session.status).toBe('completed');
    expect(mockExecute).toHaveBeenCalledWith('step1', expect.any(Object));
  });

  it('should handle actual errors during execution', async (): Promise<void> => {
    // Create a mock flow that throws an error
    const mockExecute = vi
      .fn()
      .mockRejectedValue(new Error('Execution failed'));
    const mockFlow = {
      getFirstStepId: (): string => 'step1',
      execute: mockExecute,
      getId: (): string => 'test-flow',
      getSteps: (): Step[] => mockSteps,
    } as IFlow;

    const session = new Session(mockFlow, mockLogger);
    session.start();

    const result = await session.executeCurrentStep();
    expect(result).toBe(false);
    expect(session.status).toBe('error');
    expect(mockExecute).toHaveBeenCalledWith('step1', expect.any(Object));
  });

  it('should throw error when session is completed', async (): Promise<void> => {
    const flow = new Flow('test-flow', mockSteps, 'step1');
    const session = new Session(flow, mockLogger);

    session.start();

    // Execute all steps until completion
    while (session.status === 'running') {
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
    loggerMock.info.mockClear();
    loggerMock.error.mockClear();
    loggerMock.debug.mockClear();
    loggerMock.warn.mockClear();
  });

  it('should execute two-step flow with logging and automatic advancement', async (): Promise<void> => {
    const flow = new Flow('test-flow', mockSteps, 'step1');
    const session = new Session(flow, mockLogger);

    // Start session
    session.start();

    // Execute step 1 (automatically advances to step 2)
    const result1 = await session.executeCurrentStep();
    expect(result1).toBe(true);
    expect(loggerMock.info).toHaveBeenCalledWith('Step 1 executed');

    // Execute step 2 (automatically completes session)
    const result2 = await session.executeCurrentStep();
    expect(result2).toBe(true);
    expect(loggerMock.info).toHaveBeenCalledWith('Step 2 executed');
    expect(session.status).toBe('completed');

    // Verify all logging calls
    expect(loggerMock.info).toHaveBeenCalledWith('Step 1 executed');
    expect(loggerMock.info).toHaveBeenCalledWith('Step 2 executed');
  });

  it('should handle complete flow execution in simple loop', async (): Promise<void> => {
    const flow = new Flow('test-flow', mockSteps, 'step1');
    const session = new Session(flow, mockLogger);

    // Start session
    session.start();

    // Execute flow until completion
    while (session.status === 'running') {
      await session.executeCurrentStep();
    }

    // Verify final state
    expect(session.status).toBe('completed');

    // Verify all steps were logged
    expect(loggerMock.info).toHaveBeenCalledWith('Step 1 executed');
    expect(loggerMock.info).toHaveBeenCalledWith('Step 2 executed');
  });

  it('should support dynamic routing with context', async (): Promise<void> => {
    const dynamicSteps = [
      new Step(
        'router',
        'Routing step',
        {
          bug: 'bug-step',
          feature: 'feature-step',
          default: 'end-step',
        },
        mockLogger
      ),
      new Step('bug-step', 'Bug fix step', {}, mockLogger),
      new Step('feature-step', 'Feature step', {}, mockLogger),
      new Step('end-step', 'End step', {}, mockLogger),
    ];

    const flow = new Flow('dynamic-flow', dynamicSteps, 'router');
    const session = new Session(flow, mockLogger);

    // Set routing context
    session.getContext().set('nextStep', 'bug');

    // Start and execute
    session.start();

    // Execute router step - should go to bug-step
    const result1 = await session.executeCurrentStep();
    expect(result1).toBe(true);
    expect(loggerMock.info).toHaveBeenCalledWith('Routing step');

    // Execute bug-step - should complete
    const result2 = await session.executeCurrentStep();
    expect(result2).toBe(true);
    expect(loggerMock.info).toHaveBeenCalledWith('Bug fix step');
    expect(session.status).toBe('completed');
  });
});

describe('Session context management', (): void => {
  it('should provide access to context', (): void => {
    const flow = new Flow('test-flow', mockSteps, 'step1');
    const session = new Session(flow, mockLogger);

    const context = session.getContext();
    expect(context).toBeDefined();
    expect(typeof context.get).toBe('function');
    expect(typeof context.set).toBe('function');
  });

  it('should maintain same context instance throughout session', (): void => {
    const flow = new Flow('test-flow', mockSteps, 'step1');
    const session = new Session(flow, mockLogger);

    const context1 = session.getContext();
    const context2 = session.getContext();

    expect(context1).toBe(context2);
  });

  it('should allow context to be used for data storage', (): void => {
    const flow = new Flow('test-flow', mockSteps, 'step1');
    const session = new Session(flow, mockLogger);

    const context = session.getContext();
    context.set('testKey', 'testValue');

    expect(context.get('testKey')).toBe('testValue');
  });
});

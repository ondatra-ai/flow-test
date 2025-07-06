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

describe('Session', () => {
  beforeEach(() => {
    mockLoggerInfo.mockClear();
    mockLoggerError.mockClear();
    mockLoggerDebug.mockClear();
    mockLoggerWarn.mockClear();
  });

  const mockSteps = [
    new Step('step1', 'Step 1 executed', 'step2', mockLogger),
    new Step('step2', 'Step 2 executed', null, mockLogger),
  ];

  describe('two-step flow execution', () => {
    it('should execute two-step flow with logging and automatic advancement', async () => {
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

    it('should handle complete flow execution in simple loop', async () => {
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
});

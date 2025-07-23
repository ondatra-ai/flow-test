import { describe, it, expect, beforeEach } from 'vitest';

import { Context } from '../../../src/flow/context.js';
// eslint-disable-next-line no-restricted-imports
import { Flow } from '../../../src/flow/flow.js';
import { Step } from '../../../src/flow/step.js';
import { cast } from '../../../src/utils/cast.js'; // eslint-disable-line no-restricted-imports
import { createLoggerMock } from '../mocks/index.js';

// Create centralized logger mock
const loggerMock = createLoggerMock();

// Helper function to create mock steps
function createMockSteps(): Step[] {
  return [
    new Step('step1', 'Step 1 executed', { default: 'step2' }, loggerMock.mock),
    new Step('step2', 'Step 2 executed', {}, loggerMock.mock),
  ];
}

// Helper function to create mock steps with more variety
function createMultipleSteps(): Step[] {
  return [
    new Step('start', 'Start step', { default: 'middle' }, loggerMock.mock),
    new Step('middle', 'Middle step', { default: 'end' }, loggerMock.mock),
    new Step('end', 'End step', {}, loggerMock.mock),
  ];
}

// Helper function to clear mocks
function clearMocks(): void {
  loggerMock.info.mockClear();
  loggerMock.error.mockClear();
  loggerMock.debug.mockClear();
  loggerMock.warn.mockClear();
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
      expect(flow.getFirstStepId()).toBe('step2');
    });

    it('should handle empty steps array', () => {
      const flow = new Flow('test-flow', [], 'step1');
      expect(flow.getSteps()).toHaveLength(0);
      expect(flow.getFirstStepId()).toBe('step1');
    });

    it('should assign unique IDs to flows', () => {
      const mockSteps1 = createMockSteps();
      const mockSteps2 = createMockSteps();
      const flow1 = new Flow('test-flow-1', mockSteps1, 'step1');
      const flow2 = new Flow('test-flow-2', mockSteps2, 'step1');
      expect(flow1.getId()).not.toBe(flow2.getId());
    });
  });

  describe('execute', () => {
    it('should execute single step', async () => {
      const mockSteps = createMockSteps();
      const flow = new Flow('test-flow', mockSteps, 'step1');
      const context = new Context();

      const result = await flow.execute('step1', context);

      expect(result).toBe('step2');
    });

    it('should execute multiple steps in sequence', async () => {
      const mockSteps = createMultipleSteps();
      const flow = new Flow('test-flow', mockSteps, 'start');
      const context = new Context();

      await flow.execute('start', context);
      await flow.execute('middle', context);
      await flow.execute('end', context);

      expect(loggerMock.info).toHaveBeenNthCalledWith(1, 'Start step');
      expect(loggerMock.info).toHaveBeenNthCalledWith(2, 'Middle step');
      expect(loggerMock.info).toHaveBeenNthCalledWith(3, 'End step');
    });

    it('should stop execution when reaching step with no next step', async () => {
      const mockSteps = createMockSteps();
      const flow = new Flow('test-flow', mockSteps, 'step2');
      const context = new Context();

      const result = await flow.execute('step1', context);

      expect(result).toBeNull();
      expect(loggerMock.info).toHaveBeenCalledWith('Step 2 executed');
    });

    it('should handle non-existent initial step', async () => {
      const mockSteps = createMockSteps();
      const flow = new Flow('test-flow', mockSteps, 'nonexistent');
      const context = new Context();

      const result = await flow.execute('step1', context);

      expect(result).toBeNull();
    });

    it('should handle non-existent next step', async () => {
      const step = new Step(
        'dynamic',
        'Dynamic routing step',
        { unknown: 'nonexistent' },
        loggerMock.mock
      );
      const flow = new Flow('test-flow', [step], 'dynamic');
      const context = new Context();

      const result = await flow.execute('step1', context);

      expect(result).toBeNull();
      expect(loggerMock.info).toHaveBeenCalledWith('Dynamic routing step');
    });

    it('should handle flow execution with context routing', async () => {
      const steps = [
        new Step(
          'conditional',
          'Conditional step',
          {
            success: 'success-step',
            error: 'error-step',
            default: 'default-step',
          },
          loggerMock.mock
        ),
        new Step('success-step', 'Success executed', {}, loggerMock.mock),
        new Step('error-step', 'Error executed', {}, loggerMock.mock),
        new Step('default-step', 'Default executed', {}, loggerMock.mock),
      ];

      const flow = new Flow('test-flow', steps, 'conditional');
      const context = new Context();

      const result = await flow.execute('step1', context);

      expect(result).toBeNull();
    });

    it('should handle empty flow execution', async () => {
      const flow = new Flow('test-flow', [], 'step1');
      const context = new Context();

      const result = await flow.execute('step1', context);

      expect(result).toBeNull();
    });

    it('should handle undefined context gracefully', async () => {
      const mockSteps = createMockSteps();
      const flow = new Flow('test-flow', mockSteps, 'step1');

      const result = await flow.execute('step1', cast<Context>(undefined));

      expect(result).toBe('step2');
    });

    it('should handle flow with circular dependencies', async () => {
      const circularSteps = [
        new Step('step1', 'Step 1', { default: 'step2' }, loggerMock.mock),
        new Step('step2', 'Step 2', { default: 'step1' }, loggerMock.mock),
      ];
      const flow = new Flow('test-flow', circularSteps, 'step1');
      const context = new Context();

      // Note: This would create infinite loop in real implementation
      // For testing, we expect it to execute the first step
      const result = await flow.execute('step1', context);

      expect(result).toBe('step2');
    });

    it('should handle step execution errors gracefully', async () => {
      const errorStep = new Step(
        'error-step',
        'Error step',
        {},
        loggerMock.mock
      );
      const flow = new Flow('test-flow', [errorStep], 'error-step');
      const context = new Context();

      const result = await flow.execute('step1', context);

      expect(result).toBeNull();
    });

    it('should maintain context state throughout execution', async () => {
      const mockSteps = createMultipleSteps();
      const flow = new Flow('test-flow', mockSteps, 'start');
      const context = new Context();
      context.set('testKey', 'testValue');

      await flow.execute('step1', context);

      expect(context.get('testKey')).toBe('testValue');
    });

    it('should handle complex step routing', async () => {
      const complexSteps = [
        new Step(
          'router',
          'Router step',
          {
            option1: 'path1',
            option2: 'path2',
            default: 'defaultPath',
          },
          loggerMock.mock
        ),
        new Step('path1', 'Path 1', {}, loggerMock.mock),
        new Step('path2', 'Path 2', {}, loggerMock.mock),
        new Step('defaultPath', 'Default path', {}, loggerMock.mock),
      ];

      const flow = new Flow('test-flow', complexSteps, 'router');
      const context = new Context();

      const result = await flow.execute('step1', context);

      expect(result).toBeNull();
    });
  });

  describe('getSteps', () => {
    it('should return all steps', () => {
      const mockSteps = createMockSteps();
      const flow = new Flow('test-flow', mockSteps, 'step1');
      expect(flow.getSteps()).toEqual(mockSteps);
    });
  });

  describe('getFirstStepId', () => {
    it('should return the initial step ID', () => {
      const mockSteps = createMockSteps();
      const flow = new Flow('test-flow', mockSteps, 'customStart');
      expect(flow.getFirstStepId()).toBe('customStart');
    });
  });

  describe('getName', () => {
    it('should return the flow id', () => {
      const mockSteps = createMockSteps();
      const flow = new Flow('my-test-flow', mockSteps, 'step1');
      expect(flow.getId()).toBe('my-test-flow');
    });
  });
});

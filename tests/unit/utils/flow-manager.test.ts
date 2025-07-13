import 'reflect-metadata';
import { promises as fs } from 'fs';
import path from 'path';

import { beforeEach, describe, expect, it, vi } from 'vitest';

import { Flow } from '../../../src/flow/flow.js';
import { StepFactory } from '../../../src/flow/step-factory.js';
import { cast } from '../../../src/utils/cast.js';
import { FlowManager } from '../../../src/utils/flow-manager.js';
import { Logger } from '../../../src/utils/logger.js';

import testData from './test-data.json';

// Mock the file system
vi.mock('fs', () => ({
  promises: {
    readdir: vi.fn(() => Promise.resolve([] as string[])),
    readFile: vi.fn(),
  },
}));

// Mock path module
vi.mock('path', () => ({
  default: {
    join: vi.fn(),
    basename: vi.fn(),
  },
}));

// Mock factory functions
function createMockLogger(): Logger {
  return cast<Logger>({
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn(),
  });
}

function createMockStepFactory(): StepFactory {
  return cast<StepFactory>({
    createStep: vi.fn().mockImplementation((stepData: unknown) => {
      const data = stepData as { id: string };
      // Create a simple mock step
      return {
        getId: (): string => data.id,
        execute: vi.fn().mockResolvedValue(null),
      };
    }),
  });
}

// Helper functions moved to module level for better reusability
function setupMocks(): void {
  vi.clearAllMocks();
  vi.mocked(path.join).mockImplementation((...args) => args.join('/'));
  vi.mocked(path.basename).mockImplementation((filePath, ext) =>
    ext ? filePath.replace(ext, '') : filePath
  );
}

// Helper function to create test setup
function createTestSetup() {
  setupMocks();
  const mockLogger = createMockLogger();
  const mockStepFactory = createMockStepFactory();
  const flowManager = new FlowManager(mockLogger, mockStepFactory);
  return { flowManager, mockLogger, mockStepFactory };
}

describe('FlowManager', () => {
  let flowManager: FlowManager;
  let mockLogger: Logger;

  beforeEach(() => {
    const setup = createTestSetup();
    flowManager = setup.flowManager;
    mockLogger = setup.mockLogger;
  });

  describe('listFlows', () => {
    it('should return flow names from .json files', async () => {
      const mockFiles = [
        'flow1.json',
        'flow2.json',
        'not-a-flow.txt',
        'flow3.json',
      ];
      vi.mocked(fs.readdir).mockResolvedValue(mockFiles as never);

      const result = await flowManager.listFlows();

      expect(result).toEqual(['flow1', 'flow2', 'flow3']);
      expect(fs.readdir).toHaveBeenCalledWith('.flows');
    });

    it('should return empty array when no json files exist', async () => {
      vi.mocked(fs.readdir).mockResolvedValue([
        'file1.txt',
        'file2.md',
      ] as never);

      const result = await flowManager.listFlows();

      expect(result).toEqual([]);
    });

    it('should throw error when directory access fails', async () => {
      const error = new Error('Permission denied');
      vi.mocked(fs.readdir).mockRejectedValue(error);

      await expect(flowManager.listFlows()).rejects.toThrow(
        'Unable to access flows directory'
      );
      expect(mockLogger.error).toHaveBeenCalledWith(
        'Failed to list flows',
        expect.any(Error)
      );
    });
  });

  describe('loadFlow - valid flows', () => {
    it('should load and parse a valid flow', async () => {
      vi.mocked(fs.readFile).mockResolvedValue(
        JSON.stringify(testData.validFlowData)
      );

      const result = await flowManager.loadFlow('test-flow');

      expect(result).toBeInstanceOf(Flow);
      expect(result.getId()).toBe('test-flow');
      expect(fs.readFile).toHaveBeenCalledWith(
        '.flows/test-flow.json',
        'utf-8'
      );
    });

    it('should support dynamic routing with multiple keys', async () => {
      vi.mocked(fs.readFile).mockResolvedValue(
        JSON.stringify(testData.dynamicFlowData)
      );

      const result = await flowManager.loadFlow('dynamic-flow');

      expect(result).toBeInstanceOf(Flow);
      expect(result.getId()).toBe('dynamic-flow');
    });

    it('should handle empty object nextStepId correctly (end step)', async () => {
      const flowWithEmptyNext = {
        id: 'test',
        initialStepId: 'step1',
        steps: [
          {
            id: 'step1',
            type: 'read-github-issue',
            issueUrl: 'https://github.com/owner/repo/issues/1',
            includeComments: true,
            nextStepId: {},
          },
        ],
      };
      vi.mocked(fs.readFile).mockResolvedValue(
        JSON.stringify(flowWithEmptyNext)
      );

      const result = await flowManager.loadFlow('test-flow');

      expect(result).toBeInstanceOf(Flow);
      expect(result.getId()).toBe('test');
    });
  });

  describe('loadFlow - error cases', () => {
    it('should throw error with available flows when file not found', async () => {
      const error = new Error('File not found') as NodeJS.ErrnoException;
      error.code = 'ENOENT';
      vi.mocked(fs.readFile).mockRejectedValue(error);
      vi.mocked(fs.readdir).mockResolvedValue([
        'flow1.json',
        'flow2.json',
      ] as never);

      await expect(flowManager.loadFlow('missing-flow')).rejects.toThrow(
        "Flow 'missing-flow' not found. Available flows: flow1, flow2"
      );
    });

    it('should throw error for invalid JSON', async () => {
      vi.mocked(fs.readFile).mockResolvedValue('invalid json');

      await expect(flowManager.loadFlow('test-flow')).rejects.toThrow();
    });
  });

  describe('validation edge cases', () => {
    const runValidationTest = async (data: unknown, expectedError: string) => {
      vi.mocked(fs.readFile).mockResolvedValue(JSON.stringify(data));
      await expect(flowManager.loadFlow('test-flow')).rejects.toThrow(
        expectedError
      );
    };

    it('should throw error for invalid flow data', async () => {
      await runValidationTest(
        'not an object',
        'Expected object, received string'
      );
    });

    it('should throw error for invalid steps', async () => {
      await runValidationTest(
        { id: 'test', steps: 'not an array' },
        'Expected array, received string'
      );
    });

    it('should throw error for missing nextStepId property', async () => {
      const flowWithoutNext = {
        id: 'test',
        steps: [
          {
            id: 'step1',
            type: 'read-github-issue',
            issueUrl: 'https://github.com/owner/repo/issues/1',
            includeComments: true,
            // Missing nextStepId property
          },
        ],
      };
      vi.mocked(fs.readFile).mockResolvedValue(JSON.stringify(flowWithoutNext));

      await expect(flowManager.loadFlow('test-flow')).rejects.toThrow(
        'Failed to parse JSON'
      );
    });
  });

  describe('initialStepId functionality', () => {
    // Helper function to create test flow with different initial step configs
    const createTestFlow = (config: { initialStepId?: string }) => ({
      id: 'test-flow',
      ...config,
      steps: [
        {
          id: 'step1',
          type: 'read-github-issue',
          issueUrl: 'https://github.com/owner/repo/issues/1',
          includeComments: true,
          nextStepId: { default: 'step2' },
        },
        {
          id: 'step2',
          type: 'read-github-issue',
          issueUrl: 'https://github.com/owner/repo/issues/2',
          includeComments: false,
          nextStepId: {},
        },
      ],
    });

    it('should load flow with initialStepId', async () => {
      const flowData = createTestFlow({ initialStepId: 'step2' });
      vi.mocked(fs.readFile).mockResolvedValue(JSON.stringify(flowData));

      const result = await flowManager.loadFlow('test-flow');

      expect(result).toBeInstanceOf(Flow);
      expect(result.getId()).toBe('test-flow');
      expect(result.getFirstStepId()).toBe('step2');
    });

    it('should throw error for invalid initialStepId reference', async () => {
      const flowWithInvalidInitialStepId = {
        id: 'test-flow',
        initialStepId: 'non-existent-step',
        steps: [
          {
            id: 'step1',
            type: 'read-github-issue',
            issueUrl: 'https://github.com/owner/repo/issues/1',
            includeComments: true,
            nextStepId: {},
          },
        ],
      };
      vi.mocked(fs.readFile).mockResolvedValue(
        JSON.stringify(flowWithInvalidInitialStepId)
      );

      await expect(flowManager.loadFlow('test-flow')).rejects.toThrow(
        'Failed to parse JSON'
      );
    });

    it('should throw error for flow with no steps', async () => {
      const flowWithNoSteps = {
        id: 'test-flow',
        initialStepId: 'any-step',
        steps: [],
      };
      vi.mocked(fs.readFile).mockResolvedValue(JSON.stringify(flowWithNoSteps));

      await expect(flowManager.loadFlow('test-flow')).rejects.toThrow(
        'Flow must have at least one step'
      );
    });
  });
});

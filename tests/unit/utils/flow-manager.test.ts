import 'reflect-metadata';
import { promises as fs } from 'fs';
import path from 'path';

import { beforeEach, describe, expect, it, vi } from 'vitest';

import { Flow } from '../../../src/flow/flow.js';
import { StepFactory } from '../../../src/flow/step-factory.js';
import { FlowManager } from '../../../src/utils/flow-manager.js';
import { Logger } from '../../../src/utils/logger.js';

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

// Test data
const VALID_FLOW_DATA = {
  id: 'test-flow',
  name: 'Test Flow',
  description: 'A test flow',
  steps: [
    {
      id: 'step1',
      message: 'First step',
      nextStepId: { default: 'step2' },
    },
    {
      id: 'step2',
      message: 'Second step',
      nextStepId: {},
    },
  ],
};

const DYNAMIC_FLOW_DATA = {
  id: 'dynamic-flow',
  steps: [
    {
      id: 'router',
      message: 'Router step',
      nextStepId: {
        bug: 'bug-step',
        feature: 'feature-step',
        default: 'end-step',
      },
    },
    { id: 'bug-step', message: 'Bug step', nextStepId: {} },
    { id: 'feature-step', message: 'Feature step', nextStepId: {} },
    { id: 'end-step', message: 'End step', nextStepId: {} },
  ],
};

// Helper functions moved to module level for better reusability
function setupMocks(): void {
  vi.clearAllMocks();
  vi.mocked(path.join).mockImplementation((...args) => args.join('/'));
  vi.mocked(path.basename).mockImplementation((filePath, ext) =>
    ext ? filePath.replace(ext, '') : filePath
  );
}

function createMockLogger(): Logger {
  return {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn(),
  } as unknown as Logger;
}

function createMockStepFactory(): StepFactory {
  return {
    validateStepConfig: vi.fn(),
    createStep: vi.fn(),
  } as unknown as StepFactory;
}

describe('FlowManager', () => {
  let flowManager: FlowManager;
  let mockLogger: Logger;
  let mockStepFactory: StepFactory;

  beforeEach(() => {
    setupMocks();
    mockLogger = createMockLogger();
    mockStepFactory = createMockStepFactory();
    flowManager = new FlowManager(mockLogger, mockStepFactory);
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
      expect(mockLogger.error).toHaveBeenCalledWith('Failed to list flows', {
        error,
      });
    });
  });

  describe('loadFlow - valid flows', () => {
    it('should load and parse a valid flow', async () => {
      vi.mocked(fs.readFile).mockResolvedValue(JSON.stringify(VALID_FLOW_DATA));

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
        JSON.stringify(DYNAMIC_FLOW_DATA)
      );

      const result = await flowManager.loadFlow('dynamic-flow');

      expect(result).toBeInstanceOf(Flow);
      expect(result.getId()).toBe('dynamic-flow');
    });

    it('should handle empty object nextStepId correctly (end step)', async () => {
      const flowWithEmptyNext = {
        id: 'test',
        steps: [{ id: 'step1', message: 'Only step', nextStepId: {} }],
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

    it('should throw error for missing flow id', async () => {
      const invalidFlow = { steps: [] };
      vi.mocked(fs.readFile).mockResolvedValue(JSON.stringify(invalidFlow));

      await expect(flowManager.loadFlow('test-flow')).rejects.toThrow(
        'Invalid flow structure: missing id or steps'
      );
    });

    it('should throw error for missing steps', async () => {
      const invalidFlow = { id: 'test' };
      vi.mocked(fs.readFile).mockResolvedValue(JSON.stringify(invalidFlow));

      await expect(flowManager.loadFlow('test-flow')).rejects.toThrow(
        'Invalid flow structure: missing id or steps'
      );
    });

    it('should throw error for invalid nextStepId reference', async () => {
      const invalidFlow = {
        id: 'test',
        steps: [
          {
            id: 'step1',
            message: 'First step',
            nextStepId: { default: 'non-existent' },
          },
        ],
      };
      vi.mocked(fs.readFile).mockResolvedValue(JSON.stringify(invalidFlow));

      await expect(flowManager.loadFlow('test-flow')).rejects.toThrow(
        'Invalid nextStepId reference: non-existent'
      );
    });
  });

  describe('validation edge cases', () => {
    const validationTests = [
      {
        name: 'non-object flow data',
        data: 'not an object',
        error: 'Invalid flow structure: data must be an object',
      },
      {
        name: 'null flow data',
        data: null,
        error: 'Invalid flow structure: data must be an object',
      },
      {
        name: 'non-array steps',
        data: { id: 'test', steps: 'not an array' },
        error: 'Invalid flow structure: missing id or steps',
      },
      {
        name: 'non-object step',
        data: { id: 'test', steps: ['not an object'] },
        error: 'Invalid step structure: step must be an object',
      },
      {
        name: 'null step',
        data: { id: 'test', steps: [null] },
        error: 'Invalid step structure: step must be an object',
      },
      {
        name: 'non-string step id',
        data: { id: 'test', steps: [{ id: 123, message: 'step' }] },
        error: 'Invalid step structure: step id must be a string',
      },
    ];

    validationTests.forEach(({ name, data, error }) => {
      it(`should throw error for ${name}`, async () => {
        vi.mocked(fs.readFile).mockResolvedValue(JSON.stringify(data));

        await expect(flowManager.loadFlow('test-flow')).rejects.toThrow(error);
      });
    });

    it('should throw error for missing nextStepId property', async () => {
      const flowWithoutNext = {
        id: 'test',
        steps: [{ id: 'step1', message: 'Only step' }],
      };
      vi.mocked(fs.readFile).mockResolvedValue(JSON.stringify(flowWithoutNext));

      await expect(flowManager.loadFlow('test-flow')).rejects.toThrow(
        'Invalid step structure: nextStepId must be an object'
      );
    });

    it('should throw error for old format (string/null nextStepId)', async () => {
      const oldFormatFlow = {
        id: 'test',
        steps: [{ id: 'step1', message: 'Old format', nextStepId: 'step2' }],
      };
      vi.mocked(fs.readFile).mockResolvedValue(JSON.stringify(oldFormatFlow));

      await expect(flowManager.loadFlow('test-flow')).rejects.toThrow(
        'Invalid step structure: nextStepId must be an object'
      );
    });

    it('should throw error for array nextStepId', async () => {
      const invalidFlow = {
        id: 'test',
        steps: [{ id: 'step1', message: 'Array next', nextStepId: ['step2'] }],
      };
      vi.mocked(fs.readFile).mockResolvedValue(JSON.stringify(invalidFlow));

      await expect(flowManager.loadFlow('test-flow')).rejects.toThrow(
        'Invalid step structure: nextStepId must be an object'
      );
    });

    it('should throw error for non-string values in nextStepId object', async () => {
      const invalidFlow = {
        id: 'test',
        steps: [
          {
            id: 'step1',
            message: 'Invalid value',
            nextStepId: { default: 123 },
          },
        ],
      };
      vi.mocked(fs.readFile).mockResolvedValue(JSON.stringify(invalidFlow));

      await expect(flowManager.loadFlow('test-flow')).rejects.toThrow(
        'Invalid nextStepId value: default must be a string'
      );
    });
  });

  describe('error propagation', () => {
    it('should propagate non-ENOENT file system errors', async () => {
      const error = new Error('Disk full') as NodeJS.ErrnoException;
      error.code = 'ENOSPC';
      vi.mocked(fs.readFile).mockRejectedValue(error);

      await expect(flowManager.loadFlow('test-flow')).rejects.toThrow(
        'Disk full'
      );
    });

    it('should propagate JSON parsing errors', async () => {
      vi.mocked(fs.readFile).mockResolvedValue('{"id": "test", "steps": [}');

      await expect(flowManager.loadFlow('test-flow')).rejects.toThrow();
    });
  });
});

import 'reflect-metadata';
import { promises as fs } from 'fs';
import path from 'path';

import { beforeEach, describe, expect, it, vi } from 'vitest';

import { Flow } from '../../../src/flow/flow.js';
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

describe('FlowManager', () => {
  let flowManager: FlowManager;
  let mockLogger: Logger;

  beforeEach(() => {
    vi.clearAllMocks();

    // Setup mocks
    vi.mocked(path.join).mockImplementation((...args) => args.join('/'));
    vi.mocked(path.basename).mockImplementation((filePath, ext) =>
      ext ? filePath.replace(ext, '') : filePath
    );

    // Mock logger
    mockLogger = {
      info: vi.fn(),
      error: vi.fn(),
      warn: vi.fn(),
      debug: vi.fn(),
    } as unknown as Logger;

    flowManager = new FlowManager(mockLogger);
  });

  describe('listFlows', () => {
    it('should return flow names from .json files', async () => {
      // Arrange
      const mockFiles = [
        'flow1.json',
        'flow2.json',
        'not-a-flow.txt',
        'flow3.json',
      ];
      vi.mocked(fs.readdir).mockResolvedValue(mockFiles as never);

      // Act
      const result = await flowManager.listFlows();

      // Assert
      expect(result).toEqual(['flow1', 'flow2', 'flow3']);
      expect(fs.readdir).toHaveBeenCalledWith('.flows');
    });

    it('should return empty array when no json files exist', async () => {
      // Arrange
      vi.mocked(fs.readdir).mockResolvedValue([
        'file1.txt',
        'file2.md',
      ] as never);

      // Act
      const result = await flowManager.listFlows();

      // Assert
      expect(result).toEqual([]);
    });

    it('should throw error when directory access fails', async () => {
      // Arrange
      const error = new Error('Permission denied');
      vi.mocked(fs.readdir).mockRejectedValue(error);

      // Act & Assert
      await expect(flowManager.listFlows()).rejects.toThrow(
        'Unable to access flows directory'
      );
      expect(mockLogger.error).toHaveBeenCalledWith('Failed to list flows', {
        error,
      });
    });
  });

  describe('loadFlow', () => {
    const validFlowData = {
      id: 'test-flow',
      name: 'Test Flow',
      description: 'A test flow',
      steps: [
        {
          id: 'step1',
          message: 'First step',
          nextStepId: 'step2',
        },
        {
          id: 'step2',
          message: 'Second step',
          nextStepId: null,
        },
      ],
    };

    it('should load and parse a valid flow', async () => {
      // Arrange
      vi.mocked(fs.readFile).mockResolvedValue(JSON.stringify(validFlowData));

      // Act
      const result = await flowManager.loadFlow('test-flow');

      // Assert
      expect(result).toBeInstanceOf(Flow);
      expect(result.getId()).toBe('test-flow');
      expect(fs.readFile).toHaveBeenCalledWith(
        '.flows/test-flow.json',
        'utf-8'
      );
    });

    it('should throw error with available flows when file not found', async () => {
      // Arrange
      const error = new Error('File not found') as NodeJS.ErrnoException;
      error.code = 'ENOENT';
      vi.mocked(fs.readFile).mockRejectedValue(error);
      vi.mocked(fs.readdir).mockResolvedValue([
        'flow1.json',
        'flow2.json',
      ] as never);

      // Act & Assert
      await expect(flowManager.loadFlow('missing-flow')).rejects.toThrow(
        "Flow 'missing-flow' not found. Available flows: flow1, flow2"
      );
    });

    it('should throw error for invalid JSON', async () => {
      // Arrange
      vi.mocked(fs.readFile).mockResolvedValue('invalid json');

      // Act & Assert
      await expect(flowManager.loadFlow('test-flow')).rejects.toThrow();
    });

    it('should throw error for missing flow id', async () => {
      // Arrange
      const invalidFlow = { steps: [] };
      vi.mocked(fs.readFile).mockResolvedValue(JSON.stringify(invalidFlow));

      // Act & Assert
      await expect(flowManager.loadFlow('test-flow')).rejects.toThrow(
        'Invalid flow structure: missing id or steps'
      );
    });

    it('should throw error for missing steps', async () => {
      // Arrange
      const invalidFlow = { id: 'test' };
      vi.mocked(fs.readFile).mockResolvedValue(JSON.stringify(invalidFlow));

      // Act & Assert
      await expect(flowManager.loadFlow('test-flow')).rejects.toThrow(
        'Invalid flow structure: missing id or steps'
      );
    });

    it('should throw error for invalid step structure', async () => {
      // Arrange
      const invalidFlow = {
        id: 'test',
        steps: [{ message: 'step without id' }],
      };
      vi.mocked(fs.readFile).mockResolvedValue(JSON.stringify(invalidFlow));

      // Act & Assert
      await expect(flowManager.loadFlow('test-flow')).rejects.toThrow(
        'Invalid step structure: step id must be a string'
      );
    });

    it('should throw error for invalid nextStepId reference', async () => {
      // Arrange
      const invalidFlow = {
        id: 'test',
        steps: [
          { id: 'step1', message: 'First step', nextStepId: 'non-existent' },
        ],
      };
      vi.mocked(fs.readFile).mockResolvedValue(JSON.stringify(invalidFlow));

      // Act & Assert
      await expect(flowManager.loadFlow('test-flow')).rejects.toThrow(
        'Invalid nextStepId reference: non-existent'
      );
    });

    it('should handle null nextStepId correctly', async () => {
      // Arrange
      const flowWithNullNext = {
        id: 'test',
        steps: [{ id: 'step1', message: 'Only step', nextStepId: null }],
      };
      vi.mocked(fs.readFile).mockResolvedValue(
        JSON.stringify(flowWithNullNext)
      );

      // Act
      const result = await flowManager.loadFlow('test-flow');

      // Assert
      expect(result).toBeInstanceOf(Flow);
      expect(result.getId()).toBe('test');
    });

    it('should handle missing nextStepId property', async () => {
      // Arrange
      const flowWithoutNext = {
        id: 'test',
        steps: [{ id: 'step1', message: 'Only step' }],
      };
      vi.mocked(fs.readFile).mockResolvedValue(JSON.stringify(flowWithoutNext));

      // Act
      const result = await flowManager.loadFlow('test-flow');

      // Assert
      expect(result).toBeInstanceOf(Flow);
      expect(result.getId()).toBe('test');
    });
  });

  describe('validation edge cases', () => {
    it('should throw error for non-object flow data', async () => {
      // Arrange
      vi.mocked(fs.readFile).mockResolvedValue(JSON.stringify('not an object'));

      // Act & Assert
      await expect(flowManager.loadFlow('test-flow')).rejects.toThrow(
        'Invalid flow structure: data must be an object'
      );
    });

    it('should throw error for null flow data', async () => {
      // Arrange
      vi.mocked(fs.readFile).mockResolvedValue(JSON.stringify(null));

      // Act & Assert
      await expect(flowManager.loadFlow('test-flow')).rejects.toThrow(
        'Invalid flow structure: data must be an object'
      );
    });

    it('should throw error for non-array steps', async () => {
      // Arrange
      const invalidFlow = {
        id: 'test',
        steps: 'not an array',
      };
      vi.mocked(fs.readFile).mockResolvedValue(JSON.stringify(invalidFlow));

      // Act & Assert
      await expect(flowManager.loadFlow('test-flow')).rejects.toThrow(
        'Invalid flow structure: missing id or steps'
      );
    });

    it('should throw error for non-object step', async () => {
      // Arrange
      const invalidFlow = {
        id: 'test',
        steps: ['not an object'],
      };
      vi.mocked(fs.readFile).mockResolvedValue(JSON.stringify(invalidFlow));

      // Act & Assert
      await expect(flowManager.loadFlow('test-flow')).rejects.toThrow(
        'Invalid step structure: step must be an object'
      );
    });

    it('should throw error for null step', async () => {
      // Arrange
      const invalidFlow = {
        id: 'test',
        steps: [null],
      };
      vi.mocked(fs.readFile).mockResolvedValue(JSON.stringify(invalidFlow));

      // Act & Assert
      await expect(flowManager.loadFlow('test-flow')).rejects.toThrow(
        'Invalid step structure: step must be an object'
      );
    });

    it('should throw error for non-string step id', async () => {
      // Arrange
      const invalidFlow = {
        id: 'test',
        steps: [{ id: 123, message: 'step' }],
      };
      vi.mocked(fs.readFile).mockResolvedValue(JSON.stringify(invalidFlow));

      // Act & Assert
      await expect(flowManager.loadFlow('test-flow')).rejects.toThrow(
        'Invalid step structure: step id must be a string'
      );
    });

    it('should handle complex flow with valid circular references', async () => {
      // Arrange
      const complexFlow = {
        id: 'complex-flow',
        steps: [
          { id: 'step1', message: 'First step', nextStepId: 'step2' },
          { id: 'step2', message: 'Second step', nextStepId: 'step3' },
          { id: 'step3', message: 'Third step', nextStepId: 'step1' }, // Circular reference
        ],
      };
      vi.mocked(fs.readFile).mockResolvedValue(JSON.stringify(complexFlow));

      // Act
      const result = await flowManager.loadFlow('complex-flow');

      // Assert
      expect(result).toBeInstanceOf(Flow);
      expect(result.getId()).toBe('complex-flow');
    });
  });

  describe('error propagation', () => {
    it('should propagate non-ENOENT file system errors', async () => {
      // Arrange
      const error = new Error('Disk full') as NodeJS.ErrnoException;
      error.code = 'ENOSPC';
      vi.mocked(fs.readFile).mockRejectedValue(error);

      // Act & Assert
      await expect(flowManager.loadFlow('test-flow')).rejects.toThrow(
        'Disk full'
      );
    });

    it('should propagate JSON parsing errors', async () => {
      // Arrange
      vi.mocked(fs.readFile).mockResolvedValue('{"id": "test", "steps": [}'); // Invalid JSON

      // Act & Assert
      await expect(flowManager.loadFlow('test-flow')).rejects.toThrow();
    });
  });
});

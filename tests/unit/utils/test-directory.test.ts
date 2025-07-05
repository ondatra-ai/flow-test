import { join, resolve } from 'path';

import { describe, it, expect, vi, beforeEach } from 'vitest';

import { createTestDirPath } from '../../test-utils/test-directory.js';

// Mock the timestamp utility
vi.mock('../../test-utils/timestamp.js', () => ({
  createTimestamp: vi.fn(() => '2024-03-15_14-30-45'),
}));

describe('createTestDirPath - basic functionality', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should create correct path structure with timestamp and sanitized task name', () => {
    const taskName = 'My Test Task';
    const expectedTestResultsDir = resolve('./test_results');
    const expectedPath = join(
      expectedTestResultsDir,
      '2024-03-15_14-30-45',
      'my_test_task'
    );

    const result = createTestDirPath(taskName);

    expect(result).toBe(expectedPath);
  });

  it('should use test_results directory relative to current working directory', () => {
    const taskName = 'test';
    const expectedTestResultsDir = resolve('./test_results');

    const result = createTestDirPath(taskName);

    expect(result).toContain(expectedTestResultsDir);
  });

  it('should include timestamp in the path structure', () => {
    const taskName = 'test';

    const result = createTestDirPath(taskName);

    expect(result).toContain('2024-03-15_14-30-45');
  });
});

describe('createTestDirPath - input sanitization', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should sanitize task names by replacing special characters with underscores', () => {
    const taskName = 'test-with@special!characters#and$spaces%';
    const expectedTestResultsDir = resolve('./test_results');
    const expectedPath = join(
      expectedTestResultsDir,
      '2024-03-15_14-30-45',
      'test-with_special_characters_and_spaces_'
    );

    const result = createTestDirPath(taskName);

    expect(result).toBe(expectedPath);
  });

  it('should convert task names to lowercase', () => {
    const taskName = 'UPPERCASE-Task_NAME';
    const expectedTestResultsDir = resolve('./test_results');
    const expectedPath = join(
      expectedTestResultsDir,
      '2024-03-15_14-30-45',
      'uppercase-task_name'
    );

    const result = createTestDirPath(taskName);

    expect(result).toBe(expectedPath);
  });

  it('should preserve allowed characters (alphanumeric, hyphens, underscores)', () => {
    const taskName = 'valid-task_name123';
    const expectedTestResultsDir = resolve('./test_results');
    const expectedPath = join(
      expectedTestResultsDir,
      '2024-03-15_14-30-45',
      'valid-task_name123'
    );

    const result = createTestDirPath(taskName);

    expect(result).toBe(expectedPath);
  });
});

describe('createTestDirPath - edge cases', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should handle empty task name', () => {
    const taskName = '';
    const expectedTestResultsDir = resolve('./test_results');
    const expectedPath = join(
      expectedTestResultsDir,
      '2024-03-15_14-30-45',
      ''
    );

    const result = createTestDirPath(taskName);

    expect(result).toBe(expectedPath);
  });

  it('should handle task name with only special characters', () => {
    const taskName = '!@#$%^&*()';
    const expectedTestResultsDir = resolve('./test_results');
    const expectedPath = join(
      expectedTestResultsDir,
      '2024-03-15_14-30-45',
      '__________'
    );

    const result = createTestDirPath(taskName);

    expect(result).toBe(expectedPath);
  });
});

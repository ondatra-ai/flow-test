import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import { createTimestamp } from '../../test-utils/timestamp.js';

describe('createTimestamp', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should return timestamp in correct format YYYY-MM-DD_HH-MM-SS', () => {
    // Set a specific date for deterministic testing
    // Month is 0-indexed, so 2 = March
    const testDate = new Date(2024, 2, 15, 14, 30, 45);
    vi.setSystemTime(testDate);

    const result = createTimestamp();

    expect(result).toBe('2024-03-15_14-30-45');
  });

  it('should pad single digit months and days with zeros', () => {
    // Set a date with single digit month and day
    const testDate = new Date(2024, 0, 5, 9, 8, 7); // January = 0
    vi.setSystemTime(testDate);

    const result = createTimestamp();

    expect(result).toBe('2024-01-05_09-08-07');
  });

  it('should handle end of year correctly', () => {
    const testDate = new Date(2023, 11, 31, 23, 59, 59); // December = 11
    vi.setSystemTime(testDate);

    const result = createTimestamp();

    expect(result).toBe('2023-12-31_23-59-59');
  });

  it('should handle start of year correctly', () => {
    const testDate = new Date(2024, 0, 1, 0, 0, 0); // January = 0
    vi.setSystemTime(testDate);

    const result = createTimestamp();

    expect(result).toBe('2024-01-01_00-00-00');
  });

  it('should return different timestamps for different times', () => {
    const firstDate = new Date(2024, 2, 15, 14, 30, 45);
    vi.setSystemTime(firstDate);
    const firstTimestamp = createTimestamp();

    const secondDate = new Date(2024, 2, 15, 14, 30, 46);
    vi.setSystemTime(secondDate);
    const secondTimestamp = createTimestamp();

    expect(firstTimestamp).not.toBe(secondTimestamp);
    expect(firstTimestamp).toBe('2024-03-15_14-30-45');
    expect(secondTimestamp).toBe('2024-03-15_14-30-46');
  });

  it('should match expected regex pattern', () => {
    const testDate = new Date('2024-03-15T14:30:45.123Z');
    vi.setSystemTime(testDate);

    const result = createTimestamp();

    // Regex for YYYY-MM-DD_HH-MM-SS format
    const timestampRegex = /^\d{4}-\d{2}-\d{2}_\d{2}-\d{2}-\d{2}$/;
    expect(result).toMatch(timestampRegex);
  });
});

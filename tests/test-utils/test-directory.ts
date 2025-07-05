import { join, resolve } from 'path';

import { createTimestamp } from './timestamp.js';

/**
 * Create test directory path
 */
export function createTestDirPath(taskName: string): string {
  const dateTime = createTimestamp();
  const testName = taskName.replace(/[^a-zA-Z0-9-_]/g, '_').toLowerCase();
  const testResultsDir = resolve('./test_results');

  return join(testResultsDir, dateTime, testName);
}

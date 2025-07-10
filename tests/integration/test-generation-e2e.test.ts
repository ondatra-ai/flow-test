import { promises as fs } from 'fs';
import { resolve } from 'path';

import {
  describe,
  it,
  expect,
  beforeAll,
  afterAll,
  beforeEach,
  afterEach,
} from 'vitest';

import { runTestsGenerateCommand } from '../test-utils/cli-utils.js';
import { copyDirectory, getFileStructure } from '../test-utils/file-utils.js';
import { createTestDirPath } from '../test-utils/test-directory.js';
import { TestEnvironment } from '../test-utils/test-environment.js';

/**
 * Helper function to set up initial test state
 */
async function setupInitialState(
  tempTestDir: string,
  testDataPath: string
): Promise<void> {
  const initialStatePath = resolve(__dirname, testDataPath, 'initial-state');

  await copyDirectory(initialStatePath, tempTestDir);
}

/**
 * Helper function to verify the generated file structure
 */
async function verifyGeneratedStructure(
  tempTestDir: string,
  testDataPath: string
): Promise<void> {
  const resultsStatePath = resolve(__dirname, testDataPath, 'results-state');
  const expected = await getFileStructure(resultsStatePath);

  const actual = await getFileStructure(tempTestDir);

  expect(actual).toEqual(expected);
}

/**
 * E2E test for the tests:generate CLI command
 * This test verifies that the command correctly generates e2e test structure
 */
describe('CLI E2E Tests - tests:generate command', () => {
  let testEnv: TestEnvironment;
  let tempTestDir: string;

  beforeAll(() => {
    testEnv = new TestEnvironment();
    testEnv.setup();
  });

  afterAll(() => {
    testEnv.cleanup();
  });

  beforeEach(async ctx => {
    // Create a unique test directory under test_results
    // organized by date and time
    tempTestDir = createTestDirPath(ctx.task.name);
    await fs.mkdir(tempTestDir, { recursive: true });
  });

  afterEach(async () => {
    // Keep test results for debugging - no cleanup needed
    // The test_results directory is gitignored
  });

  it.each([
    {
      testName: 'create-login-tests',
      testDataPath: 'data/create-login-tests',
    },
  ])(
    'should generate e2e test structure from initial state for $testName',
    async ({ testDataPath }) => {
      // Step 1: Set up initial state
      await setupInitialState(tempTestDir, testDataPath);

      // Step 2: Run the tests:generate CLI command
      const result = await runTestsGenerateCommand(testEnv, tempTestDir);

      // Verify command executed successfully
      expect(result.exitCode).toBe(0);
      expect(result.stdout).toContain(
        'E2E test structure generated successfully'
      );

      // Step 3: Verify the generated structure
      await verifyGeneratedStructure(tempTestDir, testDataPath);
    },
    15000
  );
});

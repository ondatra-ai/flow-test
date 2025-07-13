import { promises as fs } from 'fs';

import {
  describe,
  it,
  expect,
  beforeAll,
  afterAll,
  beforeEach,
  afterEach,
} from 'vitest';

import { runFlowCommand } from '../test-utils/cli-utils.js';
import { copyFlowFile } from '../test-utils/file-utils.js';
import { createTestDirPath } from '../test-utils/test-directory.js';
import { TestEnvironment } from '../test-utils/test-environment.js';

/**
 * E2E tests for the flow:run CLI command
 * These tests verify that flows with ReadGitHubIssueStep execute correctly
 */
describe('CLI E2E Tests - flow:run command', () => {
  let testEnv: TestEnvironment;
  let tempTestDir: string;

  beforeAll(() => {
    testEnv = new TestEnvironment();
    testEnv.setup();
  });

  afterAll(() => {
    testEnv.cleanup();
  });

  beforeEach(() => {
    tempTestDir = createTestDirPath('flow-execution-test');
  });

  afterEach(async () => {
    // Clean up test directory after each test
    try {
      await fs.rm(tempTestDir, { recursive: true, force: true });
    } catch (error) {
      // Ignore cleanup errors in tests
      void error;
    }
  });

  describe('GitHub Issue Flow', () => {
    it('should execute ReadGitHubIssueStep successfully', async () => {
      // Copy a flow that uses only ReadGitHubIssueStep
      await copyFlowFile('comprehensive-test-flow.json', tempTestDir);

      // Run the flow
      const result = await runFlowCommand(
        testEnv,
        tempTestDir,
        'comprehensive-test-flow'
      );

      // Verify successful execution
      expect(result.exitCode).toBe(0);

      // Verify flow starts and completes
      expect(result.stdout).toContain('Loading flow: comprehensive-test-flow');
      expect(result.stdout).toContain(
        'Starting flow execution: comprehensive-test-flow'
      );
      expect(result.stdout).toContain(
        "Flow 'comprehensive-test-flow' completed successfully"
      );

      // Verify ReadGitHubIssueStep execution
      expect(result.stdout).toContain('Executing ReadGitHubIssueStep');
    });
  });

  describe('Invalid Flow', () => {
    it('should handle invalid flow with appropriate error', async () => {
      // Copy invalid flow configuration
      await copyFlowFile('invalid-flow.json', tempTestDir);

      // Run the invalid flow
      const result = await runFlowCommand(testEnv, tempTestDir, 'invalid-flow');

      // Verify it fails with appropriate error
      expect(result.exitCode).not.toBe(0);
      expect(result.stderr).toContain('Error');
    });
  });

  describe('Non-existent Flow', () => {
    it('should handle non-existent flow with appropriate error', async () => {
      // Create the test directory even though we won't put any flow files in it
      await fs.mkdir(tempTestDir, { recursive: true });

      // Try to run a flow that doesn't exist
      const result = await runFlowCommand(
        testEnv,
        tempTestDir,
        'non-existent-flow'
      );

      // Verify it fails with appropriate error
      expect(result.exitCode).not.toBe(0);
      expect(result.stderr).toContain('Error');
    });
  });

  describe('Flow Configuration', () => {
    it('should execute flow with simple configuration', async () => {
      // Use simple flow configuration
      await copyFlowFile('simple-decision-test.json', tempTestDir);

      // Run the flow
      const result = await runFlowCommand(
        testEnv,
        tempTestDir,
        'simple-decision-test'
      );

      // Verify successful execution
      expect(result.exitCode).toBe(0);
      expect(result.stdout).toContain(
        "Flow 'simple-decision-test' completed successfully"
      );
    });
  });
});

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
 * E2E tests for Read GitHub Issue Step
 * These tests verify that GitHub issues can be read and processed by the flow
 * system
 */
describe('Read GitHub Issue E2E Tests', () => {
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
    // Create a unique test directory for each test
    tempTestDir = createTestDirPath(ctx.task.name);
    await fs.mkdir(tempTestDir, { recursive: true });
  });

  afterEach(async () => {
    // Keep test results for debugging - no cleanup needed
  });

  describe('Read GitHub Issue Step with CLI Arguments', () => {
    it('should read GitHub issue from CLI argument and populate context', async () => {
      // Copy the read GitHub issue test flow
      await copyFlowFile(
        'read-github-issue-content-test-flow.json',
        tempTestDir,
        'data/read-github-issue'
      );

      // Run the flow with GitHub issue URL as CLI argument
      const result = await runFlowCommand(
        testEnv,
        tempTestDir,
        'read-github-issue-content-test-flow',
        [
          '--github-issue',
          'https://github.com/ondatra-ai/for-test-purpose/issues/1',
        ]
      );

      // Verify successful execution
      expect(result.exitCode).toBe(0);
      expect(result.stdout).toContain(
        "Flow 'read-github-issue-content-test-flow' completed successfully"
      );

      // Verify GitHub step executed
      expect(result.stdout).toContain('ReadGitHubIssueStep: Reading issue #1');
      expect(result.stdout).toContain(
        'Successfully loaded GitHub issue #1 from ondatra-ai/for-test-purpose'
      );

      // Verify ReadGitHubIssueStep successfully processes the GitHub issue
      expect(result.stdout).toContain('Successfully loaded GitHub issue #1');

      // Verify real issue data from ondatra-ai/for-test-purpose/issues/1
      expect(result.stdout).toContain(
        'Issue Title: "[TEST Issue] Create something for ai"'
      );
      expect(result.stdout).toContain('Issue Author: "killev"');
      expect(result.stdout).toContain('Issue State: "open"');
      expect(result.stdout).toContain('Issue Body: "This issue for test"');
      expect(result.stdout).toContain('Issue Comments: 1');
    });
    it('should handle invalid GitHub issue URL with error', async () => {
      await copyFlowFile(
        'read-github-issue-content-test-flow.json',
        tempTestDir,
        'data/read-github-issue'
      );

      // Test error handling for invalid URLs
      const result = await runFlowCommand(
        testEnv,
        tempTestDir,
        'read-github-issue-content-test-flow',
        ['--github-issue', 'https://invalid-url']
      );

      expect(result.exitCode).toBe(1);
      expect(result.stderr).toContain('Invalid GitHub issue URL');
    });
  });
});

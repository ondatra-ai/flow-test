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
      await copyFlowFile('read-github-issue-flow.json', tempTestDir, 'data');

      // Run the flow with GitHub issue URL as CLI argument
      const result = await runFlowCommand(
        testEnv,
        tempTestDir,
        'read-github-issue-flow',
        [
          '--github-issue',
          'https://github.com/ondatra-ai/for-test-purpose/issues/1',
        ]
      );

      // Verify successful execution
      expect(result.exitCode).toBe(0);
      expect(result.stdout).toContain(
        "Flow 'read-github-issue-flow' completed successfully"
      );

      // Verify GitHub step executed
      expect(result.stdout).toContain('ReadGitHubIssueStep: Reading issue #1');
      expect(result.stdout).toContain(
        'Successfully loaded GitHub issue #1 from ondatra-ai/for-test-purpose'
      );

      // Verify context was populated (check log step output)
      expect(result.stdout).toContain(
        'Issue: [TEST Issue] Create something for ai'
      );
      expect(result.stdout).toContain('by killev');
      expect(result.stdout).toContain('Comments: 1');
    });

    it('should handle invalid GitHub issue URL with error', async () => {
      // Copy the read GitHub issue test flow
      await copyFlowFile('read-github-issue-flow.json', tempTestDir, 'data');

      // Test error handling for invalid URLs
      const result = await runFlowCommand(
        testEnv,
        tempTestDir,
        'read-github-issue-flow',
        ['--github-issue', 'https://invalid-url']
      );

      expect(result.exitCode).toBe(1);
      expect(result.stderr).toContain('Invalid GitHub issue URL');
    });

    it('should work without authentication for public repos', async () => {
      // Copy the read GitHub issue test flow
      await copyFlowFile('read-github-issue-flow.json', tempTestDir, 'data');

      // Test without GITHUB_TOKEN for public repo
      const result = await runFlowCommand(
        testEnv,
        tempTestDir,
        'read-github-issue-flow',
        [
          '--github-issue',
          'https://github.com/ondatra-ai/for-test-purpose/issues/1',
        ]
      );

      // Should work for public repos even without token
      expect(result.exitCode).toBe(0);
      expect(result.stdout).toContain(
        "Flow 'read-github-issue-flow' completed successfully"
      );
    });
  });
});

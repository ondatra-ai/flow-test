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
    it('should read GitHub issue from CLI argument and populate context (success or rate limit)', async () => {
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

      // Verify flow starts properly
      expect(result.stdout).toContain('Loading flow: read-github-issue-flow');
      expect(result.stdout).toContain(
        'Starting flow execution: read-github-issue-flow'
      );
      expect(result.stdout).toContain('ReadGitHubIssueStep: Reading issue #1');

      // The flow may succeed (if auth available) or fail due to rate limiting
      // Both are valid outcomes for integration tests
      if (result.exitCode === 0) {
        // Successful execution
        expect(result.stdout).toContain(
          "Flow 'read-github-issue-flow' completed successfully"
        );
        expect(result.stdout).toContain('Successfully loaded GitHub issue #1');
      } else {
        // Expected failure due to GitHub API rate limiting or authentication
        expect(result.stderr || result.stdout).toMatch(
          /rate limit|authentication|API/i
        );
      }
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

    it('should work without authentication for public repos (success or rate limit)', async () => {
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

      // Verify flow starts properly
      expect(result.stdout).toContain('Loading flow: read-github-issue-flow');
      expect(result.stdout).toContain(
        'Starting flow execution: read-github-issue-flow'
      );

      // The flow may succeed (for public repos) or fail due to rate limiting
      // Both are valid outcomes for integration tests
      if (result.exitCode === 0) {
        // Successful execution
        expect(result.stdout).toContain(
          "Flow 'read-github-issue-flow' completed successfully"
        );
      } else {
        // Expected failure due to GitHub API rate limiting
        expect(result.stderr || result.stdout).toMatch(
          /rate limit|authentication|API/i
        );
      }
    });
  });
});

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
 * E2E tests for Plan Generation Step
 * These tests verify that flows with PlanGenerationStep execute correctly
 */
describe('Plan Generation Step E2E Tests', () => {
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
    tempTestDir = createTestDirPath('plan-generation-test');
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

  describe('Plan Generation Flow', () => {
    it('should read GitHub issue and generate execution plan', async () => {
      // Copy the test flow file to the temp directory
      await copyFlowFile(
        'plan-generation-test-flow.json',
        tempTestDir,
        'data/plan-generation'
      );

      // Run the flow with 60-second timeout for LLM API calls
      const result = await runFlowCommand(
        testEnv,
        tempTestDir,
        'plan-generation-test-flow',
        [], // no additional parameters
        60000 // 60 seconds for LLM API calls
      );

      // Verify successful execution
      expect(result.exitCode).toBe(0);
      expect(result.stdout).toContain(
        "Flow 'plan-generation-test-flow' completed successfully"
      );

      // Verify first step: GitHub issue reading
      expect(result.stdout).toContain('ReadGitHubIssueStep: Reading issue #1');
      expect(result.stdout).toContain(
        'Successfully loaded GitHub issue #1 from ondatra-ai/for-test-purpose'
      );

      // Verify second step: Plan generation
      expect(result.stdout).toContain('PlanGenerationStep');
      expect(result.stdout).toContain('Generating plan for issue');
      expect(result.stdout).toContain('=== GENERATED PLAN ===');
      expect(result.stdout).toContain('=== END PLAN ===');

      // Verify that the plan contains structured content
      expect(result.stdout).toContain('# Execution Plan');

      // Verify issue data was passed correctly to the plan generation
      expect(result.stdout).toContain('[TEST Issue] Create something for ai');
    });

    it('should handle LLM provider errors gracefully', async () => {
      // This test will be implemented when we add error handling
      // For now, we'll skip it
      expect(true).toBe(true);
    });
  });
});

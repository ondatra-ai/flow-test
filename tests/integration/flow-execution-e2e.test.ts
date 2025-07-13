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
 * These tests verify that different types of flows execute correctly
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

  beforeEach(async ctx => {
    // Create a unique test directory for each test
    tempTestDir = createTestDirPath(ctx.task.name);
    await fs.mkdir(tempTestDir, { recursive: true });
  });

  afterEach(async () => {
    // Keep test results for debugging - no cleanup needed
  });

  describe('Comprehensive Test Flow', () => {
    it('should execute all step types in a single flow', async () => {
      // Copy the comprehensive test flow
      await copyFlowFile('comprehensive-test-flow.json', tempTestDir);

      // Run the comprehensive flow
      const result = await runFlowCommand(
        testEnv,
        tempTestDir,
        'comprehensive-test-flow'
      );

      // Verify successful execution
      expect(result.exitCode).toBe(0);
      // Note: Error level logs appear in stderr (raw message without context)
      expect(result.stderr).toContain(
        'ERROR: Error {{context.errorCode}} in {{context.appName}}'
      );

      // Verify flow starts and completes
      expect(result.stdout).expectOutputToContain([
        'Loading flow: comprehensive-test-flow',
        'Starting flow execution: comprehensive-test-flow',
        'Starting comprehensive test flow',
        'Comprehensive test flow completed successfully',
        "Flow 'comprehensive-test-flow' completed successfully",
      ]);

      // Verify action steps executed
      expect(result.stdout).expectOutputToContain([
        "Executing ActionStep: setContext on key 'username'",
        "Executing ActionStep: setContext on key 'role'",
        "Executing ActionStep: updateContext on key 'role'",
        "Executing ActionStep: removeContext on key 'temp'",
      ]);

      // Verify log steps with raw message output (no context processing)
      expect(result.stdout).expectOutputToContain([
        'Starting {{context.appName}} version {{context.version}}',
        // LogStep now outputs raw message without context interpolation
        'LogStep: Error {{context.errorCode}} in {{context.appName}}',
        'LogStep: Debug: appName={{context.appName}}, ' +
          'version={{context.version}}, errorCode={{context.errorCode}}',
      ]);

      // Verify warn level LogStep output in stdout (raw message format)
      expect(result.stdout).toContain(
        'WARN: User {{context.user}} logged in to {{context.appName}}'
      );

      // Verify decision steps
      expect(result.stdout).expectOutputToContain([
        'Taking urgent path',
        "Executing DecisionStep: evaluating condition 'not_empty'",
      ]);
    });
  });

  describe('Invalid Flow', () => {
    it('should handle invalid flow with appropriate error', async () => {
      // Copy the invalid flow file
      await copyFlowFile('invalid-flow.json', tempTestDir);

      // Run the flow
      const result = await runFlowCommand(testEnv, tempTestDir, 'invalid-flow');

      // Verify it fails with appropriate error
      expect(result.exitCode).not.toBe(0);
      expect(result.stdout).toContain('Loading flow: invalid-flow');
      expect(result.stderr).toBeTruthy(); // Should have error output
    });
  });

  describe('Flow with Parameters', () => {
    it('should pass parameters to flow context', async () => {
      // Copy the comprehensive test flow
      await copyFlowFile('comprehensive-test-flow.json', tempTestDir);

      // Run the flow with parameters
      const result = await runFlowCommand(
        testEnv,
        tempTestDir,
        'comprehensive-test-flow',
        ['param1Value', 'param2Value']
      );

      // Verify successful execution
      expect(result.exitCode).toBe(0);
      expect(result.stdout).toContain(
        "Flow 'comprehensive-test-flow' completed successfully"
      );
      // Error level logs appear in stderr (raw message without context)
      expect(result.stderr).toContain(
        'ERROR: Error {{context.errorCode}} in {{context.appName}}'
      );
      // The parameters should be available in context as param0 and param1
    });
  });

  describe('Non-existent Flow', () => {
    it('should handle non-existent flow with appropriate error', async () => {
      // Try to run a flow that doesn't exist
      const result = await runFlowCommand(
        testEnv,
        tempTestDir,
        'non-existent-flow'
      );

      // Verify it fails with appropriate error
      expect(result.exitCode).not.toBe(0);
      expect(result.stderr).toContain('Flow execution failed');
    });
  });

  describe('InitialStepId Functionality', () => {
    it('should execute flow with initialStepId configuration', async () => {
      // Use existing simple-decision-test.json which has
      // "initialStepId": "set-priority"
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

      // Verify flow starts from set-priority (configured initialStepId)
      expect(result.stdout).expectOutputToContain([
        "Executing ActionStep: setContext on key 'priority'",
        "Executing DecisionStep: evaluating condition 'equals'",
        'High priority path taken',
      ]);
    });

    it('should work with comprehensive flow using initialStepId', async () => {
      // Use existing comprehensive-test-flow.json which has
      // "initialStepId": "start"
      await copyFlowFile('comprehensive-test-flow.json', tempTestDir);

      // Run the flow
      const result = await runFlowCommand(
        testEnv,
        tempTestDir,
        'comprehensive-test-flow'
      );

      // Verify successful execution
      expect(result.exitCode).toBe(0);
      expect(result.stdout).toContain(
        "Flow 'comprehensive-test-flow' completed successfully"
      );

      // Verify flow starts from "start" step (configured initialStepId)
      expect(result.stdout).toContain('Starting comprehensive test flow');

      // Verify it follows the correct execution path
      expect(result.stdout).expectOutputToContain([
        'Starting comprehensive test flow',
        "Executing ActionStep: setContext on key 'username'",
        'Comprehensive test flow completed successfully',
      ]);
    });
  });
});

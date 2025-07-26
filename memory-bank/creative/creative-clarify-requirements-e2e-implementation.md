# E2E Test Implementation Example (VAN-Inspired)

## Test Structure

```typescript
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

describe('Clarify Requirements E2E Tests (VAN-Inspired)', () => {
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
    tempTestDir = createTestDirPath(ctx.task.name);
    await fs.mkdir(tempTestDir, { recursive: true });
  });

  describe('Clear Requirements Scenario', () => {
    it('should analyze clear requirements without posting clarification', async () => {
      // Copy test flow configuration
      await copyFlowFile(
        'clarify-requirements-clear-test-flow.json',
        tempTestDir,
        'data/clarify-requirements'
      );

      // Run the flow with clear requirements issue
      const result = await runFlowCommand(
        testEnv,
        tempTestDir,
        'clarify-requirements-clear-test-flow',
        [
          '--github-issue',
          'https://github.com/ondatra-ai/for-test-purpose/issues/10',
        ]
      );

      // ✓ INITIALIZATION CHECKPOINT
      expect(result.exitCode).toBe(0);
      expect(result.stdout).toContain('ReadGitHubIssueStep: Reading issue #10');
      expect(result.stdout).toContain('Successfully loaded GitHub issue #10');

      // ✓ ANALYSIS CHECKPOINT
      expect(result.stdout).toContain(
        'ClarifyRequirementsStep: Analyzing requirements'
      );
      expect(result.stdout).toContain('Requirements extracted successfully');
      expect(result.stdout).toContain('Completeness score: ');
      expect(result.stdout).toMatch(/Completeness score: (8[0-9]|9[0-9]|100)%/); // > 80%

      // ✓ CLARIFICATION CHECKPOINT
      expect(result.stdout).toContain(
        'No clarification needed - requirements are clear'
      );
      expect(result.stdout).not.toContain('Posting clarification comment');
      expect(result.stdout).not.toContain('Comment posted successfully');

      // ✓ COMPLETION CHECKPOINT
      expect(result.stdout).toContain(
        "Flow 'clarify-requirements-clear-test-flow' completed successfully"
      );
    });
  });

  describe('Ambiguous Requirements Scenario', () => {
    it('should detect ambiguous requirements and post clarification', async () => {
      await copyFlowFile(
        'clarify-requirements-ambiguous-test-flow.json',
        tempTestDir,
        'data/clarify-requirements'
      );

      const result = await runFlowCommand(
        testEnv,
        tempTestDir,
        'clarify-requirements-ambiguous-test-flow',
        [
          '--github-issue',
          'https://github.com/ondatra-ai/for-test-purpose/issues/11',
        ]
      );

      // ✓ INITIALIZATION CHECKPOINT
      expect(result.exitCode).toBe(0);
      expect(result.stdout).toContain('Successfully loaded GitHub issue #11');

      // ✓ ANALYSIS CHECKPOINT
      expect(result.stdout).toContain('Ambiguities detected: ');
      expect(result.stdout).toMatch(/Ambiguities detected: [1-9]/);
      expect(result.stdout).toContain('Completeness score: ');
      expect(result.stdout).toMatch(/Completeness score: ([0-6][0-9]|7[0-9])%/); // < 80%

      // ✓ CLARIFICATION CHECKPOINT
      expect(result.stdout).toContain(
        'Clarification needed - generating questions'
      );
      expect(result.stdout).toContain('Generated clarifying questions:');
      expect(result.stdout).toContain(
        'Posting clarification comment to GitHub'
      );
      expect(result.stdout).toContain('Comment posted successfully');

      // Verify specific ambiguity detections
      expect(result.stdout).toMatch(/Vague term.*"slow".*detected/);
      expect(result.stdout).toMatch(/Missing.*performance metrics/);
      expect(result.stdout).toMatch(/Unclear.*"faster"/);
    });
  });

  describe('Context Analysis Scenario', () => {
    it('should analyze context from related issues', async () => {
      await copyFlowFile(
        'clarify-requirements-context-test-flow.json',
        tempTestDir,
        'data/clarify-requirements'
      );

      const result = await runFlowCommand(
        testEnv,
        tempTestDir,
        'clarify-requirements-context-test-flow',
        [
          '--github-issue',
          'https://github.com/ondatra-ai/for-test-purpose/issues/12',
        ]
      );

      // ✓ CONTEXT CHECKPOINT
      expect(result.stdout).toContain('Analyzing context from related issues');
      expect(result.stdout).toContain('Found reference to issue #10');
      expect(result.stdout).toContain('Found reference to issue #8');
      expect(result.stdout).toContain('Found reference to issue #5');
      expect(result.stdout).toContain('Loading context from 3 related issues');

      // Verify context extraction
      expect(result.stdout).toContain(
        'Context loaded from issue #10: authentication system'
      );
      expect(result.stdout).toContain(
        'Context loaded from issue #8: social login'
      );
      expect(result.stdout).toContain(
        'Context loaded from issue #5: remember me'
      );
    });
  });

  describe('Error Handling Scenarios', () => {
    it('should handle GitHub API failures with retry', async () => {
      // Test with invalid token to trigger API failure
      process.env.GITHUB_TOKEN = 'invalid-token';

      await copyFlowFile(
        'clarify-requirements-error-test-flow.json',
        tempTestDir,
        'data/clarify-requirements'
      );

      const result = await runFlowCommand(
        testEnv,
        tempTestDir,
        'clarify-requirements-error-test-flow',
        [
          '--github-issue',
          'https://github.com/ondatra-ai/for-test-purpose/issues/11',
        ]
      );

      // Verify error handling
      expect(result.exitCode).not.toBe(0);
      expect(result.stderr).toContain('GitHub API error');
      expect(result.stderr).toContain('Retry attempt');
    });
  });
});
```

## Test Flow Configurations

### Clear Requirements Test Flow

```json
{
  "id": "clarify-requirements-clear-test-flow",
  "name": "Clear Requirements Test",
  "description": "Tests clarification for well-defined requirements",
  "initialStepId": "read-issue",
  "steps": [
    {
      "id": "read-issue",
      "type": "read-github-issue",
      "issueUrl": "{{github_issue_url}}",
      "github_token": "{{env.GITHUB_TOKEN}}",
      "nextStepId": {
        "default": "clarify"
      }
    },
    {
      "id": "clarify",
      "type": "clarify-requirements",
      "requirementAnalysis": {
        "checkCompleteness": true,
        "detectAmbiguity": true,
        "analyzeContext": false
      },
      "clarificationBehavior": {
        "postAsComment": true,
        "dryRun": false,
        "maxIterations": 1
      },
      "github_token": "{{env.GITHUB_TOKEN}}",
      "nextStepId": {}
    }
  ]
}
```

### Ambiguous Requirements Test Flow

```json
{
  "id": "clarify-requirements-ambiguous-test-flow",
  "name": "Ambiguous Requirements Test",
  "description": "Tests clarification for vague requirements",
  "initialStepId": "read-issue",
  "steps": [
    {
      "id": "read-issue",
      "type": "read-github-issue",
      "issueUrl": "{{github_issue_url}}",
      "github_token": "{{env.GITHUB_TOKEN}}",
      "nextStepId": {
        "default": "clarify"
      }
    },
    {
      "id": "clarify",
      "type": "clarify-requirements",
      "requirementAnalysis": {
        "checkCompleteness": true,
        "detectAmbiguity": true,
        "analyzeContext": false
      },
      "clarificationBehavior": {
        "postAsComment": true,
        "dryRun": false,
        "maxIterations": 1
      },
      "github_token": "{{env.GITHUB_TOKEN}}",
      "nextStepId": {}
    }
  ]
}
```

import 'reflect-metadata';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { StepFactory } from '../../../src/flow/step-factory.js';
import { ReadGitHubIssueStep } from '../../../src/flow/types/read-github-issue-step.js';
import { cast } from '../../../src/utils/cast.js';
import { GitHubClient } from '../../../src/utils/github-client.js';
import { Logger } from '../../../src/utils/logger.js';
import { type ReadGitHubIssueStepConfig } from '../../../src/validation/index.js';

describe('StepFactory', () => {
  let stepFactory: StepFactory;
  let mockLogger: Logger;
  let mockGitHubClient: GitHubClient;

  beforeEach(() => {
    mockLogger = cast<Logger>({
      info: vi.fn(),
      error: vi.fn(),
      warn: vi.fn(),
      debug: vi.fn(),
    });

    mockGitHubClient = cast<GitHubClient>({
      getIssue: vi.fn(),
    });

    stepFactory = new StepFactory(mockLogger, mockGitHubClient);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('createStep', () => {
    it('should create ReadGitHubIssueStep for read-github-issue type', () => {
      const stepConfig: ReadGitHubIssueStepConfig = {
        id: 'test-step',
        type: 'read-github-issue',
        issueUrl: 'https://github.com/owner/repo/issues/1',
        nextStepId: { success: 'next-step' },
      };

      const step = stepFactory.createStep(stepConfig);

      expect(step).toBeInstanceOf(ReadGitHubIssueStep);
      expect(step.getId()).toBe('test-step');
    });

    it('should throw error for unknown step type', () => {
      const stepConfig = {
        id: 'test-step',
        type: 'unknown-type' as 'read-github-issue',
        issueUrl: 'https://github.com/owner/repo/issues/1',
        nextStepId: { success: 'next-step' },
      } as ReadGitHubIssueStepConfig;

      expect(() => stepFactory.createStep(stepConfig)).toThrow(
        'Unknown step type'
      );
    });
  });
});

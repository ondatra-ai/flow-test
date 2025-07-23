import 'reflect-metadata';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { StepFactory } from '../../../src/flow/step-factory.js';
import { PlanGenerationStep } from '../../../src/flow/types/plan-generation-step.js';
import { ReadGitHubIssueStep } from '../../../src/flow/types/read-github-issue-step.js';
// eslint-disable-next-line no-restricted-imports
import { cast } from '../../../src/utils/cast.js';
import { GitHubClient } from '../../../src/utils/github-client.js';
import { Logger } from '../../../src/utils/logger.js';
import {
  type ReadGitHubIssueStepConfig,
  type PlanGenerationStepConfig,
} from '../../../src/validation/index.js';

// Mock the container.resolve calls
vi.mock('tsyringe', async () => {
  const actual = await vi.importActual('tsyringe');
  return {
    ...actual,
    container: {
      resolve: vi.fn().mockImplementation((token: unknown) => {
        // Mock LLM provider based on token
        const tokenString = String(token);
        if (tokenString.includes('ClaudeProvider')) {
          return { generate: vi.fn().mockResolvedValue('mock plan') };
        }
        if (tokenString.includes('OpenAIProvider')) {
          return { generate: vi.fn().mockResolvedValue('mock plan') };
        }
        if (tokenString.includes('GeminiProvider')) {
          return { generate: vi.fn().mockResolvedValue('mock plan') };
        }
        return {};
      }),
    },
  };
});

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
    it('should create a PlanGenerationStep with correct configuration', () => {
      const config: PlanGenerationStepConfig = {
        id: 'plan-step',
        type: 'plan-generation',
        llm_provider: 'claude',
        model: 'claude-sonnet-4-20250514',
        temperature: 0.7,
        max_tokens: 2000,
        nextStepId: { default: 'next-step' },
      };

      const step = stepFactory.createStep(config);

      expect(step).toBeInstanceOf(PlanGenerationStep);
      expect(step.getId()).toBe('plan-step');
    });

    it('should create a ReadGitHubIssueStep with correct configuration', () => {
      const config: ReadGitHubIssueStepConfig = {
        id: 'read-issue-step',
        type: 'read-github-issue',
        issueUrl: 'https://github.com/owner/repo/issues/1',
        nextStepId: { default: 'next-step' },
      };

      const step = stepFactory.createStep(config);

      expect(step).toBeInstanceOf(ReadGitHubIssueStep);
      expect(step.getId()).toBe('read-issue-step');
    });

    it('should throw error for unsupported step type', () => {
      const config = {
        id: 'unsupported-step',
        type: 'unsupported-type',
        nextStepId: { default: 'next-step' },
      };

      expect(() => {
        stepFactory.createStep(cast<ReadGitHubIssueStepConfig>(config));
      }).toThrow('Unexpected step type: "unsupported-type"');
    });

    it('should handle missing configuration gracefully', () => {
      expect(() => {
        stepFactory.createStep(cast<ReadGitHubIssueStepConfig>(null));
      }).toThrow();
    });
  });
});

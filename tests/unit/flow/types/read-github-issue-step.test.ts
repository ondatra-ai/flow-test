import { describe, it, expect, vi, beforeEach } from 'vitest';

import { Context } from '../../../../src/flow/context.js';
import { ReadGitHubIssueStep } from '../../../../src/flow/types/read-github-issue-step.js';
import type { Logger } from '../../../../src/utils/logger.js';
import type { ReadGitHubIssueStepConfig } from '../../../../src/validation/schemas/step.schema.js';

// Mock dependencies
vi.mock('../../../../src/utils/github-url-parser.js', () => ({
  parseGitHubIssueUrl: vi.fn(url => {
    if (url === 'https://github.com/owner/repo/issues/123') {
      return { owner: 'owner', repo: 'repo', issueNumber: 123 };
    }
    throw new Error('Invalid GitHub issue URL');
  }),
}));

vi.mock('../../../../src/utils/github-client.js', () => ({
  GitHubClient: vi.fn().mockImplementation(() => ({
    getIssueWithComments: vi.fn().mockResolvedValue({
      issue: {
        number: 123,
        title: 'Test Issue',
        body: 'Test body',
        state: 'open',
        user: { login: 'testuser' },
        created_at: '2023-01-01',
        updated_at: '2023-01-02',
      },
      comments: [
        { id: 1, body: 'Comment 1', user: { login: 'user1' } },
        { id: 2, body: 'Comment 2', user: { login: 'user2' } },
      ],
    }),
  })),
}));

describe('ReadGitHubIssueStep', () => {
  let context: Context;
  let mockLogger: Logger;

  beforeEach(() => {
    vi.clearAllMocks();
    context = new Context();
    mockLogger = {
      info: vi.fn(),
      error: vi.fn(),
      warn: vi.fn(),
      debug: vi.fn(),
    } as unknown as Logger;
  });

  describe('constructor', () => {
    it('should create step with provided config', () => {
      const config: ReadGitHubIssueStepConfig = {
        type: 'read-github-issue',
        id: 'test-step',
        issueUrl: 'https://github.com/owner/repo/issues/123',
        includeComments: true,
        github_token: 'test-token',
        nextStepId: { default: 'next-step' },
      };

      const step = new ReadGitHubIssueStep(mockLogger, config);

      expect(step.getId()).toBe('test-step');
      expect(step.githubToken).toBe('test-token');
    });

    it('should use GITHUB_TOKEN env var when github_token not provided', () => {
      const originalEnv = process.env.GITHUB_TOKEN;
      process.env.GITHUB_TOKEN = 'env-token';

      const config: ReadGitHubIssueStepConfig = {
        type: 'read-github-issue',
        id: 'test-step',
        issueUrl: 'https://github.com/owner/repo/issues/123',
        includeComments: true,
        nextStepId: {},
      };

      const step = new ReadGitHubIssueStep(mockLogger, config);

      expect(step.githubToken).toBe('env-token');

      process.env.GITHUB_TOKEN = originalEnv;
    });

    it('should have empty githubToken when no token provided', () => {
      const originalEnv = process.env.GITHUB_TOKEN;
      delete process.env.GITHUB_TOKEN;

      const config: ReadGitHubIssueStepConfig = {
        type: 'read-github-issue',
        id: 'test-step',
        issueUrl: 'https://github.com/owner/repo/issues/123',
        includeComments: true,
        nextStepId: {},
      };

      const step = new ReadGitHubIssueStep(mockLogger, config);

      expect(step.githubToken).toBe('');

      process.env.GITHUB_TOKEN = originalEnv;
    });
  });

  describe('execute', () => {
    it('should fetch GitHub issue and populate context', async () => {
      const config: ReadGitHubIssueStepConfig = {
        type: 'read-github-issue',
        id: 'test-step',
        issueUrl: 'https://github.com/owner/repo/issues/123',
        includeComments: true,
        github_token: 'test-token',
        nextStepId: {},
      };

      const step = new ReadGitHubIssueStep(mockLogger, config);
      await step.execute(context);

      // Check logger calls
      expect(vi.mocked(mockLogger.info)).toHaveBeenCalledWith(
        'ReadGitHubIssueStep: Reading issue #123 from owner/repo'
      );
      expect(vi.mocked(mockLogger.info)).toHaveBeenCalledWith(
        'Successfully loaded GitHub issue #123 from owner/repo'
      );

      // Check context population
      expect(context.get('github.issue.number')).toBe('123');
      expect(context.get('github.issue.title')).toBe('Test Issue');
      expect(context.get('github.issue.body')).toBe('Test body');
      expect(context.get('github.issue.author')).toBe('testuser');
      expect(context.get('github.issue.state')).toBe('open');
      expect(context.get('github.issue.created_at')).toBe('2023-01-01');
      expect(context.get('github.issue.updated_at')).toBe('2023-01-02');
      expect(context.get('github.issue.url')).toBe(
        'https://github.com/owner/repo/issues/123'
      );
      expect(context.get('github.issue.comments_count')).toBe('2');

      // When includeComments is true, comments should be stored
      const commentsJson = context.get('github.issue.comments');
      expect(commentsJson).toBeDefined();
      const comments = JSON.parse(commentsJson as string) as Array<{
        id: number;
        body: string;
        user: { login: string };
      }>;
      expect(comments).toHaveLength(2);
      expect(comments[0].body).toBe('Comment 1');
    });

    it('should use URL from context when available', async () => {
      // Set URL in context
      context.set(
        'github.issue.url',
        'https://github.com/owner/repo/issues/123'
      );

      const config: ReadGitHubIssueStepConfig = {
        type: 'read-github-issue',
        id: 'test-step',
        issueUrl: 'https://github.com/different/repo/issues/456', // Different URL
        includeComments: true,
        nextStepId: {},
      };

      const step = new ReadGitHubIssueStep(mockLogger, config);
      await step.execute(context);

      // Should use URL from context, not config
      expect(vi.mocked(mockLogger.info)).toHaveBeenCalledWith(
        'ReadGitHubIssueStep: Reading issue #123 from owner/repo'
      );
    });

    it('should handle missing issueUrl in both config and context', async () => {
      const config: ReadGitHubIssueStepConfig = {
        type: 'read-github-issue',
        id: 'test-step',
        issueUrl: undefined as unknown as string, // Missing URL
        includeComments: true,
        nextStepId: {},
      };

      const step = new ReadGitHubIssueStep(mockLogger, config);

      await expect(step.execute(context)).rejects.toThrow(
        'Invalid GitHub issue URL'
      );

      expect(vi.mocked(mockLogger.error)).toHaveBeenCalledWith(
        'ReadGitHubIssueStep failed',
        expect.objectContaining({
          error: 'Invalid GitHub issue URL',
        })
      );
    });

    it('should handle invalid GitHub URL', async () => {
      const config: ReadGitHubIssueStepConfig = {
        type: 'read-github-issue',
        id: 'test-step',
        issueUrl: 'https://invalid-url',
        includeComments: true,
        nextStepId: {},
      };

      const step = new ReadGitHubIssueStep(mockLogger, config);

      await expect(step.execute(context)).rejects.toThrow(
        'Invalid GitHub issue URL'
      );

      expect(vi.mocked(mockLogger.error)).toHaveBeenCalledWith(
        'ReadGitHubIssueStep failed',
        expect.objectContaining({
          error: 'Invalid GitHub issue URL',
        })
      );
    });

    it('should handle GitHub API errors', async () => {
      const { GitHubClient } = await import(
        '../../../../src/utils/github-client.js'
      );
      const mockClient = {
        getIssueWithComments: vi.fn().mockRejectedValue(new Error('API Error')),
      };
      (GitHubClient as ReturnType<typeof vi.fn>).mockImplementationOnce(
        () => mockClient
      );

      const config: ReadGitHubIssueStepConfig = {
        type: 'read-github-issue',
        id: 'test-step',
        issueUrl: 'https://github.com/owner/repo/issues/123',
        includeComments: true,
        nextStepId: {},
      };

      const step = new ReadGitHubIssueStep(mockLogger, config);

      await expect(step.execute(context)).rejects.toThrow('API Error');

      expect(vi.mocked(mockLogger.error)).toHaveBeenCalledWith(
        'ReadGitHubIssueStep failed',
        expect.objectContaining({
          error: 'API Error',
        })
      );
    });

    it('should exclude comments when includeComments is false', async () => {
      const config: ReadGitHubIssueStepConfig = {
        type: 'read-github-issue',
        id: 'test-step',
        issueUrl: 'https://github.com/owner/repo/issues/123',
        includeComments: false,
        nextStepId: {},
      };

      const step = new ReadGitHubIssueStep(mockLogger, config);
      await step.execute(context);

      // Comments count should be set but comments array should not be stored
      expect(context.get('github.issue.comments_count')).toBe('2');
      // When includeComments is false, comments should not be stored in context
      expect(context.get('github.issue.comments')).toBeUndefined();
    });

    it('should handle empty body gracefully', async () => {
      const { GitHubClient } = await import(
        '../../../../src/utils/github-client.js'
      );
      const mockClient = {
        getIssueWithComments: vi.fn().mockResolvedValue({
          issue: {
            number: 123,
            title: 'Test Issue',
            body: null, // No body
            state: 'open',
            user: { login: 'testuser' },
            created_at: '2023-01-01',
            updated_at: '2023-01-02',
          },
          comments: [],
        }),
      };
      (GitHubClient as ReturnType<typeof vi.fn>).mockImplementationOnce(
        () => mockClient
      );

      const config: ReadGitHubIssueStepConfig = {
        type: 'read-github-issue',
        id: 'test-step',
        issueUrl: 'https://github.com/owner/repo/issues/123',
        includeComments: true,
        nextStepId: {},
      };

      const step = new ReadGitHubIssueStep(mockLogger, config);
      await step.execute(context);

      expect(context.get('github.issue.body')).toBe('');
    });
  });
});

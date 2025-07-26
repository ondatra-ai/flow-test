import 'reflect-metadata';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { Context } from '../../../../src/flow/context.js';
import { ReadGitHubIssueStep } from '../../../../src/flow/types/read-github-issue-step.js';
import { cast } from '../../../../src/utils/cast.js';
import type { GitHubClient } from '../../../../src/utils/github-client.js';
import type { ILogger } from '../../../../src/utils/logger.js';
import type { ReadGitHubIssueStepConfig } from '../../../../src/validation/schemas/step.schema.js';

// Mock dependencies
vi.mock('../../../../src/utils/github-url-parser.js', () => ({
  parseGitHubIssueUrl: vi.fn(url => {
    if (url === 'https://github.com/owner/repo/issues/123') {
      return { owner: 'owner', repo: 'repo', issue_number: 123 };
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

// Test helper functions
function createMockLogger(): ILogger {
  return cast<ILogger>({
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn(),
  });
}

function createMockGitHubClient(): GitHubClient {
  return cast<GitHubClient>({
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
  });
}

describe('ReadGitHubIssueStep - Execute', () => {
  let context: Context;
  let mockLogger: ILogger;
  let mockGitHubClient: GitHubClient;

  beforeEach(() => {
    vi.clearAllMocks();
    context = new Context();
    mockLogger = createMockLogger();
    mockGitHubClient = createMockGitHubClient();
  });

  it('should fetch GitHub issue and populate context', async () => {
    const config: ReadGitHubIssueStepConfig = {
      type: 'read-github-issue',
      id: 'test-step',
      issueUrl: 'https://github.com/owner/repo/issues/123',
      github_token: 'test-token',
      nextStepId: {},
    };

    const step = new ReadGitHubIssueStep(mockLogger, mockGitHubClient, config);
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

    // Comments should always be stored
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
    context.set('github.issue.url', 'https://github.com/owner/repo/issues/123');

    const config: ReadGitHubIssueStepConfig = {
      type: 'read-github-issue',
      id: 'test-step',
      issueUrl: 'https://github.com/different/repo/issues/456', // Different URL
      nextStepId: {},
    };

    const step = new ReadGitHubIssueStep(mockLogger, mockGitHubClient, config);
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
      issueUrl: cast<string>(undefined), // Missing URL
      nextStepId: {},
    };

    const step = new ReadGitHubIssueStep(mockLogger, mockGitHubClient, config);

    await expect(step.execute(context)).rejects.toThrow(
      'Invalid GitHub issue URL'
    );

    // Error should bubble up without intermediate logging
    expect(vi.mocked(mockLogger.error)).not.toHaveBeenCalled();
  });

  it('should handle invalid GitHub URL', async () => {
    const config: ReadGitHubIssueStepConfig = {
      type: 'read-github-issue',
      id: 'test-step',
      issueUrl: 'https://invalid-url',
      nextStepId: {},
    };

    const step = new ReadGitHubIssueStep(mockLogger, mockGitHubClient, config);

    await expect(step.execute(context)).rejects.toThrow(
      'Invalid GitHub issue URL'
    );

    // Error should bubble up without intermediate logging
    expect(vi.mocked(mockLogger.error)).not.toHaveBeenCalled();
  });

  it('should handle GitHub API errors', async () => {
    // Override the mock to throw an error
    const errorMockClient = cast<GitHubClient>({
      getIssueWithComments: vi.fn().mockRejectedValue(new Error('API Error')),
    });

    const config: ReadGitHubIssueStepConfig = {
      type: 'read-github-issue',
      id: 'test-step',
      issueUrl: 'https://github.com/owner/repo/issues/123',
      nextStepId: {},
    };

    const step = new ReadGitHubIssueStep(mockLogger, errorMockClient, config);

    await expect(step.execute(context)).rejects.toThrow('API Error');

    // Error should bubble up without intermediate logging
    expect(vi.mocked(mockLogger.error)).not.toHaveBeenCalled();
  });

  it('should handle empty body gracefully', async () => {
    const emptyBodyMockClient = cast<GitHubClient>({
      getIssueWithComments: vi.fn().mockResolvedValue({
        issue: {
          number: 123,
          title: 'Test Issue',
          body: '', // Empty body
          state: 'open',
          user: { login: 'testuser' },
          created_at: '2023-01-01',
          updated_at: '2023-01-02',
        },
        comments: [],
      }),
    });

    const config: ReadGitHubIssueStepConfig = {
      type: 'read-github-issue',
      id: 'test-step',
      issueUrl: 'https://github.com/owner/repo/issues/123',
      nextStepId: {},
    };

    const step = new ReadGitHubIssueStep(
      mockLogger,
      emptyBodyMockClient,
      config
    );
    await step.execute(context);

    expect(context.get('github.issue.body')).toBe('');
  });
});

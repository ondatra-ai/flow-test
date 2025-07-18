import 'reflect-metadata';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { ReadGitHubIssueStep } from '../../../../src/flow/types/read-github-issue-step.js';
import { cast } from '../../../../src/utils/cast.js';
import type { GitHubClient } from '../../../../src/utils/github-client.js';
import type { Logger } from '../../../../src/utils/logger.js';
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
function createMockLogger(): Logger {
  return cast<Logger>({
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

describe('ReadGitHubIssueStep - Constructor', () => {
  let mockLogger: Logger;
  let mockGitHubClient: GitHubClient;

  beforeEach(() => {
    vi.clearAllMocks();
    mockLogger = createMockLogger();
    mockGitHubClient = createMockGitHubClient();
  });

  it('should create step with provided config', () => {
    const config: ReadGitHubIssueStepConfig = {
      type: 'read-github-issue',
      id: 'test-step',
      issueUrl: 'https://github.com/owner/repo/issues/123',
      github_token: 'test-token',
      nextStepId: { default: 'next-step' },
    };

    const step = new ReadGitHubIssueStep(mockLogger, mockGitHubClient, config);

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
      nextStepId: {},
    };

    const step = new ReadGitHubIssueStep(mockLogger, mockGitHubClient, config);

    expect(step.githubToken).toBe('env-token');

    process.env.GITHUB_TOKEN = originalEnv;
  });

  it('should have empty githubToken when no token provided', () => {
    const originalEnv = process.env.GITHUB_TOKEN;
    process.env.GITHUB_TOKEN = cast<string>(undefined);

    const config: ReadGitHubIssueStepConfig = {
      type: 'read-github-issue',
      id: 'test-step',
      issueUrl: 'https://github.com/owner/repo/issues/123',
      nextStepId: {},
    };

    const step = new ReadGitHubIssueStep(mockLogger, mockGitHubClient, config);

    expect(step.githubToken).toBe('');

    process.env.GITHUB_TOKEN = originalEnv;
  });
});

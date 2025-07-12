import { describe, it, expect, vi, beforeEach } from 'vitest';

import { GitHubClient } from '../../../src/utils/github-client.js';

interface MockOctokit {
  rest: {
    issues: {
      get: ReturnType<typeof vi.fn>;
      listComments: ReturnType<typeof vi.fn>;
    };
  };
}

// Mock Octokit
vi.mock('@octokit/rest', () => {
  const mockOctokit: MockOctokit = {
    rest: {
      issues: {
        get: vi.fn(),
        listComments: vi.fn(),
      },
    },
  };

  return {
    Octokit: vi.fn(() => mockOctokit),
  };
});

describe('GitHubClient', () => {
  let client: GitHubClient;
  let mockOctokit: MockOctokit;

  beforeEach(async () => {
    vi.clearAllMocks();
    // Get the mocked Octokit instance
    const { Octokit } = await import('@octokit/rest');
    client = new GitHubClient();
    mockOctokit = new Octokit() as unknown as MockOctokit;
  });

  describe('constructor', () => {
    it('should create client with GITHUB_TOKEN env var', async () => {
      const { Octokit } = await import('@octokit/rest');
      const originalEnv = process.env.GITHUB_TOKEN;
      process.env.GITHUB_TOKEN = 'env-token';

      new GitHubClient();

      expect(Octokit).toHaveBeenCalledWith({
        auth: 'env-token',
      });

      process.env.GITHUB_TOKEN = originalEnv;
    });

    it('should create client without auth when no token provided', async () => {
      const { Octokit } = await import('@octokit/rest');
      const originalGithubToken = process.env.GITHUB_TOKEN;
      process.env.GITHUB_TOKEN = '';

      new GitHubClient();

      expect(Octokit).toHaveBeenCalledWith({
        auth: undefined,
      });

      process.env.GITHUB_TOKEN = originalGithubToken;
    });
  });

  describe('getIssueWithComments', () => {
    const mockIssue = {
      data: {
        title: 'Test Issue',
        number: 123,
        state: 'open',
        user: { login: 'testuser' },
        body: 'Test body',
        created_at: '2023-01-01',
        updated_at: '2023-01-02',
      },
    };

    const mockComments = {
      data: [
        { id: 1, body: 'Comment 1', user: { login: 'user1' } },
        { id: 2, body: 'Comment 2', user: { login: 'user2' } },
      ],
    };

    it('should fetch issue and comments successfully', async () => {
      mockOctokit.rest.issues.get.mockResolvedValue(mockIssue);
      mockOctokit.rest.issues.listComments.mockResolvedValue(mockComments);

      const result = await client.getIssueWithComments('owner', 'repo', 123);

      expect(mockOctokit.rest.issues.get).toHaveBeenCalledWith({
        owner: 'owner',
        repo: 'repo',
        issue_number: 123,
      });

      expect(mockOctokit.rest.issues.listComments).toHaveBeenCalledWith({
        owner: 'owner',
        repo: 'repo',
        issue_number: 123,
      });

      expect(result).toEqual({
        issue: mockIssue.data,
        comments: mockComments.data,
      });
    });

    it('should handle 404 error', async () => {
      const error404 = new Error('Not Found') as Error & { status: number };
      error404.status = 404;
      mockOctokit.rest.issues.get.mockRejectedValue(error404);

      await expect(
        client.getIssueWithComments('owner', 'repo', 999)
      ).rejects.toThrow('GitHub issue #999 not found in owner/repo');
    });

    it('should retry without auth on 401 error for public repos', async () => {
      const error401 = new Error('Unauthorized') as Error & { status: number };
      error401.status = 401;

      // First call fails with 401
      mockOctokit.rest.issues.get.mockRejectedValueOnce(error401);

      // Create a new mock for the public client
      const publicMockOctokit: MockOctokit = {
        rest: {
          issues: {
            get: vi.fn().mockResolvedValue(mockIssue),
            listComments: vi.fn().mockResolvedValue(mockComments),
          },
        },
      };

      const { Octokit } = await import('@octokit/rest');
      (Octokit as unknown as ReturnType<typeof vi.fn>).mockImplementationOnce(
        () => publicMockOctokit
      );

      const result = await client.getIssueWithComments('owner', 'repo', 123);

      expect(result).toEqual({
        issue: mockIssue.data,
        comments: mockComments.data,
      });
    });

    it('should throw specific error when 401 retry fails', async () => {
      const error401 = new Error('Unauthorized') as Error & { status: number };
      error401.status = 401;

      // First call fails with 401
      mockOctokit.rest.issues.get.mockRejectedValueOnce(error401);

      // Create a new mock for the public client that also fails
      const publicMockOctokit: MockOctokit = {
        rest: {
          issues: {
            get: vi.fn().mockRejectedValue(new Error('Still fails')),
            listComments: vi.fn(),
          },
        },
      };

      const { Octokit } = await import('@octokit/rest');
      (Octokit as unknown as ReturnType<typeof vi.fn>).mockImplementationOnce(
        () => publicMockOctokit
      );

      await expect(
        client.getIssueWithComments('owner', 'repo', 123)
      ).rejects.toThrow(
        'GitHub authentication failed and repository is not public. Please check your github_token configuration.'
      );
    });

    it('should propagate other errors', async () => {
      const genericError = new Error('Network error');
      mockOctokit.rest.issues.get.mockRejectedValue(genericError);

      await expect(
        client.getIssueWithComments('owner', 'repo', 123)
      ).rejects.toThrow('Network error');
    });

    it('should handle errors without status property', async () => {
      const errorWithoutStatus = { message: 'Some error' };
      mockOctokit.rest.issues.get.mockRejectedValue(errorWithoutStatus);

      await expect(
        client.getIssueWithComments('owner', 'repo', 123)
      ).rejects.toEqual(errorWithoutStatus);
    });
  });
});

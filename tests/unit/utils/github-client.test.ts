import 'reflect-metadata';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import type { MockOctokit } from '../../../src/interfaces/github/index.js';
import { cast } from '../../../src/utils/cast.js';
import { GitHubClient } from '../../../src/utils/github-client.js';

// Mock Octokit
vi.mock('@octokit/rest', () => ({
  Octokit: vi.fn(() => ({
    rest: {
      issues: {
        get: vi.fn(),
        listComments: vi.fn(),
      },
    },
  })),
}));

describe('GitHubClient', () => {
  let client: GitHubClient;
  let mockOctokit: MockOctokit;

  beforeEach(async () => {
    vi.clearAllMocks();

    // Get the mocked Octokit instance
    const { Octokit } = await import('@octokit/rest');
    client = new GitHubClient();
    mockOctokit = cast<MockOctokit>(new Octokit());
  });

  describe('constructor', () => {
    it('should create instance with auth token when GITHUB_TOKEN is set', async () => {
      const originalEnv = process.env.GITHUB_TOKEN;
      process.env.GITHUB_TOKEN = 'test-token';

      const newClient = new GitHubClient();
      expect(newClient).toBeInstanceOf(GitHubClient);

      // Restore original env
      process.env.GITHUB_TOKEN = originalEnv;
    });

    it('should create instance without auth token when GITHUB_TOKEN is not set', async () => {
      const originalEnv = process.env.GITHUB_TOKEN;
      delete process.env.GITHUB_TOKEN;

      const newClient = new GitHubClient();
      expect(newClient).toBeInstanceOf(GitHubClient);

      // Restore original env
      process.env.GITHUB_TOKEN = originalEnv;
    });
  });

  describe('getIssueWithComments', () => {
    it('should return issue with comments when successful', async () => {
      const mockIssue = {
        number: 123,
        title: 'Test Issue',
        body: 'Test body',
        state: 'open',
        user: { login: 'testuser' },
      };

      const mockComments = [
        { id: 1, body: 'Comment 1', user: { login: 'user1' } },
        { id: 2, body: 'Comment 2', user: { login: 'user2' } },
      ];

      // Mock the Octokit methods
      const mockGet = vi.fn().mockResolvedValue({ data: mockIssue });
      const mockListComments = vi
        .fn()
        .mockResolvedValue({ data: mockComments });

      mockOctokit.rest.issues.get = mockGet;
      mockOctokit.rest.issues.listComments = mockListComments;

      const result = await client.getIssueWithComments('owner', 'repo', 123);

      expect(mockGet).toHaveBeenCalledWith({
        owner: 'owner',
        repo: 'repo',
        issue_number: 123,
      });

      expect(mockListComments).toHaveBeenCalledWith({
        owner: 'owner',
        repo: 'repo',
        issue_number: 123,
      });

      expect(result).toEqual({
        issue: mockIssue,
        comments: mockComments,
      });
    });

    it('should throw error when issue not found', async () => {
      const mockGet = vi.fn().mockRejectedValue(new Error('Not found'));
      mockOctokit.rest.issues.get = mockGet;

      await expect(
        client.getIssueWithComments('owner', 'repo', 404)
      ).rejects.toThrow('Not found');
    });

    it('should return issue with empty comments when comments request fails', async () => {
      const mockIssue = {
        number: 123,
        title: 'Test Issue',
        body: 'Test body',
        state: 'open',
        user: { login: 'testuser' },
      };

      const mockGet = vi.fn().mockResolvedValue({ data: mockIssue });
      const mockListComments = vi
        .fn()
        .mockRejectedValue(new Error('Comments error'));

      mockOctokit.rest.issues.get = mockGet;
      mockOctokit.rest.issues.listComments = mockListComments;

      const result = await client.getIssueWithComments('owner', 'repo', 123);

      expect(result).toEqual({
        issue: mockIssue,
        comments: [],
      });
    });

    it('should work with unauthenticated client', async () => {
      const mockIssue = {
        number: 123,
        title: 'Public Issue',
        body: 'Public body',
        state: 'open',
        user: { login: 'publicuser' },
      };

      const publicMockOctokit = {
        rest: {
          issues: {
            get: vi.fn().mockResolvedValue({ data: mockIssue }),
            listComments: vi.fn().mockResolvedValue({ data: [] }),
          },
        },
      };

      const { Octokit } = await import('@octokit/rest');
      cast<ReturnType<typeof vi.fn>>(Octokit).mockImplementationOnce(
        () => publicMockOctokit
      );

      const unauthenticatedClient = new GitHubClient();
      const result = await unauthenticatedClient.getIssueWithComments(
        'owner',
        'repo',
        123
      );

      expect(result).toEqual({
        issue: mockIssue,
        comments: [],
      });
    });

    it('should handle empty comments array', async () => {
      const mockIssue = {
        number: 123,
        title: 'Test Issue',
        body: 'Test body',
        state: 'open',
        user: { login: 'testuser' },
      };

      const mockGet = vi.fn().mockResolvedValue({ data: mockIssue });
      const mockListComments = vi.fn().mockResolvedValue({ data: [] });

      mockOctokit.rest.issues.get = mockGet;
      mockOctokit.rest.issues.listComments = mockListComments;

      const { Octokit } = await import('@octokit/rest');
      cast<ReturnType<typeof vi.fn>>(Octokit).mockImplementationOnce(
        () => mockOctokit
      );

      const emptyCommentsClient = new GitHubClient();
      const result = await emptyCommentsClient.getIssueWithComments(
        'owner',
        'repo',
        123
      );

      expect(result).toEqual({
        issue: mockIssue,
        comments: [],
      });
    });
  });
});

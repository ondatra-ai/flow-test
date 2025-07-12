import 'reflect-metadata';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import type { MockOctokit } from '../../../src/interfaces/github/index.js';
import { cast } from '../../../src/utils/cast.js';
import { GitHubClient } from '../../../src/utils/github-client.js';

describe('GitHubClient', () => {
  let client: GitHubClient;
  let mockOctokit: MockOctokit;

  beforeEach(async () => {
    vi.clearAllMocks();

    // Create a mock octokit instance
    mockOctokit = cast<MockOctokit>({
      rest: {
        issues: {
          get: vi.fn(),
          listComments: vi.fn(),
        },
      },
    });

    // Mock the Octokit constructor to return our mock instance
    vi.doMock('@octokit/rest', () => ({
      Octokit: vi.fn(() => mockOctokit),
    }));

    // Import and create client after mocking
    const { GitHubClient } = await import('../../../src/utils/github-client.js');
    client = new GitHubClient();
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
      vi.mocked(mockOctokit.rest.issues.get).mockResolvedValue({ data: mockIssue });
      vi.mocked(mockOctokit.rest.issues.listComments).mockResolvedValue({ data: mockComments });

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
        issue: mockIssue,
        comments: mockComments,
      });
    });

    it('should throw error when issue not found', async () => {
      vi.mocked(mockOctokit.rest.issues.get).mockRejectedValue(new Error('Not found'));

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

      vi.mocked(mockOctokit.rest.issues.get).mockResolvedValue({ data: mockIssue });
      vi.mocked(mockOctokit.rest.issues.listComments).mockRejectedValue(new Error('Comments error'));

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

      vi.mocked(mockOctokit.rest.issues.get).mockResolvedValue({ data: mockIssue });
      vi.mocked(mockOctokit.rest.issues.listComments).mockResolvedValue({ data: [] });

      const result = await client.getIssueWithComments('owner', 'repo', 123);

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

      vi.mocked(mockOctokit.rest.issues.get).mockResolvedValue({ data: mockIssue });
      vi.mocked(mockOctokit.rest.issues.listComments).mockResolvedValue({ data: [] });

      const result = await client.getIssueWithComments('owner', 'repo', 123);

      expect(result).toEqual({
        issue: mockIssue,
        comments: [],
      });
    });
  });
});

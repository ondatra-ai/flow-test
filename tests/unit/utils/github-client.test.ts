import 'reflect-metadata';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { GitHubClient } from '../../../src/utils/github-client.js';

// Create a proper mock instance
const mockOctokit = {
  rest: {
    issues: {
      get: vi.fn(),
      listComments: vi.fn(),
    },
  },
};

// Mock Octokit at the module level
vi.mock('@octokit/rest', () => ({
  Octokit: vi.fn(() => mockOctokit),
}));

describe('GitHubClient', () => {
  let client: GitHubClient;

  beforeEach(() => {
    vi.clearAllMocks();
    client = new GitHubClient();
  });

  describe('getIssueWithComments', () => {
    it('should fetch issue and comments successfully', async () => {
      const mockIssue = {
        id: 1,
        number: 123,
        title: 'Test Issue',
        body: 'Test body',
        user: { login: 'testuser' },
        state: 'open',
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-01-01T00:00:00Z',
      };

      const mockComments = [
        {
          id: 1,
          body: 'Test comment',
          user: { login: 'commenter' },
          created_at: '2023-01-01T00:00:00Z',
          updated_at: '2023-01-01T00:00:00Z',
        },
      ];

      // Setup mocks using the module-level mock
      mockOctokit.rest.issues.get.mockResolvedValue({
        data: mockIssue,
      });
      mockOctokit.rest.issues.listComments.mockResolvedValue({
        data: mockComments,
      });

      const result = await client.getIssueWithComments(
        'owner',
        'repo',
        123
      );

      expect(result.issue).toEqual(mockIssue);
      expect(result.comments).toEqual(mockComments);
    });

    it('should handle issue fetch error', async () => {
      mockOctokit.rest.issues.get.mockRejectedValue(
        new Error('Not found')
      );

      await expect(
        client.getIssueWithComments('owner', 'repo', 123)
      ).rejects.toThrow();
    });
  });
});

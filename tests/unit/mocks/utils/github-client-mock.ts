import { vi } from 'vitest';

import { cast } from '../../../../src/utils/cast.js';
import type { GitHubClient } from '../../../../src/utils/github-client.js';
import type {
  IGitHubClientMockOptions,
  IGitHubClientMockResult,
} from '../types.js';

/**
 * Creates a GitHub Client mock with simple property access pattern
 *
 * @example
 * const githubMock = createGitHubClientMock();
 *
 * // For injection
 * const step = new Step('url', githubMock.mock);
 *
 * // For assertions
 * expect(githubMock.getIssueWithComments).toHaveBeenCalledWith(
 *   'owner', 'repo', 123
 * );
 */
export function createGitHubClientMock(
  options?: IGitHubClientMockOptions
): IGitHubClientMockResult {
  const getIssueWithComments = vi.fn();

  // Set up default behaviors
  if (options?.defaultIssueResponse) {
    getIssueWithComments.mockResolvedValue(options.defaultIssueResponse);
  } else {
    // Default successful response
    getIssueWithComments.mockResolvedValue({
      issue: {
        id: 1,
        number: 123,
        title: 'Test Issue',
        body: 'Test issue body',
        state: 'open',
      },
      comments: [
        {
          id: 1,
          body: 'Test comment',
          user: { login: 'testuser' },
        },
      ],
    });
  }

  if (options?.simulateError) {
    getIssueWithComments.mockRejectedValue(new Error('GitHub API error'));
  }

  const mock = cast<GitHubClient>({
    getIssueWithComments,
    // Apply any custom behavior overrides
    ...options?.customBehavior,
  });

  // Return object designed for simple property access
  return {
    mock, // For injection
    getIssueWithComments, // For assertions
  };
}

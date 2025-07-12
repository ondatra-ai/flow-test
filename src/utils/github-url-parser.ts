import type { GitHubIssueArgs } from '../interfaces/github/index.js';

// Re-export for backward compatibility
export type { GitHubIssueArgs } from '../interfaces/github/index.js';

/**
 * Parse a GitHub issue URL and extract owner, repo, and issue number
 * @param url - GitHub issue URL
 * @returns Parsed GitHub issue information
 * @throws Error if URL is invalid
 */
export function parseGitHubIssueUrl(url: string): GitHubIssueArgs {
  const regex = /github\.com\/([^/]+)\/([^/]+)\/issues\/(\d+)/;
  const match = regex.exec(url);
  if (!match) {
    throw new Error('Invalid GitHub issue URL');
  }

  const [, owner, repo, issueNumber] = match;
  return {
    owner,
    repo,
    issue_number: parseInt(issueNumber, 10),
  };
}

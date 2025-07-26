import type { IGitHubIssueArgs } from '../interfaces/github/index.js';

/**
 * Parse a GitHub issue URL and extract owner, repo, and issue number
 * @param url - GitHub issue URL
 * @returns Parsed GitHub issue information
 * @throws Error if URL is invalid
 */
export function parseGitHubIssueUrl(url: string): IGitHubIssueArgs {
  const regex = /github\.com\/([^/]+)\/([^/]+)\/issues\/(\d+)/;
  const match = regex.exec(url);
  if (!match) {
    throw new Error(
      `Invalid GitHub issue URL: "${url}". ` +
        `Expected format: https://github.com/{owner}/{repo}/issues/{number}`
    );
  }

  const [, owner, repo, issueNumber] = match;
  return {
    owner,
    repo,
    issue_number: parseInt(issueNumber, 10),
  };
}

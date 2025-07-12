/**
 * Interface for parsed GitHub issue information
 */
export interface GitHubIssueArgs {
  owner: string;
  repo: string;
  issueNumber: number;
}

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
    issueNumber: parseInt(issueNumber, 10),
  };
}

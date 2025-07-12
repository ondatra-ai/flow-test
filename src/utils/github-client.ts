import { Octokit } from '@octokit/rest';

/**
 * GitHub client for fetching issue and comment data
 */
export class GitHubClient {
  private octokit: Octokit;

  constructor(token?: string) {
    const authToken = token || process.env.GITHUB_TOKEN || process.env.GH_TOKEN;

    this.octokit = new Octokit({
      auth: authToken || undefined,
    });
  }

  /**
   * Get issue data with comments
   * @param owner - Repository owner
   * @param repo - Repository name
   * @param issueNumber - Issue number
   * @returns Issue and comments data
   */
  async getIssueWithComments(
    owner: string,
    repo: string,
    issueNumber: number
  ): Promise<{ issue: unknown; comments: unknown[] }> {
    try {
      const [issue, comments] = await Promise.all([
        this.octokit.rest.issues.get({
          owner,
          repo,
          issue_number: issueNumber,
        }),
        this.octokit.rest.issues.listComments({
          owner,
          repo,
          issue_number: issueNumber,
        }),
      ]);

      return { issue: issue.data, comments: comments.data };
    } catch (error) {
      return await this.handleGitHubApiError(error, owner, repo, issueNumber);
    }
  }

  /**
   * Handle GitHub API errors with fallback strategies
   */
  private async handleGitHubApiError(
    error: unknown,
    owner: string,
    repo: string,
    issueNumber: number
  ): Promise<{ issue: unknown; comments: unknown[] }> {
    // Handle specific GitHub API errors
    if (error && typeof error === 'object' && 'status' in error) {
      const statusError = error as { status: number };
      if (statusError.status === 401) {
        // For public repos, retry without authentication
        try {
          const publicOctokit = new Octokit(); // No auth for public repos
          const [issue, comments] = await Promise.all([
            publicOctokit.rest.issues.get({
              owner,
              repo,
              issue_number: issueNumber,
            }),
            publicOctokit.rest.issues.listComments({
              owner,
              repo,
              issue_number: issueNumber,
            }),
          ]);
          return { issue: issue.data, comments: comments.data };
        } catch (_retryError) {
          throw new Error(
            'GitHub authentication failed and repository is not public. Please check your github_token configuration.'
          );
        }
      }
      if (statusError.status === 404) {
        throw new Error(
          `GitHub issue #${issueNumber} not found in ${owner}/${repo}`
        );
      }
    }
    throw error;
  }
}

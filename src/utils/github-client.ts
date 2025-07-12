import { Octokit } from '@octokit/rest';
import { injectable } from 'tsyringe';

/**
 * GitHub issue data structure
 * Represents the essential fields from a GitHub issue
 */
export type GitHubIssue = {
  /** Issue title */
  title: string;
  /** Issue body content */
  body: string;
  /** Issue state (open, closed, etc.) */
  state: string;
  /** ISO timestamp when issue was created */
  created_at: string;
  /** ISO timestamp when issue was last updated */
  updated_at: string;
  /** Issue author information */
  user: {
    /** GitHub username of the issue author */
    login: string;
  };
  /** Total number of comments on the issue */
  comments: number;
};

/**
 * GitHub comment data structure
 * Represents a single comment on a GitHub issue
 */
export type GitHubComment = {
  /** Comment body content */
  body: string;
  /** Comment author information */
  user: {
    /** GitHub username of the comment author */
    login: string;
  };
  /** ISO timestamp when comment was created */
  created_at: string;
};

/**
 * GitHub API client for fetching issue and comment data
 *
 * Provides authenticated access to GitHub's REST API with automatic
 * fallback to public access for public repositories when authentication
 * fails.
 *
 * @example
 * ```typescript
 * const client = new GitHubClient();
 * const { issue, comments } = await client.getIssueWithComments(
 *   'owner', 'repo', 123
 * );
 * ```
 */
@injectable()
export class GitHubClient {
  /** Octokit instance for GitHub API communication */
  private readonly octokit: Octokit;

  /**
   * Initialize GitHub client with authentication
   *
   * Uses GITHUB_TOKEN environment variable for authentication.
   * If no token is provided, creates unauthenticated client suitable for
   * public repositories.
   */
  constructor() {
    const authToken = process.env.GITHUB_TOKEN;

    this.octokit = new Octokit({
      auth: authToken || undefined,
    });
  }

  /**
   * Fetch GitHub issue with all comments
   *
   * Retrieves issue data and all associated comments in a single operation.
   * Automatically handles authentication errors by falling back to public
   * access for public repositories.
   *
   * @param owner - Repository owner (username or organization)
   * @param repo - Repository name
   * @param issueNumber - Issue number (not ID)
   * @returns Promise resolving to issue data and comments array
   *
   * @throws {Error} When issue is not found (404)
   * @throws {Error} When authentication fails and repository is not public
   * @throws {Error} For other GitHub API errors
   *
   * @example
   * ```typescript
   * const { issue, comments } = await client.getIssueWithComments(
   *   'microsoft', 'vscode', 123
   * );
   * console.log(`Issue: ${issue.title}`);
   * console.log(`Comments: ${comments.length}`);
   * ```
   */
  async getIssueWithComments(
    owner: string,
    repo: string,
    issueNumber: number
  ): Promise<{ issue: GitHubIssue; comments: GitHubComment[] }> {
    try {
      return await this.fetchIssueAndComments(
        this.octokit,
        owner,
        repo,
        issueNumber
      );
    } catch (error) {
      return await this.handleGitHubApiError(error, owner, repo, issueNumber);
    }
  }

  /**
   * Fetch issue and comments using the provided Octokit instance
   *
   * Internal method that performs the actual API calls to GitHub.
   * Executes both issue and comments requests in parallel for efficiency.
   *
   * @param octokit - Octokit instance to use for API calls
   * @param owner - Repository owner
   * @param repo - Repository name
   * @param issueNumber - Issue number
   * @returns Promise resolving to issue and comments data
   *
   * @private
   */
  private async fetchIssueAndComments(
    octokit: Octokit,
    owner: string,
    repo: string,
    issueNumber: number
  ): Promise<{ issue: GitHubIssue; comments: GitHubComment[] }> {
    // Execute both API calls in parallel for better performance
    const [issue, comments] = await Promise.all([
      octokit.rest.issues.get({
        owner,
        repo,
        issue_number: issueNumber,
      }),
      octokit.rest.issues.listComments({
        owner,
        repo,
        issue_number: issueNumber,
      }),
    ]);

    return {
      issue: issue.data as GitHubIssue,
      comments: comments.data as GitHubComment[],
    };
  }

  /**
   * Handle GitHub API errors with fallback strategies
   *
   * Implements automatic fallback to public access when authentication fails
   * for public repositories. Provides specific error messages for common
   * scenarios.
   *
   * @param error - The error thrown by the GitHub API
   * @param owner - Repository owner (for error context)
   * @param repo - Repository name (for error context)
   * @param issueNumber - Issue number (for error context)
   * @returns Promise resolving to issue and comments data (if fallback
   * succeeds)
   *
   * @throws {Error} When issue is not found (404)
   * @throws {Error} When authentication fails and repository is not public
   * @throws {Error} For other unhandled GitHub API errors
   *
   * @private
   */
  private async handleGitHubApiError(
    error: unknown,
    owner: string,
    repo: string,
    issueNumber: number
  ): Promise<{ issue: GitHubIssue; comments: GitHubComment[] }> {
    // Handle specific GitHub API errors
    if (error && typeof error === 'object' && 'status' in error) {
      const statusError = error as { status: number };

      // Authentication error - try public access fallback
      if (statusError.status === 401) {
        try {
          // Create unauthenticated client for public repositories
          const publicOctokit = new Octokit(); // No auth for public repos
          return await this.fetchIssueAndComments(
            publicOctokit,
            owner,
            repo,
            issueNumber
          );
        } catch (_retryError) {
          throw new Error(
            'GitHub authentication failed and repository is not public. ' +
              'Please check your github_token configuration.'
          );
        }
      }

      // Issue not found
      if (statusError.status === 404) {
        throw new Error(
          `GitHub issue #${issueNumber} not found in ${owner}/${repo}`
        );
      }
    }

    // Re-throw unhandled errors
    throw error;
  }
}

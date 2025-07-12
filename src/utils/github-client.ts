import { Octokit } from '@octokit/rest';
import { injectable } from 'tsyringe';

export type GitHubIssue = {
  title: string;
  body: string;
  state: string;
  created_at: string;
  updated_at: string;
  user: {
    login: string;
  };
  comments: number;
};

export type GitHubComment = {
  body: string;
  user: {
    login: string;
  };
  created_at: string;
};

/**
 * GitHub API client for fetching issue and comment data
 */
@injectable()
export class GitHubClient {
  private readonly octokit: Octokit;

  constructor() {
    const authToken = process.env.GITHUB_TOKEN;

    this.octokit = new Octokit({
      auth: authToken || undefined,
    });
  }

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

  private async fetchIssueAndComments(
    octokit: Octokit,
    owner: string,
    repo: string,
    issueNumber: number
  ): Promise<{ issue: GitHubIssue; comments: GitHubComment[] }> {
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

  private async handleGitHubApiError(
    error: unknown,
    owner: string,
    repo: string,
    issueNumber: number
  ): Promise<{ issue: GitHubIssue; comments: GitHubComment[] }> {
    if (error && typeof error === 'object' && 'status' in error) {
      const statusError = error as { status: number };

      if (statusError.status === 401) {
        try {
          const publicOctokit = new Octokit();
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

      if (statusError.status === 404) {
        throw new Error(
          `GitHub issue #${issueNumber} not found in ${owner}/${repo}`
        );
      }
    }

    throw error;
  }
}

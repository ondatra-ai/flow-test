import { GitHubClient } from '../../utils/github-client.js';
import { parseGitHubIssueUrl } from '../../utils/github-url-parser.js';
import { Logger } from '../../utils/logger.js';
import { type ReadGitHubIssueStepConfig } from '../../validation/index.js';
import { IContext } from '../context.js';
import { Step, IStep } from '../step.js';

interface GitHubIssueData {
  title: string;
  body?: string;
  state: string;
  created_at: string;
  updated_at: string;
  user?: {
    login: string;
  };
}

/**
 * ReadGitHubIssueStep for reading GitHub issue data
 */
export class ReadGitHubIssueStep extends Step implements IStep {
  private readonly config: ReadGitHubIssueStepConfig;
  public readonly githubToken: string;

  constructor(logger: Logger, config: ReadGitHubIssueStepConfig) {
    super(
      config.id,
      `ReadGitHubIssueStep: Reading GitHub issue`,
      config.nextStepId,
      logger
    );
    this.config = config;
    this.githubToken = config.github_token || process.env.GITHUB_TOKEN || '';
  }

  /**
   * Execute the GitHub issue reader step
   */
  public async execute(context: IContext): Promise<string | null> {
    this.logger.info(`Executing ReadGitHubIssueStep: ${this.config.issueUrl}`);

    try {
      // Use URL from context if available, otherwise use configured URL
      const issueUrl = context.get('github.issue.url') || this.config.issueUrl;

      // Parse the GitHub issue URL
      const { owner, repo, issueNumber } = parseGitHubIssueUrl(issueUrl);

      this.logger.info(
        `ReadGitHubIssueStep: Reading issue #${issueNumber} from ` +
          `${owner}/${repo}`
      );

      // Fetch issue data
      const { issue, comments } = await this.fetchGitHubData(
        owner,
        repo,
        issueNumber
      );

      // Populate context with fetched data
      this.populateContext(context, issue, comments, issueUrl, issueNumber);

      this.logger.info(
        `Successfully loaded GitHub issue #${issueNumber} from ${owner}/${repo}`
      );

      this.logger.debug(`ReadGitHubIssueStep completed successfully`, {
        issueUrl: this.config.issueUrl,
        issueNumber,
        owner,
        repo,
        commentsCount: comments.length,
      });

      // Use parent's routing logic
      return super.execute(context);
    } catch (error) {
      this.logger.error(`ReadGitHubIssueStep failed`, {
        issueUrl: this.config.issueUrl,
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  /**
   * Fetch issue and comments from GitHub
   */
  private async fetchGitHubData(
    owner: string,
    repo: string,
    issueNumber: number
  ): Promise<{ issue: GitHubIssueData; comments: unknown[] }> {
    const client = new GitHubClient(this.githubToken);
    const { issue, comments } = await client.getIssueWithComments(
      owner,
      repo,
      issueNumber
    );
    return { issue: issue as GitHubIssueData, comments };
  }

  /**
   * Populate context with GitHub issue data
   */
  private populateContext(
    context: IContext,
    issue: GitHubIssueData,
    comments: unknown[],
    issueUrl: string,
    issueNumber: number
  ): void {
    // Set basic issue information
    context.set('github.issue.number', issueNumber.toString());
    context.set('github.issue.title', issue.title);
    context.set('github.issue.author', issue.user?.login || 'unknown');
    context.set('github.issue.comments_count', comments.length.toString());
    context.set('github.issue.url', issueUrl);

    // Set additional issue details
    context.set('github.issue.body', issue.body || '');
    context.set('github.issue.state', issue.state);
    context.set('github.issue.created_at', issue.created_at);
    context.set('github.issue.updated_at', issue.updated_at);

    // Store comments if configured
    if (this.config.includeComments) {
      context.set('github.issue.comments', JSON.stringify(comments));
    }
  }

  /**
   * Get the step configuration
   */
  public getConfig(): ReadGitHubIssueStepConfig {
    return this.config;
  }
}

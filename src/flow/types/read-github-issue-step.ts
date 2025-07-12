import { inject, injectable } from 'tsyringe';

import { SERVICES } from '../../config/tokens.js';
import {
  GitHubClient,
  type GitHubIssue,
  type GitHubComment,
} from '../../utils/github-client.js';
import { parseGitHubIssueUrl } from '../../utils/github-url-parser.js';
import { Logger } from '../../utils/logger.js';
import { type ReadGitHubIssueStepConfig } from '../../validation/index.js';
import { IContext } from '../context.js';
import { Step, IStep } from '../step.js';

/**
 * Flow step for reading GitHub issue data and comments
 */
@injectable()
export class ReadGitHubIssueStep extends Step implements IStep {
  private readonly config: ReadGitHubIssueStepConfig;
  public readonly githubToken: string;

  constructor(
    @inject(SERVICES.Logger) logger: Logger,
    @inject(SERVICES.GitHubClient)
    private readonly githubClient: GitHubClient,
    config: ReadGitHubIssueStepConfig
  ) {
    super(
      config.id,
      `ReadGitHubIssueStep: Reading GitHub issue`,
      config.nextStepId,
      logger
    );
    this.config = config;
    this.githubToken =
      config.github_token ||
      (process.env.GITHUB_TOKEN !== 'undefined'
        ? process.env.GITHUB_TOKEN
        : '') ||
      '';
  }

  public async execute(context: IContext): Promise<string | null> {
    this.logger.info(`Executing ReadGitHubIssueStep: ${this.config.issueUrl}`);

    try {
      const issueUrl = context.get('github.issue.url') || this.config.issueUrl;
      const { owner, repo, issueNumber } = parseGitHubIssueUrl(issueUrl);

      this.logger.info(
        `ReadGitHubIssueStep: Reading issue #${issueNumber} from ` +
          `${owner}/${repo}`
      );

      const { issue, comments } = await this.githubClient.getIssueWithComments(
        owner,
        repo,
        issueNumber
      );

      this.populateContext(context, issue, comments, issueUrl, issueNumber);

      this.logger.info(
        `Successfully loaded GitHub issue #${issueNumber} from ${owner}/${repo}`
      );

      return super.execute(context);
    } catch (error) {
      this.logger.error(`ReadGitHubIssueStep failed`, {
        issueUrl: this.config.issueUrl,
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  private populateContext(
    context: IContext,
    issue: GitHubIssue,
    comments: GitHubComment[],
    issueUrl: string,
    issueNumber: number
  ): void {
    context.set('github.issue.number', issueNumber.toString());
    context.set('github.issue.title', issue.title);
    context.set('github.issue.author', issue.user.login);
    context.set('github.issue.comments_count', comments.length.toString());
    context.set('github.issue.url', issueUrl);
    context.set('github.issue.body', issue.body);
    context.set('github.issue.state', issue.state);
    context.set('github.issue.created_at', issue.created_at);
    context.set('github.issue.updated_at', issue.updated_at);

    if (this.config.includeComments) {
      context.set('github.issue.comments', JSON.stringify(comments));
    }
  }

  public getConfig(): ReadGitHubIssueStepConfig {
    return this.config;
  }
}

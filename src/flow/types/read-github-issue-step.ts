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
 *
 * This step fetches issue information from GitHub's REST API and populates
 * the flow context with issue details including title, body, author, state,
 * timestamps, and optionally comments.
 *
 * The step supports both authenticated and unauthenticated access, with
 * automatic fallback to public access for public repositories.
 *
 * @example
 * ```typescript
 * // Flow configuration
 * {
 *   "type": "read-github-issue",
 *   "id": "fetch-issue",
 *   "issueUrl": "https://github.com/owner/repo/issues/123",
 *   "includeComments": true,
 *   "nextStepId": "process-issue"
 * }
 * ```
 */
@injectable()
export class ReadGitHubIssueStep extends Step implements IStep {
  /** Step configuration containing issue URL and options */
  private readonly config: ReadGitHubIssueStepConfig;

  /**
   * GitHub authentication token for API access
   * @deprecated This property exists for backward compatibility but is not
   * used.
   * Authentication is handled by the injected GitHubClient.
   */
  public readonly githubToken: string;

  /**
   * Initialize the GitHub issue reader step
   *
   * @param logger - Logger instance for step execution logging
   * @param githubClient - GitHub API client for fetching issue data
   * @param config - Step configuration including issue URL and options
   */
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
    // Keep for backward compatibility - actual authentication handled by
    // GitHubClient
    this.githubToken =
      config.github_token ||
      (process.env.GITHUB_TOKEN !== 'undefined'
        ? process.env.GITHUB_TOKEN
        : '') ||
      '';
  }

  /**
   * Execute the GitHub issue reader step
   *
   * Performs the following operations:
   * 1. Retrieves issue URL from context or configuration
   * 2. Parses the GitHub URL to extract owner, repo, and issue number
   * 3. Fetches issue data and comments from GitHub API
   * 4. Populates flow context with issue information
   * 5. Returns next step ID for flow continuation
   *
   * @param context - Flow execution context for storing issue data
   * @returns Promise resolving to next step ID, or null if no next step
   *
   * @throws {Error} When GitHub URL is invalid or cannot be parsed
   * @throws {Error} When GitHub API request fails (network, auth, not found,
   * etc.)
   * @throws {Error} When issue data cannot be processed
   *
   * @example
   * ```typescript
   * const step = new ReadGitHubIssueStep(logger, githubClient, config);
   * const nextStepId = await step.execute(context);
   *
   * // Context now contains:
   * // - github.issue.title
   * // - github.issue.body
   * // - github.issue.author
   * // - github.issue.state
   * // - github.issue.comments (if includeComments: true)
   * ```
   */
  public async execute(context: IContext): Promise<string | null> {
    this.logger.info(`Executing ReadGitHubIssueStep: ${this.config.issueUrl}`);

    try {
      // Use URL from context if available, otherwise use configured URL
      // This allows dynamic issue URL resolution from previous steps
      const issueUrl = context.get('github.issue.url') || this.config.issueUrl;

      // Parse the GitHub issue URL to extract repository information
      const { owner, repo, issueNumber } = parseGitHubIssueUrl(issueUrl);

      this.logger.info(
        `ReadGitHubIssueStep: Reading issue #${issueNumber} from ` +
          `${owner}/${repo}`
      );

      // Fetch issue data and comments from GitHub API
      const { issue, comments } = await this.githubClient.getIssueWithComments(
        owner,
        repo,
        issueNumber
      );

      // Populate context with fetched data for use by subsequent steps
      this.populateContext(context, issue, comments, issueUrl, issueNumber);

      this.logger.info(
        `Successfully loaded GitHub issue #${issueNumber} from ${owner}/${repo}`
      );

      // Log detailed execution information for debugging
      this.logger.debug(`ReadGitHubIssueStep completed successfully`, {
        issueUrl: this.config.issueUrl,
        issueNumber,
        owner,
        repo,
        commentsCount: comments.length,
      });

      // Use parent's routing logic to determine next step
      return super.execute(context);
    } catch (error) {
      // Log error with context for debugging
      this.logger.error(`ReadGitHubIssueStep failed`, {
        issueUrl: this.config.issueUrl,
        error: error instanceof Error ? error.message : String(error),
      });
      // Re-throw to allow flow-level error handling
      throw error;
    }
  }

  /**
   * Populate flow context with GitHub issue data
   *
   * Sets context variables that can be used by subsequent flow steps.
   * All data is stored as strings to ensure consistent context handling.
   *
   * Context variables populated:
   * - `github.issue.number` - Issue number as string
   * - `github.issue.title` - Issue title
   * - `github.issue.author` - Issue author's GitHub username
   * - `github.issue.comments_count` - Number of comments as string
   * - `github.issue.url` - Full GitHub issue URL
   * - `github.issue.body` - Issue body content
   * - `github.issue.state` - Issue state (open, closed, etc.)
   * - `github.issue.created_at` - ISO timestamp of issue creation
   * - `github.issue.updated_at` - ISO timestamp of last update
   * - `github.issue.comments` - JSON string of comments array
   *   (if includeComments: true)
   *
   * @param context - Flow execution context to populate
   * @param issue - GitHub issue data
   * @param comments - Array of GitHub comments
   * @param issueUrl - Original issue URL
   * @param issueNumber - Parsed issue number
   *
   * @private
   */
  private populateContext(
    context: IContext,
    issue: GitHubIssue,
    comments: GitHubComment[],
    issueUrl: string,
    issueNumber: number
  ): void {
    // Set basic issue information - core data needed by most flows
    context.set('github.issue.number', issueNumber.toString());
    context.set('github.issue.title', issue.title);
    context.set('github.issue.author', issue.user.login);
    context.set('github.issue.comments_count', comments.length.toString());
    context.set('github.issue.url', issueUrl);

    // Set additional issue details - extended metadata
    context.set('github.issue.body', issue.body);
    context.set('github.issue.state', issue.state);
    context.set('github.issue.created_at', issue.created_at);
    context.set('github.issue.updated_at', issue.updated_at);

    // Store comments if configured - can be large data, so optional
    if (this.config.includeComments) {
      context.set('github.issue.comments', JSON.stringify(comments));
    }
  }

  /**
   * Get the step configuration
   *
   * Provides access to the step's configuration for debugging,
   * validation, or dynamic behavior modification.
   *
   * @returns The step's configuration object
   *
   * @example
   * ```typescript
   * const config = step.getConfig();
   * console.log(`Issue URL: ${config.issueUrl}`);
   * console.log(`Include comments: ${config.includeComments}`);
   * ```
   */
  public getConfig(): ReadGitHubIssueStepConfig {
    return this.config;
  }
}

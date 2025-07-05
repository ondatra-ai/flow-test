#!/usr/bin/env node

import { IncomingMessage } from 'http';
import * as https from 'https';

// Types for GitHub API responses
interface GitHubPullRequest {
  number: number;
  title: string;
  html_url: string;
  merged_at: string | null;
  state: 'open' | 'closed';
}

// Types for Slack webhook payload
interface SlackPayload {
  text: string;
  username?: string;
  icon_emoji?: string;
  channel?: string;
}

// Types for message styling
interface MessageStyle {
  emoji: string;
  message: string;
}

// Environment variable access using process.env
function getEnv(key: string): string | undefined {
  return process.env[key];
}

// Configuration - replace these values with your own
const GITHUB_TOKEN: string | undefined = getEnv('GITHUB_TOKEN');
const OWNER: string | undefined = getEnv('GITHUB_OWNER');
const REPO: string | undefined = getEnv('GITHUB_REPO');
const SLACK_WEBHOOK_URL: string | undefined = getEnv('SLACK_WEBHOOK_URL');
const SLACK_CHANNEL: string | undefined = getEnv('SLACK_CHANNEL');
const BOT_NAME: string | undefined = getEnv('BOT_NAME');

// Validate required environment variables
if (!OWNER || !REPO) {
  process.stderr.write(
    'GITHUB_OWNER and GITHUB_REPO environment variables are required\n'
  );
  process.exit(1);
}

// Calculate timestamp for 24 hours ago
const now: Date = new Date();
const twentyFourHoursAgo: Date = new Date(now.getTime() - 24 * 60 * 60 * 1000);
const timestamp: string = twentyFourHoursAgo.toISOString();

// Build the GitHub API request options
const githubPath =
  `/repos/${OWNER}/${REPO}/pulls?state=closed&sort=updated` +
  '&direction=desc&per_page=100';

const options: https.RequestOptions = {
  hostname: 'api.github.com',
  path: githubPath,
  method: 'GET',
  headers: {
    'User-Agent': 'PR-Counter-Script',
    Accept: 'application/vnd.github.v3+json',
  },
};

// Add Authorization header only if GITHUB_TOKEN is provided
if (GITHUB_TOKEN) {
  options.headers = {
    ...options.headers,
    Authorization: `token ${GITHUB_TOKEN}`,
  };
}

// Function to get emoji and message based on PR count
function getMessageStyle(count: number): MessageStyle {
  if (count < 4) {
    const message =
      `Only ${count} PRs merged in the last 24 hours. ` +
      "We need to pick up the pace! Let's aim for more productivity tomorrow.";
    return {
      emoji: ':disappointed:',
      message,
    };
  }
  const message =
    `Great job team! ${count} PRs merged in the last 24 hours. ` +
    'Keep up the excellent work! :clap:';
  return {
    emoji: ':rocket:',
    message,
  };
}

// Handle Slack response
function handleSlackResponse(res: IncomingMessage): void {
  if (res.statusCode === 200) {
    process.stdout.write('Successfully posted to Slack!\n');
  } else {
    const statusMsg =
      `Failed to post to Slack. Status code: ` +
      `${res.statusCode ?? 'unknown'}\n`;
    process.stderr.write(statusMsg);
    let data = '';
    res.on('data', (chunk: Buffer) => {
      data += chunk.toString();
    });
    res.on('end', () => {
      process.stderr.write(`${data}\n`);
    });
  }
}

// Create Slack request options
function createSlackOptions(
  webhookUrl: URL,
  postData: string
): https.RequestOptions {
  return {
    hostname: webhookUrl.hostname,
    path: webhookUrl.pathname,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData).toString(),
    },
  };
}

// Function to post results to Slack
function postToSlack(message: string): void {
  if (!SLACK_WEBHOOK_URL) {
    process.stdout.write(
      'Slack webhook URL not provided. Skipping Slack notification.\n'
    );
    return;
  }

  // Parse the webhook URL
  const webhookUrl: URL = new URL(SLACK_WEBHOOK_URL);

  // Create Slack payload
  const payload: SlackPayload = {
    text: message,
    username: BOT_NAME,
    icon_emoji: ':bar_chart:',
  };

  // Add channel override if specified
  if (SLACK_CHANNEL) {
    payload.channel = SLACK_CHANNEL;
    process.stdout.write(`Posting to Slack channel: ${SLACK_CHANNEL}\n`);
  }

  const postData: string = JSON.stringify(payload);
  const slackOptions = createSlackOptions(webhookUrl, postData);
  const slackReq = https.request(slackOptions, handleSlackResponse);

  slackReq.on('error', (err: Error) => {
    process.stderr.write(`Error posting to Slack: ${err.message}\n`);
  });

  slackReq.write(postData);
  slackReq.end();
}

// Process PR list and format output
function processPRList(recentlyMergedPRs: GitHubPullRequest[]): string {
  let additionalMessage = '';

  if (recentlyMergedPRs.length > 0) {
    process.stdout.write('\nList of recently merged PRs:\n');
    additionalMessage += '\n*Recently merged PRs:*\n';

    recentlyMergedPRs.forEach((pr: GitHubPullRequest) => {
      const mergedAt = pr.merged_at ? new Date(pr.merged_at) : new Date();
      const prLine =
        `- <${pr.html_url}|#${pr.number}>: ${pr.title} ` +
        `(merged at ${mergedAt.toLocaleString()})`;
      const consoleLine =
        `- #${pr.number}: ${pr.title} ` +
        `(merged at ${mergedAt.toLocaleString()})\n`;
      process.stdout.write(consoleLine);
      additionalMessage += `${prLine}\n`;
    });
  }

  if (recentlyMergedPRs.length === 0) {
    additionalMessage +=
      '\n:warning: *No PRs were merged in the last 24 hours* :warning:';
  }

  return additionalMessage;
}

// Handle GitHub API response
function handleGitHubResponse(res: IncomingMessage): void {
  let data = '';

  res.on('data', (chunk: Buffer) => {
    data += chunk.toString();
  });

  res.on('end', () => {
    if (res.statusCode !== 200) {
      const statusCode = res.statusCode ?? 'unknown';
      const errorMsg = `Error: Received status code ${statusCode}\n`;
      process.stderr.write(errorMsg);
      process.stderr.write(`${data}\n`);
      process.exit(1);
    }

    try {
      const pulls: GitHubPullRequest[] = JSON.parse(
        data
      ) as GitHubPullRequest[];

      // Filter PRs merged in the last 24 hours
      const recentlyMergedPRs: GitHubPullRequest[] = pulls.filter(
        (pr: GitHubPullRequest) => {
          return pr.merged_at && pr.merged_at >= timestamp;
        }
      );

      const count: number = recentlyMergedPRs.length;
      const countMsg = `Number of PRs merged in the last 24 hours: ${count}\n`;
      process.stdout.write(countMsg);

      // Get message style based on PR count
      const style: MessageStyle = getMessageStyle(count);

      // Build message for console and Slack
      const repoInfo = `${OWNER ?? 'unknown'}/${REPO ?? 'unknown'}`;
      const summaryHeader =
        `${style.emoji} *PR Summary for ${repoInfo}* ` + `${style.emoji}\n`;
      let message = summaryHeader + `${style.message}\n`;

      // Process PR list
      const additionalContent = processPRList(recentlyMergedPRs);
      message += additionalContent;

      // Post to Slack if webhook URL is provided
      postToSlack(message);
    } catch (error: unknown) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      process.stderr.write(`Error parsing response: ${errorMsg}\n`);
      process.exit(1);
    }
  });
}

// Make the GitHub API request
const req = https.request(options, handleGitHubResponse);

req.on('error', (err: Error) => {
  process.stderr.write(`Error making request: ${err.message}\n`);
  process.exit(1);
});

req.end();

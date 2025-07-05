#!/usr/bin/env ts-node

import { execSync } from 'child_process';

interface GitHubThread {
  id: string;
  isResolved: boolean;
}

interface GitHubError {
  message: string;
}

interface GitHubResponse {
  data?: {
    resolveReviewThread?: {
      thread: GitHubThread;
    };
    addPullRequestReviewThreadReply?: {
      comment: {
        id: string;
      };
    };
  };
  errors?: GitHubError[];
}

/**
 * Adds a comment to a specific review thread
 * @param threadId - The thread ID to add comment to
 * @param comment - The comment text to add
 */
function addCommentToThread(threadId: string, comment: string): void {
  try {
    // eslint-disable-next-line no-console
    console.log(`Adding comment to thread: ${threadId}`);

    const query = `mutation {
      addPullRequestReviewThreadReply(input: {
        pullRequestReviewThreadId: "${threadId}",
        body: "${comment.replace(/"/g, '\\"').replace(/\n/g, '\\n')}"
      }) {
        comment {
          id
        }
      }
    }`;

    const result = execSync(`gh api graphql -f query='${query}'`, {
      encoding: 'utf8',
      stdio: 'pipe',
    });

    const response = JSON.parse(result) as GitHubResponse;

    if (response.data?.addPullRequestReviewThreadReply?.comment) {
      // eslint-disable-next-line no-console
      console.log(`✅ Successfully added comment to thread`);
    } else if (response.errors) {
      // eslint-disable-next-line no-console
      console.error('❌ GitHub API errors:');
      response.errors.forEach((error: GitHubError) => {
        // eslint-disable-next-line no-console
        console.error(`  - ${error.message}`);
      });
      throw new Error('Failed to add comment to thread');
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('❌ Failed to add comment to thread:', error);
    throw error;
  }
}

/**
 * Resolves a GitHub review thread (conversation) using the provided thread ID
 * @param conversationId - The GitHub review thread ID to resolve
 * @param comment - Optional comment to add before resolving
 */
function resolveConversation(conversationId: string, comment?: string): void {
  if (!conversationId) {
    // eslint-disable-next-line no-console
    console.error('Error: conversationId is required');
    // eslint-disable-next-line no-console
    console.log(
      'Usage: npm run resolve-conversation <conversationId> [comment]'
    );
    // eslint-disable-next-line no-console
    console.log('');
    // eslint-disable-next-line no-console
    console.log(
      'If a comment is provided, it will be added to the conversation thread before resolving.'
    );
    process.exit(1);
  }

  try {
    // Add comment to thread if provided
    if (comment) {
      addCommentToThread(conversationId, comment);
    }

    // Resolve the thread
    const query = `mutation { 
      resolveReviewThread(input: {threadId: "${conversationId}"}) { 
        thread { id isResolved } 
      } 
    }`;

    // eslint-disable-next-line no-console
    console.log(`Resolving conversation: ${conversationId}`);

    const result = execSync(`gh api graphql -f query='${query}'`, {
      encoding: 'utf8',
      stdio: 'pipe',
    });

    const response = JSON.parse(result) as GitHubResponse;

    if (response.data?.resolveReviewThread?.thread) {
      const thread = response.data.resolveReviewThread.thread;
      // eslint-disable-next-line no-console
      console.log(`✅ Successfully resolved conversation ${thread.id}`);
      // eslint-disable-next-line no-console
      console.log(`Status: ${thread.isResolved ? 'Resolved' : 'Not resolved'}`);
    } else if (response.errors) {
      // eslint-disable-next-line no-console
      console.error('❌ GitHub API errors:');
      response.errors.forEach((error: GitHubError) => {
        // eslint-disable-next-line no-console
        console.error(`  - ${error.message}`);
      });
      process.exit(1);
    } else {
      // eslint-disable-next-line no-console
      console.error('❌ Unexpected response format');
      process.exit(1);
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('❌ Failed to resolve conversation:', error);
    process.exit(1);
  }
}

// Get conversationId and optional comment from command line arguments
const conversationId = process.argv[2];
const comment = process.argv[3];

// Call the function and handle it properly
try {
  resolveConversation(conversationId, comment);
} catch (error) {
  // eslint-disable-next-line no-console
  console.error('Failed to resolve conversation:', error);
  process.exit(1);
}

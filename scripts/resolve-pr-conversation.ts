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
  };
  errors?: GitHubError[];
}

/**
 * Resolves a GitHub review thread (conversation) using the provided thread ID
 * @param conversationId - The GitHub review thread ID to resolve
 */
function resolveConversation(conversationId: string): void {
  if (!conversationId) {
    // eslint-disable-next-line no-console
    console.error('Error: conversationId is required');
    // eslint-disable-next-line no-console
    console.log('Usage: npm run resolve-conversation <conversationId>');
    process.exit(1);
  }

  const query = `mutation { 
    resolveReviewThread(input: {threadId: "${conversationId}"}) { 
      thread { id isResolved } 
    } 
  }`;

  try {
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

// Get conversationId from command line arguments
const conversationId = process.argv[2];

// Call the function and handle it properly
try {
  resolveConversation(conversationId);
} catch (error) {
  // eslint-disable-next-line no-console
  console.error('Failed to resolve conversation:', error);
  process.exit(1);
}

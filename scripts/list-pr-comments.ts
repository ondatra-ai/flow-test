#!/usr/bin/env node
/* eslint-disable no-console */

import { execSync } from 'child_process';

interface Comment {
  file: string | null;
  line: number | null;
  author: string;
  body: string;
  createdAt: string;
  outdated: boolean;
  resolved: boolean;
  diffHunk: string;
  url: string;
}

interface CommentNode {
  path: string | null;
  line: number | null;
  body: string;
  createdAt: string;
  outdated: boolean;
  diffHunk: string;
  url: string;
  author: {
    login: string;
  };
}

interface ThreadNode {
  isResolved: boolean;
  comments: {
    nodes: CommentNode[];
  };
}

interface GraphQLResponse {
  data: {
    repository: {
      pullRequest: {
        reviewThreads: {
          nodes: ThreadNode[];
        };
      };
    };
  };
}

function getPRNumber(): string {
  const args = process.argv.slice(2);
  if (args.length === 0) {
    console.error('Usage: list-pr-comments.ts [PR_NUMBER]');
    process.exit(1);
  }
  return args[0];
}

function buildGraphQLQuery(): string {
  return `
    query($prNumber: Int!) {
      repository(owner: "ondatra-ai", name: "flow-test") {
        pullRequest(number: $prNumber) {
          reviewThreads(first: 100) {
            nodes {
              isResolved
              comments(first: 10) {
                nodes {
                  path
                  line
                  body
                  createdAt
                  outdated
                  diffHunk
                  url
                  author {
                    login
                  }
                }
              }
            }
          }
        }
      }
    }
  `;
}

function parseComments(data: GraphQLResponse): Comment[] {
  const comments: Comment[] = [];

  data.data.repository.pullRequest.reviewThreads.nodes.forEach(
    (thread: ThreadNode) => {
      thread.comments.nodes.forEach((comment: CommentNode) => {
        comments.push({
          file: comment.path,
          line: comment.line,
          author: comment.author.login,
          body: comment.body,
          createdAt: comment.createdAt,
          outdated: comment.outdated,
          resolved: thread.isResolved,
          diffHunk: comment.diffHunk,
          url: comment.url,
        });
      });
    }
  );

  return comments;
}

function getPRComments(prNumber: string): void {
  const query = buildGraphQLQuery();

  try {
    const result = execSync(
      `gh api graphql -f query='${query}' -F prNumber=${prNumber}`,
      { encoding: 'utf8' }
    );

    const data = JSON.parse(result) as GraphQLResponse;
    const comments = parseComments(data);

    // Sort by creation date
    comments.sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );

    // Output JSON by default for programmatic use
    console.log(JSON.stringify(comments, null, 2));
  } catch (error) {
    console.error('Error fetching PR comments:', error);
    process.exit(1);
  }
}

// Main execution
const prNumber = getPRNumber();
getPRComments(prNumber);

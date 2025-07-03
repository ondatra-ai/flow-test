#!/usr/bin/env node
/* eslint-disable no-console */

import { execSync } from 'child_process';

interface Comment {
  file: string | null;
  line: number | null;
  author: string;
  body: string;
  outdated: boolean;
  diffHunk: string;
  url: string;
}

interface CommentNode {
  path: string | null;
  line: number | null;
  body: string;
  outdated: boolean;
  diffHunk: string;
  url: string;
  author: {
    login: string;
  };
}

interface ThreadNode {
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
              comments(first: 10) {
                nodes {
                  path
                  line
                  body
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
          outdated: comment.outdated,
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

    // Output comments as JSON
    console.log(JSON.stringify(comments, null, 2));
  } catch (error) {
    console.error('Error fetching PR comments:', error);
    process.exit(1);
  }
}

// Main execution
const prNumber = getPRNumber();
getPRComments(prNumber);

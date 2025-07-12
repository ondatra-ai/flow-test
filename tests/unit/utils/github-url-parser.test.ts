import { describe, it, expect } from 'vitest';

import { parseGitHubIssueUrl } from '../../../src/utils/github-url-parser.js';

describe('GitHub URL Parser', () => {
  describe('parseGitHubIssueUrl', () => {
    it('should parse valid GitHub issue URL', () => {
      const url = 'https://github.com/owner/repo/issues/123';
      const result = parseGitHubIssueUrl(url);

      expect(result).toEqual({
        owner: 'owner',
        repo: 'repo',
        issue_number: 123,
      });
    });

    it('should parse URL with www subdomain', () => {
      const url = 'https://www.github.com/owner/repo/issues/456';
      const result = parseGitHubIssueUrl(url);

      expect(result).toEqual({
        owner: 'owner',
        repo: 'repo',
        issue_number: 456,
      });
    });

    it('should parse URL without protocol', () => {
      const url = 'github.com/owner/repo/issues/789';
      const result = parseGitHubIssueUrl(url);

      expect(result).toEqual({
        owner: 'owner',
        repo: 'repo',
        issue_number: 789,
      });
    });

    it('should handle hyphens in owner and repo names', () => {
      const url = 'https://github.com/my-owner/my-repo/issues/1';
      const result = parseGitHubIssueUrl(url);

      expect(result).toEqual({
        owner: 'my-owner',
        repo: 'my-repo',
        issue_number: 1,
      });
    });

    it('should handle underscores in owner and repo names', () => {
      const url = 'https://github.com/my_owner/my_repo/issues/2';
      const result = parseGitHubIssueUrl(url);

      expect(result).toEqual({
        owner: 'my_owner',
        repo: 'my_repo',
        issue_number: 2,
      });
    });

    it('should handle dots in repo names', () => {
      const url = 'https://github.com/owner/my.repo/issues/3';
      const result = parseGitHubIssueUrl(url);

      expect(result).toEqual({
        owner: 'owner',
        repo: 'my.repo',
        issue_number: 3,
      });
    });

    it('should throw error for invalid GitHub URL', () => {
      expect(() => {
        parseGitHubIssueUrl('https://invalid-url');
      }).toThrow('Invalid GitHub issue URL');
    });

    it('should throw error for non-issue GitHub URL', () => {
      expect(() => {
        parseGitHubIssueUrl('https://github.com/owner/repo');
      }).toThrow('Invalid GitHub issue URL');
    });

    it('should throw error for pull request URL', () => {
      expect(() => {
        parseGitHubIssueUrl('https://github.com/owner/repo/pull/123');
      }).toThrow('Invalid GitHub issue URL');
    });

    it('should throw error for empty URL', () => {
      expect(() => {
        parseGitHubIssueUrl('');
      }).toThrow('Invalid GitHub issue URL');
    });

    it('should throw error for non-numeric issue number', () => {
      expect(() => {
        parseGitHubIssueUrl('https://github.com/owner/repo/issues/abc');
      }).toThrow('Invalid GitHub issue URL');
    });

    it('should handle very large issue numbers', () => {
      const url = 'https://github.com/owner/repo/issues/999999';
      const result = parseGitHubIssueUrl(url);

      expect(result).toEqual({
        owner: 'owner',
        repo: 'repo',
        issue_number: 999999,
      });
    });
  });
});

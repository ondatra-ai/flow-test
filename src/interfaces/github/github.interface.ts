/**
 * Interface for parsed GitHub issue information
 */
export interface GitHubIssueArgs {
  owner: string;
  repo: string;
  issue_number: number;
}

export interface MockOctokit {
  rest: {
    issues: {
      get: () => Promise<{
        data: {
          number: number;
          title: string;
          body: string;
          state: string;
          user: { login: string };
        };
      }>;
      listComments: () => Promise<{
        data: Array<{ id: number; body: string; user: { login: string } }>;
      }>;
    };
  };
}

/**
 * Interface for parsed GitHub issue information
 */
export interface IGitHubIssueArgs {
  owner: string;
  repo: string;
  issue_number: number;
}

export interface IMockOctokit {
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

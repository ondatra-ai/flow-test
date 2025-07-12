export type GitHubIssue = {
  title: string;
  body: string;
  state: string;
  created_at: string;
  updated_at: string;
  user: {
    login: string;
  };
  comments: number;
};

export type GitHubComment = {
  body: string;
  user: {
    login: string;
  };
  created_at: string;
};

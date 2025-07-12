export type CommandResult = {
  stdout: string;
  stderr: string;
  exitCode: number;
};

export type RunCommandOptions = {
  timeout?: number;
  killSignal?: NodeJS.Signals;
  workingDirectory?: string;
};

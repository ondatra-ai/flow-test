import type { TestEnvironment } from './test-environment.js';
import type { CommandResult } from './types/test-environment.types.js';

/**
 * Run a CLI command and return the result
 * This is a unified function for running any CLI command in tests
 */
export async function runCliCommand(
  testEnv: TestEnvironment,
  args: string[],
  options: {
    workingDirectory?: string;
    timeout?: number;
    expectSuccess?: boolean;
  } = {}
): Promise<CommandResult> {
  const { workingDirectory, timeout = 10000, expectSuccess = false } = options;

  const result = await testEnv.runCommand(args, {
    workingDirectory,
    timeout,
  });

  // Optionally verify success
  if (expectSuccess) {
    if (result.exitCode !== 0) {
      throw new Error(
        `CLI command failed with exit code ${result.exitCode}:\n${
          result.stderr
        }`
      );
    }
  }

  return result;
}

/**
 * Helper function specifically for running flow:run commands
 */
export async function runFlowCommand(
  testEnv: TestEnvironment,
  tempTestDir: string,
  flowName: string,
  parameters: string[] = [],
  timeout: number = 10000
): Promise<CommandResult> {
  return runCliCommand(testEnv, ['flow:run', flowName, ...parameters], {
    workingDirectory: tempTestDir,
    timeout,
  });
}

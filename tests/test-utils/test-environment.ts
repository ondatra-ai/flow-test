import { spawn, ChildProcess, SpawnOptionsWithoutStdio } from 'child_process';
import { existsSync, mkdirSync, writeFileSync, rmSync } from 'fs';
import { resolve } from 'path';

import type { CommandResult, RunCommandOptions } from './types/index.js';

// Chat session interface removed - not needed for current testing

/**
 * Test environment utility for e2e testing of the CLI application
 */
export class TestEnvironment {
  private readonly CLI_PATH: string;
  private readonly NODE_PATH: string;
  private activeProcesses: ChildProcess[] = [];
  private testDataDir?: string;

  constructor() {
    this.CLI_PATH = resolve(__dirname, '../../dist/src/index.js');
    this.NODE_PATH = process.execPath; // Get absolute path to Node.js

    // Generate a unique test data directory name
    const uniqueId = `test-${Date.now()}-${Math.random()
      .toString(36)
      .substring(7)}`;
    this.testDataDir = resolve(__dirname, `../temp-test-data-${uniqueId}`);
  }

  /**
   * Set up the test environment
   */
  setup(): void {
    // Ensure the built CLI exists
    if (!existsSync(this.CLI_PATH)) {
      throw new Error(
        `Built CLI not found at ${this.CLI_PATH}. Run 'npm run build' first.`
      );
    }

    // Create the test flows configuration
    this.createTestFlowsConfiguration();

    // Verify the test environment was created correctly
    this.verifyTestEnvironment();
  }

  /**
   * Verify that the test environment was set up correctly
   */
  private verifyTestEnvironment(): void {
    if (!this.testDataDir) {
      throw new Error('Test data directory not initialized');
    }

    const requiredPaths = [
      this.testDataDir,
      resolve(this.testDataDir, '.flows'),
      resolve(this.testDataDir, '.flows/servers'),
      resolve(this.testDataDir, '.flows/test-flow.json'),
      resolve(this.testDataDir, '.flows/servers/test-server.json'),
    ];

    for (const path of requiredPaths) {
      if (!existsSync(path)) {
        throw new Error(`Required test path does not exist: ${path}`);
      }
    }
  }

  /**
   * Clean up the test environment
   */
  cleanup(): void {
    // Kill any remaining processes
    for (const process of this.activeProcesses) {
      if (process && !process.killed) {
        process.kill('SIGTERM');
      }
    }
    this.activeProcesses = [];

    // Clean up test data directory
    if (this.testDataDir && existsSync(this.testDataDir)) {
      rmSync(this.testDataDir, { recursive: true, force: true });
    }
  }

  /**
   * Run a CLI command and return the result
   */
  async runCommand(
    args: string[],
    options: RunCommandOptions = {}
  ): Promise<CommandResult> {
    const {
      timeout = 5000,
      killSignal = 'SIGTERM',
      workingDirectory,
    } = options;

    return new Promise((resolve, reject) => {
      const spawnOptions: SpawnOptionsWithoutStdio = {
        stdio: ['pipe', 'pipe', 'pipe'],
        env: { ...process.env }, // Ensure environment is properly inherited
      };

      // Set working directory, defaulting to test data directory
      const cwd = workingDirectory || this.getTestDataDir();

      if (!existsSync(cwd)) {
        reject(new Error(`Working directory does not exist: ${cwd}`));
        return;
      }

      spawnOptions.cwd = cwd;

      const childProcess = spawn(
        this.NODE_PATH, // Use absolute path to avoid PATH issues
        [this.CLI_PATH, ...args],
        spawnOptions
      );
      this.activeProcesses.push(childProcess);

      this.handleProcessExecution(
        childProcess,
        timeout,
        killSignal,
        resolve,
        reject
      );

      // For commands that don't expect input, close stdin immediately
      if (!args.includes('chat')) {
        childProcess.stdin?.end();
      }
    });
  }

  /**
   * Handle process execution with timeout and data collection
   */
  private handleProcessExecution(
    childProcess: ChildProcess,
    timeout: number,
    killSignal: NodeJS.Signals,
    resolve: (value: CommandResult) => void,
    reject: (reason?: Error) => void
  ): void {
    let stdout = '';
    let stderr = '';
    let isResolved = false;

    // Set up timeout
    const timeoutId = setTimeout(() => {
      if (!isResolved && childProcess) {
        childProcess.kill(killSignal);
      }
    }, timeout);

    childProcess.stdout?.on('data', (data: Buffer) => {
      stdout += data.toString();
    });

    childProcess.stderr?.on('data', (data: Buffer) => {
      stderr += data.toString();
    });

    childProcess.on('close', (code: number | null) => {
      if (!isResolved) {
        isResolved = true;
        clearTimeout(timeoutId);
        this.removeProcess(childProcess);
        resolve({
          stdout: stdout.trim(),
          stderr: stderr.trim(),
          exitCode: code ?? -1,
        });
      }
    });

    childProcess.on('error', (error: Error) => {
      if (!isResolved) {
        isResolved = true;
        clearTimeout(timeoutId);
        this.removeProcess(childProcess);
        reject(error);
      }
    });
  }

  // Chat session functionality removed - not needed for current testing

  /**
   * Create test flows configuration for testing
   */
  private createTestFlowsConfiguration(): void {
    if (!this.testDataDir) {
      throw new Error('Test data directory not initialized');
    }

    // Create directories
    mkdirSync(resolve(this.testDataDir, '.flows'), { recursive: true });
    mkdirSync(resolve(this.testDataDir, '.flows/servers'), { recursive: true });

    // Create server config
    writeFileSync(
      resolve(this.testDataDir, '.flows/servers/test-server.json'),
      JSON.stringify({
        name: 'test-server',
        command: 'node',
        args: ['test-server.js'],
        env: {},
        transportType: 'stdio',
        capabilities: {
          tools: true,
          resources: false,
          prompts: false,
        },
      })
    );

    // Create test flow
    writeFileSync(
      resolve(this.testDataDir, '.flows/test-flow.json'),
      JSON.stringify({
        id: 'test-flow',
        name: 'Test Flow',
        description: 'A test flow for testing',
        steps: [
          {
            id: 'step1',
            message: 'This is a test step',
            nextStepId: null,
          },
        ],
      })
    );
  }

  /**
   * Get the test data directory path
   */
  getTestDataDir(): string {
    if (!this.testDataDir) {
      throw new Error('Test data directory not initialized');
    }

    // Verify the directory still exists
    if (!existsSync(this.testDataDir)) {
      throw new Error(
        `Test data directory no longer exists: ${this.testDataDir}`
      );
    }

    return this.testDataDir;
  }

  /**
   * Remove a process from the active processes list
   */
  private removeProcess(process: ChildProcess): void {
    const index = this.activeProcesses.indexOf(process);
    if (index > -1) {
      this.activeProcesses.splice(index, 1);
    }
  }
}

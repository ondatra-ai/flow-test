import { promises as fs } from 'fs';
import { join, resolve } from 'path';

import {
  describe,
  it,
  expect,
  beforeAll,
  afterAll,
  beforeEach,
  afterEach,
} from 'vitest';

import { TestEnvironment } from './utils/test-environment.js';

/**
 * Create a timestamp string for unique test directories
 */
function createTimestamp(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');

  return `${year}-${month}-${day}_${hours}-${minutes}-${seconds}`;
}

/**
 * Create test directory path
 */
function createTestDirPath(taskName: string): string {
  const dateTime = createTimestamp();
  const testName = taskName.replace(/[^a-zA-Z0-9-_]/g, '_').toLowerCase();
  const testResultsDir = resolve('./test_results');

  return join(testResultsDir, dateTime, testName);
}

/**
 * Copy a directory recursively
 */
async function copyDirectory(src: string, dest: string): Promise<void> {
  await fs.mkdir(dest, { recursive: true });

  const entries = await fs.readdir(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = join(src, entry.name);
    const destPath = join(dest, entry.name);

    if (entry.isDirectory()) {
      await copyDirectory(srcPath, destPath);
    } else {
      await fs.copyFile(srcPath, destPath);
    }
  }
}

/**
 * Get file structure (just file paths, not content)
 */
async function getFileStructure(dirPath: string): Promise<string[]> {
  const files: string[] = [];

  try {
    const entries = await fs.readdir(dirPath, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = join(dirPath, entry.name);

      if (entry.isDirectory()) {
        const subFiles = await getFileStructure(fullPath);
        files.push(...subFiles.map(f => join(entry.name, f)));
      } else {
        files.push(entry.name);
      }
    }
  } catch {
    // Directory doesn't exist or can't be read
  }

  return files.sort();
}

/**
 * Helper function to set up initial test state
 */
async function setupInitialState(tempTestDir: string): Promise<void> {
  const initialStatePath = resolve(
    __dirname,
    'data/create-login-tests/initial-state'
  );

  await copyDirectory(initialStatePath, tempTestDir);

  // Verify initial state
  const initialFiles = await getFileStructure(tempTestDir);
  expect(initialFiles).toContain('playwright.config.ts');
}

/**
 * Helper function to run the CLI command and verify success
 */
async function runCliCommand(
  testEnv: TestEnvironment,
  tempTestDir: string
): Promise<void> {
  const result = await testEnv.runCommand(['tests:generate'], {
    workingDirectory: tempTestDir,
    timeout: 10000,
  });

  // Verify command executed successfully
  expect(result.exitCode).toBe(0);
  expect(result.stdout).toContain('E2E test structure generated successfully');
}

/**
 * Helper function to verify the generated file structure
 */
async function verifyGeneratedStructure(tempTestDir: string): Promise<void> {
  const e2eDir = join(tempTestDir, 'e2e', 'login-functionality');
  const actualFiles = await getFileStructure(e2eDir);

  // Check that all expected files exist
  const expectedFiles = [
    'desc.md',
    'login.spec.js',
    'pages/LoginPage.js',
    'pages/LogoutPage.js',
    'pages/MemberPage.js',
    'playwright.config.ts',
  ];

  for (const expectedFile of expectedFiles) {
    expect(actualFiles).toContain(expectedFile);
  }
}

/**
 * E2E test for the tests:generate CLI command
 * This test verifies that the command correctly generates e2e test structure
 */
describe('CLI E2E Tests - tests:generate command', () => {
  let testEnv: TestEnvironment;
  let tempTestDir: string;

  beforeAll(() => {
    testEnv = new TestEnvironment('test-generation');
    testEnv.setup();
  });

  afterAll(() => {
    testEnv.cleanup();
  });

  beforeEach(async ctx => {
    // Create a unique test directory under test_results
    // organized by date and time
    tempTestDir = createTestDirPath(ctx.task.name);
    await fs.mkdir(tempTestDir, { recursive: true });
  });

  afterEach(async () => {
    // Keep test results for debugging - no cleanup needed
    // The test_results directory is gitignored
  });

  it('should generate e2e test structure from initial state', async () => {
    // Step 1: Set up initial state
    await setupInitialState(tempTestDir);

    // Step 2: Run the tests:generate CLI command
    await runCliCommand(testEnv, tempTestDir);

    // Step 3: Verify the generated structure
    await verifyGeneratedStructure(tempTestDir);
  }, 15000);
});

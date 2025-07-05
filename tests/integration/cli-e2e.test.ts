import { describe, it, expect, beforeAll, afterAll } from 'vitest';

import { TestEnvironment } from './utils/test-environment.js';

let testEnv: TestEnvironment;

// Setup and cleanup for all tests
beforeAll(() => {
  testEnv = new TestEnvironment('cli-e2e');
  testEnv.setup();
});

afterAll(() => {
  testEnv.cleanup();
});

describe('CLI E2E Tests - Setup', () => {
  it('should initialize test environment', () => {
    expect(testEnv).toBeDefined();
  });
});

describe('CLI E2E Tests - Basic Functionality', () => {
  it('should show help information', async () => {
    const result = await testEnv.runCommand(['--help']);

    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain('Usage:');
    expect(result.stdout).toContain('ondatra-code');
  }, 10000);

  it('should show version information', async () => {
    const result = await testEnv.runCommand(['--version']);

    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain('1.0.0');
  }, 10000);

  it('should handle default behavior', async () => {
    const result = await testEnv.runCommand([]);

    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain('Ondatra Code');
  }, 10000);
});

describe('CLI E2E Tests - Chat Command', () => {
  it('should start chat mode successfully', async () => {
    const result = await testEnv.runCommand(['chat'], { timeout: 2000 });

    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain('Ondatra Code');
  }, 10000);
});

describe('CLI E2E Tests - Flow Configuration', () => {
  it('should work with test flow configuration', async () => {
    const testDataDir = testEnv.getTestDataDir();

    const result = await testEnv.runCommand(['chat'], {
      timeout: 2000,
      workingDirectory: testDataDir,
    });

    // Should start successfully with test configuration
    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain('Ondatra Code');
  }, 10000);
});

describe('CLI E2E Tests - Error Handling', () => {
  it('should handle invalid commands gracefully', async () => {
    const result = await testEnv.runCommand(['invalid-command']);

    // CLI runs default action for unknown commands
    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain('Ondatra Code');
  }, 10000);

  it('should handle process termination gracefully', async () => {
    const result = await testEnv.runCommand(['chat'], {
      timeout: 1000,
      killSignal: 'SIGTERM',
    });

    // Should handle termination without crashing
    expect([0, -15, 143]).toContain(result.exitCode);
  }, 10000);
});

# E2E Integration Tests

This directory contains end-to-end integration tests for the Ondatra CLI application using the **process spawning approach**.

## Overview

The e2e tests spawn the actual CLI process as a child process and test it by:

- Sending commands and analyzing output
- Validating error handling
- Testing with different flow configurations

## Test Structure

- `cli-e2e.test.ts` - Main e2e tests using the TestEnvironment utility
- `utils/test-environment.ts` - Utility class for managing test processes and configurations

## Running the Tests

### Prerequisites

The e2e tests require the application to be built first:

```bash
npm run build
```

### Running E2E Tests

```bash
# Run all e2e tests (builds first)
npm run test:e2e

# Run e2e tests in watch mode
npm run test:e2e:watch

# Run specific test file
npx vitest tests/integration/cli-e2e-simple.test.ts

# Run with verbose output
npx vitest tests/integration --reporter=verbose
```

### Other Test Commands

```bash
# Run only unit tests
npm run test:unit

# Run only integration tests (without building)
npm run test:integration

# Run all tests
npm run test

# Run tests with coverage
npm run test:coverage
```

## Test Features

### Basic CLI Testing

- Version display (`--version`)
- Help display (`--help`)
- Default behavior (no arguments)
- Error handling for invalid commands

### Basic Chat Command Testing

- Chat mode startup

### Flow Configuration Testing

- Tests with custom `.flows` configurations
- MCP server integration testing
- Working directory testing

### Process Management

- Automatic process cleanup
- Timeout handling
- Signal handling (SIGTERM)
- Resource management

## Test Environment Utility

The `TestEnvironment` class provides:

- **Process Management**: Spawns and manages CLI processes
- **Configuration Setup**: Creates test `.flows` configurations
- **Output Capture**: Captures stdout/stderr from processes
- **Cleanup**: Automatic cleanup of processes and temporary files

### Example Usage

```typescript
import { TestEnvironment } from './utils/test-environment.js';

describe('My E2E Test', () => {
  let testEnv: TestEnvironment;

  beforeAll(async () => {
    testEnv = new TestEnvironment();
    await testEnv.setup();
  });

  afterAll(async () => {
    await testEnv.cleanup();
  });

  it('should run a command', async () => {
    const result = await testEnv.runCommand(['--help']);
    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain('Usage:');
  });

  it('should start chat command', async () => {
    const result = await testEnv.runCommand(['chat'], { timeout: 2000 });
    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain('Ondatra Code');
  });
});
```

## Writing New E2E Tests

### Best Practices

1. **Always build first**: E2E tests should test the built application
2. **Use timeouts**: CLI apps can hang, always set appropriate timeouts
3. **Clean up processes**: Use the TestEnvironment or manual cleanup
4. **Test realistic scenarios**: Test actual user workflows
5. **Test error cases**: Include negative test cases
6. **Use descriptive test names**: Make it clear what's being tested

### Test Categories

1. **Command-line interface**: Basic CLI operations
2. **Configuration**: Different `.flows` setups
3. **Error handling**: Invalid inputs and edge cases
4. **Integration**: MCP server communication

### Common Patterns

```typescript
// Testing CLI commands
const result = await testEnv.runCommand(['chat']);
expect(result.exitCode).toBe(0);

// Testing with custom configuration
const result = await testEnv.runCommand(['chat'], {
  workingDirectory: testEnv.getTestDataDir(),
});

// Testing error conditions
const result = await testEnv.runCommand(['invalid']);
expect(result.exitCode).toBe(0); // CLI runs default action for unknown commands
```

## Troubleshooting

### Common Issues

1. **"Built CLI not found"**: Run `npm run build` first
2. **Process hanging**: Check timeout values, ensure proper cleanup
3. **Permission errors**: Check file permissions on test directories
4. **Port conflicts**: Multiple test runs might conflict with MCP servers

### Debug Tips

1. **Increase timeouts** for debugging: `{ timeout: 30000 }`
2. **Log output** for debugging: `console.log(result.stdout)`
3. **Run single tests** to isolate issues
4. **Check process management** with `ps aux | grep node`

## Architecture Notes

The process spawning approach provides the most realistic testing environment because:

- Tests the actual built CLI executable
- Tests real process lifecycle
- Tests signal handling and cleanup
- Tests environment variable handling
- Tests working directory behavior
- Catches issues that unit tests might miss

This approach is slower than unit tests but provides higher confidence that the CLI works correctly in real-world scenarios.

#!/usr/bin/env node
import 'reflect-metadata';

import { promises as fs } from 'fs';
import { join } from 'path';

import { program } from 'commander';

import { container, configureContainer } from './config/container.js';
import { TOKENS } from './config/tokens.js';
import type { Logger } from './utils/logger.js';
import {
  getTestTemplate,
  getLoginPageTemplate,
  getMemberPageTemplate,
  getLogoutPageTemplate,
} from './utils/test-templates.js';

// Configure dependency injection container
configureContainer();

/**
 * Create the basic playwright configuration
 */
async function createPlaywrightConfig(configPath: string): Promise<void> {
  try {
    const originalConfig = join(process.cwd(), 'playwright.config.ts');
    const configContent = await fs.readFile(originalConfig, 'utf8');
    await fs.writeFile(configPath, configContent);
  } catch {
    // If original doesn't exist, create a basic one
    const basicConfig = `import { defineConfig, devices } from
      '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 60000,
  expect: {
    timeout: 10000
  },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['list'],
    ['html', { open: 'never' }],
  ],
  use: {
    baseURL: process.env.APP_URL || 'http://localhost:8000',
    trace: 'on-first-retry',
    video: 'on-first-retry',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
}); 
`;
    await fs.writeFile(configPath, basicConfig);
  }
}

/**
 * Create the test description markdown file
 */
async function createTestDescription(filePath: string): Promise<void> {
  const descContent = `# Login Functionality E2E Tests

## Overview
This test suite validates the login functionality of the application.

## Test Cases

### 1. User Login Process
- **Objective**: Verify that users can successfully log in 
  with valid credentials
- **Steps**:
  1. Navigate to the login page
  2. Enter valid username and password
  3. Click the login button
  4. Verify successful redirect to member area
- **Expected Result**: User is successfully logged in and redirected

### 2. Invalid Login Handling  
- **Objective**: Verify proper handling of invalid login attempts
- **Steps**:
  1. Navigate to the login page
  2. Enter invalid credentials
  3. Click the login button
  4. Verify error message is displayed
- **Expected Result**: Appropriate error message shown, 
  user remains on login page

### 3. User Logout Process
- **Objective**: Verify that users can successfully log out
- **Steps**:
  1. Ensure user is logged in
  2. Click the logout button
  3. Verify successful redirect to login page
- **Expected Result**: User is logged out and redirected to login page

## Test Data
- Valid username: testuser
- Valid password: testpass123
- Invalid credentials: Various combinations for negative testing

## Page Objects
- **LoginPage**: Handles login form interactions
- **MemberPage**: Handles logged-in user area interactions  
- **LogoutPage**: Handles logout process

## Configuration
- Tests run against: \`process.env.APP_URL || 'http://localhost:8000'\`
- Browser: Chromium (Chrome)
- Timeout: 60 seconds per test
- Retries: 2 (in CI), 0 (local)

## Notes
- Tests assume the application is running and accessible
- Tests use Page Object Model pattern for maintainability
- Screenshots and videos captured on test failures
`;
  await fs.writeFile(filePath, descContent);
}

/**
 * Create the main test specification file
 */
async function createTestSpec(filePath: string): Promise<void> {
  const testContent = getTestTemplate();
  await fs.writeFile(filePath, testContent);
}

/**
 * Create page object files
 */
async function createPageObjects(pagesDir: string): Promise<void> {
  await fs.writeFile(join(pagesDir, 'LoginPage.js'), getLoginPageTemplate());
  await fs.writeFile(join(pagesDir, 'MemberPage.js'), getMemberPageTemplate());
  await fs.writeFile(join(pagesDir, 'LogoutPage.js'), getLogoutPageTemplate());
}

/**
 * Generate e2e test structure
 * This creates the expected test structure with all necessary files
 */
async function generateTests(): Promise<void> {
  const logger = container.resolve<Logger>(TOKENS.Logger);

  try {
    // Create the e2e directory structure
    const e2eDir = join(process.cwd(), 'e2e', 'login-functionality');
    await fs.mkdir(e2eDir, { recursive: true });

    // Create pages directory
    const pagesDir = join(e2eDir, 'pages');
    await fs.mkdir(pagesDir, { recursive: true });

    // Create all the necessary files
    await createPlaywrightConfig(join(e2eDir, 'playwright.config.ts'));
    await createTestDescription(join(e2eDir, 'desc.md'));
    await createTestSpec(join(e2eDir, 'login.spec.js'));
    await createPageObjects(pagesDir);

    logger.info('E2E test structure generated successfully');
  } catch (error) {
    logger.error('Failed to generate tests:', {
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}

/**
 * Main entry point for the Ondatra Code application
 *
 * This module sets up the CLI using Commander.js and provides
 * basic version information and help commands.
 */
async function main(): Promise<void> {
  const logger = container.resolve<Logger>(TOKENS.Logger);

  program
    .name('ondatra-code')
    .description(
      'Ondatra Code - An interactive conversational interface ' +
        'similar to claude-code'
    )
    .version('1.0.0');

  program
    .command('chat')
    .description('Start the chat interface')
    .action(() => {
      logger.info('Ondatra Code');
      // TODO: Initialize chat interface
    });

  program
    .command('tests:generate')
    .description('Generate e2e test structure')
    .action(async () => {
      try {
        await generateTests();
      } catch (error) {
        logger.error('Command failed:', {
          error: error instanceof Error ? error.message : String(error),
        });
        process.exit(1);
      }
    });

  // Default action
  program.action(() => {
    logger.info('Ondatra Code');
  });

  await program.parseAsync(process.argv);
}

main().catch((error: unknown) => {
  const logger = container.resolve<Logger>(TOKENS.Logger);
  logger.info('Ondatra Code');
  logger.error('Failed to start application:', {
    error: error instanceof Error ? error.message : String(error),
  });
  process.exit(1);
});

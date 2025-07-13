import { promises as fs } from 'fs';
import { join } from 'path';

import { container, SERVICES } from '../config/container.js';

import { castError } from './cast.js';
import type { Logger } from './logger.js';
import {
  getTestTemplate,
  getLoginPageTemplate,
  getMemberPageTemplate,
  getLogoutPageTemplate,
} from './test-templates.js';

/**
 * Create the basic playwright configuration
 */
export async function createPlaywrightConfig(
  configPath: string
): Promise<void> {
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
export async function createTestDescription(filePath: string): Promise<void> {
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
- Valid username: ****@example.com
- Valid password: ****
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
export async function createTestSpec(filePath: string): Promise<void> {
  const testContent = getTestTemplate();
  await fs.writeFile(filePath, testContent);
}

/**
 * Create page object files
 */
export async function createPageObjects(pagesDir: string): Promise<void> {
  await fs.writeFile(join(pagesDir, 'LoginPage.js'), getLoginPageTemplate());
  await fs.writeFile(join(pagesDir, 'MemberPage.js'), getMemberPageTemplate());
  await fs.writeFile(join(pagesDir, 'LogoutPage.js'), getLogoutPageTemplate());
}

/**
 * Generate e2e test structure
 * This creates the expected test structure with all necessary files
 */
export async function generateTests(): Promise<void> {
  const logger = container.resolve<Logger>(SERVICES.Logger);

  try {
    // Create the e2e directory structure
    const e2eDir = join(process.cwd(), 'e2e', 'login-functionality');
    await fs.mkdir(e2eDir, { recursive: true });

    // Create pages directory
    const pagesDir = join(e2eDir, 'pages');
    await fs.mkdir(pagesDir, { recursive: true });

    // Create all the necessary files
    await createPlaywrightConfig(join(process.cwd(), 'playwright.config.ts'));
    await createTestDescription(join(e2eDir, 'desc.md'));
    await createTestSpec(join(e2eDir, 'login.spec.js'));
    await createPageObjects(pagesDir);

    logger.info('E2E test structure generated successfully');
  } catch (error) {
    logger.error('Failed to generate tests:', castError(error));
    throw error;
  }
}

/**
 * Test template utilities for generating e2e test files
 */

/**
 * Get test imports and setup
 */
export function getTestImports(): string {
  return `const { test, expect } = require('@playwright/test');
const { LoginPage } = require('./pages/LoginPage');
const { MemberPage } = require('./pages/MemberPage');
const { LogoutPage } = require('./pages/LogoutPage');

test.describe('Login Functionality', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the application
    await page.goto('/');
  });`;
}

/**
 * Get test cases content
 */
export function getTestCases(): string {
  return `
  test('should allow user to login with valid credentials',
    async ({ page }) => {
    const loginPage = new LoginPage(page);
    const memberPage = new MemberPage(page);

    // Perform login
    await loginPage.login('****@example.com', '****');
    
    // Verify successful login
    await expect(memberPage.welcomeMessage).toBeVisible();
    await expect(page).toHaveURL(/.*member/);
  });

  test('should show error for invalid credentials', async ({ page }) => {
    const loginPage = new LoginPage(page);

    // Attempt login with invalid credentials
    await loginPage.login('****@example.com', '****');
    
    // Verify error message
    await expect(loginPage.errorMessage).toBeVisible();
    await expect(loginPage.errorMessage)
      .toContainText('Invalid credentials');
    
    // Verify still on login page
    await expect(page).toHaveURL(/.*login/);
  });

  test('should allow user to logout', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const memberPage = new MemberPage(page);
    const logoutPage = new LogoutPage(page);

    // Login first
    await loginPage.login('****@example.com', '****');
    await expect(memberPage.welcomeMessage).toBeVisible();

    // Perform logout
    await logoutPage.logout();
    
    // Verify logout success
    await expect(page).toHaveURL(/.*login/);
    await expect(loginPage.loginForm).toBeVisible();
  });

  test('should redirect to member area when already logged in', 
    async ({ page }) => {
      const loginPage = new LoginPage(page);
      const memberPage = new MemberPage(page);

      // Login first
      await loginPage.login('****@example.com', '****');
      
      // Try to access login page again
      await page.goto('/login');
      
      // Should be redirected to member area
      await expect(page).toHaveURL(/.*member/);
      await expect(memberPage.welcomeMessage).toBeVisible();
    });
});`;
}

/**
 * Generate test content template
 */
export function getTestTemplate(): string {
  return getTestImports() + getTestCases() + '\n';
}

/**
 * Get LoginPage content template
 */
export function getLoginPageTemplate(): string {
  return `class LoginPage {
  constructor(page) {
    this.page = page;
    this.usernameInput = page.locator('[data-testid="username"]');
    this.passwordInput = page.locator('[data-testid="password"]');
    this.loginButton = page.locator('[data-testid="login-button"]');
    this.errorMessage = page.locator('[data-testid="error-message"]');
    this.loginForm = page.locator('[data-testid="login-form"]');
  }

  async login(username, password) {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
  }

  async navigateToLogin() {
    await this.page.goto('/login');
  }

  async isErrorVisible() {
    return await this.errorMessage.isVisible();
  }

  async getErrorText() {
    return await this.errorMessage.textContent();
  }
}

module.exports = { LoginPage };
`;
}

/**
 * Get MemberPage content template
 */
export function getMemberPageTemplate(): string {
  return `class MemberPage {
  constructor(page) {
    this.page = page;
    this.welcomeMessage = page.locator('[data-testid="welcome-message"]');
    this.userProfile = page.locator('[data-testid="user-profile"]');
    this.logoutButton = page.locator('[data-testid="logout-button"]');
  }

  async isWelcomeVisible() {
    return await this.welcomeMessage.isVisible();
  }

  async getWelcomeText() {
    return await this.welcomeMessage.textContent();
  }

  async navigateToProfile() {
    await this.userProfile.click();
  }
}

module.exports = { MemberPage };
`;
}

/**
 * Get LogoutPage content template
 */
export function getLogoutPageTemplate(): string {
  return `class LogoutPage {
  constructor(page) {
    this.page = page;
    this.logoutButton = page.locator('[data-testid="logout-button"]');
    this.confirmButton = page.locator('[data-testid="confirm-logout"]');
  }

  async logout() {
    await this.logoutButton.click();
    // Handle confirmation if present
    try {
      await this.confirmButton.click({ timeout: 1000 });
    } catch {
      // No confirmation dialog present
    }
  }

  async isLogoutButtonVisible() {
    return await this.logoutButton.isVisible();
  }
}

module.exports = { LogoutPage };
`;
}

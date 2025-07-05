const { test, expect } = require('@playwright/test');
const { LoginPage } = require('./pages/LoginPage');
const { MemberPage } = require('./pages/MemberPage');
const { LogoutPage } = require('./pages/LogoutPage');

test.describe('Login Functionality', () => {
  let loginPage;
  let memberPage;
  let logoutPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    memberPage = new MemberPage(page);
    logoutPage = new LogoutPage(page);
  });

  test('User logs in successfully with correct credentials', async ({ page }) => {
    // Go to login page
    await loginPage.goto();
    
    // Verify we're on the login page
    expect(await loginPage.isOnLoginPage()).toBeTruthy();
    
    // Enter valid credentials and login
    await loginPage.login(process.env.ADMIN_LOGIN, process.env.ADMIN_PASSWORD);
    
    // Wait for navigation to member page
    await memberPage.waitForMemberPage();
    
    // Verify user is redirected to member page
    expect(await memberPage.isOnMemberPage()).toBeTruthy();
    await expect(memberPage.memberHomeHeading).toBeVisible();
  });

  test('User fails to log in with incorrect credentials', async ({ page }) => {
    // Go to login page
    await loginPage.goto();
    
    // Verify we're on the login page
    expect(await loginPage.isOnLoginPage()).toBeTruthy();
    
    // Enter incorrect credentials and try to login
    await loginPage.login('****@example.com', '****');
    
    // Wait for error message to appear
    await loginPage.errorMessage.waitFor();
    
    // Verify user remains on login page
    expect(await loginPage.isOnLoginPage()).toBeTruthy();
    
    // Verify error message is displayed
    await expect(loginPage.errorMessage).toBeVisible();
    const errorText = await loginPage.getErrorMessage();
    expect(errorText).toContain('These credentials do not match our records');
  });

  test('User logs out successfully', async ({ page }) => {
    // First, login to get to authenticated state
    await loginPage.goto();
    await loginPage.login(process.env.ADMIN_LOGIN, process.env.ADMIN_PASSWORD);
    await memberPage.waitForMemberPage();
    
    // Verify user is logged in and on member page
    expect(await memberPage.isOnMemberPage()).toBeTruthy();
    
    // Click logout
    await memberPage.logout();
    
    // Wait for logout page
    await logoutPage.waitForLogoutPage();
    
    // Verify user is logged out and on logout page
    expect(await logoutPage.isOnLogoutPage()).toBeTruthy();
    await expect(logoutPage.logoutMessage).toBeVisible();
  });
}); 
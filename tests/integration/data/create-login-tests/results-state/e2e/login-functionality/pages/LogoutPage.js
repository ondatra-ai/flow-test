class LogoutPage {
  constructor(page) {
    this.page = page;
    this.logoutMessage = page.getByRole('heading', { name: 'You Have Successfully Logged Out' });
    this.loginLink = page.getByRole('link', { name: 'visit the login screen.' });
  }

  async isOnLogoutPage() {
    return this.page.url().includes('/expired');
  }

  async waitForLogoutPage() {
    await this.page.waitForURL('**/expired');
    await this.logoutMessage.waitFor();
  }

  async goToLogin() {
    await this.loginLink.click();
  }
}

module.exports = { LogoutPage }; 
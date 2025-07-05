class LoginPage {
  constructor(page) {
    this.page = page;
    this.emailInput = page.getByRole('textbox', { name: 'Email Address/Username' });
    this.passwordInput = page.getByRole('textbox', { name: 'Password' });
    this.rememberMeCheckbox = page.getByRole('checkbox', { name: 'Remember Me' });
    this.loginButton = page.getByRole('button', { name: 'Login' });
    this.forgotPasswordLink = page.getByRole('link', { name: 'Forgot Your Password?' });
    this.errorMessage = page.getByRole('alert');
  }

  async goto() {
    await this.page.goto('/');
  }

  async login(email, password) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
  }

  async checkRememberMe() {
    await this.rememberMeCheckbox.check();
  }

  async getErrorMessage() {
    return await this.errorMessage.textContent();
  }

  async isOnLoginPage() {
    return this.page.url() === process.env.APP_URL + '/';
  }
}

module.exports = { LoginPage }; 
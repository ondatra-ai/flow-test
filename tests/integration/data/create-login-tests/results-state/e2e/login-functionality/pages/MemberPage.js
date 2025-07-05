class MemberPage {
  constructor(page) {
    this.page = page;
    this.logoutLink = page.getByRole('banner').getByRole('link', { name: 'Logout' });
    this.memberHomeHeading = page.getByRole('heading', { name: 'Member Home' });
  }

  async logout() {
    await this.logoutLink.click();
  }

  async isOnMemberPage() {
    return this.page.url().includes('/member');
  }

  async waitForMemberPage() {
    await this.page.waitForURL('**/member');
    await this.memberHomeHeading.waitFor();
  }
}

module.exports = { MemberPage }; 
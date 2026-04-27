import type { Page } from '@playwright/test';
import { BasePage } from './basePage';

export class LogoutPage extends BasePage {
  readonly logOutLink = this.page.getByRole('link', { name: 'Log Out' });
  readonly logInButton = this.page.getByRole('button', { name: 'Log In' });

  constructor(page: Page) {
    super(page);
  }

  async logout(): Promise<void> {
    await this.logOutLink.click();
  }

  async expectLoggedOut(): Promise<void> {
    await this.logInButton.waitFor({ state: 'visible' });
  }
}

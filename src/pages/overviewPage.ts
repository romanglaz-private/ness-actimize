import type { Page } from '@playwright/test';
import { expect } from '@playwright/test';
import { BasePage } from './basePage';

export class OverviewPage extends BasePage {
  readonly pathOverview = 'overview.htm';
  readonly accountLink = (accountId: number) =>
    this.page.getByRole('link', { name: String(accountId) });

  constructor(page: Page) {
    super(page);
  }

  async goto(): Promise<void> {
    await this.page.goto(this.pathOverview);
  }

  async expectAccountIdVisible(accountId: number): Promise<void> {
    await expect(this.accountLink(accountId)).toBeVisible();
  }
}

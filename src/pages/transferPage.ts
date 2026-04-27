import type { Page } from '@playwright/test';
import { BasePage } from './basePage';

export class TransferPage extends BasePage {
  readonly pathTransfer = 'transfer.htm';
  readonly fromAccountSelect = this.page.locator('#fromAccountId');
  readonly toAccountSelect = this.page.locator('#toAccountId');
  readonly amountInput = this.page.locator('#amount');
  readonly transferButton = this.page.getByRole('button', { name: 'Transfer' });
  readonly transferCompleteMessage = this.page.getByText('Transfer Complete!');

  constructor(page: Page) {
    super(page);
  }

  async goto(): Promise<void> {
    await this.page.goto(this.pathTransfer);
  }

  async transfer(fromAccountId: number, toAccountId: number, amount: string): Promise<void> {
    await this.fromAccountSelect.selectOption(String(fromAccountId));
    await this.toAccountSelect.selectOption(String(toAccountId));
    await this.amountInput.fill(amount);
    await this.transferButton.click();
  }

  async expectTransferResult(): Promise<void> {
    await this.transferCompleteMessage.waitFor({ state: 'visible' });
  }
}

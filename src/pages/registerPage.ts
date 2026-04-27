import type { Page } from '@playwright/test';
import { BasePage } from './basePage';

export type RegisterFormData = {
  firstName: string;
  lastName: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  phoneNumber: string;
  ssn: string;
  username: string;
  password: string;
};

export class RegisterPage extends BasePage {
  readonly registerPath = 'register.htm';
  readonly registerResponseUrlPart = 'register.htm';
  readonly registerResponseMethod = 'POST';
  readonly customerForm = this.page.locator('#customerForm');
  readonly firstNameInput = this.customerForm.locator('input[name="customer.firstName"]');
  readonly lastNameInput = this.customerForm.locator('input[name="customer.lastName"]');
  readonly streetInput = this.customerForm.locator('input[name="customer.address.street"]');
  readonly cityInput = this.customerForm.locator('input[name="customer.address.city"]');
  readonly stateInput = this.customerForm.locator('input[name="customer.address.state"]');
  readonly zipInput = this.customerForm.locator('input[name="customer.address.zipCode"]');
  readonly phoneInput = this.customerForm.locator('input[name="customer.phoneNumber"]');
  readonly ssnInput = this.customerForm.locator('input[name="customer.ssn"]');
  readonly usernameInput = this.customerForm.locator('input[name="customer.username"]');
  readonly passwordInput = this.customerForm.locator('input[name="customer.password"]');
  readonly repeatedPasswordInput = this.customerForm.locator('input[name="repeatedPassword"]');
  readonly registerButton = this.customerForm.getByRole('button', { name: 'Register' });
  readonly successMessage = this.page.getByText(/account was created successfully/i);

  constructor(page: Page) {
    super(page);
  }

  async gotoToRegisterPage(): Promise<void> {
    await this.page.goto(this.registerPath);
    await this.firstNameInput.waitFor({ state: 'visible' });
  }

  async submitRegistration(data: RegisterFormData): Promise<void> {
    await this.firstNameInput.fill(data.firstName);
    await this.lastNameInput.fill(data.lastName);
    await this.streetInput.fill(data.street);
    await this.cityInput.fill(data.city);
    await this.stateInput.fill(data.state);
    await this.zipInput.fill(data.zipCode);
    await this.phoneInput.fill(data.phoneNumber);
    await this.ssnInput.fill(data.ssn);
    await this.usernameInput.fill(data.username);
    await this.passwordInput.fill(data.password);
    await this.repeatedPasswordInput.fill(data.password);
    await Promise.all([
      this.page.waitForResponse(
        (res) =>
          res.url().includes(this.registerResponseUrlPart) &&
          res.request().method() === this.registerResponseMethod,
      ),
      this.registerButton.click(),
    ]);
  }

  async expectRegistrationSuccess(): Promise<void> {
    await this.successMessage.waitFor({ state: 'visible' });
  }
}

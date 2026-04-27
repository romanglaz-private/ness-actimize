import type { Page } from '@playwright/test';
import { appBaseUrl } from '../config/env';
import { BasePage } from './basePage';

export class LoginPage extends BasePage {
  readonly pathIndex = 'index.htm';
  readonly pathOverview = 'overview.htm';
  readonly pathLoginAction = 'login.htm';
  readonly fetchContentType = 'application/x-www-form-urlencoded';
  readonly paramUsernameKey = 'username';
  readonly paramPasswordKey = 'password';
  readonly loginErrorTimeoutMs = 15_000;
  readonly loginForm = this.page.locator('form[name="login"]');
  readonly loginUsername = this.loginForm.locator('input[name="username"]');
  readonly loginPassword = this.loginForm.locator('input[name="password"]');
  readonly loginSubmit = this.loginForm.getByRole('button', { name: 'Log In' });
  readonly accountsOverviewHeading = this.page.getByRole('heading', {
    name: 'Accounts Overview',
  });
  readonly loginErrorComposite = this.page
    .getByText('An internal error has occurred')
    .or(this.page.getByText('Please enter a username and password'))
    .or(this.page.getByText('The username and password could not be verified'));

  constructor(page: Page) {
    super(page);
  }

  async goto(): Promise<void> {
    await this.page.goto(this.pathIndex);
  }

  async loginWithBrowserSubmit(username: string, password: string): Promise<void> {
    await this.goto();
    await this.loginUsername.fill(username);
    await this.loginPassword.fill(password);
    await this.loginSubmit.click();
  }

  async login(username: string, password: string): Promise<void> {
    const baseUrl = appBaseUrl();
    await this.page.goto(this.pathIndex);
    await this.loginUsername.fill(username);
    await this.loginPassword.fill(password);
    await this.page.evaluate(
      async ({ base, user, pass, loginPath, ct, uKey, pKey }) => {
        const target = new URL(loginPath, base).toString();
        const body = new URLSearchParams();
        body.set(uKey, user);
        body.set(pKey, pass);
        await fetch(target, {
          method: 'POST',
          headers: { 'Content-Type': ct },
          body: body.toString(),
          credentials: 'include',
        });
      },
      {
        base: baseUrl,
        user: username,
        pass: password,
        loginPath: this.pathLoginAction,
        ct: this.fetchContentType,
        uKey: this.paramUsernameKey,
        pKey: this.paramPasswordKey,
      },
    );
    await this.page.goto(this.pathIndex);
  }

  async expectLoggedIn(): Promise<void> {
    await this.page.goto(this.pathOverview);
    await this.accountsOverviewHeading.waitFor({ state: 'visible' });
  }

  async expectLoginError(): Promise<void> {
    await this.loginErrorComposite
      .first()
      .waitFor({ state: 'visible', timeout: this.loginErrorTimeoutMs });
  }
}

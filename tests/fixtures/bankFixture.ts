import { test as base, expect } from '@playwright/test';
import type { APIRequestContext, Page } from '@playwright/test';
import { BankApi } from '../../src/api/bankApi';
import { apiBaseUrl, appBaseUrl } from '../../src/config/env';
import { RegisterPage } from '../../src/pages/registerPage';
import { LoginPage } from '../../src/pages/loginPage';
import { OverviewPage } from '../../src/pages/overviewPage';
import { TransferPage } from '../../src/pages/transferPage';
import { LogoutPage } from '../../src/pages/logoutPage';
import { buildRandomRegistrationData } from '../utils/parabankTestData';

export type RegisteredUser = {
  username: string;
  password: string;
  firstName: string;
};

export type BankWorkerFixtures = {
  registeredUser: RegisteredUser;
};

export type BankTestFixtures = {
  bankApi: BankApi;
  registerPage: RegisterPage;
  loginPage: LoginPage;
  overviewPage: OverviewPage;
  transferPage: TransferPage;
  logoutPage: LogoutPage;
};

export const test = base.extend<BankTestFixtures, BankWorkerFixtures>({
  registeredUser: [
    async ({ browser }, use) => {
      const reg = buildRandomRegistrationData();
      const context = await browser.newContext({ baseURL: appBaseUrl() });
      try {
        const page = await context.newPage();
        const registerPage = new RegisterPage(page);
        const logoutPage = new LogoutPage(page);
        await registerPage.gotoToRegisterPage();
        await registerPage.submitRegistration(reg);
        await registerPage.expectRegistrationSuccess();
        await logoutPage.logout();
        await logoutPage.expectLoggedOut();
      } finally {
        await context.close();
      }
      await use({
        username: reg.username,
        password: reg.password,
        firstName: reg.firstName,
      });
    },
    { scope: 'worker' },
  ],
  bankApi: async ({ request }: { request: APIRequestContext }, use) => {
    const api = new BankApi(request, apiBaseUrl());
    await use(api);
  },
  registerPage: async ({ page }: { page: Page }, use) => {
    await use(new RegisterPage(page));
  },
  loginPage: async ({ page }: { page: Page }, use) => {
    await use(new LoginPage(page));
  },
  overviewPage: async ({ page }: { page: Page }, use) => {
    await use(new OverviewPage(page));
  },
  transferPage: async ({ page }: { page: Page }, use) => {
    await use(new TransferPage(page));
  },
  logoutPage: async ({ page }: { page: Page }, use) => {
    await use(new LogoutPage(page));
  },
});

export { expect };

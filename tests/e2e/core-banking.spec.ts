import { expect } from '../fixtures/bankFixture';
import { test } from '../fixtures/bankFixture';
import {
  createCheckingAccountViaCurl,
  PARABANK_NEW_ACCOUNT_TYPE_CHECKING,
} from '../../src/infra/curlCreateAccount';
import { apiBaseUrl } from '../../src/config/env';
import {
  ParabankTestConstants,
  pickFundAccount,
} from '../utils/parabankTestData';

test.describe.configure({ mode: 'serial' });

test.describe('core banking e2e', () => {
  let customerId = 0;
  let fundAccountId = 0;
  let newAccountId = 0;
  let fundBalanceBefore = 0;
  let newBalanceBefore = 0;

  test('API login returns registered customer', async ({ bankApi, registeredUser }) => {
    const loginRes = await bankApi.login(registeredUser.username, registeredUser.password);
    expect(loginRes.status).toBe(200);
    expect(loginRes.customer).not.toBeNull();
    customerId = loginRes.customer!.id;
    expect(customerId).toBeGreaterThan(0);
    expect(loginRes.customer!.firstName).toBe(registeredUser.firstName);
  });

  test('curl createAccount adds CHECKING; balances captured', async ({ bankApi }) => {
    const accountsRes = await bankApi.getCustomerAccounts(customerId);
    expect(accountsRes.status).toBe(200);
    expect(accountsRes.accounts.length).toBeGreaterThan(0);
    const fundAccount = pickFundAccount(accountsRes.accounts);
    fundAccountId = fundAccount.id;

    const curlResult = createCheckingAccountViaCurl({
      apiBaseUrl: apiBaseUrl(),
      customerId,
      fromAccountId: fundAccountId,
      newAccountType: PARABANK_NEW_ACCOUNT_TYPE_CHECKING,
    });
    expect(curlResult.statusCode).toBe(200);
    expect(curlResult.account).not.toBeNull();
    newAccountId = curlResult.account!.id;
    expect(curlResult.account!.type).toBe(ParabankTestConstants.checkingAccountTypeLabel);
    expect(curlResult.account!.customerId).toBe(customerId);

    const fundBefore = await bankApi.getAccountById(fundAccountId);
    const newBefore = await bankApi.getAccountById(newAccountId);
    expect(fundBefore.account).not.toBeNull();
    expect(newBefore.account).not.toBeNull();
    fundBalanceBefore = fundBefore.account!.balance;
    newBalanceBefore = newBefore.account!.balance;
  });

  test('overview shows new CHECKING account', async ({
    registeredUser,
    loginPage,
    overviewPage,
  }) => {
    await loginPage.goto();
    await loginPage.login(registeredUser.username, registeredUser.password);
    await loginPage.expectLoggedIn();
    await overviewPage.goto();
    await overviewPage.expectAccountIdVisible(newAccountId);
  });

  test('transfer UI moves configured amount', async ({
    registeredUser,
    loginPage,
    transferPage,
  }) => {
    await loginPage.goto();
    await loginPage.login(registeredUser.username, registeredUser.password);
    await loginPage.expectLoggedIn();
    await transferPage.goto();
    await transferPage.transfer(
      fundAccountId,
      newAccountId,
      ParabankTestConstants.e2eTransferAmount,
    );
    await transferPage.expectTransferResult();
  });

  test('API balances reflect transfer', async ({ bankApi }) => {
    const amt = Number.parseFloat(ParabankTestConstants.e2eTransferAmount);
    const fromAfter = await bankApi.getAccountById(fundAccountId);
    const toAfter = await bankApi.getAccountById(newAccountId);
    expect(fromAfter.status).toBe(200);
    expect(toAfter.status).toBe(200);
    expect(fromAfter.account).not.toBeNull();
    expect(toAfter.account).not.toBeNull();
    expect(fromAfter.account!.balance).toBeCloseTo(fundBalanceBefore - amt, 2);
    expect(toAfter.account!.balance).toBeCloseTo(newBalanceBefore + amt, 2);
  });

  test('logout clears session', async ({ registeredUser, loginPage, logoutPage }) => {
    await loginPage.goto();
    await loginPage.login(registeredUser.username, registeredUser.password);
    await loginPage.expectLoggedIn();
    await logoutPage.logout();
    await logoutPage.expectLoggedOut();
  });
});

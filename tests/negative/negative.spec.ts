import { expect } from '../fixtures/bankFixture';
import { test } from '../fixtures/bankFixture';
import { ParabankTestConstants } from '../utils/parabankTestData';

test('login UI rejects unknown user', async ({ loginPage }) => {
  await loginPage.loginWithBrowserSubmit(`nonexistent_${Date.now()}`, 'wrong');
  await loginPage.expectLoginError();
});

test('API transfer rejects invalid account id', async ({ bankApi }) => {
  const res = await bankApi.transferFunds(
    0,
    ParabankTestConstants.seededDemoAccountId,
    ParabankTestConstants.apiProbeTransferAmount,
  );
  expect(res.status).toBe(400);
  expect(res.body).toContain('Could not find account');
});

test('API login returns no customer for bad password', async ({ bankApi }) => {
  const res = await bankApi.login(
    ParabankTestConstants.seededDemoUsername,
    ParabankTestConstants.wrongPassword,
  );
  expect(res.status).toBe(400);
  expect(res.customer).toBeNull();
  expect(res.text).toContain('Invalid username');
});

test('API customer accounts for unknown customer returns error', async ({ bankApi }) => {
  const res = await bankApi.getCustomerAccounts(ParabankTestConstants.unknownCustomerId);
  expect(res.status).toBe(400);
  expect(res.accounts.length).toBe(0);
});

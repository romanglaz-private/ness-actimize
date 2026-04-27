import type { APIRequestContext } from '@playwright/test';
import type { Account, Customer } from '../domain/types';

export class BankApi {
  private readonly acceptJson = { Accept: 'application/json' } as const;
  private readonly pathLoginPrefix = '/login/';
  private readonly pathCustomers = '/customers/';
  private readonly pathAccounts = '/accounts/';
  private readonly pathTransfer = '/transfer';
  private readonly suffixAccounts = '/accounts';

  constructor(
    private readonly request: APIRequestContext,
    private readonly apiBaseUrl: string,
  ) {}

  private url(path: string): string {
    const base = this.apiBaseUrl.replace(/\/$/, '');
    const p = path.startsWith('/') ? path : `/${path}`;
    return `${base}${p}`;
  }

  async login(username: string, password: string): Promise<{
    status: number;
    customer: Customer | null;
    text: string;
  }> {
    const u = encodeURIComponent(username);
    const p = encodeURIComponent(password);
    const res = await this.request.get(this.url(`${this.pathLoginPrefix}${u}/${p}`), {
      headers: this.acceptJson,
    });
    const status = res.status();
    const text = await res.text();
    let customer: Customer | null = null;
    if (status === 200 && text.length > 0 && text.trim().startsWith('{')) {
      try {
        customer = JSON.parse(text) as Customer;
      } catch {
        customer = null;
      }
    }
    return { status, customer, text };
  }

  async getCustomerAccounts(customerId: number): Promise<{
    status: number;
    accounts: Account[];
  }> {
    const res = await this.request.get(
      this.url(`${this.pathCustomers}${customerId}${this.suffixAccounts}`),
      { headers: this.acceptJson },
    );
    const status = res.status();
    const text = await res.text();
    if (status !== 200 || text.length === 0) {
      return { status, accounts: [] };
    }
    const parsed = JSON.parse(text) as unknown;
    const accounts = Array.isArray(parsed) ? (parsed as Account[]) : [];
    return { status, accounts };
  }

  async getAccountById(accountId: number): Promise<{
    status: number;
    account: Account | null;
  }> {
    const res = await this.request.get(this.url(`${this.pathAccounts}${accountId}`), {
      headers: this.acceptJson,
    });
    const status = res.status();
    const text = await res.text();
    if (status !== 200 || !text.trim().startsWith('{')) {
      return { status, account: null };
    }
    const account = JSON.parse(text) as Account;
    return { status, account };
  }

  async transferFunds(
    fromAccountId: number,
    toAccountId: number,
    amount: string,
  ): Promise<{ status: number; body: string }> {
    const search = new URLSearchParams({
      fromAccountId: String(fromAccountId),
      toAccountId: String(toAccountId),
      amount,
    });
    const res = await this.request.post(this.url(`${this.pathTransfer}?${search.toString()}`), {
      headers: this.acceptJson,
    });
    return { status: res.status(), body: await res.text() };
  }
}

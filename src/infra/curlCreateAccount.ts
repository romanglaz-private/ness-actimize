import type { Account } from '../domain/types';
import { execCurlSync } from './cmdCommands';

export const PARABANK_NEW_ACCOUNT_TYPE_CHECKING = 0 as const;

export type CreateCheckingAccountCurlParams = {
  apiBaseUrl: string;
  customerId: number;
  fromAccountId: number;
  newAccountType: typeof PARABANK_NEW_ACCOUNT_TYPE_CHECKING;
};

export type CreateCheckingAccountCurlResult = {
  statusCode: number;
  body: string;
  account: Account | null;
};

function buildCreateAccountUrl(
  apiBaseUrl: string,
  customerId: number,
  fromAccountId: number,
  newAccountType: number,
): string {
  const base = apiBaseUrl.replace(/\/$/, '');
  const search = new URLSearchParams({
    customerId: String(customerId),
    newAccountType: String(newAccountType),
    fromAccountId: String(fromAccountId),
  });
  return `${base}/createAccount?${search.toString()}`;
}

export class CurlCreateAccountClient {
  execute(params: CreateCheckingAccountCurlParams): CreateCheckingAccountCurlResult {
    const url = buildCreateAccountUrl(
      params.apiBaseUrl,
      params.customerId,
      params.fromAccountId,
      params.newAccountType,
    );
    const { statusCode, body } = execCurlSync([
      '-X',
      'POST',
      '-H',
      'Accept: application/json',
      url,
    ]);
    let account: Account | null = null;
    if (statusCode >= 200 && statusCode < 300 && body.length > 0) {
      try {
        const parsed = JSON.parse(body) as unknown;
        if (
          typeof parsed === 'object' &&
          parsed !== null &&
          'id' in parsed &&
          'customerId' in parsed &&
          'type' in parsed &&
          'balance' in parsed
        ) {
          account = parsed as Account;
        }
      } catch {
        account = null;
      }
    }
    return { statusCode, body, account };
  }
}

export function createCheckingAccountViaCurl(
  params: CreateCheckingAccountCurlParams,
): CreateCheckingAccountCurlResult {
  return new CurlCreateAccountClient().execute(params);
}

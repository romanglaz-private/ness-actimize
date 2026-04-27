export const DEFAULT_APP_BASE_URL = 'https://parabank.parasoft.com/parabank/';

export const DEFAULT_API_BASE_URL =
  'https://parabank.parasoft.com/parabank/services/bank';

export function appBaseUrl(): string {
  const raw = process.env.BASE_URL ?? DEFAULT_APP_BASE_URL;
  return raw.endsWith('/') ? raw : `${raw}/`;
}

export function apiBaseUrl(): string {
  return process.env.API_BASE_URL ?? DEFAULT_API_BASE_URL;
}

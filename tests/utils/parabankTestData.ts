import { randomBytes } from 'node:crypto';
import type { Account } from '../../src/domain/types';
import type { RegisterFormData } from '../../src/pages/registerPage';

export class ParabankTestConstants {
  static readonly defaultCity = 'Beverly Hills';
  static readonly defaultState = 'CA';
  static readonly defaultZip = '90210';
  static readonly phoneArea = '310-555-';
  static readonly streetSuffix = ' Oak Ave';
  static readonly streetNumberMin = 10000;
  static readonly streetNumberRange = 89999;
  static readonly e2eTransferAmount = '5.00';
  static readonly seededDemoUsername = 'john';
  static readonly seededDemoAccountId = 12567;
  static readonly unknownCustomerId = 999999999;
  static readonly apiProbeTransferAmount = '1.00';
  static readonly wrongPassword = 'notdemo';
  static readonly checkingAccountTypeLabel = 'CHECKING';
}

export function randomDigits(len: number): string {
  let s = '';
  for (let i = 0; i < len; i += 1) {
    s += String(Math.floor(Math.random() * 10));
  }
  return s;
}

export function uniqueUsername(): string {
  return `a${randomBytes(6).toString('hex')}`;
}

export function randomFirstName(): string {
  return `Play${randomDigits(4)}`;
}

export function randomLastName(): string {
  return `Wright${randomDigits(4)}`;
}

export function randomStreet(): string {
  const n =
    ParabankTestConstants.streetNumberMin +
    Math.floor(Math.random() * ParabankTestConstants.streetNumberRange);
  return `${n}${ParabankTestConstants.streetSuffix}`;
}

export function randomPhoneNumber(): string {
  return `${ParabankTestConstants.phoneArea}${randomDigits(4)}`;
}

export function randomSsn(): string {
  return `${randomDigits(3)}-${randomDigits(2)}-${randomDigits(4)}`;
}

export function defaultRegistrationPassword(): string {
  return 'test';
}

export function buildRandomRegistrationData(): RegisterFormData {
  return {
    firstName: randomFirstName(),
    lastName: randomLastName(),
    street: randomStreet(),
    city: ParabankTestConstants.defaultCity,
    state: ParabankTestConstants.defaultState,
    zipCode: ParabankTestConstants.defaultZip,
    phoneNumber: randomPhoneNumber(),
    ssn: randomSsn(),
    username: uniqueUsername(),
    password: defaultRegistrationPassword(),
  };
}

export function pickFundAccount(accounts: Account[]): Account {
  const checking = accounts.filter(
    (a) => a.type === ParabankTestConstants.checkingAccountTypeLabel,
  );
  const pool = checking.length > 0 ? checking : accounts;
  return pool.reduce((best, a) => (a.balance > best.balance ? a : best), pool[0]);
}

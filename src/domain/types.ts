export type Address = {
  street: string;
  city: string;
  state: string;
  zipCode: string;
};

export type Customer = {
  id: number;
  firstName: string;
  lastName: string;
  address: Address;
  phoneNumber: string;
  ssn: string;
};

export type Account = {
  id: number;
  customerId: number;
  type: 'CHECKING' | 'SAVINGS' | 'LOAN';
  balance: number;
};

export type RegisteredUser = {
  username: string;
  password: string;
};

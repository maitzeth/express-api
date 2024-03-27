export type Product = {
  title: string;
  price: number;
  owner: string;
  description: string;
};

export type User = {
  id: string;
  username: string;
  email: string;
  password: string;
};

export type AuthUser = Pick<User, 'username' | 'password' | 'email'>;

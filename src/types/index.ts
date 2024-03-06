export type Product = {
  id: string;
  title: string;
  price: number;
};

export type User = {
  id: string;
  username: string;
  email: string;
  password: string;
};

export type AuthUser = {
  username: string;
  password: string;
  email: string;
};

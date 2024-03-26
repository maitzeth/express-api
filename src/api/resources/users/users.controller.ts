import UserModel from './users.model';
import { AuthUser } from '@/types';

export function getUsers() {
  return UserModel.find();
};

export function createUser(user: AuthUser, hashedPassword: string) {
  const newUser = { ...user, password: hashedPassword };
  return new UserModel(newUser).save();
};

export async function userExists(username: string, email: string) {
  // Modify to return true/false
  const users = await UserModel.find().or([{ username }, { email }]);
  return users.length > 0;
};

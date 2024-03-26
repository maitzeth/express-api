import UserModel from './users.model';
import { AuthUser, User } from '@/types';

export function getUsers() {
  return UserModel.find({});
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

export async function getUser({ id, username }: Partial<Pick<User, 'username' | 'id'>>) {
  if (username) {
    return UserModel.findOne({ username });
  }

  if (id) {
    return UserModel.findById(id);
  }

  throw new Error('Invalid query');
}

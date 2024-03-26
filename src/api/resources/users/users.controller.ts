import UserModel from './users.model';
// import { Product } from '@/types';

export function getUsers() {
  return UserModel.find();
};

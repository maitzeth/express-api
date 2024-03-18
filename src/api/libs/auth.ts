import { users } from '@/database'; 
import bcrypt from 'bcrypt';

export default (username: string, password: string, done: (error: any, user?: any) => void) => {
  const user = users.find((user) => user.username === username);

  if (!user) {
    return done(null, false);
  }

  const hashedPassword = user.password;
  bcrypt.compare(password, hashedPassword, (err, res) => {
    if (res) {
      return done(null, user);
    } else {
      return done(null, false);
    }
  });
}
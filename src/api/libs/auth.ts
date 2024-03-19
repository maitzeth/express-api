import { users } from '@/database'; 
import bcrypt from 'bcrypt';

export default (username: string, password: string, done: (error: any, user?: any) => void) => {
  const user = users.find((user) => user.username === username);

  if (!user) {
    return done(null, false);
  }

  const hashedPassword = user.password;
  bcrypt.compare(password, hashedPassword, (err, res) => {
    if (err) {
      return done(err);
    }

    if (res) {
      return done(null, user);
    }
    
    return done(null, false);
  });
}
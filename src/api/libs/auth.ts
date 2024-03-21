import { users } from '@/database'; 
import bcrypt from 'bcrypt';
import { Strategy } from 'passport-jwt';
import { logger } from '@/utils/logger';

const jwtOptions = {
  
}

const JwtStrategy = new Strategy({}, (jwtPayload, done) => {
  const user = users.find((user) => user.id === jwtPayload.id);

  if (user) {
    return done(null, user);
  }

  logger.info(`User not found: ${jwtPayload.id}`);
  return done(null, false);
});

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
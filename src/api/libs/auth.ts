import { users } from '@/database'; 
import dotenv from "dotenv";
import { ExtractJwt, StrategyOptions, Strategy } from 'passport-jwt';
import passport from 'passport';

import { logger } from '@/utils/logger';

dotenv.config();

const jwtOptions = {
  secretOrKey: process.env.JWT_SECRET,
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken()
} as StrategyOptions;

// @ts-ignore
export const jwtStrategy = new Strategy(jwtOptions, (jwtPayload, done) => {
  const user = users.find((user) => user.id === jwtPayload.id);
  
  if (user) {
    logger.info(`User found: Payload: ${JSON.stringify(jwtPayload)}, user: ${JSON.stringify(user)}`);
    return done(null, {
      id: user.id,
      username: user.username,
    });
  }

  logger.info(`User not found: ${JSON.stringify(jwtPayload)}`);
  return done(null, false);
});

export const jwtAuth = passport.authenticate('jwt', { session: false });

import { getUser } from '@/api/resources/users/users.controller';
import { logger } from '@/utils/logger';
import dotenv from "dotenv";
import { MongooseError } from 'mongoose';
import passport from 'passport';
import { ExtractJwt, Strategy, StrategyOptions } from 'passport-jwt';

dotenv.config();

const jwtOptions = {
  secretOrKey: process.env.JWT_SECRET,
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken()
} as StrategyOptions;

// @ts-ignore
export const jwtStrategy = new Strategy(jwtOptions, async (jwtPayload, done) => {
  try {
    const user = await getUser({ id: jwtPayload.id });
  
    if (user) {
      const { _id, username } = user.toObject();
      logger.info(`User found: Payload: ${JSON.stringify(jwtPayload)}, user: ${JSON.stringify(username)}`);


      return done(null, {
        id: _id,
        username
      });
    }

    logger.info(`User not found: ${JSON.stringify(jwtPayload)}`);
    return done(null, false);
  } catch (err) {
    const error = err as MongooseError;
    logger.error(`Error in jwtStrategy: ${error}`);
    done(null, false);
  }
});

export const jwtAuth = passport.authenticate('jwt', { session: false });

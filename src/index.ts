import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";

import bodyParser from 'body-parser';
import productsRouter from "@/api/resources/products/products.routes";
import usersRouter from '@/api/resources/users/users.routes';

import morganMiddleware from "@/middleware/morgan.middleware";
import { logger } from '@/utils/logger';

// Passport Strategy
import passport from 'passport';
import { BasicStrategy } from 'passport-http';

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3000;

// ✅ Register the bodyParser middleware here
app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true,
  }),
);
// ⚠️ Add a request logger middleware here
app.use(morganMiddleware);

// Passport Strategy
passport.use(new BasicStrategy(
  (username, password, done) => {
    if (username === 'admin' && password === 'admin') {
      return done(null, true);
    }
    return done(null, false);
  }
));
app.use(passport.initialize());

app.use('/products', productsRouter);
app.use('/users', usersRouter);

app.get("/", passport.authenticate('basic', { session: false }), (req: Request, res: Response) => {
  res.send("API de vendetusperetos");
});

app.listen(port, () => {
  logger.info(`[server]: Server is running at http://localhost:${port}`);
});
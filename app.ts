import express, { Express } from "express";
import dotenv from "dotenv";
import bodyParser from 'body-parser';
import { processBodySizeMiddleware } from '@src/api/resources/products/products.validate';

// Resources
import productsRouter from "@src/api/resources/products/products.routes";
import usersRouter from '@src/api/resources/users/users.routes';

// Logger
import morganMiddleware from "@src/middleware/morgan.middleware";
import { logger } from '@src/utils/logger';

// Passport Strategy
import passport from 'passport';
import { jwtStrategy } from '@src/api/libs/auth';

// MongoDB
import mongoose from 'mongoose';

dotenv.config();

// MongoDB
mongoose.connect(process.env.MONGO_URI as string, { dbName: process.env.DB_NAME });
mongoose.connection.on('error', (error) => {
  logger.error(`[server]: MongoDB connection error: ${error}`);
  process.exit(1);
});

export const app: Express = express();
const port = process.env.PORT || 3000;

// ✅ Register the bodyParser middleware here
app.use(bodyParser.json());
app.use(bodyParser.raw({
  type: 'image/*',
  limit: '1mb', // Maximum allowed size of image in bytes
}));
app.use(
  bodyParser.urlencoded({
    extended: true,
  }),
);
app.use(processBodySizeMiddleware);
// ⚠️ Add a request logger middleware here
app.use(morganMiddleware);

// Passport Strategy
passport.use(jwtStrategy);
app.use(passport.initialize());

app.use('/products', productsRouter);
app.use('/users', usersRouter);

export const server = app.listen(port, () => {
  logger.info(`[server]: Server is running at http://localhost:${port}`);
});
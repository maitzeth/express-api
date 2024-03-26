import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import bodyParser from 'body-parser';

// Resources
import productsRouter from "@/api/resources/products/products.routes";
import usersRouter from '@/api/resources/users/users.routes';

// Logger
import morganMiddleware from "@/middleware/morgan.middleware";
import { logger } from '@/utils/logger';

// Passport Strategy
import passport from 'passport';
import { jwtStrategy } from '@/api/libs/auth';

// MongoDB
import mongoose from 'mongoose';

dotenv.config();

// MongoDB
mongoose.connect(process.env.MONGO_URI as string, { dbName: process.env.DB_NAME });
mongoose.connection.on('error', (error) => {
  logger.error(`[server]: MongoDB connection error: ${error}`);
  process.exit(1);
});

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
passport.use(jwtStrategy);
app.use(passport.initialize());

app.use('/products', productsRouter);
app.use('/users', usersRouter);

app.listen(port, () => {
  logger.info(`[server]: Server is running at http://localhost:${port}`);
});
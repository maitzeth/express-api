import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";

import bodyParser from 'body-parser';
import productsRouter from "./api/resources/products/products.routes";
import morganMiddleware from "./middleware/morgan.middleware";
import { logger } from './utils/logger';

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

app.use('/products', productsRouter);

app.get("/", (req: Request, res: Response) => {
  res.send("Express + TypeScript Server");
});

app.listen(port, () => {
  logger.info(`[server]: Server is running at http://localhost:${port}`);
});
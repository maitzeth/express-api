import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";

import bodyParser from 'body-parser';
import productsRouter from "./api/resources/products/products.routes";

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

app.use('/products', productsRouter);

app.get("/", (req: Request, res: Response) => {
  res.send("Express + TypeScript Server");
});

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});
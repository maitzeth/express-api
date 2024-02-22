import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import { v4 as uuidv4 } from 'uuid';
import bodyParser from 'body-parser';

import { Product } from './types';
import products from './data.json';

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

app.route('/products')
  .get((req: Request, res: Response) => {
    res.json(products);
  })
  .post((req: Request, res: Response) => {
    const { title, price } = req.body as Product;

    if (!title || !price) {
      return res.status(400).json({ message: 'Invalid request body' });
    }

    // Generate a unique id for this product
    const id = uuidv4();
    const newProduct = { id, title, price } satisfies Product;

    res.status(201).json([...products, newProduct]);
  })

app.get('/products/:id', (req: Request, res: Response) => {
  const id = req.params.id;
  const product = products.find((product) => product.id === id);

  if (product) {
    return res.json(product);
  }

  return res.status(404).json({ message: `Product not found on ${id}` });
});

app.get("/", (req: Request, res: Response) => {
  res.send("Express + TypeScript Server");
});

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});
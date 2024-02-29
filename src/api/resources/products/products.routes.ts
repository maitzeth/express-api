import express, { Express, Request, Response } from "express";
import products from "../../../data.json";
import { v4 as uuidv4 } from 'uuid';
import { Product } from '../../../types';

const productsRouter = express.Router();

// Get all products
productsRouter.get('/', (req: Request, res: Response) => {
  res.json(products);
});

// Create a new product
productsRouter.post('/', (req: Request, res: Response) => {
  const { title, price } = req.body as Product;

  if (!title || !price) {
    return res.status(400).json({ message: 'Invalid request body' });
  }

  // Generate a unique id for this product
  const id = uuidv4();
  const newProduct = { id, title, price } satisfies Product;

  res.status(201).json([...products, newProduct]);
});

// Get the product with the given ID
productsRouter.get('/:id', (req: Request, res: Response) => {
  const id = req.params.id;
  const product = products.find((product) => product.id === id);

  if (product) {
    return res.json(product);
  }

  return res.status(404).json({ message: `Product not found on ${id}` });
});

// Update the product with the given ID
productsRouter.put('/:id', (req: Request, res: Response) => {
  const id = req.params.id;
  const { title, price } = req.body as Product;

  const updatedProducts = products.map((product) => {
    if (product.id === id) {
      return {
        ...product,
        ...(title && { title }),
        ...(price && { price }),
      };
    }

    return product;
  });

  res.status(200).json(updatedProducts);
});

// Delete the product with the given ID
productsRouter.delete('/:id', (req: Request, res: Response) => {
  const id = req.params.id;

  // Devuelvo JSON con producto borrado
  const deletedProduct = products.find((product) => product.id === id);

  res.status(200).json(deletedProduct);
});

export default productsRouter;

import express, { NextFunction, Request, Response } from "express";
import products from "../../../data.json";
import { v4 as uuidv4 } from 'uuid';
import { Product } from '../../../types';
import { validateProductMiddleware } from './products.validate';
import { logger } from '../../../utils/logger';

const productsRouter = express.Router();

// Get all products
productsRouter.get('/', (req: Request, res: Response) => {
  res.json(products);
});

// Create a new product
productsRouter.post('/', validateProductMiddleware, (req: Request, res: Response) => {
  const productBody = req.body as Product;
  const { price, title } = productBody;

  const id = uuidv4();
  const newProduct = { id, title, price } satisfies Product;
  // logger the new product
  logger.info(`New product created: ${JSON.stringify(newProduct)}`);
  res.status(201).json([...products, newProduct]);
});

// Get the product with the given ID
productsRouter.get('/:id', (req: Request, res: Response) => {
  const id = req.params.id;
  const product = products.find((product) => product.id === id);

  if (product) {
    return res.status(200).json(product);
  }

  return res.status(404).json({ message: [`Product not found`] });
});

// Update the product with the given ID
productsRouter.put('/:id', validateProductMiddleware, (req: Request, res: Response) => {
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

  logger.info(`Product updated: ${updatedProducts} with id: ${id}`);

  res.status(200).json(updatedProducts);
});

// Delete the product with the given ID
productsRouter.delete('/:id', (req: Request, res: Response) => {
  const id = req.params.id;

  // Devuelvo JSON con producto borrado
  const deletedProduct = products.find((product) => product.id === id);

  if (!deletedProduct) {
    logger.info(`Product not found with id: ${id}`);
    return res.status(404).json({ message: [`Product not found with id: ${id}`] });
  }

  res.status(200).json(deletedProduct);
});

export default productsRouter;

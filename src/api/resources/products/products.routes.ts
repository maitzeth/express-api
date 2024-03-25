import express, { Request, Response } from "express";
import products from "@/data.json";
import { Product, User } from '@/types';
import { validateProductMiddleware } from './products.validate';
import { logger } from '@/utils/logger';
import { jwtAuth } from '@/api/libs/auth';
import { createProduct, getProducts } from './products.controller';
import { MongooseError } from 'mongoose';

const productsRouter = express.Router();

const withErrorHandling = (handler: (req: Request, res: Response) => Promise<void>) => {
  return async (req: Request, res: Response) => {
    try {
      await handler(req, res);
    } catch (err) {
      const error = err as MongooseError;
      logger.error(`Error creating product: ${error.message}`);
      res.status(500).json({ messages: [`Error creating product`] });
    }
  };
};

// Get all products
productsRouter.get('/', withErrorHandling(async (req: Request, res: Response) => {
  const products = await getProducts()
  res.status(200).json(products);
}));

// Create a new product
productsRouter.post('/', [jwtAuth, validateProductMiddleware], withErrorHandling(async (req: Request, res: Response) => {
  const productBody = req.body as Product;
  const userRequest = req.user as Pick<User, 'username'>;
  const { price, title, description } = productBody;

  const newProduct = {
    title,
    price,
    owner: userRequest.username,
    description,
  } satisfies Product;
  const response = await createProduct(newProduct);

  logger.info(`New product created: ${JSON.stringify(newProduct)}`);
  res.status(201).json(response);
}));

// Get the product with the given ID
productsRouter.get('/:id', (req: Request, res: Response) => {
  const id = req.params.id;
  const product = products.find((product) => product.id === id);

  if (product) {
    return res.status(200).json(product);
  }

  return res.status(404).json({ messages: [`Product not found`] });
});

// Update the product with the given ID
productsRouter.put('/:id', [jwtAuth, validateProductMiddleware], (req: Request, res: Response) => {
  const id = req.params.id;
  const { title, price, description } = req.body as Product;
  const userRequest = req.user as Pick<User, 'id' | 'username'>;

  // TODO UPDATE THE PRODUCT IF YOU ARE THE OWNER OR RETURN 
  const updatedProducts = products.map((product) => {
    if (product.id === id && product.owner === userRequest.username) {
      return {
        ...product,
        price,
        title,
        description,
      } satisfies Product;
    }

    return product;
  });

  logger.info(`Product updated: ${updatedProducts} with id: ${id}`);

  res.status(200).json(updatedProducts);
});

// Delete the product with the given ID
productsRouter.delete('/:id', jwtAuth, (req: Request, res: Response) => {
  const id = req.params.id;

  // TODO UPDATE THE PRODUCT IF YOU ARE THE OWNER OR RETURN

  // Devuelvo JSON con producto borrado
  const deletedProduct = products.find((product) => product.id === id);

  if (!deletedProduct) {
    logger.info(`Product not found with id: ${id}`);
    return res.status(404).json({ messages: [`Product not found with id: ${id}`] });
  }

  res.status(200).json(deletedProduct);
});

export default productsRouter;

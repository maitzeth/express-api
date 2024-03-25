import express, { Request, Response } from "express";
import products from "@/data.json";
import { v4 as uuidv4 } from 'uuid';
import { Product, User } from '@/types';
import { validateProductMiddleware } from './products.validate';
import { logger } from '@/utils/logger';
import { jwtAuth } from '@/api/libs/auth';

const productsRouter = express.Router();

// Get all products
productsRouter.get('/', (req: Request, res: Response) => {
  res.json(products);
});

// Create a new product
productsRouter.post('/', [jwtAuth, validateProductMiddleware], (req: Request, res: Response) => {
  const productBody = req.body as Product;
  const userRequest = req.user as Pick<User, 'id' | 'username'>;
  const { price, title } = productBody;

  const newProduct = {
    id: uuidv4(),
    title,
    price,
    owner: userRequest.username,
  } satisfies Product;
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

  return res.status(404).json({ messages: [`Product not found`] });
});

// Update the product with the given ID
productsRouter.put('/:id', [jwtAuth, validateProductMiddleware], (req: Request, res: Response) => {
  const id = req.params.id;
  const { title, price } = req.body as Product;
  const userRequest = req.user as Pick<User, 'id' | 'username'>;

  // TODO UPDATE THE PRODUCT IF YOU ARE THE OWNER OR RETURN 
  const updatedProducts = products.map((product) => {
    if (product.id === id && product.owner === userRequest.username) {
      return {
        ...product,
        price,
        title,
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

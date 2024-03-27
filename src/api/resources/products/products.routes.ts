import { jwtAuth } from '@src/api/libs/auth';
import { Product, User } from '@src/types';
import { withErrorHandling } from '@src/utils';
import { logger } from '@src/utils/logger';
import express, { Request, Response } from "express";
import {
  createProduct,
  deleteProductById,
  getProductById,
  getProducts,
  updateProductById
} from './products.controller';
import {
  validateIdMiddleware,
  validateProductMiddleware,
} from './products.validate';

const productsRouter = express.Router();

// Get all products
productsRouter.get('/', withErrorHandling(async (_req: Request, res: Response) => {
  const products = await getProducts()
  res.status(200).json(products);
}, 'Error getting products'));

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
}, 'Error creating product', false));

// Get the product with the given ID
productsRouter.get('/:id', validateIdMiddleware, withErrorHandling(async (req: Request, res: Response) => {
  const id = req.params.id;

  const product = await getProductById(id);

  if (product) {
    res.status(200).json(product);
  } else {
    logger.error(`Product with id ${id} not found`);
    res.status(404).json({ messages: [`Product doesnt exists`] });
  }
}, 'Error getting product by id', false));

// Update the product with the given ID
productsRouter.put('/:id', [jwtAuth, validateProductMiddleware], withErrorHandling(async (req: Request, res: Response) => {
  const id = req.params.id;
  const { title, price, description } = req.body as Product;
  const userRequest = req.user as Pick<User, 'username'>;

  const selectedProduct = await getProductById(id);

  if (selectedProduct) {
    if (selectedProduct.owner === userRequest.username) {

      const newProduct = {
        owner: userRequest.username,
        price,
        title,
        description,
      } satisfies Product;

      const response = await updateProductById(id, newProduct);

      logger.info(`Product updated: ${JSON.stringify(newProduct)} with id: ${id}`);
      res.status(200).json(response);
    } else {
      res.status(403).json({ messages: [`You are not the owner of the product`] });
    }
  } else {
    logger.error(`Product with id ${id} not found`);
    res.status(404).json({ messages: [`Product doesnt exists`] });
  }
}));

// Delete the product with the given ID
productsRouter.delete('/:id', jwtAuth, withErrorHandling( async(req: Request, res: Response) => {
  const id = req.params.id;
  const userRequest = req.user as Pick<User, 'username'>;
  
  const product = await getProductById(id);

  if (product) {
    if (product.owner === userRequest.username) {
      await deleteProductById(id);

      res.status(200).json(product);
    } else {
      res.status(403).json({ messages: [`You are not the owner of the product`] });
    }
  } else {
    logger.error(`Product with id ${id} not found`);
    res.status(404).json({ messages: [`Product doesnt exists`] });
  }
}, 'Error deleting product by id', false));

export default productsRouter;

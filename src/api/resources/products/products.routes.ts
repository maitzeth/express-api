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
  updateProductById,
  saveImageUrl
} from './products.controller';
import {
  validateIdMiddleware,
  validateProductMiddleware,
  validateProductImage,
} from './products.validate';
import { saveImage } from '@src/api/data/images.controller';
import { v4 } from 'uuid';

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

// Upload image
productsRouter.put('/:id/image', [jwtAuth, validateProductImage], withErrorHandling(async (req: Request, res: Response) => {
  const productId = req.params.id as string;
  const username = (req.user as User).username;
  const userId = (req.user as User).id;

  logger.info(`Image uploaded for product with id: ${productId} by user: ${username}`);

  const product = await getProductById(productId);

  if (product) {
    // @ts-ignore
    const fileName = `${v4()}.${req.fileExtension}`;
    const s3FileData = {
      fileName: fileName,
      fileData: req.body,
      productName: product.title.split(' ').join('-').toLowerCase().trim(),
      userId: userId.toString(),
    };

    const s3SaveImageRes = await saveImage(s3FileData);

    if (s3SaveImageRes) {
      const url = `https://maitzeth-express.s3.amazonaws.com/images/${s3FileData.userId}/${s3FileData.productName}/${s3FileData.fileName}`;
  
      const saveImageResponse = await saveImageUrl(productId, url);
      
      if (saveImageResponse) {
        logger.info(`Image uploaded for product with id: ${productId}`);
        res.status(200).json(saveImageResponse);
      } else {
        logger.error(`Error saving image im DataBase for product with id: ${productId}`);
        res.status(500).json({ messages: [`Error saving image`] });
      }
    } else {
      logger.error(`Error saving image in S3 for product with id: ${productId}`);
      res.status(500).json({ messages: [`Error saving image`] });
    }
  } else {
    logger.error(`Product with id ${productId} not found`);
    res.status(404).json({ messages: [`Product doesnt exists`] });
  }
}));

export default productsRouter;

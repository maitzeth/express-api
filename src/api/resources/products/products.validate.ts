import { NextFunction, Request, Response } from "express";
import { Product } from '@src/types';
import { logger } from '@src/utils/logger';
import { z } from "zod";
import { errorMessagesParser } from '@src/utils';

// had to use this import to fix the issue with fileType not being recognized by typescript
const fileType = require('file-type');

// Blueprint
const bluePrintProduct = z.object({
  title: z.string({
    required_error: "Title is required",
    invalid_type_error: "Title must be a string",
  }).max(100),
  price: z.number({
    required_error: "Price is required",
    invalid_type_error: "Price must be a number",
  }).positive(),
  description: z.string({
    required_error: "Description is required",
    invalid_type_error: "Description must be a string",
  }).max(500),
}).required({
  title: true,
  price: true,
  description: true,
});

export const validateProductMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  const productBody = req.body as Product;

  const result = await bluePrintProduct.safeParseAsync(productBody);

  if (!result.success) {
    const formattedErrors = errorMessagesParser(result.error.issues);
    
    return res.status(400).json({ messages: formattedErrors });
  }

  return next();
}

export const validateIdMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  const id = req.params.id;

  if (!id?.match(/^[0-9a-fA-F]{24}$/)) {
    return res.status(400).json({ messages: ["Invalid ID"] });
  }

  return next();
};

export const processBodySizeMiddleware = (err: any, req: Request, res: Response, next: NextFunction ) => {
  if (err.status === 413) {
    const message = `Request body is too large [${req.path}], limit is [${err.limit / 1024}MB] and you file size is [${(err.length / 1024).toFixed(0)}MB]`;
    logger.error(message);
    res.status(413).json({ messages: [`${message}`] });
  }

  next(err);
};

export const validateProductImage = async (req: Request, res: Response, next: NextFunction) => {
  const allowedContentType = ['image/png', 'image/jpeg', 'image/jpg'];
  const contentType = req.get('content-type');

  if (!contentType || !allowedContentType.includes(contentType)) {
    const message = `Only image file with format ${allowedContentType.join(', ')} is allowed`;
    logger.error(message);
    res.status(400).json({ messages: [message] });
  }

  const bufferType = await fileType.fromBuffer(req.body);

  if (bufferType && !allowedContentType.includes(bufferType.mime)) {
    const message = `Come on bro... are you trying to hack me? Only image file with format ${allowedContentType.join(', ')} is allowed`;
    logger.error(message);
    res.status(400).json({ messages: [message] });
  }

  // @ts-ignore
  req.fileExtension = bufferType?.ext;

  next();
};

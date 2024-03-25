import { NextFunction, Request, Response } from "express";
import { Product } from '@/types';

import { z } from "zod";
import { errorMessagesParser } from '@/utils';

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

  next();
}

export const validateIdMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  const id = req.params.id;

  if (!id.match(/^[0-9a-fA-F]{24}$/)) {
    return res.status(400).json({ messages: ["Invalid ID"] });
  }

  next();
};

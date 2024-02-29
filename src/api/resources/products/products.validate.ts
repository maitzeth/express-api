import { NextFunction, Request, Response } from "express";
import { Product } from '../../../types';

import { z } from "zod";
import { errorHandler } from '../../../utils';

// Blueprint
const pluePrintProduct = z.object({
  title: z.string({
    required_error: "Title is required",
    invalid_type_error: "Title must be a string",
  }).max(100),
  price: z.number({
    required_error: "Price is required",
    invalid_type_error: "Price must be a number",
  }).positive(),
}).required({
  title: true,
  price: true,
});

export const validateProductMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  const productBody = req.body as Product;

  const result = await pluePrintProduct.safeParseAsync(productBody);

  if (!result.success) {
    const formattedErrors = errorHandler(result.error.issues);
    
    return res.status(400).json({ message: formattedErrors });
  }

  next();
}

import { NextFunction, Request, Response } from "express";

import { z } from "zod";
import { errorHandler } from '@/utils';

const alphanumericRegex = /^[a-zA-Z0-9]+$/;

// Blueprint
const bluePrintUser = z.object({
  username: z.string({
    required_error: "Username is required",
    invalid_type_error: "Username must be a string",
  }).min(3).max(30).regex(alphanumericRegex),
  password: z.string({
    required_error: "Password is required",
    invalid_type_error: "Password must be a string",
  }).min(6).max(200),
  email: z.string({
    required_error: "Email is required",
    invalid_type_error: "Email must be a string",
  }).email(),
}).required({
  username: true,
  password: true,
  email: true,
});

export const userAuthMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  const result = await bluePrintUser.safeParseAsync(req.body);

  if (!result.success) {
    const formattedErrors = errorHandler(result.error.issues);
    return res.status(400).json({ message: formattedErrors });
  }

  return next();
}

import { NextFunction, Request, Response } from "express";

import { z } from "zod";
import { errorMessagesParser } from '@/utils';

const alphanumericRegex = /^[a-zA-Z0-9]+$/;

const USERNAME_REQUIRED_MSG = {
  required_error: "Username is required",
  invalid_type_error: "Username must be a string"
};

const PASSWORD_REQUIRED_MSG = {
  required_error: "Password is required",
  invalid_type_error: "Password must be a string"
};

const EMAIL_REQUIRED_MSG = {
  required_error: "Email is required",
  invalid_type_error: "Email must be a string"
};

// Create User Blueprint
const bluePrintUser = z.object({
  username: z.string(USERNAME_REQUIRED_MSG).min(3, { message: 'Username must be 3 or more characters long' }).max(30).regex(alphanumericRegex),
  password: z.string(PASSWORD_REQUIRED_MSG).min(6, { message: 'Password must be 6 or more characters long' }).max(200),
  email: z.string(EMAIL_REQUIRED_MSG).email(),
}).required({
  username: true,
  password: true,
  email: true
});

export const userAuthMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  const result = await bluePrintUser.safeParseAsync(req.body);

  if (!result.success) {
    const formattedErrors = errorMessagesParser(result.error.issues);
    return res.status(400).json({ messages: formattedErrors });
  }

  return next();
};

// Login
const blueprintLogin = z.object({
  username: z.string(USERNAME_REQUIRED_MSG).min(3),
  password: z.string(EMAIL_REQUIRED_MSG).min(6),
}).required({
  username: true,
  password: true
});

export const loginMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  const result = await blueprintLogin.safeParseAsync(req.body);
  
  if(!result.success) {
    const formattedErrors = errorMessagesParser(result.error.issues);
    return res.status(400).json({ messages: formattedErrors });
  }

  return next();
};

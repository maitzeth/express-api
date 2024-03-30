import { NextFunction, Request, Response } from "express";

import { z } from "zod";
import { errorMessagesParser } from '@src/utils';

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

const USERNAME_LENGTH_MSG = 'Username must be 3 or more characters long';
const PASSWORD_LENGTH_MSG = 'Password must be 6 or more characters long';
const ALPHANUMERIC_USERNAME_MSG = 'Username must be alphanumeric';

// Create User Blueprint
const bluePrintUser = z.object({
  username: z.string(USERNAME_REQUIRED_MSG).min(3, { message: USERNAME_LENGTH_MSG }).max(30).regex(alphanumericRegex, { message: ALPHANUMERIC_USERNAME_MSG }),
  password: z.string(PASSWORD_REQUIRED_MSG).min(6, { message: PASSWORD_LENGTH_MSG }).max(200),
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

// ============ Login ==================
const blueprintLogin = z.object({
  username: z.string(USERNAME_REQUIRED_MSG).min(3, { message: USERNAME_LENGTH_MSG }).regex(alphanumericRegex, { message: ALPHANUMERIC_USERNAME_MSG }),
  password: z.string(PASSWORD_REQUIRED_MSG).min(6, { message: PASSWORD_LENGTH_MSG }),
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

export const parseBodyToLowerCase = (req: Request, _res: Response, next: NextFunction) => {
  req.body.username && (req.body.username = req.body.username.toLowerCase());
  req.body.email && (req.body.email = req.body.email.toLowerCase());

  return next();
}

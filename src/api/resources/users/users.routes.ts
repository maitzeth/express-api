import { AuthUser } from '@src/types';
import { withErrorHandling } from '@src/utils';
import { logger } from '@src/utils/logger';
import bcrypt from 'bcrypt';
import express, { Request, Response } from "express";
import jwt from 'jsonwebtoken';
import { createUser, getUser, getUsers, userExists } from './users.controller';
import { loginMiddleware, parseBodyToLowerCase, userAuthMiddleware } from './users.validate';

const usersRouter = express.Router();

// Get all users
usersRouter.get('/', withErrorHandling(async (_req: Request, res: Response) => {
  const users = await getUsers();
  res.status(200).json(users);
}));

// Create User
usersRouter.post('/', [parseBodyToLowerCase, userAuthMiddleware], withErrorHandling(async (req: Request, res: Response) => {
  const newUser = req.body as AuthUser;
  const { email, username } = newUser;

  const exists = await userExists(username, email);

  if (exists) {
    // 409 Conflict
    logger.warn(`User already exists: ${JSON.stringify(newUser)}`);
    res.status(409).json({ messages: [`User already exists`] });
  } else {
    // Encrypt password
    const hashedPassword = await bcrypt.hash(newUser.password, 10);
    const response = await createUser(newUser, hashedPassword);
    
    logger.info(`New user created: ${JSON.stringify(response)}`);
    res.status(201).json(response);
  }
}));

usersRouter.post('/login', [parseBodyToLowerCase, loginMiddleware], withErrorHandling(async (req: Request, res: Response) => {
  const { username, password } = req.body;

  const selectedUser = await getUser({ username });

  if (selectedUser) {
    const correctPassword  = await bcrypt.compare(password, selectedUser.password)
    
    if (correctPassword) {
      const token = jwt.sign(
        { id: selectedUser.id },
        process.env.JWT_SECRET as string,
        { expiresIn: process.env.JWT_EXPIRE_TIME as string }
      );

      res.status(200).json({ token });
    } else {
      // 401 Unauthorized
      logger.warn(`Invalid password for user: ${username}`);
      res.status(401).json({ messages: [`Invalid password`] });
    }
  } else {
    logger.warn(`User not found: ${username}`);
    res.status(401).json({ messages: [`User not found`] });
  }
}, 'Error logging in user'));

export default usersRouter;

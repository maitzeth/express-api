import express, { Request, Response } from "express";
// import products from "@/data.json";
import { v4 as uuidv4 } from 'uuid';
import { AuthUser } from '@/types';
// import { validateProductMiddleware } from './products.validate';
import { logger } from '@/utils/logger';
import { userAuthMiddleware } from './users.validate';
import { users } from '@/database';
import bcrypt from 'bcrypt';


const usersRouter = express.Router();

// Get all users
usersRouter.get('/', (req: Request, res: Response) => {
  res.json(users);
});

usersRouter.post('/', userAuthMiddleware, (req: Request, res: Response) => {
  const newUser = req.body as AuthUser;

  const userExists = users.some((user) => user.username === newUser.username || user.email === newUser.email);

  if (userExists) {
    // 409 Conflict
    logger.warn(`User already exists: ${JSON.stringify(newUser)}`);
    return res.status(409).json({ messages: [`User already exists`] });
  }

  // Encrypt password
  bcrypt.hash(newUser.password, 10, (err, hashedPw) => {
    if (err) {
      // Internal Server Error
      logger.error(`Error hashing password: ${err}`);
      return res.status(500).json({ messages: [`Error creating user`] });
    }

    const user = { ...newUser, password: hashedPw };
    users.push({
      ...user,
      id: uuidv4(),
    });

    logger.info(`New user created: ${JSON.stringify(user)}`);
    res.status(201).json(users);
  });
});

export default usersRouter;

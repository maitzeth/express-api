import express, { Request, Response } from "express";
import { v4 as uuidv4 } from 'uuid';
import { AuthUser } from '@/types';
import { logger } from '@/utils/logger';
import { userAuthMiddleware } from './users.validate';
import { users } from '@/database';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

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

usersRouter.post('/login', (req: Request, res: Response) => {
  const { username, password } = req.body;

  const user = users.find((user) => user.username === username);

  if (!user) {
    // 401 Unauthorized
    logger.warn(`User not found: ${username}`);
    return res.status(401).json({ messages: [`User not found`] });
  }

  const hashedPassword = user.password;
  bcrypt.compare(password, hashedPassword, (err, result) => {
    if (err) {
      // 500 Internal Server Error
      logger.error(`Error comparing passwords: ${err}`);
      return res.status(500).json({ messages: [`Error comparing passwords`] });
    }

    if (result) {
      // 200 OK
      const token = jwt.sign({ username: user.id }, process.env.JWT_SECRET as string, { expiresIn: '1h' });
      logger.info(`User logged in: ${username}`);
      return res.status(200).json({ token });
    } else {
      // 401 Unauthorized
      logger.warn(`Invalid password for user: ${username}`);
      return res.status(401).json({ messages: [`Invalid password`] });
    }
  });
});

export default usersRouter;

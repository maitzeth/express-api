import express, { Request, Response } from "express";
import { v4 as uuidv4 } from 'uuid';
import { AuthUser, User } from '@/types';
import { logger } from '@/utils/logger';
import { userAuthMiddleware, parseBodyToLowerCase, loginMiddleware } from './users.validate';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { getUsers, userExists, createUser, getUser } from './users.controller';
import { withErrorHandling } from '@/utils';

const usersRouter = express.Router();

// Get all users
usersRouter.get('/', withErrorHandling(async (req: Request, res: Response) => {
  const users = getUsers();
  console.log(users);
  res.status(200).json([]);
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
    bcrypt.hash(newUser.password, 10, async (err, hashedPw) => {
      if (err) {
        // Internal Server Error
        logger.error(`Error hashing password: ${err}`);
        return res.status(500).json({ messages: [`Error creating user`] });
      }
  
      const response = await createUser(newUser, hashedPw);
  
      logger.info(`New user created: ${JSON.stringify(response)}`);
      res.status(201).json(response);
    });
  }
}, 'Error creating user'));

usersRouter.post('/login', [parseBodyToLowerCase, loginMiddleware], withErrorHandling(async (req: Request, res: Response) => {
  const { username, password } = req.body;

  const selectedUser = await getUser({ username });

  console.log(selectedUser);
  res.status(200).json([]);
  

  // const user = users.find((user) => user.username === username);

  // if (!user) {
  //   // 401 Unauthorized
  //   logger.warn(`User not found: ${username}`);
  //   return res.status(401).json({ messages: [`User not found`] });
  // }

  // const hashedPassword = user.password;
  // bcrypt.compare(password, hashedPassword, (err, result) => {
  //   if (err) {
  //     // 500 Internal Server Error
  //     logger.error(`Error comparing passwords: ${err}`);
  //     return res.status(500).json({ messages: [`Error comparing passwords`] });
  //   }

  //   if (result) {
  //     // 200 OK
  //     const token = jwt.sign(
  //       { id: user.id },
  //       process.env.JWT_SECRET as string,
  //       { expiresIn: process.env.JWT_EXPIRE_TIME as string }
  //     );

  //     logger.info(`User logged in: ${username}`);
  //     return res.status(200).json({ token });
  //   } else {
  //     // 401 Unauthorized
  //     logger.warn(`Invalid password for user: ${username}`);
  //     return res.status(401).json({ messages: [`Invalid password`] });
  //   }
  // });
}, 'Error logging in user'));

export default usersRouter;

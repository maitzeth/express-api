
import { ZodIssue } from 'zod';
import { ERROR_MESSAGES } from '@/utils/constants';
import { logger } from '@/utils/logger';
import { MongooseError } from 'mongoose';
import { Request, Response } from "express";

export const errorMessagesParser = (issues: ZodIssue[]) => {
  return issues.map((issue) => {
    return issue.message;
  });
};

export const withErrorHandling = (
  handler: (req: Request, res: Response) => Promise<void>,
  fatalErrorMessage: string = ERROR_MESSAGES.default,
  useDefaultError: boolean = true,
) => {
  return async (req: Request, res: Response) => {
    try {
      await handler(req, res);
    } catch (err) {
      const error = err as MongooseError;
      logger.error(`${fatalErrorMessage}: ${error.message}`);
      res.status(500).json({ messages: [useDefaultError ? fatalErrorMessage : error.message] });
    }
  };
};

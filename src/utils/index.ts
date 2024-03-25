
import { ZodIssue } from 'zod';

export const errorMessagesParser = (issues: ZodIssue[]) => {
  return issues.map((issue) => {
    return issue.message;
  });
};

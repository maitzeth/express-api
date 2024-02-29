
import { ZodIssue } from 'zod';
export const errorHandler = (issues: ZodIssue[]) => {
  return issues.map((issue) => {
    return issue.message;
  });
};

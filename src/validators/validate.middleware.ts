import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { BadRequestError } from '../utils/app-error';

export function validateBody(schema: ZodSchema) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (err: unknown) {
      if (err instanceof ZodError) {
        const issues = err.issues.map((i) => `${i.path.join('.')}: ${i.message}`);
        return next(new BadRequestError(`Validation failed: ${issues.join(', ')}`, issues));
      }
      next(err);
    }
  };
}

export function validateParams(schema: ZodSchema) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      req.params = schema.parse(req.params) as Record<string, string>;
      next();
    } catch (err: unknown) {
      if (err instanceof ZodError) {
        const issues = err.issues.map((i) => `${i.path.join('.')}: ${i.message}`);
        return next(new BadRequestError(`Invalid parameter: ${issues.join(', ')}`, issues));
      }
      next(err);
    }
  };
}
